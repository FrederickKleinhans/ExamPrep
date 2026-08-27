# DevOps Certs Prompts

---

## CKA (Certified Kubernetes Administrator)

**certificationId:** `cka`
**wrap output in:** `{ "certificationId": "cka", "version": "2024-01", "questions": [...] }`

---

You are an expert CNCF certification question writer. Generate exam practice questions for **CKA (Certified Kubernetes Administrator)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `cluster-architecture` | Cluster Architecture, Installation & Configuration | 25% (~25 questions) |
| `workloads` | Workloads & Services | 20% (~20 questions) |
| `logging-monitoring` | Logging & Monitoring | 10% (~10 questions) |
| `storage` | Storage | 15% (~15 questions) |
| `security` | Security | 15% (~15 questions) |
| `networking` | Networking | 15% (~15 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "cka-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "cluster-architecture|workloads|logging-monitoring|storage|security|networking",
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
  "metadata": {"examObjective":"...","references":["https://training.linuxfoundation.org/certification/certified-kubernetes-administrator/"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `cka-001` → `cka-100+`

**Key content:** Cluster architecture (master components: api-server, scheduler, controller-manager, etcd; worker components: kubelet, kube-proxy, container runtime), cluster installation (kubeadm, kubeadm init, kubeadm join, binary installation), cluster configuration (kubeconfig, RBAC, admission controllers), workloads (Pods, Deployments, StatefulSets, DaemonSets, Jobs, CronJobs), Services (ClusterIP, NodePort, LoadBalancer, ExternalName), Ingress, ConfigMaps, Secrets (types: Opaque, TLS, service account), Persistent Volumes (PV, PVC, StorageClass, Persistent Volume Claims), cluster networking (CNI plugins: Calico, Flannel, Cilium), etcd operations (backups, restore), cluster maintenance (upgrades, backup/restore), security (RBAC, Network Policies, Pod Security Policies, Pod Security Standards), audit logging, Kubernetes API (kubectl, dry-run, --request-timeout), helm basics.

**Quality rules:** 15% easy / 55% medium / 30% hard. Include at least 10 kubectl command questions and 10 YAML manifest questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## CKAD (Certified Kubernetes Application Developer)

**certificationId:** `ckad`
**wrap output in:** `{ "certificationId": "ckad", "version": "2024-01", "questions": [...] }`

---

You are an expert CNCF certification question writer. Generate exam practice questions for **CKAD (Certified Kubernetes Application Developer)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `core-concepts` | Core Concepts | 19% (~19 questions) |
| `multi-container-pods` | Multi-Container Pods | 11% (~11 questions) |
| `logging-monitoring` | Logging & Monitoring | 5% (~5 questions) |
| `configmaps` | Configuration | 12% (~12 questions) |
| `persistence` | Persistence | 7% (~7 questions) |
| `services` | Services & Networking | 15% (~15 questions) |
| `deployment` | Application Lifecycle Management | 20% (~20 questions) |
| `troubleshooting` | Troubleshooting | 11% (~11 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "ckad-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "core-concepts|multi-container-pods|logging-monitoring|configmaps|persistence|services|deployment|troubleshooting",
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
  "metadata": {"examObjective":"...","references":["https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer/"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `ckad-001` → `ckad-100+`

**Key content:** Pod concepts (Pod YAML, labels, annotations, selectors), multi-container Pod patterns (sidecar, ambassador, adapter), Init containers, ConfigMaps (creating, mounting, environment variables), Secrets (types: Opaque, TLS, service account), PVCs (creating, binding, access modes), Services (ClusterIP, NodePort, LoadBalancer, headless), Ingress (rules, paths, TLS, ingress controllers), Deployment (rollouts, rollback, strategies: RollingUpdate, Recreate), ReplicaSets, StatefulSets (ordered, stable network identities), Jobs, CronJobs, Service Accounts, RBAC (Role, ClusterRole, RoleBinding, ClusterRoleBinding), application lifecycle (health checks: readiness/liveness probes, startup probes), logging (kubectl logs, container logs), debugging (kubectl describe, kubectl exec, kubectl port-forward), troubleshooting (Pod issues, network issues, scheduling issues).

**Quality rules:** 10% easy / 55% medium / 35% hard. Include at least 15 YAML manifest creation/modification questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## Terraform Associate

**certificationId:** `terraform-associate`
**wrap output in:** `{ "certificationId": "terraform-associate", "version": "2024-01", "questions": [...] }`

---

You are an expert HashiCorp certification question writer. Generate exam practice questions for **Terraform Associate** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `fundamentals` | Fundamentals | 20% (~20 questions) |
| `infrastructure` | Infrastructure as Code | 15% (~15 questions) |
| `terraform-core` | Terraform Core | 30% (~30 questions) |
| `terraform-modules` | Terraform Modules | 15% (~15 questions) |
| `terraform-enterprise` | Terraform Enterprise | 10% (~10 questions) |
| `terraform-ecosystem` | Terraform Ecosystem | 10% (~10 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "terraform-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "fundamentals|infrastructure|terraform-core|terraform-modules|terraform-enterprise|terraform-ecosystem",
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
  "metadata": {"examObjective":"...","references":["https://www.hashicorp.com/certifications/terraform-associate"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `terraform-001` → `terraform-100+`

**Key content:** IaC concepts (infrastructure as code, declarative vs imperative), Terraform architecture (CLI, provider, resource, state), Terraform workflow (init, plan, apply, destroy), HCL syntax (blocks, arguments, attributes, expressions), providers (configuration, versioning, multi-provider), resources (configuration, meta-arguments: count, for_each, lifecycle), data sources (reading data, cross-provider), variables (input, output, types), state (local, remote backends: S3, Azure Blob, GCS, Terraform Cloud), state operations (show, list, rm, mv, taint, untaint), state locking, Terraform Cloud (workspaces, VCS integration, runs, policies), modules (local, registry, versioning), modules best practices, sensitive values, secrets management, interpolation syntax, functions, conditional expressions, loops (for, for_each), provisioners (local-exec, remote-exec), providers in modules, testing (terraform test), drift detection, cost estimation.

**Quality rules:** 20% easy / 50% medium / 30% hard. Include at least 10 HCL configuration questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## Docker Certified Associate

**certificationId:** `docker-associate`
**wrap output in:** `{ "certificationId": "docker-associate", "version": "2024-01", "questions": [...] }`

---

You are an expert Docker certification question writer. Generate exam practice questions for **Docker Certified Associate (DCA)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `container-orchestration` | Container Orchestration | 20% (~20 questions) |
| `container-runtime` | Container Runtime | 15% (~15 questions) |
| `images` | Images | 15% (~15 questions) |
| `networking` | Networking | 15% (~15 questions) |
| `storage` | Storage | 15% (~15 questions) |
| `security` | Security | 10% (~10 questions) |
| `troubleshooting` | Troubleshooting | 10% (~10 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "docker-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "container-orchestration|container-runtime|images|networking|storage|security|troubleshooting",
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
  "metadata": {"examObjective":"...","references":["https://www.docker.com/certification/"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `docker-001` → `docker-100+`

**Key content:** Docker architecture (Docker Engine, Docker Daemon, Docker Client, Registry), container lifecycle (run, start, stop, kill, rm), Docker images (build, pull, push, tag, layers, Dockerfile instructions: FROM, RUN, COPY, ADD, CMD, ENTRYPOINT, ENV, EXPOSE, VOLUME, WORKDIR), Dockerfile optimization (multi-stage builds, .dockerignore), Docker volumes (bind mounts, volumes, tmpfs), Docker networks (bridge, host, none, overlay, macvlan), Docker Compose (services, networks, volumes, depends_on, healthcheck), Docker Swarm (nodes, services, stacks, swarm mode initialization), service discovery, Docker security (user namespaces, content trust, scan, secrets), Docker logging (driver configuration, log aggregation), Docker registries (Docker Hub, private registry, Harbor), container runtime (containerd, runc), CNI plugins, seccomp profiles, AppArmor profiles.

**Quality rules:** 15% easy / 55% medium / 30% hard. Include at least 10 Dockerfile questions and 10 docker command questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.