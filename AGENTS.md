# sales-generator — Agent Map

A **Willow BDR operating system** for Floor Hoefkens: Cursor/Claude **skills** plus a Next.js workbench
that pull HubSpot **company notes** (why-good, opener, right contact), draft multi-channel LinkedIn +
email sequences with human approve, and book demos on **per-AE calendar links**.

**Geography locked:** **Belgium first**, Netherlands second — **BE + NL only**.

**This file is the entry point for coding agents.** Start here, then follow the pointers.

## Start here

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — product domains × architectural layers.
- **[docs/PRD.md](docs/PRD.md)** — Floor requirements (HubSpot hero, sequences, draft→approve).
- **[docs/skills.md](docs/skills.md)** — Floor first-run + skill index.
- **Runtime contracts** — [docs/RULES.md](docs/RULES.md), [docs/TASKS.md](docs/TASKS.md), [docs/GOVERNANCE.md](docs/GOVERNANCE.md).

## Skills (job-search layout)

Plugin skills live under `skills/` (see [`.cursor-plugin/plugin.json`](.cursor-plugin/plugin.json)):

| Skill | Path | Use when |
|---|---|---|
| `sales-hubspot-pull` | [skills/sales-hubspot-pull/SKILL.md](skills/sales-hubspot-pull/SKILL.md) | Pull BE-first companies + company notes via HubSpot MCP/session tools |
| `sales-sequence-draft` | [skills/sales-sequence-draft/SKILL.md](skills/sales-sequence-draft/SKILL.md) | LI + email drafts; approve before send |
| `sales-demo-book` | [skills/sales-demo-book/SKILL.md](skills/sales-demo-book/SKILL.md) | Per-AE calendar links; Demo Booked → Completed \| Rescheduled \| Cancelled |
| `sales-lead-run` | [skills/sales-lead-run/SKILL.md](skills/sales-lead-run/SKILL.md) | Orchestrate one full BDR pass |

Pattern mirrored from [agent-data/job-search](https://github.com/agent-data/job-search) (`skills/*/SKILL.md` + this map). Prefer **HubSpot tools in Floor’s Claude/Cursor session** over embedding a private-app token in the web app.

## Quality · governance · interface

- [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md)
- [tests/evals.json](tests/evals.json) — valid / invalid cases (HubSpot + sequences + BE-first geo).

## Working here

- **HubSpot:** `src/lib/hubspot.ts`, `src/lib/hubspot-config.ts`, `src/app/api/hubspot/route.ts`
- **Sequences:** `src/lib/sequence-engine.ts`, `src/app/api/sequences/route.ts`, `src/components/sequence-builder-panel.tsx`
- **ICP / geo:** `src/lib/icp.ts`, `src/lib/geo.ts` (BE primary, NL secondary, no other countries)
- **Fallback CSV:** `src/lib/sales-nav-import.ts`
- Before ship: `npm run lint`, `npm run build`, `npm run test:evals`, `npm run test:import`, `npm run test:hubspot`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
