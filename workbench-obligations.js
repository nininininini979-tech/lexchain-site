(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.LexChainObligations=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const FORMAT='lexchain-obligation-ledger-v1',RESULT='lexchain-obligation-projection-v1';
const MAX_AMOUNT=100000000000, own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const clone=o=>JSON.parse(JSON.stringify(o));
function need(ok,message){if(!ok)throw Object.assign(new Error(message),{code:'INVALID_OBLIGATION_LEDGER'});}
function text(s,max=2000){return typeof s==='string'&&s.trim().length>0&&s.length<=max;}
function id(s){return typeof s==='string'&&/^[\p{L}\p{N}_-]{1,80}$/u.test(s)&&!['__proto__','prototype','constructor'].includes(s);}
function date(s){return typeof s==='string'&&/^(?:[1-9]\d{3})-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function keys(o,allowed){need(plain(o)&&Object.keys(o).every(k=>allowed.includes(k)),'对象格式或字段无效');}
const TYPES=['PAYMENT','NONPERFORMANCE','LEDGER_COMPLETE','TERMINATE'];
const fields={PAYMENT:['amountCents'],NONPERFORMANCE:['unpaidCents'],LEDGER_COMPLETE:['completeThrough'],TERMINATE:[]};
function primitive(e,o,recordedAt,replacement=false){
  need(TYPES.includes(e.type),'不支持的发生事件类型');
  if(replacement)keys(e,['type','occurredAt',...fields[e.type]]);
  need(date(e.occurredAt)&&e.occurredAt>=o.createdAt&&e.occurredAt<=recordedAt,'事件发生日必须在义务产生后且不晚于记录日');
  if(e.type==='PAYMENT')need(Number.isSafeInteger(e.amountCents)&&e.amountCents>0&&e.amountCents<=MAX_AMOUNT,'付款金额必须是有界正整数分');
  if(e.type==='NONPERFORMANCE')need(Number.isSafeInteger(e.unpaidCents)&&e.unpaidCents>0&&e.unpaidCents<=o.amountCents,'未履行快照须为本义务范围内的正整数分');
  if(e.type==='LEDGER_COMPLETE')need(date(e.completeThrough)&&e.completeThrough>=o.createdAt&&e.completeThrough<=e.occurredAt,'完整账簿覆盖截止日无效');
}
function prepare(input){
  keys(input,['format','asOf','knownAt','sources','obligations','events']);
  need(input.format===FORMAT,'义务记录格式无效');
  need(date(input.asOf),'asOf须为有效日期');
  const knownAt=input.knownAt===undefined?input.asOf:input.knownAt;
  need(date(knownAt)&&knownAt>=input.asOf,'knownAt须为不早于asOf的有效日期');
  need(Array.isArray(input.sources)&&input.sources.length<=500,'sources须为至多500项的数组');
  const sources=new Map();
  for(const s of input.sources){keys(s,['id','type','text']);need(id(s.id)&&!sources.has(s.id)&&['SYNTHETIC','DOCUMENT','SELF_REPORT','REVIEW'].includes(s.type)&&text(s.text,1000000),'来源编号、类型或原文无效');sources.set(s.id,s);}
  need(Array.isArray(input.obligations)&&input.obligations.length>0&&input.obligations.length<=100,'obligations须为1至100项的数组');
  const obligations=new Map();
  for(const o of input.obligations){
    keys(o,['id','subject','period','bearer','actionKey','createdAt','dueDate','amountCents','sourceId','remedyFor']);
    need(id(o.id)&&!obligations.has(o.id)&&text(o.subject,120)&&text(o.period,120)&&text(o.bearer,120)&&id(o.actionKey),'义务身份、主体、期间或行为无效');
    need(date(o.createdAt)&&date(o.dueDate)&&o.createdAt<=o.dueDate,'义务产生日或期限无效');
    need(Number.isSafeInteger(o.amountCents)&&o.amountCents>0&&o.amountCents<=MAX_AMOUNT,'义务金额须为有界正整数分');
    need(sources.has(o.sourceId),'义务引用不存在的来源');
    if(own(o,'remedyFor'))need(id(o.remedyFor)&&o.remedyFor!==o.id,'补救义务关联无效');
    obligations.set(o.id,o);
  }
  for(const o of obligations.values()){
    const seen=new Set([o.id]);let x=o;
    while(x.remedyFor){const p=obligations.get(x.remedyFor);need(p&&p.subject===o.subject&&p.period===o.period&&p.bearer===o.bearer,'补救关联必须指向同主体、期间和承担者的义务');need(!seen.has(p.id),'补救关联存在环');seen.add(p.id);x=p;}
  }
  need(Array.isArray(input.events)&&input.events.length<=2000,'events须为至多2000项的数组');
  const events=new Map(),amended=new Set();let lastRecorded='';
  for(const e of input.events){
    need(plain(e),'事件必须是对象');const correction=['CORRECT','RETRACT'].includes(e.type);
    keys(e,['id','obligationId','subject','period','type','recordedAt','sourceId','reason',...(correction?['targetId',...(e.type==='CORRECT'?['replacement']:[])]:['occurredAt',...(fields[e.type]||[])])]);
    const o=obligations.get(e.obligationId);
    need(id(e.id)&&!events.has(e.id)&&o&&e.subject===o.subject&&e.period===o.period,'事件必须引用唯一编号及同主体、同期间义务');
    need(date(e.recordedAt)&&e.recordedAt>=lastRecorded,'事件记录日无效或未按记录顺序追加');lastRecorded=e.recordedAt;
    need(sources.has(e.sourceId)&&text(e.reason),'事件须引用来源并说明记录或审核理由');
    if(correction){
      const target=events.get(e.targetId);
      need(target&&target.obligationId===e.obligationId&&!amended.has(target.id)&&target.type!=='RETRACT','更正或证据撤回必须引用同一义务的当前未替代记录');
      if(e.type==='CORRECT'){
        primitive(e.replacement,o,e.recordedAt,true);
        const original=target.type==='CORRECT'?target.replacement:target;
        need(original.type===e.replacement.type,'更正不能改变事件种类；不同现实事件须另行记录');
      }
      amended.add(target.id);
    }else primitive(e,o,e.recordedAt);
    events.set(e.id,e);
  }
  return {knownAt,sources,obligations,events};
}
function project(input){
  const prepared=prepare(input),asOf=input.asOf,knownAt=prepared.knownAt;
  const visible=input.events.filter(e=>e.recordedAt<=knownAt),replaced=new Set(visible.filter(e=>['CORRECT','RETRACT'].includes(e.type)).map(e=>e.targetId));
  const active=visible.filter(e=>!replaced.has(e.id)&&e.type!=='RETRACT').map(e=>e.type==='CORRECT'?{...e,...e.replacement,correctionId:e.id}:e).filter(e=>e.occurredAt<=asOf);
  const obligations=input.obligations.map(o=>{
    const all=visible.filter(e=>e.obligationId===o.id),rows=active.filter(e=>e.obligationId===o.id),payments=rows.filter(e=>e.type==='PAYMENT').sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt)||a.id.localeCompare(b.id));
    const snapshots=rows.filter(e=>e.type==='NONPERFORMANCE').sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt)||a.id.localeCompare(b.id));
    const ledgers=rows.filter(e=>e.type==='LEDGER_COMPLETE'),terminations=rows.filter(e=>e.type==='TERMINATE').sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt));
    const terminatedAt=terminations[0]?.occurredAt||null;
    const cumulative=[];let totalPaid=0;
    for(const p of payments){totalPaid+=p.amountCents;need(Number.isSafeInteger(totalPaid),'付款累计超出安全范围');cumulative.push(totalPaid);}
    const paidThrough=d=>{let lo=0,hi=payments.length;while(lo<hi){const mid=(lo+hi)>>1;if(payments[mid].occurredAt<=d)lo=mid+1;else hi=mid;}return lo?cumulative[lo-1]:0;};
    const paidCents=totalPaid,issues=[];
    for(const n of snapshots){
      if(paidThrough(n.occurredAt)>o.amountCents-n.unpaidCents)issues.push({type:'PAYMENT_SNAPSHOT_CONFLICT',eventIds:[n.id,...payments.filter(e=>e.occurredAt<=n.occurredAt).map(e=>e.id)]});
      const prior=snapshots.find(p=>p.occurredAt<n.occurredAt&&p.unpaidCents<n.unpaidCents);
      if(prior)issues.push({type:'UNPAID_AMOUNT_INCREASED',eventIds:[prior.id,n.id]});
      const priorPaid=snapshots.find(p=>p.occurredAt<n.occurredAt&&o.amountCents-p.unpaidCents+paidThrough(n.occurredAt)-paidThrough(p.occurredAt)>o.amountCents-n.unpaidCents);
      if(priorPaid)issues.push({type:'SNAPSHOT_PAYMENT_HISTORY_CONFLICT',eventIds:[priorPaid.id,n.id]});
      const same=snapshots.find(p=>p.id!==n.id&&p.occurredAt===n.occurredAt&&p.unpaidCents!==n.unpaidCents);
      if(same)issues.push({type:'SAME_DATE_SNAPSHOT_CONFLICT',eventIds:[same.id,n.id]});
      const complete=ledgers.find(l=>l.completeThrough>=n.occurredAt);
      if(complete&&Math.max(0,o.amountCents-paidThrough(n.occurredAt))!==n.unpaidCents)issues.push({type:'LEDGER_SNAPSHOT_CONFLICT',eventIds:[complete.id,n.id]});
    }
    const paidLowerBoundAt=d=>snapshots.filter(s=>s.occurredAt<=d).reduce((v,s)=>Math.max(v,o.amountCents-s.unpaidCents+paidThrough(d)-paidThrough(s.occurredAt)),paidThrough(d));
    const confirmedPaidLowerBoundCents=paidLowerBoundAt(asOf);
    const completedAt=[...new Set(payments.map(p=>p.occurredAt))].sort().find(d=>paidLowerBoundAt(d)>=o.amountCents)||null;
    let fulfillment='U',remainingCents=null,historicalViolation=null,basis=[];
    const latest=snapshots.at(-1)||null,completeCurrent=ledgers.find(l=>l.completeThrough>=asOf);
    if(confirmedPaidLowerBoundCents>=o.amountCents){fulfillment='T';remainingCents=0;}
    else if(latest?.occurredAt===asOf){fulfillment='F';remainingCents=latest.unpaidCents;}
    else if(completeCurrent){fulfillment='F';remainingCents=o.amountCents-paidCents;}
    if(asOf<=o.dueDate||(terminatedAt&&terminatedAt<=o.dueDate)){historicalViolation=false;}
    else if(completedAt&&completedAt<=o.dueDate){historicalViolation=false;basis=[...payments,...snapshots].filter(p=>p.occurredAt<=o.dueDate).map(p=>p.id);}
    else {
      const late=snapshots.filter(e=>e.occurredAt>o.dueDate&&(!terminatedAt||e.occurredAt<=terminatedAt));
      const dueLedger=ledgers.find(e=>e.completeThrough>=o.dueDate);
      if(late.length){historicalViolation=true;basis=late.map(e=>e.id);}
      else if(dueLedger){historicalViolation=paidThrough(o.dueDate)<o.amountCents;basis=[dueLedger.id,...payments.filter(p=>p.occurredAt<=o.dueDate).map(p=>p.id)];}
    }
    const temporalPhase=asOf<o.createdAt?'NOT_YET_EFFECTIVE':terminatedAt?'TERMINATED':asOf<o.dueDate?'BEFORE_DUE':asOf===o.dueDate?'DUE_TODAY':'AFTER_DUE';
    let status=temporalPhase==='NOT_YET_EFFECTIVE'?'NOT_YET_EFFECTIVE':terminatedAt?(historicalViolation===true?'TERMINATED_AFTER_VIOLATION':'TERMINATED'):fulfillment==='T'?(historicalViolation===true?'LATE_PERFORMANCE':historicalViolation===false?'FULFILLED_ON_TIME':'FULFILLED_HISTORY_UNKNOWN'):asOf===o.dueDate?'DUE_TODAY':asOf<o.dueDate?(confirmedPaidLowerBoundCents>0?'PARTIALLY_PERFORMED':'NOT_DUE'):historicalViolation===true?'VIOLATION':'OVERDUE_UNKNOWN';
    if(issues.length){status='CONFLICT';fulfillment='U';remainingCents=null;historicalViolation=null;basis=[];}
    return {id:o.id,subject:o.subject,period:o.period,bearer:o.bearer,actionKey:o.actionKey,createdAt:o.createdAt,dueDate:o.dueDate,amountCents:o.amountCents,status,temporalPhase,paidCents,confirmedPaidLowerBoundCents:issues.length?null:confirmedPaidLowerBoundCents,knownUnpaidCents:issues.length?null:latest?.unpaidCents??null,knownUnpaidAt:issues.length?null:latest?.occurredAt??null,remainingCents,fulfillment,historicalViolation,historicalViolationBasis:basis,completedAt:issues.length?null:completedAt,terminatedAt,remedyFor:o.remedyFor||null,issues,events:all.map(e=>({...clone(e),projectionState:replaced.has(e.id)?'SUPERSEDED':e.type==='RETRACT'?'EVIDENCE_RETRACTION':(e.replacement?.occurredAt||e.occurredAt)>asOf?'FUTURE_EVENT':'ACTIVE'}))};
  });
  const byId=new Map(obligations.map(o=>[o.id,o]));
  for(const o of obligations)o.primaryHistoricalViolation=o.remedyFor?byId.get(o.remedyFor).historicalViolation:null;
  return {format:RESULT,asOf,knownAt,obligations,summary:obligations.reduce((x,o)=>(x[o.status]=(x[o.status]||0)+1,x),{}),limitations:[
    '仅为有限、单次、固定金额的期限义务投影，不是完整时态逻辑或法律裁判。',
    '日期按自然日处理；截止日当天不判逾期；付款与终止均按所声明的本义务范围记录。',
    '没有付款记录不证明未付款；完整账簿声明及未履行证据均为输入声明，不自动核实真实性。',
    '终止是现实后续事件，不删除此前违反；CORRECT与RETRACT更正或撤回证据，可改变当前知识，原记录保留。',
    '补救为独立义务实例，关联不自动生成补救责任；履行补救不清除原义务的历史违反。',
    '不存在利息、加速到期、返还、时效、重复支付识别或日期内的先后推理；需在独立来源与法律审核后使用。'
  ]};
}
function examples(){
  const source={id:'synthetic',type:'SYNTHETIC',text:'以下均为合成研究情景，不是真实工资材料或法律规则。'};
  const obligation={id:'pay',subject:'合成劳动者甲',period:'2026-10',bearer:'合成单位乙',actionKey:'pay_wage',createdAt:'2026-11-01',dueDate:'2026-11-05',amountCents:100000,sourceId:'synthetic'};
  const base={format:FORMAT,asOf:'2026-11-08',knownAt:'2026-11-08',sources:[source],obligations:[obligation],events:[]};
  const e=(id,type,occurredAt,extra={})=>({id,type,occurredAt,recordedAt:occurredAt,obligationId:'pay',subject:obligation.subject,period:obligation.period,sourceId:'synthetic',reason:'合成研究输入',...extra});
  const unknown=clone(base),late=clone(base),terminated=clone(base),correction=clone(base),remedy=clone(base);
  late.events=[e('not-paid','NONPERFORMANCE','2026-11-06',{unpaidCents:100000}),e('late-pay','PAYMENT','2026-11-07',{amountCents:100000})];
  terminated.events=[e('not-paid','NONPERFORMANCE','2026-11-06',{unpaidCents:100000}),e('terminate','TERMINATE','2026-11-07')];
  correction.events=[e('not-paid','NONPERFORMANCE','2026-11-06',{unpaidCents:100000}),{id:'withdraw-evidence',type:'RETRACT',targetId:'not-paid',obligationId:'pay',subject:obligation.subject,period:obligation.period,recordedAt:'2026-11-08',sourceId:'synthetic',reason:'合成：原证据对应了错误账目，撤回后恢复未知'}];
  remedy.obligations.push({...obligation,id:'repair',actionKey:'compensate',createdAt:'2026-11-06',dueDate:'2026-11-10',amountCents:10000,remedyFor:'pay'});
  remedy.events=[e('not-paid','NONPERFORMANCE','2026-11-06',{unpaidCents:100000}),e('remedy-paid','PAYMENT','2026-11-07',{obligationId:'repair',amountCents:10000})];
  return [{id:'UNKNOWN',title:'合成示例 缺付款记录仍未知',input:unknown},{id:'LATE',title:'合成示例 后来付款保留历史逾期',input:late},{id:'TERMINATED',title:'合成示例 终止不抹历史违反',input:terminated},{id:'RETRACT',title:'合成示例 撤回错误证据恢复未知',input:correction},{id:'REMEDY',title:'合成示例 补救履行与原违反分开',input:remedy}];
}
return {project,examples,validate:prepare,date,FORMAT,RESULT};
});
