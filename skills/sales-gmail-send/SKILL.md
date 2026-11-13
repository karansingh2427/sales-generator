---
name: sales-gmail-send
description: Email fallback until Lemlist is connected — Gmail self-test, send the ONE approved email per lead via Gmail, log it in HubSpot. No email follow-ups (those happen on LinkedIn via Lemlist). Stop on reply → sales-reply-demo.
---

# sales-gmail-send

**Email fallback until Lemlist is connected.** Send the **approved** email of each lead’s sequence through **Gmail** and **log it in HubSpot**. The sequence has **one email**; follow-ups happen on LinkedIn through Lemlist, never as extra emails.

Once Lemlist is live it sends the email itself (`sales-lemlist-push`) — **never** send a Lemlist lead’s email from Gmail too. LinkedIn steps are not this skill’s job (they are held until Lemlist is connected).

## Step 0 — Gmail self-test (before any Dutch batch)

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

1. Send **only** to Floor’s own Gmail (connected account).
2. Subject: `Willow Sales Generator test` · Body: `Gmail send works.`
3. **Do not** contact leads or draft sequences yet.
4. Self-test need **not** be logged to HubSpot (it isn’t a lead email).

## Send (hard)

| What | When | Action |
|---|---|---|
| **The email** | On approve + “send” | Send via Gmail → **log HubSpot** |
| Follow-ups | — | **None by email.** LinkedIn message (day 3) + follow-up (day 5) run in Lemlist once connected. |
| Cap | **1 email per lead** | Never a second cold email |

PS line: keep “I also sent you a connection request on LinkedIn” only if the invite really went out (i.e. Lemlist is live). While LinkedIn lines are held, remove that PS before sending.

### Stop on reply → `sales-reply-demo`

When any reply arrives **on Gmail or LinkedIn (Lemlist inbox, once connected)** (or Floor pastes “Check my replies…”), stop everything still pending for that lead and hand off to **`sales-reply-demo`**:

| Class | Action (summary) |
|---|---|
| **BOOK NOW** | Short reply with **2 Ludwig slots** · Slack Floor + thread · she books Ludwig (`sales-demo-book`) · never auto-book |
| **NOT YET** | One value-building reply (same story) · HubSpot-log · no further automated touches |
| **NO** | Gracious close · HubSpot-log · no demo |
| **CONFUSED** | Gracious short reply · HubSpot-log · **no** demo |

Politeness / “sounds interesting” ≠ BOOK NOW. Consistency angle stays valid for other leads.

## HubSpot log (required after every successful lead send)

After each successful Gmail send:

1. Create/log a HubSpot **email engagement** on the **contact** from the Dutch task (associate **company** too when known).
2. Fields: **subject**, **body or snippet**, **direction = outbound**, **timestamp** (send time), association to contact/company.
3. Prefer HubSpot tools in Floor’s Cowork session.
4. Gmail↔HubSpot auto-sync may already exist — **still** log explicitly so nothing is missed.
5. **Dedup:** before creating, check recent engagements on that contact for the same subject + similar timestamp (± a few minutes). If a matching outbound email already exists, **skip** — do not double-post.
6. If HubSpot log fails after Gmail succeeded: report the failure; do **not** resend the email. Retry log once if safe.

Self-test emails to Floor herself are exempt.

## Prerequisites

- Gmail + HubSpot connected · the email is **approved** · self-test done.
- Never send pending / skipped / unapproved. Never send for a lead already pushed to Lemlist.

## Guardrail

```text
self-test → approve → Gmail send the ONE email → HubSpot email engagement (dedup)
  → no email follow-ups (LinkedIn follow-ups run in Lemlist once connected)
  → reply? stop · no → close · interest → Slack Floor
```

## Batch send

1. Digest recipients whose email is approved and due.
2. Send via Gmail.
3. **HubSpot-log** each success (dedup).
4. Report: sent / HubSpot logged / failures / LinkedIn lines held for Lemlist.

## Done when

- The email sent + HubSpot logged (or dedup skip noted).
- No second email scheduled; stop-on-reply honored.
