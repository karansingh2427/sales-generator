---
name: sales-sequence-draft
description: Batch-draft multi-channel LinkedIn + email sequences from HubSpot company notes into an approve queue for Netherlands-first NL+BE leads. Floor approves/edits/skips per item or approve-all selected — never auto-send. Phase 1 = approve queue; phase 2 auto-send is not implemented. Use when Floor asks to draft sequences, batch 50, fill the approve queue, or write LinkedIn/email for prospects.
---

# sales-sequence-draft

Turn one company **or a batch** (tens–hundreds) of NL+BE companies into **LinkedIn → wait → LinkedIn follow-up → email** draft sequences. Reuse HubSpot **company notes**. Floor works an **approve queue** — she approves, edits, or skips per item (or approve-all selected). She still **sends herself** in LinkedIn/email.

## Geography

Netherlands first, Belgium second. **NL + BE only.** Refuse sequences for other countries. Pilot batches default to **Dutch** leads.

## Phases (do not confuse)

| Phase | Behavior | Status |
|---|---|---|
| **1 — Approve queue (this skill)** | Bulk draft → queue → Floor approves/edits/skips → she sends → mark sent | **Ship / use** |
| **2 — Auto-send** | Agent sends LinkedIn/email without per-item human send | **Later — do not implement** |

Never implement or claim phase-2 auto-send. “Approve-all” means approve drafts in the queue — **not** auto-send.

## Guardrail (mandatory)

```text
batch draft → approve queue → Floor approves/edits/skips (per item or selected)
  → Floor sends in LinkedIn/email client → mark sent
```

Never auto-send. Never claim a message was delivered by this skill.

## Batch / approve-queue mode (primary)

When Floor says “batch”, “draft 50”, “today’s Dutch tasks”, or `sales-lead-run` hands off a list:

1. Draft sequences for **each** selected company (reuse notes + feedback).
2. Put every draft into an **approve queue** (numbered list she can scan).
3. For each queue item she may: **approve** · **edit** · **skip** · **hold**.
4. Support **approve-all selected** (or “approve items 1–20”) — still draft-only; she sends outside.
5. Do **not** mark sent until she confirms she sent that step.
6. If the batch is large, draft in chunks (e.g. 50) and keep a running queue digest.

### Approve queue digest shape

```text
# Approve queue — <date> · <n> items (Dutch / NL)

| # | Company | Contact | Status | Next step to send |
|---|---------|---------|--------|-------------------|
| 1 | Acme NL  | Jan Partner | pending | LI connect |
| 2 | Beta BV  | Sam Founder | approved | LI connect (Floor sends) |
| 3 | …        | …           | skipped | — |

Commands: approve #N | edit #N | skip #N | approve selected: 1,2,5 | approve-all pending | next chunk
```

### Per-item draft (same as single mode)

Show full sequence prose under each # so Floor can edit before approve.

## Inputs

- Company + contact from `sales-hubspot-pull` (batch table or pasted notes).
- Required note fields when available: `whyGood`, `opener`, `rightContact`.
- Opportunity angles when present: consistency, content quality, content mix, visibility, open vacancies.
- **Active Floor feedback** (`.data/feedback.json` or `skills/memory/FEEDBACK.md`) — tone, never-pitch topics, sequence notes, ICP memory. Load before drafting.

## Playbook (default)

| Step | Kind | Wait |
|---|---|---|
| 1 | LinkedIn connection request | 0 |
| 2 | LinkedIn message / InMail | 0 (same day if connected) |
| 3 | Wait | ~3 days |
| 4 | LinkedIn follow-up | 0 |
| 5 | Email follow-up | ~2 days after prior |

CTA: offer a 30-minute Willow demo with AE **Ludwig**. When they agree, hand off via `sales-demo-book` (Slack Floor + conversation — she books Ludwig manually). Do not paste fake calendar URLs.

## Drafting rules

1. Open with the CRM **opener** / why-good — do not invent case studies.
2. Name the opportunity angle in plain language (consistency, quality, mix, visibility, vacancies).
3. Keep messages short; LinkedIn connect note ≤ ~280 characters when possible.
4. CRM writebacks stay **English**; outreach drafts may be NL/FR/EN — ask Floor if language unclear.
5. Skip if social presence is **strong** or company is in active skip feedback.
6. Apply **tone** and **never_pitch** feedback (omit forbidden topics).
7. Show every draft as readable prose; queue status stays **pending** until she approves.
8. Feedback never auto-sends and never skips the approve step.
9. Batch size default **50** when she says “a batch” without a number.

## Output shape (per lead)

```markdown
## Sequence — <Firm> · <BE|NL> · <Contact>

**Rationale:** <whyGood + angles>
**Right contact:** <rightContact>
**Queue status:** pending | approved | edited | skipped

### 1. LinkedIn connect
<draft>

### 2. LinkedIn message
<draft>

### 3. Wait (~3 days)

### 4. LinkedIn follow-up
<draft>

### 5. Email
**Subject:** <subject>
<body>

Reply **approve #N** / **edit #N** / **skip #N** (or approve-all selected) before any send.
```

## Web-app mirror

Same flow exists in the Sales Generator UI (`Sequences` tab / `POST /api/sequences`). Prefer drafting here when Floor is in Claude/Cursor with HubSpot tools; sync stage marks into HubSpot in English when she asks. UI may stay single-lead; **Cowork skills are the batch path**.

## Done when

- Batch (or single) drafts exist in the **approve queue**.
- Floor has approved / edited / skipped items (or approve-all selected) before send.
- Sent steps are marked only after she confirms she sent them outside the agent.
- Phase-2 auto-send was **not** offered as available.
