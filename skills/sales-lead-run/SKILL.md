---
name: sales-lead-run
description: Floor's automatic daily outreach run (Task 1, weekdays 08:00 Amsterdam) — Dutch HubSpot tasks newest first up to 2 months back, never-contacted + do-not-contact + Lemlist dedup, write visit/like/invite → ONE email → 2 LinkedIn messages, quality gate (⚠️ = hold for Floor), add passing leads to Lemlist "Willow NL pilot" (max 20/day with LinkedIn), read back, Slack report. Stop conditions + "Stop the automatic outreach".
---

# sales-lead-run

**Automatic mode (default since 20 Nov 2026, Floor’s decision).** Full spec: [docs/AUTOMATIC-MODE.md](../../docs/AUTOMATIC-MODE.md). Floor sets it up once with the single message in `START-HERE-FLOOR.md`; after that it runs by itself.

## The run (Task 1 — Mon–Fri 08:00 Europe/Amsterdam)

| Step | Skill | What |
|---|---|---|
| 0 | — | **Pre-flight:** Floor’s email + LinkedIn are connected as senders on “Willow NL pilot”, no Lemlist errors/bounces. Otherwise **stop** → Slack Floor, add nothing. |
| 1 | `sales-feedback-learn` | Load active feedback (tone, skips, never-pitch). |
| 2 | `sales-hubspot-pull` | Dutch HubSpot tasks **newest first** — today, yesterday, … up to **2 months** back — until the day’s volume: **15/day the first week, then 30/day**. Skip prior outreach, Contact again later = “Definitely not”, Lead Status = “Unqualified”, anyone in **any** Lemlist campaign, Belgian leads, frequent posters, anyone handled before. |
| 3 | `sales-sequence-draft` | Write invite note · ONE email (Floor’s signature) · LinkedIn message · LinkedIn follow-up for the decision maker — one story. |
| 4 | `sales-sequence-draft` | **Quality gate.** Pass → step 5. Unsure → **⚠️** with a reason, held for Floor. |
| 5 | `sales-lemlist-push` | Add passing leads to **“Willow NL pilot”** with all 5 texts and start them. **Max 20/day with LinkedIn steps**; the rest without LinkedIn URL (email-only). Never another campaign. |
| 6 | `sales-lemlist-push` | **Read back** in Lemlist: every new lead has all 5 texts; pause any lead that doesn’t. |
| 7 | — | Save `approve-queue/<date>-auto.md` (all texts) and **Slack Floor** the report (digest below). |

Fewer good leads than the target → send fewer and say why. Never pad with weak leads.

## Other Cowork tasks (set up by the same START-HERE message)

- **Task 2 — reply check**, hourly 08:00–18:00: `sales-reply-demo` (Slack per reply; replies to prospects only after Floor’s OK).
- **Task 3 — daily update**, 08:30: `sales-daily-update`.

## Floor’s commands

- `show me the ⚠️ leads` → list held leads with reasons; on her OK, add them via `sales-lemlist-push`.
- `show me today's texts` → today’s `approve-queue/<date>-auto.md`.
- `Run another batch now` / `Write 5 more leads` → an extra run with the same rules.
- **`Stop the automatic outreach`** → immediately pause Task 1 **and** the campaign “Willow NL pilot”, then confirm. Resume only when she says so.

## LinkedIn safety

Lemlist limits on Floor’s account: sending window Mon–Fri 09:00–17:30; invites 10/day ramping to 20/day; profile visits 25/day; messages 25/day. LinkedIn allows ~100 invites per rolling week — never more than 20 new LinkedIn leads a day.

## Never

- Add a ⚠️ lead without Floor’s OK, or add anyone when a stop condition is true.
- Touch any Lemlist campaign other than “Willow NL pilot”, change senders, or delete anything.
- Contact anyone with prior outreach, a do-not-contact flag, or a lead in any Lemlist campaign.
- Send more than 1 email per lead · say “I saw your post yesterday/Friday” · pivot vacancy → content calendar.
- Send a reply to a prospect without Floor’s OK · auto-book Ludwig / Calendar.
- Claim something happened in Lemlist without reading it back.

## Digest (Slack to Floor after each run)

```text
🚀 Outreach — <date>
Sent to Lemlist: <n> (<n> with LinkedIn · <n> email-only)
⚠️ Waiting for you: <n>
  • <Name>, <Company> — <reason>
Skipped: <n> already contacted · <n> do-not-contact · <n> in other Lemlist campaigns · <n> other
Lookback used: back to <date> · Today's texts: approve-queue/<date>-auto.md
```
