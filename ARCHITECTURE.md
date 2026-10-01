# Architecture

Sales Generator is a **BDR workflow OS** for Willow: find lawyer-firm leads, draft personalized outreach,
book AE demos — with governance docs mirroring the [agent-data/job-search](https://github.com/agent-data/job-search) pattern.

## OS model

| OS concept | In Sales Generator |
|---|---|
| Kernel / shell | Cursor agent or human BDR using the web UI |
| Programs | Pipeline UI, API routes (`/api/leads`, `/api/outreach`, `/api/bookings`) |
| Shared libraries | `src/lib/outreach-engine.ts`, `src/lib/db.ts`, `src/lib/mock-leads.ts` |
| Filesystem | `.data/workspace.json` (local, never committed) |
| System calls | Future: Apollo, LinkedIn, HubSpot, Calendly (mocked in MVP) |
| Cron | Future: scheduled lead refresh + digest (not in MVP) |

## Product domains

| Domain | Implements | Grade (MVP) |
|---|---|---|
| `lead-discovery` | Mock generate + seed lawyer ICP list | adequate |
| `outreach-drafting` | Template + rationale engine (Claude-for-sales style) | adequate |
| `demo-scheduling` | AE roster + mock meet link | adequate |
| `pipeline-state` | Stage machine on leads | strong |
| `error-surfacing` | API 4xx with plain errors | adequate |

## Architectural layers

| Layer | Role | Grade (MVP) |
|---|---|---|
| `deterministic-core` | Validation, stage updates, seed data | strong |
| `shared-references` | PRD, RULES, TASKS, GOVERNANCE in `docs/` | strong |
| `skill-layer` | Not shipped as skills in MVP — UI replaces conversational front door | thin |
| `hooks-guards` | `scripts/check-evals.mjs`, ESLint, TypeScript | adequate |
| `tests-evals` | `tests/evals.json` structural + scenario cases | adequate |

## Data flow

1. BDR opens Pipeline → `GET /api/leads` hydrates UI from `.data/workspace.json`.
2. **Generate leads** → `POST /api/leads` `{ action: "generate" }` appends mock firms.
3. **Draft outreach** → `POST /api/outreach` writes draft + sets stage `outreach_drafted`.
4. **Book demo** → `POST /api/bookings` creates booking + sets stage `demo_booked`.

Companion grading: [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md).
