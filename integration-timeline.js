(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LexChainTimeline=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function need(x,m){if(!x)throw Object.assign(new Error(m),{code:'INVALID_REQUEST'});}
function date(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function validate(events){
 need(Array.isArray(events)&&events.length<=2000,'事件必须为至多2000项的数组');const ids=new Map();
 for(const e of events){need(e&&typeof e==='object'&&!Array.isArray(e),'事件格式无效');need(typeof e.id==='string'&&/^[\w-]{1,80}$/.test(e.id)&&!ids.has(e.id),'事件 id 重复或无效');need(['WAGE_DUE','PAYMENT','UNPAID_OBSERVATION','DEMAND','RETRACT'].includes(e.type),'事件类型无效');need(date(e.date),'事件日期必须为有效 YYYY-MM-DD');need(typeof e.subject==='string'&&e.subject.trim()&&typeof e.period==='string'&&e.period.trim(),'事件必须提供主体和工资期间');need(typeof e.sourceId==='string'&&e.sourceId.trim(),'事件必须引用材料或自述来源');
  if(['WAGE_DUE','PAYMENT'].includes(e.type))need(Number.isSafeInteger(e.amountCents)&&e.amountCents>0&&e.amountCents<=100000000000,'金额必须为正整数分且不超过10亿元');
  if(e.type==='RETRACT'){const target=ids.get(e.targetId);need(target&&target.type!=='RETRACT'&&target.subject===e.subject&&target.period===e.period&&e.date>=target.date&&typeof e.reason==='string'&&e.reason.trim(),'撤回必须引用先前同主体/期间事件并说明理由');}ids.set(e.id,e);
 }
}
function project(events,asOf,scope={}){
 validate(events);need(date(asOf),'时间线必须明确 asOf 日期');
 const available=events.filter(e=>e.date<=asOf),retracted=new Set(available.filter(e=>e.type==='RETRACT').map(e=>e.targetId));
 const active=available.filter(e=>e.type!=='RETRACT'&&!retracted.has(e.id)&&(!scope.subject||e.subject===scope.subject)&&(!scope.period||e.period===scope.period));const groups=new Map();
 for(const e of active){const key=JSON.stringify([e.subject,e.period]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);}
 const periods=[...groups].map(([key,rows])=>{const [subject,period]=JSON.parse(key),dues=rows.filter(e=>e.type==='WAGE_DUE'),payments=rows.filter(e=>e.type==='PAYMENT');
  const dueCents=dues.reduce((s,e)=>s+e.amountCents,0),paidCents=payments.reduce((s,e)=>s+e.amountCents,0);need(Number.isSafeInteger(dueCents)&&Number.isSafeInteger(paidCents),'金额累加超出安全范围');
  let historicalLate=null;
  if(dues.length){historicalLate=dues.some(d=>d.date<asOf&&dues.filter(x=>x.date<=d.date).reduce((s,x)=>s+x.amountCents,0)>payments.filter(p=>p.date<=d.date).reduce((s,p)=>s+p.amountCents,0));}
  const observedUnpaid=rows.some(e=>e.type==='UNPAID_OBSERVATION');
  return {subject,period,dueCents:dues.length?dueCents:null,paidCents,balanceCents:dues.length?Math.max(0,dueCents-paidCents):null,overpaymentCents:dues.length?Math.max(0,paidCents-dueCents):null,historicalLate,observedUnpaid,eventIds:rows.map(e=>e.id),laterSatisfied:historicalLate===true&&paidCents>=dueCents};
 });
 // Only a scoped, quantified late event supports the negative historical field.
 const scoped=Boolean(scope.subject&&scope.period),late=periods.some(p=>p.historicalLate===true);
 return {asOf,scope,periods,derivedFacts:scoped&&late?{wage_paid_on_time_full:false}:{},limitations:['按自然日计算，到期日结束前不认定逾期；缺失付款记录不证明实际未付','仅在已录入事件范围计算；不把当前余额为零改写为从未逾期','工资期间和主体必须明确；未到期义务不计入当前余额']};
}
// ---- Employment dates: tenure facts and arbitration limitation (仲裁时效). Spec: research/LIMITATION-SPEC.md ----
// Periods follow 民法典 第201—202条: the start day is not counted; a period of n months/years ends on the corresponding
// day of the final month, or that month's last day when no such day exists. Holiday extension (第203条) and
// suspension (中止, 劳动争议调解仲裁法第27条第3款) are not modelled.
const DAY=86400000,ms=s=>Date.parse(s+'T00:00:00Z'),iso=t=>new Date(t).toISOString().slice(0,10);
function addMonths(s,n){const y=+s.slice(0,4),m=+s.slice(5,7)-1+n,d=+s.slice(8,10),Y=y+Math.floor(m/12),M=((m%12)+12)%12,last=new Date(Date.UTC(Y,M+1,0)).getUTCDate();return iso(Date.UTC(Y,M,Math.min(d,last)));}
const addYears=(s,n)=>addMonths(s,12*n);
// Elapsed months from a to b as a decimal: whole months, plus the fraction of the following month. 0 if b<=a.
function monthsBetween(a,b){if(b<=a)return 0;let m=0;while(addMonths(a,m+1)<=b)m++;const base=addMonths(a,m),next=addMonths(a,m+1);return Math.round((m+(ms(b)-ms(base))/(ms(next)-ms(base)))*10000)/10000;}
const LIMITATION_GROUPS={
 SEPARATION:{rules:['R46','R87','R87-2','R87-3','R47-2','R50'],basis:'《劳动争议调解仲裁法》第二十七条第一款：时效一年，自知道或应当知道权利被侵害之日起算；解除、终止引起的请求按劳动关系解除或终止之日起算。'},
 REMUNERATION:{rules:['R30','R44','R85','R16-P','R20','R26'],basis:'《劳动争议调解仲裁法》第二十七条第四款：劳动关系存续期间拖欠劳动报酬不受一年限制；劳动关系终止的，自终止之日起一年内提出。加班费是否属于劳动报酬，各地口径大多肯定，个别不同。'},
 UNSETTLED:{rules:['R82','R82-2','R82-3','R5-AL'],basis:'二倍工资差额、未休年休假报酬是否属于劳动报酬及起算点，各地口径不一（逐月起算、自违法状态结束起算、自离职起算等）。此处只用最晚的起算点（劳动关系终止之日）判断：若连这样也已超过一年，则在各口径下都已超过时效。'}
};
const EMPLOYMENT_KEYS=['start','end','stillEmployed','filed','interruptions','defense'];
function validateEmployment(e){
 need(e&&typeof e==='object'&&!Array.isArray(e)&&Object.keys(e).every(k=>EMPLOYMENT_KEYS.includes(k)),'employment 只接受 '+EMPLOYMENT_KEYS.join('、'));
 for(const k of ['start','end','filed'])need(e[k]===undefined||date(e[k]),'employment.'+k+' 必须为有效 YYYY-MM-DD');
 need(e.stillEmployed===undefined||typeof e.stillEmployed==='boolean','employment.stillEmployed 必须为布尔值');
 need(!(e.stillEmployed===true&&e.end!==undefined),'已填写劳动关系终止日期，不能同时声明仍在职');
 need(e.start===undefined||e.end===undefined||e.start<=e.end,'用工开始日期晚于终止日期');
 need(e.defense===undefined||e.defense===null||typeof e.defense==='boolean','employment.defense 只接受 true/false/null');
 need(e.interruptions===undefined||(Array.isArray(e.interruptions)&&e.interruptions.length<=100&&e.interruptions.every(x=>x&&typeof x==='object'&&date(x.date)&&['DEMAND','COMPLAINT','ACKNOWLEDGED'].includes(x.kind))),'时效中断事件须为 {date, kind: DEMAND|COMPLAINT|ACKNOWLEDGED}');
}
function employmentDates(e,asOf){
 validateEmployment(e);need(date(asOf),'日期推导必须明确 asOf 日期');
 const derivedFacts={},ended=e.end!==undefined&&e.end<=asOf;
 if(ended)derivedFacts.worker_separated=true;else if(e.stillEmployed===true)derivedFacts.worker_separated=false;
 if(e.start!==undefined&&(ended||e.stillEmployed===true))derivedFacts.months_employed=monthsBetween(e.start,ended?e.end:asOf);
 const filed=e.filed||asOf,filingAssumed=e.filed===undefined,employedAtFiling=e.end!==undefined?filed<e.end:e.stillEmployed===true?true:null;
 const interrupts=[...(e.interruptions||[])].map(x=>x.date).sort();
 function window(start){let s=start,deadline=addYears(start,1);const used=[];for(const d of interrupts)if(d>s&&d<=deadline){s=d;deadline=addYears(d,1);used.push(d);}return {start,restartedFrom:s,deadline,interruptionsUsed:used};}
 const barred=(w,status)=>filed<=w.deadline?status:e.defense===true?'BARRED':e.defense===false?'BARRED_NOT_RAISED':'BARRED_IF_RAISED';
 const assessments=[];
 for(const [group,g]of Object.entries(LIMITATION_GROUPS))for(const rule of g.rules){
  let r;
  if(group==='REMUNERATION'&&employedAtFiling===true)r={status:'NOT_LIMITED_DURING_EMPLOYMENT'};
  else if(e.end===undefined&&e.stillEmployed===true)r={status:group==='SEPARATION'?'NOT_STARTED':'UNSETTLED_NOT_BARRED_AT_LATEST_START'};
  else if(e.end===undefined)r={status:'UNKNOWN',missing:'end'};
  else {const w=window(e.end);r={...w,status:barred(w,group==='UNSETTLED'?'UNSETTLED_NOT_BARRED_AT_LATEST_START':'WITHIN')};}
  assessments.push({rule,group,...r,filed,filingAssumed});
 }
 return {format:'lexchain-employment-dates-v1',asOf,derivedFacts,limitation:assessments,groups:Object.fromEntries(Object.entries(LIMITATION_GROUPS).map(([k,g])=>[k,g.basis])),
  limitations:['期间按民法典第201—202条计算；未处理法定节假日顺延和时效中止','时效是否适用以用人单位提出时效抗辩为前提；defense 未填写时只提示风险','未提交仲裁申请日时，以 asOf 作为假设的申请日']};
}
return {date,validate,project,addMonths,addYears,monthsBetween,LIMITATION_GROUPS,validateEmployment,employmentDates};
});
