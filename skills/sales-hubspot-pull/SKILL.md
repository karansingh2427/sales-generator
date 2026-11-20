---
name: sales-hubspot-pull
description: Pull Dutch HubSpot tasks newest first (today, yesterday, … up to 2 months back) until the day’s volume (15→30/day), never-contacted + do-not-contact + Lemlist dedup. Company notes = preferred background for Gmail sequences — NL primary, BE secondary. LinkedIn research OK when notes thin or Floor asks; never force every run. No LinkedIn send. Prefer HubSpot tools in Floor’s Cowork session.
---

# sales-hubspot-pull

**One-liner:** HubSpot notes = **preferred background**. Pull Dutch tasks **newest first, up to 2 months back**, keep only **never-contacted** contacts/companies, and treat every run as a **fresh batch** (2–3×/day is normal).

Pass notes to `sales-sequence-draft` for Gmail personalization.

## Geography (hard rule)

| Priority | Market | Behavior |
|---|---|---|
| 1 · primary | **Netherlands (NL)** | Prefer / score highest; **default batch = Dutch tasks** |
| 2 · secondary | **Belgium (BE)** | Include only if Floor asks; otherwise skip in pilot batches |
| — | **Everything else** | **Out of scope** — never add to ICP lists, filters, mocks, or digests |

Default filter: `NL + BE`. Sort / present **Netherlands first**. Floor’s phase-1 pilot prompt: **Dutch tasks only** (skip Belgian).

## Lookback (hard rule — newest first, up to 2 months)

1. Pull HubSpot **tasks** assigned to Floor (Dutch / NL companies), **newest first**: today’s tasks, then yesterday’s, then the day before — back day by day up to **2 months**.
2. Stop going back as soon as the run’s volume is reached (automatic mode: **15/day the first week, then 30/day**; on request: what Floor asks for).
3. Within a day, open/incomplete tasks first; recently completed tasks only if they still point at a never-contacted NL company.
4. If 2 months back still doesn’t fill the volume, return what there is and say why — never pad with weak or already-contacted leads.
5. Fall back to NL company search only when tasks aren’t available; same never-contacted rules.

## Never-contacted filter (hard rule)

**Only reach out if never contacted before.** Before a company/contact enters the draft batch:

1. Check HubSpot for **prior outbound email** or **logged outreach** on the contact **or** company (email engagements, logged Gmail/send notes, sequence/outreach activities, prior Sales Generator sends).
2. **Skip** if any prior outbound/logged outreach exists — even a single cold email.
2a. **Skip do-not-contact contacts:** HubSpot has no “do not contact” field, so Willow marks them with **Contact again later = “Definitely not”** and/or **Lead Status = “Unqualified”** (plus a note with the reason, e.g. “asked not to be emailed again”). Skip these contacts — and don’t pick another person at the same company without Floor’s OK.
2b. **Also check Lemlist** (connector): if the contact’s email or LinkedIn URL is a lead in **any** Lemlist campaign (Floor’s workspace has years of old campaigns), treat them as already contacted and skip.
3. Also skip if this contact/company was already handled in an earlier run (sent to Lemlist, ⚠️ held, or skipped).
4. In the batch table, mark skipped rows as `skip: already contacted` (or `skip: earlier batch today`) so Floor sees why volume dropped.
5. Do **not** treat a HubSpot **task** itself as proof of prior email outreach — tasks are lead-gen work items; only email/outreach engagements count.

## Multi-batch day (hard rule)

This skill is **not** a one-shot.

- In automatic mode it runs every weekday at 08:00 (via `sales-lead-run`); Floor can also ask for an extra run anytime.
- Each run is a **new pull**: re-query newest-first → apply never-contacted + do-not-contact + Lemlist dedup + feedback skips → fill the day’s volume.
- Skip anyone already handled in an earlier run (sent, ⚠️ held, or skipped). If the 2-month pool is exhausted, say so clearly and stop — don’t recycle leads.

## Batch pull (primary path)

1. Pull Dutch tasks newest first (see Lookback) that point at NL companies.
2. Apply **never-contacted** + do-not-contact + Lemlist dedup + feedback skips **before** counting toward the volume.
3. Hand the list to `sales-sequence-draft`, which writes the texts and runs the **quality gate** (automatic mode — no approve queue; ⚠️ leads wait for Floor).

```text
Batch pull contract
- Source: Dutch HubSpot tasks · newest first · up to 2 months back → NL companies + notes
- Filter: never-contacted + do-not-contact (Definitely not / Unqualified) + not in any Lemlist campaign
- Volume: 15/day first week, then 30/day (automatic mode)
- Next: sales-sequence-draft (write + quality gate) → sales-lemlist-push
- Never: LinkedIn send outside Lemlist, other countries, rebuild lead-gen, force LinkedIn scrape on every company every run, recycle already-contacted leads
```


Floor’s HubSpot is already connected to **her Claude**. In Cursor / Claude:

1. Use the **HubSpot MCP / native HubSpot tools** available in **this user session**.
2. Search **Tasks** (Dutch / NL) **newest first, up to 2 months back** when running the daily outreach or when Floor asks for a batch; else **Companies** in the Netherlands first, then Belgium if asked.
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
2. Via HubSpot tools, pull **Dutch tasks newest first, up to 2 months back** until the run’s volume is reached (or list NL companies).
3. For each company/contact, **skip if already contacted** (prior outbound email or logged outreach), flagged do-not-contact, in any Lemlist campaign, or handled in an earlier run.
4. For remaining companies, pull the latest **company note** (agent handoff). Prefer company-level over contact-only notes.
5. Skip / flag **strong social presence** (Floor disqualifier) **and** any company named in active skip feedback.
6. Present a short table: # · company · country · right contact · opener one-liner · why-good · presence · contacted? · feedback flags · task due (if any).
7. Sort Netherlands first; preferred titles (from feedback) and highest ICP / freshest notes first.
8. Hand off to `sales-sequence-draft` (write + quality gate). In automatic mode don’t ask Floor first; on a manual request, show the list if she asked to see it.
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

- A NL-first list from the **newest-first, ≤2-month** pool with note fields filled (or explicitly empty), sized to the run’s volume.
- **Already-contacted** contacts/companies are absent from the draft set (shown only as skip reasons if useful).
- Out-of-scope countries are absent.
- Strong-presence firms are flagged skip.
- Handed to `sales-sequence-draft` for writing + the quality gate.
