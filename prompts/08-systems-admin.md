# Systems Admin Certs Prompts

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