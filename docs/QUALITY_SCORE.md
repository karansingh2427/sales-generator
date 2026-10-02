# Quality Score

Qualitative grades per domain × layer (job-search pattern). Scale: `strong` · `adequate` · `thin` · `missing`.

_Last assessed: 2026-10-02 (P0 Sales Nav import + BE/NL geo)._

| Area | Kind | Grade | Gaps |
|---|---|---|---|
| `lead-discovery` | domain | strong | Sales Nav CSV live; HubSpot next; no Sales Nav API |
| `outreach-drafting` | domain | adequate | Template not live LLM; no A/B analytics |
| `demo-scheduling` | domain | adequate | Mock meet links; no Calendly |
| `pipeline-state` | domain | strong | Stages enforced in API |
| `error-surfacing` | domain | adequate | No run audit log yet |
| `deterministic-core` | layer | strong | CSV map/dedupe/geo + eval/import scripts |
| `shared-references` | layer | strong | docs/ + AGENTS.md single-homed; BE/NL in RULES/PRD |
| `skill-layer` | layer | thin | No shipped SKILL.md pack |
| `hooks-guards` | layer | adequate | eval + import check scripts; no CI workflow yet |
| `tests-evals` | layer | adequate | JSON evals + Sales Nav fixture; not playwright |
