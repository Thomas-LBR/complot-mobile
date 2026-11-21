import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BangVisualQueue } from './bang-visuals.ts';
const e=(id,at=1000)=>({id,at,kind:'attack',actorId:'a',targetId:'b',cardType:'bang',count:1});
test('snapshots deduplicate, queue in order and reconnect does not replay history',()=>{
 const q=new BangVisualQueue();q.ingest('g',[e(1)],false,1000);assert.equal(q.next(1000),undefined);
 q.ingest('g',[e(1),e(2),e(3)],false,1000);q.ingest('g',[e(1),e(2),e(3)],false,1000);assert.equal(q.next(1000)?.id,2);assert.equal(q.next(1000)?.id,3);assert.equal(q.next(1000),undefined);
 q.ingest('g',[e(4)],true,1000);assert.equal(q.next(1000),undefined);
});
test('new games reset ids, live start animates, stale bursts are discarded',()=>{
 const q=new BangVisualQueue();q.ingest('lobby',[],false,1000);q.ingest('new',[e(1),e(2)],false,1000);assert.equal(q.next(1000)?.id,1);
 q.ingest('new',[e(3)],false,20000);assert.equal(q.next(20000),undefined);
 q.ingest('another',[e(1)],false,20000);assert.equal(q.next(20000),undefined);
});
