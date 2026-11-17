import Quest from './room-quest.mjs';
import {SKILL,PLUGIN,AGENT,INSTALL} from './quest-kit.mjs';
const $=id=>document.getElementById(id);
const state={answers:[],name:'',step:0,card:''};
const pct=n=>(Math.round(n*100)+'%');
function setView(which){
 for(const [id,visible] of [['intro-view',which==='intro'],['question-view',which==='question'],['result-view',which==='result']])$(id).hidden=!visible;
}
function intro(){$('consent-card').checked=false;$('copy-card').disabled=true;$('download-receipt').disabled=true;state.answers=[];state.step=0;state.card='';$('step-count').textContent='READY';setView('intro')}
function question(){
 setView('question');const i=state.step,q=Quest.QUESTIONS[i];
 $('step-count').textContent=(i+1)+' / 12';$('question-meta').textContent='SCENARIO '+String(i+1).padStart(2,'0')+' · SELF-REPORT';$('progress-fill').style.width=pct(i/12);$('question-title').textContent=q[0];$('options').replaceChildren();
 q[1].forEach(([text],j)=>{const b=document.createElement('button');b.type='button';b.className='option';const n=document.createElement('strong');n.textContent=String(j+1);const value=document.createElement('span');value.textContent=text;b.append(n,value);b.onclick=()=>select(j);$('options').append(b)});
 $('back').disabled=i===0;
}
function select(choice){
 if(!Number.isInteger(choice)||choice<0||choice>3)return;
 state.answers[state.step]=choice;state.answers.length=state.step+1;
 if(state.step===11){finish();return}state.step++;question();
}
function finish(){
 $('consent-card').checked=false;$('copy-card').disabled=true;$('download-receipt').disabled=true;
 const p=Quest.profile(state.answers,state.name);state.card=Quest.card(p);$('step-count').textContent='12 / 12 COMPLETE';
 $('result-title').textContent=p.archetype;$('result-alignment').textContent=p.alignment+' · self-reported research style';$('result-code').value=state.card;
 setView('result');$('progress-fill').style.width='100%';
}
async function copyText(text,sourceId){
 try{await navigator.clipboard.writeText(text);toast('Copied. Paste only where you choose.')}
 catch{const el=$(sourceId);el.focus();el.select();let copied=false;try{copied=!!document.execCommand('copy')}catch{}toast(copied?'Copied via selected-text fallback.':'Text selected; press Ctrl+C or Command+C to copy.')}
}
function toast(t){const el=$('toast');el.textContent=t;el.hidden=false;setTimeout(()=>el.hidden=true,2400)}
function match(){
 const {profiles,invalid}=Quest.parseCards($('paste-cards').value);const out=$('match-output');out.replaceChildren();
 if(invalid.length){const p=document.createElement('p');p.textContent=invalid.length+' invalid/edited card code(s) ignored.';out.append(p)}
 if(profiles.length<2){const p=document.createElement('p');p.textContent=profiles.length+' valid card(s) received. Need two consenting people to compare.';out.append(p);return}
 const pairs=Quest.matches(profiles).slice(0,12);
 pairs.forEach(r=>{const div=document.createElement('article');div.className='match-item';const title=document.createElement('b');title.textContent=r.a+' × '+r.b;const score=document.createElement('div');score.className='match-score';score.textContent=r.score+'/100';const note=document.createElement('p');note.textContent='Complementary working style '+r.complement+'%; shared collaboration preferences '+r.ethosAgreement+'%. Discuss author credit, data sharing and communication expectations.';div.append(title,score,note);out.append(div)})
}
function gameHostPrompt(){
 const rules=[
 '@matchmaker: Host the voluntary Research Alignment Quest in this Kordi room. Do not infer personality, morality or hiring fitness.',
 'Ask each participant whether they consent. Invite a chosen alias. Ask exactly one question per turn, options 1–4, and accept only explicit answers.',
 'After 12 answers, call the installed alignment_quest_score with {name:alias, answers:[12 choice indices from 0–3]}. Convert each reply 1–4 to 0–3. NEVER invent a checksum or a result in prose.',
 'Return the card to the participant first. Ask separate consent before sharing with the room. If a private response is unavailable, offer the website instead.',
 'Only after two people have voluntarily shared their actual cards, call alignment_quest with {text:"<their pasted cards>"} and present suggested complementary conversations.',
 'If either tool is absent report NOT_INSTALLED. No permissions, memberships, invitations or private context may be changed.',
 'Canonical question order (do not reorder options):'
 ];
 for(const [i,q] of Quest.QUESTIONS.entries()){
  rules.push((i+1)+'. '+q[0]);q[1].forEach(([a],idx)=>rules.push('   '+(idx+1)+') '+a));
 }
 rules.push('Official web questionnaire: https://kordi-alignment-compass.vercel.app/quest');
 return rules.join('\n');
}
function fillKit(){
 $('room-prompt').value=gameHostPrompt();
 $('invite-prompt').value='Optional research-team game: https://kordi-alignment-compass.vercel.app/quest . Play the 12 scenarios or opt into the room game with @matchmaker. Sharing your result is your choice; not used for hiring or membership.';
 $('skill-text').value=SKILL;
 $('agent-text').value=AGENT;
 $('plugin-text').value=PLUGIN;
 $('install-text').value=INSTALL;
 $('tool-text').value=JSON.stringify({name:'alignment_quest_score',parameters:{name:'EXAMPLE_ALIAS',answers:[0,0,0,0,0,0,0,0,0,0,0,0]}},null,2)+'\nEXAMPLE ONLY: replace all 12 choice indices with actual collected answers.';
}
$('begin').onclick=()=>{state.name=$('player').value.trim()||'Anonymous researcher';state.step=0;state.answers=[];question()};
$('back').onclick=()=>{if(state.step>0){state.step--;state.answers.length=state.step;question()}};
$('reset').onclick=intro;
$('copy-card').onclick=()=>{if($('consent-card').checked&&state.card)copyText(state.card,'result-code');else toast('Consent required before copying.');};
$('consent-card').onchange=()=>{$('copy-card').disabled=!($('consent-card').checked&&state.card);$('download-receipt').disabled=!($('consent-card').checked&&state.card);};
$('download-receipt').onclick=async()=>{
 if(!$('consent-card').checked||!state.card){toast('Consent required.');return;}
 try{
  if(!crypto.subtle)throw Error('WebCrypto unavailable');
  const bytes=new TextEncoder().encode(state.card);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const sha256=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const r={schema:'raq-consent-receipt-v1',status:'OBSERVED',algorithm:'SHA-256',
    sha256,utf8_bytes:bytes.length,scope:'selected_chat_only',
    consent:true,at:new Date().toISOString(),
    note:'Card body excluded; this receipt is not an identity attestation or Merkle proof.'};
  const blob=new Blob([JSON.stringify(r,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='raq-receipt.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Consent receipt generated locally, no card text included.');
 }catch(e){toast('Receipt NOT_COMPUTED: '+e.message)}
};
$('consent-compare').onchange=()=>{
 const ok=$('consent-compare').checked;
 for(const id of ['run-match','example-match','copy-match'])$(id).disabled=!ok;
 $('match-output').replaceChildren();
};

$('run-match').onclick=()=>{if($('consent-compare').checked)match();else toast('Consent required for comparison.')};
$('example-match').onclick=()=>{if(!$('consent-compare').checked){toast('Consent required.');return;}
 const a=Quest.profile(Array(12).fill(0),'Example Steward');
 const b=Quest.profile(Array(12).fill(3),'Example Explorer');
 $('paste-cards').value=Quest.card(a)+'\n\n'+Quest.card(b);match();
};
$('copy-match').onclick=()=>{if(!$('consent-compare').checked){toast('Consent required.');return;}
 const {profiles}=Quest.parseCards($('paste-cards').value);
 const t=Quest.matches(profiles).slice(0,10).map(x=>x.a+' × '+x.b+': '+x.score+'/100 (advisory; not a selection criterion)').join('\n');
 copyText(t||'Need at least two voluntary cards.','paste-cards')
};
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{
 const id=b.dataset.copy;copyText($(id).value,id)
});
document.addEventListener('keydown',e=>{
 if($('question-view').hidden||e.repeat||e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
 const n=Number(e.key);if(n>=1&&n<=4)select(n-1)
});
fillKit();intro();
