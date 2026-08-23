# CertArc v2 — Career-Track Architecture Handoff

## Purpose

Transform CertArc from a single-certification practice app into a vendor-agnostic learning product organized around career tracks. Users browse career paths, expand a track to explore its certifications, and activate a path directly from the tracks page or via Settings. All learning progress is tied to the certification, not the track.

This document is the implementation source of truth for future agents. Work through the checklists in order; update the checkboxes and the **Implementation log** whenever a meaningful change is completed.

## Product goal

CertArc starts as an accessible on-ramp into technology. Its first content library focuses on foundational certifications. Users browse career tracks, expand one to see its cert progression, and activate it — the first free cert in the foundation level becomes their active cert. Advanced certifications and paywall enforcement come later as the content library grows.

The primary journey is:

```text
Tracks (browse + expand + activate) → Dashboard → Study / Exam / Analytics
```

Career tracks: Cloud Engineer, Security Specialist, DevOps Engineer, Network Engineer, Software Developer, Data & AI Engineer, QA & Test Engineer, Systems Administrator, Project Manager.

A certification can belong to more than one track. Progress is keyed by `certificationId`, never by track.

---

## Definition of done

- [x] Users can browse career tracks.
- [x] Clicking a track expands it to show cert details and an "Activate this path" button.
- [x] Activating a path sets the active track and the first free cert.
- [x] Active cert can also be set via Settings dropdown.
- [x] Active cert is visible throughout the app (sidebar widget, dashboard hero).
- [x] Users can study, take exams, view analytics, and see bookmarks for the active cert.
- [x] A completed certification has the same state in every track that references it.
- [x] Question content is authored as validated source files and compiled at build time.
- [x] Question chunks load only when needed.
- [x] Every saved progress field is isolated to a certification.
- [x] Adaptive selection implements full SM-2 scheduling.
- [x] All pages show clear prompts when no cert is active.
- [x] Content load errors surface with actionable messages and a retry button.
- [x] Switching certs mid-session prompts confirmation before discarding the active session.
- [x] Layout adapts across mobile, tablet, and desktop.
- [x] Light and dark themes are both properly styled across all pages.
- [x] The production build and all unit tests pass.
- [x] Compiler validation has fixture-based unit tests.
- [x] Accessibility — skip link, focus traps, ARIA labels, keyboard nav, visible focus rings.
- [x] Track-level analytics — cert progress aggregated per career track.

---

## Current state (August 2026)

### Build and tests

| | Status |
|---|---|
| `npm run build` | ✅ Clean |
| `npm run lint` | ✅ Exit 0 (2 pre-existing warnings, see below) |
| `npx vitest run` | ✅ 54/54 passing in ~2s |

**Lint warnings (pre-existing, not failures):**
- `src/components/MatchingInput.tsx:70` — unused catch parameter `err`
- `scripts/compile-content.mjs:2` — unused `relative` import

Neither is a functional issue. Both can be cleaned up when touching those files.

### Content — 7 certifications compiled

| Cert ID | Name | Questions | Topics | Tier |
|---|---|---|---|---|
| `az-900` | Microsoft Azure Fundamentals | 150 | 4 | free |
| `az-104` | Azure Administrator | 151 | 5 | premium |
| `comptia-a-plus` | CompTIA A+ | 75 | 5 | free |
| `comptia-security-plus` | CompTIA Security+ SY0-701 | 152 | 5 | free |
| `itil-4-foundation` | ITIL 4 Foundation | 161 | 4 | free |
| `linux-essentials` | LPI Linux Essentials | 151 | 5 | free |
| `istqb-foundation` | ISTQB Certified Tester Foundation | **7** | — | free |

⚠️ `istqb-foundation` has only 7 questions — almost certainly a work-in-progress. Either complete the question set or remove it until it meets the quality bar. A cert with 7 questions will give a poor study experience.

Full catalog: `content/catalog.json` — 35 certs defined, 14 free-tier.  
Career tracks: `content/tracks.json` — 9 tracks.

### Test suite

| File | Tests | Environment |
|---|---|---|
| `scripts/__tests__/compile-content.spec.mjs` | 13 | node |
| `src/services/__tests__/AdaptiveEngine.spec.ts` | 26 | node |
| `src/services/__tests__/ExamService.spec.ts` | 6 | jsdom |
| `src/services/__tests__/ProgressService.spec.ts` | 7 | jsdom |
| `src/services/__tests__/DataLoader.spec.ts` | 2 | jsdom |
| **Total** | **54** | |

---

## What is fully working

### Core learning loop
- Browse 9 career tracks → expand → activate → study with SM-2 → mock exam → results + review → per-cert + track-level analytics → bookmarks
- All pages guard against no active cert with clear CTAs pointing to Settings or Tracks

