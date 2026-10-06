---
name: sales-lead-run
description: Floor Dutch cold-email pass — Gmail self-test, senior voice, one story, E1 send + auto-schedule E2@+7d / E3@+14d if no reply. Approve → Gmail.
---

# sales-lead-run

Floor follows `START-HERE-FLOOR.md`. Quality good on first run; follow-ups auto-scheduled.

## End vision

| | |
|---|---|
| **Step 0** | Gmail self-test to her own inbox |
| **Input** | Dutch HubSpot tasks + notes |
| **Voice** | Sales pro 20+ years; match past HubSpot sent emails |
| **Sequence** | One story · E1 now · **E2 after exactly 7 days if no reply** · **E3 after another 7 days** · max 3 |
| **Schedule** | Gmail scheduled send or Cowork/HubSpot reminder — **not** Floor’s memory |
| **Stop** | Reply no → close · interest → Slack Floor + conversation → she books Ludwig |
| **Pilot** | Approve before send |

## Invoke in order

0. **Gmail self-test** — own inbox only; no leads.
1. **CRM style** — past HubSpot sent emails + feedback.
2. **`sales-hubspot-pull`** — Dutch tasks; skip Belgian.
3. **`sales-sequence-draft`** — one story · E2@+7d · E3@+14d → approve queue.
4. **`sales-gmail-send`** — send E1 + **auto-schedule** E2/E3.
5. Reply watch → cancel scheduled · stop or Slack Floor.

## Prompts (START-HERE)

**Step 0:**

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

**Batch:**

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch 50 Dutch HubSpot tasks. From each company note only, draft one coherent 3-email Gmail story (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Email 2 after exactly 7 days if no reply; email 3 after another 7 days if still no reply (max 3). Auto-schedule follow-ups via Gmail/Cowork — don’t ask me to remember. Stop on reply (no/interest → Slack me). Show approve queue. Do not send yet. Skip Belgian leads.

## Never

- Ask Floor to remember follow-ups.
- Vacancy → random content calendar.
- More than 3 emails · LinkedIn send · Lemlist · auto-book · send before approve.

## Digest

```text
# Sales lead run — <date>
Self-test: ok · Queued / approved · E1 sent · E2/E3 scheduled (+7/+14): <n>
Stopped (no / interest Slack): <n>/<n>
```
