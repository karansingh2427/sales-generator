---
name: sales-daily-update
description: Every weekday (Mon–Fri) at 09:00 Europe/Amsterdam, Slack Floor one short, precise outreach update — what went out since the last update, replies and reply rate, invite acceptance, demos, what waits for her approval, and 1–2 things worth adjusting. Read-only; never changes copy or sends outreach.
---

# sales-daily-update

Floor (voice note, 13 Nov 2026): *“Monday to Friday, in the morning at 9, a small, concise update on what went out, the percentage of replies and how it’s going — so I can adjust and change things.”*

## When

- **Cowork recurring task: Monday–Friday, 09:00 Europe/Amsterdam.** Set it up once with the prompt in `START-HERE-FLOOR.md`.
- Floor can also ask anytime: “Give me my outreach update.”
- Cowork only runs while her laptop is on. If 09:00 was missed, send the update on the first run after and say it’s late (“Update from 09:00, sent at 10:40”).

## Window

Since the previous update: **yesterday 09:00 → today 09:00**; on **Monday, Friday 09:00 → Monday 09:00**.

## Sources (use what’s connected)

| Number | Source |
|---|---|
| Invites, emails, LinkedIn messages sent | Lemlist campaign activity (connector) · Gmail Sent for fallback emails |
| Invites accepted | Lemlist only — leave the line out until Lemlist is connected; never estimate |
| Replies (+ class) | `sales-reply-demo` results (the hourly reply check) |
| Demos booked | HubSpot Demo Booked since the last update |
| Waiting for approval | the open approve queue |
| Web-app view (same definitions) | `GET /api/daily-update` |

Definitions (same as `src/lib/daily-update.ts`):
- **Contacted** = a lead with at least one step actually sent.
- **Reply rate** = leads that replied ÷ leads contacted, **pilot so far** (a single day is too noisy for a percentage).
- **Acceptance rate** = invites accepted ÷ invites sent, pilot so far (Lemlist).

## Message (Slack DM to Floor — keep it this short)

```text
☀️ Outreach update — <Tue 18 Nov> (since yesterday | since Friday)
Sent: <n> invites · <n> emails · <n> LinkedIn messages
Accepted invites: <n> (<x>% of invites so far)          ← only once Lemlist is connected
Replies: <n> (<n> LinkedIn · <n> email) — <n> BOOK NOW · <n> NOT YET · <n> NO · <n> CONFUSED
  • <Name>, <Company> — <class>                          ← one line per reply, max 5
Pilot so far: <n> contacted · <n> replied (<x>%)
Demos booked: <n> · Waiting for your approval: <n> leads
Worth adjusting:
  • <one concrete observation, e.g. “consistency opener: 3 replies / 9 sent; vacancy opener: 0 / 7”>
  • <one concrete suggestion she can say yes/no to>
```

- **Worth adjusting** = max 2 bullets, grounded in the numbers (which angle/opener gets replies, invites not being accepted, a message that drew NO/CONFUSED). If the sample is too small, say so (“too early to tell — 6 sent”).
- Nothing went out and no replies → one line: “Quiet since yesterday — <n> leads waiting for your approval.”

## Rules

- **Read-only.** Never edits drafts, approves, sends or changes the sequence. Floor adjusts by replying, e.g. “Remember: use the consistency opener more” → `sales-feedback-learn`.
- No prospect email bodies in the update — names, companies and classes only. Full threads stay in the reply pings.
- Numbers come from the sources above; if a source isn’t connected, drop that line rather than guess.
- English, short, no jargon.

## Done when

- One Slack DM to Floor, Mon–Fri at 09:00 (or first run after), covering the right window.
