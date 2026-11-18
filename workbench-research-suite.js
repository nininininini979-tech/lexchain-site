(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./schema'),require('./chain'),require('./checker'),require('./obligations'),require('./evidence-balance'),require('./relations'));else r.LexChainResearchSuite=f(r.LexChainWorkbenchSchema,r.LexChainChain,r.LexChainChainChecker,r.LexChainObligations,r.LexChainEvidenceBalance,r.LexChainRelations);})(typeof globalThis!=='undefined'?globalThis:this,function(S,C,K,O,E,R){
'use strict';
const VERSION='five-upgrades-2026-11-17.1', LIMIT=5000000;
const stable=x=>JSON.parse(JSON.stringify(x,(k,v)=>k==='elapsedMs'?0:v));
function onlyKeys(value,allowed,message){S.need(S.plain(value)&&Object.keys(value).every(k=>allowed.includes(k)),message);}
function completeSelection(catalog,selected,input){
 S.need(Array.isArray(selected)&&selected.length>0&&new Set(selected).size===selected.length,'选择至少一条规则且不能重复');
 const ids=new Set(selected), initial=[...ids];
 S.need(initial.every(id=>catalog.rules.some(r=>r.id===id)),'规则选择不存在');
 const ctx=input.context,scope=n=>S.canonical([n.bearer,n.actionKey,ctx.subject,ctx.period,ctx.ruleContexts?.[n.legalRuleId]?.eventDate||ctx.eventDate,ctx.ruleContexts?.[n.legalRuleId]?.jurisdiction||ctx.jurisdiction]);
 let changed=true;
 while(changed){changed=false;for(const n of catalog.rules)if(ids.has(n.id))for(const id of [...n.depends.map(d=>d.rule),...catalog.rules.filter(other=>scope(other)===scope(n)).map(r=>r.id)])if(!ids.has(id)){ids.add(id);changed=true;}}
 return {selectedIds:[...ids].sort(),requestedIds:initial,addedIds:[...ids].filter(id=>!initial.includes(id)).sort(),boundary:'只保证所提供目录内同一行为范围的竞争规则与前序依赖完整；不自动发现目录外规则或未统一的行为。'};
}
function run(value,assets){
 onlyKeys(value,['format','obligations','evidence','relations','chain','bindings'],'研究输入格式或字段无效');
 S.need(value.format==='lexchain-research-input-v1'&&S.jsonBytes(value)<=LIMIT,'研究输入格式或规模无效');
 const input=S.clone(value);S.need(['obligations','evidence','relations','chain'].some(k=>input[k]!==undefined),'研究输入至少包含一个模块');
 const result={format:'lexchain-research-result-v1',version:VERSION,input,assetsDigest:S.digest(assets),projections:[],release:'RESEARCH_ONLY',verification:{newModules:'DETERMINISTIC_REPLAY_NOT_INDEPENDENT_PROOF',chain:null}};
 if(input.obligations!==undefined)result.obligations=O.project(input.obligations);
 if(input.evidence!==undefined)result.evidence=E.assess(input.evidence);
 if(input.relations!==undefined)result.relations=R.derive(input.relations);
 const bindings=input.bindings===undefined?{}:input.bindings;onlyKeys(bindings,['evidence','obligations'],'事实映射格式或字段无效');
 for(const name of ['evidence','obligations'])if(bindings[name]!==undefined)S.need(Array.isArray(bindings[name])&&bindings[name].length<=81,'映射必须为数组');
 if(input.chain!==undefined){
  onlyKeys(input.chain,['format','catalog','input','selectedIds','policy'],'联合规则输入格式或字段无效');
  S.need(S.plain(input.chain.input),'联合规则输入无效');
  onlyKeys(input.chain.input,['facts','context','sources','events','evidence'],'案件输入格式或字段无效');
  S.need(input.chain.input.facts===undefined||S.plain(input.chain.input.facts),'案件事实必须是对象');
  S.need(S.plain(input.chain.input.context),'案件上下文必须是对象');
  for(const key of ['sources','events','evidence'])S.need(input.chain.input[key]===undefined||Array.isArray(input.chain.input[key]),'案件'+key+'必须是数组');
  const q=S.clone(input.chain);q.format='lexchain-chain-request-v1';q.input.context={...q.input.context,classificationPolicy:'explicit-review-v1'};q.input.facts={...q.input.facts};
  const used=new Set(),ctx=q.input.context;
  const bind=(b,v,detail,allowed)=>{onlyKeys(b,allowed,'事实映射格式或字段无效');S.need(typeof b.fact==='string'&&!used.has(b.fact),'同一事实不能重复绑定');const def=assets.rules.facts.find(d=>d.key===b.fact);S.need(def&&def.type==='bool','只能映射受控布尔事实');S.need(S.text(b.actor,120)&&S.text(b.reason),'映射需记录操作者与理由');used.add(b.fact);const previous=S.own(q.input.facts,b.fact)?q.input.facts[b.fact]:null;
   // The explicitly bound evidence channel cannot silently override contrary input.
   const conflict=previous!==null&&v!==null&&previous!==v;
   q.input.facts[b.fact]=conflict?null:v;
   result.projections.push({...b,...detail,previous,candidate:v,effective:q.input.facts[b.fact],conflict});};
  for(const b of bindings.evidence||[]){onlyKeys(b,['claimId','fact','actor','reason'],'证据映射格式或字段无效');S.need(result.evidence,'缺少证据模块');const c=result.evidence.claims.find(c=>c.id===b.claimId);const raw=input.evidence.claims.find(c=>c.id===b.claimId);S.need(c&&raw&&raw.subject===ctx.subject&&raw.period===ctx.period&&raw.factKey===b.fact,'证据命题、主体或期间与目标事实不一致');const v=c.status==='SUPPORTED'?true:c.status==='REFUTED'?false:null;bind(b,v,{channel:'EVIDENCE',status:c.status},['claimId','fact','actor','reason']);}
  for(const b of bindings.obligations||[]){onlyKeys(b,['obligationId','fact','aspect','actor','reason'],'期限义务映射格式或字段无效');S.need(result.obligations,'缺少期限义务模块');const o=result.obligations.obligations.find(o=>o.id===b.obligationId);S.need(o&&o.subject===ctx.subject&&o.period===ctx.period&&result.obligations.asOf===ctx.asOf,'义务主体、期间或截至日不一致');S.need(b.fact==='wage_paid_on_time_full'&&b.aspect==='historicalTimely','首版期限映射仅支持工资历史按时足额支付');S.need(['wage_payment','pay_wage'].includes(o.actionKey),'只有明确工资支付行为可映射工资事实');const v=o.historicalViolation===true?false:o.status!=='CONFLICT'&&o.fulfillment==='T'&&o.completedAt&&o.completedAt<=o.dueDate?true:null;bind(b,v,{channel:'OBLIGATION',status:o.status},['obligationId','fact','aspect','actor','reason']);}
  S.catalog(q.catalog,assets);S.request(q,assets);
  result.selection=completeSelection(q.catalog,q.selectedIds,q.input);q.selectedIds=result.selection.selectedIds;
  result.chain=C.analyze(q,assets);const checked=K.verify(result.chain.certificate,assets,q.catalog,result.chain.certificate.request.input);S.need(checked.verified,'独立整链检查失败：'+checked.reason);result.verification.chain=checked;
 }else S.need(!(bindings.evidence?.length||bindings.obligations?.length),'事实映射需要联合规则输入');
 result.boundaries=['所有本轮扩展输出用于研究；真实法律规则与优先依据仍须专业审核。','证据状态是对提交材料及审核记录的投影，不证明材料真实。','期限义务是有限金钱义务轨迹；关系模块展开霍费尔德八概念的相关项并报告对立项冲突，不执行法律关系变化。'];
 return result;
}
function verify(result,assets){try{S.need(result?.format==='lexchain-research-result-v1'&&result.version===VERSION&&result.assetsDigest===S.digest(assets),'结果版本或外部目录不符');const replay=run(result.input,assets);S.need(S.canonical(stable(result))===S.canonical(stable(replay)),'归档结果与重算不一致');return {verified:true,kind:'INPUT_BOUND_REPLAY',independentChain:!!result.chain,boundary:'扩展模块使用相同实现重算；联合规则另经独立检查。'};}catch(error){return {verified:false,reason:error.message};}}
function create(title){S.need(S.text(title,160),'研究名称无效');return {format:'lexchain-research-archive-v1',version:VERSION,title,runs:[]};}
function validateArchive(doc,assets){S.need(doc?.format==='lexchain-research-archive-v1'&&doc.version===VERSION&&S.text(doc.title,160)&&Array.isArray(doc.runs)&&doc.runs.length<=30&&S.jsonBytes(doc)<=LIMIT,'研究归档格式、版本或规模无效');let previous='0'.repeat(64);for(let i=0;i<doc.runs.length;i++){const row=doc.runs[i];S.need(row?.seq===i+1&&S.text(row.actor,120)&&typeof row.at==='string'&&Number.isFinite(Date.parse(row.at))&&row.previousHash===previous,'研究历史顺序无效');const {hash,...body}=row;S.need(hash===S.digest(body),'研究历史摘要不符');const check=verify(row.result,assets);S.need(check.verified,'归档复算失败：'+check.reason);previous=hash;}return {verified:true,runs:doc.runs.length,version:VERSION,boundary:'摘要链不认证身份，不防止持有人重写整条历史；扩展结果复核为同实现重算。'};}
function append(doc,result,actor,assets,at=new Date().toISOString()){validateArchive(doc,assets);S.need(doc.runs.length<30&&verify(result,assets).verified,'归档已满或结果复核失败');const copy=S.clone(doc),row={seq:copy.runs.length+1,actor,at,previousHash:copy.runs.at(-1)?.hash||'0'.repeat(64),result:S.clone(result)};row.hash=S.digest(row);copy.runs.push(row);validateArchive(copy,assets);return copy;}
function compare(a,b){S.need(a?.version===VERSION&&b?.version===VERSION,'比较结果版本不符');const rows=[];for(const [key,items,id]of [['obligations','obligations','id'],['evidence','claims','id'],['relations','relations','id']]){const aa=a[key]?.[items]||[],bb=b[key]?.[items]||[];for(const k of new Set([...aa.map(r=>r[id]),...bb.map(r=>r[id])])){const old=aa.find(r=>r[id]===k),now=bb.find(r=>r[id]===k);rows.push({module:key,id:k,change:!old?'ADDED':!now?'REMOVED':S.canonical(old)===S.canonical(now)?'RETAINED':'CHANGED',before:old||null,after:now||null});}}
 return {rows,chain:a.chain&&b.chain?C.compare(a.chain.certificate,b.chain.certificate):null,boundary:'逐项完整重算对照，不声称增量证明或最小因果解释。'};}
return {VERSION,run,verify,completeSelection,create,append,validateArchive,compare,stable};
});
