(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../integration/hash'));else root.LexChainRelations=factory(root.LexChainHash);})(typeof globalThis!=='undefined'?globalThis:this,function(H){
'use strict';
const SUPPORTED=['CLAIM','DUTY','LIBERTY','NO_CLAIM','POWER','LIABILITY','IMMUNITY','DISABILITY'],UNSUPPORTED=[];
const CORRELATIVE={CLAIM:'DUTY',DUTY:'CLAIM',LIBERTY:'NO_CLAIM',NO_CLAIM:'LIBERTY',POWER:'LIABILITY',LIABILITY:'POWER',IMMUNITY:'DISABILITY',DISABILITY:'IMMUNITY'};
// Jural opposites are checked on the holder's own side; the mirrored pair is reported with the same conflict.
const OPPOSITE={CLAIM:'NO_CLAIM',POWER:'DISABILITY'};
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k),plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),clone=x=>JSON.parse(JSON.stringify(x));
const canonical=x=>Array.isArray(x)?'['+x.map(canonical).join(',')+']':plain(x)?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}':JSON.stringify(x);
const text=(x,n=2000)=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(x)&&!['__proto__','prototype','constructor'].includes(x);
const date=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
function need(ok,message){if(!ok)throw Object.assign(new Error(message),{code:'INVALID_HOHFELD_RELATION'});}
function fields(x,required,optional=[]){need(plain(x)&&required.every(k=>own(x,k))&&Object.keys(x).every(k=>required.includes(k)||optional.includes(k)),'关系记录包含缺失或未支持的字段');}
function validate(r){
 fields(r,['id','kind','holder','counterparty','action','polarity','scope','sourceId','ruleId','review']);
 need(id(r.id)&&SUPPORTED.includes(r.kind),'仅支持霍费尔德八概念；AUTH、PERMISSION及O/F等道义算子不能自动转换');
 need(text(r.holder,120)&&text(r.counterparty,120)&&r.holder!==r.counterparty&&text(r.action,500)&&['POSITIVE','NEGATIVE'].includes(r.polarity)&&id(r.sourceId)&&id(r.ruleId),'关系双方、行为、极性或来源规则身份无效');
 fields(r.scope,['subject','period'],['eventDate','jurisdiction']);need(text(r.scope.subject,100)&&text(r.scope.period,100)&&(r.scope.eventDate===undefined||date(r.scope.eventDate))&&(r.scope.jurisdiction===undefined||text(r.scope.jurisdiction,80)),'关系范围无效');
 fields(r.review,['status','reason'],['reviewer','reviewedAt']);need(['PENDING','APPROVED','REJECTED'].includes(r.review.status)&&text(r.review.reason),'关系审核状态或理由无效');
 need((r.review.reviewer===undefined||text(r.review.reviewer,120))&&(r.review.reviewedAt===undefined||date(r.review.reviewedAt)),'关系审核身份或日期无效');
 need(r.review.status==='PENDING'||text(r.review.reviewer,120)&&date(r.review.reviewedAt),'已审关系必须有审核人和日期');
}
function correlative(r){return {kind:CORRELATIVE[r.kind],holder:r.counterparty,counterparty:r.holder,action:r.action,polarity:['LIBERTY','NO_CLAIM'].includes(r.kind)?(r.polarity==='POSITIVE'?'NEGATIVE':'POSITIVE'):r.polarity,scope:clone(r.scope)};}
function meaning(r){
 if(r.kind==='CLAIM'||r.kind==='DUTY'){
  const rightsHolder=r.kind==='CLAIM'?r.holder:r.counterparty,dutyBearer=r.kind==='DUTY'?r.holder:r.counterparty;
  return {rightsHolder,dutyBearer,actionActor:dutyBearer,meaning:r.kind==='CLAIM'?rightsHolder+'对'+dutyBearer+'享有请求其'+(r.polarity==='NEGATIVE'?'不实施':'实施')+r.action+'的请求权':dutyBearer+'对'+rightsHolder+'负有'+(r.polarity==='NEGATIVE'?'不实施':'实施')+r.action+'的义务'};
 }
 if(r.kind==='POWER'||r.kind==='LIABILITY'){
  const powerHolder=r.kind==='POWER'?r.holder:r.counterparty,liabilityHolder=r.kind==='LIABILITY'?r.holder:r.counterparty,change=(r.polarity==='NEGATIVE'?'消灭或阻止':'')+r.action;
  return {powerHolder,liabilityHolder,actionActor:powerHolder,meaning:r.kind==='POWER'?powerHolder+'对'+liabilityHolder+'享有通过自身行为'+change+'这一法律关系变化的权力':liabilityHolder+'受制于'+powerHolder+'可以实施的'+change+'这一法律关系变化'};
 }
 if(r.kind==='IMMUNITY'||r.kind==='DISABILITY'){
  const immunityHolder=r.kind==='IMMUNITY'?r.holder:r.counterparty,disabilityHolder=r.kind==='DISABILITY'?r.holder:r.counterparty,change=(r.polarity==='NEGATIVE'?'消灭或阻止':'')+r.action;
  return {immunityHolder,disabilityHolder,actionActor:disabilityHolder,meaning:r.kind==='IMMUNITY'?immunityHolder+'相对于'+disabilityHolder+'就'+change+'享有豁免':disabilityHolder+'无权对'+immunityHolder+'实施'+change+'这一法律关系变化'};
 }
 const libertyHolder=r.kind==='LIBERTY'?r.holder:r.counterparty,noClaimHolder=r.kind==='NO_CLAIM'?r.holder:r.counterparty;
 return {libertyHolder,noClaimHolder,actionActor:libertyHolder,meaning:r.kind==='LIBERTY'?libertyHolder+'相对于'+noClaimHolder+'有'+(r.polarity==='NEGATIVE'?'不实施':'实施')+r.action+'的自由':noClaimHolder+'对'+libertyHolder+'没有请求其'+(r.polarity==='NEGATIVE'?'不实施':'实施')+r.action+'的请求权'};
}
function derive(input){
 fields(input,['format','relations']);need(input.format==='lexchain-hohfeld-relations-v1'&&Array.isArray(input.relations)&&input.relations.length<=500,'霍费尔德输入格式或规模无效');
 const ids=new Set(),rows=new Map();
 for(const r of input.relations){validate(r);need(!ids.has(r.id),'关系身份重复');ids.add(r.id);const original={kind:r.kind,holder:r.holder,counterparty:r.counterparty,action:r.action,polarity:r.polarity,scope:clone(r.scope)};
  for(const [mode,item]of [['ASSERTED',original],['CORRELATIVE',correlative(r)]]){
   const key=canonical(item);if(!rows.has(key))rows.set(key,{id:'relation_'+H.sha256(key),...item,...meaning(item),review:{status:'PENDING',reason:'关系展开只保留输入审核来源，不自动批准法律关系'},release:'RESEARCH_ONLY',origins:[]});
   rows.get(key).origins.push({inputId:r.id,mode,sourceId:r.sourceId,ruleId:r.ruleId,review:clone(r.review)});
  }
 }
 const relations=[...rows.values()].sort((a,b)=>a.id.localeCompare(b.id));
 for(const r of relations){const statuses=[...new Set(r.origins.map(o=>o.review.status))];r.originReviewState=statuses.length>1?'MIXED':statuses[0]+'_ONLY';r.usableAsLegalFinding=false;}
 // Jural opposites: CLAIM vs NO_CLAIM on the same tuple; POWER vs DISABILITY on the same tuple.
 // Through correlatives these also cover DUTY vs LIBERTY(not act) and LIABILITY vs IMMUNITY. Conflicts are reported, never resolved.
 const byKey=new Map(relations.map(r=>[canonical({kind:r.kind,holder:r.holder,counterparty:r.counterparty,action:r.action,polarity:r.polarity,scope:r.scope}),r])),conflicts=[];
 for(const r of relations){if(!OPPOSITE[r.kind])continue;const other=byKey.get(canonical({kind:OPPOSITE[r.kind],holder:r.holder,counterparty:r.counterparty,action:r.action,polarity:r.polarity,scope:r.scope}));if(!other)continue;
  const mirror=[r,other].map(x=>byKey.get(canonical({...correlative(x),kind:CORRELATIVE[x.kind]})).id);
  const origins=[...r.origins,...other.origins],states=[...new Set(origins.map(o=>o.review.status))];
  conflicts.push({type:'JURAL_OPPOSITE',pair:[r.kind,other.kind],relationIds:[r.id,other.id],mirrorRelationIds:mirror,holder:r.holder,counterparty:r.counterparty,action:r.action,polarity:r.polarity,scope:clone(r.scope),inputIds:[...new Set(origins.map(o=>o.inputId))].sort(),originReviewStates:states.sort(),resolution:'UNRESOLVED',note:'同一主体、相对方、行为、极性与范围下同时出现霍费尔德对立项；保留双方来源，不按数量或顺序选择，不由矛盾推出任意关系。'});
  for(const id of [r.id,other.id,...mirror])relations.find(x=>x.id===id).conflict=true;}
 for(const r of relations)if(r.conflict===undefined)r.conflict=false;
 return {format:'lexchain-hohfeld-relations-result-v1',semantics:'hohfeld-eight-correlatives-opposites-v2',input:clone(input),relations,conflicts,supportedKinds:[...SUPPORTED],unsupportedKinds:[...UNSUPPORTED],boundary:'展开霍费尔德八概念的四对相关项，并在完全相同的主体、相对方、行为、极性与范围下报告对立项冲突。源记录和审核状态保留，派生关系不自动获批。权力只记录可引起的法律关系变化，没有执行变化的操作；AUTH不等于法律权力；不证明法律或事实真实。'};
}
function examples(){
 const scope={subject:'劳动者甲',period:'2026-05',eventDate:'2026-06-01',jurisdiction:'CN'};
 const pending={status:'PENDING',reason:'合成关系，仅用于说明相关项，不是已审核法律规则'};
 return [{id:'wage_claim',title:'合成工资请求权与单位义务',input:{format:'lexchain-hohfeld-relations-v1',relations:[{id:'claim_wage',kind:'CLAIM',holder:'劳动者甲',counterparty:'单位乙',action:'支付五月工资',polarity:'POSITIVE',scope,sourceId:'synthetic_source',ruleId:'synthetic_wage',review:pending}]}},{id:'liberty',title:'合成行为自由与相对方无请求权',input:{format:'lexchain-hohfeld-relations-v1',relations:[{id:'liberty_action',kind:'LIBERTY',holder:'甲',counterparty:'乙',action:'实施合成行为',polarity:'POSITIVE',scope:{subject:'甲',period:'合成期间'},sourceId:'synthetic_source',ruleId:'synthetic_liberty',review:pending}]}},{id:'rescission_power',title:'合成解除权力与受制、保护期豁免冲突',input:{format:'lexchain-hohfeld-relations-v1',relations:[{id:'power_rescind',kind:'POWER',holder:'单位乙',counterparty:'劳动者甲',action:'解除劳动合同',polarity:'POSITIVE',scope,sourceId:'synthetic_source',ruleId:'synthetic_article40',review:pending},{id:'immunity_protected',kind:'IMMUNITY',holder:'劳动者甲',counterparty:'单位乙',action:'解除劳动合同',polarity:'POSITIVE',scope,sourceId:'synthetic_source_2',ruleId:'synthetic_article42',review:pending}]}}];
}
return {derive,examples};
});
