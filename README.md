# Sales Generator (Willow BDR)

Prototype for **Floor Hoefkens** (BDR @ [Willow](https://willow.co/)): **HubSpot CRM sync** of lead-gen agent notes → **multi-channel LinkedIn + email sequence drafts** (approve → mark sent) → AE demo booking. Sales Nav CSV import remains a fallback.

**Geography:** Belgium & the Netherlands first. **Governance:** human-in-the-loop — nothing auto-blasts.

## Quick start

```bash
npm install
npm run dev
# stable demo:
npm run build && npm run start:demo   # http://127.0.0.1:4341
```

Workspace state: `.data/workspace.json` (gitignored).

## HubSpot connector

| Mode | When | Behavior |
|---|---|---|
| **Mock** | `HUBSPOT_ACCESS_TOKEN` unset | Syncs demo contacts/companies/notes with why-good, opener, right contact |
| **Live** | Token set in `.env.local` | Calls HubSpot CRM API (contacts + companies + notes), upserts into workspace |

```bash
# .env.local
HUBSPOT_ACCESS_TOKEN=pat-xxx   # private app token

# Optional JSON maps (defaults documented in src/lib/hubspot-config.ts)
HUBSPOT_STAGE_MAP={"marketingqualifiedlead":"qualified","demo booked":"demo_booked"}
HUBSPOT_PROPERTY_MAP={"whyGood":"sg_why_good","opener":"sg_opener","rightContact":"sg_right_contact","socialPresence":"sg_social_presence","vertical":"sg_vertical"}
```

**Still needed from Floor/ops:** confirm CRM=HubSpot, token owner, real pipeline stage labels, actual property names for agent notes.

## Sequences (Floor’s #1 ask)

1. Sync HubSpot (or pick any lead).
2. **Sequences** tab → Generate (LinkedIn connect/message → wait → follow-up → email).
3. Edit drafts → **Approve** → send in LinkedIn/email client → **Mark sent**.
4. App never transmits messages itself.

Opportunity angles encoded: consistency, content quality/mix, visibility, open vacancies — plus CRM opener/rationale. Strong social presence → disqualified / no sequence.

## Sales Nav CSV (fallback)

Import panel still supports Lead List CSV with BE+NL default geo filter. Prefer HubSpot when the internal lead agent already wrote CRM notes.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server **4317** |
| `npm run start:demo` | Production server **4341** |
| `npm run test:evals` | Governance eval structure |
| `npm run test:import` | Sales Nav CSV unit checks |
| `npm run test:hubspot` | HubSpot mock + sequence unit checks |
| `npm run lint` / `build` | Quality gates |

## API

- `GET/POST /api/hubspot` — status / `sync` / `push_stage`
- `GET/POST /api/sequences` — list / `generate` / `update_step` / `approve_step` / `mark_sent` / `skip_step`
- `GET/POST /api/leads` — list / Sales Nav import / demo generate / stage
- `GET/POST /api/outreach` — single-touch drafts
- `GET/POST /api/bookings` — AE demos

## Governance

- [AGENTS.md](./AGENTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/PRD.md](./docs/PRD.md) · [RULES](./docs/RULES.md) · [TASKS](./docs/TASKS.md) · [GOVERNANCE](./docs/GOVERNANCE.md)
- [tests/evals.json](./tests/evals.json)

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui
