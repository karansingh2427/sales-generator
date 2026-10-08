---
name: sales-hubspot-pull
description: Pull Dutch HubSpot tasks from the last ~30 days (not only today), filter never-contacted only, and support multiple batches per day. Company notes = preferred background for Gmail sequences — NL primary, BE secondary. LinkedIn research OK when notes thin or Floor asks; never force every run. No LinkedIn send. Prefer HubSpot tools in Floor’s Cowork session.
---

# sales-hubspot-pull

**One-liner:** HubSpot notes = **preferred background**. Pull Dutch tasks from the **last ~30 days**, keep only **never-contacted** contacts/companies, and treat every run as a **fresh batch** (2–3×/day is normal).

Pass notes to `sales-sequence-draft` for Gmail personalization.

## Geography (hard rule)

| Priority | Market | Behavior |
|---|---|---|
| 1 · primary | **Netherlands (NL)** | Prefer / score highest; **default batch = Dutch tasks** |
| 2 · secondary | **Belgium (BE)** | Include only if Floor asks; otherwise skip in pilot batches |
| — | **Everything else** | **Out of scope** — never add to ICP lists, filters, mocks, or digests |

Default filter: `NL + BE`. Sort / present **Netherlands first**. Floor’s phase-1 pilot prompt: **Dutch tasks only** (skip Belgian).

## Lookback (hard rule — not “today only”)

Default lookback = **last ~30 days / last calendar month**.

1. Pull HubSpot **tasks** assigned to Floor (or her usual filter) whose due / created / updated date falls in the **last 30 days** — **not** only due-today.
2. Include open/incomplete tasks in that window first; if the pool is thin, also consider recently completed tasks in the same window that still point at never-contacted NL companies.
3. If Floor says “today’s tasks,” still **default to the 30-day pool** unless she explicitly insists on a narrower filter — today’s list alone is too small for the Dutch pilot.
4. Fall back to NL company search only when tasks aren’t available; keep the same 30-day / never-contacted spirit.

## Never-contacted filter (hard rule)

**Only reach out if never contacted before.** Before a company/contact enters the draft batch:

1. Check HubSpot for **prior outbound email** or **logged outreach** on the contact **or** company (email engagements, logged Gmail/send notes, sequence/outreach activities, prior Sales Generator sends).
2. **Skip** if any prior outbound/logged outreach exists — even a single cold email.
3. Also skip if this contact/company already appears in **today’s earlier approve/sent queues** (same calendar day multi-batch).
4. In the batch table, mark skipped rows as `skip: already contacted` (or `skip: earlier batch today`) so Floor sees why volume dropped.
5. Do **not** treat a HubSpot **task** itself as proof of prior email outreach — tasks are lead-gen work items; only email/outreach engagements count.

## Multi-batch day (hard rule)

This skill is **not** a one-shot.

- Floor may run **2–3 batches per day** (default). Each paste / schedule fire is a **new pull**.
- **Never** treat “we already ran once” (today, yesterday, or ever) as done forever.
- Each run: re-query the 30-day Dutch task pool → apply never-contacted + feedback skips → fill the next chunk (default **50**).
- Prefer companies **not yet shown** in earlier batches today; if the never-contacted pool is exhausted, say so clearly and stop — don’t recycle already-contacted leads.

## Batch pull (phase 1 — primary path)

Floor works in **bulk**: tens to hundreds of Dutch HubSpot tasks/companies per pass.

1. Pull **Dutch tasks from the last ~30 days** that point at NL companies; fall back to NL company search if tasks aren’t available.
2. Apply **never-contacted** + feedback skips **before** counting toward the batch.
3. Cap presentation in chunks Floor can review (e.g. first **50**, then “next 50” / “run another batch”) unless she asks for the full set.
4. Output a numbered table ready for `sales-sequence-draft` **batch mode** → items land in an **approve queue** (not auto-send).

