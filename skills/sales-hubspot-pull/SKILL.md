---
name: sales-hubspot-pull
description: Pull Netherlands-first HubSpot companies (NL + BE only) and read company-level agent notes — why-good, opener, right contact. Prefer HubSpot MCP/tools already connected in Floor’s Claude or Cursor session; do not embed a private-app token in the web app. Use when Floor asks to sync CRM, pull leads, read company notes, or prepare a NL/BE prospect list.
---

# sales-hubspot-pull

Pull the next NL+BE companies from HubSpot and surface the **company notes** the internal lead-gen agent already wrote. Sales Generator does **not** rebuild prospecting — it reads why-good / opener / right contact and hands them to sequence drafting.

## Geography (hard rule)

| Priority | Market | Behavior |
|---|---|---|
| 1 · primary | **Netherlands (NL)** | Prefer / score highest |
| 2 · secondary | **Belgium (BE)** | Include after NL |
| — | **Everything else** | **Out of scope** — never add to ICP lists, filters, mocks, or digests |

Default filter: `NL + BE`. Sort / present **Netherlands first**.

## Prefer live HubSpot via session tools

Floor’s HubSpot is already connected to **her Claude**. In Cursor / Claude:

1. Use the **HubSpot MCP / native HubSpot tools** available in **this user session**.
2. Search **Companies** in the Netherlands first, then Belgium.
3. Read **company notes** (and company properties if notes are empty) for:
   - **why-good** — why this firm fits Willow
   - **opener** — first-line outreach angle
   - **right contact** — Partner / Founder / Ops manager to reach
4. Do **not** ask her to paste a private-app token into the Sales Generator web app unless the session tools are unavailable and ops explicitly wants the `.env.local` fallback.

Web-app fallback (optional): `POST /api/hubspot { action: "sync" }` with mock mode when no token — labeled demo data only.

## Steps

0. **Load Floor feedback** from `.data/feedback.json` (or `skills/memory/FEEDBACK.md` / `GET /api/feedback`). Apply skip-company, prefer-title, ICP/geo notes, disqualifier patterns. Confirm in one line what memory is active.
1. Confirm geo = NL primary, BE secondary; refuse lists that include other countries.
2. Via HubSpot tools, list companies filtered to the Netherlands and Belgium.
3. For each company, pull the latest **company note** (agent handoff). Prefer company-level over contact-only notes.
4. Skip / flag **strong social presence** (Floor disqualifier) **and** any company named in active skip feedback.
5. Present a short table: company · country · right contact · opener one-liner · why-good · presence · feedback flags.
6. Sort Netherlands first, then Belgium; preferred titles (from feedback) and highest ICP / freshest notes first.
7. Ask Floor which rows to sequence next → hand off to `sales-sequence-draft`.
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

- Floor sees a NL-first company list with note fields filled (or explicitly empty).
- Out-of-scope countries are absent.
- Strong-presence firms are flagged skip.
- Next action offered: draft sequences (`sales-sequence-draft`) or book later (`sales-demo-book`).
