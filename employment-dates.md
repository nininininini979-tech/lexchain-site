# Employment Dates and Limitation Periods (P0-2 仲裁时效)

## Overview

The `employment` input derives two facts (`worker_separated`, `months_employed`) and assesses arbitration limitation periods (仲裁时效) for all labor rules.

## Input Format

```javascript
{
  employment: {
    start: "YYYY-MM-DD",          // 劳动关系开始日期
    end: "YYYY-MM-DD",            // 劳动关系终止日期（与 stillEmployed 互斥）
    stillEmployed: true,          // 当前仍在职（与 end 互斥）
    filed: "YYYY-MM-DD",          // 仲裁申请日期（默认使用 asOf）
    defense: true | false | null, // 对方是否提出时效抗辩（null=未知，只提示风险）
    interruptions: [              // 时效中断事由
      {date: "YYYY-MM-DD", kind: "DEMAND"|"COMPLAINT"|"ACKNOWLEDGED"}
    ]
  }
}
```

## Derived Facts

- `worker_separated`: `true` if `end <= asOf`, `false` if `stillEmployed === true`
- `months_employed`: decimal months between `start` and `end` (or `asOf` if still employed), counting the start day

Month calculation respects varying month lengths: adding 1 month to 2025-01-31 yields 2025-02-28.

## Limitation Period Assessment

Three rule groups:

1. **SEPARATION** (R46, R87, R87-2, R87-3, R47-2, R50): Termination/dismissal claims. One year from `end` date. Status `NOT_STARTED` if still employed.

2. **REMUNERATION** (R30, R44, R85, R16-P, R20, R26): Wage/overtime arrears. Not limited during employment (《劳动争议调解仲裁法》第27条第4款). Status `NOT_LIMITED_DURING_EMPLOYMENT` if `filed < end`.

3. **UNSETTLED** (R82, R82-2, R82-3, R5-AL): Double-pay for missing contract, unpaid annual leave. Mixed jurisdictional rules on start date; implementation uses the latest possible (termination date) so a `BARRED` result holds across all interpretations.

### Status Values

- `WITHIN`: filed within the deadline
- `BARRED`: filed after deadline and defense was raised (`defense: true`)
- `BARRED_NOT_RAISED`: filed after deadline but defense was not raised (`defense: false`)
- `BARRED_IF_RAISED`: filed after deadline, defense status unknown (`defense: null`)
- `NOT_LIMITED_DURING_EMPLOYMENT`: remuneration claim filed before termination
- `NOT_STARTED`: separation claim filed before termination
- `UNSETTLED_NOT_BARRED_AT_LATEST_START`: unsettled claim filed within one year of termination (latest possible start date)
- `UNKNOWN`: missing required input (e.g. `end` date)

### Interruptions (时效中断)

Limitation periods extend by one year from each interruption date within the window:

- `DEMAND`: 主张权利 (e.g. written demand to employer)
- `COMPLAINT`: 投诉举报 (e.g. labor bureau complaint)
- `ACKNOWLEDGED`: 对方承认 (e.g. employer acknowledgment)

Multiple interruptions can extend the deadline repeatedly.

## Conflict Handling

If submitted `facts` contradict `employment` derivations, the conflict is recorded and the fact is set to `null`:

```javascript
conflicts: [
  {fact: "worker_separated", submitted: false, employment: true}
]
```

## Certificate Output

```javascript
{
  employmentDates: {
    format: "lexchain-employment-dates-v1",
    asOf: "2026-07-01",
    derivedFacts: {worker_separated: true, months_employed: 110.2903},
    limitation: [
      {
        rule: "R87",
        group: "SEPARATION",
        start: "2024-05-10",
        restartedFrom: "2024-12-01",       // after one interruption
        deadline: "2025-12-01",
        interruptionsUsed: ["2024-12-01"],
        status: "WITHIN",
        filed: "2025-05-10",
        filingAssumed: false
      },
      // ... 15 more rules
    ],
    groups: {
      SEPARATION: "《劳动争议调解仲裁法》第二十七条第一款：时效一年，自知道或应当知道权利被侵害之日起算；解除、终止引起的请求按劳动关系解除或终止之日起算。",
      REMUNERATION: "《劳动争议调解仲裁法》第二十七条第四款：劳动关系存续期间拖欠劳动报酬不受一年限制；劳动关系终止的，自终止之日起一年内提出。加班费是否属于劳动报酬，各地口径大多肯定，个别不同。",
      UNSETTLED: "二倍工资差额、未休年休假报酬是否属于劳动报酬及起算点，各地口径不一（逐月起算、自违法状态结束起算、自离职起算等）。此处只用最晚的起算点（劳动关系终止之日）判断：若连这样也已超过一年，则在各口径下都已超过时效。"
    },
    limitations: [
      "期间按民法典第201—202条计算；未处理法定节假日顺延和时效中止",
      "时效是否适用以用人单位提出时效抗辩为前提；defense 未填写时只提示风险",
      "未提交仲裁申请日时，以 asOf 作为假设的申请日"
    ]
  }
}
```

## Checker Verification

The independent checker recomputes all limitation assessments from the `employment` input and verifies:

1. Date arithmetic (month counting, deadline calculation)
2. Interruption window logic
3. Derived facts consistency with submitted facts
4. Status determination based on `defense` flag

Forged or tampered limitation assessments are rejected.

## Example Usage

```javascript
const input = {
  facts: {},
  context: {asOf: "2026-07-01"},
  employment: {
    start: "2015-03-01",
    end: "2024-05-10",
    filed: "2025-05-10",
    interruptions: [{date: "2024-12-01", kind: "DEMAND"}]
  }
};

const result = analyze(input, assets);

// Derived facts
result.certificate.derivedFacts.worker_separated === true;
result.certificate.derivedFacts.months_employed === 110.2903;

// Limitation assessments
const r87 = result.certificate.employmentDates.limitation.find(x => x.rule === 'R87');
r87.status === "WITHIN";
r87.deadline === "2025-12-01";  // extended by one interruption
```

## Limitations (Boundary Declarations)

1. Period calculation follows civil code articles 201–202; statutory holiday extensions and suspension of limitations (时效中止) are not implemented.
2. Limitation period defense is at the employer's discretion; when `defense` is `null`, only risk is flagged, not a definitive bar.
3. When filing date is omitted, `asOf` is assumed as the filing date.
4. Jurisdictional variations in start dates for unsettled claims (double-pay, unpaid annual leave) are acknowledged but not enumerated; implementation uses the latest possible start (termination date) as a conservative bound.
