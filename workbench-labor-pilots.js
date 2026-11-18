(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./schema'));else root.LexChainLaborPilots=factory(root.LexChainWorkbenchSchema);})(typeof globalThis!=='undefined'?globalThis:this,function(S){
'use strict';
const definitions=[
 {id:'protected-dismissal',title:'特殊保护期的解除限制与后续义务',type:'EXCEPTION_AND_REMEDY',ruleIds:['R40','R42','R87-2'],requiredCompetitors:{R40:['R42'],R42:['R40']},requiredCompanions:{'R87-2':['R42','R40']},summary:'比较第40条授权与第42条限制，并观察R42违反后的R87-2研究链；保留既有例外，不制造已被例外排除的冲突。',facts:{ground_40_with_procedure:true,ground_layoff_41_procedure:false,worker_special_protection:true,terminated_by_employer:true,compensation_2n_paid:false},reviewQuestions:['核对第40条具体实体事由、程序及第42条各类保护情形；当前合并字段不能替代逐项认定。','R42在本组收窄为依第40条解除；第41条裁员程序义务不是同一授权，不能直接合并为冲突。','核对继续履行与赔偿的救济选择、第48条以及其他适用条件，R87-2不构成完整赔偿判断。','第42条限制依据只作为待审优先候选；既有R40例外仍实际参与计算。']},
 {id:'protected-expiry',title:'保护期内期满终止与后续义务',type:'VIOLATION_DEPENDENCY',ruleIds:['R45','R87-3'],requiredCompetitors:{},requiredCompanions:{R45:['R87-3'],'R87-3':['R45']},summary:'沿用R45违反到R87-3的显式依赖；这是前后规范链，不是两条规则互相冲突。',facts:{worker_special_protection:true,contract_expired_termination:true,compensation_2n_paid:false},reviewQuestions:['核对具体保护类型、期限、续延条件及职业病/工伤特别规定；单一保护字段覆盖不足。','核对继续履行与赔偿选择，以及第45、48、87条的完整适用，不推导自动2N金额。','终止、解除与现实后续补救必须分别绑定同一主体和期间。']},
 {id:'overtime-dual-duty',title:'超时安排限制与加班报酬并行',type:'PARALLEL_NONCONFLICT',ruleIds:['R31','R44'],requiredCompetitors:{},requiredCompanions:{R31:['R44'],R44:['R31']},summary:'禁止超上限安排与支付已发生加班报酬针对不同动作；付款不自动消除历史超时问题，不能为了演示冲突而把动作合并。',facts:{employment_exists:true,overtime_exists:true,monthly_overtime_hours:40,overtime_workday_hours:40,overtime_weekend_hours:0,overtime_holiday_hours:0,overtime_paid_correctly:true,weekend_overtime_compensated:false},reviewQuestions:['核对劳动法第41、42条的协商、特殊情形、工时制度与地域口径；现有R31例外尚不完整。','核对单位安排、实际工作、加班分类及计薪口径；R44目前不计算金额。','当前两条为并行审查，不从支付结果推断安排合法，也不把安排禁令变成免付报酬。']}
];
function checked(id,assets){const d=definitions.find(x=>x.id===id);S.need(d,'未知劳动规则研究组');S.need(assets&&assets.rules&&assets.mapping&&Array.isArray(assets.mapping.rules),'缺少可信劳动规则资产');for(const rid of d.ruleIds)S.need(assets.mapping.rules.some(r=>r.id===rid)&&assets.rules.rules.some(r=>r.id===rid),'研究组引用的劳动规则不存在：'+rid);return d;}
function metadata(d){return S.clone({id:d.id,title:d.title,type:d.type,ruleIds:d.ruleIds,recommendedIds:d.ruleIds,requiredCompetitors:d.requiredCompetitors,requiredCompanions:d.requiredCompanions,release:'RESEARCH_ONLY',reviewStatus:'PENDING',summary:d.summary});}
function list(assets){return definitions.map(d=>(checked(d.id,assets),metadata(d)));}
function build(id,assets){
 const d=checked(id,assets),catalog=S.defaults(assets);catalog.version='labor-pilot-'+id+'-2026-11-18';catalog.rules=catalog.rules.filter(r=>d.ruleIds.includes(r.id));catalog.priorities=[];catalog.sources=[];
 for(const n of catalog.rules)n.actionKey='research_'+id.replace(/-/g,'_')+'_'+n.id.replace(/-/g,'_');
 if(id==='protected-dismissal'){
  const permission=catalog.rules.find(r=>r.id==='R40'),restriction=catalog.rules.find(r=>r.id==='R42');permission.actionKey=restriction.actionKey='research_rescind_article40';
  restriction.condition={all:[{fact:'worker_special_protection',eq:true},{fact:'ground_40_with_procedure',eq:true}]};
  restriction.action='研究范围内依第四十条解除劳动合同';
  catalog.priorities.push({id:'P_RESEARCH_42_40',higher:'R42',lower:'R40',basis:{reference:'《中华人民共和国劳动合同法》第四十二条对第四十条、第四十一条解除的限制',reason:'待审核的真实规则关系候选；本组保留R40既有保护例外，因此不声称两条规范在保护条件下同时活动。',review:{status:'PENDING'}}});
 }
 catalog.note='现有劳动规则的研究映射，所有节点均RESEARCH_ONLY；没有新增法律审核、原文认证、优先批准或完备要件声明。';
 const subject='研究示例劳动者甲',period='2026-10',facts=S.clone(d.facts),context={subject,period,eventDate:'2026-11-01',asOf:'2026-11-02',jurisdiction:'CN',classificationPolicy:'explicit-review-v1',factAssessments:{}};
 for(const f of assets.rules.facts)if(f.nature==='LEGAL_CLASSIFICATION'&&Object.prototype.hasOwnProperty.call(facts,f.key))context.factAssessments[f.key]={value:facts[f.key],status:'PENDING',kind:'LEGAL_CLASSIFICATION',reason:'合成演练候选，尚无独立法律分类审核，不作为已经查明的案件事实'};
 const input={facts,context,employment:null,sources:[],events:[],evidence:[]},selectedIds=[...d.ruleIds];
 const requirements=catalog.rules.map(n=>({rule:n.id,condition:S.clone(n.condition),depends:S.clone(n.depends),fulfillment:S.clone(n.fulfillment),factKeys:S.clone(assets.mapping.rules.find(m=>m.id===n.id).factKeys||[])}));
 const exceptions=catalog.rules.map(n=>({rule:n.id,exceptions:S.clone(n.exceptions),limitations:S.clone(assets.mapping.rules.find(m=>m.id===n.id).limits||[])}));
 const sources=d.ruleIds.map(rid=>{const rule=assets.rules.rules.find(r=>r.id===rid);return {ruleId:rid,reference:rule.source,repositoryExcerpt:rule.text,sourceStatus:'REPOSITORY_REFERENCE_NOT_VERIFIED_ORIGINAL',reviewStatus:'PENDING',reviewQuestions:['需补权威原文快照、URL、日期、法域与适用版本；仓库节选不是本次核实的法律原文。']};});
 const result={...metadata(d),catalog,input,selectedIds,policy:'reviewed',requirements,exceptions,priorityCandidates:S.clone(catalog.priorities),sources,reviewQuestions:S.clone(d.reviewQuestions),limitations:['示例事实是合成输入，不是真实案件或专业标签。','原规则引用与仓库节选只作为审核线索；未伪造权威原文或URL。','默认完整选择本研究组；自定义选择仍须保留相关限制及前序依赖。','研究映射不更改主法律目录，任何目录审核也不使本映射自动变为法律意见。']};
 result.request={format:'lexchain-chain-request-v1',catalog:S.clone(catalog),input:S.clone(input),selectedIds:[...selectedIds],policy:'reviewed'};
 S.request(result.request,assets);return result;
}
return {list,build};
});