```text
Batch pull contract
- Source: Dutch HubSpot tasks · last ~30 days (not today-only) → NL companies + notes
- Filter: never-contacted only (skip prior outbound email / logged outreach)
- Cadence: multiple batches/day OK (default 2–3); re-runs are normal
- Size: tens–hundreds; present in reviewable chunks (default 50)
- Next: sales-sequence-draft (Gmail max 3 from notes) → approve queue
- Never: LinkedIn API send, Lemlist, other countries, rebuild lead-gen, force LinkedIn scrape on every company every batch, treat “already ran once” as done forever
```

## Prefer live HubSpot via session tools

Floor’s HubSpot is already connected to **her Claude**. In Cursor / Claude:

1. Use the **HubSpot MCP / native HubSpot tools** available in **this user session**.
2. Search **Tasks** (Dutch / NL) with a **~30-day lookback** when Floor says “batch”, “another batch”, or “today’s tasks”; else **Companies** in the Netherlands first, then Belgium if asked.
3. For each candidate, confirm **never contacted** (no prior outbound email / logged outreach on contact or company).
4. Read **company notes** (and company properties if notes are empty) for:
   - **why-good** — why this firm fits Willow
   - **opener** — first-line outreach angle
   - **right contact** — Partner / Founder / Ops manager to reach
5. Do **not** ask her to paste a private-app token into the Sales Generator web app unless the session tools are unavailable and ops explicitly wants the `.env.local` fallback.

Web-app fallback (optional): `POST /api/hubspot { action: "sync" }` with mock mode when no token — labeled demo data only.

## Steps

0. **Load Floor feedback** from `.data/feedback.json` (or `skills/memory/FEEDBACK.md` / `GET /api/feedback`). Apply skip-company, prefer-title, ICP/geo notes, disqualifier patterns. Confirm in one line what memory is active.
1. Confirm geo = NL primary, BE secondary; refuse lists that include other countries. For pilot batches, default **NL only** unless she includes BE.
2. Via HubSpot tools, pull **Dutch tasks in the last ~30 days** in bulk (or list NL companies). Paginate / chunk (default show **50**).
3. For each company/contact, **skip if already contacted** (prior outbound email or logged outreach). Also skip companies already drafted/sent earlier today.
4. For remaining companies, pull the latest **company note** (agent handoff). Prefer company-level over contact-only notes.
5. Skip / flag **strong social presence** (Floor disqualifier) **and** any company named in active skip feedback.
6. Present a short table: # · company · country · right contact · opener one-liner · why-good · presence · contacted? · feedback flags · task due (if any).
7. Sort Netherlands first; preferred titles (from feedback) and highest ICP / freshest notes first.
8. Ask Floor: **batch-draft all N** / select rows / next chunk / **run another batch later** → hand off to `sales-sequence-draft` **batch / approve-queue** mode.
9. If she steers (“skip that one forever”, “prefer Ops managers”) → invoke `sales-feedback-learn` before the next pull.

## Company note contract

When summarizing for Floor or writing into local workspace / CRM English fields:

```text
whyGood: <English, 1–2 sentences>
opener: <English, first-line angle>
rightContact: <Name (Title)>
socialPresence: weak | inconsistent | strong | unknown
vertical: accountancy | legal | it | hr_recruitment | coaching | expertise_b2b | other
geoCode: BE | NL
priorOutreach: none | outbound_email | logged_other
```

CRM language is **English**. Outreach copy language is editable later.

## ICP reminders

- Decision makers: Partner (law), Founder (IT), Ops manager (larger cos).
- Verticals: accountancy, legal, IT, HR/recruitment/exec search, coaching, any expertise-driven B2B.
- Skip obviously polished / strong LinkedIn presence.
- Lead gen is already done — do not rebuild Sales Nav prospecting unless she asks for the CSV fallback.

## Done when

- Floor sees a NL-first (or Dutch-tasks) list from the **~30-day** pool with note fields filled (or explicitly empty), sized for batch review.
- **Already-contacted** contacts/companies are absent from the draft set (shown only as skip reasons if useful).
- Out-of-scope countries are absent.
- Strong-presence firms are flagged skip.
- Agent offers **another batch** / next chunk — does **not** imply the day is finished after one run.
- Next action offered: **batch draft into approve queue** (`sales-sequence-draft`) — not send.
