# Sales Generator (Willow BDR)

Prototype for **Floor Hoefkens** (BDR @ [Willow](https://willow.co/)): **HubSpot company notes** → **LinkedIn + email sequence drafts** (approve → mark sent) → when a lead wants a demo, **Slack Floor** (with the conversation) so she **manually books Ludwig’s calendar**. Sales Nav CSV remains a fallback. Cursor/Claude **skills** ship alongside the Next.js UI.

**Geography:** **Netherlands first**, Belgium second — **NL + BE only**. **Governance:** human-in-the-loop — nothing auto-blasts; **never auto-book** Calendar. **CRM language:** English writebacks. **HubSpot + Slack path:** prefer Floor’s Claude/Cursor session tools; web-app private-app token is optional fallback only.

## For Floor

- **Live pilot (mock HubSpot):** https://sales-generator-delta.vercel.app
- **5-minute test guide:** [docs/floor-test-guide.md](./docs/floor-test-guide.md)
- **Demo video:** [media/floor-sales-generator-demo.mp4](./media/floor-sales-generator-demo.mp4)
- Optional: [docs/vercel-deploy.md](./docs/vercel-deploy.md) · [docs/floor-feedback-learning.md](./docs/floor-feedback-learning.md)

## Quick start

```bash
npm install
npm run dev
# stable demo:
npm run build && npm run start:demo   # http://127.0.0.1:4341
```

Workspace state: `.data/workspace.json` + `.data/feedback.json` (gitignored).

## Skills (Floor / Claude / Cursor)

See **[docs/skills.md](./docs/skills.md)** for first-run steps.

| Skill | Path |
|---|---|
| `sales-hubspot-pull` | [`skills/sales-hubspot-pull/SKILL.md`](./skills/sales-hubspot-pull/SKILL.md) |
| `sales-sequence-draft` | [`skills/sales-sequence-draft/SKILL.md`](./skills/sales-sequence-draft/SKILL.md) |
| `sales-demo-book` | [`skills/sales-demo-book/SKILL.md`](./skills/sales-demo-book/SKILL.md) |
| `sales-feedback-learn` | [`skills/sales-feedback-learn/SKILL.md`](./skills/sales-feedback-learn/SKILL.md) |
| `sales-lead-run` | [`skills/sales-lead-run/SKILL.md`](./skills/sales-lead-run/SKILL.md) |

Agent map: [AGENTS.md](./AGENTS.md). Plugin manifest: [`.cursor-plugin/plugin.json`](./.cursor-plugin/plugin.json).

### Floor first-run (short)

1. Open this repo in the Claude/Cursor session where **HubSpot is already connected**.
2. “Pull my Netherlands HubSpot companies and show company notes.”
3. “Draft LinkedIn + email sequences” → **approve** → send yourself → mark sent.
4. Lead wants demo → Slack Floor with **conversation** → Floor books **Ludwig** manually → Demo Booked → later Completed / Rescheduled / Cancelled.
5. “Remember this feedback: skip company X / prefer Partner titles” → next pull applies it.

## Feedback learning

| Path | How |
|---|---|
| UI | **Feedback** tab — form + disable/delete list; per-lead graduation-cap **Teach agent** |
| Skill | “Remember this feedback: …” → `sales-feedback-learn` |
| Storage | `.data/feedback.json` (gitignored); promote to `skills/memory/FEEDBACK.md` for session-only agents |
| Apply | HubSpot sync, sequence generate, outreach draft, and `sales-lead-run` load **active** feedback |
| Guardrail | Feedback never auto-sends; draft → approve → mark sent still required |

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

**Still needed from Floor/ops:** confirm Claude↔HubSpot + Slack scopes, outreach language(s), pre–Demo Booked stages, auto-send policy.

## Sequences (Floor’s #1 ask)

1. Pull HubSpot company notes (skill or Sync panel) — **NL + BE** filter by default.
2. **Sequences** tab / `sales-sequence-draft` → Generate (LinkedIn connect/message → wait → follow-up → email).
3. Edit drafts → **Approve** → send in LinkedIn/email client → **Mark sent**.
4. App/skill never transmits messages itself.

Opportunity angles: consistency, content quality/mix, visibility, open vacancies — plus company CRM opener/rationale. Strong social presence → disqualified / no sequence.

## Demo booking (Slack → Floor → Ludwig)

When a lead wants a demo: skills **Slack Floor** with lead/company, the **full conversation** (or detailed summary), why interested, and links. Floor **manually books Ludwig’s calendar** and verifies — agents **never auto-book**. After she confirms → HubSpot **Demo Booked** → later **Completed / Rescheduled / Cancelled**. See `START-HERE-FLOOR.md` and `skills/sales-demo-book/SKILL.md`.

## Sales Nav CSV (fallback)

Import panel defaults geo filter to **NL + BE**. Prefer HubSpot when the internal lead agent already wrote company notes.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server **4317** |
| `npm run start:demo` | Production server **4341** |
| `npm run test:evals` | Governance eval structure |
| `npm run test:import` | Sales Nav CSV / NL-first geo unit checks |
| `npm run test:hubspot` | HubSpot mock + sequence unit checks |
| `npm run test:feedback` | Feedback persist + apply unit checks |
| `npm run lint` / `build` | Quality gates |

## API

- `GET/POST /api/hubspot` — status / `sync` / `push_stage`
- `GET/POST /api/sequences` — list / `generate` / `update_step` / `approve_step` / `mark_sent` / `skip_step`
- `GET/POST /api/feedback` — list / `remember` / `enable` / `disable` / `delete` (`?format=markdown`)
- `GET/POST /api/leads` — list / Sales Nav import / demo generate / stage
- `GET/POST /api/outreach` — single-touch drafts
- `GET/POST /api/bookings` — AE demos (per-AE calendar URLs)

## Governance

- [AGENTS.md](./AGENTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/PRD.md](docs/PRD.md) · [RULES](docs/RULES.md) · [TASKS](docs/TASKS.md) · [GOVERNANCE](docs/GOVERNANCE.md) · [skills](docs/skills.md)
- [tests/evals.json](./tests/evals.json)

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui · Cursor skills (`skills/`)
