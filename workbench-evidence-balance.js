(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../integration/hash'));else root.LexChainEvidenceBalance=factory(root.LexChainHash);})(typeof globalThis!=='undefined'?globalThis:this,function(H){
'use strict';
const FORMAT='lexchain-evidence-balance-v1';
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const clone=x=>JSON.parse(JSON.stringify(x));
const canonical=x=>Array.isArray(x)?'['+x.map(canonical).join(',')+']':plain(x)?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}':JSON.stringify(x);
const digest=x=>H.sha256(canonical(x));
const text=(x,n=2000)=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(x)&&!['__proto__','prototype','constructor'].includes(x);
const date=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
function need(ok,message){if(!ok)throw Object.assign(new Error(message),{code:'INVALID_EVIDENCE_BALANCE'});}
function fields(x,required,optional=[]){need(plain(x),'记录必须是对象');need(required.every(k=>own(x,k))&&Object.keys(x).every(k=>required.includes(k)||optional.includes(k)),'记录包含缺失或未支持的字段');}
function claimDigest(c){return digest(c);}
function assertionDigest(a){return digest(a);}
function assess(input){
 fields(input,['format','claims','sources','records']);need(input.format===FORMAT,'证据汇总格式不符');
 need(Array.isArray(input.claims)&&input.claims.length<=200&&Array.isArray(input.sources)&&input.sources.length<=500&&Array.isArray(input.records)&&input.records.length<=2000,'证据汇总规模或数组无效');
 const claims=new Map(),sources=new Map(),assertions=new Map(),reviews=new Map(),ids=new Set(),superseded=new Set(),slots=new Set(),factSlots=new Set();
 for(const c of input.claims){fields(c,['id','proposition','type','subject','period'],['factKey']);need(id(c.id)&&!claims.has(c.id)&&c.type==='boolean'&&text(c.proposition,1000)&&text(c.subject,100)&&text(c.period,100)&&(!own(c,'factKey')||id(c.factKey)),'命题身份、布尔类型或范围无效');const slot=canonical([c.proposition,c.subject,c.period]),factSlot=own(c,'factKey')?canonical([c.factKey,c.subject,c.period]):null;need(!slots.has(slot)&&(!factSlot||!factSlots.has(factSlot)),'同范围的命题或事实绑定重复');slots.add(slot);if(factSlot)factSlots.add(factSlot);claims.set(c.id,c);}
 for(const s of input.sources){fields(s,['id','text','sha256'],['title']);need(id(s.id)&&!sources.has(s.id)&&text(s.text,1000000)&&typeof s.sha256==='string'&&s.sha256===H.sha256(s.text)&&(s.title===undefined||text(s.title,300)),'来源身份、原文或摘要无效');sources.set(s.id,s);}
 need(input.sources.reduce((n,s)=>n+s.text.length,0)<=5000000,'来源原文总量超过500万UTF-16单元');
 for(const record of input.records){
  need(plain(record)&&id(record.id)&&!ids.has(record.id),'历史记录身份重复或无效');
  if(record.type==='ASSERTION'){
   fields(record,['id','type','claimId','claimDigest','sourceId','sourceHash','start','end','quote','subject','period','stance','author','recordedAt','reason'],['supersedes']);
   const claim=claims.get(record.claimId),source=sources.get(record.sourceId);
   need(claim&&source&&record.claimDigest===claimDigest(claim)&&record.sourceHash===source.sha256,'断言未绑定当前命题或来源摘要');
   need(record.subject===claim.subject&&record.period===claim.period,'断言与命题主体或期间不同');
   need(Number.isInteger(record.start)&&Number.isInteger(record.end)&&record.start>=0&&record.end>record.start&&record.end<=source.text.length&&typeof record.quote==='string'&&record.quote===source.text.slice(record.start,record.end),'证据跨度或引文与原文不符');
   need(['SUPPORTS','REFUTES'].includes(record.stance)&&text(record.author,120)&&date(record.recordedAt)&&text(record.reason),'断言立场、作者、日期或理由无效');
   if(own(record,'supersedes')){
    const prior=assertions.get(record.supersedes);
    need(prior&&!superseded.has(prior.id)&&prior.claimId===record.claimId&&prior.author===record.author&&record.recordedAt>=prior.recordedAt,'更正必须引用本人同一命题的有效旧断言');
    superseded.add(prior.id);
   }
   assertions.set(record.id,record);
  }else if(record.type==='REVIEW'){
   fields(record,['id','type','assertionId','assertionDigest','decision','reviewer','reviewedAt','reason','subject','period'],['supersedes']);
   const a=assertions.get(record.assertionId),prior=reviews.get(record.assertionId);
   need(a&&!superseded.has(a.id)&&record.assertionDigest===assertionDigest(a),'复核必须绑定先前未被更正的断言及摘要');
   need(record.subject===a.subject&&record.period===a.period,'复核与断言范围不符');
   need(['ACCEPT','REJECT','REVOKE'].includes(record.decision)&&text(record.reviewer,120)&&record.reviewer.trim()!==a.author.trim()&&date(record.reviewedAt)&&record.reviewedAt>=a.recordedAt&&text(record.reason),'复核需要不同审核人、有效日期和理由');
   need(prior?record.supersedes===prior.id&&record.reviewedAt>=prior.reviewedAt:!own(record,'supersedes'),'复核修订必须引用最新复核记录');
   need(record.decision!=='REVOKE'||prior?.decision==='ACCEPT','只有当前已接受的断言可撤审');
   reviews.set(a.id,record);
  }else need(false,'未支持的历史事件类型');
  ids.add(record.id);
 }
 const states=[...assertions.values()].map(a=>{const review=reviews.get(a.id)||null,status=superseded.has(a.id)?'SUPERSEDED':!review?'PENDING':({ACCEPT:'ACCEPTED',REJECT:'REJECTED',REVOKE:'REVOKED'}[review.decision]);return {id:a.id,claimId:a.claimId,stance:a.stance,sourceId:a.sourceId,status,assertionDigest:assertionDigest(a),latestReviewId:review?.id||null};});
 const rows=[...claims.values()].map(c=>{
  const all=states.filter(s=>s.claimId===c.id),accepted=all.filter(s=>s.status==='ACCEPTED'),support=accepted.filter(s=>s.stance==='SUPPORTS').map(s=>s.id),refute=accepted.filter(s=>s.stance==='REFUTES').map(s=>s.id);
  const status=support.length?(refute.length?'BOTH':'SUPPORTED'):(refute.length?'REFUTED':'NEITHER');
  const k3=status==='SUPPORTED'?true:status==='REFUTED'?false:null;
  return {id:c.id,proposition:c.proposition,subject:c.subject,period:c.period,...(c.factKey===undefined?{}:{factKey:c.factKey}),status,k3,truthValue:k3===null?'U':k3?'T':'F',supportingAssertionIds:support,refutingAssertionIds:refute,pendingAssertionIds:all.filter(s=>s.status==='PENDING').map(s=>s.id),rejectedAssertionIds:all.filter(s=>s.status==='REJECTED').map(s=>s.id),revokedAssertionIds:all.filter(s=>s.status==='REVOKED').map(s=>s.id),supersededAssertionIds:all.filter(s=>s.status==='SUPERSEDED').map(s=>s.id),truthStatus:'NOT_AUTHENTICATED',factPromotion:'REQUIRES_CASE_REVIEW',usedInAnalysis:false};
 });
 return {format:'lexchain-evidence-balance-result-v1',semantics:'reviewed-support-refutation-v1',input:clone(input),inputDigest:digest(input),assertions:states,claims:rows,boundary:'支持与反驳来自独立人员的原文支持复核；BOTH和NEITHER均投影为未知。它们不是材料真实性、案件事实或法院认定，不自动写回案件。审核身份为本地声明，摘要不构成签名；本模块不执行次协调道义演算。'};
}
function append(input,record){assess(input);const next={...clone(input),records:[...clone(input.records),clone(record)]};assess(next);return next;}
function examples(){
 // Paid and paid on time are distinct: no automatic legal fact key is assigned.
 const claim={id:'paid_may',proposition:'甲的五月工资已支付',type:'boolean',subject:'甲',period:'2026-05'};
 const texts=['合成材料：甲的五月工资已支付。','合成材料：甲的五月工资仍未支付。'];
 const sources=texts.map((text,i)=>({id:'source_'+i,text,sha256:H.sha256(text)}));
 const input={format:FORMAT,claims:[claim],sources,records:[]};
 sources.forEach((s,i)=>{const a={id:'assertion_'+i,type:'ASSERTION',claimId:claim.id,claimDigest:claimDigest(claim),sourceId:s.id,sourceHash:s.sha256,start:0,end:s.text.length,quote:s.text,subject:claim.subject,period:claim.period,stance:i===0?'SUPPORTS':'REFUTES',author:'合成标注员'+i,recordedAt:'2026-11-17',reason:'合成正反材料，仅用于演示'};input.records.push(a,{id:'review_'+i,type:'REVIEW',assertionId:a.id,assertionDigest:assertionDigest(a),decision:'ACCEPT',reviewer:'合成独立复核员',reviewedAt:'2026-11-17',reason:'合成文字支持复核，不确认真实性',subject:a.subject,period:a.period});});
 const neither=clone(input);neither.records=neither.records.filter(r=>r.type==='ASSERTION');
 const revoked=clone(input);revoked.records.push({id:'review_revoke',type:'REVIEW',assertionId:'assertion_1',assertionDigest:assertionDigest(input.records[2]),decision:'REVOKE',reviewer:'合成独立复核员',reviewedAt:'2026-11-18',reason:'合成撤审，等待新增材料',subject:claim.subject,period:claim.period,supersedes:'review_1'});
 return [{id:'opposing_materials',title:'合成正反材料并存',input},{id:'unreviewed_materials',title:'合成材料均待审',input:neither},{id:'revoked_refutation',title:'合成反驳材料撤审',input:revoked}];
}
return {assess,append,examples,claimDigest,assertionDigest};
});
