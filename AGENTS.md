# sales-generator — Agent Map

A **Willow BDR operating prototype**: a Next.js app plus governance corpus that imports lawyer ICP leads
from LinkedIn Sales Navigator (CSV), drafts AI-assisted outreach, and books AE demos — so cold calling stays minimal.

**Geography locked:** Belgium & the Netherlands first (most Willow clients).

**This file is the entry point for coding agents.** Start here, then follow the pointers.

## Start here

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — product domains × architectural layers (summary table).
- **[docs/PRD.md](docs/PRD.md)** — requirements and scope for Floor Hoefkens (BE/NL ICP, Sales Nav P0).
- **Runtime contracts** — [docs/RULES.md](docs/RULES.md) (conduct), [docs/TASKS.md](docs/TASKS.md) (operator flows), [docs/GOVERNANCE.md](docs/GOVERNANCE.md) (data + consent). Do not duplicate them in skills; link.

## Design & product

- [docs/PRD.md](docs/PRD.md) — product scope and non-goals (HubSpot out this turn).

## Quality · governance · interface

- [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) — qualitative grades per domain × layer.
- [docs/GOVERNANCE.md](docs/GOVERNANCE.md) — security, PII, Sales Nav CSV vs demo samples.
- [tests/evals.json](tests/evals.json) — valid / invalid behavioral test cases.

## Working here

- **Single source of truth:** Sales Nav parse/map/dedupe/score in `src/lib/sales-nav-import.ts` + `src/lib/geo.ts`; outreach validation in `src/lib/outreach-engine.ts`; booking validation in `src/app/api/bookings/route.ts`; workspace persistence in `src/lib/db.ts`.
- **Live leads:** CSV import; **Demo / sample data** is the labeled fallback only.
- Before PR: `npm run lint`, `npm run build`, `npm run test:evals`, `npm run test:import`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
