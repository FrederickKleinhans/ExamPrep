# CertArc

CertArc is a certification exam-preparation app for building knowledge through focused practice, adaptive review, and mock exams. Progress is saved locally, with optional account-based sync.

## Features

- Practice questions organized by certification and exam topic
- Adaptive study sessions with spaced-repetition review
- Timed mock exams with answer review
- Custom exams filtered by topic and question count
- Study-session and exam recovery after a refresh in the same tab
- Retry sessions built from previously missed questions
- A practice-readiness estimate based on question and mock-exam history
- Official references and keyboard shortcuts while answering questions
- Installable PWA with offline access to the generated question banks
- In-app question reports (requires the Supabase schema)
- Bookmarks, flashcards, progress analytics, and certification tracks
- Optional Supabase sign-in and cross-device progress sync
- Guest mode for studying without an account

## Requirements

- Node.js 22.12 or newer
- npm

The repository pins the expected major version in [.nvmrc](./.nvmrc) and declares the supported range in [package.json](./package.json).

## Getting started

```sh
npm ci
npm run dev
```

For PowerShell, copy the environment template with `Copy-Item .env.example .env.local`; in a POSIX shell, use `cp .env.example .env.local`.

The app works in guest mode without environment variables. To enable authentication and cloud sync, add your Supabase project URL and anon key to `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Apply the database setup in [`supabase/schema.sql`](./supabase/schema.sql) to the Supabase project. Never put a service-role key in a `VITE_` variable; browser-exposed variables are public.

## Content pipeline

Question and certification sources live under [`content/`](./content/). The files in `public/data/` are generated output and are intentionally not committed.
Historical question-generation prompts and provenance notes are kept in [`docs/question-generation-prompts/`](./docs/question-generation-prompts/).

```sh
npm run content:build
```

This validates the content sources and compiles the manifests, catalog, and topic question chunks that the app loads from `/data`. Run it before starting the Vite dev server. The production build runs this step automatically:

```sh
npm run build
```

The validator fails on invalid content and topics with no questions; it warns when large question banks are substantially out of balance with their topic weights.

## Checks

```sh
npm run lint
npm run format
npm run test -- --run
```

The production build runs the TypeScript project check. Prettier is available through `npm run format` to apply the repository formatting rules.

GitHub Actions runs the content build, type-check, lint, and tests on pushes to `main` and pull requests.

## Roadmap

- Expand and review question coverage across every certification topic
- Add due-review reminders and make daily practice easier to discover
- Continue refining exam-readiness insights and content-quality workflows

## License

CertArc is proprietary software. See [LICENSE](./LICENSE) for the terms.
