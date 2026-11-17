'use strict';
/** Opt-in chat room game tools. Does not modify room membership, history, or permissions. */
const Quest=require('../src/room-quest.cjs');
const ANSWER_SCHEMA={type:'object',additionalProperties:false,required:['name','answers'],properties:{
 name:{type:'string',minLength:1,maxLength:40},
 answers:{type:'array',minItems:12,maxItems:12,items:{type:'integer',minimum:0,maximum:3}}
}};
const MATCH_SCHEMA={type:'object',additionalProperties:false,required:['text'],properties:{text:{type:'string',minLength:1,maxLength:60000}}};
function score({name,answers}={}){
 if(typeof name!=='string'||!name.trim()||name.length>40)throw new TypeError('Participant alias must be nonblank and <=40 chars');
 const p=Quest.profile(answers,name);
 return {status:'SELF_REPORTED',card:Quest.card(p),code:Quest.code(p),archetype:p.archetype,alignment:p.alignment,
  evidence:'12 participant-supplied choice indexes',sharing:'NOT_SHARED_UNTIL_PARTICIPANT_PASTES_CARD',
  warning:'Never use these labels for hiring, grading, exclusion, identity, or permission decisions.'};
}
function pair({text}={}){
 if(typeof text!=='string'||text.length<1||text.length>60000)throw new TypeError('text must have 1-60000 chars');
 const {profiles,invalid}=Quest.parseCards(text);
 return {n:profiles.length,profiles:profiles.map(({name,archetype,alignment})=>({name,archetype,alignment})),
 pairs:Quest.matches(profiles),invalid:invalid.length,
 status:profiles.length<2?'NEED_TWO_VOLUNTARY_CARDS':'SELF_REPORTED_SUGGESTIONS',
 warning:'Opt-in collaboration prompts only. This is not a people ranking.'};
}
module.exports=function register(kordi){
 for(const [name,description,parameters,execute] of [
  ['alignment_quest_score','Score 12 voluntarily supplied one-based chat responses converted into zero-based indices; outputs a shareable card.',ANSWER_SCHEMA,score],
  ['alignment_quest','Suggest complementary pairs from participant-pasted RAQ1 codes; do not infer or invent missing participants.',MATCH_SCHEMA,pair]
 ])kordi.registerTool({name,description,parameters,execute:async(_,args)=>{
  try{return {content:[{type:'text',text:JSON.stringify(execute(args))}]}}
  catch(err){return {is_error:true,content:[{type:'text',text:'Research Quest error: '+err.message}]}}
 }});
 kordi.registerCommand('quest',{description:'Show how to play a 12-round opt-in Research Alignment Quest.',handler:async()=>({message:
 'Play at https://kordi-alignment-compass.vercel.app/ or paste the room host prompt from the Kordi Kit tab. '+
 'Reply to 12 original scenario prompts with choices 1-4; an agent with alignment_quest_score installed can produce the card. '+
 'You decide whether to paste it into the Kordi room; use /quest help for this message.'})});
};
module.exports.score=score;module.exports.pair=pair;