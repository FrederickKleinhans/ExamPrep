# Business & Enterprise Certs Prompts

---

## TOGAF Enterprise Architecture Foundation (Part 1)

**certificationId:** `togaf-foundation`
**Wrap output in:** `{ "certificationId": "togaf-foundation", "version": "2024-01", "questions": [...] }`

---

You are an expert enterprise architecture certification question writer. Generate 100 unique practice questions for **TOGAF Enterprise Architecture Foundation (Part 1)** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `ea-concepts` | Basic Concepts of Enterprise Architecture | 20% |
| `adm` | Architecture Development Method (ADM) | 35% |
| `adm-guidelines` | ADM Guidelines and Techniques | 15% |
| `architecture-content` | Architecture Content Framework | 15% |
| `togaf-reference` | TOGAF Reference Models & Capability | 15% |

## JSON Schema
```json
{
  "id": "togaf-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "ea-concepts|adm|adm-guidelines|architecture-content|togaf-reference",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://www.opengroup.org/togaf"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- Enterprise Architecture: definition, purpose, business value, four domains (Business, Data, Application, Technology — BDAT)
- TOGAF ADM phases: Preliminary → A (Architecture Vision) → B (Business) → C (Information Systems: Data + Application) → D (Technology) → E (Opportunities & Solutions) → F (Migration Planning) → G (Implementation Governance) → H (Architecture Change Management) → Requirements Management (central)
- Architecture Repository: Architecture Metamodel, Architecture Landscape (Strategic/Segment/Capability), Standards Information Base, Reference Library, Governance Log
- Architecture Building Blocks (ABBs) vs Solution Building Blocks (SBBs)
- Architecture Governance: Architecture Board, compliance reviews, dispensations
- Stakeholder Management: stakeholder map, concerns, viewpoints, views
- Architecture Vision (Phase A): Statement of Architecture Work, Architecture Vision document
- Business Architecture (Phase B): value chain, business capabilities, organisation maps
- ADM cycles: full cycle, iteration for architecture development, iteration for transition planning
- TOGAF reference models: TRM (Technical Reference Model), III-RM (Integrated Information Infrastructure Reference Model)
- Architecture Capability Framework: architecture skills, organisation structures, roles
- Enterprise Continuum: Architecture Continuum + Solutions Continuum, Foundation → Common Systems → Industry → Organisation-Specific

## Requirements
- 100 questions, difficulty: 20% easy / 55% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- 10+ questions on correct ADM phase sequencing
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## Salesforce Certified Associate

**certificationId:** `salesforce-associate`
**Wrap output in:** `{ "certificationId": "salesforce-associate", "version": "2024-01", "questions": [...] }`

---

You are an expert Salesforce certification question writer. Generate 100 unique practice questions for **Salesforce Certified Associate** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `salesforce-ecosystem` | Salesforce Ecosystem | 32% |
| `navigation` | Navigation & User Productivity | 22% |
| `data-model` | Data Model | 26% |
| `reports-dashboards` | Reports, Dashboards & Automation | 20% |

## JSON Schema
```json
{
  "id": "sfdc-assoc-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "salesforce-ecosystem|navigation|data-model|reports-dashboards",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://trailhead.salesforce.com/credentials/associate"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- Salesforce ecosystem: CRM definition, cloud computing, Salesforce clouds (Sales, Service, Marketing, Commerce, Experience), AppExchange, Trailhead, Trailblazer Community
- Salesforce platform: multi-tenant architecture, metadata-driven, declarative vs programmatic customisation
- Navigation: App Launcher, navigation bar, global search, list views, record pages, Lightning Experience vs Classic
- User Productivity: Chatter (feeds, groups, following), tasks, events, calendar, notifications, Einstein features
- Data Model: standard objects (Account, Contact, Lead, Opportunity, Case), custom objects, fields (standard vs custom), relationships (lookup, master-detail, many-to-many via junction object)
- Record types, page layouts, compact layouts
- Data quality: duplicate management, validation rules, required fields
- Security: profiles, roles (role hierarchy), permission sets, sharing rules, OWD (Organisation-Wide Defaults), field-level security
- Reports: report types (tabular, summary, matrix, joined), report builder, filters, grouping, charts
- Dashboards: components (chart, metric, table, gauge), dynamic dashboards, running user
- Automation basics: workflow rules (legacy), Process Builder (legacy), Flow Builder (current standard), approval processes
- Data management: data import wizard, data loader, sandbox environments, change sets

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## PMI CAPM (Certified Associate in Project Management)

**certificationId:** `capm`
**Wrap output in:** `{ "certificationId": "capm", "version": "2024-01", "questions": [...] }`

---

You are an expert PMI certification question writer. Generate 100 unique practice questions for **PMI CAPM (Certified Associate in Project Management)** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `project-management-fundamentals` | Project Management Fundamentals & Core Concepts | 17% |
| `predictive-planning` | Predictive Plan-Based Methodologies | 38% |
| `agile-frameworks` | Agile Frameworks & Methodologies | 18% |
| `business-analysis` | Business Analysis Frameworks | 27% |

## JSON Schema
```json
{
  "id": "capm-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "project-management-fundamentals|predictive-planning|agile-frameworks|business-analysis",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://www.pmi.org/certifications/certified-associate-capm"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- PM fundamentals: project vs program vs portfolio, project lifecycle, project management processes (Initiating, Planning, Executing, Monitoring & Controlling, Closing), PMO types
- Predictive (waterfall): WBS, scope baseline, schedule (Gantt, CPM, critical path, float/slack, fast-tracking, crashing), cost estimating techniques (analogous, parametric, bottom-up), EVM (PV, EV, AC, SV, CV, SPI, CPI), risk management (identify, analyse qualitative/quantitative, plan responses, implement, monitor), quality management (plan, assurance, control), stakeholder management, communications management, procurement management
- Agile: Scrum framework (roles, events, artifacts), Kanban, XP basics, hybrid approaches, incremental delivery, servant leadership, retrospectives
- Business analysis: needs assessment, requirements elicitation techniques (interviews, workshops, observation, prototyping), requirements types (business, stakeholder, functional, non-functional, transition), traceability matrix, requirements validation, change management for requirements, product roadmap, backlog management

## Requirements
- 100 questions, difficulty: 20% easy / 55% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- 10+ EVM calculation questions
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## CertNexus Certified AI Business Practitioner (AIB-110)

**certificationId:** `certNexus-aib`
**Wrap output in:** `{ "certificationId": "certNexus-aib", "version": "2024-01", "questions": [...] }`

---

You are an expert AI business certification question writer. Generate 100 unique practice questions for **CertNexus Certified AI Business Practitioner (AIB-110)** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `ai-concepts` | AI Concepts and Terminology | 20% |
| `ai-strategy` | AI Strategy and Business Value | 25% |
| `responsible-ai` | Responsible and Ethical AI | 25% |
| `ai-implementation` | AI Project Management & Implementation | 30% |

## JSON Schema
```json
{
  "id": "aib-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "ai-concepts|ai-strategy|responsible-ai|ai-implementation",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://certnexus.com/certification/aib/"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- AI concepts: AI vs ML vs deep learning vs generative AI, supervised/unsupervised/reinforcement learning, neural networks basics, NLP, computer vision, robotics
- Business AI: AI use cases by industry (healthcare, finance, retail, manufacturing), ROI of AI, build vs buy vs partner decisions, AI product lifecycle
- AI strategy: identifying AI opportunities, data strategy, AI roadmap, stakeholder alignment, change management for AI adoption, AI maturity models
- Responsible AI: bias and fairness, transparency and explainability (XAI), privacy (data minimisation, anonymisation), safety, accountability, human oversight, AI ethics frameworks (IEEE, EU AI Act, NIST AI RMF)
- Generative AI: LLMs, prompt engineering basics, hallucinations, content moderation, copyright considerations
- AI project management: CRISP-DM methodology (Business Understanding → Data Understanding → Data Preparation → Modelling → Evaluation → Deployment), agile for AI, data quality requirements, model monitoring and drift, AI governance

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## ISACA Information Security Fundamentals (ISF)

**certificationId:** `isaca-isf`
**Wrap output in:** `{ "certificationId": "isaca-isf", "version": "2024-01", "questions": [...] }`

---

You are an expert ISACA certification question writer. Generate 100 unique practice questions for **ISACA Information Security Fundamentals (ISF)** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `security-concepts` | Security Concepts and Principles | 25% |
| `threats-vulnerabilities` | Threats, Attacks and Vulnerabilities | 25% |
| `security-controls` | Security Controls and Technologies | 25% |
| `governance-compliance` | Security Governance and Compliance | 25% |

## JSON Schema
```json
{
  "id": "isaca-isf-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "security-concepts|threats-vulnerabilities|security-controls|governance-compliance",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://www.isaca.org/credentialing/information-security-fundamentals"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- CIA triad (Confidentiality, Integrity, Availability), AAA (Authentication, Authorisation, Accounting), non-repudiation
- Security controls: preventive, detective, corrective, deterrent, compensating; administrative, technical, physical
- Threats: malware (virus, worm, ransomware, spyware, rootkit), social engineering (phishing, pretexting, baiting), insider threats, APTs
- Attacks: DoS/DDoS, MitM, SQL injection, XSS, brute force, credential stuffing, password spraying, ARP spoofing
- Cryptography: symmetric (AES), asymmetric (RSA), hashing (SHA-256), digital signatures, PKI, TLS/HTTPS
- Network security: firewalls, IDS/IPS, VPN, DMZ, network segmentation, wireless security (WPA2/WPA3)
- Identity and access management: authentication factors (something you know/have/are), MFA, RBAC, least privilege, PAM
- Vulnerability management: vulnerability scanning, patch management, penetration testing, CVE/CVSS
- Incident response: detect, contain, eradicate, recover, lessons learned
- Governance: security policies, risk management, NIST CSF, ISO 27001 overview, GDPR basics, compliance frameworks
- Business continuity: BCP, DRP, RTO, RPO, backup strategies

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## CompTIA Data+

**certificationId:** `comptia-data-plus`
**Wrap output in:** `{ "certificationId": "comptia-data-plus", "version": "2024-01", "questions": [...] }`

---

You are an expert CompTIA certification question writer. Generate 100 unique practice questions for **CompTIA Data+ (DA0-001)** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `data-concepts` | Data Concepts and Environments | 15% |
| `data-mining` | Data Mining | 25% |
| `data-analysis` | Data Analysis | 23% |
| `visualisation` | Visualisation | 22% |
| `data-governance` | Data Governance, Quality and Controls | 15% |

## JSON Schema
```json
{
  "id": "data-plus-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "data-concepts|data-mining|data-analysis|visualisation|data-governance",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://www.comptia.org/certifications/data"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- Data concepts: structured vs unstructured vs semi-structured, data types (quantitative/qualitative, discrete/continuous), databases (RDBMS, NoSQL, data warehouse, data lake, data mart), ETL/ELT, data pipeline
- Data mining: query tools (SQL basics — SELECT, WHERE, GROUP BY, JOIN, ORDER BY, aggregate functions), data profiling, data cleansing, data sampling, regular expressions basics
- Statistical analysis: descriptive statistics (mean, median, mode, range, standard deviation, variance), inferential statistics, hypothesis testing, p-value, confidence intervals, correlation vs causation, regression
- Data analysis: data blending, data validation, anomaly detection, trend analysis, forecasting, segmentation, A/B testing, cohort analysis
- Visualisation: chart types (bar, line, pie, scatter, heat map, histogram, box plot, waterfall), when to use each, dashboard design principles, storytelling with data, colour theory, accessibility in visualisations
- Tools: Excel/Spreadsheets, Tableau, Power BI, Python pandas/matplotlib (basic concepts), SQL query tools
- Data governance: data catalogue, data dictionary, data lineage, metadata management, data quality dimensions (accuracy, completeness, consistency, timeliness, uniqueness), master data management
- Data privacy: PII, GDPR basics, data anonymisation, data masking, access controls

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- 10+ questions involving interpreting charts or data scenarios
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.
