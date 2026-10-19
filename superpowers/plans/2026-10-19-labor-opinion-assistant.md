# Labor Opinion Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn LexChain's default experience into a worker-facing preliminary labor-dispute opinion assistant, with wage-arrears intake, evidence tracking, claim estimation, actionable next steps, and a preserved professional audit mode.

**Architecture:** Keep `engine.js` and `rules/labor-rules.json` as the deterministic legal-rule core. Add a small platform-neutral opinion layer that turns rule reports and case inputs into structured, plain-language opinion data; add a worker-mode controller to the existing single-file UI while keeping the current rule panel and theory surface behind a professional mode switch. The same UI and opinion layer will be copied to the GitHub Pages `docs/` build, with the existing static browser engine supplying analysis there.

**Tech Stack:** Zero-dependency Node.js, vanilla HTML/CSS/JavaScript, existing GitHub Pages static build, Node's built-in `assert` for focused tests.

**Spec:** `docs/superpowers/specs/2026-10-19-labor-opinion-assistant-design.md`

## Global Constraints

- The product is a preliminary legal-analysis assistant and must not present unreviewed output as formal lawyer advice.
- Default jurisdiction is mainland China labor disputes; the UI must expose the rulebase version and jurisdiction.
- Missing facts remain unknown and cannot be silently converted into favorable or adverse conclusions.
- No automatic external submission of complaints, arbitration applications, or user documents.
- GitHub Pages must not receive or read API keys; static mode must remain functional with browser-side deterministic analysis.
- Worker mode must lead with plain-language conclusion, evidence gaps, and next steps; formal O/F/P and T/F/U output stays in professional mode.
- Any new user-facing control must work on mobile widths and have an explicit disabled/loading/error state.

---

### Task 1: Add a pure opinion and wage-claim layer

**Files:**
- Create: `opinion.js`
- Create: `tests/opinion.test.js`

**Interfaces:**
- Produces `calculateWageClaims(caseData) -> { claims, totalKnownArrears, hasEstimate }`.
- Produces `buildOpinion({ caseData, report }) -> { conclusionLevel, headline, summary, legalBasis, claims, evidenceGaps, actions, disclaimer }`.
- Exposes `LexChainOpinion` in browsers and CommonJS exports in Node.

- [ ] **Step 1: Write focused failing tests**

Create tests that assert:

```js
const { calculateWageClaims, buildOpinion } = require('../opinion');

const wageCase = {
  issue: 'wage_arrears',
  jurisdiction: '中华人民共和国大陆地区',
  wageRows: [
    { month: '2026-01', due: 8000, paid: 5000 },
    { month: '2026-02', due: 8000, paid: 0 }
  ],
  evidence: { bank_statement: 'has', payslip: 'partial' }
};

const claims = calculateWageClaims(wageCase);
assert.equal(claims.totalKnownArrears, 11000);
assert.equal(claims.claims[0].formula, 'Σ(应发工资 - 实发工资)');

const opinion = buildOpinion({
  caseData: wageCase,
  report: { verdict: '存在违法行为', rules: [{ id: 'R30', status: 'VIOLATION', source: '《劳动合同法》第三十条', text: '及时足额支付劳动报酬' }] }
});
assert.equal(opinion.conclusionLevel, '已有事实足以支持');
assert.ok(opinion.legalBasis.some(item => item.ruleId === 'R30'));
assert.ok(opinion.evidenceGaps.some(item => item.key === 'payslip'));
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/opinion.test.js`

Expected: FAIL because `opinion.js` and its exported functions do not yet exist.

- [ ] **Step 3: Implement the minimal pure layer**

Implement input normalization, positive arrears calculation per wage row, claim metadata with formula and assumptions, evidence-gap ordering, and a conclusion mapper that never emits “必胜” or “一定违法”. Keep the module independent of DOM, `fetch`, and the existing engine.

- [ ] **Step 4: Run the focused test**

