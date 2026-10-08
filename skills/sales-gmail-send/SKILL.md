---
name: sales-gmail-send
description: Gmail self-test; send approved E1 and auto-schedule E2/E3; log every successful send as a HubSpot email engagement. Stop on reply → Slack Floor.
---

# sales-gmail-send

Send **approved** cold-sequence emails through **Gmail**. Auto-schedule follow-ups. **Log every successful send in HubSpot.**

## Step 0 — Gmail self-test (before any Dutch batch)

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

1. Send **only** to Floor’s own Gmail (connected account).
2. Subject: `Willow Sales Generator test` · Body: `Gmail send works.`
3. **Do not** contact leads or draft sequences yet.
4. Self-test need **not** be logged to HubSpot (it isn’t a lead email).

## Cadence (hard)

| Touch | When | Action |
|---|---|---|
| **Email 1** | On approve + “send” | Send via Gmail → **log HubSpot** → schedule E2/E3 |
| **Email 2** | **Exactly 7 days** after E1 if **no reply** | Send (or fire schedule) → **log HubSpot** |
| **Email 3** | **Exactly 7 days** after E2 if still **no reply** | Send → **log HubSpot** |
| Cap | **Max 3** | Never a 4th |

### Stop on reply → `sales-reply-demo`

When any reply arrives (or Floor pastes “Check my replies…”), hand off to **`sales-reply-demo`** for full classify + act:

| Class | Action (summary) |
|---|---|
| **BOOK NOW** | Cancel E2/E3 · short reply with **2 Ludwig slots** · Slack Floor + thread · she books Ludwig (`sales-demo-book`) · never auto-book |
| **NOT YET** | One value-building reply (same story) · **keep** E2/E3 · HubSpot-log · no Slack book yet |
| **NO** | Gracious close · cancel E2/E3 · HubSpot-log · no demo |
| **CONFUSED** | Gracious short reply · cancel E2/E3 · HubSpot-log · **no** demo |

Politeness / “sounds interesting” ≠ BOOK NOW. Consistency angle stays valid for other leads.

## HubSpot log (required after every successful lead send)

After **each** successful Gmail send of E1, E2, or E3:

1. Create/log a HubSpot **email engagement** on the **contact** from the Dutch task (associate **company** too when known).
2. Fields: **subject**, **body or snippet**, **direction = outbound**, **timestamp** (send time), association to contact/company.
3. Prefer HubSpot tools in Floor’s Cowork session.
4. Gmail↔HubSpot auto-sync may already exist — **still** log explicitly so nothing is missed.
5. **Dedup:** before creating, check recent engagements on that contact for the same subject + similar timestamp (± a few minutes). If a matching outbound email already exists, **skip** — do not double-post.
6. If HubSpot log fails after Gmail succeeded: report the failure; do **not** resend the email. Retry log once if safe.

Self-test emails to Floor herself are exempt.

## Auto-schedule (required when sending E1)

1. Prefer **Gmail scheduled send** for E2 at **T+7 days** and E3 at **T+14 days**.
2. Else: Cowork / HubSpot reminder/task dated T+7 / T+14.
3. One line to Floor: “E1 sent + HubSpot logged; E2/E3 scheduled for \<dates\>.”
4. Never ask her to remember follow-ups.

Before scheduled E2/E3 fires: check for reply → cancel if any; else send → **HubSpot log**.

## Prerequisites

- Gmail + HubSpot connected · steps **approved** · self-test done.
- Never send pending / skipped / unapproved.

## Guardrail

```text
self-test → approve → Gmail send E1 → HubSpot email engagement (dedup)
  → schedule E2 @ +7d · E3 @ +14d
  → on fire: send → HubSpot log (dedup)
  → reply? cancel · no → stop · interest → Slack Floor
  → max 3
```

## Batch send

1. Digest recipients for E1 due now.
2. Send E1 via Gmail.
3. **HubSpot-log** each success (dedup).
4. Schedule E2/E3.
5. Report: sent / HubSpot logged / scheduled / failures.

## Done when

- E1 sent + HubSpot logged (or dedup skip noted).
- E2/E3 scheduled; when they send, also HubSpot-logged.
- Cap 3 + stop-on-reply honored.
