'use strict';
/** Original 12-scenario Research Alignment Quest rules from the user's reviewed delivery package.
 * Reimplemented here as a small, zero-network adapter for the existing Kordi source repository.
 * RAQ1 encoding is compatible with the uploaded Quest package. This is a self-report game,
 * not a measure of personal worth or a hiring/access-control signal.
 */
const Q = [
["The core facility rolls out a new protocol conflicting with your assay. You…",[
["Switch and document the change for the lab","L","G"],["Run both side by side until data decides","N","N"],["Keep your proven method for your results","N","E"],["Build a hybrid and share it on the lab wiki","C","G"]]],
["Your dataset is ready, but the consortium embargo lasts three more months. You…",[
["Honor the embargo agreement","L","N"],["Request an early-release exception","L","E"],["Post a preprint regardless","C","E"],["Offer a competing group a joint paper","N","G"]]],
["You spot an error in a junior colleague's analysis before submission. You…",[
["Fix it together and move the deadline if needed","N","G"],["Quietly fix it to keep the deadline","C","N"],["Report it through the PI's review log","L","E"],["Mention it after submission","N","E"]]],
["How should a multi-lab paper settle authorship order?",[
["Use the agreed written contribution rubric","L","G"],["Let senior PIs decide","L","E"],["Rank by work done and settle later","C","N"],["Negotiate your position then share credit in talks","N","N"]]],
["You find an excellent but messy open-source tool. You…",[
["Use it and contribute fixes and docs","N","G"],["Fork, rewrite and keep it private temporarily","C","E"],["Only adopt after validation","L","N"],["Use immediately, cite later","C","N"]]],
["When planning a new research project, you start by…",[
["Setting detailed aims and milestones","L","N"],["Drafting a loose roadmap and check-ins","N","N"],["Running the most interesting experiment","C","N"],["Planning around student development","N","G"]]],
["A reviewer wants an experiment you think is unnecessary. You…",[
["Run it properly as part of peer review","L","G"],["Rebut with evidence","L","N"],["Run a quick version to meet the request","N","E"],["Withdraw and choose another journal","C","E"]]],
["The shared microscope is booked for weeks. You…",[
["Follow the schedule","L","N"],["Propose a fairer rotation","L","G"],["Work late when nobody is using it","C","N"],["Reserve recurring slots far ahead","L","E"]]],
["A collaborator wants to pivot after an unexpected discovery. You…",[
["Explore and invite them to lead","C","G"],["Request a week to assess evidence","N","N"],["Support it for their career","N","G"],["Agree if you lead the new direction","N","E"]]],
["Your paper is published. What happens to the data?",[
["Share with full metadata immediately","L","G"],["Share only under an authorship agreement","L","E"],["Share processed data; retain raw for the next paper","N","E"],["Post on your own site in the available format","C","G"]]],
["A lab meeting becomes a heated methods debate. You…",[
["Structure pros/cons with a deadline","L","N"],["Invite quiet colleagues to speak","N","G"],["Propose a third option to break deadlock","C","N"],["Argue strongly for your preferred approach","C","E"]]],
["A matching funding call closes in five days. You…",[
["Rally a team and share ownership","C","G"],["Apply only after feasibility check","N","N"],["Submit a solo recycled proposal","C","E"],["Pitch a cross-lab idea with postdoc co-leads","C","G"]]],
];
const LABELS={L:{G:['Lawful Good','Steward'],N:['Lawful Neutral','Methodologist'],E:['Lawful Evil','Strategist']},
 N:{G:['Neutral Good','Mentor'],N:['True Neutral','Integrator'],E:['Neutral Evil','Operator']},
 C:{G:['Chaotic Good','Pathfinder'],N:['Chaotic Neutral','Maverick'],E:['Chaotic Evil','Disruptor']}};
