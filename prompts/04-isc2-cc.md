# (ISC)² Certified in Cybersecurity (CC)

**certificationId:** `isc2-cc`
**wrap output in:** `{ "certificationId": "isc2-cc", "version": "2024-01", "questions": [...] }`

---

You are an expert cybersecurity certification question writer. Generate exam practice questions for the **(ISC)² Certified in Cybersecurity (CC)** in strict JSON format.

Generate a JSON array of at least 150 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `security-principles` | Security Principles | 26% (~39 questions) |
| `business-continuity` | Business Continuity, Disaster Recovery, and Incident Response | 10% (~15 questions) |
| `access-controls` | Access Controls Concepts | 22% (~33 questions) |
| `network-security` | Network Security | 24% (~36 questions) |
| `security-operations` | Security Operations | 18% (~27 questions) |

Question type distribution: `single-choice` ~55, `multiple-choice` ~25, `yes-no-statements` ~25, `dropdown-select` ~20, `ordering` ~13, `drag-drop` ~12. Include 20+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "isc2cc-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "security-principles|business-continuity|access-controls|network-security|security-operations",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "dragCategories": [{"id":"cat1","name":"...","acceptsItemIds":["item1","item2"]}],
  "dragItems": [{"id":"item1","text":"..."}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://www.isc2.org/certifications/cc"],"lastUpdated":"2024-01-15"}
}
```

**Numbering:** `isc2cc-001` → `isc2cc-150+`

**Key content:** CIA triad, authentication vs authorization, DAC/MAC/RBAC, least privilege, separation of duties, non-repudiation, defense in depth, data classification, BCP vs DRP, RTO vs RPO, BIA, incident response phases, access control types (physical, logical, administrative), identity management, MFA, SSO, OSI model layers, TCP/IP, firewalls (stateless vs stateful), IDS vs IPS, VPN types, network segmentation, DMZ, patch management, change management, configuration management, data handling and destruction, physical security controls.

**Quality rules:** 35% easy / 45% medium / 20% hard. `options:[]` for non-choice types. At least 10 questions on OSI model layer identification. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.
