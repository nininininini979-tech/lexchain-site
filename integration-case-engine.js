(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../engine'),require('../conditional/solver'),require('./timeline'),require('./evidence'),require('./governance'));else root.LexChainCaseEngine=factory(root.LexChainBrowserEngine,root.LexChainConditional,root.LexChainTimeline,root.LexChainEvidence,root.LexChainGovernance);})(typeof globalThis!=='undefined'?globalThis:this,function(E,C,T,V,G){
'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),clone=x=>JSON.parse(JSON.stringify(x));
const ISSUE_RULES={wage_arrears:['R30','R38','R85','R16-P'],no_contract:['R82','R14','R82-2','R14-2','R82-3'],dismissal:['R87','R46','R39','R40','R41','R42','R45','R50','R87-2','R87-3'],social_insurance:['R58-SI','R38','R46'],overtime:['R44','R31'],noncompete:['R24','R25'],injury:[],other:[]};
const ISSUES=[['all','全部规则（研究审阅）'],['wage_arrears','工资支付'],['no_contract','书面合同与二倍工资'],['dismissal','解除、终止与补偿'],['social_insurance','社会保险'],['overtime','加班'],['noncompete','竞业限制'],['injury','工伤／职业伤害（转人工）'],['other','其他（转人工）']].map(([key,label])=>({key,label}));
function validateAssessments(context,definitions){
 if(context.classificationPolicy!==undefined&&context.classificationPolicy!=='explicit-review-v1')throw new Error('事实分类政策无效');
 if(context.issue!==undefined&&!ISSUES.some(i=>i.key===context.issue))throw new Error('主请求类型无效');
 if(context.factAssessments===undefined)return;
 const a=context.factAssessments,defs=Object.fromEntries(definitions.map(d=>[d.key,d]));
 if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).length>definitions.length)throw new Error('事实复核格式无效');
 for(const [key,r]of Object.entries(a)){
  if(!own(defs,key)||!r||typeof r!=='object'||Array.isArray(r)||!['PENDING','DISPUTED','REVIEWED'].includes(r.status)||!['STATEMENT','LEGAL_CLASSIFICATION','PRIOR_FINDING'].includes(r.kind)||typeof r.reason!=='string'||!r.reason.trim()||r.reason.length>2000)throw new Error('事实复核字段、状态或理由无效');
  E.assertFacts({[key]:r.value},definitions);
  if(r.status==='REVIEWED'&&defs[key].nature==='LEGAL_CLASSIFICATION'&&r.kind==='STATEMENT')throw new Error('法律分类不能仅凭已核对当事人陈述采用；请记录法律分类复核或同范围既有认定');
  if(r.status==='REVIEWED'&&(r.value===null||typeof r.reviewer!=='string'||!r.reviewer.trim()||r.reviewer.length>120||!T.date(r.reviewedAt)||typeof r.subject!=='string'||!r.subject.trim()||typeof r.period!=='string'||!r.period.trim()))throw new Error('已复核分类必须绑定取值、审核人、日期、主体和期间');
 }
}
function qualify(facts,context,definitions){
 const result={...facts},rows=[];
 for(const d of definitions){const value=facts[d.key];if(value===undefined||value===null)continue;const a=context.factAssessments?.[d.key],strict=context.classificationPolicy==='explicit-review-v1'&&d.nature==='LEGAL_CLASSIFICATION';
  if(!a&&!strict)continue;
  const matches=!!a&&a.value===value&&(a.status!=='REVIEWED'||a.subject===context.subject&&a.period===context.period),effective=matches&&a.status==='REVIEWED'?value:null;
  result[d.key]=effective;rows.push({fact:d.key,submitted:value,effective,status:!a?'PENDING':!matches?'STALE':a.status,kind:a?.kind||'LEGAL_CLASSIFICATION',reason:!a?'法律分类尚无独立复核记录':!matches?'取值或主体／期间已变化，原复核失效':a.reason});
 }
 return {facts:result,rows};
}
function focus(report,facts,context={}){
 const issue=context.issue||'all',ids=issue==='all'?report.rules.map(r=>r.id):[...ISSUE_RULES[issue]];
 let again=true;while(again){again=false;for(const r of report.rules)if(ids.includes(r.id)&&r.mapping.violationOf&&!ids.includes(r.mapping.violationOf)){ids.push(r.mapping.violationOf);again=true;}}
 const relevant=report.rules.filter(r=>ids.includes(r.id)),questions=new Map();
 for(const r of relevant)for(const f of r.missingFacts){if(!questions.has(f.fact))questions.set(f.fact,{...f,ruleIds:[]});questions.get(f.fact).ruleIds.push(r.id);}
 if(issue==='overtime'&&facts.overtime_exists!==false&&facts.overtime_arranged_by_employer==null)questions.set('overtime_arranged_by_employer',{fact:'overtime_arranged_by_employer',label:'相关加班是否由单位安排或明确要求',question:'请提供实际安排的材料；审批未完成与没有实际安排分别核对。',reasons:['scope:arrangement-not-yet-modeled'],ruleIds:['R44']});
 const warnings=[];
 if(['injury','other'].includes(issue))warnings.push('该主请求尚无完整规则包，当前转人工处理；其他劳动规则未触发不代表没有责任。');
 if(ids.includes('R82-2'))warnings.push('期满续用二倍工资的依据、故意拒签例外及历史适用尚未完成审核，本条暂停自动发布适用结论。');
 if(ids.includes('R24'))warnings.push('竞业当前仅检查单位期限／补偿，不能判断主体资格、实际竞争范围或劳动者违约；请转专业复核。');
 if(ids.includes('R44'))warnings.push('加班存在与金额分开；单位安排、工时制度、休息日补休、计薪基数及真实性仍需核对。');
 return {issue,ruleIds:relevant.map(r=>r.id),hiddenRuleCount:report.rules.length-relevant.length,questions:[...questions.values()],warnings,scope:'仅筛选展示与追问，后台仍计算并保存全部规则；未知不等于违法或败诉'};
}
function validate(input,assets){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('分析输入必须是对象');
 const errors=E.validateRuleSet(assets.rules);if(errors.length)throw new Error(errors.join(';'));
 E.assertFacts(input.facts===undefined?{}:input.facts,assets.rules.facts);
 if(input.context!==undefined&&(!input.context||typeof input.context!=='object'||Array.isArray(input.context)))throw new Error('context 必须是对象');
 const context=input.context||{};
 validateAssessments(context,assets.rules.facts);
 for(const k of ['eventDate','asOf'])if(context[k]!==undefined&&context[k]!==''&&!T.date(context[k]))throw new Error(k+' 必须为有效 YYYY-MM-DD');
 for(const k of ['jurisdiction','subject','period'])if(context[k]!==undefined&&typeof context[k]!=='string')throw new Error(k+' 必须为字符串');
 const maps=assets.mapping.rules,ids=assets.rules.rules.map(r=>r.id);
 if(context.ruleContexts!==undefined){if(!context.ruleContexts||typeof context.ruleContexts!=='object'||Array.isArray(context.ruleContexts))throw new Error('ruleContexts 必须是规则id到日期/法域的对象');for(const [id,c]of Object.entries(context.ruleContexts)){if(!ids.includes(id)||!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).some(k=>!['eventDate','jurisdiction'].includes(k))||(c.eventDate!==undefined&&!T.date(c.eventDate))||(c.jurisdiction!==undefined&&(typeof c.jurisdiction!=='string'||!c.jurisdiction.trim())))throw new Error('逐规则日期/法域覆盖无效');}}

 if(maps.length!==ids.length||new Set(maps.map(m=>m.id)).size!==ids.length||maps.some(m=>!ids.includes(m.id)))throw new Error('映射必须逐条覆盖且不能重复');
 const defs=Object.fromEntries(assets.rules.facts.map(f=>[f.key,f]));
 for(const m of maps){for(const c of [m.condition,...m.exceptions.map(e=>e.condition),...(m.fulfillment?[m.fulfillment]:[])]){const errs=E.validateCondition(c,defs);if(errs.length)throw new Error(errs.join(';'));}if(!['O','F','AUTH'].includes(m.kind))throw new Error('规范类型无效');if(m.kind==='AUTH'?m.fulfillment!==null:!m.fulfillment||typeof m.fulfillment!=='object')throw new Error(m.id+'：'+(m.kind==='AUTH'?'授权规则的 fulfillment 必须为 null':'义务/禁止规则必须有 fulfillment'));if(m.kind==='F'&&!own(m.fulfillment,'not'))throw new Error(m.id+'：禁止规则的 fulfillment 表示遵守禁止，必须写成 {not: 被禁止的行为}');}
 if(!Array.isArray(assets.registry.versions)||new Set(assets.registry.versions.map(v=>v.versionId)).size!==assets.registry.versions.length)throw new Error('法律版本 id 重复');
 const sources=input.sources===undefined?[]:input.sources;if(!Array.isArray(sources)||sources.length>500||new Set(sources.map(s=>s?.id)).size!==sources.length||sources.some(s=>!s||typeof s.id!=='string'||typeof s.text!=='string'))throw new Error('来源必须有唯一id和原文');
 if(input.events!==undefined){T.validate(input.events);for(const event of input.events)if(!sources.some(s=>s.id===event.sourceId))throw new Error('时间线事件引用不存在的来源 '+event.sourceId);}
 const evidence=input.evidence===undefined?[]:input.evidence;if(!Array.isArray(evidence)||evidence.length>500)throw new Error('证据批次过多');
 for(const e of evidence){if(!e||typeof e!=='object'||Array.isArray(e)||!Array.isArray(e.spans===undefined?[]:e.spans)||(e.spans||[]).length>500)throw new Error('证据批次或跨度无效');if(!sources.some(s=>s.id===e.sourceId))throw new Error('证据引用不存在的来源');E.assertFacts(e.facts,assets.rules.facts);}
 if(input.employment!==undefined&&input.employment!==null){try{T.validateEmployment(input.employment);}catch(e){throw new Error('employment 无效：'+e.message);}}
}
function analyze(input,assets){
 validate(input,assets);input=clone({facts:input.facts===undefined?{}:input.facts,context:input.context===undefined?{}:input.context,employment:input.employment===undefined?null:input.employment,events:input.events===undefined?[]:input.events,sources:input.sources===undefined?[]:input.sources,evidence:input.evidence===undefined?[]:input.evidence});
 const context=input.context,defs=Object.fromEntries(assets.rules.facts.map(f=>[f.key,f]));
 const timeline=input.events.length?T.project(input.events,context.asOf,context):null;
 const employmentDates=input.employment?T.employmentDates(input.employment,context.asOf):null;
 const allDerived={...timeline?.derivedFacts,...employmentDates?.derivedFacts};
 const facts={...input.facts},conflicts=[];
 for(const [k,v] of Object.entries(allDerived)){
  if(own(facts,k)&&facts[k]!==null&&facts[k]!==v){
   const source=employmentDates?.derivedFacts&&own(employmentDates.derivedFacts,k)?'employment':timeline?.derivedFacts&&own(timeline.derivedFacts,k)?'timeline':'unknown';
   conflicts.push(source==='employment'?{fact:k,submitted:facts[k],employment:v}:{fact:k,submitted:facts[k],timeline:v});
   facts[k]=null;
  }else if(!own(facts,k))facts[k]=v;
 }
 const qualification=qualify(facts,context,assets.rules.facts);Object.assign(facts,qualification.facts);
 const positiveHours=['overtime_workday_hours','overtime_weekend_hours','overtime_holiday_hours'].filter(k=>typeof facts[k]==='number'&&facts[k]>0);
 if(facts.overtime_exists===false&&positiveHours.length){conflicts.push({type:'OVERTIME_EXISTENCE_CONFLICT',facts:['overtime_exists',...positiveHours],reason:'否认已发生加班与正数实际加班小时冲突，相关值保留未知'});for(const k of ['overtime_exists',...positiveHours])facts[k]=null;}
 if(own(defs,'overtime_exists')){const hourKeys=['overtime_workday_hours','overtime_weekend_hours','overtime_holiday_hours'],completeZero=hourKeys.every(k=>facts[k]===0);if(facts.overtime_exists===true&&completeZero){conflicts.push({type:'OVERTIME_EXISTENCE_CONFLICT',facts:['overtime_exists',...hourKeys],reason:'确认已发生加班与三类实际小时均为零冲突，相关值保留未知'});for(const k of ['overtime_exists',...hourKeys])facts[k]=null;}else if(!qualification.rows.some(q=>q.fact==='overtime_exists'&&q.status!=='REVIEWED')&&!conflicts.some(x=>x.type==='OVERTIME_EXISTENCE_CONFLICT')&&facts.overtime_exists==null){if(positiveHours.length)facts.overtime_exists=true;else if(completeZero)facts.overtime_exists=false;}}
 const evidence=input.evidence.map(e=>({sourceId:e.sourceId,candidates:V.inspect(input.sources.find(s=>s.id===e.sourceId).text,e.facts,e.spans||[],context)}));
 const original=assets.rules.rules.map(r=>E.evalRule(r,input.facts,defs));
 const results=[],steps=[],remaining=[...assets.mapping.rules];
 const ev=c=>E.evalCondition(c,facts,defs);
 const trace=n=>{const value=ev(n).value;if(own(n,'fact'))return {kind:'atom',fact:n.fact,actual:own(facts,n.fact)?facts[n.fact]:null,operator:n.op||'==',expected:own(n,'eq')?n.eq:own(n,'value')?n.value:true,value};if(own(n,'constant'))return {kind:'constant',value};const kind=n.not?'not':n.all?'all':'any';return {kind,value,children:(n.not?[n.not]:n.all||n.any).map(trace)};};
 while(remaining.length){const i=remaining.findIndex(m=>!m.violationOf||steps.some(s=>s.id===m.violationOf));if(i<0)throw new Error('规则依赖存在环或缺失');const m=remaining.splice(i,1)[0],base=assets.rules.rules.find(r=>r.id===m.id);
  const trigger=ev(m.condition),exceptions=m.exceptions.map(e=>({...e,eval:ev(e.condition)})),ex=exceptions.some(e=>e.eval.value==='T')?'T':exceptions.some(e=>e.eval.value==='U')?'U':'F',fulfill=m.fulfillment?ev(m.fulfillment):null;
  let dependency=null,condition=trigger.value;
  if(m.violationOf){const parent=steps.find(s=>s.id===m.violationOf);dependency={id:parent.id,status:parent.computedStatus};const d=parent.computedStatus==='VIOLATION'?'T':['NOT_TRIGGERED','DEFEATED','COMPLIANT'].includes(parent.computedStatus)?'F':'U';condition=condition==='F'||d==='F'?'F':condition==='U'||d==='U'?'U':'T';}
  const applicable=condition==='F'?'F':ex==='T'?'F':condition==='U'||ex==='U'?'U':'T';
  let computedStatus=condition==='F'?'NOT_TRIGGERED':ex==='T'?'DEFEATED':condition==='U'?'POSSIBLE':ex==='U'?'DEFENSIBLE':m.kind==='AUTH'?'PERMITTED':fulfill.value==='T'?'COMPLIANT':fulfill.value==='F'?'VIOLATION':'RISK';
  let modal=null;
  if(m.kind!=='AUTH'){
   const ought=m.kind==='F'?'!act':'act',query={policy:'all',norms:[{id:m.id,given:'applicable',ought}],facts:applicable==='U'?[]:[applicable==='T'?'applicable':'!applicable'],query:{given:'applicable',ought}};
   modal={input:query,result:C.solve(query),scope:'local-two-atom-conditional-contract'};
  }
  const legalContext={eventDate:context.ruleContexts?.[m.id]?.eventDate||context.eventDate||null,jurisdiction:context.ruleContexts?.[m.id]?.jurisdiction||context.jurisdiction||null};
  const governance=G.select(assets.registry,m.id,legalContext,m.mappingVersion);
  const usedClassifications=assets.rules.facts.filter(d=>d.nature==='LEGAL_CLASSIFICATION'&&m.factKeys.includes(d.key)&&facts[d.key]!=null);
  if(usedClassifications.some(d=>!qualification.rows.some(r=>r.fact===d.key&&r.status==='REVIEWED'))){governance.reasons.push('CLASSIFICATION_REVIEW_REQUIRED');governance.status='REVIEW_REQUIRED';}
  if(m.releasePolicy==='MANUAL_ONLY'){governance.reasons.push('MAPPING_MANUAL_REVIEW_REQUIRED');governance.status='REVIEW_REQUIRED';}
  if(m.violationOf&&steps.find(s=>s.id===m.violationOf).governance.status!=='SELECTED'){governance.reasons.push('DEPENDENCY_REVIEW_PENDING');governance.status='REVIEW_REQUIRED';}
  if(m.exceptions.some(e=>e.basisId&&(assets.mapping.priorityBases||[]).find(b=>b.id===e.basisId)?.reviewStatus!=='APPROVED')){governance.reasons.push('PRIORITY_BASIS_REVIEW_PENDING');governance.status='REVIEW_REQUIRED';}
  let status=computedStatus==='NOT_TRIGGERED'?'NOT_TRIGGERED':governance.status==='SELECTED'?computedStatus:'REVIEW_REQUIRED';
  if(modal&&modal.result.status!=='ENTAILED'){status='REVIEW_REQUIRED';}
  const dimensions={trigger:condition,exception:ex,fulfillment:fulfill?fulfill.value:'NOT_APPLICABLE',applicability:applicable==='T'?'APPLICABLE':applicable==='U'?'PENDING':'BLOCKED'};
  const missing=new Map();for(const [phase,result]of [['trigger',trigger],...exceptions.map(e=>['exception:'+e.id,e.eval]),['fulfillment',fulfill]])if(result)for(const a of result.atoms.filter(a=>a.value==='U')){if(!missing.has(a.fact))missing.set(a.fact,{fact:a.fact,label:a.label,question:a.label+'？',reasons:[]});missing.get(a.fact).reasons.push(phase);}
  const needed=computedStatus!=='NOT_TRIGGERED'&&computedStatus!=='DEFEATED';
  const missingFactsByPhase={trigger:needed&&condition==='U'?[...missing.values()].filter(x=>x.reasons.includes('trigger')):[],exceptions:needed&&ex==='U'?[...missing.values()].filter(x=>x.reasons.some(p=>p.startsWith('exception:'))):[],fulfillment:needed&&condition==='T'&&fulfill?.value==='U'?[...missing.values()].filter(x=>x.reasons.includes('fulfillment')):[]};
  const mf=[...new Map(Object.values(missingFactsByPhase).flat().map(x=>[x.fact,x])).values()];
  const evaluations={condition:trace(m.condition),exceptions:m.exceptions.map(e=>({id:e.id,tree:trace(e.condition)})),fulfillment:m.fulfillment?trace(m.fulfillment):null};
  const step={evaluations,legalContext,id:m.id,mappingVersion:m.mappingVersion,kind:m.kind,condition:trigger.value,effectiveCondition:condition,exception:ex,fulfillment:dimensions.fulfillment,applicable,dependency,computedStatus,status,governance,modal};steps.push(step);
  results.push({...E.evalRule(base,facts,defs),trigger,exceptions,breach:fulfill,status,computedStatus,dimensions,governance,mapping:m,missingFacts:mf,missingFactsByPhase,
   symbol:m.formula+' → 计算：'+computedStatus+' / 发布：'+status,
   nlChain:[`条件 ${condition}；例外 ${ex}；历史履行 ${dimensions.fulfillment}。`,`规范映射：${m.formula}。行为命题与履行观察分离。`,...(dependency?[`违约后义务依赖 ${dependency.id} 的计算状态 ${dependency.status}；不把许可当作已实施行为。`]:[]),`计算状态 ${computedStatus}；业务发布状态 ${status}。`,...(status==='REVIEW_REQUIRED'?['版本/法域/过渡或审核信息不足：'+governance.reasons.join('、')]:[]),...m.limits],
   riskNote:status==='REVIEW_REQUIRED'?'原规则注释尚未通过法律审核；请结合本条映射限制核对。':base.risk_note||'',
   originalRiskNote:base.risk_note||'',
   remedy:status==='REVIEW_REQUIRED'?'待法律要件与版本审核后确定救济；研究计算不直接形成已成立的请求权。':base.remedy||''});
 }
 results.sort((a,b)=>assets.rules.rules.findIndex(r=>r.id===a.id)-assets.rules.rules.findIndex(r=>r.id===b.id));
 const counts={};results.forEach(r=>(counts[r.status]??=[]).push(r.id));
 const comparison=results.map(r=>({id:r.id,legacy:original.find(o=>o.id===r.id).status,computed:r.computedStatus,released:r.status,changed:original.find(o=>o.id===r.id).status!==r.computedStatus,reasons:r.mapping.limits}));
 const missing=new Map();results.forEach(r=>r.missingFacts.forEach(f=>missing.set(f.fact,f)));
 const report={engine:'LexChain v0.3 · 条件规范业务接入',status_policy:'2026-11-12',rulebase:assets.rules.meta.name,verdict:counts.REVIEW_REQUIRED?'研究计算已完成，法律适用待审核':counts.VIOLATION?'按当前事实，存在规则违反':'条件计算完成，仍需核对事实',verdict_symbol:'计算正确不等于事实真实或法律适用正确',status_counts:counts,rules:results,missing_facts:[...missing.values()],comparison,timeline,fact_conflicts:conflicts,evidence,boundary:assets.mapping.boundary,disclaimer:'采用原受控事实的研究映射；所有未获审核的法律版本不发布确定法律结论。原文匹配与人工确认均不证明材料真实。'};
 const certificate={format:'lexchain-business-certificate-v1',catalogSnapshot:clone(assets),catalogVersion:assets.mapping.version,registryVersion:assets.registry.version,input,derivedFacts:facts,timeline,employmentDates,evidence,conflicts,steps,comparison,statusCounts:counts};
 if(context.factAssessments!==undefined||context.classificationPolicy!==undefined)certificate.qualification=qualification.rows;
 report.inputQualification=qualification.rows;
 report.unreviewedClassifications=assets.rules.facts.filter(d=>d.nature==='LEGAL_CLASSIFICATION'&&facts[d.key]!=null&&!qualification.rows.some(r=>r.fact===d.key&&r.status==='REVIEWED')).map(d=>({fact:d.key,label:d.label,status:'LEGACY_UNREVIEWED_INPUT'}));
 report.focus=focus(report,facts,context);
 const overtime=results.find(r=>r.id==='R44');
 report.overtime={existence:facts.overtime_exists??null,applicability:overtime.dimensions.applicability,fulfillment:overtime.dimensions.fulfillment,amountStatus:'NOT_CALCULATED',missingQuantities:['overtime_workday_hours','overtime_weekend_hours','overtime_holiday_hours'].filter(k=>facts[k]===undefined||facts[k]===null),note:'分类小时未知不自动否定存在加班；存在加班不自动证明应付金额、安排主体或真实性。'};
 return {facts_used:facts,report,certificate};
}
return {analyze,validate,validateAssessments,qualify,focus,ISSUES};
});
