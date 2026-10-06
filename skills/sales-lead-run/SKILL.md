---
name: sales-lead-run
description: Floor Dutch cold-email pass — Gmail self-test, one story, E1 + auto E2/E3, HubSpot email log after every send. Approve → Gmail.
---

# sales-lead-run

Floor follows `START-HERE-FLOOR.md`. Follow-ups auto-scheduled; **every lead email logged in HubSpot**.

## End vision

| | |
|---|---|
| **Step 0** | Gmail self-test to her own inbox |
| **Input** | Dutch HubSpot tasks + notes |
| **Voice** | Sales pro 20+ years; match past HubSpot sent emails |
| **Sequence** | One story · E1 now · E2 @ +7d if no reply · E3 @ +14d · max 3 |
| **Schedule** | Gmail schedule or Cowork/HubSpot reminder |
| **HubSpot** | After **every** successful Gmail send (E1/E2/E3) → email engagement on contact/company (dedup if Gmail sync already logged) |
| **Stop** | Reply no → close · interest → Slack Floor · **just posted / don’t understand** → gracious reply + HubSpot log + cancel E2/E3 + **no demo** |
| **Angles** | No stale “quiet LinkedIn / not posting” unless note fresh & specific; prefer vacancy/hiring-brand when they post |
| **Pilot** | Approve before send |

## Invoke in order

0. **Gmail self-test** — own inbox only; no leads; no HubSpot log needed.
1. **CRM style** — past HubSpot sent emails + feedback.
2. **`sales-hubspot-pull`** — Dutch tasks; skip Belgian.
3. **`sales-sequence-draft`** — one story · E2@+7d · E3@+14d → approve queue.
4. **`sales-gmail-send`** — send E1 → **HubSpot log** → auto-schedule E2/E3 (each later send also HubSpot-logged).
5. Reply watch → cancel scheduled · stop or Slack Floor.

## Prompts (START-HERE)

**Step 0:**

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

**Batch:**

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch 50 Dutch HubSpot tasks. From each company note only, draft one coherent 3-email Gmail story (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Don’t claim quiet LinkedIn / not posting unless the note is fresh and specific — prefer vacancy/hiring-brand when they post. Email 2 after exactly 7 days if no reply; email 3 after another 7 days if still no reply (max 3). Auto-schedule follow-ups via Gmail/Cowork — don’t ask me to remember. After every send, log the email in HubSpot on the contact (skip if already synced). Stop on reply (no/interest → Slack me; if they say they just posted / don’t get the point → short gracious reply, log HubSpot, cancel follow-ups, no demo). Show approve queue. Do not send yet. Skip Belgian leads.

## Never

- Claim “quiet LinkedIn / not posting” on a stale note when they posted recently.
- Push demo after a “we just posted / don’t understand” reply.
- Skip HubSpot logging after a successful lead send (unless dedup finds an existing match).
- Ask Floor to remember follow-ups.
- Vacancy → random content calendar · >3 emails · LinkedIn send · Lemlist · auto-book · send before approve.

## Digest

```text
# Sales lead run — <date>
Self-test: ok · E1 sent · HubSpot logged / dedup-skipped: <n>/<n>
E2/E3 scheduled (+7/+14): <n> · Stopped (no / interest Slack): <n>/<n>
```
