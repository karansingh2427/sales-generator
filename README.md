# Sales Generator (Willow BDR)

Prototype for **Floor Hoefkens** (BDR @ [Willow](https://willow.co/)): **HubSpot company notes = preferred background** → agent **personalizes the full LinkedIn + email sequence** (LinkedIn **research** OK when notes are thin or she asks — not every run) → Floor **approves every line** → **Lemlist** sends LinkedIn + email → any reply stops the sequence → on interest, **Slack Floor** (with the conversation) so she **manually books Ludwig’s calendar**. Sales Nav CSV remains a fallback. Cursor/Claude **skills** ship alongside the Next.js UI.

**Geography:** **Netherlands first**, Belgium second — **NL + BE only**.  
**Channels:** **Lemlist (LinkedIn + email)** — profile visit → like latest post → invite → **one** personal email (all day 0, one after another) → LinkedIn message as soon as they accept → LinkedIn follow-up 2 days later; max **1** email, follow-ups on LinkedIn. Live since 20 Nov 2026 as the Lemlist campaign “Willow NL pilot”, reached through Floor’s Lemlist Claude connector, in **[automatic mode](docs/AUTOMATIC-MODE.md)**. (The web app’s own Lemlist API push stays a stub — 402 on her plan.)  
**Governance:** approve-before-send (pilot); **never auto-book** Calendar. **CRM language:** English writebacks. Prefer Floor’s Cowork **HubSpot + Gmail + Slack** connectors.

## For Floor

- **Start here (zip):** [START-HERE-FLOOR.md](./START-HERE-FLOOR.md) — open in Cowork → paste one prompt → review → send
- **Live pilot (mock HubSpot UI):** https://sales-generator-delta.vercel.app
- **5-minute test guide:** [docs/floor-test-guide.md](./docs/floor-test-guide.md)
- **Demo video:** [media/floor-sales-generator-demo.mp4](./media/floor-sales-generator-demo.mp4)

### Floor first-run (short)

1. Unzip → open the folder in Cowork (HubSpot, Lemlist, Slack, Gmail connected).
2. Paste the **one setup message** in `START-HERE-FLOOR.md` once — it creates the 3 automatic tasks (08:00 outreach, hourly reply check, 08:50 update) and the Lemlist limits.
3. After that it runs by itself ([automatic mode](docs/AUTOMATIC-MODE.md)); Floor handles ⚠️ leads, reads “today’s texts”, OKs replies and books Ludwig. Emergency stop: “Stop the automatic outreach”.

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
| Guardrail | Feedback never bypasses draft → approve → Lemlist / Gmail send |

## Sequences (Lemlist: LinkedIn + email)

1. Every weekday 08:00: pull Dutch HubSpot tasks **newest first, up to 2 months back** (never-contacted, do-not-contact and Lemlist dedup; 15/day first week, then 30/day) + company notes — notes = background only.
2. Personalize the full sequence for the person in the HubSpot note: profile visit + like latest post + invite note → one email → LinkedIn message (if accepted) → LinkedIn follow-up. Prefer HubSpot notes; LinkedIn research OK when thin / asked. No LinkedIn URL → just the email.
3. **Quality gate** (replaces per-line approval since 20 Nov 2026) → passing leads go to the Lemlist campaign “Willow NL pilot” (max 20/day with LinkedIn steps); unsure ones get ⚠️ and wait for Floor.
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
| `npm run test:hubspot` | HubSpot mock + LinkedIn/email sequence + Lemlist stub unit checks |
| `npm run test:feedback` | Feedback persist + apply unit checks |
| `npm run lint` / `build` | Quality gates |

## Governance

- [AGENTS.md](./AGENTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/PRD.md](docs/PRD.md) · [RULES](docs/RULES.md) · [TASKS](docs/TASKS.md) · [GOVERNANCE](docs/GOVERNANCE.md) · [skills](docs/skills.md)
- [tests/evals.json](./tests/evals.json)

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui · Cursor skills (`skills/`)
