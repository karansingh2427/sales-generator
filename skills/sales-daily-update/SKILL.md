---
name: sales-daily-update
description: Every weekday (Mon–Fri) at 08:30 Europe/Amsterdam, Slack Floor one short campaign update — LinkedIn/email/replies since the last update AND for the campaign so far, reply rate, invite acceptance, demos, what's working vs not, one suggestion, ⚠️ leads waiting. Read-only; never changes copy or sends outreach.
---

# sales-daily-update

Floor (voice note, 20 Nov 2026): *“How many messages were sent on LinkedIn, on email, how many replies — every working day at 8:30, a Slack update of the campaign so far, the results, what is working, what is not, and a suggestion what we could improve.”*

Earlier (13 Nov 2026): *“Monday to Friday, in the morning at 9, a small, concise update on what went out, the percentage of replies and how it’s going — so I can adjust and change things.”*

## When

- **Cowork recurring task (Task 3): Monday–Friday, 08:30 Europe/Amsterdam** (Floor’s time, 20 Nov 2026) — after the 08:00 outreach run, before Lemlist’s 09:00 sending window. Set it up once with the prompt in `START-HERE-FLOOR.md`.
- Floor can also ask anytime: “Give me my outreach update.”
- Cowork only runs while her laptop is on. If 08:30 was missed, send the update on the first run after and say it’s late (“Update from 08:30, sent at 10:40”).

## Window

Since the previous update: **yesterday 08:30 → today 08:30**; on **Monday, Friday 08:30 → Monday 08:30**.

## Sources (use what’s connected)

| Number | Source |
|---|---|
| Invites, emails, LinkedIn messages sent | Lemlist campaign activity (connector) · Gmail Sent for fallback emails |
| Invites accepted | Lemlist only (connector) — never estimate |
| Replies (+ class) | `sales-reply-demo` results (the hourly reply check) |
| Demos booked | HubSpot Demo Booked since the last update |
| ⚠️ leads waiting for Floor | the latest `approve-queue/<date>-auto.md` |
| Web-app view (same definitions) | `GET /api/daily-update` |

Definitions (same as `src/lib/daily-update.ts`):
- **Contacted** = a lead with at least one step actually sent.
- **Reply rate** = leads that replied ÷ leads contacted, **pilot so far** (a single day is too noisy for a percentage).
- **Acceptance rate** = invites accepted ÷ invites sent, pilot so far (Lemlist).

## Message (Slack DM to Floor — keep it this short)

```text
☀️ Campaign update — <Tue 18 Nov> · Willow NL pilot
Since yesterday | since Friday: <n> invites · <n> LinkedIn messages · <n> emails · <n> replies
  • <Name>, <Company> — <LinkedIn|email> — <class>        ← one line per new reply, max 5
Campaign so far:
  LinkedIn: <n> invites (<n> accepted, <x>%) · <n> messages
  Email: <n> sent
  Replies: <n> (<n> LinkedIn · <n> email) = <x>% of <n> leads contacted
  Demos booked: <n>
✅ Working: <e.g. “consistency story: 3 replies / 9 leads”>
❌ Not working: <e.g. “vacancy story: 0 / 7 · invites to partners rarely accepted”>
💡 Suggestion: <one concrete change she can say yes/no to>
⚠️ Waiting for you: <n> leads
```

- **Working / Not working / Suggestion** = one line each, grounded in the numbers (which angle/opener gets replies, invites not being accepted, a message that drew NO/CONFUSED). If the sample is too small, say so (“too early to tell — 6 sent”).
- Nothing went out and no replies since yesterday → say “Quiet since yesterday” on that line, but still show the campaign-so-far block.

## Rules

- **Read-only.** Never edits drafts, approves, sends or changes the sequence. Floor adjusts by replying, e.g. “Remember: use the consistency opener more” → `sales-feedback-learn`.
- No prospect email bodies in the update — names, companies and classes only. Full threads stay in the reply pings.
- Numbers come from the sources above; if a source isn’t connected, drop that line rather than guess.
- English, short, no jargon.

## Done when

- One Slack DM to Floor, Mon–Fri at 08:30 (or first run after), covering the right window.
