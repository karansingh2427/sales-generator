# Rules — BDR + AI conduct

These rules govern human and agent operators. Violations are **invalid** scenarios in [tests/evals.json](../tests/evals.json).

## Outreach & sequence rules

1. **No outreach to disqualified leads** — including **strong social presence** (Floor disqualifier).
2. **Channels** — `email`, `linkedin_dm`, or `linkedin_connect` only.
3. **Every draft includes rationale** — CRM why-good / opener / opportunity angles (`scoreLeadRationale` / sequence engine).
4. **CTA** — offer 30-minute Willow demo booked on the **AE’s calendar link** (per-AE, not a shared Calendly); do not promise pricing or legal outcomes.
5. **No fabricated case studies** — use only Willow public claims (expertise firms, EU/GDPR, coaching).
6. **Human send (mandatory this slice)** — draft → Floor **approves** → **mark sent**. MVP never auto-sends LinkedIn or email. Auto-blast is invalid until explicit Willow policy + Floor OK.
7. **Sequence mark_sent** without prior **approve_step** is invalid for message steps.
8. Outreach drafts are **editable** (any language Floor prefers); CRM writebacks stay English.

## HubSpot rules

1. **Hero path:** HubSpot sync of contacts + **company-level** agent notes (why / opener / right contact). Sales Nav CSV is fallback. Do not treat agent handoff as contact-only.
2. **Prefer session HubSpot MCP/tools** (Floor’s Claude/Cursor). Web-app `HUBSPOT_ACCESS_TOKEN` is optional fallback only — do not require embedding a private-app token for skills to work.
3. Without `HUBSPOT_ACCESS_TOKEN`, the web connector must run in **mock mode** (no silent failure pretending to be live).
4. Stage mapping uses configurable labels (`HUBSPOT_STAGE_MAP`); unknown labels → `new`.
5. After **Demo Booked** → **Demo Completed** | **Demo Rescheduled** | **Demo Cancelled** (Floor confirmed).
6. Property map for agent fields is configurable (`HUBSPOT_PROPERTY_MAP`); defaults `sg_why_good`, `sg_opener`, `sg_right_contact` on **Company** preferred.
7. Strong social presence → stage `disqualified` / skip outreach — do not sequence.
8. HubSpot PII stays in `.data/workspace.json` only — never commit to git. Token only in `.env.local` if used.
9. **CRM language = English** for anything written into HubSpot (stage labels, notes, outcomes).

## Lead generation & Sales Nav import rules

1. **Fallback path:** LinkedIn Sales Navigator CSV → preview → human select → commit.
2. **Default ICP geography:** **Belgium (BE) primary**, **Netherlands (NL) secondary**. Default filter = `BE + NL`. **No other countries** in ICP, filters, mocks, or skills.
3. ICP: decision makers (Partner / Founder / Ops manager); verticals accountancy, legal, IT, HR/recruitment/exec search, coaching, expertise B2B.
4. `minScore` floor 70 unless PRD exception documented.
5. **Deduplicate** on email and/or LinkedIn URL (and HubSpot contact id on sync).
6. **No silent import blast** — `import_commit` only accepts explicitly selected rows.
7. Demo / sample data must be labeled (`source: demo_sample`) and BE/NL only.

## Booking rules

1. AE must be from configured roster (`DEFAULT_AES` with per-AE `calendarUrl`).
2. Duration 15–60 minutes; default 30.
3. Disqualified leads cannot book.
4. Meeting link = **that AE’s calendar URL** (Floor’s manual booking pattern).

## Skill pack rules

1. Skills live under `skills/*/SKILL.md` and are mapped from [AGENTS.md](../AGENTS.md).
2. `sales-hubspot-pull` must instruct BE-first pulls and company notes.
3. `sales-sequence-draft` must require approve before send.
4. `sales-demo-book` must use per-AE links and the three post-demo outcomes.
5. Orchestrator `sales-lead-run` may compose the three — it must not bypass HITL or geo lock.

## Agent communication (when driving UI or skills via Cursor)

1. One action at a time; confirm before bulk HubSpot sync interpretation or demo generate (>5 leads).
2. Present sequence drafts as readable prose before approve/mark sent.
3. Name failures in plain language.
4. Prefer **Belgium-first** language in ICP explanations; mention Netherlands as secondary; never propose other countries.
