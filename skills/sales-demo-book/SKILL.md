---
name: sales-demo-book
description: When a lead wants a demo, Slack Floor with lead + conversation + interest, so she manually books Ludwig’s calendar — never auto-book Calendar. After she books, mark HubSpot Demo Booked → Completed | Rescheduled | Cancelled. Netherlands/Belgium leads only.
---

# sales-demo-book

When outreach succeeds and the lead wants a demo: **Slack Floor** (with the conversation), she **manually books Ludwig’s calendar** (AE) and verifies. **Never auto-book** Google Calendar / Calendly / HubSpot meetings.

## Geography

Only for companies in the **Netherlands** or **Belgium**. Refuse other countries.

## Handoff rule (hard — Karandeep / Floor)

1. **Slack Floor** with: lead/company, **conversation** (transcript or clear chat summary), why they’re interested, links/context.
2. Floor **manually** books the meeting on **Ludwig’s calendar** and verifies — agents must **never** create calendar events.
3. After she books, she/Claude can mark HubSpot **Demo Booked** → later **Completed** / **Rescheduled** / **Cancelled**.

## Booking mechanism

- **Primary AE:** Ludwig (Floor books his calendar by hand).
- Do **not** invent a shared Calendly / round-robin / auto-schedule flow.
- Do **not** call Calendar connectors to create events.
- Default duration expectation: **30 minutes** (Floor may adjust when she books).

### Roster (context only — Floor books Ludwig)

| AE | Role |
|---|---|
| Ludwig | Primary AE — Floor books his calendar manually after Slack ping |
| (others) | Only if Floor explicitly names a different AE |

When Floor supplies Ludwig’s calendar URL for her own use, store it in ops notes — agents still never auto-book it.

## Steps — warm lead → Slack Floor

1. Confirm lead is BE or NL and not disqualified.
2. Confirm they asked for / agreed to a demo (or clearly want a meeting).
3. Post to **Slack** for Floor using the template below (include the **conversation**).
4. Stop. Wait for Floor to book and confirm.
5. After Floor confirms the slot is on Ludwig’s calendar, set CRM stage to **Demo Booked** (English).
6. Record AE = Ludwig, datetime, duration, meeting link in HubSpot note / local workspace if she asks.

## Slack message template

Post to Floor’s Slack channel/DM (use session Slack tools):

```text
🎯 Demo handoff — please book Ludwig

Lead: <Name> · <Title>
Company: <Company> (<NL|BE>)
HubSpot: <company or contact URL if available>
Why interested: <1–3 bullets from the chat>
Preferred timing (if any): <what they said, or “open”>

Conversation (transcript or summary):
---
<paste LinkedIn/email thread summary OR key turns — enough that Floor can brief Ludwig>
---

Links / context:
- Sequence / thread: <URLs>
- Company note opener: <short>
- Other: <deck, site, mutual, etc.>

Action for Floor: manually book **Ludwig’s calendar**, verify the invite, then tell me when it’s confirmed so I can set HubSpot → Demo Booked.
```

## Steps — post-demo outcome

After **Demo Booked**, Floor confirmed only three outcomes:

| Outcome | HubSpot / app stage |
|---|---|
| Demo Completed | `demo_completed` |
| Rescheduled | `demo_rescheduled` |
| Cancelled | `demo_cancelled` |

1. Ask which of the three.
2. Update HubSpot via **session HubSpot MCP/tools** (preferred) or web-app `push_stage`.
3. Keep writeback language **English**.

Pre–Demo Booked pipeline names are still unknown — do not invent stage labels before Demo Booked.

## Prefer session tools

Floor’s HubSpot + Slack are connected to her Claude Cowork. Prefer those tools in-session. Do not require embedding private-app tokens or Calendar OAuth in the web app for this skill.

## What this skill never does

- Auto-create calendar events (Google Calendar, Calendly, HubSpot meetings, Outlook).
- Send the lead a booking link and treat that as “booked” without Floor’s confirmation.
- Skip the conversation in the Slack ping.
- Book for AEs other than Ludwig unless Floor explicitly redirects.

## Done when

- Floor has a Slack ping with lead + **conversation** + interest + links, or
- Stage is Demo Booked / Completed / Rescheduled / Cancelled as requested, in English, after her manual Ludwig booking.
