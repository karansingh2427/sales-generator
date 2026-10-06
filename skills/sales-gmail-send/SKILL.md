---
name: sales-gmail-send
description: After Floor approves, send Gmail cold-sequence emails (max 3 per lead, ~1 week between). Stop early on clear no or interest → Slack Floor with conversation. No LinkedIn API, no Lemlist. Use when Floor says send approved or send via Gmail.
---

# sales-gmail-send

Send **approved** email steps through **Gmail** in Floor’s Claude Cowork session.

## Prerequisites

- **Gmail** connected (prefer same Google as Calendar).
- Steps **approved** in the queue (`sales-sequence-draft`).
- Never send pending / skipped / unapproved.

## Cadence (Floor end vision)

1. Send **Email 1** when approved.
2. If **no reply after ~1 week** → send **Email 2** (if approved / approve when due).
3. Same for **Email 3** — **hard cap**. Never a 4th.
4. **Stop early:**
   - Clear **no** → do not send further emails; close sequence.
   - **Interest** (yes / more info / “what are you talking about?”) → **do not** keep pitching; run `sales-demo-book` (Slack Floor + **full conversation** → she books Ludwig).

## Guardrail

```text
approved due email → Gmail send → mark sent
  → clear no → stop
  → interest → sales-demo-book (Slack Floor + conversation)
```

No LinkedIn API. No Lemlist. No send before approve (pilot).

## Batch send

On `send approved` / `send 1-20` / `send-all approved`:

1. List approved emails **due now** (respect ~1 week waits).
2. Short digest of count + recipients.
3. Send via Gmail (To / Subject / body from approved draft).
4. Mark sent; report failures.
5. Leave Email 2/3 until wait elapses and still no reply / no stop signal.

## Done when

- Due approved emails sent (or failures listed).
- Cap 3 respected; early stop on no/interest handled.
