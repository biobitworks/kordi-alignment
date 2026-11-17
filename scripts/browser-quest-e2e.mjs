import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const origin=process.env.E2E_URL||'http://127.0.0.1:4182/';
const temp=mkdtempSync(join(tmpdir(),'kordi-judge-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
 ['--headless=new','--no-first-run','--no-default-browser-check',
 '--disable-background-networking','--disable-gpu','--disable-extensions',
 '--force-prefers-reduced-motion','--remote-debugging-port=0','--user-data-dir='+temp,'about:blank'],
 {stdio:'ignore'});
const sleep=t=>new Promise(r=>setTimeout(r,t));
let ws,i=0,pending=new Map(),errors=[];
function check(ok,label){console.log(ok?'PASS':'FAIL',label);if(!ok)errors.push(label);}
function request(method,params={}){
 let id=++i;return new Promise((resolve,reject)=>{
  pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));
 });
}
async function evalJs(exp){let r=await request('Runtime.evaluate',{expression:exp,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value}
async function browserFn(fn){return evalJs('('+fn.toString()+')()')}
async function nav(path){await request('Page.navigate',{url:new URL(path,origin).toString()});for(let n=0;n<75;n++){try{if(await evalJs('document.readyState')==='complete'){await sleep(220);return;}}catch{}await sleep(100);}throw Error('navigation timeout '+path)}
try{
 let port;
 for(let n=0;n<120;n++){try{port=Number(readFileSync(join(temp,'DevToolsActivePort'),'utf8').split('\n')[0]);break}catch{}await sleep(100)}
 if(!port)throw Error('missing Chrome CDP port');
 let page;
 for(let n=0;n<40;n++){try{page=(await (await fetch('http://127.0.0.1:'+port+'/json/list')).json()).find(t=>t.type==='page');if(page)break}catch{}await sleep(100)}
 if(!page)throw Error('no Chrome CDP page');
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
 ws.onmessage=e=>{let r=JSON.parse(e.data);let p=pending.get(r.id);if(!p)return;pending.delete(r.id);if(r.error)p.reject(Error(JSON.stringify(r.error)));else p.resolve(r.result)};
 await request('Page.enable');await request('Runtime.enable');
 if(process.env.VERCEL_OIDC_TOKEN){
  await request('Network.enable');
  await request('Network.setExtraHTTPHeaders',{headers:{'x-vercel-trusted-oidc-idp-token':process.env.VERCEL_OIDC_TOKEN}});
  console.log('PREVIEW_AUTH','development token used (value not logged)');
 }
 try{await request('Browser.grantPermissions',{origin:new URL(origin).origin,permissions:['clipboardReadWrite','clipboardSanitizedWrite']});}
 catch(e){console.log('CLIPBOARD_PERMISSION_NOT_GRANTED',e.message);}
 await nav('/');
 let main=await browserFn(()=>({title:document.title,quest:!!document.querySelector('a[href="./quest"]'),
  prLinks:document.querySelectorAll('#release-evidence a[href*="/pull/"]').length,
  compass:!!document.querySelector('#assess')}));
 console.log('ROOT',JSON.stringify(main));
 check(main.quest&&main.prLinks===5&&main.compass,'homepage Quest CTA, PR #1/#7/#8/#9/#10, original Compass');
 await nav('/quest.html');
 let kit=await browserFn(()=>({
  prompts:['room-prompt','skill-text','tool-text','plugin-text','agent-text','install-text'].map(id=>document.getElementById(id)?.value.length||0),
  buttons:document.querySelectorAll('[data-copy]').length,
  cardDisabled:document.querySelector('#copy-card').disabled,
  compareDisabled:document.querySelector('#run-match').disabled,
  consent:!!document.querySelector('#consent-card')}));
 console.log('KIT',JSON.stringify(kit));
 check(kit.prompts.every(n=>n>100)&&kit.buttons>=6,'agent, skill, tool, plugin and room prompts populated');
 check(kit.cardDisabled&&kit.compareDisabled&&kit.consent,'copy/matching default-deny');
 let gameplay=await browserFn(async()=>{
  let $=id=>document.getElementById(id);
  $('player').value='Synthetic Researcher';
  $('begin').click();
  let answered=0;
  for(let k=0;k<12;k++){
   const options=$('options').querySelectorAll('.option');
   if(options.length!==4)break;
   options[0].click();answered++;
  }
  let finished=!$('result-view').hidden,denied=$('copy-card').disabled;
  $('consent-card').click();
  let allowed=!$('copy-card').disabled,receipt;
  if(allowed){
   let origCreate=URL.createObjectURL,origClick=HTMLAnchorElement.prototype.click;
   URL.createObjectURL=function(b){window.__receipt=b;return origCreate.call(this,b)};
   HTMLAnchorElement.prototype.click=function(){};
   $('download-receipt').click();
   await new Promise(r=>setTimeout(r,90));
   receipt=JSON.parse(await window.__receipt.text());
   URL.createObjectURL=origCreate;HTMLAnchorElement.prototype.click=origClick;
  }
  return {answered,finished,denied,allowed,card:$('result-code').value.includes('RAQ1.'),receipt};
 });
 console.log('GAME',JSON.stringify(gameplay));
 check(gameplay.answered===12&&gameplay.finished&&gameplay.card,'twelve scenarios produce RAQ1 result');
 check(gameplay.denied&&gameplay.allowed,'consent gates one-click card copying');
 check(gameplay.receipt?.sha256?.length===64&&!JSON.stringify(gameplay.receipt).includes('Synthetic Researcher'),'SHA256 local receipt without card contents');
 const match=await browserFn(()=>{
  let $=id=>document.getElementById(id);
  $('consent-compare').click();$('example-match').click();
  return {allowed:!$('run-match').disabled,pairs:document.querySelectorAll('.match-item').length};
 });
 console.log('MATCH',JSON.stringify(match));
 check(match.allowed&&match.pairs>0,'authorized synthetic pair scoring');
 // Verify each of four copy buttons exists and is enabled without account credentials
 const copies=await browserFn(async()=>{
  const outcomes=[];
  const old=Object.getOwnPropertyDescriptor(navigator,'clipboard');
  let captured=null;
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{captured=value}}});
  try{
   for(const id of ['skill-text','tool-text','plugin-text','agent-text']){
    captured=null;
    const button=document.querySelector('[data-copy="'+id+'"]');
    button.click();
    await new Promise(r=>setTimeout(r,100));
    outcomes.push(captured===document.getElementById(id).value);
   }
  }finally{
   if(old)Object.defineProperty(navigator,'clipboard',old);
   else delete navigator.clipboard;
  }
  return outcomes;
 });
 console.log('COPY_HANDLER_PAYLOAD_EQUALITY',JSON.stringify(copies));
 check(copies.length===4&&copies.every(Boolean),'four copy handlers send exact prompt source bytes');
 const ss=await request('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 if(process.env.SCREENSHOT_OUTPUT){writeFileSync(process.env.SCREENSHOT_OUTPUT,Buffer.from(ss.data,'base64'));console.log('SCREENSHOT',process.env.SCREENSHOT_OUTPUT);}
}catch(err){errors.push(String(err));console.error('ERROR',err.stack||err)}
finally{try{ws?.close()}catch{}chrome.kill('SIGTERM');try{rmSync(temp,{recursive:true,force:true})}catch{}}
console.log('BROWSER_E2E',errors.length?'FAIL':'PASS','failures',errors.length);
process.exitCode=errors.length?1:0;
