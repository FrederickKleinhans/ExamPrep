# Cloud Intermediate Prompts

---

## AZ-305 Azure Solutions Architect

**certificationId:** `az-305`
**wrap output in:** `{ "certificationId": "az-305", "version": "2024-01", "questions": [...] }`

---

You are an expert Microsoft Azure certification question writer. Generate exam practice questions for **AZ-305: Designing Microsoft Azure Infrastructure Solutions** in strict JSON format.

Generate a JSON array of at least 150 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `identity-governance` | Design Identity, Governance, and Monitoring Solutions | 25% (~38 questions) |
| `data-storage` | Design Data Storage Solutions | 25% (~38 questions) |
| `business-continuity` | Design Business Continuity Solutions | 25% (~38 questions) |
| `infrastructure` | Design Infrastructure Solutions | 25% (~36 questions) |

Question type distribution: `single-choice` ~55, `multiple-choice` ~25, `yes-no-statements` ~25, `dropdown-select` ~20, `ordering` ~13, `drag-drop` ~12. Include 20+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "az305-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "identity-governance|data-storage|business-continuity|infrastructure",
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
  "metadata": {"examObjective":"...","references":["https://learn.microsoft.com/en-us/certifications/exams/az-305"],"lastUpdated":"2024-01-15"}
}
```

**Numbering:** `az305-001` → `az305-150+`

**Key content:** Entra ID design (tenant, B2B, B2C, hybrid identity), RBAC, Azure Policy, Management Groups, landing zones, Azure Monitor, Log Analytics, cost management, storage account design (redundancy, tiers, access), Azure SQL design (DTU vs vCore, elastic pools, geo-replication), Cosmos DB consistency levels, data migration (Azure Migrate, Database Migration Service), RTO/RPO design, Azure Backup, Site Recovery, Traffic Manager failover, load balancing selection (Front Door vs Application Gateway vs Load Balancer vs Traffic Manager), VM architecture (availability sets/zones, scale sets), AKS design, networking design (hub-spoke, VNet peering, ExpressRoute vs VPN), Azure API Management, microservices patterns, caching (Redis), messaging (Service Bus vs Event Hub vs Event Grid vs Queue Storage).

**Quality rules:** 25% easy / 50% medium / 25% hard. AZ-305 is advanced — questions must require architectural decision-making, not just recall. `options:[]` for non-choice types. Valid JSON only.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## AZ-204 Azure Developer Associate

**certificationId:** `az-204`
**wrap output in:** `{ "certificationId": "az-204", "version": "2024-01", "questions": [...] }`

---

You are an expert Microsoft Azure certification question writer. Generate exam practice questions for **AZ-204: Developing Solutions for Microsoft Azure** in strict JSON format.

Generate a JSON array of at least 150 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `azure-compute` | Develop Azure Compute Solutions | 25% (~38 questions) |
| `azure-storage` | Develop for Azure Storage | 15% (~23 questions) |
| `azure-security` | Implement Azure Security | 20% (~30 questions) |
| `monitoring` | Monitor, Troubleshoot, and Optimize Azure Solutions | 15% (~23 questions) |
| `azure-services` | Connect to and Consume Azure Services and Third-Party Services | 25% (~36 questions) |

Question type distribution: `single-choice` ~55, `multiple-choice` ~25, `yes-no-statements` ~25, `dropdown-select` ~20, `ordering` ~13, `drag-drop` ~12. Include 20+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "az204-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "azure-compute|azure-storage|azure-security|monitoring|azure-services",
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
  "metadata": {"examObjective":"...","references":["https://learn.microsoft.com/en-us/certifications/exams/az-204"],"lastUpdated":"2024-01-15"}
}
```

**Numbering:** `az204-001` → `az204-150+`

**Key content:** Azure App Service (Web Apps, deployment slots, scaling, custom domains, TLS), Azure Functions (triggers, bindings, durable functions, hosting plans), Azure Container Apps, ACI, Azure Blob Storage SDK operations (upload, download, metadata, SAS, lifecycle), Azure Cosmos DB SDK (CRUD, consistency, partition keys, change feed), Azure Cache for Redis, Azure API Management (policies, products, subscriptions), Azure Service Bus (queues, topics, subscriptions), Azure Event Grid (topics, subscriptions, event schema), Azure Event Hubs, Microsoft Identity Platform (MSAL, OAuth 2.0 flows, managed identities), Azure Key Vault (secrets, keys, certificates, access policies vs RBAC), Application Insights (instrumentation, custom events, availability tests, KQL), Azure CDN, Azure Logic Apps.

**Quality rules:** 25% easy / 50% medium / 25% hard. Include at least 15 code-based questions (SDK method selection, correct SDK pattern). `options:[]` for non-choice types. Valid JSON only.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## AWS Solutions Architect Associate (SAA-C03)

**certificationId:** `aws-saa`
**wrap output in:** `{ "certificationId": "aws-saa", "version": "2024-01", "questions": [...] }`

