# Data & AI Certs Prompts

---

## DP-203: Azure Data Engineer Associate

**certificationId:** `dp-203`
**wrap output in:** `{ "certificationId": "dp-203", "version": "2024-01", "questions": [...] }`

---

You are an expert Microsoft certification question writer. Generate exam practice questions for **DP-203: Azure Data Engineer Associate** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `ingest-data` | Ingest and Transform Data | 30% (~30 questions) |
| `store-data` | Store and Prepare Data | 20% (~20 questions) |
| `analyze-data` | Analyze Data | 25% (~25 questions) |
| `build-solutions` | Build and Orchestrate Solutions | 25% (~25 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "dp203-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "ingest-data|store-data|analyze-data|build-solutions",
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
  "metadata": {"examObjective":"...","references":["https://learn.microsoft.com/en-us/certifications/exams/dp-203"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `dp203-001` → `dp203-100+`

**Key content:** Data ingestion (Azure Data Factory, Copy Activity, Mapping Data Flows, Pipeline parameters, triggers, error handling), data transformation (Azure Databricks notebooks, Spark sessions, Delta Lake, Spark SQL), data storage (Azure Synapse Analytics, SQL Pools, Serverless SQL Pool, Apache Spark Pools), data integration (PolyBase, COPY statement, external tables), data modeling (star schema, snowflake schema, SCD types), data quality (Dataflow Gen2, data profiling), real-time analytics (Azure Stream Analytics, Event Hubs, IoT Hub), data security (role-based access control, row-level security, column-level security), data lineage, data governance (Azure Purview integration), ETL vs ELT patterns, batch vs streaming, data lakehouse architecture.

**Quality rules:** 20% easy / 50% medium / 30% hard. Include at least 15 ADF pipeline questions and 10 Spark/Databricks questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## AI-900: Azure AI Fundamentals

**certificationId:** `ai-900`
**wrap output in:** `{ "certificationId": "ai-900", "version": "2024-01", "questions": [...] }`

---

You are an expert Microsoft certification question writer. Generate exam practice questions for **AI-900: Azure AI Fundamentals** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `ai-workloads` | Describe AI Workloads and Considerations | 20% (~20 questions) |
| `machine-learning` | Describe Fundamental Principles of Machine Learning on Azure | 30% (~30 questions) |
| `computer-vision` | Describe Features of Computer Vision Workloads on Azure | 15% (~15 questions) |
| `nlp` | Describe Features of Natural Language Processing Workloads | 15% (~15 questions) |
| `generative-ai` | Describe Features of Generative AI Workloads on Azure | 20% (~20 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "ai900-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "ai-workloads|machine-learning|computer-vision|nlp|generative-ai",
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
  "metadata": {"examObjective":"...","references":["https://learn.microsoft.com/en-us/certifications/exams/ai-900"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `ai900-001` → `ai900-100+`

**Key content:** AI vs ML vs deep learning vs generative AI, supervised vs unsupervised vs reinforcement learning, regression vs classification vs clustering, features and labels, training vs validation vs test sets, overfitting vs underfitting, model evaluation (accuracy, precision, recall, F1 score, ROC curve, confusion matrix), Azure Machine Learning (workspace, experiments, runs, models, endpoints), AutoML (automated ML, best model selection), data preparation (Data Wrangler, feature engineering), Model explainability (interpretability, SHAP), Responsible AI (fairness, reliability, privacy, transparency, accountability), Azure AI Vision (OCR, image classification, object detection, facial analysis), Custom Vision, Azure AI Language (language detection, sentiment analysis, key phrase extraction, named entity recognition, text analytics), Azure AI Translator, Azure AI Speech (speech-to-text, text-to-speech, speaker recognition), Azure Bot Service, Azure Language Understanding (CLU), Azure OpenAI Service (GPT models, Azure OpenAI Studio), prompt engineering (prompts, completions, tokenization), RAG (retrieval-augmented generation), grounding, hallucinations, evaluation of generative AI models.

**Quality rules:** 25% easy / 45% medium / 30% hard. Include at least 10 responsible AI questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## AI-102: Azure AI Engineer Associate

**certificationId:** `ai-102`
**wrap output in:** `{ "certificationId": "ai-102", "version": "2024-01", "questions": [...] }`

---

You are an expert Microsoft certification question writer. Generate exam practice questions for **AI-102: Azure AI Engineer Associate** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `vision` | Implement Computer Vision Solutions | 25% (~25 questions) |
| `nlp` | Implement Natural Language Processing Solutions | 25% (~25 questions) |
| `speech` | Implement Speech Solutions | 25% (~25 questions) |
| `knowledge` | Implement Knowledge Mining and RAG Solutions | 25% (~25 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "ai102-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "vision|nlp|speech|knowledge",
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
  "metadata": {"examObjective":"...","references":["https://learn.microsoft.com/en-us/certifications/exams/ai-102"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `ai102-001` → `ai102-100+`

**Key content:** Computer Vision (Azure AI Vision SDK, Form Recognizer, Computer Vision API, Custom Vision, Azure Cognitive Services, facial recognition, optical character recognition, image analysis), Natural Language Processing (Azure Language service, Text Analytics API, Language Understanding (LUIS) vs CLU, sentiment analysis, key phrase extraction, named entity recognition, question answering, chatbot integration), Speech Services (speech-to-text, text-to-speech, speech translation, speaker recognition, voice activity detection, custom speech models), Knowledge Mining (Azure Cognitive Search, skillsets, cognitive services integration, entity recognition, key phrase extraction, language detection, OCR for documents), Retrieval-Augmented Generation (RAG), Azure OpenAI Service (GPT-4, GPT-3.5-Turbo, embeddings, vector search), Azure AI Studio, model deployment (endpoint configuration, scaling, monitoring), data preparation for AI models, prompt engineering for Azure OpenAI, evaluation metrics for AI models, ethical considerations in AI.

**Quality rules:** 20% easy / 50% medium / 30% hard. Include at least 10 prompt engineering questions and 10 Azure OpenAI Service questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.