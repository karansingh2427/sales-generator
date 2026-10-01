# sales-generator — Agent Map

A **Willow BDR operating prototype**: a Next.js app plus governance corpus that automates lawyer ICP lead
pulls, AI-assisted outreach drafts, and AE demo booking — so cold calling stays minimal.

**This file is the entry point for coding agents.** Start here, then follow the pointers.

## Start here

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — product domains × architectural layers (summary table).
- **[docs/PRD.md](docs/PRD.md)** — requirements and MVP scope for Floor Hoefkens.
- **Runtime contracts** — [docs/RULES.md](docs/RULES.md) (conduct), [docs/TASKS.md](docs/TASKS.md) (operator flows), [docs/GOVERNANCE.md](docs/GOVERNANCE.md) (data + consent). Do not duplicate them in skills; link.

## Design & product

- [docs/PRD.md](docs/PRD.md) — product scope and non-goals.

## Quality · governance · interface

- [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) — qualitative grades per domain × layer.
- [docs/GOVERNANCE.md](docs/GOVERNANCE.md) — security, PII, mock vs live integrations.
- [tests/evals.json](tests/evals.json) — valid / invalid behavioral test cases.

## Working here

- **Single source of truth:** outreach validation lives in `src/lib/outreach-engine.ts`; booking validation in `src/app/api/bookings/route.ts`; workspace persistence in `src/lib/db.ts`.
- **Mock-first:** no secrets required; `.data/workspace.json` holds local state (gitignored).
- Before PR: `npm run lint`, `npm run build`, `npm run test:evals`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
