---
name: sales-demo-book
description: Book Willow demos on per-AE calendar links and set post-demo HubSpot stages — Demo Booked → Completed | Rescheduled | Cancelled. Netherlands/Belgium leads only. Use when Floor has a meeting to schedule, needs an AE link, or must update demo outcome in HubSpot.
---

# sales-demo-book

Floor books demos the same way she does after cold calls: paste the **AE’s personal calendar link**. This skill helps pick the AE, hand Floor the link, and write HubSpot stages in **English**.

## Geography

Only for companies in the **Netherlands** or **Belgium**. Refuse other countries.

## Booking mechanism

- Use **per-AE calendar URLs** from the roster (placeholders until Floor pastes real links).
- Do **not** invent a shared Calendly / round-robin unless ops changes the rule.
- Default duration: **30 minutes** (allowed 15–60).

### Roster (placeholders — replace with Floor’s real URLs)

| AE | Calendar URL |
|---|---|
| Sarah Chen | `https://calendar.willow.co/ae/sarah-chen` |
| Marcus Webb | `https://calendar.willow.co/ae/marcus-webb` |
| Elena Kostova | `https://calendar.willow.co/ae/elena-kostova` |

When Floor supplies real links, update `src/lib/willow-context.ts` (`DEFAULT_AES`) and this table.

## Steps — book

1. Confirm lead is BE or NL and not disqualified.
2. Ask which AE owns the demo (or pick from roster).
3. Give Floor that AE’s **calendar link** to send/book.
4. After the slot is confirmed, set CRM stage to **Demo Booked** (English).
5. Record AE name, datetime, duration, meeting link in the local workspace / HubSpot note if she asks.

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

## Prefer session HubSpot tools

Floor’s HubSpot is connected to her Claude. Prefer updating deal/contact stage through those tools in-session. Do not require embedding a private-app token in the web app for this skill to work.

## Done when

- Floor has the correct AE calendar link, or
- Stage is Demo Booked / Completed / Rescheduled / Cancelled as requested, in English.
