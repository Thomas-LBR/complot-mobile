const {test}=require('node:test'); const assert=require('node:assert/strict');
const {collectEvents,emptyCursor}=require('./timelinePolicy.ts');
const event=id=>({id,kind:'coins',at:0,players:[],currentPlayerIndex:0});
test('mount skips history, repeated snapshots do not replay, new events remain ordered',()=>{
 const initial=collectEvents(emptyCursor(),'ABC:1',[event(1),event(2)],true,true); assert.equal(initial.reset,true);
 const repeat=collectEvents(initial.cursor,'ABC:1',[event(1),event(2)],true,true);assert.deepEqual(repeat.fresh,[]);
 const next=collectEvents(repeat.cursor,'ABC:1',[event(2),event(3),event(4)],true,true);assert.deepEqual(next.fresh.map(e=>e.id),[3,4]);
});
test('reconnect waits for a fresh server snapshot and never replays offline actions',()=>{
 const old=[event(1)];const baseline=collectEvents(emptyCursor(),'ABC:1',old,true,true);
 const lost=collectEvents(baseline.cursor,'ABC:1',old,false,true);
 const connected=collectEvents(lost.cursor,'ABC:1',old,true,true);assert.equal(connected.cursor.reconnecting,true);
 const sync=collectEvents(connected.cursor,'ABC:1',[event(1),event(2)],true,true);assert.equal(sync.reset,true);assert.equal(sync.cursor.reconnecting,false);assert.deepEqual(sync.fresh,[]);
 const action=collectEvents(sync.cursor,'ABC:1',[event(2),event(3)],true,true);assert.deepEqual(action.fresh.map(e=>e.id),[3]);
});
test('missing history, background activity, round changes and large backlogs reset presentation',()=>{
 const base=collectEvents(emptyCursor(),'ABC:1',[event(1)],true,true).cursor;
 assert.equal(collectEvents(base,'ABC:1',[event(5)],true,true).reset,true);
 assert.equal(collectEvents(base,'ABC:1',[event(2)],true,false).reset,true);
 assert.equal(collectEvents(base,'ABC:2',[event(2)],true,true).reset,true);
 assert.equal(collectEvents(base,'ABC:1',Array.from({length:13},(_,i)=>event(i+2)),true,true).reset,true);
});
