---
name: sales-gmail-send
description: Gmail self-test; after Floor approves, send Email 1 and auto-schedule Email 2 (+7d) and Email 3 (+14d) if no reply. Max 3. Stop on reply → Slack Floor. No LinkedIn/Lemlist.
---

# sales-gmail-send

Send **approved** cold-sequence emails through **Gmail**. Auto-schedule follow-ups — **do not rely on Floor remembering**.

## Step 0 — Gmail self-test (before any Dutch batch)

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

1. Send **only** to Floor’s own Gmail (connected account).
2. Subject: `Willow Sales Generator test` · Body: `Gmail send works.`
3. **Do not** contact leads or draft sequences yet.
4. Confirm she should check her inbox; then wait for the batch prompt.

## Cadence (hard)

| Touch | When | Action |
|---|---|---|
| **Email 1** | On approve + “send” | Send now via Gmail |
| **Email 2** | **Exactly 7 days** after E1 if **no reply** | Auto-scheduled — not manual |
| **Email 3** | **Exactly 7 days** after E2 (14 after E1) if still **no reply** | Auto-scheduled — not manual |
| Cap | **Max 3** | Never a 4th |

### Stop on reply

- Clear **no** → cancel any scheduled E2/E3; close sequence.
- **Interest** (yes / more info / “what are you talking about?”) → cancel scheduled follow-ups; run `sales-demo-book` (Slack Floor + **full conversation** → she books Ludwig).

## Auto-schedule (required when sending E1)

After sending approved **Email 1**, for each lead **immediately** set follow-ups so Floor does nothing later:

1. Prefer **Gmail scheduled send** for Email 2 at **T+7 days** and Email 3 at **T+14 days** (same thread / Re: subject, approved bodies).
2. If scheduled send isn’t available: create a **Cowork reminder or task** (or HubSpot task) dated T+7 / T+14: “Send approved Email 2/3 to \<lead\> if no reply — cancel if replied.”
3. Tell Floor in one line: “E1 sent; E2/E3 scheduled for \<dates\> if no reply.”
4. **Never** ask her to remember to follow up.

Before a scheduled E2/E3 fires: check inbox/thread for a reply. If any reply → cancel remaining; apply stop rules above.

## Prerequisites (lead sends)

- Gmail connected · steps **approved** · self-test done (or she confirms Gmail works).
- Never send pending / skipped / unapproved.

## Guardrail

```text
self-test (own inbox) → approve → send E1 now
  → schedule E2 @ +7d · E3 @ +14d (Gmail schedule or Cowork/HubSpot reminder)
  → reply? cancel rest · no → stop · interest → Slack Floor + conversation
  → max 3
```

No LinkedIn API. No Lemlist. No send before approve (pilot).

## Batch send

On `send approved` / `send 1-20` / `send-all approved`:

1. Digest: count + recipients for E1 due now.
2. Send E1 via Gmail.
3. **Schedule** E2 (+7d) and E3 (+14d) per lead (see Auto-schedule).
4. Mark E1 sent; report schedule dates + failures.

## Done when

- E1 sent (or failures listed).
- E2/E3 scheduled or remindered — Floor need not remember.
- Cap 3 + stop-on-reply honored.
