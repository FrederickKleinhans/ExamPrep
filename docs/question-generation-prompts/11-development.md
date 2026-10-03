# Development Fundamentals Prompts

---

## Python Institute PCEP (Certified Entry-Level Python Programmer)

**certificationId:** `pcep`
**Wrap output in:** `{ "certificationId": "pcep", "version": "2024-01", "questions": [...] }`

---

You are an expert Python certification question writer. Generate 100 unique practice questions for **PCEP: Certified Entry-Level Python Programmer** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `python-basics` | Computer Programming & Python Fundamentals | 18% |
| `control-flow` | Control Flow — Conditional Blocks and Loops | 29% |
| `data-collections` | Data Collections — Tuples, Dictionaries, Lists, Strings | 25% |
| `functions-exceptions` | Functions and Exceptions | 28% |

## JSON Schema
```json
{
  "id": "pcep-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "python-basics|control-flow|data-collections|functions-exceptions",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional code snippet",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://pythoninstitute.org/pcep"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- Python fundamentals: interpreter, source code, keywords, identifiers, literals, operators, expressions
- Data types: int, float, str, bool, None; type conversion (int(), float(), str())
- Variables and assignment: naming rules, multiple assignment
- Input/output: print(), input(), sep/end parameters, formatted strings (f-strings)
- Operators: arithmetic (+,-,*,/,//,%,**), comparison (==,!=,<,>,<=,>=), logical (and,or,not), bitwise, augmented assignment
- Control flow: if/elif/else, while loops, for loops, range(), break, continue, pass, else on loops
- Lists: indexing, slicing, methods (append, insert, remove, pop, sort, reverse, len), list comprehension
- Tuples: immutability, indexing, unpacking
- Dictionaries: keys/values, methods (get, keys, values, items, update, pop), iteration
- Strings: indexing, slicing, methods (upper, lower, strip, split, join, replace, find, count), formatting
- Functions: def, parameters, return, default arguments, keyword arguments, *args, **kwargs, scope (LEGB rule)
- Exceptions: try/except/else/finally, raise, common exceptions (ValueError, TypeError, ZeroDivisionError, IndexError, KeyError)

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 20+ code snippet questions using `scenarioText` (show Python code, ask what it outputs or does)
- Include at least 10 questions about what code outputs
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## JavaScript Institute JSE (Certified Entry-Level JavaScript Programmer)

**certificationId:** `jse`
**Wrap output in:** `{ "certificationId": "jse", "version": "2024-01", "questions": [...] }`

---

You are an expert JavaScript certification question writer. Generate 100 unique practice questions for **JSE: Certified Entry-Level JavaScript Programmer** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `js-basics` | Introduction to JavaScript | 20% |
| `variables-types` | Variables, Data Types & Operators | 25% |
| `control-flow` | Control Flow & Functions | 30% |
| `objects-arrays` | Objects, Arrays & Error Handling | 25% |

## JSON Schema
```json
{
  "id": "jse-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "js-basics|variables-types|control-flow|objects-arrays",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional code snippet",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://js.institute/certifications/jse"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- JavaScript basics: role of JS in web, ECMAScript, Node.js vs browser, console.log, script tag placement
- Variables: var (function-scoped, hoisting), let (block-scoped), const (block-scoped, immutable binding)
- Data types: number, string, boolean, null, undefined, symbol, BigInt, object; typeof operator
- Type coercion: implicit vs explicit, == vs ===, truthy/falsy values
- Operators: arithmetic, comparison, logical (&&, ||, !), ternary (?:), nullish coalescing (??), optional chaining (?.)
- Strings: template literals, methods (length, toUpperCase, slice, indexOf, includes, split)
- Control flow: if/else, switch, for, while, do-while, for...of, for...in, break, continue
- Functions: declaration vs expression, arrow functions, parameters, default parameters, rest (...), return, hoisting
- Scope and closures: global/local/block scope, closure concept
- Arrays: indexing, methods (push, pop, shift, unshift, splice, slice, map, filter, reduce, find, forEach, includes)
- Objects: literals, properties, methods, this keyword, bracket vs dot notation, destructuring
- Error handling: try/catch/finally, Error types (TypeError, ReferenceError, SyntaxError), throw

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 20+ code snippet questions using `scenarioText`
- Include at least 10 questions about what code outputs or what value a variable holds
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.

---

## GitHub Foundations

**certificationId:** `github-foundations`
**Wrap output in:** `{ "certificationId": "github-foundations", "version": "2024-01", "questions": [...] }`

---

You are an expert GitHub certification question writer. Generate 100 unique practice questions for **GitHub Foundations** in strict JSON format.

## Domains & Weights
| Topic ID | Label | Weight |
|----------|-------|--------|
| `git-github-basics` | Introduction to Git and GitHub | 22% |
| `repositories` | Working with GitHub Repositories | 20% |
| `collaboration` | Collaboration Features | 20% |
| `github-features` | Modern GitHub Features | 18% |
| `project-management` | Project Management & Security | 20% |

## JSON Schema
```json
{
  "id": "github-NNN",
  "type": "single-choice|multiple-choice|yes-no-statements|dropdown-select|ordering",
  "topicId": "git-github-basics|repositories|collaboration|github-features|project-management",
  "difficulty": "easy|medium|hard",
  "points": 1,
  "scenarioText": "optional",
  "questionText": "...",
  "options": [{"id":"A","text":"...","isCorrect":false}],
  "statements": [{"id":"s1","text":"...","isCorrectYes":true}],
  "dropdowns": [{"id":"d1","prompt":"...","options":["..."],"correctAnswer":"..."}],
  "orderItems": [{"id":"o1","text":"...","correctPosition":1}],
  "explanation": {"correct":"...","incorrect":"...","examTip":"...","relatedTopics":["..."]},
  "metadata": {"examObjective":"...","references":["https://resources.github.com/learn/certifications/"],"lastUpdated":"2024-01-15"}
}
```

## Key Content
- Git basics: distributed version control, commits, branches, merge, rebase, clone, push, pull, fetch, stash, tags
- GitHub basics: repositories, README, .gitignore, LICENSE, forks, stars, watching
- Branches: creating, switching, merging, pull requests, branch protection rules
- Pull Requests: creating, reviewing, commenting, approvals, merge strategies (merge commit, squash, rebase), draft PRs
- Issues: creating, labels, assignees, milestones, closing with keywords, issue templates
- GitHub Actions: workflows (YAML), triggers (push, pull_request, schedule), jobs, steps, runners, marketplace actions, secrets
- GitHub Copilot: AI pair programmer, code suggestions, chat, inline suggestions, supported IDEs
- GitHub Codespaces: cloud dev environments, devcontainer.json, customisation, lifecycle
- GitHub Packages: container registry, npm packages, Maven, publishing packages
- GitHub Pages: static site hosting, Jekyll, custom domains
- Security: Dependabot (alerts, security updates, version updates), secret scanning, code scanning (CodeQL), CODEOWNERS
- Project management: GitHub Projects (boards, roadmaps, automation), Wikis, Discussions
- GitHub Mobile, GitHub CLI (gh), GitHub Desktop

## Requirements
- 100 questions, difficulty: 25% easy / 50% medium / 25% hard
- 15+ scenario questions with `scenarioText`
- `options:[]` for non-choice types
- Valid JSON only

**Output:** Raw JSON array only. No preamble.
