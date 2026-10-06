---
name: sales-sequence-draft
description: Batch-draft Gmail cold sequences (max 3) for Dutch HubSpot leads. Senior sales voice, one story arc per lead, CRM sent-email style learning. Prefer HubSpot notes. Approve queue. Gmail only send.
---

# sales-sequence-draft

**Floor path:** HubSpot notes → one coherent 3-email story → approve queue → Gmail send after approve.

## Persona (hard)

Write as a **sales professional with 20–30 years experience**. Calm, specific, peer-to-peer. Never AI-ish, never junior, never a feature dump.

## Story arc (hard rule) — one thread only

1. **Open** with the HubSpot-note insight (vacancy / quiet LinkedIn / visibility / etc.).
2. Develop **one** tension that logically follows that insight.
3. Soft **Willow bridge** that continues the *same* story (why this matters for hiring / visibility / trust) — never pivot to an unrelated product angle.
4. Short CTA (curious / open to chat) — not a demo pitch dump in Email 1.

Emails **2–3** continue the same story; escalate lightly. Do not restart with a new random angle.

### BAD vs GOOD

**Note:** “Open vacancies online, LinkedIn quiet.”

| | |
|---|---|
| **BAD** | Good vacancy opener → sudden Willow “content calendar” / feature dump. Random pivot. |
| **GOOD** | Vacancy → candidates/clients check LinkedIn → quiet page hurts hiring trust → soft Willow bridge on hiring visibility → “curious if on your radar?” |

## CRM style learning (once per session / batch)

**Before drafting any batch:**

1. Pull Floor’s **past sent emails** from HubSpot (engagements / email logs) as tone + structure examples.
2. Apply stored feedback playbook (`sales-feedback-learn` / “emails should look like this”).
3. Match length, warmth, and CTA softness from her real sends — not a generic BDR template.

## Default batch prompt (Floor pastes this once)

> You are a sales pro with 20+ years experience. Read my past HubSpot sent emails for tone/format. Then batch 50 Dutch HubSpot tasks. From each company note only, draft one coherent 3-email Gmail story (insight → one tension → soft Willow bridge → short CTA). Same story in emails 2–3. Show approve queue. Do not send yet. Skip Belgian leads.

## Research / send rules

- Prefer HubSpot notes when present.
- LinkedIn scrape/research OK when notes are thin or Floor asks — don’t force every run.
- **Gmail only** send channel. No LinkedIn send/API. No Lemlist.
- Cap **3** emails; ~1 week between if no reply.
- Stop early: clear **no** → close · **interest** → Slack Floor + conversation → she books Ludwig.
- **Approve-before-send** (pilot).

## Geography

Netherlands first. Pilot batches = **Dutch only** (skip Belgian unless she includes them).

## Guardrail

```text
once/batch: pull Floor’s past HubSpot sent emails for tone
  → prefer HubSpot note → (optional LI research if thin/asked)
  → ONE story arc → draft Email 1–3 → approve queue
  → sales-gmail-send (after approve)
  → stop on clear no OR interest → Slack Floor → she books Ludwig
```

## Approve queue

1. Draft ≤3 emails per company from the note (one story).
2. Numbered **approve queue**.
3. Floor: **approve** · **edit** · **skip** · **approve-all selected**.
4. Then `sales-gmail-send` for approved due emails.
5. Chunk default **50**.

```text
# Approve queue — <date> · <n> · Dutch · Gmail max 3

| # | Company | Contact | Status | Story | Emails |
|---|---------|---------|--------|-------|--------|
| 1 | Acme NL  | Jan | pending | vacancy→hiring trust | E1 |

Commands: approve #N | edit #N | skip #N | approve-all pending | send approved | next chunk
```

## Drafting checklist (every email)

1. One primary insight from the HubSpot note — strip any CRM opener that already pivots to unrelated Willow features.
2. One tension that follows that insight.
3. Soft Willow bridge on the **same** thread only.
4. Short CTA (curious / chat) in Email 1; Ludwig ok in Email 3, still soft.
5. Match Floor’s past sent-email tone.
6. Apply never_pitch / tone feedback.
7. Never mention content calendar / quarterly calendar unless the **note** is specifically about posting cadence — and even then keep it story, not feature dump.
8. Queue stays **pending** until she approves.

## Per-lead output shape

```markdown
## Sequence — <Firm> · NL · <Contact> · Gmail (max 3)

**Background:** <HubSpot note>
**Story:** <one angle>
**Queue status:** pending | approved | edited | skipped

### Email 1 (day 0)
**Subject:** …
<body>

### Wait ~1 week (if no reply)

### Email 2 — same story
…

### Email 3 — same story (last)
…
```

## Done when

- ≤3 Gmail drafts per lead, one coherent story, senior tone.
- Style learned from HubSpot sent emails once this session.
- Floor approved/edited/skipped before any send.
