# Quality Score

Qualitative grades per domain × layer (job-search pattern). Scale: `strong` · `adequate` · `thin` · `missing`.

_Last assessed: 2026-10-02 (P0 HubSpot sync + multi-channel sequences)._

| Area | Kind | Grade | Gaps |
|---|---|---|---|
| `crm-ingest` | domain | strong | Mock + live HubSpot; real property map pending Floor |
| `sequence-drafting` | domain | strong | Draft→approve→mark sent; no LinkedIn/email transmit API |
| `lead-discovery` | domain | adequate | CSV fallback; no Sales Nav API |
| `outreach-drafting` | domain | adequate | Template not live LLM; no A/B analytics |
| `demo-scheduling` | domain | adequate | Mock meet links; no Calendly |
| `pipeline-state` | domain | strong | Stages enforced in API + Hubspot map |
| `error-surfacing` | domain | adequate | No run audit log yet |
| `deterministic-core` | layer | strong | HubSpot mock, ICP, sequences, CSV geo |
| `shared-references` | layer | strong | docs/ HITL + HubSpot rules |
| `skill-layer` | layer | thin | No shipped SKILL.md pack |
| `hooks-guards` | layer | adequate | eval + import + hubspot scripts |
| `tests-evals` | layer | adequate | JSON evals; not playwright |
