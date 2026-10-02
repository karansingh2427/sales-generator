# PRD — Willow Sales Generator

**Owner:** Karandeep Singh (prototype for Floor Hoefkens, BDR @ [Willow](https://willow.co/))  
**Stakeholder:** Floor Hoefkens — LinkedIn: [floor-hoefkens](https://www.linkedin.com/in/floor-hoefkens/)

## Problem

Lead gen is already handled by an internal agent that writes **HubSpot company notes**. Floor’s remaining pain is **0% LinkedIn outreach** — she cold-calls everyone. She needs CRM-aware **LinkedIn + email sequence drafts** that replace cold-call discovery and book demos on **per-AE calendar links**, with human approve before send — reachable from both the web UI and Cursor/Claude **skills**.

## Goals

1. **HubSpot ingest** of contacts/companies + **company-level** agent notes (why-good, opener, right contact) — hero path over Sales Nav CSV. Prefer **HubSpot MCP/tools in Floor’s session**; web-app token is optional fallback.
2. **Multi-channel sequences:** LinkedIn connect/message → wait days → LinkedIn follow-up → email; editable drafts; approve → mark sent (no auto-blast).
3. Encode opportunity angles: consistency, content quality/mix, visibility, open vacancies — plus CRM opener/rationale.
4. ICP: decision makers (Partner / Founder / Ops manager); verticals accountancy, legal, IT, HR/recruitment/exec search, coaching, expertise B2B; **skip strong social presence**; geo **Belgium first**, Netherlands second, **BE + NL only**.
5. Keep Sales Nav CSV as **fallback** import.
6. Post–Demo Booked stages: **Demo Completed | Rescheduled | Cancelled**.
7. CRM writebacks stay **English**; outreach drafts remain editable.
8. Ship a **skill pack** (`skills/*/SKILL.md`) mirroring [agent-data/job-search](https://github.com/agent-data/job-search) + AGENTS.md map.
9. **Feedback learning** — Floor submits ICP / company / tone / geo / sequence feedback (UI + “remember this feedback”); next HubSpot pull / sequence draft / lead-run loads and applies active memory. Human-visible list with disable/delete. Feedback never bypasses approve-before-send.

## Geography (product rule — Karandeep, 2026-10-02)

| Priority | Markets | Behavior |
|---|---|---|
| Primary (default) | **Belgium (BE)** | Highest ICP geo bonus; listed first |
| Secondary | **Netherlands (NL)** | Included in default filter; scored below BE |
| Out of scope | All other countries | Filtered out; never in ICP, mocks, or skills |

Supersedes earlier NL-first pilot experiment defaults in the codebase.

## Non-goals (this turn)

- Silent auto-send / LinkedIn API blast (policy conflict — she wants full auto; we ship draft→approve first).
- Live Sales Nav API.
- Auto-dialer or call recording / NL→EN call transcription (her existing path).
- Multi-tenant auth.
- Shared Calendly round-robin (booking = **per-AE calendar links**).
- Embedding HubSpot private-app tokens as the primary skill path.

## User stories

| ID | Story | Acceptance |
|---|---|---|
| RF-HS-01 | As Floor, I sync HubSpot in mock mode without a token | Mock contacts + **company** agent notes appear; mode badge = mock |
| RF-HS-02 | As Floor, with session HubSpot tools (or optional token) I pull live company notes | BE-first list; company notes preferred |
| RF-HS-03 | As Floor, stage labels map via configurable `HUBSPOT_STAGE_MAP` | Includes Demo Booked → Completed / Rescheduled / Cancelled |
| RF-HS-04 | As Floor, HubSpot writebacks stay English | Stage push uses English labels |
| RF-SEQ-01 | As Floor, I generate a multi-step sequence for a lead | LI connect, message, wait, follow-up, email drafts |
| RF-SEQ-02 | As Floor, I edit / approve / mark sent per step | Cannot mark sent until approved; nothing auto-transmits |
| RF-SEQ-03 | As Floor, strong social presence leads are skipped/DQ | Sync flags; sequence generate rejects DQ |
| RF-SK-01 | As Floor, I run `sales-hubspot-pull` / `sales-sequence-draft` / `sales-demo-book` from Cursor | Skills present under `skills/`; AGENTS.md maps them |
| RF-FB-01 | As Floor, I submit feedback via UI form or “remember this feedback” | Entry persisted with category, target, text, timestamp, source |
| RF-FB-02 | As Floor, next HubSpot pull / sequence draft applies active feedback | Skip company / prefer title / never pitch / tone reflected |
| RF-FB-03 | As Floor, I see learned feedback and can disable/delete | Feedback tab list; disable keeps history |
| RF-FB-04 | As Floor, feedback never auto-sends | Approve-before-send still required |
| RF-01 | As Floor, I still import Sales Nav CSV (fallback) | Preview defaults to **BE + NL**; human select-before-commit |
| RF-04 | As Floor, I book an AE demo | Valid AE + datetime; **per-AE calendar link**; stage → demo_booked |
| RF-05 | As Floor, I set post-demo outcome | Completed / Rescheduled / Cancelled from bookings UI / skill |
| RF-06 | As Karandeep, I audit AI governance | PRD, RULES, TASKS, evals, skills updated |

## Success metrics (pilot)

- ≥80% of touches via LinkedIn/email **before** calls (baseline ~0% LinkedIn).
- Sequences reuse **company** CRM agent notes rather than re-prospecting.
- Lists stay **BE-first / BE+NL only**.
- Booking lands on **per-AE calendar links**.
- Zero silent sends; every step approved by Floor.
- Zero PII committed to git.
- Skills usable in Floor’s HubSpot-connected Claude/Cursor session.

## Still needs from Floor / ops

- Confirm Claude↔HubSpot connection scopes (notes + stages).
- Pipeline name + stages **before** Demo Booked.
- Real AE calendar link copies (placeholders in roster today).
- Property names if structured company props differ from defaults.
- Explicit OK to flip from draft-approve to auto-send (Willow policy).
- LinkedIn/email outreach language(s) (CRM is EN; calls are NL).