const order=['L','NO','C','G','NE','E'];
function cleanName(x){return typeof x==='string' ? (x.replace(/[^\p{L}\p{N} .,'()-]/gu,'').replace(/\s+/g,' ').trim().slice(0,40)||'Anonymous researcher'):'Anonymous researcher'}
function tally(answers){
 if(!Array.isArray(answers)||answers.length!==12||Array.from(answers).some((n,i)=>!Number.isInteger(n)||n<0||n>=Q[i][1].length))throw new TypeError('Exactly twelve choice indices 0-3 are required; no sparse choices');
 const b={L:0,NO:0,C:0,G:0,NE:0,E:0};
 for(let i=0;i<12;i++){const o=Q[i][1][answers[i]];b[o[1]==='N'?'NO':o[1]]++;b[o[2]==='N'?'NE':o[2]]++}
 return b;
}
function profile(answers,name){
 const b=tally(answers),winner=(x,m,y,lo,mid,hi)=>x>m&&x>y?lo:y>m&&y>x?hi:mid;
 const o=winner(b.L,b.NO,b.C,'L','N','C'),m=winner(b.G,b.NE,b.E,'G','N','E');
 return {name:cleanName(name),b,alignment:LABELS[o][m][0],archetype:LABELS[o][m][1],axes:{order:o,ethos:m}};
}
function checksum(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,'0')}
function code(p){const payload=btoa(unescape(encodeURIComponent(JSON.stringify({v:1,n:p.name,b:order.map(k=>p.b[k])})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return 'RAQ1.'+payload+'.'+checksum(payload)}
function decode(code){
 const match=/^RAQ1\.([A-Za-z0-9_-]{8,400})\.([0-9a-fA-F]{8})$/.exec(String(code).trim());
 if(!match||checksum(match[1])!==match[2].toLowerCase())throw new TypeError('Invalid or edited RAQ1 code');
 const payload=JSON.parse(decodeURIComponent(escape(atob(match[1].replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((match[1].length+3)%4)))));
 if(payload.v!==1||!Array.isArray(payload.b)||payload.b.length!==6||!payload.b.every(v=>Number.isInteger(v)&&v>=0&&v<=12)||payload.b.slice(0,3).reduce((a,b)=>a+b,0)!==12||payload.b.slice(3).reduce((a,b)=>a+b,0)!==12)throw new TypeError('Invalid profile buckets');
 const b=Object.fromEntries(order.map((k,i)=>[k,payload.b[i]]));
 const winner=(x,m,y,lo,mid,hi)=>x>m&&x>y?lo:y>m&&y>x?hi:mid;
 const o=winner(b.L,b.NO,b.C,'L','N','C'),m=winner(b.G,b.NE,b.E,'G','N','E');
 return {name:cleanName(payload.n),b,alignment:LABELS[o][m][0],archetype:LABELS[o][m][1],axes:{order:o,ethos:m}};
}
function card(p){return ['=== Research Alignment Quest ===','Researcher: '+p.name,'Self-reported style: '+p.archetype+' ('+p.alignment+')','Code: '+code(p),'Opt-in collaboration exercise only; not for hiring or exclusion.'].join('\n')}
function parseCards(text){
 const codes=String(text||'').match(/RAQ1\.[A-Za-z0-9_-]+\.[0-9a-fA-F]{8}/g)||[],out=new Map(),invalid=[];
 for(const c of codes.slice(0,64))try{const p=decode(c);out.set(p.name.toLowerCase(),p)}catch(e){invalid.push(c.slice(0,24)+'…')}
 return {profiles:[...out.values()],invalid};
}
function match(a,b){
 const dist=(keys)=>keys.reduce((sum,k)=>sum+Math.abs(a.b[k]-b.b[k]),0)/24;
 const complement=Math.min(1,2*dist(['L','NO','C']));
 const similar=Math.max(0,1-dist(['G','NE','E'])-0.5*Math.min(a.b.E,b.b.E)/12);
 return {a:a.name,b:b.name,score:Math.round(100*(complement+similar)/2),complement:Math.round(complement*100),ethosAgreement:Math.round(similar*100)};
}
function matches(list){const all=[];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)all.push(match(list[i],list[j]));return all.sort((x,y)=>y.score-x.score||x.a.localeCompare(y.a))}
module.exports={QUESTIONS:Q,profile,code,decode,card,parseCards,matches,checksum};
