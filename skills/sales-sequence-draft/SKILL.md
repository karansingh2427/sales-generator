---
name: sales-sequence-draft
description: Batch-draft Gmail cold sequences (max 3) for Dutch HubSpot leads. Senior voice, one story arc, Email 2 @ +7d / Email 3 @ +14d if no reply (auto-scheduled). Approve queue.
---

# sales-sequence-draft

**Floor path:** HubSpot notes → one coherent 3-email story → approve queue → send E1 → **auto-schedule** E2 (+7d) / E3 (+14d) if no reply.

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

## Cadence (hard)

| Email | Timing |
|---|---|
| 1 | Send on approve |
| 2 | **Exactly 7 days** after E1 if **no reply** — auto-scheduled |
| 3 | **Exactly 7 days** after E2 if still **no reply** — auto-scheduled |
| Cap | **Max 3** |

Stop on reply: **no** → close · **interest** → Slack Floor · **confused / don’t understand** → gracious short reply + HubSpot log + cancel E2/E3 + **no demo**. Cancel remaining scheduled sends. Consistency angle stays valid for other leads.

`sales-gmail-send` owns scheduling **and** HubSpot email logging after every successful send (dedup if Gmail sync already created one). **Never rely on Floor remembering.**

## Default prompts (from START-HERE)

**Step 0 — Gmail self-test:**

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

**Then batch:**

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch 50 Dutch HubSpot tasks. From each company note only, draft one coherent 3-email Gmail story (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Consistency angle phrasing: “I see you haven’t been posting consistently” — never “I saw your post yesterday/Friday”. One post does not kill that angle. Skip frequent posters (bad lead). Don’t live-check LinkedIn every run — trust HubSpot notes. Email 2 after exactly 7 days if no reply; email 3 after another 7 days if still no reply (max 3). Auto-schedule follow-ups via Gmail/Cowork — don’t ask me to remember. After every send, log the email in HubSpot on the contact (skip if already synced). Stop on reply (no/interest → Slack me; if confused / don’t get the point → short gracious reply, log HubSpot, cancel follow-ups, no demo). Show approve queue. Do not send yet. Skip Belgian leads.

## Research / send rules

- Prefer HubSpot notes; LinkedIn research OK when thin / asked — not every run.
- **Gmail only** send. No LinkedIn send/API. No Lemlist.
- **Approve-before-send** (pilot). Dutch only in pilot batches.

## Guardrail

```text
Step 0 self-test → style from HubSpot sent emails
  → ONE story → draft E1–E3 → approve queue
  → send E1 → schedule E2 @ +7d · E3 @ +14d
  → reply? cancel · no → stop · interest → Slack Floor
```

## Approve queue

1. Draft 3 emails per company (one story); mark E2 due +7d, E3 due +14d.
2. Numbered approve queue.
3. Floor: **approve** · **edit** · **skip**.
4. `sales-gmail-send` sends E1 + schedules E2/E3.
5. Chunk default **50**.

```text
# Approve queue — <date> · Dutch · Gmail max 3 · E2@+7d E3@+14d

| # | Company | Contact | Status | Story | Schedule |
|---|---------|---------|--------|-------|----------|
| 1 | Acme NL  | Jan | pending | vacancy→hiring trust | E1 now · E2 +7d · E3 +14d |
```

## Drafting checklist

1. One insight from HubSpot note; one tension; soft Willow on same thread.
2. Short CTA in E1; same story in E2–E3.
3. Never content-calendar pivot on a vacancy story.
4. Consistency phrasing: “haven’t been posting consistently” — never a single-post date callout; one post ≠ consistent; skip frequent posters; no live LinkedIn check every run.
5. Label waits: Email 2 after **exactly 7 days** if no reply; Email 3 after **another 7 days**.

## Done when

- ≤3 drafts, one story, senior tone; E2/E3 timing explicit (+7 / +14).
- Floor approved before any send; scheduling handed to `sales-gmail-send`.
