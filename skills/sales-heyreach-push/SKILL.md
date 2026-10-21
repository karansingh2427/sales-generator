---
name: sales-heyreach-push
description: After Floor approves, push the LinkedIn steps (connect note + day-3 DM) of a HeyReach + Gmail sequence to HeyReach. STUB until Willow's HeyReach API key is connected — shows the payload, sends nothing.
---

# sales-heyreach-push

LinkedIn half of the sequence. **HeyReach** sends LinkedIn; **Gmail** (`sales-gmail-send`) sends email.

## Status: STUB

Willow is taking a HeyReach subscription; the API key is not connected yet.

- Web app: `POST /api/heyreach { sequenceId }` → returns `mode: "stub"` + the exact payload (LinkedIn URL, name, company, approved connect note + DM). **Nothing is sent.**
- With `HEYREACH_API_KEY` set the mode is `live_not_wired` — still nothing is sent until the campaign call is implemented in `src/lib/heyreach.ts`.
- **Never tell Floor a LinkedIn message was sent.** Say: “LinkedIn lines approved and ready — they go out once HeyReach is connected.”

## What gets pushed

| Step | Day | Rule |
|---|---|---|
| Connect request + note | 0 | ≤300 chars, no pitch |
| DM | 3 | Only if connected + no reply; 2–3 lines, one question |

Only steps with `sendVia: "heyreach"` and status **approved**. Refuse if:

- any pending LinkedIn step is not approved,
- the lead has no LinkedIn URL (sequence is email-only),
- the sequence already stopped on a reply.

## Stop on reply

A reply in HeyReach’s inbox **or** Gmail stops the whole sequence: `record_reply` (web app) / cancel the HeyReach campaign lead + scheduled Gmail sends → hand to `sales-reply-demo`.

## When the key arrives (to wire)

1. Put `HEYREACH_API_KEY` in `.env.local` (never commit).
2. Floor picks the LinkedIn sender account(s) + campaign.
3. Implement the add-lead-to-campaign call in `pushToHeyReach`; keep the approve checks.
4. Pull HeyReach replies into `sales-reply-demo`.

## Guardrail

```text
approve every LinkedIn line → push to HeyReach (stub: payload only)
  → connect d0 · DM d3 → reply on either channel → stop ALL → sales-reply-demo
```
