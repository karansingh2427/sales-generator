---
name: sales-demo-book
description: When a lead wants a demo, Slack Floor with lead + full conversation so she books herself on Ludwig’s calendar — never auto-create calendar events. Optional Calendar propose/draft only if Floor explicitly asks after the Slack ping. Optional Slack to Ludwig with lead context. Then HubSpot Demo Booked → Completed | Rescheduled | Cancelled. NL/BE only.
---

# sales-demo-book

## Hard default (Karandeep / Floor) — do not regress

**When a lead wants a demo:**

1. Send Floor a **Slack message** that includes the **conversation** (transcript or clear detailed summary), plus lead/company, why interested, links.
2. Floor **books herself on Ludwig’s calendar** and verifies.
3. **Do not** auto-create calendar events (Google Calendar / Calendly / HubSpot meetings / Outlook).

Google Calendar propose/draft is **optional and only if Floor explicitly asks** for help **after** the Slack ping. Primary flow = **Slack → manual Ludwig book**.

## Geography

Only for companies in the **Netherlands** or **Belgium**. Refuse other countries.

## Booking mechanism

- **Primary AE:** Ludwig — Floor books his calendar by hand.
- **Never** call Calendar create/send as part of the default yes-demo path.
- Default duration expectation: **30 minutes** (Floor adjusts when she books).

### Roster

| Person | Role |
|---|---|
| Floor | BDR — gets demo Slack; **books Ludwig herself** |
| Ludwig | AE — calendar owner; optional Slack handoff when Floor asks |

## Steps — warm lead (default)

1. Confirm lead is BE or NL and not disqualified.
2. Confirm they asked for / agreed to a demo.
3. **Slack Floor** using Template A (must include the **conversation**).
4. **Stop.** Do not open Calendar. Do not create events. Wait for Floor.
5. After Floor confirms the slot is on Ludwig’s calendar → HubSpot **Demo Booked** (English).
6. If Floor asks, **Slack Ludwig** (Template B) with lead context.
7. Record AE = Ludwig, datetime, duration, meeting link in HubSpot note if she asks.

## Template A — Slack Floor (required on yes-demo)

```text
🎯 Demo handoff — please book Ludwig

Lead: <Name> · <Title>
Company: <Company> (<NL|BE>)
HubSpot: <company or contact URL if available>
Why interested: <1–3 bullets from the chat>
Preferred timing (if any): <what they said, or “open”>

Conversation (transcript or summary):
---
<paste LinkedIn/email thread OR key turns — enough that Floor can book and brief Ludwig>
---

Links / context:
- Sequence / thread: <URLs>
- Company note opener: <short>
- Other: <deck, site, mutual, etc.>

Action for Floor: **book yourself on Ludwig’s calendar**, verify the invite, then tell me when it’s confirmed so I can set HubSpot → Demo Booked.
```

## Optional — Calendar assist (only if Floor asks)

**Only after** the Floor Slack ping, and **only if** she explicitly says e.g. “propose times”, “draft the invite”, “help me schedule”:

1. Propose 2–3 slots and/or draft an invite for Ludwig’s calendar.
2. Show Floor the draft.
3. **Still do not create/send** unless she explicitly says to create/send that draft.
4. Prefer she finishes booking herself; assist is help text + draft, not silent booking.

If she never asks → **no Calendar tool use**.

## Template B — Slack Ludwig (optional, when Floor asks)

```text
📅 Demo handoff — Floor booking you

Lead: <Name> · <Title> @ <Company> (<NL|BE>)
When: <confirmed slot or “Floor choosing now”>
HubSpot: <URL>

Why they’re interested:
- <bullets>

Conversation highlights:
---
<short summary>
---

Floor owns the calendar invite on your calendar.
```

Draft first unless Floor says “send it to Ludwig”.

## Steps — post-demo outcome

| Outcome | HubSpot / app stage |
|---|---|
| Demo Completed | `demo_completed` |
| Rescheduled | `demo_rescheduled` |
| Cancelled | `demo_cancelled` |

1. Ask which of the three.
2. Update HubSpot via session tools (preferred) or web-app `push_stage`.
3. Writebacks in **English**.

## Prefer session tools

HubSpot + Slack in Floor’s Cowork session. Calendar only when she explicitly asks after the Slack ping.

## What this skill never does

- Auto-create calendar events on the default yes-demo path.
- Skip the conversation in the Floor Slack ping.
- Treat “lead wants demo” as permission to open Calendar or send invites.
- Book for AEs other than Ludwig unless Floor redirects.

## Done when

- Floor has Slack with lead + **conversation** + interest + links, and she books Ludwig herself, and/or
- Stage is Demo Booked / Completed / Rescheduled / Cancelled after her manual booking.
