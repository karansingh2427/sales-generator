# Quality Score

Qualitative grades per domain × layer (job-search pattern). Scale: `strong` · `adequate` · `thin` · `missing`.

_Last assessed: 2026-10-02 (P1 skill pack + Belgium-first geo lock)._

| Area | Kind | Grade | Gaps |
|---|---|---|---|
| `crm-ingest` | domain | strong | Company notes mock + live; prefer session HubSpot tools |
| `sequence-drafting` | domain | strong | Draft→approve→mark sent; no LinkedIn/email transmit API |
| `lead-discovery` | domain | adequate | CSV fallback BE+NL; no Sales Nav API |
| `outreach-drafting` | domain | adequate | Template not live LLM; no A/B analytics |
| `demo-scheduling` | domain | adequate | Per-AE calendar links (placeholders until Floor pastes real URLs) |
| `pipeline-state` | domain | strong | Stages + Demo Completed/Rescheduled/Cancelled |
| `error-surfacing` | domain | adequate | No run audit log yet |
| `deterministic-core` | layer | strong | HubSpot company notes, ICP BE-first, sequences, CSV geo |
| `shared-references` | layer | strong | docs/ HITL + HubSpot + CRM English + geo lock |
| `skill-layer` | layer | strong | Four SKILL.md files + plugin manifest + AGENTS map |
| `hooks-guards` | layer | adequate | eval + import + hubspot scripts |
| `tests-evals` | layer | adequate | JSON evals; not playwright |
