const {test}=require('node:test');const assert=require('node:assert/strict');const {describeEvent,describePending,ACTION_TITLES}=require('./actionPresentation.ts');
const room={players:[{id:'a',username:'Alice'},{id:'b',username:'Bob'},{id:'c',username:'Chloé'}],pendingAction:null};
test('a challenge names the accuser and accused and distinguishes both outcomes',()=>{
 assert.equal(describeEvent({kind:'challenge',actorId:'b',targetId:'a'},room),'Bob accuse Alice de bluffer');
 assert.match(describeEvent({kind:'verdict',actorId:'b',targetId:'a',outcome:'success'},room),/Alice bluffait : Bob avait raison/);
 assert.match(describeEvent({kind:'verdict',actorId:'b',targetId:'a',outcome:'failed'},room),/Alice a prouvé son rôle : Bob perd/);
});
test('target and guessed role are explicit, only eligible unanswered players are prompted',()=>{
 const pending={type:'assassinate',actorId:'a',targetId:'b',targetRole:'Capitaine',stage:'challengeAction',eligibleIds:['b','c'],respondedIds:['c']};const r={...room,pendingAction:pending};
 assert.match(describePending(r,'b').title,/Alice → Bob.*Capitaine visé/);
 assert.match(describePending(r,'b').instruction,/À VOUS/);
 assert.doesNotMatch(describePending(r,'c').instruction,/À VOUS/);
});
test('block identifies its author separately from attacker and victim',()=>{
 const r={...room,pendingAction:{type:'steal',actorId:'a',targetId:'b',stage:'challengeBlock',blockedBy:'b',blockRole:'Capitaine',eligibleIds:['a','c'],respondedIds:[]}};
 assert.equal(describePending(r,'a').title,'Bob bloque Alice avec Capitaine');
 assert.match(describePending(r,'a').instruction,/contestez ce blocage/);
});
test('all actions have a label and hidden exchange contents are never described',()=>{
 for(const action of ['income','foreign_aid','duchess','steal','assassinate','coup','exchange','inspect'])assert.ok(ACTION_TITLES[action]);
 assert.equal(describeEvent({kind:'cards',actorId:'a',outcome:'draw'},room),'Alice reçoit des cartes en secret');
 assert.match(describeEvent({kind:'attack',actorId:'a',targetId:'b',outcome:'miss'},room),/Alice rate Bob.*pièces perdues/);
});
