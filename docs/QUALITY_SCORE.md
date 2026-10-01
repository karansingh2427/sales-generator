# Quality Score

Qualitative grades per domain × layer (job-search pattern). Scale: `strong` · `adequate` · `thin` · `missing`.

_Last assessed: 2026-10-01 (MVP ship)._

| Area | Kind | Grade | Gaps |
|---|---|---|---|
| `lead-discovery` | domain | adequate | Mock generator only; no Apollo cursor |
| `outreach-drafting` | domain | adequate | Template not live LLM; no A/B analytics |
| `demo-scheduling` | domain | adequate | Mock meet links; no Calendly |
| `pipeline-state` | domain | strong | Stages enforced in API |
| `error-surfacing` | domain | adequate | No run audit log yet |
| `deterministic-core` | layer | strong | Validation unit-tested via eval script |
| `shared-references` | layer | strong | docs/ + AGENTS.md single-homed |
| `skill-layer` | layer | thin | No shipped SKILL.md pack |
| `hooks-guards` | layer | adequate | eval check script; no CI workflow yet |
| `tests-evals` | layer | adequate | JSON evals; not playwright |
