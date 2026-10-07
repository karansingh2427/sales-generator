# sales-generator — Agent Map

A **Willow BDR operating system** for Floor Hoefkens: Cursor/Claude **skills** plus a Next.js workbench
that pull HubSpot **company notes** as **preferred background**, personalize the full Gmail
sequence (optional LinkedIn **research** when notes are thin or Floor asks — never force every run;
LinkedIn **send/API** forbidden), **approve → send via Gmail**, and when a lead wants a demo
**Slack Floor** (with the conversation) so she **manually books Ludwig’s calendar** —
never auto-book Calendar.

**Geography locked:** **Netherlands first**, Belgium second — **NL + BE only**.

**Dutch pilot channel:** **Gmail email sequences only**. No LinkedIn API send. No Lemlist (Willow does not have it).

**This file is the entry point for coding agents.** Start here, then follow the pointers.

## Start here

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — product domains × architectural layers.
- **[docs/PRD.md](docs/PRD.md)** — Floor requirements (HubSpot hero, Gmail sequences, draft→approve→send).
- **[docs/skills.md](docs/skills.md)** — Floor first-run + skill index.
- **Runtime contracts** — [docs/RULES.md](docs/RULES.md), [docs/TASKS.md](docs/TASKS.md), [docs/GOVERNANCE.md](docs/GOVERNANCE.md).

## Skills (job-search layout)

Plugin skills live under `skills/` (see [`.cursor-plugin/plugin.json`](.cursor-plugin/plugin.json)):

| Skill | Path | Use when |
|---|---|---|
| `sales-hubspot-pull` | [skills/sales-hubspot-pull/SKILL.md](skills/sales-hubspot-pull/SKILL.md) | Bulk Dutch HubSpot tasks / NL-first companies + notes |
| `sales-sequence-draft` | [skills/sales-sequence-draft/SKILL.md](skills/sales-sequence-draft/SKILL.md) | Batch-draft Gmail sequences into approve queue |
| `sales-gmail-send` | [skills/sales-gmail-send/SKILL.md](skills/sales-gmail-send/SKILL.md) | After approve — send via Gmail (Cowork connector) |
| `sales-reply-demo` | [skills/sales-reply-demo/SKILL.md](skills/sales-reply-demo/SKILL.md) | Dutch-batch Gmail replies → BOOK NOW / NOT YET / NO / CONFUSED; Slack Floor on BOOK NOW |
| `sales-demo-book` | [skills/sales-demo-book/SKILL.md](skills/sales-demo-book/SKILL.md) | Slack Floor + conversation → she books Ludwig; never auto-create events |
| `sales-feedback-learn` | [skills/sales-feedback-learn/SKILL.md](skills/sales-feedback-learn/SKILL.md) | “Remember: …” — applied on next Dutch batch pull/drafts |
| `sales-lead-run` | [skills/sales-lead-run/SKILL.md](skills/sales-lead-run/SKILL.md) | Orchestrate batch pass + Gmail send + reply→demo + demo handoff |

Pattern mirrored from [agent-data/job-search](https://github.com/agent-data/job-search) (`skills/*/SKILL.md` + this map). Prefer **HubSpot + Gmail + Slack tools in Floor’s Claude Cowork session** over embedding tokens in the web app.

**Feedback memory:** `.data/feedback.json` (runtime) + optional promote copy in [`skills/memory/FEEDBACK.md`](skills/memory/FEEDBACK.md). Next HubSpot pull / sequence draft / lead-run **must** load active feedback. Feedback never bypasses approve-before-Gmail-send.

## Quality · governance · interface

- [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md)
- [tests/evals.json](tests/evals.json) — valid / invalid cases (HubSpot + Gmail sequences + NL-first geo).

## Working here

- **HubSpot:** `src/lib/hubspot.ts`, `src/lib/hubspot-config.ts`, `src/app/api/hubspot/route.ts`
- **Sequences:** `src/lib/sequence-engine.ts`, `src/app/api/sequences/route.ts`, `src/components/sequence-builder-panel.tsx`
- **Feedback learning:** `src/lib/feedback.ts`, `src/app/api/feedback/route.ts`, `src/components/feedback-panel.tsx`, `skills/sales-feedback-learn/`
- **ICP / geo:** `src/lib/icp.ts`, `src/lib/geo.ts` (NL primary, BE secondary, no other countries)
- **Fallback CSV:** `src/lib/sales-nav-import.ts`
- Before ship: `npm run lint`, `npm run build`, `npm run test:evals`, `npm run test:import`, `npm run test:hubspot`, `npm run test:feedback`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
