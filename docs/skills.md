# Skills — Floor first-run

Cursor / Claude skill pack mirroring the [agent-data/job-search](https://github.com/agent-data/job-search) layout (`skills/*/SKILL.md` + `AGENTS.md` map).

| Skill | Path | Job |
|---|---|---|
| `sales-hubspot-pull` | [`skills/sales-hubspot-pull/SKILL.md`](../skills/sales-hubspot-pull/SKILL.md) | Bulk Dutch HubSpot tasks / NL-first companies + notes |
| `sales-sequence-draft` | [`skills/sales-sequence-draft/SKILL.md`](../skills/sales-sequence-draft/SKILL.md) | Batch-draft → approve queue; approve/edit/skip — no auto-send |
| `sales-demo-book` | [`skills/sales-demo-book/SKILL.md`](../skills/sales-demo-book/SKILL.md) | Slack Floor + conversation; Calendar propose/draft; Slack Ludwig |
| `sales-feedback-learn` | [`skills/sales-feedback-learn/SKILL.md`](../skills/sales-feedback-learn/SKILL.md) | Persist feedback for next Dutch batch pull/drafts |
| `sales-lead-run` | [`skills/sales-lead-run/SKILL.md`](../skills/sales-lead-run/SKILL.md) | Orchestrator for batch pass + demo handoff |

Plugin manifest: [`.cursor-plugin/plugin.json`](../.cursor-plugin/plugin.json). Memory file (promote target): [`skills/memory/FEEDBACK.md`](../skills/memory/FEEDBACK.md).

## Floor first-run (Claude / Cursor with HubSpot)

1. Open this repo in **the same Claude/Cursor session where HubSpot (+ Slack / Calendar) is connected**.
2. Say: **“Batch 50 Dutch HubSpot tasks, draft sequences, show approve queue.”** → pull + batch-draft (loads feedback first).
3. **Approve / edit / skip** (or approve-selected); send in LinkedIn/email yourself; ask to **mark sent**.
4. When someone wants a demo → Slack Floor with **conversation**; optional propose Ludwig times / draft invite (you confirm); optional Slack Ludwig.
5. After you confirm the booking → **Demo Booked**; after the meeting → **Completed / Rescheduled / Cancelled**.
6. Anytime → **“Remember: skip companies that already post a lot”** → next Dutch batch applies it.

### Do not

- Paste a HubSpot private-app token into the web app unless ops requires the `.env.local` fallback.
- Add countries outside **Belgium** and the **Netherlands**.
- Auto-send messages (phase 2 not built).
- Silent auto-book Calendar.
- Slack a demo ping without the conversation.
- Let feedback bypass draft → approve → mark sent.