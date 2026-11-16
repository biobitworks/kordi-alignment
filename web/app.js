import {assess} from './core.mjs';
const el=id=>document.getElementById(id);
const labels=[
 ['Lawful Good',1,1,'Order, cooperation'],
 ['Neutral Good',0,1,'Cooperation without rigid rules'],
 ['Chaotic Good',-1,1,'Adaptive cooperation'],
 ['Lawful Neutral',1,0,'Predictable procedure'],
 ['True Neutral',0,0,'Both axes neutral'],
 ['Chaotic Neutral',-1,0,'Flexible procedure'],
 ['Lawful Evil',1,-1,'Order with harmful ends'],
 ['Neutral Evil',0,-1,'Harm independent of rules'],
 ['Chaotic Evil',-1,-1,'Discretion with harmful ends']
];
for(const [name,l,g,description] of labels){
  const cell=document.createElement('article');cell.className='matrix-cell';cell.dataset.name=name;
  const title=document.createElement('strong');title.textContent=name;
  const scores=document.createElement('small');scores.textContent='lawChaos '+l+' · goodEvil '+g;
  const desc=document.createElement('p');desc.textContent=description;cell.append(title,scores,desc);el('grid').append(cell);
}
function format(x){return (Number(x)>=0?'+':'')+Number(x).toFixed(1)}
function update(){el('law-out').textContent=format(el('law').value);el('good-out').textContent=format(el('good').value)}
function compute(){
 try{
  el('error').textContent='';
  const observed=el('evidence').value.trim();
  const result=assess({scope:'agent_decision',items:[{id:el('decision-id').value.trim(),lawChaos:Number(el('law').value),goodEvil:Number(el('good').value),evidence:observed?[observed]:[]}]});
  const item=result.results[0];
  el('status').textContent=item.status;el('result').textContent=item.alignment||'UNKNOWN';el('note').textContent=item.note;
  el('result-law').textContent=format(item.axes.lawChaos);el('result-good').textContent=format(item.axes.goodEvil);
  el('result-evidence').textContent=observed||'No evidence supplied.';el('json').textContent=JSON.stringify(result,null,2);
  document.querySelectorAll('.matrix-cell').forEach(c=>c.classList.toggle('selected',c.dataset.name===item.alignment));
 }catch(e){el('error').textContent=String(e.message||e)}
}
el('law').addEventListener('input',update);el('good').addEventListener('input',update);el('assess').addEventListener('click',compute);
el('unknown').addEventListener('click',()=>{el('evidence').value='';compute()});
el('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(el('json').textContent);el('copy').textContent='Copied'}catch{el('error').textContent='Clipboard unavailable. Select JSON to copy.'}});
update();compute();