### Adaptive engine (Phase 3)
- 5-tier SM-2 priority: due → weak+unseen → weak+seen → unseen → general
- `qualityScore(isCorrect, confidence)` → 0–5
- `computeNextSm2` — first correct = 1 day, second = 6 days, subsequent = prev × easeFactor; incorrect resets to 1 day, ease floor 1.3
- `selectionReason()` for "why this question" context
- 26 deterministic unit tests

### Analytics (Phase 5)
- **Certification tab** — accuracy, avg time, exam trend bar chart, topic accuracy bars, frequently missed questions
- **Track tab** — overall completion bar, per-cert breakdown with pass/fail status, recommended next cert, track selector

### Accessibility (Phase 5)
- Skip-to-content link + `id="main-content"` on `<main>`
- Reset modal and cert-switch modal: `aria-labelledby`, `aria-describedby`, focus trap, focus management (open → first button, close → trigger), Escape key, backdrop click to close
- TracksPage accordion: `aria-controls`, `aria-hidden` on collapsed panel, `tabIndex=-1` on hidden interactive elements, `aria-label` on toggle buttons
- Answer option buttons: result state in `aria-label` (e.g. "Option A: Text — correct"), result icons `aria-hidden="true"`
- All decorative icons `aria-hidden="true"` throughout
- `.input-surface` — no `outline: none`; global `:focus-visible` provides visible rings
- `role="status"` / `role="alert"` on dynamic status messages

### Cert-switching safety (Phase 5)
- `hasActiveSession()` — true if exam not completed or study session started
- Settings cert dropdown → `handleCertChangeRequest()` → shows confirmation modal if session active
- Confirmation: "End your current session?" → "Keep current cert" or "Switch anyway"
- `selectCertification` always clears `examSession`, study history, and current question

### Error handling and retry (Phase 5)
- `DataLoadError` typed errors: `not-found` | `corrupt` | `network`
- `ErrorBanner` in Layout: error message + Retry button (`retryLastLoad()`) + Dismiss button
- `retryLastLoad()` clears error and re-runs `initialize()`

### Theming
- Dark: deep navy, glowing accents — Light: blue-tinted off-white, real shadows, richer accent
- Theme-aware CSS classes in `src/index.css`: `.card-surface`, `.page-root`, `.text-heading`, `.text-muted`, `.btn-ghost`, `.progress-track`, `.input-surface`, `.modal-surface`, `.hint-row`, `.card-inset`, `.sticky-bar`
- Theme toggle: sidebar (desktop/tablet), Dashboard header, Settings → Appearance section

### Responsive layout
- Mobile < 768px: bottom tab bar (Home, Tracks, Study, Exam, Settings), sidebar hidden
- Tablet 768–1023px: 64px icon-only sidebar
- Desktop ≥ 1024px: full 240px sidebar with cert widget and streak

### Freemium model (data ready, gating not built)
- `accessTier: "free"` — beginner certs, always accessible
- `accessTier: "premium"` — intermediate/advanced, gating not implemented
- The field is on every catalog cert and manifest entry — enforcement only needs to read it

---

## What still needs to be done

### High priority

**1. Complete or remove istqb-foundation content**
7 questions is not viable. Either finish the question set to a reasonable minimum (40+ questions covering all topics) or remove the `certification.json` / `questions.json` and re-run `npm run content:build` to drop it from the compiled manifest.

**2. Finalize the 10-cert foundational catalogue (Phase 0)**
Which 10 certs constitute the launch set? This decision gates everything else. The current 7 compiled certs are a starting point but the list isn't ratified. Once confirmed, set minimum question counts and topic coverage requirements per cert.

**3. More question content**
6 of the 7 certs have good question counts. The pipeline is ready — drop `questions.json` + `certification.json` into `content/certifications/<vendor>/<id>/` and run `npm run content:build`.

### Medium priority

**4. Paywall enforcement**
`accessTier` is in the data model on every cert. Enforcement needs:
- An auth layer (user identity + subscription status)
- A check in `selectCertification` and the cert detail page that blocks premium certs for free users
- A "Unlock premium" CTA and upgrade flow
Deliberately deferred until auth exists.

**5. Generated-asset commit policy (Phase 0)**
Decide: commit `public/data/` to git for simple static hosting, or generate it only in CI. Currently committed. If moving to CI-only generation, add `public/data/` to `.gitignore` and ensure the deployment pipeline runs `npm run content:build` before `npm run build`.

**6. Fix the two lint warnings**
Both are trivial:
- `MatchingInput.tsx:70` — change `} catch (err) {` to `} catch {`
- `compile-content.mjs:2` — remove `relative` from the destructured import

**7. Offline handling**
The error banner + retry covers load failures, but there's no offline detection or service worker. A minimal approach would be to detect `navigator.onLine` and show a specific "You appear to be offline" message rather than a generic network error.

### Low priority / future

**8. Full AT-assisted accessibility audit**
The structural ARIA fixes are applied, but a full audit with VoiceOver/NVDA + keyboard-only navigation hasn't been run. WCAG 2.1 AA compliance is a goal; it needs human + AT verification to confirm.

