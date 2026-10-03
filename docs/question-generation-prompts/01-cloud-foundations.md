# Cloud Foundations Prompts

---

## AWS Cloud Practitioner (CLF-C02)

**certificationId:** `aws-cp`
**wrap output in:** `{ "certificationId": "aws-cp", "version": "2024-01", "questions": [...] }`

---

You are an expert AWS certification question writer. Generate exam practice questions for **AWS Certified Cloud Practitioner (CLF-C02)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `cloud-concepts` | Cloud Concepts | 24% (~24 questions) |
| `security-compliance` | Security and Compliance | 30% (~30 questions) |
| `cloud-technology` | Cloud Technology and Services | 34% (~34 questions) |
| `billing-pricing` | Billing, Pricing, and Support | 12% (~12 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "awscp-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "cloud-concepts|security-compliance|cloud-technology|billing-pricing",
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
  "metadata": {"examObjective":"...","references":["https://aws.amazon.com/certification/certified-cloud-practitioner/"],"lastUpdated":"2024-01-15"}
}
```

**Numbering:** `awscp-001` → `awscp-100+`

**Key content:** Cloud benefits (elasticity, scalability, agility, CAPEX vs OPEX), shared responsibility model, AWS global infrastructure (regions, AZs, edge locations), core services (EC2, S3, RDS, Lambda, VPC, CloudFront, Route 53, IAM, CloudWatch, CloudTrail, Trusted Advisor, AWS Organizations, AWS Config), support plans (Basic, Developer, Business, Enterprise), pricing models (On-Demand, Reserved, Spot, Savings Plans), AWS Free Tier, TCO Calculator, AWS Pricing Calculator, Well-Architected Framework (6 pillars), AWS CAF.

**Quality rules:** 40% easy / 40% medium / 20% hard. `options:[]` for non-choice types. At least 10 questions on service identification. At least 8 on shared responsibility model. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## Google Cloud Digital Leader

**certificationId:** `gcp-digital-leader`
**wrap output in:** `{ "certificationId": "gcp-digital-leader", "version": "2024-01", "questions": [...] }`

---

You are an expert Google Cloud certification question writer. Generate exam practice questions for the **Google Cloud Digital Leader** certification in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `digital-transformation` | Digital Transformation with Google Cloud | 30% (~30 questions) |
| `data-innovation` | Innovating with Data and Google Cloud | 30% (~30 questions) |
| `modern-infra` | Infrastructure and Application Modernization | 25% (~25 questions) |
| `security-ops` | Understanding Google Cloud Security and Operations | 15% (~15 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "gcdl-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "digital-transformation|data-innovation|modern-infra|security-ops",
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
  "metadata": {"examObjective":"...","references":["https://cloud.google.com/learn/certification/cloud-digital-leader"],"lastUpdated":"2024-01-15"}
}
```

**Numbering:** `gcdl-001` → `gcdl-100+`

**Key content:** Cloud vs on-premises, IaaS/PaaS/SaaS, Google Cloud value proposition, digital transformation pillars, BigQuery, Looker, Vertex AI, AutoML, Cloud Storage, Cloud SQL, Spanner, Firestore, Compute Engine, GKE, Cloud Run, App Engine, VPC, Cloud Load Balancing, Cloud CDN, Apigee, IAM, Cloud Identity, BeyondCorp Zero Trust, Chronicle SIEM, Cloud Armor, Shared Responsibility Model on GCP, Cloud Operations Suite (Logging, Monitoring, Trace), SRE principles, FinOps on GCP.

**Quality rules:** 40% easy / 40% medium / 20% hard. `options:[]` for non-choice types. At least 10 questions on matching GCP services to business use cases. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.
