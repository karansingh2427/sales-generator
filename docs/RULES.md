# Rules — BDR + AI conduct

These rules govern human and agent operators. Violations are **invalid** scenarios in [tests/evals.json](../tests/evals.json).

## Outreach & sequence rules

1. **No outreach to disqualified leads** — including **strong social presence** (Floor disqualifier).
2. **Channels** — `email`, `linkedin_dm`, or `linkedin_connect` only.
3. **Every draft includes rationale** — CRM why-good / opener / opportunity angles (`scoreLeadRationale` / sequence engine).
4. **CTA** — offer 30-minute Willow Create demo; do not promise pricing or legal outcomes.
5. **No fabricated case studies** — use only Willow public claims (expertise firms, EU/GDPR, coaching).
6. **Human send (mandatory this slice)** — draft → Floor **approves** → **mark sent**. MVP never auto-sends LinkedIn or email. Auto-blast is invalid until explicit Willow policy + Floor OK.
7. **Sequence mark_sent** without prior **approve_step** is invalid for message steps.

## HubSpot rules

1. **Hero path:** HubSpot sync of contacts + agent notes (why / opener / right contact). Sales Nav CSV is fallback.
2. Without `HUBSPOT_ACCESS_TOKEN`, connector must run in **mock mode** (no silent failure pretending to be live).
3. Stage mapping uses configurable labels (`HUBSPOT_STAGE_MAP`); unknown labels → `new`.
4. Property map for agent fields is configurable (`HUBSPOT_PROPERTY_MAP`); defaults `sg_why_good`, `sg_opener`, `sg_right_contact`.
5. Strong social presence → stage `disqualified` / skip outreach — do not sequence.
6. HubSpot PII stays in `.data/workspace.json` only — never commit to git. Token only in `.env.local`.

## Lead generation & Sales Nav import rules

1. **Fallback path:** LinkedIn Sales Navigator CSV → preview → human select → commit.
2. **Default ICP geography:** **Belgium & the Netherlands (BE + NL)**.
3. ICP: decision makers (Partner / Founder / Ops manager); verticals accountancy, legal, IT, HR/recruitment/exec search, coaching, expertise B2B.
4. `minScore` floor 70 unless PRD exception documented.
5. **Deduplicate** on email and/or LinkedIn URL (and HubSpot contact id on sync).
6. **No silent import blast** — `import_commit` only accepts explicitly selected rows.
7. Demo / sample data must be labeled (`source: demo_sample`).

## Booking rules

1. AE must be from configured roster (`DEFAULT_AES`).
2. Duration 15–60 minutes; default 30.
3. Disqualified leads cannot book.

## Agent communication (when driving UI via Cursor)

1. One action at a time; confirm before bulk HubSpot sync interpretation or demo generate (>5 leads).
2. Present sequence drafts as readable prose before approve/mark sent.
3. Name failures in plain language.
4. Prefer BE/NL language in ICP explanations.
