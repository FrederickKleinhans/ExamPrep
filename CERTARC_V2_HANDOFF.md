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

## Current state (September 2026)

### Build and tests

| | Status |
|---|---|
| `npm run build` | ✅ Clean |
| `npm run lint` | ✅ Exit 0, zero warnings |
| `npx vitest run` | ✅ 59/59 passing |
| Vercel config | ✅ `vercel.json` ready |
| TypeScript | ✅ `npx tsc -b` passing |

### Content — 16 certifications compiled

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

Full catalog: `content/catalog.json` — 33 certs defined, with 9 tracks in `content/tracks.json`. AWS AI Practitioner is currently catalog-only because its question bank is not yet present. The compiler skips catalog-only certification folders that do not yet contain `questions.json`, with a warning.

### Test suite — 59 tests, 5 files

| File | Tests |
|---|---|
| `scripts/__tests__/compile-content.spec.mjs` | 13 |
| `src/services/__tests__/AdaptiveEngine.spec.ts` | 26 |
| `src/services/__tests__/ExamService.spec.ts` | 9 |
| `src/services/__tests__/ProgressService.spec.ts` | 9 |
| `src/services/__tests__/DataLoader.spec.ts` | 2 |

---

## What is fully working

### Core loop
Browse tracks → activate → study (SM-2) → exam → results + review → analytics → bookmarks

Exam question selection uses a non-mutating Fisher–Yates shuffle, so each session
selects a unique, unbiased subset of the available question bank.

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
- Optional Supabase email/password and Google/GitHub OAuth
- Guest mode remains localStorage-only when Supabase is not configured
- Authenticated progress syncs to the `user_progress` table
- Guest progress is merged into remote progress on first sign-in
- Remote exam results win on duplicate IDs; question stats, SM-2 schedules, and bookmarks are merged
- Stale in-flight sign-in pulls are cancelled after sign-out or session changes
- Supabase RLS schema is defined in `supabase/schema.sql`
- `.env.local` setup is documented in `.env.example`
- Guest policy: the first certification is available locally; switching to another certification requires sign-in
- Signed-in users can unlock one additional certification switch through the support flow
- Buy Me a Coffee support is live at `https://buymeacoffee.com/fredintech`; the current unlock uses an honor-system local flow
- Google AdSense/Ad Manager application submitted; rewarded ads remain disabled pending approval and ad-unit configuration

---

## What still needs to be done

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

**Content pipeline** — the single biggest unlock. Adding a new cert requires zero application code changes. Drop two JSON files, run one command. The compiler validates every question, generates chunks, and emits all manifests. At 16 compiled certs it's fast; at 100 it'll still work.

**Data model** — `certificationId` is the universal key. Progress, SM-2 schedules, exam history, bookmarks are all isolated per cert. A new cert never touches existing progress.

**Tracks are pure metadata** — tracks reference cert IDs, nothing more. Adding a track means adding an entry to `content/tracks.json`. No code changes.

**SM-2 engine** — fully cert-agnostic. Works identically for any cert with any question set.

### Where scaling will create pressure

**1. Question bank size in memory**

Currently each study session loads one topic chunk on demand (~30–50 questions). As question counts grow past ~500 per cert this stays fine. At 1000+ questions per cert, consider:
- Lazy-loading additional chunks mid-session rather than pre-loading the first chunk at cert activation
- Already implemented: `DataLoader.loadTopicChunk()` fetches on demand and caches

**2. The Settings cert dropdown**

At 16 compiled certs it's usable. At 30+ compiled certs the dropdown becomes unwieldy. Consider replacing with a searchable cert picker or routing cert activation through the Tracks page only.

**3. `content/catalog.json` as the source of truth**

Currently 35 certs in one file. At 100+ certs this stays manageable — it's read once at compile time, never at runtime. If it grows unwieldy, split by domain: `content/catalog/cloud.json`, `content/catalog/security.json` etc. The compiler would need a small update to merge them.

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
  catalog.json                        ← 35 certs (vendor, accessTier, domains)
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
