# Testing & QA Certs Prompts

---

## ISTQB Agile Tester (ATFL)

**certificationId:** `istqb-agile`
**wrap output in:** `{ "certificationId": "istqb-agile", "version": "2024-01", "questions": [...] }`

---

You are an expert software testing certification question writer. Generate exam practice questions for **ISTQB Agile Tester Foundation Level (ATFL)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `agile-fundamentals` | Fundamentals of Agile | 25% (~25 questions) |
| `testing-agile` | Testing in Agile Projects | 35% (~35 questions) |
| `agile-tools` | Agile Testing Tools and Practices | 20% (~20 questions) |
| `test-techniques` | Agile Test Techniques | 20% (~20 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "istqb-agile-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "agile-fundamentals|testing-agile|agile-tools|test-techniques",
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
  "metadata": {"examObjective":"...","references":["https://www.istqb.org/certifications/certified-tester-advanced-level/agile-tester-foundation-level.html"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `istqb-agile-001` → `istqb-agile-100+`

**Key content:** Agile methodologies (Scrum, Kanban, XP, Lean), Agile principles and values (manifesto), roles in Agile teams (product owner, Scrum Master, development team), sprint cycles, backlogs, user stories, acceptance criteria, test pyramid (unit, integration, system, acceptance), shift-left testing, test automation in Agile, continuous integration and test automation, exploratory testing in Agile, behavior-driven development (BDD), acceptance test-driven development (ATDD), test-driven development (TDD), test automation frameworks, Agile metrics (velocity, burndown charts, test coverage, defect density), non-functional testing in Agile (performance, security, usability), regression testing strategies, test environment management in Agile, collaboration between testers and developers, test documentation in Agile (lightweight vs detailed), test design techniques in Agile context, test coverage metrics.

**Quality rules:** 20% easy / 50% medium / 30% hard. Include at least 10 Agile testing process questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## PMP

**certificationId:** `pmp`
**wrap output in:** `{ "certificationId": "pmp", "version": "2024-01", "questions": [...] }`

---

You are an expert Project Management Institute certification question writer. Generate exam practice questions for **PMP (Project Management Professional)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `people` | People | 42% (~42 questions) |
| `process` | Process | 50% (~50 questions) |
| `business-environment` | Business Environment | 8% (~8 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "pmp-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "people|process|business-environment",
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
  "metadata": {"examObjective":"...","references":["https://www.pmi.org/certifications/project-management-pmp"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `pmp-001` → `pmp-100+`

**Key content:** Project management processes (Initiating, Planning, Executing, Monitoring & Controlling, Closing), project lifecycle (predictive, iterative, incremental, agile, hybrid), project integration management (charter, plan, execution, monitoring, closing), project scope management (collect requirements, define scope, WBS, validate scope, control scope), project schedule management (activity definition, sequencing, estimating, scheduling, control), project cost management (estimating, budgeting, control), project quality management (quality planning, assurance, control), project resource management (resource planning, acquisition, development, management), project communications management (planning, distribution, monitoring), project risk management (identification, analysis, planning, response, monitoring), project procurement management (planning, execution, closing), project stakeholder management (identification, engagement), Agile and hybrid approaches, predictive vs adaptive, stakeholder analysis, team development (Tuckman's stages: forming, storming, norming, performing, adjourning), conflict resolution techniques, negotiation, leadership styles, motivational theories, decision-making techniques, change management, governance, value delivery, benefits management.

**Quality rules:** 15% easy / 55% medium / 30% hard. Include at least 10 process domain mapping questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## PSM I (Scrum Master)

**certificationId:** `psm-i`
**wrap output in:** `{ "certificationId": "psm-i", "version": "2024-01", "questions": [...] }`

---

You are an expert Scrum Alliance certification question writer. Generate exam practice questions for **PSM I (Scrum Master I)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `scrum-theory` | Scrum Theory | 16% (~16 questions) |
| `scrum-framework` | Scrum Framework | 56% (~56 questions) |
| `scrum-events` | Scrum Events | 28% (~28 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "psm-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "scrum-theory|scrum-framework|scrum-events",
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
  "metadata": {"examObjective":"...","references":["https://www.scrum.org/professional-scrum-master-certifications"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `psm-001` → `psm-100+`

**Key content:** Scrum values (commitment, courage, focus, openness, respect), Scrum principles (empiricism: transparency, inspection, adaptation), Scrum roles (Scrum Master, Product Owner, Development Team), Scrum artifacts (Product Backlog, Sprint Backlog, Increment), Scrum events (Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective), Definition of Done, Definition of Ready, Product Backlog management (refinement, ordering, visibility), Sprint Goal, cross-functional teams, self-organization, timeboxing, empiricism, value maximization, the Scrum Master as a servant leader, coaching, impediment removal, facilitation, Scrum patterns and anti-patterns, scaling Scrum (SAFe, Nexus, Scrum of Scrums), empirical product development, lean thinking, continuous improvement, feedback loops, transparency in artifacts, inspection of artifacts, adaptation based on inspection.

**Quality rules:** 20% easy / 50% medium / 30% hard. Include at least 10 scenario questions requiring Scrum Master decision-making. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.