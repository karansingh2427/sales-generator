# Rules — BDR + AI conduct

These rules govern human and agent operators. Violations are **invalid** scenarios in [tests/evals.json](../tests/evals.json).

## Outreach rules

1. **No outreach to disqualified leads** — firm below ICP or explicit disqualification.
2. **Channel must be** `email` or `linkedin_dm` only.
3. **Every draft includes rationale** — why this firm, why now (see `scoreLeadRationale`).
4. **CTA** — offer 30-minute Willow Create demo; do not promise pricing or legal outcomes.
5. **No fabricated case studies** — use only Willow public claims (200+ law firms, EU/GDPR, coaching).
6. **Human send** — MVP never auto-sends mail; operator marks sent.

## Lead generation rules

1. Default ICP: law firms, 10–100 lawyers, marketing/partner contact.
2. `minScore` floor 70 unless PRD exception documented.
3. Mock data must use `.example` emails unless user supplied real data.

## Booking rules

1. AE must be from configured roster (`DEFAULT_AES`).
2. Duration 15–60 minutes; default 30.
3. Disqualified leads cannot book.
4. Include AE notes when lead had objections or special practice area.

## Agent communication (when driving UI via Cursor)

1. One action at a time; confirm before bulk generate (>5 leads).
2. Present drafts as readable prose before booking.
3. Name failures in plain language (mirror job-search error-surfacing domain).
