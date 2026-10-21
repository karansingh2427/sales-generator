---
name: sales-sequence-draft
description: Batch-draft HeyReach (LinkedIn) + Gmail sequences for Dutch HubSpot leads — LinkedIn connect → DM day 3 → Email 1–3 (max 3). Senior voice, one story arc, stop on any reply. Approve every line.
---

# sales-sequence-draft

**Floor path:** HubSpot notes → one coherent story across LinkedIn + email → approve every line → HeyReach sends LinkedIn, Gmail sends email → any reply stops everything.

Reference flow Floor shared (Reachium campaign page): short messages in her voice, one question, stop the moment someone replies, nothing sends until she approves the list and every line.

## Persona (hard)

Write as a **sales professional with 20–30 years experience**. Calm, specific, peer-to-peer. Never AI-ish, never junior, never a feature dump.

## Story arc (hard rule) — one thread only

1. **Open** with the HubSpot-note insight (vacancy / consistency / visibility / etc.).
2. Develop **one** tension that logically follows that insight.
3. Soft **Willow bridge** that continues the *same* story — never pivot to an unrelated product angle.
4. Short CTA (curious / open to chat) — not a demo pitch dump in Email 1.

Emails **2–3** continue the same story; escalate lightly. Do not restart with a new random angle.

### Consistency / LinkedIn posting (Floor-corrected)

- Phrase: **“I see you haven’t been posting consistently”** — **never** “I saw your post yesterday/Friday” (or any single-post callout).
- **One** recent post does **not** invalidate the inconsistent-posting angle.
- If they post **frequently** (strong / polished presence) → **bad lead** — skip / don’t follow up (existing strong-presence disqualifier).
- **Do not** live-check LinkedIn vs notes every run — trust HubSpot notes. LinkedIn research only when notes are thin or Floor asks.

### BAD vs GOOD

| | |
|---|---|
| **BAD** | Vacancy opener → sudden Willow “content calendar”. **Or** “I saw your post on Friday…” |
| **GOOD** | “I see you haven’t been posting consistently…” → one tension → soft Willow on same thread. **Or** vacancy → hiring-brand story (no random pivot). |

### Reply classes (when they answer)

| Reply | Do |
|---|---|
| Clear no | Cancel E2/E3 · close |
| Interest | Cancel E2/E3 · Slack Floor + conversation |
| Confused / “don’t understand your point” / pushback on opener | Gracious short reply · HubSpot log · **cancel E2/E3** · **no demo** · close — **do not** ban the consistency angle on future leads |

## CRM style learning (once per session / batch)

Before drafting: pull Floor’s **past HubSpot sent emails** for tone + apply feedback playbook.

## LinkedIn steps (HeyReach)

| Step | Rule |
|---|---|
| **Connect note** (day 0) | **≤300 characters**. Name + firm + the one angle from the note. No pitch, no link, no demo ask. |
| **DM** (day 3, only if connected + no reply) | 2–3 short lines: thanks → the same tension → **one** easy question. Reachium-style. |
| No LinkedIn URL in HubSpot | Skip LinkedIn steps — email-only, E1 on approve. Don’t scrape to find the URL unless Floor asks. |

## Cadence (hard)

| Step | Channel | Timing |
|---|---|---|
| Connect + note | LinkedIn (HeyReach) | Day 0 on approve |
| DM | LinkedIn (HeyReach) | Day 3 if no reply |
| Email 1 | Gmail | Day 6 if no reply |
| Email 2 | Gmail | Day 13 — **exactly 7 days** after E1 if no reply |
| Email 3 | Gmail | Day 20 — **exactly 7 days** after E2 if no reply |
| Cap | — | **Max 3 emails** |

**Until HeyReach is connected** (`sales-heyreach-push` is a stub): still draft + get approval on the LinkedIn lines, but they are **held** — run the emails on the email-only cadence (E1 on approve, E2 +7d, E3 +14d). Never tell Floor a LinkedIn message was sent.

