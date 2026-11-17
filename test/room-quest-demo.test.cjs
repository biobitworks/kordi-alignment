'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const Q=require('../src/room-quest.cjs');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('room quest: twelve synthetic scenarios each with exactly four choices',()=>{
  assert.equal(Q.QUESTIONS.length,12);
  for(const [question,options] of Q.QUESTIONS){
    assert.equal(typeof question,'string');
    assert.equal(options.length,4);
    options.forEach(o=>assert.equal(o.length,3));
  }
});
test('roundtrip deterministic cards, distinct aliases and tamper rejection',()=>{
  for(let k=0;k<4;k++){
    const a=Array(12).fill(k),p=Q.profile(a,'Synthetic '+k),c=Q.code(p);
    assert.equal(Q.decode(c).alignment,p.alignment);
    const m=c.match(/^RAQ1\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/);
    assert.ok(m);
    assert.throws(()=>Q.decode(c.slice(0,-1)+(c.endsWith('0')?'1':'0')));
    assert.equal(Q.parseCards(Q.card(p)).profiles.length,1);
  }
});
test('consent-gated demo and source-linked copy kit do not call network APIs',()=>{
  const html=read('web/quest.html'),script=read('web/quest.js');
  for(const id of ['consent-card','consent-compare','copy-card','run-match',
    'download-receipt','skill-text','tool-text','plugin-text','agent-text']){
    assert.ok(html.includes('id="'+id+'"'),id);
  }
  assert.ok(script.includes("crypto.subtle.digest('SHA-256'"));
  assert.ok(script.includes("'consent-card'"));
  assert.ok(script.includes("'consent-compare'"));
  assert.doesNotMatch(script,/\bfetch\s*\(|new WebSocket|XMLHttpRequest/);
  assert.doesNotMatch(html,/https:\/\/fonts\.googleapis\.com/);
});
test('generated browser kit matches source without stale exports',()=>{
  const before=['web/room-quest.mjs','web/quest-kit.mjs'].map(read);
  execFileSync(process.execPath,[path.join(root,'scripts/build-room-web.cjs')]);
  const after=['web/room-quest.mjs','web/quest-kit.mjs'].map(read);
  assert.deepEqual(after,before);
});
test('pair score remains bounded and uses synthetic volunteered cards',()=>{
  const a=Q.profile(Array(12).fill(0),'Example A');
  const b=Q.profile(Array(12).fill(3),'Example B');
  const matches=Q.matches(Q.parseCards(Q.card(a)+'\n'+Q.card(b)).profiles);
  assert.equal(matches.length,1);
  assert.ok(matches[0].score>=0&&matches[0].score<=100);
});