Run: `node tests/opinion.test.js`

Expected: PASS, including zero/negative arrears rows, unknown evidence, and reports without matching rules.

- [ ] **Step 5: Commit**

```bash
git add opinion.js tests/opinion.test.js
git commit -m "Add structured labor opinion layer"
```

### Task 2: Serve the shared opinion module in local and Pages builds

**Files:**
- Modify: `server.js`
- Modify: `public/index.html`
- Modify: `docs/index.html`
- Create: `docs/opinion.js`

**Interfaces:**
- `server.js` serves `/opinion.js` from `public/opinion.js` with JavaScript content type.
- Both HTML builds load `./opinion.js` before their inline controller script.

- [ ] **Step 1: Add a static-serving regression check**

Extend the existing server smoke command with a request to `http://127.0.0.1:8787/opinion.js` and assert a 200 response whose body contains `LexChainOpinion`.

- [ ] **Step 2: Implement safe static asset serving**

Add a narrow GET asset branch for `/opinion.js` only, resolving the known file under `PUBLIC_DIR` and using `application/javascript; charset=utf-8`. Keep the existing API routes unchanged and do not expose arbitrary filesystem paths.

- [ ] **Step 3: Copy and load the module in Pages**

Copy `opinion.js` to `docs/opinion.js` and add `<script src="./opinion.js"></script>` before the existing controller script in both pages. Preserve the Pages-only `engine-browser.js` loader and static flag.

- [ ] **Step 4: Run local and static asset checks**

Run:

```bash
node --check opinion.js
curl -fsS http://127.0.0.1:8787/opinion.js | rg "LexChainOpinion"
curl -fsS http://127.0.0.1:8788/opinion.js | rg "LexChainOpinion"
```

Expected: all commands succeed.

- [ ] **Step 5: Commit**

```bash
git add server.js public/index.html docs/index.html docs/opinion.js
git commit -m "Serve shared opinion layer in both builds"
```

### Task 3: Add the worker-facing case intake and mode switch

**Files:**
- Modify: `public/index.html`
- Modify: `docs/index.html`

**Interfaces:**
- Adds `WORKER_CASE` state with `issue`, `description`, `jurisdiction`, `stillWorking`, `wageRows`, and `evidence`.
- Adds `renderWorkerStep()`, `collectWorkerCase()`, `buildWorkerFacts()`, `showWorkerOpinion(data)`, `enterWorkerMode()`, and `enterExpertMode()`.
- Existing `init()`, `analyzeText()`, `analyzeFacts()`, and `render()` remain usable in expert mode.

- [ ] **Step 1: Add markup and styles for the two modes**

Add a compact mode switch and a default worker surface before the existing cards. The worker surface includes issue buttons, a four-step progress indicator, a dynamic content region, a back button, a primary next/analyze button, and a visible preliminary-analysis notice. Wrap the current input/fact/report/theory surface in an expert container hidden by default.

- [ ] **Step 2: Implement the initial issue selector**

Render the seven issue choices from the spec. Selecting “拖欠工资” enters the wage flow. Selecting another issue enters a generic description flow that sends the description to the existing analyzer and still shows evidence/next-step framing rather than an empty placeholder.

- [ ] **Step 3: Implement wage-arrears facts and month rows**

Support add/remove month rows with `month`, `due`, and `paid` values; common fields for work status, jurisdiction, and a free-text description; and an explicit “未知/不清楚” option for still-working status. Validate that a row has a month and non-negative numeric amounts before advancing.

- [ ] **Step 4: Implement evidence status controls**

Render evidence items as `has`, `partial`, `missing`, or `unknown` and preserve them in `WORKER_CASE.evidence`. Do not request identity numbers or bank account numbers; show a short redaction notice.

- [ ] **Step 5: Implement the analysis transition**

