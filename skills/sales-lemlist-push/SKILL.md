---
name: sales-lemlist-push
description: Add quality-gate-passed leads (automatic mode) and their 5 texts to the running Lemlist campaign "Willow NL pilot" via Floor's Lemlist Claude connector — max 20/day with LinkedIn steps, read back after every change, never another campaign, stop conditions + "Stop the automatic outreach". Web-app API route is a stub (402 on her plan).
---

# sales-lemlist-push

Willow uses **Lemlist** (Nov 2026). Floor connects her **email inbox** and **LinkedIn** inside Lemlist; Lemlist then runs the whole multichannel sequence and stops it when the lead replies.

## How to reach Lemlist (in this order)

1. **Lemlist’s Claude connector** in Floor’s Cowork session — **confirmed working (20 Nov 2026)**: ~280 tools, no plan block. It can list campaigns + steps + stats, add/change/preview sequence steps, **add leads to a campaign with custom variables in one call**, update a lead’s variables, read the inbox and reply, and list senders (inboxes, LinkedIn). Use it for every Lemlist action.
2. **Web app** `POST /api/lemlist { sequenceId }` — **stub**: returns `mode: "stub"` + the exact lead payload, sends nothing.
   - Lemlist’s REST API needs a plan with API access. On Floor’s plan (Nov 2026) the key is valid but every route answers **402 “available starting emailPro plan”**.
   - LinkedIn steps need Lemlist’s **Multichannel** plan.

## Safety rules for Floor’s Lemlist account (hard)

Floor’s workspace has **~183 campaigns**, including a **running** one (“Floor - 2024 - Law”) and campaigns of Ali, Will and Brent.

- **Only ever touch the campaign “Willow NL pilot”** (and “Willow NL pilot - test” during setup). Never edit, pause, launch, or add leads to any other campaign — even read-only browsing elsewhere only when Floor asks.
- **Launching** the pilot campaign (draft → running) only when Floor says so in words, e.g. “launch the pilot”. Adding leads to a **draft** campaign sends nothing; adding to a **running** campaign starts their sequence.
- **Before adding a lead, search Lemlist for that email / LinkedIn URL across all campaigns.** If the person is in any other campaign (old Law / HR / IT / Accountancy campaigns from 2022–2025 included), **skip** them — they were already contacted — and say so in the batch report.
- Never delete campaigns, leads or steps. Never change senders or settings.
- **Read back before you claim.** After every Lemlist change, re-read the campaign (lead count, each lead’s variables, steps) and report what Lemlist actually shows — never what you expect. Before launch, confirm every lead has all five variables filled with Floor-approved text and nothing else is in the campaign.
- **LinkedIn URL must be a profile link** (`linkedin.com/in/…`). Sales Navigator links (`linkedin.com/sales/…`) don’t work for Lemlist’s LinkedIn steps — find the normal profile link, or add the lead without a LinkedIn URL (email-only branch) and say so.
- **Volume:** max **20 new leads/day with LinkedIn steps** (Lemlist limits: invites 10/day ramping to 20, visits 25, messages 25; window Mon–Fri 09:00–17:30). Extra leads that day go in without a LinkedIn URL (email-only).
- **Stop conditions:** if Floor’s email or LinkedIn sender is disconnected, Lemlist shows errors or bounces, or anything looks off — add nothing, Slack Floor.
- **“Stop the automatic outreach”** → pause the morning task and the campaign “Willow NL pilot” immediately.
- **Launching** happens only after Floor types it in words (“Launch the campaign …”). Never tell her to press a button labelled Launch; if a UI step is needed, name it exactly (e.g. “the Launch *tab* at the top — don’t press the blue button”).

**Never tell Floor a step went out through Lemlist** unless the connector confirmed it (read back). The campaign is **running** since 20 Nov 2026, so leads you add **start right away** within the sending window.

## The campaign (set up once)

Campaign steps are shared templates, so each written step is just a variable; each lead carries its own Floor-approved copy:

| Day | Lemlist step | Content |
|---|---|---|
| 0 | LinkedIn: **Visit profile** | — (lead field `visitProfile`) |
| 0 | LinkedIn: **Like last post** | — (lead field `likeLastPost`) |
| 0 | LinkedIn: **Invitation** | `{{connectNote}}` (≤200 chars incl. variables) |
| 0 | **Email** | subject `{{emailSubject}}` · body `{{emailBody}}` |
| on accept | Condition **Accepted invite** (waits up to 14 days) → Yes: LinkedIn **Chat message** | `{{linkedinMessage}}` |
| +2 days | LinkedIn **Chat message** (same Yes branch) | `{{linkedinFollowup}}` |

- Start with a **Has LinkedIn URL** condition; leads without one get only the email.
- Turn on **stop on reply** for both channels.
- Lead fields: `email` (required — Lemlist keys leads by email), `firstName`, `lastName`, `companyName`, `linkedinUrl`. A skipped written step arrives as an empty variable (listed in `skippedSteps`) — the campaign must skip a step whose variable is empty; a skipped visit/like arrives as `false`.

## Push rules

Push one lead at a time, **once**, only when:

- the lead **passed the quality gate** (`sales-sequence-draft`), or Floor approved it after it was held as ⚠️ — **never add a ⚠️ lead on your own**,
- all 5 texts are filled (`connectNote`, `emailSubject`, `emailBody`, `linkedinMessage`, `linkedinFollowup`),
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
quality gate passed (⚠️ → Floor) → one push to “Willow NL pilot” via the connector (web app = stub) → read back
  → d0 visit · like · invite · email → msg as soon as they accept → follow-up +2 days
  → reply on either channel → Lemlist stops it → record_reply → sales-reply-demo
```