**9. Shared cert progress test**
AZ-900 appears in multiple tracks. Progress is keyed by certId so it's structurally correct, but there is no automated test that verifies the same progress object appears in both the Cloud Engineer and Data track analytics views.

**10. Track-level completion milestone**
When a user passes all available certs in a track, there's no celebration / completion state. A "Track complete" screen or dashboard call-out would be a nice milestone.

**11. SM-2 "due today" indicator**
`AdaptiveEngine.getDueQuestions()` exists but nothing in the UI surfaces how many questions are due for review. A "N questions due for review" badge on the cert detail page or dashboard would close the loop.

---

## Content source structure

```text
content/
  catalog.json                        ← 35 certs (vendor info, accessTier, domains)
  tracks.json                         ← 9 career tracks
  certifications/
    axelos/itil-4-foundation/
    comptia/comptia-a-plus/
    comptia/comptia-security-plus/
    istqb/istqb-foundation/            ← ⚠️ only 7 questions — incomplete
    lpi/linux-essentials/
    microsoft/az-900/
    microsoft/az-104/

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

1. Create `content/certifications/<vendor>/<cert-id>/certification.json` — match schema in existing examples
2. Create `content/certifications/<vendor>/<cert-id>/questions.json` — `{ certificationId, version, questions: [...] }`
3. Topic IDs in `certification.json` must exactly match `topicId` values used in questions
4. Cert ID must match an entry in `content/catalog.json`
5. Run `npm run content:build`
6. Done — no application code changes needed

---

## Phase delivery status

| Phase | Status | Notes |
|---|---|---|
| Phase 0 — decisions | ⚠️ Mostly complete | 10-cert catalogue, quality thresholds, asset policy still open |
| Phase 1 — progress model + migration | ✅ Complete | |
| Phase 2 — content pipeline | ✅ Complete | 7 certs; ISTQB incomplete |
| Phase 3 — SM-2 adaptive engine | ✅ Complete | 26 deterministic tests |
| Phase 4 — career-track UI | ✅ Complete | |
| Phase 5 — analytics + hardening | ✅ Complete | AT audit + shared cert test still outstanding |

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
| Data loading | `src/services/DataLoader.ts` |
| Adaptive engine | `src/services/AdaptiveEngine.ts` |
| Content validation | `scripts/validate-content.mjs` |
| Compiler | `scripts/compile-content.mjs` |
| Types | `src/types/index.ts` |

---

## Risks and guardrails

- Only ingest question content approved for use. No protected exam material.
- Use stable, globally unique question IDs. Changing IDs loses saved statistics.
- Topic IDs in `certification.json` must exactly match question `topicId` values — the compiler rejects mismatches.
- Keep application code vendor-agnostic. Provider-specific behavior belongs in content/metadata.
- Never store progress by track — always by `certificationId`.
- Treat `public/data/` as disposable. Source content and compiler are the durable assets.
- `accessTier` is in the data model but **not enforced**. Do not assume gating is active.

---

## Implementation log

| Date | Change |
|---|---|
| 2026-08-13 | Created v2 handoff, Phase 0 scope confirmed |
| 2026-08-13 | Phase 1 — per-cert progress model, v1 migration, unit tests |
| 2026-08-15 | Phase 0 refined to fundamentals-first |
| 2026-08-15 | Phase 2 — AZ-900 compiled, compiler validates, chunk loader |
| 2026-08-15 | Phase 4 initial — routes, tracks page, cert detail, sidebar |
| 2026-08-15 | Full catalog + tracks integrated (35 certs, 9 tracks, accessTier) |
| 2026-08-15 | Tracks accordion, activation flow |
| 2026-08-15 | ITIL 4 + AZ-104 + Security+ + A+ + Linux Essentials added |
| 2026-08-15 | Responsive layout; light theme; theme-aware CSS classes; compiler tests |
| 2026-08-15 | Phase 3 — SM-2 engine (qualityScore, computeNextSm2, 5-tier selection, 26 tests) |
| 2026-08-15 | Phase 5 — analytics (cert + track tabs), accessibility audit + fixes |
| 2026-08-23 | Phase 5 — cert-switching safety modal, error retry button |
| 2026-08-23 | ISTQB Foundation added (7 questions — incomplete, needs completion) |
| 2026-08-23 | Build clean, 54/54 tests passing, handoff updated |

---

## Notes

### ISTQB Foundation — questions pending

Updated ISTQB questions have been saved to `content/testing.txt` and will be integrated at a later date.

When ready:
1. Format the questions into the standard schema (`{ certificationId, version, questions: [...] }`)
2. Replace `content/certifications/istqb/istqb-foundation/questions.json`
3. Update `questionCount` in `content/certifications/istqb/istqb-foundation/certification.json`
4. Run `npm run content:build`

The cert will automatically appear in the app with full SM-2 and analytics support — no code changes needed.
