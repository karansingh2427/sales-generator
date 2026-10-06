# Sales Generator (Willow BDR)

Prototype for **Floor Hoefkens** (BDR @ [Willow](https://willow.co/)): **HubSpot company notes = preferred background** → agent **personalizes the full Gmail cold sequence** (LinkedIn **scrape/research** OK when notes are thin or she asks — not every run; LinkedIn **send** forbidden) → Floor **approves** → agent **sends via Gmail** → on interest, **Slack Floor** (with the conversation) so she **manually books Ludwig’s calendar**. Sales Nav CSV remains a fallback. Cursor/Claude **skills** ship alongside the Next.js UI.

**Geography:** **Netherlands first**, Belgium second — **NL + BE only**.  
**Channel (Dutch pilot):** **Gmail only** — max **3** emails, ~1 week between if no reply. **No LinkedIn API send. No Lemlist.**  
**Governance:** approve-before-send (pilot); **never auto-book** Calendar. **CRM language:** English writebacks. Prefer Floor’s Cowork **HubSpot + Gmail + Slack** connectors.

## For Floor

- **Start here (zip):** [START-HERE-FLOOR.md](./START-HERE-FLOOR.md)
- **Live pilot (mock HubSpot UI):** https://sales-generator-delta.vercel.app
- **5-minute test guide:** [docs/floor-test-guide.md](./docs/floor-test-guide.md)
- **Demo video:** [media/floor-sales-generator-demo.mp4](./media/floor-sales-generator-demo.mp4)

## Quick start

```bash
npm install
npm run dev
# stable demo:
npm run build && npm run start:demo   # http://127.0.0.1:4341
```

Workspace state: `.data/workspace.json` + `.data/feedback.json` (gitignored).

## Skills (Floor / Claude Cowork)

See **[docs/skills.md](./docs/skills.md)** for first-run steps.

| Skill | Path |
|---|---|
| `sales-hubspot-pull` | [`skills/sales-hubspot-pull/SKILL.md`](./skills/sales-hubspot-pull/SKILL.md) |
| `sales-sequence-draft` | [`skills/sales-sequence-draft/SKILL.md`](./skills/sales-sequence-draft/SKILL.md) |
| `sales-gmail-send` | [`skills/sales-gmail-send/SKILL.md`](./skills/sales-gmail-send/SKILL.md) |
| `sales-demo-book` | [`skills/sales-demo-book/SKILL.md`](./skills/sales-demo-book/SKILL.md) |
| `sales-feedback-learn` | [`skills/sales-feedback-learn/SKILL.md`](./skills/sales-feedback-learn/SKILL.md) |
| `sales-lead-run` | [`skills/sales-lead-run/SKILL.md`](./skills/sales-lead-run/SKILL.md) |

### Floor first-run (short)

1. Cowork with **HubSpot + Gmail + Slack** (same Google for Gmail/Calendar if possible).
2. Batch Dutch HubSpot tasks → personalize Gmail sequences from notes (max 3) → approve queue.
3. Approve → **Send approved emails via Gmail.**
4. Interest → Slack Floor with **conversation** → she books **Ludwig** → Demo Booked → Completed / Rescheduled / Cancelled.
5. “Remember how I write: …” / skip rules → next batch.

## Feedback learning

| Path | How |
|---|---|
| UI | **Feedback** tab — form + disable/delete; per-lead **Teach agent** |
| Skill | “Remember how I write: …” / “Remember this feedback: …” |
| Storage | `.data/feedback.json` (gitignored); promote to `skills/memory/FEEDBACK.md` |
| Guardrail | Feedback never bypasses draft → approve → Gmail send |

## Sequences (Dutch pilot)

1. Pull Dutch HubSpot daily tasks + company notes (skill) — notes = background only.
2. Personalize full Gmail sequence (Email 1 → ~1 week → Email 2 → … **max 3**). Prefer HubSpot notes; LinkedIn research OK when thin / asked — never LinkedIn send.
3. Approve → Gmail send via Cowork.
4. Stop early on clear **no** or **interest** → Slack Floor → she books Ludwig.

## Demo booking (Slack → Floor → Ludwig)

When a lead wants a demo (or asks for more info): skills **Slack Floor** with lead/company, the **full conversation**, why interested, and links. Floor **manually books Ludwig** — agents **never auto-book**.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server **4317** |
| `npm run start:demo` | Production server **4341** |
| `npm run test:evals` | Governance eval structure |
| `npm run test:import` | Sales Nav CSV / NL-first geo unit checks |
| `npm run test:hubspot` | HubSpot mock + Gmail sequence unit checks |
| `npm run test:feedback` | Feedback persist + apply unit checks |
| `npm run lint` / `build` | Quality gates |

## Governance

- [AGENTS.md](./AGENTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/PRD.md](docs/PRD.md) · [RULES](docs/RULES.md) · [TASKS](docs/TASKS.md) · [GOVERNANCE](docs/GOVERNANCE.md) · [skills](docs/skills.md)
- [tests/evals.json](./tests/evals.json)

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui · Cursor skills (`skills/`)
