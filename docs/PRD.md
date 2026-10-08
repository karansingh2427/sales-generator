# PRD — Willow Sales Generator

**Owner:** Karandeep Singh (prototype for Floor Hoefkens, BDR @ [Willow](https://willow.co/))  
**Stakeholder:** Floor Hoefkens — LinkedIn: [floor-hoefkens](https://www.linkedin.com/in/floor-hoefkens/)

## Problem

Lead gen is already handled by an internal agent that writes **HubSpot company notes**. Floor cold-calls today; the Dutch pilot replaces that with **Gmail cold email sequences**. **HubSpot notes = background**; the agent **personalizes the full email sequence from that note only** (no LinkedIn/website re-scrape). Approve → send via Gmail → on interest **Slack her** (with the conversation) so she **manually books Ludwig** — never auto-book.

## Goals

1. **HubSpot ingest** of Dutch tasks from the **last ~30 days** (not today-only) + **company-level** agent notes (why-good, opener, right contact) as **background** — hero path over Sales Nav CSV. **Never-contacted only** (skip prior outbound email / logged outreach). Default **2–3 batches/day** — re-runs are normal. Prefer **HubSpot + Gmail + Slack in Floor’s Cowork session**; web-app token is optional fallback.
2. **Gmail cold sequences (Dutch pilot):** personalize Email 1–3 from the note only; ~1 week between if no reply; **max 3 emails**; approve → Gmail send. No LinkedIn API. No Lemlist.
3. Encode opportunity angles from the note: consistency, content quality/mix, visibility, open vacancies — plus CRM opener/rationale.
4. ICP: decision makers (Partner / Founder / Ops manager); verticals accountancy, legal, IT, HR/recruitment/exec search, coaching, expertise B2B; **skip strong social presence**; geo **Netherlands first**, Belgium second, **NL + BE only**.
5. Keep Sales Nav CSV as **fallback** import.
6. Post–Demo Booked stages: **Demo Completed | Rescheduled | Cancelled**.
7. CRM writebacks stay **English**; outreach drafts remain editable.
8. Ship a **skill pack** (`skills/*/SKILL.md`) mirroring [agent-data/job-search](https://github.com/agent-data/job-search) + AGENTS.md map.
9. **Feedback learning** — Floor submits ICP / company / tone / geo / sequence feedback (UI + “remember this feedback”); next HubSpot pull / sequence draft / lead-run loads and applies active memory. Human-visible list with disable/delete. Feedback never bypasses approve-before-send.

## Geography (product rule — Karandeep, 2026-10-06)

| Priority | Markets | Behavior |
|---|---|---|
| Primary (default) | **Netherlands (NL)** | Highest ICP geo bonus; listed first |
| Secondary | **Belgium (BE)** | Included in default filter; scored below NL |
| Out of scope | All other countries | Filtered out; never in ICP, mocks, or skills |

Supersedes earlier Belgium-first defaults (Karandeep preference 2026-10-06).

## Non-goals (this turn)

- LinkedIn API send / LinkedIn connection automation.
- Lemlist (Willow does not have it).
- Re-scraping LinkedIn or company websites (notes are the only source).
- Unattended send without approve (pilot keeps approve-before-send).
- Live Sales Nav API.
- Auto-dialer or call recording / NL→EN call transcription (her existing path).
- Multi-tenant auth.
- Auto-booking Calendar / Calendly / HubSpot meetings (Floor books **Ludwig** manually after Slack).
- Embedding HubSpot private-app tokens as the primary skill path.

## User stories

| ID | Story | Acceptance |
|---|---|---|
| RF-HS-01 | As Floor, I sync HubSpot in mock mode without a token | Mock contacts + **company** agent notes appear; mode badge = mock |
| RF-HS-02 | As Floor, with session HubSpot tools (or optional token) I pull live company notes | NL-first list; company notes preferred |
| RF-HS-03 | As Floor, stage labels map via configurable `HUBSPOT_STAGE_MAP` | Includes Demo Booked → Completed / Rescheduled / Cancelled |
| RF-HS-04 | As Floor, HubSpot writebacks stay English | Stage push uses English labels |
| RF-SEQ-01 | As Floor, I get a Gmail cold sequence from a HubSpot note | Max 3 emails; Email 1 from note opener; ~1 week waits; no re-scrape |
| RF-SEQ-02 | As Floor, I approve then Claude sends via Gmail | Cannot send until approved; Gmail via Cowork |
| RF-SEQ-03 | As Floor, strong social presence leads are skipped/DQ | Sync flags; sequence generate rejects DQ |
| RF-SK-01 | As Floor, I run `sales-hubspot-pull` / `sales-sequence-draft` / `sales-demo-book` from Cursor | Skills present under `skills/`; AGENTS.md maps them |
| RF-FB-01 | As Floor, I submit feedback via UI form or “remember this feedback” | Entry persisted with category, target, text, timestamp, source |
| RF-FB-02 | As Floor, next HubSpot pull / sequence draft applies active feedback | Skip company / prefer title / never pitch / tone reflected |
| RF-FB-03 | As Floor, I see learned feedback and can disable/delete | Feedback tab list; disable keeps history |
| RF-FB-04 | As Floor, feedback never auto-sends | Approve-before-send still required |
| RF-01 | As Floor, I still import Sales Nav CSV (fallback) | Preview defaults to **NL + BE**; human select-before-commit |
| RF-04 | As Floor, I get a Slack demo handoff then book Ludwig | Slack includes conversation; Floor books Ludwig manually; stage → demo_booked after confirm |
| RF-04b | As Floor, agents never auto-book Calendar | No Calendar create-event; template instructs manual Ludwig book |
| RF-05 | As Floor, I set post-demo outcome | Completed / Rescheduled / Cancelled from bookings UI / skill |
| RF-06 | As Karandeep, I audit AI governance | PRD, RULES, TASKS, evals, skills updated |

## Success metrics (pilot)

- Dutch cold outreach via **Gmail** (max 3) before calls.
- Sequences **personalize from company notes only** (no re-scrape).
- Lists stay **NL-first / NL+BE only**.
- Demo handoff = Slack Floor (with conversation) → she books Ludwig; never auto-book.
- Pilot: every step approved before Gmail send.
- Zero PII committed to git.
- Skills usable in Floor’s HubSpot + Gmail + Slack Cowork session.

## Still needs from Floor / ops

- Confirm Claude↔HubSpot + Gmail + Slack connection scopes.
- Pipeline name + stages **before** Demo Booked.
- Property names if structured company props differ from defaults.
- Explicit OK to drop approve-before-send later (Willow policy).
- Email outreach language(s) (CRM is EN; calls are NL).
