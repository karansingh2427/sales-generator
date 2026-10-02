# Sales Generator (Willow BDR)

Prototype for **Floor Hoefkens** (BDR @ [Willow](https://willow.co/)): **HubSpot company notes** → **LinkedIn + email sequence drafts** (approve → mark sent) → **per-AE calendar** demo booking. Sales Nav CSV remains a fallback. Cursor/Claude **skills** ship alongside the Next.js UI.

**Geography:** **Belgium first**, Netherlands second — **BE + NL only**. **Governance:** human-in-the-loop — nothing auto-blasts. **CRM language:** English writebacks. **HubSpot path:** prefer Floor’s Claude/Cursor HubSpot MCP/tools; web-app private-app token is optional fallback only.

## Quick start

```bash
npm install
npm run dev
# stable demo:
npm run build && npm run start:demo   # http://127.0.0.1:4341
```

Workspace state: `.data/workspace.json` (gitignored).

## Skills (Floor / Claude / Cursor)

See **[docs/skills.md](./docs/skills.md)** for first-run steps.

| Skill | Path |
|---|---|
| `sales-hubspot-pull` | [`skills/sales-hubspot-pull/SKILL.md`](./skills/sales-hubspot-pull/SKILL.md) |
| `sales-sequence-draft` | [`skills/sales-sequence-draft/SKILL.md`](./skills/sales-sequence-draft/SKILL.md) |
| `sales-demo-book` | [`skills/sales-demo-book/SKILL.md`](./skills/sales-demo-book/SKILL.md) |
| `sales-lead-run` | [`skills/sales-lead-run/SKILL.md`](./skills/sales-lead-run/SKILL.md) |

Agent map: [AGENTS.md](./AGENTS.md). Plugin manifest: [`.cursor-plugin/plugin.json`](./.cursor-plugin/plugin.json).

### Floor first-run (short)

1. Open this repo in the Claude/Cursor session where **HubSpot is already connected**.
2. “Pull my Belgium HubSpot companies and show company notes.”
3. “Draft LinkedIn + email sequences” → **approve** → send yourself → mark sent.
4. “Book demo with \<AE\>” → use that AE’s calendar link → after meeting set Completed / Rescheduled / Cancelled.

## HubSpot connector (web app fallback)

| Mode | When | Behavior |
|---|---|---|
| **Mock** | `HUBSPOT_ACCESS_TOKEN` unset | Syncs demo contacts/companies + **company-level** notes (why-good, opener, right contact) |
| **Live** | Token set in `.env.local` | Calls HubSpot CRM API; prefers company notes/props over contact-only |

Prefer session HubSpot tools over storing a token. Token path remains for ops who want the UI live sync.

```bash
# .env.local (optional fallback)
HUBSPOT_ACCESS_TOKEN=pat-xxx

HUBSPOT_STAGE_MAP={"demo booked":"demo_booked","demo completed":"demo_completed","demo rescheduled":"demo_rescheduled","demo cancelled":"demo_cancelled"}
HUBSPOT_PROPERTY_MAP={"whyGood":"sg_why_good","opener":"sg_opener","rightContact":"sg_right_contact","socialPresence":"sg_social_presence","vertical":"sg_vertical"}
```

**Still needed from Floor/ops:** confirm Claude↔HubSpot scopes, real AE calendar URLs, outreach language(s), pre–Demo Booked stages, auto-send policy.

## Sequences (Floor’s #1 ask)

1. Pull HubSpot company notes (skill or Sync panel) — **BE + NL** filter by default.
2. **Sequences** tab / `sales-sequence-draft` → Generate (LinkedIn connect/message → wait → follow-up → email).
3. Edit drafts → **Approve** → send in LinkedIn/email client → **Mark sent**.
4. App/skill never transmits messages itself.

Opportunity angles: consistency, content quality/mix, visibility, open vacancies — plus company CRM opener/rationale. Strong social presence → disqualified / no sequence.

## Demo booking

Bookings use each AE’s **personal calendar link** — not a single shared Calendly. After Demo Booked, set **Completed / Rescheduled / Cancelled**.

## Sales Nav CSV (fallback)

Import panel defaults geo filter to **BE + NL**. Prefer HubSpot when the internal lead agent already wrote company notes.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server **4317** |
| `npm run start:demo` | Production server **4341** |
| `npm run test:evals` | Governance eval structure |
| `npm run test:import` | Sales Nav CSV / BE-first geo unit checks |
| `npm run test:hubspot` | HubSpot mock + sequence unit checks |
| `npm run lint` / `build` | Quality gates |

## API

- `GET/POST /api/hubspot` — status / `sync` / `push_stage`
- `GET/POST /api/sequences` — list / `generate` / `update_step` / `approve_step` / `mark_sent` / `skip_step`
- `GET/POST /api/leads` — list / Sales Nav import / demo generate / stage
- `GET/POST /api/outreach` — single-touch drafts
- `GET/POST /api/bookings` — AE demos (per-AE calendar URLs)

## Governance

- [AGENTS.md](./AGENTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/PRD.md](docs/PRD.md) · [RULES](docs/RULES.md) · [TASKS](docs/TASKS.md) · [GOVERNANCE](docs/GOVERNANCE.md) · [skills](docs/skills.md)
- [tests/evals.json](./tests/evals.json)

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui · Cursor skills (`skills/`)
