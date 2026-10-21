# Sales Generator (Willow BDR)

Prototype for **Floor Hoefkens** (BDR @ [Willow](https://willow.co/)): **HubSpot company notes = preferred background** → agent **personalizes the full HeyReach (LinkedIn) + Gmail sequence** (LinkedIn **research** OK when notes are thin or she asks — not every run) → Floor **approves every line** → **HeyReach** sends LinkedIn, **Gmail** sends email → any reply stops the sequence → on interest, **Slack Floor** (with the conversation) so she **manually books Ludwig’s calendar**. Sales Nav CSV remains a fallback. Cursor/Claude **skills** ship alongside the Next.js UI.

**Geography:** **Netherlands first**, Belgium second — **NL + BE only**.  
**Channels:** **HeyReach + Gmail** — LinkedIn connect (day 0) → LinkedIn DM (day 3) → Email 1 (day 6) → Email 2 (day 13) → Email 3 (day 20); max **3** emails. HeyReach push is a **stub** until `HEYREACH_API_KEY` is wired. **No Lemlist.**  
**Governance:** approve-before-send (pilot); **never auto-book** Calendar. **CRM language:** English writebacks. Prefer Floor’s Cowork **HubSpot + Gmail + Slack** connectors.

## For Floor

- **Start here (zip):** [START-HERE-FLOOR.md](./START-HERE-FLOOR.md) — open in Cowork → paste one prompt → review → send
- **Live pilot (mock HubSpot UI):** https://sales-generator-delta.vercel.app
- **5-minute test guide:** [docs/floor-test-guide.md](./docs/floor-test-guide.md)
- **Demo video:** [media/floor-sales-generator-demo.mp4](./media/floor-sales-generator-demo.mp4)

### Floor first-run (short)

1. Unzip → open folder in Cowork (HubSpot + Gmail connected).
2. Paste the **one prompt** in `START-HERE-FLOOR.md` (senior voice + HubSpot tone + one story).
3. `approve 1-20` → `Send approved emails via Gmail.`
4. Replies → `Check my replies from the Dutch batch and handle them.` → BOOK NOW Slack you → you book Ludwig.

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
| `sales-reply-demo` | [`skills/sales-reply-demo/SKILL.md`](./skills/sales-reply-demo/SKILL.md) |
| `sales-demo-book` | [`skills/sales-demo-book/SKILL.md`](./skills/sales-demo-book/SKILL.md) |
| `sales-feedback-learn` | [`skills/sales-feedback-learn/SKILL.md`](./skills/sales-feedback-learn/SKILL.md) |
| `sales-lead-run` | [`skills/sales-lead-run/SKILL.md`](./skills/sales-lead-run/SKILL.md) |

## Feedback learning

| Path | How |
|---|---|
| UI | **Feedback** tab — form + disable/delete; per-lead **Teach agent** |
| Skill | “Remember how I write: …” / “Remember this feedback: …” |
| Storage | `.data/feedback.json` (gitignored); promote to `skills/memory/FEEDBACK.md` |
| Guardrail | Feedback never bypasses draft → approve → HeyReach / Gmail send |

## Sequences (HeyReach + Gmail)

1. Pull Dutch HubSpot tasks from the **last ~30 days** (never-contacted only; 2–3 batches/day) + company notes (skill) — notes = background only.
2. Personalize the full sequence: LinkedIn connect + note → DM (day 3) → Email 1 → ~1 week → Email 2 → Email 3 (**max 3 emails**). Prefer HubSpot notes; LinkedIn research OK when thin / asked. No LinkedIn URL → email-only.
3. Approve every line → LinkedIn via HeyReach (stub until key), email via Gmail (Cowork).
4. Any reply on either channel stops the sequence → classify → on interest Slack Floor → she books Ludwig.

## Demo booking (Slack → Floor → Ludwig)

When a lead wants a demo (or asks for more info): skills **Slack Floor** with lead/company, the **full conversation**, why interested, and links. Floor **manually books Ludwig** — agents **never auto-book**.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server **4317** |
| `npm run start:demo` | Production server **4341** |
| `npm run test:evals` | Governance eval structure |
| `npm run test:import` | Sales Nav CSV / NL-first geo unit checks |
| `npm run test:hubspot` | HubSpot mock + HeyReach/Gmail sequence + HeyReach stub unit checks |
| `npm run test:feedback` | Feedback persist + apply unit checks |
| `npm run lint` / `build` | Quality gates |

## Governance

- [AGENTS.md](./AGENTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/PRD.md](docs/PRD.md) · [RULES](docs/RULES.md) · [TASKS](docs/TASKS.md) · [GOVERNANCE](docs/GOVERNANCE.md) · [skills](docs/skills.md)
- [tests/evals.json](./tests/evals.json)

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui · Cursor skills (`skills/`)
