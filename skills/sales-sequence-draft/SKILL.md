---
name: sales-sequence-draft
description: Batch-draft Gmail cold email sequences (max 3) from Dutch HubSpot company notes only — never re-scrape LinkedIn/websites. Email 1 = note opener; ~1 week → Email 2; cap 3. Approve queue for pilot. Use when Floor asks to draft sequences, batch 50, or write cold emails from HubSpot notes.
---

# sales-sequence-draft

**One-liner:** HubSpot notes = **background**; the agent **personalizes the full email sequence** from that note only (**no re-scrape**).

Transform HubSpot **company notes** into a **Gmail cold email sequence** (max **3** emails). Do **not** re-scrape LinkedIn or the company website.

## End vision (Floor — bake this exactly)

### Input

- **Dutch HubSpot daily tasks** (pilot: skip Belgian unless she includes them).
- **Company notes** already contain opener / situation (vacancies, weak posting, visibility, consistency, etc.).
- **Never re-scrape** LinkedIn or websites. If the note is thin, ask Floor or skip — do not invent research.

### Output — automated cold email sequence (Gmail)

1. **Email 1** — personalized opener from the HubSpot note, in Floor’s sales tone (load feedback / “remember how I write”).
2. If **no reply after ~1 week** → **Email 2** follow-up.
3. Cap at **3 emails** total (Email 3 = last note).
4. **Stop early** when the reply is:
   - clear **no** → close sequence; thank briefly if needed; do not continue; or
   - **interest** (yes / more info / “what are you talking about?”) → hand off to `sales-demo-book`: **Slack Floor with full conversation** → she books Ludwig manually.
5. **Learn tone** from past feedback / “remember how I write” (`sales-feedback-learn`).

### Pilot guardrail

**Approve-before-send** still required. After approve → `sales-gmail-send`.  
**No Lemlist. No LinkedIn send.**

## Geography

Netherlands first, Belgium second. **NL + BE only.** Pilot batches = **Dutch** tasks.

## Channel (locked)

| Channel | Status |
|---|---|
| **Gmail cold email** | Primary |
| LinkedIn API send | Out of scope |
| Lemlist | Not used — Willow does not have it |

## Guardrail

```text
HubSpot note (only) → draft Email 1–3 → approve queue
  → sales-gmail-send (after approve)
  → stop on clear no OR interest → Slack Floor + conversation → she books Ludwig
```

## Batch / approve-queue mode

1. For each selected company: read note → draft up to **3** emails (Email 2/3 ready but held until wait + no reply).
2. Put drafts in a numbered **approve queue**.
3. Floor: **approve** · **edit** · **skip** · **approve-all selected**.
4. Then `sales-gmail-send` for approved Email 1 (and later 2/3 when due).
5. Chunk default **50**.

### Approve queue digest

```text
# Approve queue — <date> · <n> · Dutch · Gmail max 3

| # | Company | Contact | Status | Emails |
|---|---------|---------|--------|--------|
| 1 | Acme NL  | Jan | pending  | E1 opener from note |
| 2 | Beta BV  | Sam | approved | E1 ready → Gmail send |

Commands: approve #N | edit #N | skip #N | approve-all pending | send approved | next chunk
```

## Playbook

| Step | What | Timing |
|---|---|---|
| Email 1 | Opener from HubSpot note + Floor tone | Day 0 |
| Wait | No reply | ~1 week |
| Email 2 | Follow-up | After wait |
| Wait | No reply | ~1 week |
| Email 3 | Last note | After wait — **hard cap** |

Never draft a 4th email. Never continue after clear no or interest handoff.

## Drafting rules

1. **Transform the note only** — opener / situation / why-good / right contact. No LinkedIn/web scrape.
2. Match Floor’s **tone** from active feedback (“remember how I write”).
3. Short emails; firm-specific subject from the note angle.
4. CRM writebacks **English**; outreach NL/FR/EN per Floor.
5. Skip strong social presence or skip-feedback companies.
6. Apply never_pitch / tone feedback.
7. Queue stays **pending** until she approves (pilot).

## Per-lead output shape

```markdown
## Sequence — <Firm> · NL · <Contact> · Gmail (max 3)

**From note:** <opener / situation — quoted or paraphrased, not scraped>
**Rationale:** <whyGood + angles>
**Queue status:** pending | approved | edited | skipped

### Email 1 (day 0)
**Subject:** …
<body>

### Wait ~1 week (if no reply)

### Email 2
**Subject:** …
<body>

### Wait ~1 week (if no reply)

### Email 3 (last)
**Subject:** …
<body>

Stop early: clear no → close · interest → Slack Floor (full conversation) → she books Ludwig.
```

## Done when

- Notes transformed into ≤3 Gmail drafts in the approve queue (no scrape).
- Floor approved/edited/skipped before any send.
- Stop rules and tone learning are clear in the digest.
