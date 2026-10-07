---
name: sales-lead-run
description: Floor Dutch cold-email pass — Gmail self-test, one story, E1 + auto E2/E3, HubSpot email log after every send, reply→demo classifier. Approve → Gmail.
---

# sales-lead-run

Floor follows `START-HERE-FLOOR.md`. Follow-ups auto-scheduled; **every lead email logged in HubSpot**. Replies → `sales-reply-demo`.

## End vision

| | |
|---|---|
| **Step 0** | Gmail self-test to her own inbox |
| **Input** | Dutch HubSpot tasks + notes (trust notes — **no** live LinkedIn check every run) |
| **Voice** | Sales pro 20+ years; match past HubSpot sent emails |
| **Sequence** | One story · E1 now · E2 @ +7d if no reply · E3 @ +14d · max 3 |
| **Consistency** | Phrase “haven’t been posting consistently” — never “saw your post Friday”; one post ≠ consistent; skip **frequent** posters |
| **Schedule** | Gmail schedule or Cowork/HubSpot reminder |
| **HubSpot** | After every successful Gmail send → email engagement (dedup if already synced) |
| **Replies** | `sales-reply-demo` — BOOK NOW / NOT YET / NO / CONFUSED (politeness ≠ intent) |
| **Stop** | NO → close · BOOK NOW → Slack Floor + 2 Ludwig slots · CONFUSED → gracious + cancel E2/E3 · NOT YET → value reply, keep E2/E3 |
| **Pilot** | Approve before send |

## Invoke in order

0. **Gmail self-test** — own inbox only; no leads; no HubSpot log needed.
1. **CRM style** — past HubSpot sent emails + feedback (ignore retracted “soften not-posting if recent post”).
2. **`sales-hubspot-pull`** — Dutch tasks; skip Belgian; skip frequent / strong-presence posters.
3. **`sales-sequence-draft`** — one story · E2@+7d · E3@+14d → approve queue.
4. **`sales-gmail-send`** — send E1 → **HubSpot log** → auto-schedule E2/E3.
5. **`sales-reply-demo`** — pull inbound replies → classify → draft/act → BOOK NOW → Slack Floor (`sales-demo-book`) + 2 slots; never auto-book.

## Prompts (START-HERE)

**Step 0:**

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

**Batch:**

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch 50 Dutch HubSpot tasks. From each company note only, draft one coherent 3-email Gmail story (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Consistency angle phrasing: “I see you haven’t been posting consistently” — never “I saw your post yesterday/Friday”. One post does not kill that angle. Skip frequent posters (bad lead). Don’t live-check LinkedIn every run — trust HubSpot notes. Email 2 after exactly 7 days if no reply; email 3 after another 7 days if still no reply (max 3). Auto-schedule follow-ups via Gmail/Cowork — don’t ask me to remember. After every send, log the email in HubSpot on the contact (skip if already synced). Stop on reply (no/interest → Slack me; if confused / don’t get the point → short gracious reply, log HubSpot, cancel follow-ups, no demo). Show approve queue. Do not send yet. Skip Belgian leads.

**Replies:**

> Check my replies from the Dutch batch and handle them.

## Never

- Say “I saw your post yesterday/Friday” (or any single-post callout).
- Treat one post as proof of consistent posting.
- Live-check LinkedIn against notes on every batch.
- Treat politeness / “sounds interesting” as BOOK NOW.
- Push demo after NO or CONFUSED.
- Auto-book Ludwig / Calendar.
- Skip HubSpot logging after a successful lead send (unless dedup).
- Ask Floor to remember follow-ups · vacancy → content calendar · >3 emails · LinkedIn send · Lemlist · send before approve.

## Digest

```text
# Sales lead run — <date>
Self-test: ok · E1 sent · HubSpot logged / dedup-skipped: <n>/<n>
E2/E3 scheduled (+7/+14): <n> · Replies handled (BOOK NOW / NOT YET / NO / CONFUSED): <n>/<n>/<n>/<n>
```
