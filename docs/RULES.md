# Rules — BDR + AI conduct

These rules govern human and agent operators. Violations are **invalid** scenarios in [tests/evals.json](../tests/evals.json).

## Outreach rules

1. **No outreach to disqualified leads** — firm below ICP or explicit disqualification.
2. **Channel must be** `email` or `linkedin_dm` only.
3. **Every draft includes rationale** — why this firm, why now (see `scoreLeadRationale`).
4. **CTA** — offer 30-minute Willow Create demo; do not promise pricing or legal outcomes.
5. **No fabricated case studies** — use only Willow public claims (200+ law firms, EU/GDPR, coaching).
6. **Human send** — MVP never auto-sends mail; operator marks sent.

## Lead generation & Sales Nav import rules

1. **Primary path:** LinkedIn Sales Navigator CSV / Lead List export → preview → human select → commit.
2. **Default ICP geography:** **Belgium & the Netherlands (BE + NL)**. Most Willow clients are there. Nearby EU (LU/DE/FR/UK/IE/CH) is secondary; US-first targeting is invalid.
3. Default firm ICP: law / professional services, marketing/partner contact, firm-size band near 10–100 where known.
4. `minScore` floor 70 unless PRD exception documented.
5. **Deduplicate** on normalized email and/or LinkedIn URL against workspace leads before commit.
6. **No silent import blast** — `import_commit` only accepts explicitly selected rows after preview.
7. Demo / sample data must be labeled (`source: demo_sample`) and use `.example` emails unless user supplied real data.
8. Live CSV PII stays in `.data/workspace.json` only — never commit to git.

## Booking rules

1. AE must be from configured roster (`DEFAULT_AES`).
2. Duration 15–60 minutes; default 30.
3. Disqualified leads cannot book.
4. Include AE notes when lead had objections or special practice area.

## Agent communication (when driving UI via Cursor)

1. One action at a time; confirm before bulk import or demo generate (>5 leads).
2. Present drafts as readable prose before booking.
3. Name failures in plain language (mirror job-search error-surfacing domain).
4. Prefer BE/NL language in ICP explanations (“Belgian & Dutch law firms”), not US metro defaults.
