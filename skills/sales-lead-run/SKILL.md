---
name: sales-lead-run
description: Orchestrate Floor’s Dutch cold-email pass — one paste prompt, senior voice, HubSpot note → one story, approve → Gmail. Quality good on first run.
---

# sales-lead-run

One operator pass for Floor. She pastes **one** prompt from `START-HERE-FLOOR.md` — do not ask her to teach story per email.

## End vision

| | |
|---|---|
| **Input** | Dutch HubSpot daily tasks + company notes |
| **Voice** | Sales pro 20+ years; match her past HubSpot sent emails |
| **Transform** | One coherent 3-email story per note (insight → tension → soft Willow → short CTA) |
| **Stop early** | Clear no → close · Interest → Slack Floor + conversation → she books Ludwig |
| **Pilot** | Approve → Gmail send |
| **Never** | Random product pivots · Lemlist · LinkedIn send · auto-book Calendar · overwhelm Floor with steps |

## Invoke in order

0. **CRM style (once/batch)** — pull Floor’s past HubSpot sent emails for tone/format + load `sales-feedback-learn` memory.
1. **`sales-hubspot-pull`** — Dutch tasks + notes. Chunk 50. Skip Belgian.
2. **`sales-sequence-draft`** — one story arc per lead → approve queue.
3. **`sales-gmail-send`** — after approve.
4. Replies → clear no stop · interest → **`sales-demo-book`**.

## The one prompt (Floor pastes)

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch 50 Dutch HubSpot tasks. From each company note only, draft one coherent 3-email Gmail story (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Show approve queue. Do not send yet. Skip Belgian leads.

## What this pass never does

- Pivot vacancy/quiet-LI openers into unrelated “content calendar” pitches.
- Feature-dump Willow in Email 1.
- Restart Email 2–3 with a new random angle.
- Overwhelm Floor with multi-step docs — `START-HERE-FLOOR.md` is enough.
- LinkedIn send · Lemlist · auto-book · send before approve · non-English HubSpot writes.

## Digest

```text
# Sales lead run — <date>
Mode: Gmail max 3 · one story · senior voice · approve → Gmail
Style samples (HubSpot sent): <n>
Queued / approved / sent E1: <n>/<n>/<n>
```
