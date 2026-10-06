---
name: sales-hubspot-pull
description: Pull Dutch HubSpot daily tasks and company notes as preferred background for Gmail sequences — NL primary, BE secondary. LinkedIn research OK when notes thin or Floor asks; never force every run. No LinkedIn send. Prefer HubSpot tools in Floor’s Cowork session.
---

# sales-hubspot-pull

**One-liner:** HubSpot notes = **preferred background**. Pull them first. LinkedIn scrape/research is OK when notes are thin or Floor asks — don’t force every run.

Pull today’s **Dutch HubSpot daily tasks** (and NL+BE companies when present) and surface the **company notes** the internal lead-gen agent already wrote (opener / situation: vacancies, weak posting, visibility, etc.). Pass notes to `sales-sequence-draft` for Gmail personalization.

## Geography (hard rule)

| Priority | Market | Behavior |
|---|---|---|
| 1 · primary | **Netherlands (NL)** | Prefer / score highest; **default batch = Dutch tasks** |
| 2 · secondary | **Belgium (BE)** | Include only if Floor asks; otherwise skip in pilot batches |
| — | **Everything else** | **Out of scope** — never add to ICP lists, filters, mocks, or digests |

Default filter: `NL + BE`. Sort / present **Netherlands first**. Floor’s phase-1 pilot prompt: **Dutch tasks only** (skip Belgian).

## Batch pull (phase 1 — primary path)

Floor works in **bulk**: tens to hundreds of Dutch HubSpot tasks/companies per pass.

1. Prefer HubSpot **tasks** assigned to Floor / due today (or her filter) that point at NL companies; fall back to NL company search if tasks aren’t available.
2. Cap presentation in chunks Floor can review (e.g. first **50**, then “next 50”) unless she asks for the full set.
3. Apply feedback skips **before** counting toward the batch.
4. Output a numbered table ready for `sales-sequence-draft` **batch mode** → items land in an **approve queue** (not auto-send).

```text
Batch pull contract
- Source: Dutch HubSpot daily tasks (primary) → NL companies + notes
- Size: tens–hundreds; present in reviewable chunks (default 50)
- Next: sales-sequence-draft (Gmail max 3 from notes) → approve queue
- Never: LinkedIn API send, Lemlist, other countries, rebuild lead-gen, force LinkedIn scrape on every company every batch
```

## Prefer live HubSpot via session tools

Floor’s HubSpot is already connected to **her Claude**. In Cursor / Claude:

1. Use the **HubSpot MCP / native HubSpot tools** available in **this user session**.
2. Search **Tasks** (Dutch / NL) first when Floor says “today’s tasks” or “batch”; else **Companies** in the Netherlands first, then Belgium if asked.
3. Read **company notes** (and company properties if notes are empty) for:
   - **why-good** — why this firm fits Willow
   - **opener** — first-line outreach angle
   - **right contact** — Partner / Founder / Ops manager to reach
4. Do **not** ask her to paste a private-app token into the Sales Generator web app unless the session tools are unavailable and ops explicitly wants the `.env.local` fallback.

Web-app fallback (optional): `POST /api/hubspot { action: "sync" }` with mock mode when no token — labeled demo data only.

## Steps

0. **Load Floor feedback** from `.data/feedback.json` (or `skills/memory/FEEDBACK.md` / `GET /api/feedback`). Apply skip-company, prefer-title, ICP/geo notes, disqualifier patterns. Confirm in one line what memory is active.
1. Confirm geo = NL primary, BE secondary; refuse lists that include other countries. For pilot batches, default **NL only** unless she includes BE.
2. Via HubSpot tools, pull **Dutch tasks in bulk** (or list NL companies). Paginate / chunk (default show **50**).
3. For each company, pull the latest **company note** (agent handoff). Prefer company-level over contact-only notes.
4. Skip / flag **strong social presence** (Floor disqualifier) **and** any company named in active skip feedback.
5. Present a short table: # · company · country · right contact · opener one-liner · why-good · presence · feedback flags · task due (if any).
6. Sort Netherlands first; preferred titles (from feedback) and highest ICP / freshest notes first.
7. Ask Floor: **batch-draft all N** / select rows / next chunk → hand off to `sales-sequence-draft` **batch / approve-queue** mode.
8. If she steers (“skip that one forever”, “prefer Ops managers”) → invoke `sales-feedback-learn` before the next pull.

## Company note contract

When summarizing for Floor or writing into local workspace / CRM English fields:

```text
whyGood: <English, 1–2 sentences>
opener: <English, first-line angle>
rightContact: <Name (Title)>
socialPresence: weak | inconsistent | strong | unknown
vertical: accountancy | legal | it | hr_recruitment | coaching | expertise_b2b | other
geoCode: BE | NL
```

CRM language is **English**. Outreach copy language is editable later.

## ICP reminders

- Decision makers: Partner (law), Founder (IT), Ops manager (larger cos).
- Verticals: accountancy, legal, IT, HR/recruitment/exec search, coaching, any expertise-driven B2B.
- Skip obviously polished / strong LinkedIn presence.
- Lead gen is already done — do not rebuild Sales Nav prospecting unless she asks for the CSV fallback.

## Done when

- Floor sees a NL-first (or Dutch-tasks) list with note fields filled (or explicitly empty), sized for batch review.
- Out-of-scope countries are absent.
- Strong-presence firms are flagged skip.
- Next action offered: **batch draft into approve queue** (`sales-sequence-draft`) — not send.
