---
name: sales-lead-run
description: Floor Dutch cold-email pass — multi-batch day (2–3×), 30-day HubSpot lookback, never-contacted only, Gmail self-test, one story, E1 + auto E2/E3, HubSpot email log after every send, reply→demo classifier. Approve → Gmail. Re-runs are normal; never treat “already ran once” as done forever.
---

# sales-lead-run

Floor follows `START-HERE-FLOOR.md`. Follow-ups auto-scheduled; **every lead email logged in HubSpot**. Replies → `sales-reply-demo`.

**Cadence:** default **2–3 batches per day**. Each paste or schedule fire is a full new pass — not a one-shot.

## End vision

| | |
|---|---|
| **Step 0** | Gmail self-test to her own inbox (once per new machine / connector — skip if already proven) |
| **Input** | Dutch HubSpot tasks from **last ~30 days** + notes (trust notes — **no** live LinkedIn check every run) |
| **Filter** | **Never-contacted only** — skip prior outbound email / logged HubSpot outreach |
| **Cadence** | **2–3 batches/day**; re-runs normal; never “already ran once → done forever” |
| **Voice** | Sales pro 20+ years; match past HubSpot sent emails |
| **Sequence** | One story · E1 now · E2 @ +7d if no reply · E3 @ +14d · max 3 |
| **Consistency** | Phrase “haven’t been posting consistently” — never “saw your post Friday”; one post ≠ consistent; skip **frequent** posters |
| **Schedule** | Gmail schedule or Cowork/HubSpot reminder for E2/E3; Cowork recurring for batch runs |
| **HubSpot** | After every successful Gmail send → email engagement (dedup if already synced) |
| **Replies** | `sales-reply-demo` — BOOK NOW / NOT YET / NO / CONFUSED (politeness ≠ intent) |
| **Stop** | NO → close · BOOK NOW → Slack Floor + 2 Ludwig slots · CONFUSED → gracious + cancel E2/E3 · NOT YET → value reply, keep E2/E3 |
| **Pilot** | Approve before send |

## Invoke in order

0. **Gmail self-test** — own inbox only; no leads; no HubSpot log needed. Skip if Floor already confirmed send works on this machine.
1. **CRM style** — past HubSpot sent emails + feedback (ignore retracted “soften not-posting if recent post”).
2. **`sales-hubspot-pull`** — Dutch tasks **last ~30 days**; **never-contacted only**; skip Belgian; skip frequent / strong-presence posters; exclude already drafted/sent earlier today.
3. **`sales-sequence-draft`** — one story · E2@+7d · E3@+14d → approve queue.
4. **`sales-gmail-send`** — send E1 → **HubSpot log** → auto-schedule E2/E3.
5. **`sales-reply-demo`** — pull inbound replies → classify → draft/act → BOOK NOW → Slack Floor (`sales-demo-book`) + 2 slots; never auto-book.
6. **Offer next batch** — after the queue is handled, remind Floor she can run **another batch now** or wait for the next scheduled run (target 2–3×/day). Do **not** close as if the day is finished.

## Prompts (START-HERE)

**Step 0:**

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

**Batch (first run or any run):**

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch up to 50 Dutch HubSpot tasks from the last ~30 days (not only today). Only include contacts/companies never contacted before — skip anyone with prior outbound email or logged outreach in HubSpot. From each company note only, draft one coherent 3-email Gmail story (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Consistency angle phrasing: “I see you haven’t been posting consistently” — never “I saw your post yesterday/Friday”. One post does not kill that angle. Skip frequent posters (bad lead). Don’t live-check LinkedIn every run — trust HubSpot notes. Email 2 after exactly 7 days if no reply; email 3 after another 7 days if still no reply (max 3). Auto-schedule follow-ups via Gmail/Cowork — don’t ask me to remember. After every send, log the email in HubSpot on the contact (skip if already synced). Stop on reply (no/interest → Slack me; if confused / don’t get the point → short gracious reply, log HubSpot, cancel follow-ups, no demo). Show approve queue. Do not send yet. Skip Belgian leads. This is one batch of 2–3 today — running again later is normal; do not treat a prior run as done forever.

**Run another batch now:**

> Run another Dutch batch now (same rules): last ~30 days HubSpot tasks, never-contacted only, up to 50, skip anyone already in today’s earlier queues or with prior outbound/logged outreach. Draft approve queue. Do not send yet. Skip Belgian leads.

**Schedule 2–3×/day (Cowork):**

> Set this up to run about 2–3 times per day on a recurring schedule in Cowork (morning / midday / afternoon if you can). Each run should paste/execute the Dutch batch prompt above — fresh 30-day pull, never-contacted only, new approve queue. Do not stop after the first daily run. If Cowork scheduling UI differs, create recurring reminders that open this folder and run the batch prompt.

**Replies:**

> Check my replies from the Dutch batch and handle them.

## Multi-batch day — agent must

- Treat every invocation as a **new pull**, even if a batch already ran today.
- Dedup against: HubSpot prior outreach · earlier approve/sent queues today · active feedback skips.
- After finishing a batch, **explicitly invite** “run another batch now” or note the next scheduled slot.
- Never say or imply the daily job is complete after one batch unless the never-contacted 30-day pool is empty.

## Never

- Pull **today-only** tasks when the default 30-day pool is available.
- Draft / send to contacts or companies with **prior outbound email or logged outreach**.
- Treat “already ran once” as done for the day or forever.
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
# Sales lead run — <date> · batch <n> of day
Lookback: last ~30d · Never-contacted kept: <n> · Skipped already-contacted: <n>
Self-test: ok/skipped · E1 sent · HubSpot logged / dedup-skipped: <n>/<n>
E2/E3 scheduled (+7/+14): <n> · Replies handled (BOOK NOW / NOT YET / NO / CONFUSED): <n>/<n>/<n>/<n>
Next: run another batch now · or next scheduled slot (target 2–3×/day)
```
