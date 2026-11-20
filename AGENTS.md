# sales-generator — Agent Map

A **Willow BDR operating system** for Floor Hoefkens: Cursor/Claude **skills** plus a Next.js workbench
that pull HubSpot **company notes** as **preferred background**, personalize the full
**LinkedIn + email** sequence (optional LinkedIn **research** when notes are thin or Floor
asks — never force every run), **write → quality-check → Lemlist sends LinkedIn + email automatically** (⚠️ leads wait for Floor), stop on any reply,
and when a lead wants a demo
**Slack Floor** (with the conversation) so she **manually books Ludwig’s calendar** —
never auto-book Calendar.

**Geography locked:** **Netherlands first**, Belgium second — **NL + BE only**.

**Channels:** **Lemlist (LinkedIn + email)** — Willow took a Lemlist subscription (Nov 2026; replaces the earlier HeyReach plan). Profile visit → like latest post → invite → **one** personal email (all day 0) → LinkedIn message as soon as they accept → LinkedIn follow-up 2 days later. Max 1 email; follow-ups on LinkedIn. Any reply stops the sequence. Lemlist is reached through **Floor’s Lemlist Claude connector** (works; the REST API returns 402 on her plan, so the web-app push stays a stub). No LinkedIn automation outside Lemlist.

**Automatic mode (default since 20 Nov 2026 — Floor’s decision):** a weekday 08:00 Cowork task finds leads (Dutch HubSpot tasks, newest first, up to 2 months back; 15/day first week, then 30/day), writes them, runs a **quality gate**, adds passing leads to the live Lemlist campaign “Willow NL pilot” (max 20/day with LinkedIn steps) and Slacks Floor a report. Leads the agent is unsure about get **⚠️** and wait for Floor. Replies still need her OK; she still books Ludwig. Stop phrase: “Stop the automatic outreach”. **Spec: [docs/AUTOMATIC-MODE.md](docs/AUTOMATIC-MODE.md).**

**This file is the entry point for coding agents.** Start here, then follow the pointers.

## Start here

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — product domains × architectural layers.
- **[docs/PRD.md](docs/PRD.md)** — Floor requirements (HubSpot hero, Lemlist LinkedIn + email sequences, automatic mode).
- **[docs/skills.md](docs/skills.md)** — Floor first-run + skill index.
- **Runtime contracts** — [docs/RULES.md](docs/RULES.md), [docs/TASKS.md](docs/TASKS.md), [docs/GOVERNANCE.md](docs/GOVERNANCE.md).

## Skills (job-search layout)

Plugin skills live under `skills/` (see [`.cursor-plugin/plugin.json`](.cursor-plugin/plugin.json)):

| Skill | Path | Use when |
|---|---|---|
| `sales-hubspot-pull` | [skills/sales-hubspot-pull/SKILL.md](skills/sales-hubspot-pull/SKILL.md) | Dutch HubSpot tasks **newest first, up to 2 months back**, never-contacted + do-not-contact skips; 15→30 leads/day |
| `sales-sequence-draft` | [skills/sales-sequence-draft/SKILL.md](skills/sales-sequence-draft/SKILL.md) | Batch-draft multichannel sequences (visit + like + invite → 1 email → 2 LinkedIn messages) + quality gate (⚠️ = wait for Floor) |
| `sales-gmail-send` | [skills/sales-gmail-send/SKILL.md](skills/sales-gmail-send/SKILL.md) | Gmail fallback only if Lemlist’s email sender is down — not used in automatic mode |
| `sales-lemlist-push` | [skills/sales-lemlist-push/SKILL.md](skills/sales-lemlist-push/SKILL.md) | Add quality-checked leads + their 5 texts to “Willow NL pilot” via the Lemlist connector (web-app API = stub) |
| `sales-reply-demo` | [skills/sales-reply-demo/SKILL.md](skills/sales-reply-demo/SKILL.md) | Dutch-batch Gmail + LinkedIn replies → BOOK NOW / NOT YET / NO / CONFUSED; **Slack ping Floor on every reply** (hourly check, Mon–Fri) |
| `sales-daily-update` | [skills/sales-daily-update/SKILL.md](skills/sales-daily-update/SKILL.md) | Mon–Fri 08:50 Europe/Amsterdam — short Slack update: sent, replies + reply rate, demos, awaiting approval, what to adjust |
| `sales-demo-book` | [skills/sales-demo-book/SKILL.md](skills/sales-demo-book/SKILL.md) | Slack Floor + conversation → she books Ludwig; never auto-create events |
| `sales-feedback-learn` | [skills/sales-feedback-learn/SKILL.md](skills/sales-feedback-learn/SKILL.md) | “Remember: …” — applied on next Dutch batch pull/drafts |
| `sales-lead-run` | [skills/sales-lead-run/SKILL.md](skills/sales-lead-run/SKILL.md) | Orchestrate batch pass (2–3×/day) + Lemlist send (Gmail fallback) + reply→demo + demo handoff |

Pattern mirrored from [agent-data/job-search](https://github.com/agent-data/job-search) (`skills/*/SKILL.md` + this map). Prefer **HubSpot + Gmail + Slack (+ Lemlist via its Claude connector once accepted) tools in Floor’s Claude Cowork session** over embedding tokens in the web app.

**Feedback memory:** `.data/feedback.json` (runtime) + optional promote copy in [`skills/memory/FEEDBACK.md`](skills/memory/FEEDBACK.md). Next HubSpot pull / sequence draft / lead-run **must** load active feedback. Feedback never bypasses the quality gate or the ⚠️ hold.

## Quality · governance · interface

- [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md)
- [tests/evals.json](tests/evals.json) — valid / invalid cases (HubSpot + Lemlist sequences + NL-first geo).

## Working here

- **HubSpot:** `src/lib/hubspot.ts`, `src/lib/hubspot-config.ts`, `src/app/api/hubspot/route.ts`
- **Sequences:** `src/lib/sequence-engine.ts`, `src/app/api/sequences/route.ts`, `src/components/sequence-builder-panel.tsx`
- **Campaigns UI (Floor's main view):** `src/app/campaign/page.tsx`, `src/components/campaign/` — our own outreach-agent workspace (inspired by, not copied from, vendor demos like Reachium)
- **Automatic mode spec:** `docs/AUTOMATIC-MODE.md`
- **Lemlist (web-app stub):** `src/lib/lemlist.ts`, `src/app/api/lemlist/route.ts`, `skills/sales-lemlist-push/`
- **Daily update:** `src/lib/daily-update.ts`, `src/app/api/daily-update/route.ts`, `skills/sales-daily-update/`
- **Feedback learning:** `src/lib/feedback.ts`, `src/app/api/feedback/route.ts`, `src/components/feedback-panel.tsx`, `skills/sales-feedback-learn/`
- **ICP / geo:** `src/lib/icp.ts`, `src/lib/geo.ts` (NL primary, BE secondary, no other countries)
- **Fallback CSV:** `src/lib/sales-nav-import.ts`
- Before ship: `npm run lint`, `npm run build`, `npm run test:evals`, `npm run test:import`, `npm run test:hubspot`, `npm run test:feedback`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