**Stop on any reply — LinkedIn or email** — cancel every remaining step on both channels, then `sales-reply-demo`.

Stop on reply: **no** → close · **interest** → Slack Floor · **confused / don’t understand** → gracious short reply + HubSpot log + cancel E2/E3 + **no demo**. Cancel remaining scheduled sends. Consistency angle stays valid for other leads.

`sales-gmail-send` owns scheduling **and** HubSpot email logging after every successful send (dedup if Gmail sync already created one). **Never rely on Floor remembering.**

## Default prompts (from START-HERE)

**Step 0 — Gmail self-test:**

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

**Then batch:**

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch 50 Dutch HubSpot tasks. From each company note only, draft one coherent story: LinkedIn connect note (≤300 chars) → LinkedIn DM on day 3 (2–3 lines, one question) → 3 Gmail emails (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Consistency angle phrasing: “I see you haven’t been posting consistently” — never “I saw your post yesterday/Friday”. One post does not kill that angle. Skip frequent posters (bad lead). Don’t live-check LinkedIn every run — trust HubSpot notes. Email 2 after exactly 7 days if no reply; email 3 after another 7 days if still no reply (max 3). Auto-schedule follow-ups via Gmail/Cowork — don’t ask me to remember. After every send, log the email in HubSpot on the contact (skip if already synced). Stop on any reply, LinkedIn or email (no/interest → Slack me; if confused / don’t get the point → short gracious reply, log HubSpot, cancel follow-ups, no demo). Show approve queue. Do not send yet. Skip Belgian leads.

## Research / send rules

- Prefer HubSpot notes; LinkedIn research OK when thin / asked — not every run.
- **HeyReach** sends LinkedIn steps (`sales-heyreach-push`); **Gmail** sends email steps (`sales-gmail-send`). No other LinkedIn automation. No Lemlist.
- **Approve-before-send on every line** (pilot). Dutch only in pilot batches.

## Guardrail

```text
Step 0 self-test → style from HubSpot sent emails
  → ONE story → draft LI connect + LI DM + E1–E3 → approve every line
  → HeyReach: connect d0 · DM d3   |   Gmail: E1 d6 · E2 d13 · E3 d20
  → reply on either channel? cancel ALL remaining · no → stop · interest → Slack Floor
```

## Approve queue

1. Draft connect note + DM + 3 emails per company (one story); label each step’s day.
2. Numbered approve queue — show LinkedIn lines **and** emails.
3. Floor: **approve** · **edit** · **skip** (per line or per company).
4. `sales-heyreach-push` takes LinkedIn steps; `sales-gmail-send` sends emails + schedules follow-ups.
5. Chunk default **50**.

```text
# Approve queue — <date> · Dutch · HeyReach + Gmail (max 3 emails)

| # | Company | Contact | Status | Story | Schedule |
|---|---------|---------|--------|-------|----------|
| 1 | Acme NL  | Jan | pending | vacancy→hiring trust | LI connect d0 · LI DM d3 · E1 d6 · E2 d13 · E3 d20 |
```

## Drafting checklist

1. One insight from HubSpot note; one tension; soft Willow on same thread.
2. Short CTA in E1; same story in E2–E3.
3. Never content-calendar pivot on a vacancy story.
4. Consistency phrasing: “haven’t been posting consistently” — never a single-post date callout; one post ≠ consistent; skip frequent posters; no live LinkedIn check every run.
5. Connect note ≤300 chars, no pitch; DM ends in one question.
6. Label waits: DM day 3; E1 day 6; E2 **exactly 7 days** after E1; E3 **another 7 days**.

## Done when

- Connect note + DM + ≤3 emails, one story, senior tone; timing explicit per step.
- Floor approved every line before any send; LinkedIn handed to `sales-heyreach-push`, email to `sales-gmail-send`.
