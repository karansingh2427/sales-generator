# Architecture

Sales Generator is a **BDR workflow OS** for Willow: sync HubSpot **company** agent notes, draft multi-channel
LinkedIn + email sequences (human approve), fall back to Sales Nav CSV, book demos on **per-AE calendar links** — with governance
docs and a **skill pack** mirroring [agent-data/job-search](https://github.com/agent-data/job-search). **Netherlands first**, Belgium second, NL+BE only.

## OS model

| OS concept | In Sales Generator |
|---|---|
| Kernel / shell | Cursor/Claude agent (skills) or human BDR using the web UI |
| Programs | `skills/*`, Pipeline UI, `/api/hubspot`, `/api/sequences`, `/api/leads`, `/api/outreach`, `/api/bookings`, `/api/feedback` |
| Shared libraries | `hubspot.ts`, `sequence-engine.ts`, `feedback.ts`, `icp.ts`, `outreach-engine.ts`, `sales-nav-import.ts`, `db.ts` |
| Filesystem | `.data/workspace.json`, `.data/feedback.json` (local, never committed) |
| System calls | HubSpot MCP/session tools (preferred) or CRM API (optional token); Sales Nav CSV; per-AE calendar links |
| Cron | Future: scheduled sync + digest (not this slice) |

## Product domains

| Domain | Implements | Grade |
|---|---|---|
| `crm-ingest` | HubSpot sync + company notes + stage/property maps | strong |
| `sequence-drafting` | Multi-step LI + email drafts, approve/mark sent | strong |
| `lead-discovery` | Sales Nav CSV fallback + NL-first ICP | adequate |
| `outreach-drafting` | Single-touch templates + CRM rationale | adequate |
| `demo-scheduling` | AE roster + per-AE calendar links | adequate |
| `pipeline-state` | Stage machine incl. post-demo outcomes | strong |
| `feedback-learning` | Persist + apply Floor ICP/company/tone memory | strong |
| `error-surfacing` | API 4xx with plain errors | adequate |

## Architectural layers

| Layer | Role | Grade |
|---|---|---|
| `deterministic-core` | HubSpot mock, ICP scoring, sequence templates, CSV map | strong |
| `shared-references` | PRD, RULES, TASKS, GOVERNANCE | strong |
| `skill-layer` | `skills/sales-*` + `.cursor-plugin` + AGENTS.md map | strong |
| `hooks-guards` | `check-evals`, `test-import`, `test-hubspot`, ESLint, TS | adequate |
| `tests-evals` | `tests/evals.json` + fixtures | adequate |

## Data flow

```
[Lead-gen agent] → HubSpot Company notes
        ↓
sales-feedback-learn / .data/feedback.json  (load active memory)
        ↓
sales-hubspot-pull / /api/hubspot (NL first · apply skips)
        ↓
sales-sequence-draft / /api/sequences  (tone/never-pitch · approve → mark sent)
        ↓
sales-demo-book / /api/bookings  (per-AE link → Completed|Rescheduled|Cancelled)
```
