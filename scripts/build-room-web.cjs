'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const client='// GENERATED FROM src/room-quest.cjs. DO NOT EDIT.\nconst module={exports:{}};\n'+read('src/room-quest.cjs')+'\nexport default module.exports;\n';
const kit='// GENERATED, public-source only. No private actor or AOK context.\n'+
  'export const SKILL='+JSON.stringify(read('skills/room-quest/SKILL.md'))+';\n'+
  'export const PLUGIN='+JSON.stringify(read('extensions/room-quest.cjs'))+';\n'+
  'export const AGENT='+JSON.stringify(read('prompts/room-quest-agent.md'))+';\n'+
  'export const INSTALL='+JSON.stringify('Run only in an authorized local Kordi workspace:\nkordi install --local /path/to/kordi-alignment\nkordi -e /path/to/kordi-alignment/extensions/room-quest.cjs\nPasting this into chat does NOT install tools or permissions.')+';\n';
for(const [name,contents] of [['web/room-quest.mjs',client],['web/quest-kit.mjs',kit]]){
 const f=path.join(root,name);fs.writeFileSync(f,contents);
 console.log('GENERATED',name,crypto.createHash('sha256').update(contents).digest('hex'));
}
