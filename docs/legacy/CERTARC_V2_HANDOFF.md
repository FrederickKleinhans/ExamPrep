# CertArc v2 — Career-Track Architecture Handoff

## Purpose

Transform CertArc from a single-certification practice app into a vendor-agnostic learning product organized around career tracks. Users browse career paths, expand a track to explore its certifications, and activate a path directly from the tracks page or via Settings. All learning progress is tied to the certification, not the track.

---

## Product goal

CertArc starts as an accessible on-ramp into technology. Users browse career tracks, expand one to see its cert progression, and activate it. The first free cert in the foundation level becomes their active cert. Advanced certifications and paywall enforcement come later as the content library grows.

```text
Tracks (browse + expand + activate) → Dashboard → Study / Exam / Analytics
```

9 career tracks: Cloud Engineer, Security Specialist, DevOps Engineer, Network Engineer, Software Developer, Data & AI Engineer, QA & Test Engineer, Systems Administrator, Project Manager.

---

## Current state (September 26, 2026)

### Deployment and authentication

- Production site: [CertArc — Exam Preparation](https://certarc-one.vercel.app/)
- Vercel production deployment tracks `main`.
- The former site uses the `old-site-redirect` branch and permanently redirects visitors to the matching path on the new site.
- Production and local email/password sign-up, sign-in, and email confirmation have been verified.
- Production and local builds use the current Supabase project through `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Supabase email confirmation redirects to the origin where registration started:
  - `https://certarc-one.vercel.app/`
  - `http://localhost:5173/`
- Supabase progress storage uses the RLS-protected `user_progress` table defined in `supabase/schema.sql`.
- Google and GitHub OAuth buttons are present in the UI but still require provider configuration in Supabase before they can be used.

### Build and tests

| | Status |
|---|---|
| `npm run build` | ✅ Clean |
| `npm run lint` | ✅ Exit 0, zero warnings |
| `npx vitest run` | ✅ 59/59 passing |
| Vercel config | ✅ Production site deployed; old site redirects |
| TypeScript | ✅ `npx tsc -b` passing |

### Content — 18 certifications compiled

| Cert ID | Name | Questions | Tier |
|---|---|---|---|
| `itil-4-foundation` | ITIL 4 Foundation | 161 | free |
| `comptia-a-plus` | CompTIA A+ | 75 | free |
| `comptia-security-plus` | CompTIA Security+ | 152 | free |
| `comptia-network-plus` | CompTIA Network+ | 100 | free |
| `github-foundations` | GitHub Foundations | 100 | free |
| `cissp` | CISSP | 100 | premium |
| `isc2-cc` | ISC² Certified in Cybersecurity | 130 | free |
| `istqb-agile` | ISTQB Agile Tester | 100 | premium |
| `istqb-foundation` | ISTQB Certified Tester Foundation Level | 126 | free |
| `linux-essentials` | Linux Essentials | 151 | free |
| `ai-900` | Azure AI Fundamentals | 100 | free |
| `az-900` | Microsoft Azure Fundamentals | 150 | free |
| `az-104` | Azure Administrator | 151 | premium |
| `dp-900` | Azure Data Fundamentals | 103 | free |
| `sc-900` | Microsoft Security, Compliance, and Identity Fundamentals | 100 | free |
| `psm-i` | Professional Scrum Master I | 100 | free |
| `aws-ai-practitioner` | AWS AI Practitioner | 100 | free |
| `ms-900` | MS-900 | 100 | free |

Full catalog: `content/catalog.json` — 33 certs defined, with 9 tracks in `content/tracks.json`. Catalog-only certification folders without `questions.json` are skipped by the compiler with an explicit warning.

### Test suite — 62 tests, 7 files

| File | Tests |
|---|---|
| `scripts/__tests__/compile-content.spec.mjs` | 13 |
| `src/services/__tests__/AdaptiveEngine.spec.ts` | 26 |
| `src/services/__tests__/ExamService.spec.ts` | 10 |
| `src/services/__tests__/ProgressService.spec.ts` | 9 |
| `src/services/__tests__/DataLoader.spec.ts` | 2 |
| `src/store/__tests__/useStore.spec.ts` | 1 |
| `src/components/__tests__/Dashboard.spec.ts` | 1 |

---

## What is fully working

### Core loop
Browse tracks → activate → study (SM-2) → exam → results + review → analytics → bookmarks

Mock exams load the full certification question bank, then use a non-mutating
Fisher–Yates shuffle to select up to 30 unique questions per attempt. Each new
attempt shuffles independently, so the set can vary between exams; as with any
random selection, questions or even a full set may occasionally repeat.

### SM-2 Adaptive engine
- 5-tier priority: due → weak+unseen → weak+seen → unseen → general
- `qualityScore(isCorrect, confidence)` → 0–5 SM-2 quality
- `computeNextSm2` — intervals: 1d → 6d → N×easeFactor; incorrect resets to 1d, ease floor 1.3
- `selectionReason()` for "why this question" context
- Due-count badge on cert detail page and dashboard hero

### Analytics
- Cert tab — accuracy, avg time, exam trend, topic bars, frequently missed
- Track tab — overall completion, per-cert breakdown, recommended next cert

### UI / UX
- Dark + light themes, all pages use CSS variables
- Responsive: mobile tab bar / tablet icon sidebar / desktop full sidebar
- Mobile-friendly header stacking on Study, Exam, Dashboard hero
- SM-2 "due for review" badge on cert detail + dashboard
- Track completion celebration when all certs in a track are passed
- Offline detection — banner shows 📶 offline message vs ⚠️ load error, auto-retries when reconnected

### Safety / reliability
- Cert-switching confirmation modal in Settings AND CertificationPage (Study/Exam/Set as active)
- Error banner with Retry + Dismiss
- All pages guard against no active cert

### Accessibility
- Skip-to-content link
- Focus traps on all modals (reset, cert-switch)
- `aria-controls`, `aria-hidden` on track accordion panels
- Result state in answer option `aria-label`
- `role="status"` / `role="alert"` on dynamic messages
- Keyboard arrow/Home/End navigation for radio and checkbox answer groups
- Touch-friendly 44px interactive targets and mobile-first modal sizing
- Responsive sidebar sign-in affordance on desktop and tablet
- Mobile dashboard fits the viewport without horizontal scrolling
- Tablet account controls provide a dedicated, usable sign-out target
- Sidebar theme toggle removed; theme controls remain on Dashboard and Settings
- Expanded track panels use viewport-aware internal scrolling so activation controls remain reachable
- Guest certification guard consistently requires sign-in before switching to a second certification
- Certification selection keeps the selected career path synchronized across Tracks and Settings

### Auth and progress sync
- Supabase email/password authentication is working locally and in production, including confirmation-email redirects
- Google/GitHub OAuth is scaffolded in the UI but requires provider setup before use
- Guest mode remains localStorage-only when Supabase is not configured
- Authenticated progress syncs to the `user_progress` table
- Guest progress is merged into remote progress on first sign-in
- Remote exam results win on duplicate IDs; question stats, SM-2 schedules, and bookmarks are merged
- Stale in-flight sign-in pulls are cancelled after sign-out or session changes
- Supabase RLS schema is defined in `supabase/schema.sql`
- `.env.local` setup is documented in `.env.example`
- Production requires the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables to be available during the Vercel build
- Guest policy: the first certification is available locally; switching to another certification requires sign-in
- Signed-in users can unlock one additional certification switch through the support flow
- Buy Me a Coffee support is live at `https://buymeacoffee.com/fredintech`; the current unlock uses an honor-system local flow
- Google AdSense/Ad Manager application submitted; rewarded ads remain disabled pending approval and ad-unit configuration

---

## What still needs to be done

### Product-quality roadmap (before monetization)

Build learning value and reliability first; defer payment implementation until the product has been tested with learners and its core study experience is strong.

#### 1. Review the learner experience
- Walk through the main learner journeys: choose a career track, activate a certification, study, take an exam, review results, revisit weak areas, and sign in to sync progress.
- Check desktop and mobile behavior, empty/error/loading states, navigation clarity, accessibility, and whether progress is understandable and recoverable.
- Record issues by impact on learning, frequency, and effort; fix the highest-impact usability and reliability problems before adding more features.
- **Exit criteria:** a prioritized, actionable list of product gaps with the highest-impact blockers addressed and regression coverage for affected behavior.

##### Review and final walkthrough — September 26, 2026

Reviewed first-run dashboard, Tracks, and no-active-certification states on desktop and a narrow mobile viewport. Walked through certification activation, study, mock exam, results/review, analytics, and progress sync. Checked loading/error states and keyboard-accessible track expansion.

| Priority | Finding | Status / next step |
|---|---|---|
| P1 | The dashboard's `Start study` action sent new learners to an empty Practice page even though they had no active certification. | Fixed: the dashboard now routes new learners to Tracks and labels the action `Choose a certification`. |
| P1 | The no-active states on Practice, Exam, and Analytics directed learners to Settings, while the dashboard's onboarding flow directs them to career paths. | Fixed: each empty state now points to Browse career paths; Practice and Exam use client-side links. |
| P1 | AZ-900's exam setup advertised 150 questions, but exam sessions used only the first loaded topic chunk (30 questions). | Fixed: exam start loads the complete question bank and samples 30 unique questions for a mock; setup distinguishes mock length from bank size. Regression tests verify full-bank sampling and that separate starts can select different question sets. |
| P2 | The dashboard Share action still used the old Vercel address. | Fixed: it now shares the current CertArc production URL. |
| P2 | Track cards summarized the full path, while study-content availability was only clear after opening a path; many listed certifications say `Content coming soon`. | Fixed: collapsed cards now show how many certifications have content, while expanded rows retain the per-cert `Content coming soon` notice. |
| P2 | New learners saw zero-valued completion, score, streak, and exam metrics before starting a certification; study accuracy could also appear as average exam score. | Fixed: empty metrics show an em dash and next-step guidance; average score now reflects exam attempts only. Completion clarifies that it counts questions across all certifications. |
| P2 | The dashboard showed a zero-percent “Start studying to see weak areas” row as if it were measured performance. | Fixed: when there is no weak-area data, the dashboard explains how to generate it and provides a Study action. Added a first-run dashboard regression test. |

Completed a controlled local-profile walkthrough of certification activation, study answer/explanation, exam session, submission/results/review, and analytics. The first-run dashboard and collapsed Tracks cards were rechecked locally after the fixes. Mock exams sample 30 unique questions from the full available bank, with an independent random selection for each start. The intentionally unanswered test exam recorded 0% only in the isolated local test profile. The learner-experience audit is complete: the highest-impact navigation and exam-length issues are fixed, remaining content availability is clearly disclosed, and affected behavior has regression coverage. Latest validation: 62 tests across 7 files, lint, production build, and `git diff --check` passed. The remaining product work is the separate question-quality review and flashcards pilot; the catalog still has certifications without question content.

#### 2. Improve question and explanation quality
- Define a question-quality checklist covering accuracy, clarity, exam-objective alignment, plausible distractors, unambiguous answers, useful explanations, and original/authentic content.
- Audit representative questions from the current certification banks against the checklist; log and correct factual errors, duplicates, ambiguity, and weak explanations.
- Add or improve automated content checks where practical, while retaining subject-matter review for correctness and pedagogy.
- **Exit criteria:** agreed quality standards, audited pilot banks, fixed high-severity content issues, and a repeatable review process for future question additions.

#### 3. Build and validate a free flashcards pilot
- Select one pilot certification after the experience and content reviews, favoring a bank with strong coverage and reviewed source material.
- Create purpose-written concept cards rather than mechanically turning every multiple-choice question into a card.
- Build a focused study loop with card reveal, learner rating, due-card review, and clear session progress.
- Keep flashcard scheduling/progress separate from quiz and exam statistics. Support guest-local persistence first and signed-in sync without overwriting existing progress.
- Test card scheduling, persistence, sign-in merge/sync, empty states, accessibility, and mobile interaction.
- **Exit criteria:** learners can complete repeatable review sessions, see their card progress, and use flashcards without changing their question-answer or exam history.

#### Sequence and decision gate
Complete the experience review first, use its findings to guide content and interface work, then ship the flashcard pilot using reviewed material. Collect learner feedback and usage evidence before expanding decks or implementing payments. Payment and entitlement work remains deferred until these product-quality milestones are met.

### Content (main work)
- Most of the 33 catalog certifications still have no questions yet
- Adding a cert: drop `certification.json` + `questions.json` into `content/certifications/<vendor>/<id>/`, run `npm run content:build`
- Catalog-only folders without `questions.json` are skipped by the compiler with an explicit warning

### Product decisions (Phase 0, still open)
- Exact 10-cert foundational catalogue not ratified
- Minimum question count / quality threshold per cert not defined
- Generated-asset commit policy not confirmed (currently committed to git)

### Medium priority
- **Paywall enforcement** — `accessTier` is in every cert/manifest and auth is now available; enforce premium access consistently
- **Monetization wiring** — configure and verify Google rewarded ads after approval; add real reward validation before production use
- **Shared cert progress test** — AZ-900 appears in multiple tracks; no automated test verifies identical progress across both track analytics views

### Low priority
- Service worker / offline caching
- Full AT-assisted accessibility audit (VoiceOver/NVDA)

---

## Scaling strategy

### What we've built that scales cleanly

**Content pipeline** — the single biggest unlock. Adding a new cert requires zero application code changes. Drop two JSON files, run one command. The compiler validates every question, generates chunks, and emits all manifests. At 18 compiled certs it's fast; at 100 it'll still work.

**Data model** — `certificationId` is the universal key. Progress, SM-2 schedules, exam history, bookmarks are all isolated per cert. A new cert never touches existing progress.

**Tracks are pure metadata** — tracks reference cert IDs, nothing more. Adding a track means adding an entry to `content/tracks.json`. No code changes.

**SM-2 engine** — fully cert-agnostic. Works identically for any cert with any question set.

### Where scaling will create pressure

**1. Question bank size in memory**

Currently each study session loads one topic chunk on demand (~30–50 questions). As question counts grow past ~500 per cert this stays fine. At 1000+ questions per cert, consider:
- Lazy-loading additional chunks mid-session rather than pre-loading the first chunk at cert activation
- Already implemented: `DataLoader.loadTopicChunk()` fetches on demand and caches

**2. The Settings cert dropdown**

At 18 compiled certs it's usable. At 30+ compiled certs the dropdown becomes unwieldy. Consider replacing with a searchable cert picker or routing cert activation through the Tracks page only.

**3. `content/catalog.json` as the source of truth**

Currently 33 certs in one file. At 100+ certs this stays manageable — it's read once at compile time, never at runtime. If it grows unwieldy, split by domain: `content/catalog/cloud.json`, `content/catalog/security.json` etc. The compiler would need a small update to merge them.

**4. `public/data/` committed to git**

Works fine for static hosting up to ~50 certs / ~50k questions. Past that, generated assets add significant repo weight. At scale, move to CI-only generation and serve from a CDN. The pipeline already supports this — just add `public/data/` to `.gitignore` and run `npm run content:build` in the deploy step.

**5. localStorage progress store**

`certready_progress` stores all cert progress in one localStorage key. At 10 certs with 200 questions each, the key is ~50–100KB — fine. At 50 certs heavily used, it could approach the 5–10MB browser limit. Mitigation:
- Split into per-cert keys: `certready_progress_<certId>` (requires ProgressService refactor)
- Or sync to a backend (requires auth)
- SM-2 schedules are the most data-heavy part per question

**6. Paywall / auth**

The auth foundation is now implemented. The remaining product work is premium enforcement:
- `accessTier: "free"` → always accessible, no auth required
- `accessTier: "premium"` → check subscription in `selectCertification` and on the cert detail page
- The `accessTier` field is already on every cert in the catalog and manifest; subscription state still needs to be added before premium gating is complete

**7. Multi-user / backend**

Authenticated users now have optional Supabase sync:
- Keep the existing `UserProgress` type as the canonical shape
- `ProgressService.saveProgress()` writes to localStorage and queues a background Supabase upsert
- On sign-in, remote progress is fetched and merged with local progress
- Guest mode remains fully offline/localStorage-only
- Live Supabase smoke test passed: authenticated progress created a `user_progress` row and persisted across sign-out/sign-in
- Multi-device verification remains a recommended follow-upady designed for this: `userId` is in the root, certs are isolated

### Recommended next scale steps (in order)

1. **Content** — get to 20 compiled certs. The pipeline handles it, no code changes needed.
2. **Auth + backend sync** — once you want cross-device or multi-user. Build on the existing `userId` in progress.
3. **Paywall** — add after auth. One check in `selectCertification`.
4. **Searchable cert picker** in Settings — when the dropdown gets unwieldy.
5. **CI-only asset generation** — when repo size from `public/data/` becomes a concern.

---

## Content source structure

```text
content/
  catalog.json                        ← 33 certs (vendor, accessTier, domains)
  tracks.json                         ← 9 career tracks
  certifications/
    axelos/itil-4-foundation/
    comptia/a-plus/
    comptia/comptia-security-plus/
    isc2/cissp/
    isc2/isc2-cc/
    istqb/istqb-foundation/
    lpi/linux-essentials/
    microsoft/az-900/
    microsoft/az-104/
    microsoft/az-204/
    microsoft/dp-900/
    microsoft/sc-900/

scripts/
  compile-content.mjs                 ← compiler entry point
  validate-content.mjs                ← shared validation (compiler + tests)
  __tests__/compile-content.spec.mjs  ← 13 fixture tests
  __tests__/fixtures/valid/

public/data/                          ← generated; never hand-edit
  catalog.json / tracks.json / manifest.json
  certifications/<id>/manifest.json
  certifications/<id>/topics/<topicId>.json
```

### Adding a new certification

1. Create `content/certifications/<vendor>/<cert-id>/certification.json`
2. Create `content/certifications/<vendor>/<cert-id>/questions.json` — `{ certificationId, version, questions: [...] }`
3. Topic IDs in `certification.json` must exactly match `topicId` values used in questions
4. Cert ID must match an entry in `content/catalog.json`
5. Run `npm run content:build`
6. Done — no application code changes

---

## Phase delivery status

| Phase | Status |
|---|---|
| Phase 0 — decisions | ⚠️ Mostly complete (catalogue + thresholds + asset policy open) |
| Phase 1 — progress model + migration | ✅ Complete |
| Phase 2 — content pipeline | ✅ Complete |
| Phase 3 — SM-2 adaptive engine | ✅ Complete |
| Phase 4 — career-track UI | ✅ Complete |
| Phase 5 — analytics + hardening | ✅ Complete |
| Phase 6 — auth, sync, accessibility, responsive polish | ✅ Complete; live Supabase sign-in, persistence, and sign-out verification passed |

---

## Key files

| Concern | File |
|---|---|
| Routes / layout | `src/App.tsx`, `src/components/Layout.tsx` |
| Global styles + theme | `src/index.css` |
| Dashboard | `src/pages/DashboardPage.tsx`, `src/components/Dashboard.tsx` |
| Tracks | `src/pages/TracksPage.tsx` |
| Cert detail | `src/pages/CertificationPage.tsx` |
| Study | `src/pages/StudyPage.tsx`, `src/components/QuestionCard.tsx` |
| Exam | `src/pages/ExamPage.tsx` |
| Analytics | `src/pages/AnalyticsPage.tsx`, `src/services/AnalyticsService.ts` |
| Bookmarks | `src/pages/BookmarksPage.tsx` |
| Settings | `src/pages/SettingsPage.tsx` |
| Store | `src/store/useStore.ts` |
| Theme | `src/store/useTheme.ts` |
| Progress | `src/services/ProgressService.ts` |
| Auth | `src/store/useAuth.ts`, `src/components/AuthModal.tsx` |
| Cloud sync | `src/services/SyncService.ts`, `supabase/schema.sql` |
| Data loading | `src/services/DataLoader.ts` |
| Adaptive engine | `src/services/AdaptiveEngine.ts` |
| Content validation | `scripts/validate-content.mjs` |
| Compiler | `scripts/compile-content.mjs` |
| Types | `src/types/index.ts` |
| Vercel config | `vercel.json` |

---

## Risks and guardrails

- Only ingest question content approved for use. No protected exam material.
- Use stable, globally unique question IDs. Changing IDs loses saved statistics.
- Topic IDs in `certification.json` must exactly match question `topicId` values — compiler rejects mismatches.
- Keep application code vendor-agnostic. Provider-specific behavior belongs in content/metadata.
- Never store progress by track — always by `certificationId`.
- Treat `public/data/` as disposable. Source content and compiler are the durable assets.
- `accessTier` is in the data model but **not enforced**. Do not assume premium gating is active.
- Supabase auth/sync requires `.env.local`, the SQL schema, configured auth providers, and redirect URLs.

---

## Implementation log

| Date | Change |
|---|---|
| 2026-08-13 | Created v2 handoff, Phase 0 scope confirmed |
| 2026-08-13 | Phase 1 — per-cert progress model, v1 migration, unit tests |
| 2026-08-15 | Phase 0 refined to fundamentals-first |
| 2026-08-15 | Phase 2 — AZ-900 compiled, compiler validates, chunk loader |
| 2026-08-15 | Phase 4 — routes, tracks page, cert detail, sidebar, dashboard |
| 2026-08-15 | Full catalog + tracks (35 certs, 9 tracks, accessTier) |
| 2026-08-15 | Responsive layout; light/dark themes; CSS classes; compiler tests |
| 2026-08-15 | Phase 3 — SM-2 engine (5-tier, qualityScore, 26 tests) |
| 2026-08-15 | Phase 5 — analytics (cert + track), accessibility, cert-switch safety |
| 2026-08-23 | 11 certs compiled; ISTQB questions integrated (126q) |
| 2026-08-23 | Small items — SM-2 due badge, track completion, offline detection |
| 2026-08-23 | Scaling strategy documented; handoff updated |
| 2026-09-21 | Added Supabase auth, RLS-backed progress sync, merge hardening, and auth lifecycle safeguards |
| 2026-09-21 | Added keyboard answer navigation, touch targets, mobile-first modal sizing, and responsive sidebar fixes |
| 2026-09-22 | Removed duplicate sidebar theme toggle; theme controls remain on Dashboard and Settings |
| 2026-09-22 | Verified live Supabase sign-in, progress persistence, `user_progress` row creation, and sign-out/sign-in recovery |
| 2026-09-22 | Fixed mobile dashboard overflow and tablet account/sign-out controls |
| 2026-09-22 | Replaced sort-based exam randomization with Fisher–Yates and added selection regression tests |
| 2026-09-22 | Added scrollable expanded track panels and closed guest Set active / track activation bypasses |
| 2026-09-22 | Synchronized career-path selection when activating certifications from Tracks or Settings |
| 2026-09-22 | Added sign-in plus one-switch support unlock flow for certification selection |
| 2026-09-22 | Added live Buy Me a Coffee support link; Google AdSense/Ad Manager application submitted |
| 2026-09-26 | Implemented the AZ-900 flashcards pilot with separate per-card SM-2 scheduling (Again/Hard/Good/Easy map to qualities 0/3/4/5), due review, local persistence, and signed-in sync |
| 2026-09-28 | Generalized flashcards to derive cards from the active certification question bank, including supported choice, statement, dropdown, ordering, matching, and drag/drop answers; schedules remain separate per certification |
| 2026-09-25 | Published CertReady production deployment, redirected the former Vercel site, and updated the page title to CertArc — Exam Preparation |
| 2026-09-25 | Recreated the Supabase project and verified local/production email sign-up, sign-in, confirmation redirects, and progress-sync configuration |
| 2026-09-26 | Added a pre-monetization product roadmap for learner-experience review, content quality, and a free flashcards pilot |
| 2026-09-26 | Audited first-run learner navigation; routed new learners to career paths and corrected the dashboard share URL |
| 2026-09-26 | Set mock exams to sample 30 unique questions from the full certification bank and clarified exam setup counts |
| 2026-09-26 | Documented that mock exams independently randomize their 30-question sample; added a regression test for varying samples |
| 2026-09-26 | Completed learner-experience audit; clarified track content availability and made empty dashboard metrics actionable |
| 2026-09-28 | Made question-bank flashcards responsive across viewport sizes and added selectable 5/10/15/20-card sessions |
