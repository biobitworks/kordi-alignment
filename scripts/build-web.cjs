'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/core.cjs'),'utf8');
const marker='module.exports = { assess, axisName, VERSION, LIMIT };';
if(!source.includes(marker)) throw new Error('Core contract changed; refuse stale browser demo');
const output='// GENERATED FROM src/core.cjs; DO NOT EDIT.\n'+source.replace(marker,'export { assess, axisName, VERSION, LIMIT };');
fs.writeFileSync(path.join(root,'web/core.mjs'),output);
console.log('Browser core SHA256',crypto.createHash('sha256').update(output).digest('hex'));