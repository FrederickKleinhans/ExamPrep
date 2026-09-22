# Cloud & AI Fundamentals Prompts

---

## AWS Certified AI Practitioner (AIF-C01)

**certificationId:** `aws-ai-practitioner`
**Wrap output in:** `{ "certificationId": "aws-ai-practitioner", "version": "2024-01", "questions": [...] }`

---

You are an expert AWS certification question writer. Generate 100 unique practice questions for **AWS Certified AI Practitioner (AIF-C01)** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `ai-ml-fundamentals` | Fundamentals of AI and ML | 20% |
| `generative-ai` | Fundamentals of Generative AI | 24% |
| `foundation-models` | Applications of Foundation Models | 28% |
| `responsible-ai` | Guidelines for Responsible AI | 14% |
| `security-compliance` | Security, Compliance & Governance | 14% |

## JSON Schema
```json
{
  "id": "aws-ai-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "ai-ml-fundamentals|generative-ai|foundation-models|responsible-ai|security-compliance",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://aws.amazon.com/certification/certified-ai-practitioner/"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- ML basics (supervised/unsupervised/reinforcement, training/validation/test, bias/variance, overfitting)
- AWS AI/ML services: SageMaker (Studio, Pipelines, JumpStart, Canvas), Rekognition, Comprehend, Polly, Transcribe, Translate, Textract, Forecast, Personalize, Kendra
- Generative AI: LLMs, prompt engineering, tokens, embeddings, RAG, fine-tuning, hallucinations
- Amazon Bedrock (foundation models, model IDs, Knowledge Bases, Agents, Guardrails)
- Amazon Q (Business, Developer, in Connect)
- Responsible AI: bias, fairness, explainability, transparency, human oversight
- AWS AI governance tools: SageMaker Clarify, SageMaker Model Monitor, SageMaker Model Cards
- Security: data privacy, model security, IAM for AI/ML services, VPC endpoints

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## Microsoft 365 Fundamentals (MS-900)

**certificationId:** `ms-900`
**Wrap output in:** `{ "certificationId": "ms-900", "version": "2024-01", "questions": [...] }`

---

You are an expert Microsoft certification question writer. Generate 100 unique practice questions for **MS-900: Microsoft 365 Fundamentals** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `cloud-concepts` | Describe Cloud Concepts | 10% |
| `m365-productivity` | Describe Microsoft 365 Apps and Services | 45% |
| `security-compliance` | Describe Security, Compliance, Privacy & Trust | 25% |
| `pricing-support` | Describe Microsoft 365 Pricing and Support | 20% |

## JSON Schema
```json
{
  "id": "ms900-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "cloud-concepts|m365-productivity|security-compliance|pricing-support",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://learn.microsoft.com/en-us/certifications/exams/ms-900"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- Cloud concepts: IaaS/PaaS/SaaS, shared responsibility, public/private/hybrid, benefits of cloud
- Microsoft 365 apps: Word, Excel, PowerPoint, Outlook, Teams, OneNote, SharePoint, OneDrive
- Microsoft 365 services: Exchange Online, SharePoint Online, Teams, Yammer, Stream, Forms, Planner, To Do, Power Platform (Power BI, Power Apps, Power Automate)
- Endpoint management: Microsoft Intune, Autopilot, co-management with Configuration Manager
- Identity: Microsoft Entra ID, MFA, Conditional Access, SSO
- Security: Microsoft Defender for Microsoft 365, Purview (DLP, retention, sensitivity labels), Compliance Manager
- Licensing: M365 Business (Basic, Standard, Premium), Enterprise (E3, E5), F1/F3 (Frontline), add-ons
- Support: FastTrack, support plans, SLAs, service health dashboard

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## Databricks Lakehouse Fundamentals

**certificationId:** `databricks-lakehouse`
**Wrap output in:** `{ "certificationId": "databricks-lakehouse", "version": "2024-01", "questions": [...] }`

---

You are an expert Databricks certification question writer. Generate 100 unique practice questions for **Databricks Lakehouse Fundamentals** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `lakehouse-concepts` | Lakehouse Architecture & Concepts | 25% |
| `databricks-platform` | Databricks Platform & Products | 30% |
| `delta-lake` | Delta Lake | 25% |
| `data-governance` | Data Governance & Unity Catalog | 20% |

## JSON Schema
```json
{
  "id": "databricks-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "lakehouse-concepts|databricks-platform|delta-lake|data-governance",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://www.databricks.com/learn/training/lakehouse-fundamentals"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- Lakehouse architecture: combines data lake flexibility with data warehouse reliability, eliminates ETL duplication
- Data warehouse vs data lake vs lakehouse (limitations of each, how lakehouse solves them)
- Delta Lake: ACID transactions, time travel (versioning), schema enforcement, schema evolution, Z-ordering, compaction (OPTIMIZE), VACUUM
- Databricks platform: Workspaces, Clusters (all-purpose vs job), Databricks Runtime, Repos, Workflows/Jobs
- Databricks products: Databricks SQL (SQL warehouses), MLflow (experiment tracking, model registry), Feature Store, AutoML, Databricks Marketplace
- Unity Catalog: metastore hierarchy (catalog > schema > table), data lineage, column-level security, row filters, data sharing (Delta Sharing)
- Medallion architecture: Bronze (raw) → Silver (cleaned) → Gold (aggregated/business)
- Apache Spark basics: DataFrames, lazy evaluation, transformations vs actions, partitioning

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.
