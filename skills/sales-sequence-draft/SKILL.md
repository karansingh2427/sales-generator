---
name: sales-sequence-draft
description: Draft multi-channel LinkedIn + email outreach sequences from HubSpot company notes for Belgium-first BE+NL leads. Human must approve every step before send — never auto-blast. Use when Floor asks to write LinkedIn connect/message, follow-ups, email drafts, or a full sequence for a prospect.
---

# sales-sequence-draft

Turn one (or a few) BE+NL companies into a **LinkedIn → wait → LinkedIn follow-up → email** draft sequence. Reuse the HubSpot **company note** (why-good, opener, right contact). Floor **approves** every message before she sends it outside the agent.

## Geography

Belgium first, Netherlands second. **BE + NL only.** Refuse sequences for other countries.

## Guardrail (mandatory)

```text
draft → Floor approves → Floor sends in LinkedIn/email client → mark sent
```

Never auto-send. Never claim a message was delivered by this skill. Floor asked for full automation; product policy stays human-in-the-loop until Willow + Floor explicitly OK auto-send.

## Inputs

- Company + contact from `sales-hubspot-pull` (or a pasted HubSpot company note).
- Required note fields when available: `whyGood`, `opener`, `rightContact`.
- Opportunity angles when present: consistency, content quality, content mix, visibility, open vacancies.

## Playbook (default)

| Step | Kind | Wait |
|---|---|---|
| 1 | LinkedIn connection request | 0 |
| 2 | LinkedIn message / InMail | 0 (same day if connected) |
| 3 | Wait | ~3 days |
| 4 | LinkedIn follow-up | 0 |
| 5 | Email follow-up | ~2 days after prior |

CTA: 30-minute Willow demo booked on the **AE’s personal calendar link** (not a shared Calendly). If AE unknown, say “we’ll send the right AE’s calendar link” — do not invent URLs.

## Drafting rules

1. Open with the CRM **opener** / why-good — do not invent case studies.
2. Name the opportunity angle in plain language (consistency, quality, mix, visibility, vacancies).
3. Keep messages short; LinkedIn connect note ≤ ~280 characters when possible.
4. CRM writebacks stay **English**; outreach drafts may be NL/FR/EN — ask Floor if language unclear.
5. Skip if social presence is **strong**.
6. Show every draft as readable prose and wait for **Approve** before she sends.

## Output shape (per lead)

```markdown
## Sequence — <Firm> · <BE|NL> · <Contact>

**Rationale:** <whyGood + angles>
**Right contact:** <rightContact>

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

Reply **approve step N** / **edit** / **skip** before any send.
```

## Web-app mirror

Same flow exists in the Sales Generator UI (`Sequences` tab / `POST /api/sequences`). Prefer drafting here when Floor is in Claude/Cursor with HubSpot tools; sync stage marks into HubSpot in English when she asks.

## Done when

- Drafts exist for each step.
- Floor has approved (or edited) before send.
- Sent steps are marked only after she confirms she sent them outside the agent.
