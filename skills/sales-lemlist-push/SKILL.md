---
name: sales-lemlist-push
description: After Floor approves every line, add the lead and its approved LinkedIn + email copy to the Lemlist pilot campaign; Lemlist sends both channels and stops on reply. STUB until Willow's Lemlist API key is connected — shows the payload, sends nothing.
---

# sales-lemlist-push

Willow took a **Lemlist** subscription (Nov 2026). Lemlist sends the whole sequence — LinkedIn connect + DM and the emails (from Floor’s inbox connected inside Lemlist) — and stops it when the lead replies.

## Status: STUB

The API key is not connected yet.

- Web app: `POST /api/lemlist { sequenceId }` → returns `mode: "stub"` + the exact lead payload. **Nothing is sent.**
- With `LEMLIST_API_KEY` set the mode is `live_not_wired` — still nothing is sent until the add-lead call is implemented in `src/lib/lemlist.ts`.
- **Never tell Floor a LinkedIn message or email went out through Lemlist.** Say: “Approved and ready — it goes out once Lemlist is connected.”
- Meanwhile emails go out via **`sales-gmail-send`** (E1 on approve, +7d, +14d) and LinkedIn lines are held.

## How the campaign is set up

Lemlist campaign steps are shared templates, so every step is just a variable. Each lead carries its own Floor-approved copy:

| Step | Day | Lemlist step content |
|---|---|---|
| LinkedIn invite + note | 0 | `{{connectNote}}` (≤300 chars) |
| LinkedIn message | 3 | `{{linkedinMessage}}` (only if connected + no reply) |
| Email 1 | 6 | subject `{{email1Subject}}` · body `{{email1Body}}` |
| Email 2 | 13 | `{{email2Subject}}` · `{{email2Body}}` |
| Email 3 | 20 | `{{email3Subject}}` · `{{email3Body}}` |

Lead fields: `email` (required — Lemlist keys leads by email), `firstName`, `lastName`, `companyName`, `linkedinUrl`. A skipped step arrives as an empty variable and is listed in `skippedSteps`; the campaign must skip a step whose variable is empty. No LinkedIn URL → the lead gets the email-only sequence.

## Push rules

Push one lead at a time, **once**, only when:

- **every** non-skipped line (LinkedIn and email) is **approved**,
- the lead has an email address,
- nothing in the sequence was already sent (e.g. via the Gmail fallback),
- the sequence hasn’t stopped on a reply.

Once a lead is in Lemlist, **never** also send its emails from Gmail.

## Stop on reply

Lemlist stops the lead’s sequence on a reply (email or LinkedIn). Mirror it in the web app with `record_reply`, then hand the reply to `sales-reply-demo`.

## HubSpot logging

Lemlist’s HubSpot integration can log sends and replies. If Floor turns it on, don’t log the same activity again from the agent (dedup by subject + time, like `sales-gmail-send`).

## When the key arrives (to wire)

1. Put `LEMLIST_API_KEY` and `LEMLIST_CAMPAIGN_ID` in `.env.local` / Vercel env (never commit).
2. Floor connects her LinkedIn account + inbox in Lemlist; confirm her plan includes LinkedIn steps.
3. Build the pilot campaign with the variable steps above.
4. Implement the add-lead-to-campaign call in `pushToLemlist`; keep every approve check.
5. Read Lemlist replies into `sales-reply-demo`.

## Guardrail

```text
approve EVERY line → one push to Lemlist (stub: payload only)
  → connect d0 · DM d3 · E1 d6 · E2 d13 · E3 d20
  → reply on either channel → Lemlist stops it → record_reply → sales-reply-demo
```
