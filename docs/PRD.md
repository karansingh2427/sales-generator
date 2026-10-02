# PRD — Willow Sales Generator

**Owner:** Karandeep Singh (prototype for Floor Hoefkens, BDR @ [Willow](https://willow.co/))  
**Stakeholder:** Floor Hoefkens — LinkedIn: [floor-hoefkens](https://www.linkedin.com/in/floor-hoefkens/)

## Problem

Lead gen is already handled by an internal agent that writes CRM notes. Floor’s remaining pain is **0% LinkedIn outreach** — she cold-calls everyone. She needs CRM-aware **LinkedIn + email sequence drafts** that replace cold-call discovery and book demos, with human approve before send.

## Goals

1. **HubSpot ingest/sync** of contacts/companies + agent notes (why-good, opener, right contact) — hero path over Sales Nav CSV.
2. **Multi-channel sequences:** LinkedIn connect/message → wait days → LinkedIn follow-up → email; editable drafts; approve → mark sent (no auto-blast).
3. Encode opportunity angles: consistency, content quality/mix, visibility, open vacancies unused online — plus CRM opener/rationale.
4. ICP: decision makers (Partner / Founder / Ops manager); verticals accountancy, legal, IT, HR/recruitment/exec search, coaching, expertise B2B; **skip strong social presence**; geo default **BE+NL**.
5. Keep Sales Nav CSV as **fallback** import.
6. Ship governance artifacts matching Karandeep's agent-data/job-search structure.

## Geography (locked until Floor confirms otherwise)

| Priority | Markets | Behavior |
|---|---|---|
| Core (default) | **Belgium (BE), Netherlands (NL)** | Highest ICP geo bonus |
| Nearby EU | LU, DE, FR, UK, IE, CH | Lower score; opt-in |
| Other | Rest of world | Filtered / low score |

## Non-goals (this turn)

- Silent auto-send / LinkedIn API blast (policy conflict — she wants full auto; we ship draft→approve first).
- Live Sales Nav API.
- Auto-dialer or call recording.
- Multi-tenant auth.
- Calendly round-robin (P1).

## User stories

| ID | Story | Acceptance |
|---|---|---|
| RF-HS-01 | As Floor, I sync HubSpot in mock mode without a token | Mock contacts + agent notes appear; mode badge = mock |
| RF-HS-02 | As Floor, with `HUBSPOT_ACCESS_TOKEN` I sync live contacts/notes | Live mode; upsert by HubSpot id / email |
| RF-HS-03 | As Floor, stage labels map via configurable `HUBSPOT_STAGE_MAP` | Defaults documented; env override works |
| RF-SEQ-01 | As Floor, I generate a multi-step sequence for a lead | LI connect, message, wait, follow-up, email drafts |
| RF-SEQ-02 | As Floor, I edit / approve / mark sent per step | Cannot mark sent until approved; nothing auto-transmits |
| RF-SEQ-03 | As Floor, strong social presence leads are skipped/DQ | Sync flags; sequence generate rejects DQ |
| RF-01 | As Floor, I still import Sales Nav CSV (fallback) | Preview + human select-before-commit |
| RF-04 | As Floor, I book an AE demo | Valid AE + datetime; stage → demo_booked |
| RF-05 | As Karandeep, I audit AI governance | PRD, RULES, TASKS, evals updated |

## Success metrics (pilot)

- ≥80% of touches via LinkedIn/email **before** calls (baseline ~0% LinkedIn).
- Sequences reuse CRM agent notes rather than re-prospecting.
- Zero silent sends; every step approved by Floor.
- Zero PII committed to git.

## Still needs from Floor / ops

- Confirm CRM = HubSpot + private app token owner.
- Pipeline name + stage labels for `HUBSPOT_STAGE_MAP`.
- Property names for why/opener/right contact (defaults: `sg_why_good`, `sg_opener`, `sg_right_contact`).
- Explicit OK to flip from draft-approve to auto-send (Willow policy).
