'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('browser module exactly derives from the canonical core',()=>{
 cp.execFileSync(process.execPath,[path.join(root,'scripts/build-web.cjs')]);
 const raw=fs.readFileSync(path.join(root,'src/core.cjs'),'utf8');
 const expected="// GENERATED FROM src/core.cjs; DO NOT EDIT.\n"+raw.replace('module.exports = { assess, axisName, VERSION, LIMIT };','export { assess, axisName, VERSION, LIMIT };');
 assert.equal(fs.readFileSync(path.join(root,'web/core.mjs'),'utf8'),expected);
});
test('public demo requires evidence and never fetches external data',()=>{
 const body=fs.readFileSync(path.join(root,'web/app.js'),'utf8'),page=fs.readFileSync(path.join(root,'web/index.html'),'utf8');
 assert.match(body,/assess\(\{scope:'agent_decision'/);
 assert.doesNotMatch(body,/\bfetch\s*\(|new WebSocket|eval\s*\(/);
 assert.match(page,/UNKNOWN/);
 const policy=JSON.parse(fs.readFileSync(path.join(root,'web/vercel.json'),'utf8'));
 assert.ok(policy.headers[0].headers.find(h=>h.key==='Content-Security-Policy'&&h.value.includes("connect-src 'none'")));
});