Build facts from the case, call the existing `postJSON('/api/analyze', { text, facts })`, pass the returned report to `LexChainOpinion.buildOpinion`, and render a worker-readable opinion. In static mode, preserve the existing static extractor label and do not call a remote API.

- [ ] **Step 6: Add expert-mode handoff**

The worker opinion includes a “查看专业审阅” action that reveals the existing rule-based surface and scrolls to the report. The worker mode remains the default after reload.

- [ ] **Step 7: Verify interaction states**

Use the browser to verify issue selection, row validation, evidence toggles, back/next navigation, loading/error messages, static analysis, and expert-mode handoff at desktop and mobile-sized widths.

- [ ] **Step 8: Commit**

```bash
git add public/index.html docs/index.html
git commit -m "Add worker-facing labor dispute intake"
```

### Task 4: Render structured opinions and legal-safety copy

**Files:**
- Modify: `opinion.js`
- Modify: `public/index.html`
- Modify: `docs/index.html`
- Modify: `README.md`

**Interfaces:**
- Worker opinion rendering consumes only the `buildOpinion()` shape from Task 1.
- Existing professional report rendering remains unchanged except for a visible jurisdiction/version line.

- [ ] **Step 1: Add opinion sections to the worker result**

Render headline/conclusion level, facts used, legal basis, claim cards with formulas, evidence gaps, three-stage actions, a professional-review handoff, and the disclaimer. Escape user-provided text before inserting HTML.

- [ ] **Step 2: Add jurisdiction and version indicators**

Show `中华人民共和国大陆地区` and the loaded rulebase name/version in the worker surface and report. Keep the display driven by schema metadata rather than duplicated constants where possible.

- [ ] **Step 3: Add urgent-risk routing**

If the text or selected issue indicates工伤、暴力威胁、未成年人、群体性欠薪或报复风险, show a prominent human-help notice without pretending to determine the legal result.

- [ ] **Step 4: Update public documentation**

Explain that the Pages site provides preliminary analysis, that static mode uses browser-side extraction, and that no external submission occurs. Keep the local DeepSeek/Ollama distinction accurate.

- [ ] **Step 5: Run regression tests**

Run:

```bash
node tests/opinion.test.js
node test.js
node --check server.js
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add opinion.js public/index.html docs/index.html README.md
git commit -m "Render worker-readable preliminary legal opinions"
```

### Task 5: Publish and verify the Pages build

**Files:**
- Modify: `docs/index.html`
- Modify: `docs/opinion.js`

- [ ] **Step 1: Run the local static server**

Run: `python3 -m http.server 8788 --directory docs`

- [ ] **Step 2: Verify browser behavior**

At `http://127.0.0.1:8788/`, verify the wage flow, generic flow, expert handoff, and no console errors. Capture a desktop and mobile-sized screenshot for visual QA.

- [ ] **Step 3: Commit the final Pages artifact**

```bash
git add docs/index.html docs/opinion.js
git commit -m "Prepare worker opinion assistant for Pages"
```

- [ ] **Step 4: Publish the committed `docs/` tree**

Push `main` to the public `nininininini979-tech/lexchain` repository and wait for the Pages deployment workflow to complete successfully.

- [ ] **Step 5: Verify the public URL**

Check `https://nininininini979-tech.github.io/lexchain/` returns 200, shows worker mode by default, completes the wage-arrears flow, and keeps the professional audit handoff available.

---

## Plan self-review

- Spec coverage: worker mode, professional mode, wage MVP, structured opinion output, evidence provenance, privacy, static Pages constraints, and acceptance criteria are covered by Tasks 1–5.
- Placeholder scan: no TODO/TBD or unspecified implementation step is used.
- Type consistency: `calculateWageClaims`, `buildOpinion`, `WORKER_CASE`, `renderWorkerStep`, and `showWorkerOpinion` are defined before later tasks consume them.
- Scope: this plan implements Phase 1 and the opinion-layer foundation; document drafting, regional routing, and human review workflow remain explicitly later phases from the approved spec.
