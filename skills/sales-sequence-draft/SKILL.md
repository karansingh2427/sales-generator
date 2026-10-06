---
name: sales-sequence-draft
description: Batch-draft Gmail cold email sequences (max 3) for Dutch HubSpot leads. Prefer HubSpot notes as background; LinkedIn scrape/research OK when notes are thin or Floor asks — never force every run. No LinkedIn send/API. Approve queue for pilot.
---

# sales-sequence-draft

**One-liner:** HubSpot notes = **preferred background**; personalize the **full Gmail sequence**. LinkedIn **scrape/research** is OK when notes are thin or Floor asks — don’t force every run. LinkedIn **send/API** is forbidden. Gmail is the only send channel.

## End vision (Floor)

### Input

- **Dutch HubSpot daily tasks** (pilot: skip Belgian unless she includes them).
- **Company notes** as preferred background (opener / situation: vacancies, weak posting, visibility, etc.).
- **Research policy:**
  - Prefer HubSpot notes when present — draft from them first.
  - **LinkedIn scrape/research = OK** to enrich notes, when notes are thin, or when Floor asks.
  - Do **not** re-scrape every company on every batch by default.
  - Never invent facts; if still thin after optional research, ask Floor or skip.

### Output — automated cold email sequence (Gmail)

1. **Email 1** — personalized opener from the HubSpot note (± optional LinkedIn enrichment), in Floor’s sales tone.
2. If **no reply after ~1 week** → **Email 2** follow-up.
3. Cap at **3 emails** total (Email 3 = last note).
4. **Stop early** when the reply is:
   - clear **no** → close sequence; or
   - **interest** (yes / more info / “what are you talking about?”) → `sales-demo-book`: **Slack Floor with full conversation** → she books Ludwig manually.
5. **Learn tone** from past feedback / “remember how I write” (`sales-feedback-learn`).

### Pilot guardrail

**Approve-before-send** still required. After approve → `sales-gmail-send`.  
**No Lemlist. No LinkedIn send / API outreach.** (Scrape/research ≠ send.)

## Geography

Netherlands first, Belgium second. **NL + BE only.** Pilot batches = **Dutch** tasks.

## Channel (locked)

| Channel | Status |
|---|---|
| **Gmail cold email** | **Only send channel** |
| LinkedIn scrape / research | **OK** when notes thin / Floor asks / enrich — not every run |
| LinkedIn API / InMail / connect send | **Forbidden** |
| Lemlist | Not used — Willow does not have it |

## Guardrail

```text
prefer HubSpot note → (optional LinkedIn research if thin / asked)
  → draft Email 1–3 → approve queue
  → sales-gmail-send (after approve)   ← Gmail only
  → stop on clear no OR interest → Slack Floor + conversation → she books Ludwig
```

## Batch / approve-queue mode

1. For each selected company: read note → draft up to **3** emails. Optionally enrich from LinkedIn only if note is thin or Floor asks — never blanket-scrape the whole batch.
2. Put drafts in a numbered **approve queue**.
3. Floor: **approve** · **edit** · **skip** · **approve-all selected**.
4. Then `sales-gmail-send` for approved Email 1 (and later 2/3 when due).
5. Chunk default **50**.

### Approve queue digest

```text
# Approve queue — <date> · <n> · Dutch · Gmail max 3

| # | Company | Contact | Status | Background | Emails |
|---|---------|---------|--------|------------|--------|
| 1 | Acme NL  | Jan | pending  | HubSpot note | E1 |
| 2 | Beta BV  | Sam | pending  | note + LI enrich | E1 |

Commands: approve #N | edit #N | skip #N | enrich #N from LinkedIn | approve-all pending | send approved | next chunk
```

## Playbook

| Step | What | Timing |
|---|---|---|
| Email 1 | Opener from HubSpot note (+ optional LI enrich) + Floor tone | Day 0 |
| Wait | No reply | ~1 week |
| Email 2 | Follow-up | After wait |
| Wait | No reply | ~1 week |
| Email 3 | Last note | After wait — **hard cap** |

Never draft a 4th email. Never continue after clear no or interest handoff.

## Drafting rules

1. Prefer HubSpot note (opener / situation / why-good / right contact). Enrich via LinkedIn only when thin or asked.
2. Match Floor’s **tone** from active feedback (“remember how I write”).
3. Short emails; firm-specific subject from the angle.
4. CRM writebacks **English**; outreach NL/FR/EN per Floor.
5. Skip strong social presence or skip-feedback companies.
6. Apply never_pitch / tone feedback.
7. Queue stays **pending** until she approves (pilot).
8. Never send via LinkedIn — Gmail only after approve.

## Per-lead output shape

```markdown
## Sequence — <Firm> · NL · <Contact> · Gmail (max 3)

**Background:** <HubSpot note summary> (± LinkedIn enrich if used)
**Rationale:** <whyGood + angles>
**Queue status:** pending | approved | edited | skipped

### Email 1 (day 0)
**Subject:** …
<body>

### Wait ~1 week (if no reply)

### Email 2
…

### Email 3 (last)
…

Stop early: clear no → close · interest → Slack Floor (full conversation) → she books Ludwig.
Send channel: Gmail only (no LinkedIn send).
```

## Done when

- ≤3 Gmail drafts in the approve queue (from notes ± optional research).
- Floor approved/edited/skipped before any send.
- No LinkedIn send attempted; optional scrape only when warranted.
