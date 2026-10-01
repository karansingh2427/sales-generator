# Sales Generator (Willow BDR)

Prototype automation for **Floor Hoefkens** (BDR @ [Willow](https://willow.co/)): lawyer-focused lead generation, AI-assisted outreach drafts, and AE demo booking — designed to minimize cold calling.

## Quick start

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317). Workspace state persists in `.data/workspace.json` (created on first run, gitignored).

Optional: set `OPENAI_API_KEY` in `.env.local` for future live model enrichment (MVP uses deterministic templates).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port **4317** |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:evals` | Validate governance test-case structure |

## Governance (agent structure)

Mirrors [agent-data/job-search](https://github.com/agent-data/job-search):

- [AGENTS.md](./AGENTS.md) — entry map
- [ARCHITECTURE.md](./ARCHITECTURE.md) — domains × layers
- [docs/PRD.md](./docs/PRD.md) — requirements
- [docs/RULES.md](./docs/RULES.md) · [docs/TASKS.md](./docs/TASKS.md) · [docs/GOVERNANCE.md](./docs/GOVERNANCE.md)
- [tests/evals.json](./tests/evals.json) — valid/invalid cases

## API (local)

- `GET/POST /api/leads` — list / generate / update stage
- `GET/POST /api/outreach` — list / create draft
- `GET/POST /api/bookings` — list / schedule demo

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui
