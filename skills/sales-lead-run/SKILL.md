---
name: sales-lead-run
description: Floor Dutch LinkedIn + email pass (Lemlist; Gmail fallback) — multi-batch day (2–3×), 30-day HubSpot lookback, never-contacted only, Gmail self-test, one story, visit + like + invite → ONE email → 2 LinkedIn messages, HubSpot email log after every send, reply→demo classifier. Approve every line → Lemlist (LinkedIn + email, stub until connected; Gmail for email meanwhile). Re-runs are normal; never treat “already ran once” as done forever.
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
| **Sequence** | One story · d0 visit profile → like latest post → invite (≤200 chars) → **one** email → LinkedIn message as soon as they accept → follow-up 2 days later · max **1** email · while Lemlist is a stub: LinkedIn lines approved + held, the email via Gmail on approve |
| **Send** | Fully approved lead → `sales-lemlist-push` (LinkedIn + email) · until Lemlist is live: email → `sales-gmail-send` |
| **Consistency** | Phrase “haven’t been posting consistently” — never “saw your post Friday”; one post ≠ consistent; skip **frequent** posters |
| **Schedule** | Lemlist runs the timing once connected; Cowork recurring for batch runs |
| **HubSpot** | After every successful Gmail send → email engagement (dedup if already synced) |
| **Replies** | `sales-reply-demo` — BOOK NOW / NOT YET / NO / CONFUSED (politeness ≠ intent) · Slack ping on every reply · hourly check Mon–Fri |
| **Daily update** | `sales-daily-update` — Slack Floor Mon–Fri 09:00 (sent, replies + rate, demos, awaiting approval) |
| **Stop** | Any reply stops the sequence · NO → close · BOOK NOW → Slack Floor + 2 Ludwig slots · CONFUSED → gracious, no demo · NOT YET → one value reply |
| **Pilot** | Approve every written line (LinkedIn + email) before send · any reply stops everything |

## Invoke in order

0. **Gmail self-test** — own inbox only; no leads; no HubSpot log needed. Skip if Floor already confirmed send works on this machine.
1. **CRM style** — past HubSpot sent emails + feedback (ignore retracted “soften not-posting if recent post”).
2. **`sales-hubspot-pull`** — Dutch tasks **last ~30 days**; **never-contacted only**; skip Belgian; skip frequent / strong-presence posters; exclude already drafted/sent earlier today.
3. **`sales-sequence-draft`** — one story · visit/like/invite → 1 email → 2 LinkedIn messages → approve queue.
4. **`sales-lemlist-push`** (connector first) — push fully approved leads · until Lemlist is live: **`sales-gmail-send`** sends the one email → **HubSpot log**.
5. **`sales-reply-demo`** — pull inbound replies → classify → **Slack ping Floor on every reply** → draft/act → BOOK NOW → Template R + 2 slots (`sales-demo-book`); never auto-book.
6. **Offer next batch** — after the queue is handled, remind Floor she can run **another batch now** or wait for the next scheduled run (target 2–3×/day). Do **not** close as if the day is finished.

## Prompts (START-HERE)

**Step 0:**

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

**Batch (first run or any run):**

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch up to 50 Dutch HubSpot tasks from the last ~30 days (not only today). Only include contacts/companies never contacted before — skip anyone with prior outbound email or logged outreach in HubSpot. For each, from the company note only, draft one personal multichannel sequence for the person in the note: Lemlist visits their LinkedIn profile and likes their latest post → connection request with a short note (≤200 characters) → right after: ONE personal email on why I’m reaching out (insight → one tension → soft Willow bridge → short CTA) → as soon as they accept: LinkedIn message (“I also sent you an email — connecting here because …”, one question) → 2 days later: LinkedIn follow-up. Only one email; the follow-ups are on LinkedIn. Consistency angle phrasing: “I see you haven’t been posting consistently” — never “I saw your post yesterday/Friday”. One post does not kill that angle. Skip frequent posters (bad lead). Don’t live-check LinkedIn every run — trust HubSpot notes. Until Lemlist is connected: send the approved email from Gmail and hold the LinkedIn lines. After every send, log it in HubSpot on the contact (skip if already synced). Stop on any reply, LinkedIn or email (no/interest → Slack me; if confused / don’t get the point → short gracious reply, log HubSpot, no demo). Show approve queue. Do not send yet. Skip Belgian leads. This is one batch of 2–3 today — running again later is normal; do not treat a prior run as done forever.

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
- Ask Floor to remember follow-ups · vacancy → content calendar · more than 1 email · LinkedIn send outside Lemlist · claiming a send while Lemlist is a stub · sending a Lemlist lead’s emails from Gmail too · send before approve.

## Digest

```text
# Sales lead run — <date> · batch <n> of day
Lookback: last ~30d · Never-contacted kept: <n> · Skipped already-contacted: <n>
Self-test: ok/skipped · Pushed to Lemlist: <n> · Email via Gmail fallback: <n> · HubSpot logged / dedup-skipped: <n>/<n>
LinkedIn lines held for Lemlist: <n> · Replies handled (BOOK NOW / NOT YET / NO / CONFUSED): <n>/<n>/<n>/<n>
Next: run another batch now · or next scheduled slot (target 2–3×/day)
```
