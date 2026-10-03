# CISSP Practice Questions

Generate a JSON array of 100 unique CISSP practice questions.

**certificationId:** `cissp`
**Wrap output in:** `{ "certificationId": "cissp", "version": "2024-01", "questions": [...] }`

---

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| security-governance | Security & Risk Governance | 22% |
| asset-security | Asset Security | 13% |
| security-architecture | Security Architecture & Engineering | 13% |
| communication-security | Communication & Network Security | 14% |
| identity-access | Identity & Access Management | 13% |
| security-ops | Security Assessment & Testing | 12% |
| software-security | Software Development Security | 13% |

---

## JSON Schema (per question)
```json
{
  "id": "cissp-001",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "security-governance|asset-security|security-architecture|communication-security|identity-access|security-ops|software-security",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional context paragraph",
  "questionText": "clear question",
  "options": [{"id":"A","text":"option A","isCorrect":false}, ...],
  "statements": [{"id":"s1","text":"statement","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"context","options":["A","B","C","D"],"correctAnswer":"B"}],
  "orderItems": [{"id":"o1","text":"item","correctPosition":1}],
  "explanation": {"correct":"explanation text","incorrect":"explanation","examTip":" tip","relatedTopics":["topic1","topic2"]},
  "metadata": {"examObjective":"domain objective","references":["https://www.isc2.org/certifications/cissp"],"lastUpdated":"2024-01-15"}
}
```

---

## Key Content Areas
- Security governance & risk management (NIST RMF, ISO 27001/27005, policies)
- Asset security (classification, lifecycle, data handling)
- Security architecture (zero trust, cloud security, secure design principles)
- Network security (encryption, protocols, secure design)
- IAM (RBAC, ABAC, MFA, identity lifecycle)
- Security operations (SOC, IR, forensics, monitoring)
- Software security (SDL, SAST/DAST, secure coding, supply chain)

---

## Requirements
- 100 questions total
- Difficulty: 20% easy / 50% medium / 30% hard
- Include 15+ scenario questions with `scenarioText`
- 10+ questions on governance/risk
- 10+ questions on cryptography
- 10+ questions on IAM
- 10+ questions on cloud security
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.