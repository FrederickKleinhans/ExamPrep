# Networking Certs Prompts

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

**Key content:** OSI model (7 layers, devices, protocols), TCP/UDP (differences, port numbers, connection establishment), IPv4 addressing (subnetting, VLSM, CIDR, summarized routes), IPv6 addressing (unique local, link-local, global unicast), routing concepts (static routes, default routes, routing protocols), Cisco IOS (CLI navigation, basic configuration, show commands), switch concepts (VLANs, trunking, DTP, native VLAN, STP, PortFast, BPDU guard), routing protocols (RIP, OSPF - single area, EIGRP - basic), Layer 3 redundancy (HSRP, VRRP, GLBP), ACLs (standard, extended, named, numbered), NAT/PAT (overload, static NAT), DHCP (server, relay, options), DNS, NTP, SNMP, Syslog, security (port security, sticky MAC, DHCP snooping, dynamic ARP inspection, DAQ), wireless (802.11, SSID, WPA2/WPA3), network programmability (REST APIs, JSON, YAML, Python basics), Cisco DNA Center, Cisco ISE (SXP, pxGrid), Cisco Prime Infrastructure, Cisco ThousandEyes.

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

**Key content:** Layer 2/3 architectures (spine-leaf, CLOS, multitenant), wireless architecture (WLC, AP modes, WDS, RAP, FlexConnect), network virtualization (VXLAN, EVPN, NVGRE, GRE tunnels), Cisco SD-Access, IP routing (OSPF multi-area, IS-IS, BGP - peer groups, route reflectors, Route-Reflectors, Confederations), MPLS (LDP, RSVP-TE, VPNv4, VRF-Lite), QoS (classification, marking, queuing, congestion management, congestion avoidance), IPv6 (addressing, routing, transition technologies: dual-stack, 6to4, ISATAP, GRE tunneling), redundancy (HSRPv2, VRRPv3, GLBP), security (IPSec VPN, DMVPN, GETVPN, TrustSec, SGT), SD-WAN (vEdge, vSmart, vBond, vedge), telemetry (NETCONF, RESTCONF, YANG, gRPC, gNMI), Cisco DNA Center, Cisco ISE (SXP, pxGrid), Cisco Prime Infrastructure, Cisco ThousandEyes.

**Quality rules:** 15% easy / 55% medium / 30% hard. Questions must emphasize design and implementation over basic configuration. `options:[]` for non-choice types. Valid JSON only — no comments, no trailing commas.

**Output:** Return only a raw JSON array `[...]`. No preamble.