# AI Job Interview Coach — Frontend

Upload a CV (PDF) and paste a job description; the app generates a personalized 8-question
mock interview, runs it as a chat with live scoring and follow-up questions, and (per the
backend contract) produces a final AI-written readiness report.

This is the frontend only — it calls a separate FastAPI backend over HTTP and does not
implement any AI/business logic itself. Backend: `ai-interview-coach-backend`, deployed at
`https://ai-interview-coach-backend-g522.onrender.com` (free tier — spins down after 15 min
idle, first request after that can take up to ~60s to wake up).

## Stack

Despite the original spec calling for Next.js, what was actually generated and exported here
is a **Vite + React + TypeScript** app (routing via `wouter`), inside a pnpm workspace. The app
lives at `artifacts/interview-coach/` and is the only package in the workspace — it talks to
the FastAPI backend directly via hand-written `fetch()` calls, no intermediate API layer.

This was originally scaffolded via Replit's AI Agent. All of the Replit-specific tooling has
since been removed (deploy is moving elsewhere): the `.replit` config, its Vite plugins,
per-artifact markers, plus a pile of unused scaffolding that came with the template and was
never wired to the actual product — an Express `api-server`, an Orval codegen pipeline
(`lib/api-client-react`, `lib/api-spec`) generating a client for that unused server, its `db`/
`api-zod` support libs, a standalone `mockup-sandbox` design-preview app, a placeholder
`scripts` package, and `attached_assets` (raw pasted-prompt files duplicating the `replit_*.md`
docs below). The `replit_*.md` files themselves are kept — they're the historical spec for
each feature pass, not tooling.

## Prerequisites

- Node.js 24
- pnpm — this repo requires pnpm specifically (a preinstall check rejects `npm`/`yarn`). If you
  don't have it: `npm install -g pnpm`

## First-time setup

```sh
pnpm install
```

> **Windows note:** `pnpm-workspace.yaml` excludes some platform-native binaries (`esbuild`,
> `rollup`, `lightningcss`, `@tailwindcss/oxide`) via `overrides` to keep the lockfile lean. The
> `win32-*` lines have been removed so `pnpm install` also pulls the Windows binaries.
>
> The first install may also prompt about ignored build scripts — run `pnpm approve-builds --all`
> if so, then `pnpm install` again.

## Environment variables

Supabase Auth credentials are required (email/password login + a "Try without an account" guest
path). Copy the example file and fill it in:

```sh
cp artifacts/interview-coach/.env.example artifacts/interview-coach/.env
```

`.env` is git-ignored — ask whoever has the Supabase project access for the actual
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` values (publishable/anon key, safe client-side).

The backend URL is hardcoded in `artifacts/interview-coach/src/lib/api.ts`, no env var needed.

## Running the dev server

From `artifacts/interview-coach/`:

```sh
pnpm dev
```

Then open `http://localhost:5173`. `vite.config.ts` defaults `PORT` to `5173` and `BASE_PATH` to
`/` — only set those as real shell env vars if you need to override them (they're read before
`.env` loading happens, so they can't go in the `.env` file).

## Other commands

- `pnpm run typecheck` — typecheck across all workspace packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/interview-coach run build` — build just the frontend app

## What's implemented

Based on the numbered Replit prompts in this repo (`replit_*.md`), which are the source-of-truth
spec for each feature pass:

- ✅ Core upload → interview → chat flow (`replit_frontend_prompt.md`)
- ✅ Visual polish pass (`replit_visual_polish_prompt.md`)
- ✅ Resume-on-refresh + Past Interviews history page (`replit_history_and_resume_prompt.md`)
- ✅ Supabase Auth: login/signup + "Try without an account" guest mode (`replit_auth_prompt.md`)
- ❓ UX polish pass (`replit_ux_polish_prompt.md`) — not verified
- ❓ Sizing/refinement pass (`replit_sizing_refinement_prompt.md`) — not verified
- ❌ Final AI-written readiness report (`replit_report_feature_prompt.md`) — no `/report` call
  or report view found in the code as of this check

Re-verify this list against the code before relying on it — it reflects a point-in-time check,
not a maintained status.
