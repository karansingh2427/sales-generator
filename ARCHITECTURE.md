# Architecture

Sales Generator is a **BDR workflow OS** for Willow: sync HubSpot **company notes as background**,
**personalize full HeyReach (LinkedIn) + Gmail sequences** from those notes (no re-scrape), approve every line → send via HeyReach / Gmail, stop on any reply,
Slack Floor on interest so she books Ludwig — with governance docs and a **skill pack**.
**Netherlands first**, Belgium second, NL+BE only. **LinkedIn only via HeyReach (stub until key). No Lemlist.**

## OS model

| OS concept | In Sales Generator |
|---|---|
| Kernel / shell | Cursor/Claude agent (skills) or human BDR using the web UI |
| Programs | `skills/*`, Pipeline UI, `/api/hubspot`, `/api/sequences`, `/api/heyreach`, `/api/leads`, `/api/outreach`, `/api/bookings`, `/api/feedback` |
| Shared libraries | `hubspot.ts`, `sequence-engine.ts`, `heyreach.ts`, `feedback.ts`, `icp.ts`, `outreach-engine.ts`, `sales-nav-import.ts`, `db.ts` |
| Filesystem | `.data/workspace.json`, `.data/feedback.json` (local, never committed) |
| System calls | HubSpot + Gmail + Slack in Floor’s Cowork session (preferred); HeyReach API (stub); optional CRM API token; Sales Nav CSV |
| Cron | Future: scheduled sync + digest (not this slice) |

## Product domains

| Domain | Implements | Grade |
|---|---|---|
| `crm-ingest` | HubSpot sync + company notes + stage/property maps | strong |
| `sequence-drafting` | LinkedIn connect → DM → Email max-3 from notes, approve → HeyReach / Gmail send, stop on reply | strong |
| `lead-discovery` | Sales Nav CSV fallback + NL-first ICP | adequate |
| `outreach-drafting` | Single-touch templates + CRM rationale | adequate |
| `demo-scheduling` | Slack Floor → she books Ludwig | strong |
| `pipeline-state` | Stage machine incl. post-demo outcomes | strong |
| `feedback-learning` | Persist + apply Floor tone/ICP memory | strong |
| `error-surfacing` | API 4xx with plain errors | adequate |

## Data flow

```
[Lead-gen agent] → HubSpot Company notes (background only — no re-scrape)
        ↓
sales-feedback-learn / .data/feedback.json  (tone / “how I write”)
        ↓
sales-hubspot-pull / /api/hubspot (Dutch tasks · NL first)
        ↓
sales-sequence-draft  (LinkedIn connect + DM, Email 1–3 from note · approve queue)
        ↓
sales-heyreach-push (LinkedIn steps · stub)  +  sales-gmail-send (email steps · cap 3)
        ↓  any reply on either channel → stop sequence
sales-reply-demo  (BOOK NOW / NOT YET / NO / CONFUSED)
        ↓
sales-demo-book  (Slack Floor + conversation → she books Ludwig)
```
