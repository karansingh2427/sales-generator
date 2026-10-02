# Architecture

Sales Generator is a **BDR workflow OS** for Willow: sync HubSpot CRM agent notes, draft multi-channel
LinkedIn + email sequences (human approve), fall back to Sales Nav CSV, book AE demos — with governance
docs mirroring [agent-data/job-search](https://github.com/agent-data/job-search).

## OS model

| OS concept | In Sales Generator |
|---|---|
| Kernel / shell | Cursor agent or human BDR using the web UI |
| Programs | Pipeline UI, `/api/hubspot`, `/api/sequences`, `/api/leads`, `/api/outreach`, `/api/bookings` |
| Shared libraries | `hubspot.ts`, `sequence-engine.ts`, `icp.ts`, `outreach-engine.ts`, `sales-nav-import.ts`, `db.ts` |
| Filesystem | `.data/workspace.json` (local, never committed) |
| System calls | HubSpot CRM API (live or mock); Sales Nav CSV; future Calendly |
| Cron | Future: scheduled sync + digest (not this slice) |

## Product domains

| Domain | Implements | Grade |
|---|---|---|
| `crm-ingest` | HubSpot sync + mock mode + stage/property maps | strong |
| `sequence-drafting` | Multi-step LI + email drafts, approve/mark sent | strong |
| `lead-discovery` | Sales Nav CSV fallback + BE/NL ICP | adequate |
| `outreach-drafting` | Single-touch templates + CRM rationale | adequate |
| `demo-scheduling` | AE roster + mock meet link | adequate |
| `pipeline-state` | Stage machine on leads | strong |
| `error-surfacing` | API 4xx with plain errors | adequate |

## Architectural layers

| Layer | Role | Grade |
|---|---|---|
| `deterministic-core` | HubSpot mock, ICP scoring, sequence templates, CSV map | strong |
| `shared-references` | PRD, RULES, TASKS, GOVERNANCE | strong |
| `skill-layer` | Not shipped as skills yet — UI is the front door | thin |
| `hooks-guards` | `check-evals`, `test-import`, `test-hubspot`, ESLint, TS | adequate |
| `tests-evals` | `tests/evals.json` + fixtures | adequate |

## Data flow

1. **HubSpot sync** → `POST /api/hubspot` `{ action: "sync" }` (mock if no token) → upsert leads with CRM notes.
2. **Generate sequence** → `POST /api/sequences` `{ action: "generate", leadId }` → draft steps (no send).
3. **Approve / mark sent** → per-step actions; app never transmits LinkedIn/email itself.
4. **Fallback import** → Sales Nav CSV preview/commit.
5. **Book demo** → `POST /api/bookings`.

Companion grading: [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md).