---

You are an expert AWS certification question writer. Generate exam practice questions for **AWS Solutions Architect Associate (SAA-C03)** in strict JSON format.

Generate a JSON array of at least 150 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `secure-arch` | Design Secure Architectures | 30% (~45 questions) |
| `resilient-arch` | Design Resilient Architectures | 26% (~39 questions) |
| `high-performing` | Design High-Performing Architectures | 24% (~36 questions) |
| `cost-optimized` | Design Cost-Optimized Architectures | 20% (~30 questions) |

Question type distribution: `single-choice` ~55, `multiple-choice` ~25, `yes-no-statements` ~25, `dropdown-select` ~20, `ordering` ~13, `drag-drop` ~12. Include 20+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "awssaa-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "secure-arch|resilient-arch|high-performing|cost-optimized",
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
  "metadata": {"examObjective":"...","references":["https://aws.amazon.com/certification/certified-solutions-architect-associate/"],"lastUpdated":"2024-01-15"}
}
```

**Numbering:** `awssaa-001` → `awssaa-150+`

**Key content:** IAM (policies, roles, STS, resource-based vs identity-based), VPC design (subnets, route tables, IGW, NAT Gateway, VPC peering, Transit Gateway, PrivateLink, VPC endpoints), EC2 (instance types, purchasing options, placement groups, Auto Scaling groups, launch templates), ELB (ALB vs NLB vs CLB, target groups, listener rules), S3 (storage classes, lifecycle, versioning, replication, encryption, bucket policies, presigned URLs, S3 Transfer Acceleration), EBS (volume types gp2/gp3/io1/io2, snapshots, encryption), EFS, RDS (Multi-AZ vs Read Replicas, Aurora, backups, encryption), DynamoDB (partition keys, GSI/LSI, DAX, streams, capacity modes), ElastiCache (Redis vs Memcached), CloudFront (origins, behaviors, OAC, signed URLs), Route 53 (routing policies), Lambda (event sources, concurrency, layers), SQS vs SNS vs EventBridge, ECS vs EKS vs Fargate, Kinesis, Glacier, AWS Backup, disaster recovery patterns (backup/restore, pilot light, warm standby, multi-site).

**Quality rules:** 25% easy / 50% medium / 25% hard. Most questions should require architectural trade-off reasoning. `options:[]` for non-choice types. Valid JSON only.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## AWS Developer Associate (DVA-C02)

**certificationId:** `aws-developer`
**wrap output in:** `{ "certificationId": "aws-developer", "version": "2024-01", "questions": [...] }`

---

You are an expert AWS certification question writer. Generate exam practice questions for **AWS Certified Developer Associate (DVA-C02)** in strict JSON format.

Generate a JSON array of at least 150 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `development` | Development with AWS Services | 32% (~48 questions) |
| `security` | Security | 26% (~39 questions) |
| `deployment` | Deployment | 24% (~36 questions) |
| `troubleshooting` | Troubleshooting and Optimization | 18% (~27 questions) |

Question type distribution: `single-choice` ~55, `multiple-choice` ~25, `yes-no-statements` ~25, `dropdown-select` ~20, `ordering` ~13, `drag-drop` ~12. Include 20+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "awsdev-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "development|security|deployment|troubleshooting",
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
  "metadata": {"examObjective":"...","references":["https://aws.amazon.com/certification/certified-developer-associate/"],"lastUpdated":"2024-01-15"}
}
```

**Numbering:** `awsdev-001` → `awsdev-150+`

**Key content:** Lambda (event sources, environment variables, layers, versions/aliases, concurrency, error handling, X-Ray tracing), API Gateway (REST vs HTTP vs WebSocket, stages, throttling, authorizers, caching), DynamoDB (SDK operations, condition expressions, batch operations, transactions, TTL, streams), S3 SDK (presigned URLs, multipart upload, event notifications), SQS (standard vs FIFO, visibility timeout, DLQ, long polling, batch operations), SNS (topics, subscriptions, message filtering), Kinesis (shards, consumers, KCL, KPL), Elastic Beanstalk (platforms, deployment policies — all-at-once, rolling, rolling with batch, immutable, blue/green), CodeCommit, CodeBuild (buildspec.yml), CodeDeploy (appspec.yml, deployment groups, lifecycle hooks), CodePipeline, CloudFormation (templates, stacks, change sets, intrinsic functions), SAM (template syntax, local testing), IAM (roles, policies, STS AssumeRole, Cognito User Pools vs Identity Pools), Secrets Manager vs Parameter Store, KMS (CMK, data keys, envelope encryption), CloudWatch (metrics, logs, alarms, Logs Insights), X-Ray (segments, subsegments, annotations, sampling).

**Quality rules:** 25% easy / 50% medium / 25% hard. Include at least 10 code/config snippet questions. `options:[]` for non-choice types. Valid JSON only.

**Output:** Return only a raw JSON array `[...]`. No preamble.
