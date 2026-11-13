---
name: sales-lemlist-push
description: After Floor approves every written line, add the lead and its approved copy to the Lemlist pilot campaign; Lemlist visits the profile, likes the latest post, sends the invite, the one email and the LinkedIn messages, and stops on reply. Prefer Lemlist's Claude connector in Cowork; the web-app API route is a stub.
---

# sales-lemlist-push

Willow uses **Lemlist** (Nov 2026). Floor connects her **email inbox** and **LinkedIn** inside Lemlist; Lemlist then runs the whole multichannel sequence and stops it when the lead replies.

## How to reach Lemlist (in this order)

1. **Lemlist’s Claude connector** (“Connect to Claude” in Lemlist) in Floor’s Cowork session — preferred, same as HubSpot / Gmail / Slack. Use its tools to add the lead to the pilot campaign with the variables below. Check which tools it exposes before the first batch; if it can’t set custom variables, say so instead of improvising.
2. **Web app** `POST /api/lemlist { sequenceId }` — **stub**: returns `mode: "stub"` + the exact lead payload, sends nothing.
   - Lemlist’s REST API needs a plan with API access. On Floor’s plan (Nov 2026) the key is valid but every route answers **402 “available starting emailPro plan”**.
   - LinkedIn steps need Lemlist’s **Multichannel** plan.

**Never tell Floor a step went out through Lemlist** unless the connector / API confirmed it. Say: “Approved and ready — it goes out once Lemlist is connected.” Meanwhile the email goes out via **`sales-gmail-send`** and the LinkedIn lines are held.

## The campaign (set up once)

Campaign steps are shared templates, so each written step is just a variable; each lead carries its own Floor-approved copy:

| Day | Lemlist step | Content |
|---|---|---|
| 0 | LinkedIn: **Visit profile** | — (lead field `visitProfile`) |
| 0 | LinkedIn: **Like last post** | — (lead field `likeLastPost`) |
| 0 | LinkedIn: **Invitation** | `{{connectNote}}` (≤200 chars incl. variables) |
| 1 | **Email** | subject `{{emailSubject}}` · body `{{emailBody}}` |
| 3 | Condition **Accepted invite** → Yes: LinkedIn **Chat message** | `{{linkedinMessage}}` |
| 5 | LinkedIn **Chat message** (same Yes branch) | `{{linkedinFollowup}}` |

- Start with a **Has LinkedIn URL** condition; leads without one get only the email.
- Turn on **stop on reply** for both channels.
- Lead fields: `email` (required — Lemlist keys leads by email), `firstName`, `lastName`, `companyName`, `linkedinUrl`. A skipped written step arrives as an empty variable (listed in `skippedSteps`) — the campaign must skip a step whose variable is empty; a skipped visit/like arrives as `false`.

## Push rules

Push one lead at a time, **once**, only when:

- **every** non-skipped written line (invite note, email, both LinkedIn messages) is **approved** — the automatic visit/like need no approval,
- the lead has an email address,
- nothing in the sequence was already sent (e.g. the email via the Gmail fallback),
- the sequence hasn’t stopped on a reply.

Once a lead is in Lemlist, **never** also send its email from Gmail.

## Stop on reply

Lemlist stops the lead’s sequence on a reply (email or LinkedIn). Mirror it in the web app with `record_reply`, then hand the reply to `sales-reply-demo`.

## HubSpot logging

Lemlist’s HubSpot integration can log sends and replies. If Floor turns it on, don’t log the same activity again from the agent (dedup by subject + time, like `sales-gmail-send`).

## When the API is available (to wire the web app)

1. Put `LEMLIST_API_KEY` and `LEMLIST_CAMPAIGN_ID` in `.env.local` (never commit; never on the public demo).
2. Implement the add-lead-to-campaign call in `pushToLemlist`; keep every approve check.
3. Read Lemlist replies into `sales-reply-demo`.

## Guardrail

```text
approve EVERY written line → one push to Lemlist (connector first; web app = stub)
  → d0 visit · like · invite → d1 email → d3 msg (if accepted) → d5 follow-up
  → reply on either channel → Lemlist stops it → record_reply → sales-reply-demo
```
