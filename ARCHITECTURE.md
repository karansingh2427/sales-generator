# Architecture

Sales Generator is a **BDR workflow OS** for Willow: import lawyer-firm leads from LinkedIn Sales Navigator,
draft personalized outreach, book AE demos — with governance docs mirroring the
[agent-data/job-search](https://github.com/agent-data/job-search) pattern.

## OS model

| OS concept | In Sales Generator |
|---|---|
| Kernel / shell | Cursor agent or human BDR using the web UI |
| Programs | Pipeline UI, API routes (`/api/leads`, `/api/outreach`, `/api/bookings`) |
| Shared libraries | `src/lib/outreach-engine.ts`, `src/lib/db.ts`, `src/lib/sales-nav-import.ts`, `src/lib/geo.ts` |
| Filesystem | `.data/workspace.json` (local, never committed) |
| System calls | Sales Nav CSV (live); future HubSpot, Calendly (HubSpot not this turn) |
| Cron | Future: scheduled lead refresh + digest (not in MVP) |

## Product domains

| Domain | Implements | Grade |
|---|---|---|
| `lead-discovery` | Sales Nav CSV import + BE/NL ICP scoring; demo sample fallback | strong |
| `outreach-drafting` | Template + rationale engine (Claude-for-sales style) | adequate |
| `demo-scheduling` | AE roster + mock meet link | adequate |
| `pipeline-state` | Stage machine on leads | strong |
| `error-surfacing` | API 4xx with plain errors | adequate |

## Architectural layers

| Layer | Role | Grade |
|---|---|---|
| `deterministic-core` | Validation, CSV map/dedupe, geo scoring, seed data | strong |
| `shared-references` | PRD, RULES, TASKS, GOVERNANCE in `docs/` | strong |
| `skill-layer` | Not shipped as skills yet — UI is the front door | thin |
| `hooks-guards` | `scripts/check-evals.mjs`, `scripts/test-import.mjs`, ESLint, TypeScript | adequate |
| `tests-evals` | `tests/evals.json` + Sales Nav fixture | adequate |

## Data flow

1. BDR opens Pipeline → `GET /api/leads` hydrates UI from `.data/workspace.json`.
2. **Import Sales Nav** → `POST /api/leads` `{ action: "import_preview" }` → human select → `{ action: "import_commit" }`.
3. **Demo samples** (fallback) → `{ action: "generate" }` appends labeled `demo_sample` leads (BE/NL-biased).
4. **Draft outreach** → `POST /api/outreach` writes draft + sets stage `outreach_drafted`.
5. **Book demo** → `POST /api/bookings` creates booking + sets stage `demo_booked`.

Companion grading: [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md).
