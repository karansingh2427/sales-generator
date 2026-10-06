---
name: sales-sequence-draft
description: Batch-draft Gmail cold sequences (max 3) for Dutch HubSpot leads. Senior voice, one story arc, Email 2 @ +7d / Email 3 @ +14d if no reply (auto-scheduled). Approve queue.
---

# sales-sequence-draft

**Floor path:** HubSpot notes → one coherent 3-email story → approve queue → send E1 → **auto-schedule** E2 (+7d) / E3 (+14d) if no reply.

## Persona (hard)

Write as a **sales professional with 20–30 years experience**. Calm, specific, peer-to-peer. Never AI-ish, never junior, never a feature dump.

## Story arc (hard rule) — one thread only

1. **Open** with the HubSpot-note insight (prefer **vacancy / hiring-brand** when present).
2. Develop **one** tension that logically follows that insight.
3. Soft **Willow bridge** that continues the *same* story — never pivot to an unrelated product angle.
4. Short CTA (curious / open to chat) — not a demo pitch dump in Email 1.

Emails **2–3** continue the same story; escalate lightly. Do not restart with a new random angle.

### Freshness — “quiet LinkedIn / not posting” (hard)

- **Do not** claim “quiet LinkedIn / nothing happening / not posting” unless the HubSpot note is **fresh and specific** (recent date or clear current observation).
- If the company has **recent posts** (or the note is stale/vague on activity): **skip or soften** not-posting angles.
- Prefer **vacancy / hiring-brand / visibility around open roles** when those exist.
- Optional quick LinkedIn check before drafting if the note’s “quiet” claim looks old — still don’t blanket-scrape every company.

### BAD vs GOOD

**Note:** “Open vacancies online, LinkedIn quiet.”

| | |
|---|---|
| **BAD** | Vacancy opener → sudden Willow “content calendar”. **Or** “nothing happening on LinkedIn” when they posted days ago. |
| **GOOD** | Vacancy → candidates/clients check LinkedIn → hiring-brand story around open roles → soft Willow on hiring visibility → “curious if on your radar?” |

### Reply classes (when they answer)

| Reply | Do |
|---|---|
| Clear no | Cancel E2/E3 · close |
| Interest | Cancel E2/E3 · Slack Floor + conversation |
| “We just posted” / “don’t understand your point” (stale opener) | Gracious short reply · HubSpot log · **cancel E2/E3** · **no demo push** · close |

## CRM style learning (once per session / batch)

Before drafting: pull Floor’s **past HubSpot sent emails** for tone + apply feedback playbook.

## Cadence (hard)

| Email | Timing |
|---|---|
| 1 | Send on approve |
| 2 | **Exactly 7 days** after E1 if **no reply** — auto-scheduled |
| 3 | **Exactly 7 days** after E2 if still **no reply** — auto-scheduled |
| Cap | **Max 3** |

Stop on reply: **no** → close · **interest** → Slack Floor · **just posted / don’t understand (stale opener)** → gracious short reply + HubSpot log + cancel E2/E3 + **no demo**. Cancel remaining scheduled sends.

`sales-gmail-send` owns scheduling **and** HubSpot email logging after every successful send (dedup if Gmail sync already created one). **Never rely on Floor remembering.**

## Default prompts (from START-HERE)

**Step 0 — Gmail self-test:**

> Send me one short test email via Gmail to my own inbox with subject “Willow Sales Generator test” and body “Gmail send works.” Don’t contact any leads yet.

**Then batch:**

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch 50 Dutch HubSpot tasks. From each company note only, draft one coherent 3-email Gmail story (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Don’t claim quiet LinkedIn / not posting unless the note is fresh and specific — prefer vacancy/hiring-brand when they post. Email 2 after exactly 7 days if no reply; email 3 after another 7 days if still no reply (max 3). Auto-schedule follow-ups via Gmail/Cowork — don’t ask me to remember. After every send, log the email in HubSpot on the contact (skip if already synced). Stop on reply (no/interest → Slack me; if they say they just posted / don’t get the point → short gracious reply, log HubSpot, cancel follow-ups, no demo). Show approve queue. Do not send yet. Skip Belgian leads.

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
4. Never stale “not posting / quiet LinkedIn” unless note is fresh & specific — prefer vacancy/hiring-brand when recent posts exist.
5. Label waits: Email 2 after **exactly 7 days** if no reply; Email 3 after **another 7 days**.

## Done when

- ≤3 drafts, one story, senior tone; E2/E3 timing explicit (+7 / +14).
- Floor approved before any send; scheduling handed to `sales-gmail-send`.
