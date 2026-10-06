# Skills — Floor first-run

Cursor / Claude skill pack mirroring the [agent-data/job-search](https://github.com/agent-data/job-search) layout (`skills/*/SKILL.md` + `AGENTS.md` map).

| Skill | Path | Job |
|---|---|---|
| `sales-hubspot-pull` | [`skills/sales-hubspot-pull/SKILL.md`](../skills/sales-hubspot-pull/SKILL.md) | NL-first HubSpot companies + company notes |
| `sales-sequence-draft` | [`skills/sales-sequence-draft/SKILL.md`](../skills/sales-sequence-draft/SKILL.md) | LI + email drafts; approve before send |
| `sales-demo-book` | [`skills/sales-demo-book/SKILL.md`](../skills/sales-demo-book/SKILL.md) | Per-AE calendar links; Demo Booked → Completed\|Rescheduled\|Cancelled |
| `sales-feedback-learn` | [`skills/sales-feedback-learn/SKILL.md`](../skills/sales-feedback-learn/SKILL.md) | Persist ICP/company/tone feedback for later runs |
| `sales-lead-run` | [`skills/sales-lead-run/SKILL.md`](../skills/sales-lead-run/SKILL.md) | Orchestrator for one BDR pass (loads feedback first) |

Plugin manifest: [`.cursor-plugin/plugin.json`](../.cursor-plugin/plugin.json). Memory file (promote target): [`skills/memory/FEEDBACK.md`](../skills/memory/FEEDBACK.md).

## Floor first-run (Claude / Cursor with HubSpot)

1. Open this repo (or enable the Sales Generator skill pack) in **the same Claude/Cursor session where HubSpot is connected**.
2. Say: **“Pull my Netherlands HubSpot companies and show the company notes.”** → runs `sales-hubspot-pull` (loads feedback first).
3. Pick 1–3 firms → **“Draft LinkedIn + email sequences for these.”** → `sales-sequence-draft`.
4. **Approve** each step; send in LinkedIn/email yourself; ask the agent to **mark sent**.
5. When someone is warm → **“Book demo with \<AE\>”** → `sales-demo-book` gives that AE’s calendar link.
6. After the meeting → set **Completed / Rescheduled / Cancelled** (English in HubSpot).
7. Anytime → **“Remember this feedback: skip company X”** → `sales-feedback-learn`; next pull applies it.

### Do not

- Paste a HubSpot private-app token into the web app unless ops requires the `.env.local` fallback.
- Add countries outside **Belgium** and the **Netherlands**.
- Auto-send messages.
- Let feedback bypass draft → approve → mark sent.

### Still needed from Floor/ops

- Confirm HubSpot tool scopes in her Claude session (company notes + stage write).
- Real AE calendar URLs (placeholders today).
- Explicit OK before any auto-send.
- Pre–Demo Booked stage names (optional).
