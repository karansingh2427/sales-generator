# sales-generator — Agent Map

A **Willow BDR operating system** for Floor Hoefkens: Cursor/Claude **skills** plus a Next.js workbench
that pull HubSpot **company notes** as **preferred background**, personalize the full
**HeyReach (LinkedIn) + Gmail** sequence (optional LinkedIn **research** when notes are thin or Floor
asks — never force every run), **approve every line → send via HeyReach / Gmail**, stop on any reply,
and when a lead wants a demo
**Slack Floor** (with the conversation) so she **manually books Ludwig’s calendar** —
never auto-book Calendar.

**Geography locked:** **Netherlands first**, Belgium second — **NL + BE only**.

**Channels:** **HeyReach (LinkedIn) + Gmail** — LinkedIn connect (day 0) → LinkedIn DM (day 3) → Email 1–3 (Gmail, max 3). Any reply stops the sequence. HeyReach push is a **stub** until Willow's API key exists. No LinkedIn automation outside HeyReach. No Lemlist (Willow does not have it).

**This file is the entry point for coding agents.** Start here, then follow the pointers.

## Start here

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — product domains × architectural layers.
- **[docs/PRD.md](docs/PRD.md)** — Floor requirements (HubSpot hero, HeyReach + Gmail sequences, draft→approve→send).
- **[docs/skills.md](docs/skills.md)** — Floor first-run + skill index.
- **Runtime contracts** — [docs/RULES.md](docs/RULES.md), [docs/TASKS.md](docs/TASKS.md), [docs/GOVERNANCE.md](docs/GOVERNANCE.md).

## Skills (job-search layout)

Plugin skills live under `skills/` (see [`.cursor-plugin/plugin.json`](.cursor-plugin/plugin.json)):

| Skill | Path | Use when |
|---|---|---|
| `sales-hubspot-pull` | [skills/sales-hubspot-pull/SKILL.md](skills/sales-hubspot-pull/SKILL.md) | Dutch HubSpot tasks **last ~30 days**, never-contacted only, NL-first notes; multi-batch/day |
| `sales-sequence-draft` | [skills/sales-sequence-draft/SKILL.md](skills/sales-sequence-draft/SKILL.md) | Batch-draft HeyReach + Gmail sequences (LinkedIn connect → DM → Email 1–3) into approve queue |
| `sales-gmail-send` | [skills/sales-gmail-send/SKILL.md](skills/sales-gmail-send/SKILL.md) | After approve — send email steps via Gmail (Cowork connector) |
| `sales-heyreach-push` | [skills/sales-heyreach-push/SKILL.md](skills/sales-heyreach-push/SKILL.md) | After approve — push LinkedIn steps to HeyReach (**stub** until API key) |
| `sales-reply-demo` | [skills/sales-reply-demo/SKILL.md](skills/sales-reply-demo/SKILL.md) | Dutch-batch Gmail + LinkedIn replies → BOOK NOW / NOT YET / NO / CONFUSED; Slack Floor on BOOK NOW |
| `sales-demo-book` | [skills/sales-demo-book/SKILL.md](skills/sales-demo-book/SKILL.md) | Slack Floor + conversation → she books Ludwig; never auto-create events |
| `sales-feedback-learn` | [skills/sales-feedback-learn/SKILL.md](skills/sales-feedback-learn/SKILL.md) | “Remember: …” — applied on next Dutch batch pull/drafts |
| `sales-lead-run` | [skills/sales-lead-run/SKILL.md](skills/sales-lead-run/SKILL.md) | Orchestrate batch pass (2–3×/day) + HeyReach / Gmail send + reply→demo + demo handoff |

Pattern mirrored from [agent-data/job-search](https://github.com/agent-data/job-search) (`skills/*/SKILL.md` + this map). Prefer **HubSpot + Gmail + Slack (+ HeyReach once connected) tools in Floor’s Claude Cowork session** over embedding tokens in the web app.

**Feedback memory:** `.data/feedback.json` (runtime) + optional promote copy in [`skills/memory/FEEDBACK.md`](skills/memory/FEEDBACK.md). Next HubSpot pull / sequence draft / lead-run **must** load active feedback. Feedback never bypasses approve-before-send (HeyReach or Gmail).

## Quality · governance · interface

- [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md)
- [tests/evals.json](tests/evals.json) — valid / invalid cases (HubSpot + HeyReach/Gmail sequences + NL-first geo).

## Working here

- **HubSpot:** `src/lib/hubspot.ts`, `src/lib/hubspot-config.ts`, `src/app/api/hubspot/route.ts`
- **Sequences:** `src/lib/sequence-engine.ts`, `src/app/api/sequences/route.ts`, `src/components/sequence-builder-panel.tsx`
- **Campaigns UI (Floor's main view):** `src/app/campaign/page.tsx`, `src/components/campaign/` — our own outreach-agent workspace (inspired by, not copied from, vendor demos like Reachium)
- **HeyReach (stub):** `src/lib/heyreach.ts`, `src/app/api/heyreach/route.ts`, `skills/sales-heyreach-push/`
- **Feedback learning:** `src/lib/feedback.ts`, `src/app/api/feedback/route.ts`, `src/components/feedback-panel.tsx`, `skills/sales-feedback-learn/`
- **ICP / geo:** `src/lib/icp.ts`, `src/lib/geo.ts` (NL primary, BE secondary, no other countries)
- **Fallback CSV:** `src/lib/sales-nav-import.ts`
- Before ship: `npm run lint`, `npm run build`, `npm run test:evals`, `npm run test:import`, `npm run test:hubspot`, `npm run test:feedback`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
