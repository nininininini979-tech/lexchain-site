'use strict';
// Capability statements are reference metadata, never executable legal rules.
window.LexChainTheory = [
  {
    "id": "D01",
    "name": "SDL 标准道义逻辑（Standard Deontic Logic）",
    "tag": "已实现独立KD内核",
    "formula": "O(φ→ψ)→(Oφ→Oψ)；Oφ→¬O¬φ；Pφ≡¬O¬φ（SDL/KD 中）",
    "scope": "业务仍采用三值事实与有限条件规范；AUTH为明确授权，不等同于KD弱许可。",
    "note": "modal/kd.js支持布尔公式、有限嵌套O/P/F、有效性/后承/可满足性、凭据和反模型，受资源上限限制。 业务仍采用三值事实与有限条件规范；AUTH为明确授权，不等同于KD弱许可。",
    "references": [
      {
        "id": "vonWright1951",
        "title": "von Wright, Georg Henrik. 1951. Deontic Logic. Mind 60(237): 1–15.",
        "url": "https://doi.org/10.1093/mind/LX.237.1"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      }
    ],
    "background": "命题标准道义逻辑KD采用串行Kripke语义；O是义务、P是弱许可、F定义为O¬。",
    "module": "modal/kd.js支持布尔公式、有限嵌套O/P/F、有效性/后承/可满足性、凭据和反模型，受资源上限限制。",
    "business": "业务仍采用三值事实与有限条件规范；AUTH为明确授权，不等同于KD弱许可。",
    "tests": [
      "tests/modal.test.js",
      "tests/integration.test.js"
    ],
    "nextStep": "固定需要研究的公式片段，扩充与真实规则相关的反模型及映射审核。"
  },
  {
    "id": "D02",
    "name": "模态基础（必然 / 可能）",
    "tag": "已实现串行模态框架",
    "formula": "◇φ≡¬□¬φ；T: □φ→φ；5: ◇φ→□◇φ（S5 可取 K+T+5）",
    "scope": "K3未知只表示输入不完整，不能当作模态可能性或主体知识。",
    "note": "独立KD研究台能计算串行框架中的O/P模态，不支持任意选择S4/S5等框架。 K3未知只表示输入不完整，不能当作模态可能性或主体知识。",
    "references": [
      {
        "id": "Anderson1958",
        "title": "Anderson, Alan Ross. 1958. A Reduction of Deontic Logic to Alethic Modal Logic. Mind 67(265): 100–103.",
        "url": "https://doi.org/10.1093/mind/LXVII.265.100"
      },
      {
        "id": "SEP-Modal",
        "title": "Stanford Encyclopedia of Philosophy. Modal Logic.",
        "url": "https://plato.stanford.edu/entries/logic-modal/"
      }
    ],
    "background": "必然与可能相对选定可达关系解释；KD不自动具有T、4、5公理。",
    "module": "独立KD研究台能计算串行框架中的O/P模态，不支持任意选择S4/S5等框架。",
    "business": "K3未知只表示输入不完整，不能当作模态可能性或主体知识。",
    "tests": [
      "tests/modal.test.js"
    ],
    "nextStep": "如需一般必然/可能，先独立指定框架及与义务的关系。"
  },
  {
    "id": "D03",
    "name": "CTD 违约后义务（Contrary-to-Duty）",
    "tag": "已实现有限条件义务与补救研究",
    "formula": "O(ψ/φ)：在条件 φ 下应当 ψ（记法；须另给具体演算）",
    "scope": "业务和工作台有明确violation依赖；补救履行不自动消除历史违反，未自动生成所有法律补救责任。",
    "note": "conditional/solver.js实现有限全赋值排序片段；workbench/obligations.js提供有限期限与补救关联投影。 业务和工作台有明确violation依赖；补救履行不自动消除历史违反，未自动生成所有法律补救责任。",
    "references": [
      {
        "id": "Chisholm1963",
        "title": "Chisholm, Roderick M. 1963. Contrary-To-Duty Imperatives and Deontic Logic. Analysis 24(2): 33–36.",
        "url": "https://doi.org/10.1093/analys/24.2.33"
      },
      {
        "id": "PrakkenSergot1996",
        "title": "Prakken, Henry, and Marek Sergot. 1996. Contrary-to-Duty Obligations. Studia Logica 57(1): 91–115.",
        "url": "https://doi.org/10.1007/BF00370671"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      }
    ],
    "background": "CTD指违反首要义务后的义务问题；条件不同的规范不能直接混为无条件矛盾。",
    "module": "conditional/solver.js实现有限全赋值排序片段；workbench/obligations.js提供有限期限与补救关联投影。",
    "business": "业务和工作台有明确violation依赖；补救履行不自动消除历史违反，未自动生成所有法律补救责任。",
    "tests": [
      "tests/conditional.test.js",
      "tests/workbench.test.js",
      "tests/obligations.test.js",
      "tests/labor-pilots.test.js"
    ],
    "nextStep": "将已审核的真实补救条件与生命周期关联，保持救济选择和例外可见。"
  },
  {
    "id": "D04",
    "name": "偏好道义语义与规范优先序",
    "tag": "已实现有限排序、显式优先与独立加权聚合",
    "formula": "条件义务示意：选定条件域中的所有最优世界满足 φ；须先定义优序及最优世界存在性",
    "scope": "真实规则研究组的优先候选保持PENDING；模型评分不能决定法律位阶。",
    "note": "条件模块采用分层集合包含优选；工作台按已审核优先关系处理同范围冲突。没有加权和、阈值或leximax求解器。 logics/weighted.js另提供权重求和、逐层字典序、最大权重三种聚合策略；适用性未知时枚举补全，结论不唯一则标为待定。 真实规则研究组的优先候选保持PENDING；模型评分不能决定法律位阶。",
    "references": [
      {
        "id": "Parent2014",
        "title": "Parent, Xavier. 2014. Maximality vs. Optimality in Dyadic Deontic Logic: Completeness Results for Systems in Hansson’s Tradition. Journal of Philosophical Logic 43(6): 1101–1128.",
        "url": "https://doi.org/10.1007/s10992-013-9308-0"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      }
    ],
    "background": "世界偏好、规范优先和加权决策是不同机制；PDL缩写也常用于命题动态逻辑。",
    "module": "条件模块采用分层集合包含优选；工作台按已审核优先关系处理同范围冲突。没有加权和、阈值或leximax求解器。 logics/weighted.js另提供权重求和、逐层字典序、最大权重三种聚合策略；适用性未知时枚举补全，结论不唯一则标为待定。",
    "business": "真实规则研究组的优先候选保持PENDING；模型评分不能决定法律位阶。",
    "tests": [
      "tests/conditional.test.js",
      "tests/workbench.test.js",
      "tests/labor-pilots.test.js",
      "tests/logics.test.js"
    ],
    "nextStep": "先补齐同一行为映射和法律优先依据；权重仅作为另立的敏感性实验。"
  },
  {
    "id": "D05",
    "name": "道义—认知交叉（Epistemic-Deontic）",
    "tag": "已实现独立认知—道义有限模型",
    "formula": "K_aφ→φ（事实性知识系统）；K_aφ 与 O(φ→ψ) 一般不足以推出 Oψ",
    "scope": "未接入案件分析；“系统材料缺失”不等于任何主体不知道；KD中的K公理不是知识算子。",
    "note": "logics/epistemic.js：每个主体S5知识K[a]（划分）、KD45信念B[a]、公共知识CK，与KD道义O/P/F共用有限模型求值，输出见证世界。 未接入案件分析；“系统材料缺失”不等于任何主体不知道；KD中的K公理不是知识算子。",
    "references": [
      {
        "id": "SEP-Epistemic",
        "title": "Stanford Encyclopedia of Philosophy. Epistemic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-epistemic/"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      },
      {
        "id": "FHMV1995",
        "title": "Fagin, Halpern, Moses, Vardi. 1995. Reasoning About Knowledge. MIT Press.",
        "url": "https://mitpress.mit.edu/9780262562003/"
      }
    ],
    "background": "知识K_aφ与系统是否掌握材料不同；K与O的交互需要独立公理。",
    "module": "logics/epistemic.js：每个主体S5知识K[a]（划分）、KD45信念B[a]、公共知识CK，与KD道义O/P/F共用有限模型求值，输出见证世界。",
    "business": "未接入案件分析；“系统材料缺失”不等于任何主体不知道；KD中的K公理不是知识算子。",
    "tests": [
      "tests/logics.test.js"
    ],
    "nextStep": "选定“应知/明知”类劳动规则，审核知情状态如何由证据形成。"
  },
  {
    "id": "D06",
    "name": "道义博弈逻辑（Deontic Game Logic）",
    "tag": "已实现独立有限博弈求解",
    "formula": "∃σ_a∀σ_−a φ 表示保证结果的策略能力，不能单独定义义务",
    "scope": "未接入案件分析；收益与制裁为人工输入，均衡不等于法律义务。",
    "note": "logics/game.js：完全信息扩展式博弈求全部纯策略子博弈完美均衡（保留同分），标准式求纯纳什均衡与占优义务（dominance ought）；规范可附制裁。 未接入案件分析；收益与制裁为人工输入，均衡不等于法律义务。",
    "references": [
      {
        "id": "Tamminga2013",
        "title": "Tamminga, Allard. 2013. Deontic Logic for Strategic Games. Erkenntnis 78(1): 183–200.",
        "url": "https://doi.org/10.1007/s10670-011-9349-0"
      },
      {
        "id": "SEP-Action",
        "title": "Stanford Encyclopedia of Philosophy. The Logic of Action.",
        "url": "https://plato.stanford.edu/entries/logic-action/"
      },
      {
        "id": "SEP-Game",
        "title": "Stanford Encyclopedia of Philosophy. Game Theory.",
        "url": "https://plato.stanford.edu/entries/game-theory/"
      },
      {
        "id": "Horty2001",
        "title": "Horty, John F. 2001. Agency and Deontic Logic. Oxford University Press.",
        "url": "https://doi.org/10.1093/0195134613.001.0001"
      }
    ],
    "background": "存在保证结果的策略表达能力；从能够推出应当需要额外规范语义。",
    "module": "logics/game.js：完全信息扩展式博弈求全部纯策略子博弈完美均衡（保留同分），标准式求纯纳什均衡与占优义务（dominance ought）；规范可附制裁。",
    "business": "未接入案件分析；收益与制裁为人工输入，均衡不等于法律义务。",
    "tests": [
      "tests/logics.test.js"
    ],
    "nextStep": "收益来源需另行论证；研究制裁额度与合规均衡的关系。"
  },
  {
    "id": "D07",
    "name": "道义动态逻辑（Dynamic Deontic Logic, DDL）",
    "tag": "已实现独立PDL与Meyer归约",
    "formula": "⟨α⟩φ≡¬[α]¬φ；[α](φ∧ψ)↔([α]φ∧[α]ψ)",
    "scope": "未接入案件分析；转移系统是输入，不由劳动规则自动生成。",
    "note": "logics/dynamic.js：在有限标记转移系统上计算[α]、⟨α⟩，程序含顺序、选择、迭代、测试；OA/FA/PA按Meyer 1988以违规命题归约。 未接入案件分析；转移系统是输入，不由劳动规则自动生成。",
    "references": [
      {
        "id": "SEP-Dynamic",
        "title": "Stanford Encyclopedia of Philosophy. Propositional Dynamic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-dynamic/"
      },
      {
        "id": "Anderson1958",
        "title": "Anderson, Alan Ross. 1958. A Reduction of Deontic Logic to Alethic Modal Logic. Mind 67(265): 100–103.",
        "url": "https://doi.org/10.1093/mind/LXVII.265.100"
      },
      {
        "id": "Meyer1988",
        "title": "Meyer, J.-J. Ch. 1988. A Different Approach to Deontic Logic. Notre Dame Journal of Formal Logic 29(1): 109–136.",
        "url": "https://doi.org/10.1305/ndjfl/1093637776"
      }
    ],
    "background": "[α]φ与⟨α⟩φ量化行动可达状态；不等同于个体量词∀x与∃x。",
    "module": "logics/dynamic.js：在有限标记转移系统上计算[α]、⟨α⟩，程序含顺序、选择、迭代、测试；OA/FA/PA按Meyer 1988以违规命题归约。",
    "business": "未接入案件分析；转移系统是输入，不由劳动规则自动生成。",
    "tests": [
      "tests/logics.test.js",
      "tests/obligations.test.js"
    ],
    "nextStep": "把付款、补付、解除等事件映射为原子行动并审核。"
  },
  {
    "id": "D08",
    "name": "道义模糊逻辑（Fuzzy Deontic）",
    "tag": "已实现独立分级道义模型",
    "formula": "x⊗_Ły=max(0,x+y−1)；x→_Ły=min(1,1−x+y)；格合取 x∧y=min(x,y)",
    "scope": "未接入案件分析；程度为人工输入，不来自三值事实。",
    "note": "logics/fuzzy.js：Gödel、Łukasiewicz、乘积三种t-范数下的分级O/P，程度为整数分子/分母；缺失程度报错，不当作0.5。 未接入案件分析；程度为人工输入，不来自三值事实。",
    "references": [
      {
        "id": "SEP-Fuzzy",
        "title": "Stanford Encyclopedia of Philosophy. Fuzzy Logic.",
        "url": "https://plato.stanford.edu/entries/logic-fuzzy/"
      },
      {
        "id": "Zadeh1965",
        "title": "Zadeh, Lotfi A. 1965. Fuzzy Sets. Information and Control 8(3): 338–353.",
        "url": "https://doi.org/10.1016/S0019-9958(65)90241-X"
      },
      {
        "id": "Hajek1998",
        "title": "Hájek, Petr. 1998. Metamathematics of Fuzzy Logic. Kluwer.",
        "url": "https://doi.org/10.1007/978-94-011-5300-3"
      }
    ],
    "background": "程度、概率与事实未知是不同语义；Łukasiewicz强合取不等同于格合取。",
    "module": "logics/fuzzy.js：Gödel、Łukasiewicz、乘积三种t-范数下的分级O/P，程度为整数分子/分母；缺失程度报错，不当作0.5。",
    "business": "未接入案件分析；程度为人工输入，不来自三值事实。",
    "tests": [
      "tests/logics.test.js"
    ],
    "nextStep": "说明程度的法律含义（如合理程度、履行比例）后再接入。"
  },
  {
    "id": "D09",
    "name": "道义时态逻辑（Temporal Deontic）",
    "tag": "已实现期限生命周期与独立LTLf演算",
    "formula": "当前履行与历史违反分别记录；未实现X/G/F/U全时态算子",
    "scope": "工资时间线与研究生命周期分别运行；没有付款记录不自动证明未履行。",
    "note": "workbench/obligations.js支持固定金额期限义务、履行/逾期、终止、纠错/撤回和补救关联；无完整时态算子。 logics/temporal.js提供有限轨迹LTLf（X、WX、F、G、U、W与过去算子Y、ONCE、H、S）及期限义务OD；可从完整账本生成轨迹，结论与obligations.js交叉核对。 工资时间线与研究生命周期分别运行；没有付款记录不自动证明未履行。",
    "references": [
      {
        "id": "SEP-Temporal",
        "title": "Stanford Encyclopedia of Philosophy. Temporal Logic.",
        "url": "https://plato.stanford.edu/entries/logic-temporal/"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      },
      {
        "id": "DeGiacomoVardi2013",
        "title": "De Giacomo, Vardi. 2013. Linear Temporal Logic and Linear Dynamic Logic on Finite Traces. IJCAI.",
        "url": "https://www.ijcai.org/Proceedings/13/Papers/132.pdf"
      }
    ],
    "background": "时态模态X/G/F/U与事件账簿不同；历史违反与当前履行分别评价。",
    "module": "workbench/obligations.js支持固定金额期限义务、履行/逾期、终止、纠错/撤回和补救关联；无完整时态算子。 logics/temporal.js提供有限轨迹LTLf（X、WX、F、G、U、W与过去算子Y、ONCE、H、S）及期限义务OD；可从完整账本生成轨迹，结论与obligations.js交叉核对。",
    "business": "工资时间线与研究生命周期分别运行；没有付款记录不自动证明未履行。",
    "tests": [
      "tests/integration.test.js",
      "tests/obligations.test.js",
      "tests/logics.test.js"
    ],
    "nextStep": "经审核后接入到期、补付及补救条件，保留发生时与记录时。"
  },
  {
    "id": "D10",
    "name": "霍费尔德法律本体论（Hohfeld）",
    "tag": "已实现八概念相关项与对立检查",
    "formula": "CLAIM(a,b,φ)↔DUTY(b,a,φ)；LIBERTY(a,b,φ)↔NO_CLAIM(b,a,¬φ)；POWER(a,b,Δ)↔LIABILITY(b,a,Δ)；IMMUNITY(a,b,Δ)↔DISABILITY(b,a,Δ)；对立项：CLAIM/NO_CLAIM，POWER/DISABILITY",
    "scope": "研究关系不自动获批，未接入案件引擎；AUTH不能直接转为霍费尔德权力；权力只记录可引起的变化，没有执行法律关系变化的操作。",
    "note": "workbench/relations.js展开八概念的四对相关项，并在完全相同的主体、相对方、行为、极性与范围下报告对立项冲突（未决，不爆炸）；保留来源和审核。 研究关系不自动获批，未接入案件引擎；AUTH不能直接转为霍费尔德权力；权力只记录可引起的变化，没有执行法律关系变化的操作。",
    "references": [
      {
        "id": "Hohfeld1913",
        "title": "Hohfeld, Wesley Newcomb. 1913. Some Fundamental Legal Conceptions as Applied in Judicial Reasoning. Yale Law Journal 23(1): 16–59. 另见 1919 年同名论文集。",
        "url": "https://plato.stanford.edu/entries/rights/"
      },
      {
        "id": "SEP-Rights",
        "title": "Stanford Encyclopedia of Philosophy. Rights.",
        "url": "https://plato.stanford.edu/entries/rights/"
      }
    ],
    "background": "霍费尔德八概念区分请求权/义务、自由/无请求权、权力/责任、豁免/无权力。",
    "module": "workbench/relations.js展开八概念的四对相关项，并在完全相同的主体、相对方、行为、极性与范围下报告对立项冲突（未决，不爆炸）；保留来源和审核。",
    "business": "研究关系不自动获批，未接入案件引擎；AUTH不能直接转为霍费尔德权力；权力只记录可引起的变化，没有执行法律关系变化的操作。",
    "tests": [
      "tests/relations.test.js"
    ],
    "nextStep": "为权力增加受审核的法律关系变化操作（行使权力后产生、消灭哪些关系），再与期限义务和规则链对接。"
  },
  {
    "id": "D11",
    "name": "STIT 主事性逻辑（Seeing-To-It-That）",
    "tag": "未实现STIT",
    "formula": "[a stit:φ]→φ（成功性，限相应 STIT 语义）；无行为保证不自动推出无赔偿义务",
    "scope": "bearer与action字段只是承担者与行为身份，不是主事性模型。",
    "note": "没有选择分割、历史分支与STIT算子。 bearer与action字段只是承担者与行为身份，不是主事性模型。",
    "references": [
      {
        "id": "Belnap2001",
        "title": "Belnap, Nuel, Michael Perloff, and Ming Xu. 2001. Facing the Future. Oxford University Press.",
        "url": "https://plato.stanford.edu/entries/logic-action/#Bib"
      },
      {
        "id": "Horty2001",
        "title": "Horty, John F. 2001. Agency and Deontic Logic. Oxford University Press.",
        "url": "https://doi.org/10.1093/0195134613.001.0001"
      },
      {
        "id": "SEP-Action",
        "title": "Stanford Encyclopedia of Philosophy. The Logic of Action.",
        "url": "https://plato.stanford.edu/entries/logic-action/"
      }
    ],
    "background": "STIT需要行动者选择结构及其控制结果的语义。",
    "module": "没有选择分割、历史分支与STIT算子。",
    "business": "bearer与action字段只是承担者与行为身份，不是主事性模型。",
    "tests": [],
    "nextStep": "先界定谁能控制何种行为，再选择有限分支模型。"
  },
  {
    "id": "D12",
    "name": "可废止逻辑（Defeasible Logic）",
    "tag": "已实现有限可废止处理",
    "formula": "C_r=T 且某 E_r=T ⇒ 本规则状态 DEFEATED；不由此推出 ¬N_r",
    "scope": "支持全量重算后对照；不声称实现任意可废止演算或循环规则闭包。",
    "note": "业务有显式例外；工作台有有限无环依赖、扎根冲突处理和整链检查。 支持全量重算后对照；不声称实现任意可废止演算或循环规则闭包。",
    "references": [
      {
        "id": "Nute1994",
        "title": "Nute, Donald. 1994. Defeasible Logics. In Handbook of Logic in Artificial Intelligence and Logic Programming, Vol. 3. Oxford University Press, 353–395.",
        "url": "https://plato.stanford.edu/entries/logic-nonmonotonic/#Bib"
      },
      {
        "id": "Antoniou2001",
        "title": "Antoniou, Grigoris, David Billington, Guido Governatori, and Michael J. Maher. 2001. Representation Results for Defeasible Logic. ACM Transactions on Computational Logic 2(2): 255–287.",
        "url": "https://doi.org/10.1145/371316.371517"
      },
      {
        "id": "SEP-Nonmonotonic",
        "title": "Stanford Encyclopedia of Philosophy. Non-monotonic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-nonmonotonic/"
      }
    ],
    "background": "例外、优先与可撤回后承存在多种体系，需明确选定语义。",
    "module": "业务有显式例外；工作台有有限无环依赖、扎根冲突处理和整链检查。",
    "business": "支持全量重算后对照；不声称实现任意可废止演算或循环规则闭包。",
    "tests": [
      "tests/workbench.test.js",
      "tests/conditional.test.js",
      "tests/labor-pilots.test.js"
    ],
    "nextStep": "加强真实规则范围、竞争项选择、优先依据与撤回测试。"
  },
  {
    "id": "D13",
    "name": "输入/输出逻辑（Input/Output Logic）",
    "tag": "未实现输入输出逻辑演算",
    "formula": "SI: (a,b) ⇒ (a∧c,b)；WO: (a,b), b⊢c ⇒ (a,c)；含 WO 时可得 (a,b∨c)",
    "scope": "现有类型依赖不是输入/输出逻辑的自动实现。",
    "note": "未实现out1/out2/out3/out4及对应规则体系。 现有类型依赖不是输入/输出逻辑的自动实现。",
    "references": [
      {
        "id": "Makinson2000",
        "title": "Makinson, David, and Leendert van der Torre. 2000. Input/Output Logics. Journal of Philosophical Logic 29(4): 383–408.",
        "url": "https://doi.org/10.1023/A:1004748624537"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      }
    ],
    "background": "Makinson与van der Torre输入/输出逻辑研究规范输入到输出的不同闭包算子。",
    "module": "未实现out1/out2/out3/out4及对应规则体系。",
    "business": "现有类型依赖不是输入/输出逻辑的自动实现。",
    "tests": [],
    "nextStep": "若实践任务需要，以一个out算子做独立基线比较。"
  },
  {
    "id": "D14",
    "name": "次协调道义逻辑（Paraconsistent Deontic）",
    "tag": "已实现双向证据记录但非次协调逻辑",
    "formula": "p,¬p ⊬ q（非爆炸的刻画）；K3 的 U 不表示同时支持 p 与 ¬p",
    "scope": "没有LP/FDE的完整连接词或道义次协调证明器；证据数目不投票消灭反证。",
    "note": "workbench/evidence-balance.js保存支持/反驳及NEITHER/SUPPORTED/REFUTED/BOTH，冲突保守投影未知。 没有LP/FDE的完整连接词或道义次协调证明器；证据数目不投票消灭反证。",
    "references": [
      {
        "id": "SEP-Paraconsistent",
        "title": "Stanford Encyclopedia of Philosophy. Paraconsistent Logic.",
        "url": "https://plato.stanford.edu/entries/logic-paraconsistent/"
      },
      {
        "id": "SEP-MV",
        "title": "Stanford Encyclopedia of Philosophy. Many-Valued Logic.",
        "url": "https://plato.stanford.edu/entries/logic-manyvalued/"
      }
    ],
    "background": "次协调逻辑限制矛盾爆炸；双向证据状态与形式真值演算须分开。",
    "module": "workbench/evidence-balance.js保存支持/反驳及NEITHER/SUPPORTED/REFUTED/BOTH，冲突保守投影未知。",
    "business": "没有LP/FDE的完整连接词或道义次协调证明器；证据数目不投票消灭反证。",
    "tests": [
      "tests/evidence-balance.test.js"
    ],
    "nextStep": "先复核矛盾来源和范围；如需FDE另定义推理规则，不把BOTH当作已证实真假同真。"
  },
  {
    "id": "D15",
    "name": "语境道义逻辑（CDL, Contextual）",
    "tag": "已实现语境治理而非CDL演算",
    "formula": "O(φ/ψ,c) 为项目可选记法；语境更新不预设单调性",
    "scope": "范围变化导致重新计算；语境更新不假定单调增加义务。",
    "note": "现有法域、日期、主体、期间及版本选择；没有三参数O(B|A,c)独立求解器。 范围变化导致重新计算；语境更新不假定单调增加义务。",
    "references": [
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      }
    ],
    "background": "本项目CDL指Contextual的拟议语境条件记法，尚未指定唯一公理系统。",
    "module": "现有法域、日期、主体、期间及版本选择；没有三参数O(B|A,c)独立求解器。",
    "business": "范围变化导致重新计算；语境更新不假定单调增加义务。",
    "tests": [
      "tests/integration.test.js",
      "tests/workbench-review.test.js"
    ],
    "nextStep": "完善专业审核与过渡规定，再明确语境组合规则。"
  },
  {
    "id": "D16",
    "name": "行为道义逻辑（ADL, Act-based）",
    "tag": "已实现行为身份而非行动逻辑",
    "formula": "F_aα ≝ O_a¬E(a,α)（可选定义；需固定行动与命题类型）",
    "scope": "不会因都涉及加班就把支付义务与安排禁令当成矛盾。",
    "note": "actionKey标记冲突范围；真实规则试点区分解除、终止、支付和超时安排。 不会因都涉及加班就把支付义务与安排禁令当成矛盾。",
    "references": [
      {
        "id": "vonWright1963",
        "title": "von Wright, Georg Henrik. 1963. Norm and Action: A Logical Enquiry. New York: Humanities Press.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/#Bib"
      },
      {
        "id": "SEP-Action",
        "title": "Stanford Encyclopedia of Philosophy. The Logic of Action.",
        "url": "https://plato.stanford.edu/entries/logic-action/"
      }
    ],
    "background": "行动类型、行动发生与行为后果需要不同类型；不能用字符串替代行动代数。",
    "module": "actionKey标记冲突范围；真实规则试点区分解除、终止、支付和超时安排。",
    "business": "不会因都涉及加班就把支付义务与安排禁令当成矛盾。",
    "tests": [
      "tests/labor-pilots.test.js",
      "tests/workbench.test.js"
    ],
    "nextStep": "维护经审核的行为同一性与分解表，再研究行动组合。"
  },
  {
    "id": "D17",
    "name": "信念—道义交叉（BDL）",
    "tag": "已实现信念算子但未建立信念—义务交互",
    "formula": "B_aφ 不一般蕴涵 φ；法律上的故意需要额外主观与客观要件",
    "scope": "未接入案件分析。",
    "note": "logics/epistemic.js含KD45信念B[a]，可与O在同一模型中求值；尚无信念触发义务的交互公理或BDI结构。 未接入案件分析。",
    "references": [
      {
        "id": "SEP-Epistemic",
        "title": "Stanford Encyclopedia of Philosophy. Epistemic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-epistemic/"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      }
    ],
    "background": "B_aφ不蕴涵φ；故意、过失、知识和意图需额外法律及认知条件。",
    "module": "logics/epistemic.js含KD45信念B[a]，可与O在同一模型中求值；尚无信念触发义务的交互公理或BDI结构。",
    "business": "未接入案件分析。",
    "tests": [
      "tests/logics.test.js"
    ],
    "nextStep": "确定是否需要“相信即应当”类交互，并用fusion.js检查坍塌。"
  },
  {
    "id": "D18",
    "name": "量化动态道义逻辑（Quantified DDL）",
    "tag": "未实现量化动态道义逻辑",
    "formula": "∀x[α]φ 与 [α]∀xφ 的等价需域、绑定及程序依赖等条件；此处不作无条件交换",
    "scope": "遍历多个案件或主体不是量词语义。",
    "note": "无一阶变量域、量词、程序及道义混合求值器。 遍历多个案件或主体不是量词语义。",
    "references": [
      {
        "id": "SEP-Dynamic",
        "title": "Stanford Encyclopedia of Philosophy. Propositional Dynamic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-dynamic/"
      },
      {
        "id": "SEP-Types",
        "title": "Stanford Encyclopedia of Philosophy. Type Theory.",
        "url": "https://plato.stanford.edu/entries/type-theory/"
      },
      {
        "id": "SEP-Combining",
        "title": "Stanford Encyclopedia of Philosophy. Combining Logics.",
        "url": "https://plato.stanford.edu/entries/logic-combining/"
      }
    ],
    "background": "量词与动态/义务算子交换依赖域、变量绑定和程序条件。",
    "module": "无一阶变量域、量词、程序及道义混合求值器。",
    "business": "遍历多个案件或主体不是量词语义。",
    "tests": [],
    "nextStep": "先考虑有限显式主体实例化，避免一开始采用任意量化系统。"
  },
  {
    "id": "D19",
    "name": "多主体可废止道义逻辑（MADL）",
    "tag": "未实现多主体道义演算",
    "formula": "O_Gφ 不一般等于 ∧_{a∈G} O_aφ_a；任务分解需要独立假设",
    "scope": "关系片段可记录双方，但不自动分配连带责任或推断集体义务。",
    "note": "仅有主体、承担者和范围隔离；无群体策略/规范合并演算。 关系片段可记录双方，但不自动分配连带责任或推断集体义务。",
    "references": [
      {
        "id": "Horty2001",
        "title": "Horty, John F. 2001. Agency and Deontic Logic. Oxford University Press.",
        "url": "https://doi.org/10.1093/0195134613.001.0001"
      },
      {
        "id": "SEP-Action",
        "title": "Stanford Encyclopedia of Philosophy. The Logic of Action.",
        "url": "https://plato.stanford.edu/entries/logic-action/"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      }
    ],
    "background": "群体义务不一般等于成员义务合取，分工需要另外假设。",
    "module": "仅有主体、承担者和范围隔离；无群体策略/规范合并演算。",
    "business": "关系片段可记录双方，但不自动分配连带责任或推断集体义务。",
    "tests": [
      "tests/relations.test.js"
    ],
    "nextStep": "先精确定义派遣、用工等有限主体角色和责任来源。"
  },
  {
    "id": "D20",
    "name": "道义高阶逻辑（Deontic HOL）",
    "tag": "未实现HOL嵌入",
    "formula": "λx.F(x) 为谓词；O 的输入类型须另定义。Oφ 不推出事实 φ",
    "scope": "规则数据结构与嵌套O不构成高阶逻辑。",
    "note": "没有HOL翻译器或证明助手输出。 规则数据结构与嵌套O不构成高阶逻辑。",
    "references": [
      {
        "id": "Church1940",
        "title": "Church, Alonzo. 1940. A Formulation of the Simple Theory of Types. Journal of Symbolic Logic 5: 56–68.",
        "url": "https://plato.stanford.edu/entries/type-theory/#Bib"
      },
      {
        "id": "SEP-Types",
        "title": "Stanford Encyclopedia of Philosophy. Type Theory.",
        "url": "https://plato.stanford.edu/entries/type-theory/"
      }
    ],
    "background": "高阶嵌入需命题/个体/谓词类型、λ项及相应证明语义。",
    "module": "没有HOL翻译器或证明助手输出。",
    "business": "规则数据结构与嵌套O不构成高阶逻辑。",
    "tests": [],
    "nextStep": "先把已有有限求解器性质形式化，再决定是否用HOL浅嵌入复核。"
  },
  {
    "id": "D21",
    "name": "道义自指悖论消解",
    "tag": "未实现一般自指消解",
    "formula": "O(Oφ) 是模态迭代，本身不等于自指；分层设计需类型与语法检查",
    "scope": "规则更新记录不证明任意自指规范一致。",
    "note": "依赖环与优先环检查只是有限图约束，不是悖论消解演算。 规则更新记录不证明任意自指规范一致。",
    "references": [
      {
        "id": "SEP-Types",
        "title": "Stanford Encyclopedia of Philosophy. Type Theory.",
        "url": "https://plato.stanford.edu/entries/type-theory/"
      },
      {
        "id": "SEP-Wittgenstein",
        "title": "Stanford Encyclopedia of Philosophy. Ludwig Wittgenstein.",
        "url": "https://plato.stanford.edu/entries/wittgenstein/"
      }
    ],
    "background": "模态迭代不是自指；类型分层必须在语言与推导规则中明确。",
    "module": "依赖环与优先环检查只是有限图约束，不是悖论消解演算。",
    "business": "规则更新记录不证明任意自指规范一致。",
    "tests": [
      "tests/workbench.test.js"
    ],
    "nextStep": "先拒绝未定义的自引用输入；若研究自指需选定语法和语义。"
  },
  {
    "id": "D22",
    "name": "道义证明—认知交叉（JEM）",
    "tag": "已实现执行证书但非JEM",
    "formula": "t:φ 表示证成项支持φ；执行证书不自动实现J/K/O交互逻辑",
    "scope": "证书核验声明输入和规则下的计算，不证明材料真实、法律正确或主体知道。",
    "note": "KD、条件、业务及工作台有检查器；没有证成项代数和J/K/O交互求解器。 证书核验声明输入和规则下的计算，不证明材料真实、法律正确或主体知道。",
    "references": [
      {
        "id": "Artemov2001",
        "title": "Artemov, Sergei. 2001. Explicit Provability and Constructive Semantics. Bulletin of Symbolic Logic 7(1): 1–36.",
        "url": "https://plato.stanford.edu/entries/logic-justification/#Bib"
      },
      {
        "id": "SEP-Justification",
        "title": "Stanford Encyclopedia of Philosophy. Justification Logic.",
        "url": "https://plato.stanford.edu/entries/logic-justification/"
      }
    ],
    "background": "证成逻辑使用t:φ与证成项运算，不能定义为简单的有依据且真。",
    "module": "KD、条件、业务及工作台有检查器；没有证成项代数和J/K/O交互求解器。",
    "business": "证书核验声明输入和规则下的计算，不证明材料真实、法律正确或主体知道。",
    "tests": [
      "tests/modal.test.js",
      "tests/conditional.test.js",
      "tests/integration.test.js",
      "tests/workbench.test.js"
    ],
    "nextStep": "继续缩小可信检查基础；如需JEM先明确出处和目标演算。"
  },
  {
    "id": "D23",
    "name": "反义务博弈的子博弈完美均衡",
    "tag": "已实现有限扩展式子博弈完美均衡",
    "formula": "∀a∀σ′_a: u_a(σ*)≥u_a(σ′_a,σ*₋ₐ)；子博弈完美要求每个子博弈上的限制均为纳什均衡",
    "scope": "未接入案件分析；示例为合成欠薪博弈。",
    "note": "logics/game.js：逆向归纳求全部纯SPE，比较有无制裁时合规是否成为均衡。 未接入案件分析；示例为合成欠薪博弈。",
    "references": [
      {
        "id": "Nash1950",
        "title": "Nash, John. 1950. Equilibrium Points in n-Person Games. Proceedings of the National Academy of Sciences 36: 48–49.",
        "url": "https://plato.stanford.edu/entries/game-theory/#Bib"
      },
      {
        "id": "SEP-Game",
        "title": "Stanford Encyclopedia of Philosophy. Game Theory.",
        "url": "https://plato.stanford.edu/entries/game-theory/"
      }
    ],
    "background": "子博弈完美要求每个子博弈含整个博弈都满足均衡条件。",
    "module": "logics/game.js：逆向归纳求全部纯SPE，比较有无制裁时合规是否成为均衡。",
    "business": "未接入案件分析；示例为合成欠薪博弈。",
    "tests": [
      "tests/logics.test.js"
    ],
    "nextStep": "论证收益来源，扩展到不完全信息。"
  },
  {
    "id": "D24",
    "name": "超序列道义演算（Hypersequent）",
    "tag": "未实现超序列演算",
    "formula": "Γ₁⊢Δ₁ | … | Γ_n⊢Δ_n（超序列结构）；模态引入规则须指明具体演算及侧条件",
    "scope": "推导图多个节点不等于hypersequent。",
    "note": "KD使用闭合表，未实现超序列规则。 推导图多个节点不等于hypersequent。",
    "references": [
      {
        "id": "Avron1991",
        "title": "Avron, Arnon. 1991. Hypersequents, Logical Consequence and Intermediate Logics for Concurrency. Annals of Mathematics and Artificial Intelligence 4: 225–248.",
        "url": "https://doi.org/10.1007/BF01531058"
      },
      {
        "id": "Gentzen1935",
        "title": "Gentzen, Gerhard. 1935. Untersuchungen über das logische Schließen. I. Mathematische Zeitschrift 39: 176–210.",
        "url": "https://doi.org/10.1007/BF01201353"
      }
    ],
    "background": "Hypersequent包含多个序列及外部结构规则，需要指定演算及侧条件。",
    "module": "KD使用闭合表，未实现超序列规则。",
    "business": "推导图多个节点不等于hypersequent。",
    "tests": [],
    "nextStep": "作为独立证明论基线，先选一个逻辑及成熟演算。"
  },
  {
    "id": "D25",
    "name": "自适应道义逻辑（Adaptive Logic）",
    "tag": "已实现更新对照但非自适应证明",
    "formula": "自适应后承由下限逻辑、异常集合及策略共同决定；标记不等于发现任意 Ab",
    "scope": "新证据能使结论撤回，不能因此宣称完整自适应逻辑。",
    "note": "工作台完整重算并记录结论对照；有依赖图和历史，没有Batens式条件证明与异常策略。 新证据能使结论撤回，不能因此宣称完整自适应逻辑。",
    "references": [
      {
        "id": "SEP-Nonmonotonic",
        "title": "Stanford Encyclopedia of Philosophy. Non-monotonic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-nonmonotonic/"
      },
      {
        "id": "SEP-Paraconsistent",
        "title": "Stanford Encyclopedia of Philosophy. Paraconsistent Logic.",
        "url": "https://plato.stanford.edu/entries/logic-paraconsistent/"
      }
    ],
    "background": "自适应逻辑由下限逻辑、异常集合与标记策略共同定义。",
    "module": "工作台完整重算并记录结论对照；有依赖图和历史，没有Batens式条件证明与异常策略。",
    "business": "新证据能使结论撤回，不能因此宣称完整自适应逻辑。",
    "tests": [
      "tests/workbench.test.js",
      "tests/obligations.test.js",
      "tests/evidence-balance.test.js"
    ],
    "nextStep": "先评价撤回正确性；证明级增量更新作为后续性能和逻辑研究。"
  },
  {
    "id": "D26",
    "name": "反常识公式集（Deontic Paradoxes）",
    "tag": "已有部分悖论反例测试",
    "formula": "Ross: O(p)⊢O(p∨q)（SDL）；O¬(r∧h)⊬O¬h，反例理想世界 r=F,h=T；Forrester 分析需补足事实前提",
    "scope": "反例用于检验形式化选择，不直接证明法律规则正确。",
    "note": "KD和条件模块可检验其语言内的公式并给反模型；并非所有旧展示公式均有效。 反例用于检验形式化选择，不直接证明法律规则正确。",
    "references": [
      {
        "id": "Ross1941",
        "title": "Ross, Alf. 1941. Imperatives and Logic. Theoria 7(1): 53–71.",
        "url": "https://doi.org/10.1111/j.1755-2567.1941.tb00034.x"
      },
      {
        "id": "Forrester1984",
        "title": "Forrester, James William. 1984. Gentle Murder, or the Adverbial Samaritan. Journal of Philosophy 81(4): 193–197.",
        "url": "https://doi.org/10.2307/2026120"
      },
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      }
    ],
    "background": "Ross、Chisholm、Forrester是问题与测试家族，不是统一的反常识演算。",
    "module": "KD和条件模块可检验其语言内的公式并给反模型；并非所有旧展示公式均有效。",
    "business": "反例用于检验形式化选择，不直接证明法律规则正确。",
    "tests": [
      "tests/modal.test.js",
      "tests/conditional.test.js"
    ],
    "nextStep": "补充完整前提和预期结果，维护模型可复核的悖论测试集。"
  },
  {
    "id": "D27",
    "name": "超赋值道义逻辑（Supervaluationist）",
    "tag": "未实现超赋值道义逻辑",
    "formula": "超真：所有可容许精化下为真；超假：所有可容许精化下为假；其余未定",
    "scope": "多个地区规则选择不是自动的超赋值推理。",
    "note": "没有合法精化集合和逐精化道义检验器。 多个地区规则选择不是自动的超赋值推理。",
    "references": [
      {
        "id": "Fine1975",
        "title": "Fine, Kit. 1975. Vagueness, Truth and Logic. Synthese 30(3–4): 265–300.",
        "url": "https://doi.org/10.1007/BF00485047"
      },
      {
        "id": "SEP-MV",
        "title": "Stanford Encyclopedia of Philosophy. Many-Valued Logic.",
        "url": "https://plato.stanford.edu/entries/logic-manyvalued/"
      },
      {
        "id": "SEP-Vagueness",
        "title": "Stanford Encyclopedia of Philosophy. Vagueness.",
        "url": "https://plato.stanford.edu/entries/vagueness/"
      }
    ],
    "background": "超真要求所有可容许精化成立；模糊度和K3未知不是同一语义。",
    "module": "没有合法精化集合和逐精化道义检验器。",
    "business": "多个地区规则选择不是自动的超赋值推理。",
    "tests": [],
    "nextStep": "先请专业人员给出有依据的解释集合，避免编造30/60/90日精化。"
  },
  {
    "id": "D28",
    "name": "多模态融合极限表达",
    "tag": "已实现组合坍塌检查与融合可判定性分类",
    "formula": "模态融合的保性质结果有适用前提；框架乘积、交互公理和软件模块化是不同概念",
    "scope": "未接入案件分析；有限搜索无反例不等于证明。",
    "note": "logics/fusion.js：为每个算子选公理并加交互公理，小框架穷举给出反模型（证明未坍塌）或语法推导（证明T+逆T、D+逆T坍塌）；可判定性按文献分类，不由程序计算。 未接入案件分析；有限搜索无反例不等于证明。",
    "references": [
      {
        "id": "SEP-Combining",
        "title": "Stanford Encyclopedia of Philosophy. Combining Logics.",
        "url": "https://plato.stanford.edu/entries/logic-combining/"
      },
      {
        "id": "SEP-Modal",
        "title": "Stanford Encyclopedia of Philosophy. Modal Logic.",
        "url": "https://plato.stanford.edu/entries/logic-modal/"
      },
      {
        "id": "KrachtWolter1991",
        "title": "Kracht, Wolter. 1991. Properties of Independently Axiomatizable Bimodal Logics. JSL 56(4).",
        "url": "https://doi.org/10.2307/2275054"
      },
      {
        "id": "FineSchurz1996",
        "title": "Fine, Schurz. 1996. Transfer Theorems for Multimodal Logics. In Logic and Reality.",
        "url": ""
      },
      {
        "id": "HHK2002",
        "title": "Hirsch, Hodkinson, Kurucz. 2002. On Modal Logics Between K×K×K and S5×S5×S5. JSL 67(1).",
        "url": "https://doi.org/10.2178/jsl/1190150041"
      }
    ],
    "background": "融合、框架乘积、交互公理和软件模块化不同；性质不能自动跨层继承。",
    "module": "logics/fusion.js：为每个算子选公理并加交互公理，小框架穷举给出反模型（证明未坍塌）或语法推导（证明T+逆T、D+逆T坍塌）；可判定性按文献分类，不由程序计算。",
    "business": "未接入案件分析；有限搜索无反例不等于证明。",
    "tests": [
      "tests/logics.test.js"
    ],
    "nextStep": "把epistemic、dynamic、temporal模块实际组合时先通过本检查。"
  },
  {
    "id": "D29",
    "name": "元规范自指道义公式",
    "tag": "可算嵌套O但未实现元规范",
    "formula": "O(Oφ) 是可在KD中求值的嵌套模态；不等于自指或高阶量化",
    "scope": "版本审核是工程治理，不等于元规范逻辑判断。",
    "note": "KD支持有限O/P嵌套；没有规范命名、自引用与合法性元规则语言。 版本审核是工程治理，不等于元规范逻辑判断。",
    "references": [
      {
        "id": "SEP-DL",
        "title": "Stanford Encyclopedia of Philosophy. Deontic Logic.",
        "url": "https://plato.stanford.edu/entries/logic-deontic/"
      },
      {
        "id": "SEP-Modal",
        "title": "Stanford Encyclopedia of Philosophy. Modal Logic.",
        "url": "https://plato.stanford.edu/entries/logic-modal/"
      }
    ],
    "background": "O(Oφ)是对象语言中的模态迭代，不自动是二阶逻辑或自指。",
    "module": "KD支持有限O/P嵌套；没有规范命名、自引用与合法性元规则语言。",
    "business": "版本审核是工程治理，不等于元规范逻辑判断。",
    "tests": [
      "tests/modal.test.js"
    ],
    "nextStep": "先明确规范对象与审核规则类型，保持与对象层判断分开。"
  },
  {
    "id": "D30",
    "name": "超推导道义演算（Superdeduction）",
    "tag": "已实现有限依赖闭包但非超推导",
    "formula": "有限类型依赖闭包已实现；Superdeduction的公理编译与一般证明搜索尚未实现",
    "scope": "新增例外可以撤回结论；不能照搬单调后承保证。",
    "note": "工作台有有限无环依赖闭包及检查器；未实现Superdeduction编译或一般理论证明搜索。 新增例外可以撤回结论；不能照搬单调后承保证。",
    "references": [
      {
        "id": "Superdeduction2007",
        "title": "Brauner, Paul, Clément Houtmann, and Claude Kirchner. Superdeduction at Work. In Rewriting, Computation and Proof, 132–166. Springer. 通常标年 2007。",
        "url": "https://doi.org/10.1007/978-3-540-73147-4_7"
      },
      {
        "id": "Gentzen1935",
        "title": "Gentzen, Gerhard. 1935. Untersuchungen über das logische Schließen. I. Mathematische Zeitschrift 39: 176–210.",
        "url": "https://doi.org/10.1007/BF01201353"
      }
    ],
    "background": "Superdeduction研究将理论公理编译为推理规则，不能用φ**标记代替定义。",
    "module": "工作台有有限无环依赖闭包及检查器；未实现Superdeduction编译或一般理论证明搜索。",
    "business": "新增例外可以撤回结论；不能照搬单调后承保证。",
    "tests": [
      "tests/workbench.test.js",
      "tests/labor-pilots.test.js"
    ],
    "nextStep": "先完整检查真实规则链的选择与依赖，再研究理论编译。"
  }
];
