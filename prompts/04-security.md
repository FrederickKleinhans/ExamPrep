# Security Certs Prompts

---

## SC-200: Microsoft Security Operations Analyst

**certificationId:** `sc-200`
**wrap output in:** `{ "certificationId": "sc-200", "version": "2024-01", "questions": [...] }`

---

You are an expert Microsoft certification question writer. Generate exam practice questions for **SC-200: Microsoft Security Operations Analyst** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `analyze-alerts` | Analyze alerts and identify suspicious activities | 30% (~30 questions) |
| `respond-incidents` | Respond to security incidents | 25% (~25 questions) |
| `implement-controls` | Implement security controls | 20% (~20 questions) |
| `manage-identity` | Manage identity and access | 15% (~15 questions) |
| `configure-threat-protection` | Configure and manage threat protection | 10% (~10 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "sc200-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "analyze-alerts|respond-incidents|implement-controls|manage-identity|configure-threat-protection",
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
  "metadata": {"examObjective":"...","references":["https://learn.microsoft.com/en-us/certifications/exams/sc-200"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `sc200-001` → `sc200-100+`

**Key content:** Microsoft Sentinel (KQL, analytics rules, playbooks), Microsoft Defender XDR (EPP, EPP, CEP), threat hunting, incident response in Microsoft Sentinel, alert correlation, SOAR, security analytics, attack surface management, identity protection, conditional access policies, Privileged Identity Management (PIM), Microsoft Entra ID governance, Microsoft Defender for Identity, Microsoft Defender for Office 365, Microsoft Defender for Cloud Apps, Microsoft Defender for Endpoint, Azure Security Center (ASC) recommendations, Microsoft Purview compliance portal.

**Quality rules:** 25% easy / 50% medium / 25% hard. Include at least 15 KQL query questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## CISSP

**certificationId:** `cissp`
**wrap output in:** `{ "certificationId": "cissp", "version": "2024-01", "questions": [...] }`

---

You are an expert (ISC)² certification question writer. Generate exam practice questions for **CISSP** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `security-governance` | Security and Risk Governance | 22% (~22 questions) |
| `asset-security` | Asset Security | 13% (~13 questions) |
| `security-architecture` | Security Architecture and Engineering | 13% (~13 questions) |
| `communication-security` | Communication and Network Security | 14% (~14 questions) |
| `identity-access` | Identity and Access Management | 13% (~13 questions) |
| `security-ops` | Security Assessment and Testing | 12% (~12 questions) |
| `software-security` | Software Development Security | 13% (~13 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "cissp-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "security-governance|asset-security|security-architecture|communication-security|identity-access|security-ops|software-security",
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
  "metadata": {"examObjective":"...","references":["https://www.isc2.org/certifications/cissp"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `cissp-001` → `cissp-100+`

**Key content:** CISSP domains (8 domains), risk management frameworks (NIST RMF, ISO 27005), security policies and programs, physical security, cryptography (symmetric/asymmetric, PKI, TLS), IAM (RBAC, ABAC, PAM), BCP/DRP/RTO/RPO/BIA, secure software development lifecycle (SDL), threat modeling, security architectures (zero trust, zero knowledge, defense-in-depth), security operations (SOC, IR, monitoring), compliance frameworks (GDPR, HIPAA, PCI DSS), cloud security (shared responsibility, CSPM), supply chain risk management (SSLM), business continuity planning.

**Quality rules:** 20% easy / 50% medium / 30% hard. Questions must emphasize reasoning and decision-making over recall. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## OSCP

**certificationId:** `oscp`
**wrap output in:** `{ "certificationId": "oscp", "version": "2024-01", "questions": [...] }`

---

You are an expert penetration testing certification question writer. Generate exam practice questions for **OSCP** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `reconnaissance` | Information Gathering and Vulnerability Scanning | 20% (~20 questions) |
| `web-app-testing` | Web Application Testing | 30% (~30 questions) |
| `system-hacking` | System Hacking (Windows/Linux) | 25% (~25 questions) |
| `privilege-escalation` | Privilege Escalation and Post-Exploitation | 15% (~15 questions) |
| `reporting` | Penetration Testing Reporting | 10% (~10 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "oscp-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "reconnaissance|web-app-testing|system-hacking|privilege-escalation|reporting",
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
  "metadata": {"examObjective":"...","references":["https://www.offensive-security.com/pwk-oscp/"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `oscp-001` → `oscp-100+`

**Key content:** Nmap scanning techniques (SYN scan, service version detection, OS detection, script scanning), SQL injection (classic, blind, time-based, out-of-band), XSS (stored, reflected, DOM-based, CSRF), authentication bypass (session manipulation, JWT cracking), Windows exploitation (Mimikatz, pass-the-hash, golden ticket, silver ticket), Linux exploitation (SUID binaries, cron jobs, sudo misconfigurations), privilege escalation (Kernel exploits, unprivileged user exploits), post-exploitation (pivoting, lateral movement, persistence), PowerShell exploitation (PowerSploit, Empire), Metasploit framework (payloads, modules, post-exploitation), reporting (executive summary, technical findings, remediation recommendations).

**Quality rules:** 20% easy / 50% medium / 30% hard. Include at least 15 command-line tool questions (nmap, sqlmap, metasploit commands). `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## CompTIA Network+ (N10-009)

**certificationId:** `comptia-network-plus`
**wrap output in:** `{ "certificationId": "comptia-network-plus", "version": "2024-01", "questions": [...] }`

---

You are an expert CompTIA certification question writer. Generate exam practice questions for **CompTIA Network+ (N10-009)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `networking-concepts` | Networking Concepts | 23% (~23 questions) |
| `network-implementation` | Network Implementation | 20% (~20 questions) |
| `network-operations` | Network Operations | 19% (~19 questions) |
| `network-security` | Network Security | 14% (~14 questions) |
| `network-troubleshooting` | Network Troubleshooting | 24% (~24 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "netplus-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "networking-concepts|network-implementation|network-operations|network-security|network-troubleshooting",
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
  "metadata": {"examObjective":"...","references":["https://www.comptia.org/certifications/network"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `netplus-001` → `netplus-100+`

**Key content:** OSI model (7 layers, devices at each layer, protocols), TCP/IP (IPv4, IPv6, subnetting, CIDR, VLSM, supernetting), switching (VLANs, trunking, STP, LACP), routing (static, OSPF, EIGRP, BGP, route aggregation), wireless (802.11 a/b/g/n/ac/ax, WPA2/WPA3, channels, SSID, MIMO), cable types (Cat5e, Cat6, Cat6a, Cat7, fiber SMF/MMF, coax), network devices (routers, switches, hubs, APs, firewalls, IDS/IPS, load balancers, proxies), WAN (MPLS, SD-WAN, leased lines, point-to-point, point-to-multipoint), network monitoring (SNMP, NetFlow, sFlow, Wireshark, tcpdump), network security (port security, 802.1X, MAC filtering, firewall rules, DLP, network segmentation), DHCP (options, reservations, exclusion ranges), DNS (records: A, AAAA, CNAME, MX, NS, PTR, SOA), security concepts (DDoS protection, DNSSEC, WAF, NAC).

**Quality rules:** 25% easy / 50% medium / 25% hard. Include at least 10 subnetting calculation questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## CCNA

**certificationId:** `ccna`
**wrap output in:** `{ "certificationId": "ccna", "version": "2024-01", "questions": [...] }`

---

You are an expert Cisco certification question writer. Generate exam practice questions for **CCNA (200-301)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `network-fundamentals` | Network Fundamentals | 20% (~20 questions) |
| `network-access` | Network Access | 20% (~20 questions) |
| `IP connectivity` | IP Connectivity | 25% (~25 questions) |
| `IP services` | IP Services | 10% (~10 questions) |
| `security fundamentals` | Security Fundamentals | 15% (~15 questions) |
| `automation and programmability` | Automation and Programmability | 10% (~10 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "ccna-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "network-fundamentals|network-access|ip-connectivity|ip-services|security-fundamentals|automation-programmability",
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
  "metadata": {"examObjective":"...","references":["https://www.cisco.com/c/en/us/training-events/training-certifications/exams/current/ccna-200-301.html"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `ccna-001` → `ccna-100+`

**Key content:** OSI model (7 layers, devices, protocols), TCP/UDP (differences, port numbers, connection establishment), IPv4 addressing (subnetting, VLSM, CIDR, summarized routes), IPv6 addressing (unique local, link-local, global unicast), routing concepts (static routes, default routes, routing protocols), Cisco IOS (CLI navigation, basic configuration, show commands), switch concepts (VLANs, trunking, DTP, native VLAN, STP, PortFast, BPDU guard), routing protocols (RIP, OSPF - single area, EIGRP - basic), Layer 3 redundancy (HSRP, VRRP), ACLs (standard, extended, named, numbered), NAT/PAT (overload, static NAT), DHCP (server, relay, options), DNS, NTP, SNMP, Syslog, security (port security, sticky MAC, DHCP snooping, dynamic ARP inspection, DAQ), wireless (802.11, SSID, WPA2/WPA3), network programmability (REST APIs, JSON, YAML, Python basics), Cisco DNA Center, NETCONF/RESTCONF.

**Quality rules:** 20% easy / 50% medium / 30% hard. Include at least 10 subnetting questions and 10 CLI command questions. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

---

## CCNP Enterprise Core (350-401)

**certificationId:** `ccnp-enterprise-core`
**wrap output in:** `{ "certificationId": "ccnp-enterprise-core", "version": "2024-01", "questions": [...] }`

---

You are an expert Cisco certification question writer. Generate exam practice questions for **CCNP Enterprise Core (350-401 ENCOR)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `architecture` | Architecture | 20% (~20 questions) |
| `virtualization` | Virtualization | 15% (~15 questions) |
| `network-infrastructure` | Network Infrastructure | 25% (~25 questions) |
| `network-services` | Network Services | 20% (~20 questions) |
| `security` | Security | 15% (~15 questions) |
| `automation` | Automation | 5% (~5 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "ccnpcore-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "architecture|virtualization|network-infrastructure|network-services|security|automation",
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
  "metadata": {"examObjective":"...","references":["https://www.cisco.com/c/en/us/training-events/training-certifications/exams/current/ccnp-enterprise-350-401-encor.html"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `ccnpcore-001` → `ccnpcore-100+`

**Key content:** Layer 2/3 architectures (spine-leaf, CLOS, multitenant), wireless architecture (WLC, AP modes, WDS, RAP, FlexConnect), network virtualization (VXLAN, EVPN, NVGRE,GRE tunnels), Cisco SD-Access, IP routing (OSPF multi-area, IS-IS, BGP - peer groups, route reflectors, Route-Reflectors, Confederations), MPLS (LDP, RSVP-TE, VPNv4, VRF-Lite), QoS (classification, marking, queuing, congestion management, congestion avoidance), IPv6 (addressing, routing, transition technologies: dual-stack, 6to4, ISATAP, GRE tunneling), redundancy (HSRPv2, VRRPv3, GLBP), security (IPSec VPN, DMVPN, GETVPN, TrustSec, SGT), SD-WAN (vEdge, vSmart, vBond,vedge), telemetry (NETCONF, RESTCONF, YANG, gRPC, gNMI), Cisco DNA Center, Cisco ISE (SXP, pxGrid), Cisco Prime Infrastructure, Cisco ThousandEyes.

**Quality rules:** 15% easy / 55% medium / 30% hard. Questions must emphasize design and implementation over basic configuration. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

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

---

## RHCSA

**certificationId:** `rhcsa`
**wrap output in:** `{ "certificationId": "rhcsa", "version": "2024-01", "questions": [...] }`

---

You are an expert Red Hat certification question writer. Generate exam practice questions for **RHCSA (EX200)** in strict JSON format.

Generate a JSON array of at least 100 unique practice questions covering:

| Topic ID | Label | Weight |
|----------|-------|--------|
| `system-configuration` | System Configuration and Management | 30% (~30 questions) |
| `storage` | Storage Configuration | 15% (~15 questions) |
| `security` | Security | 20% (~20 questions) |
| `networking` | Networking | 20% (~20 questions) |
| `troubleshooting` | Troubleshooting | 15% (~15 questions) |

Question type distribution: `single-choice` ~37, `multiple-choice` ~17, `yes-no-statements` ~17, `dropdown-select` ~13, `ordering` ~8, `drag-drop` ~8. Include 15+ scenario questions with `scenarioText`.

**JSON Schema:**
```json
{
  "id": "rhcsa-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering|drag-drop",
  "topicId": "system-configuration|storage|security|networking|troubleshooting",
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
  "metadata": {"examObjective":"...","references":["https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhel8-exam"],"lastUpdated": "2024-01-15"}
}
```

**Numbering:** `rhcsa-001` → `rhcsa-100+`

**Key content:** System installation and configuration (RHEL installation, GRUB2, bootloader configuration), user and group management (useradd, usermod, userdel, groupadd, groupmod, passwd, sudo, sudoers), file system management (ext4, XFS, mount, umount, /etc/fstab), partitioning (parted, fdisk, LVM: PV, VG, LV), SELinux (enforcing/permissive, labels, semanage, restorecon), firewall configuration (firewalld, zones, services, rich rules), network configuration (nmcli, nmtui, /etc/hostname, /etc/hosts), DNS configuration (resolv.conf, nmcli), time synchronization (chrony, timedatectl), package management (dnf, yum, rpm), bash scripting (variables, conditionals, loops, functions), log management (journalctl, rsyslog), cron jobs (crontab, at), virtualization (libvirt, virsh), containerization (podman, containers), SSH configuration, key-based authentication.

**Quality rules:** 20% easy / 50% medium / 30% hard. Include at least 20 command-line questions requiring exact syntax. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.

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

**Key content:** Agile methodologies (Scrum, Kanban, XP,精益), Agile principles and values (manifesto), roles in Agile teams (product owner, Scrum Master, development team), sprint cycles, backlogs, user stories, acceptance criteria, test pyramid (unit, integration, system, acceptance), shift-left testing, test automation in Agile, continuous integration and test automation, exploratory testing in Agile, behavior-driven development (BDD), acceptance test-driven development (ATDD), test-driven development (TDD), test automation frameworks, Agile metrics (velocity, burndown charts, test coverage, defect density), non-functional testing in Agile (performance, security, usability), regression testing strategies, test environment management in Agile, collaboration between testers and developers, test documentation in Agile (lightweight vs detailed), test design techniques in Agile context, test coverage metrics.

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
| `business环境` | Business Environment | 8% (~8 questions) |

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
