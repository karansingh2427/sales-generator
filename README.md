# Sales Generator (Willow BDR)

Prototype automation for **Floor Hoefkens** (BDR @ [Willow](https://willow.co/)): **LinkedIn Sales Navigator CSV import** for Belgian & Dutch law-firm leads, AI-assisted outreach drafts, and AE demo booking — designed to minimize cold calling.

**Geography:** most Willow clients are in **Belgium and the Netherlands**. Import geo filter defaults to **BE + NL**.

## Quick start

```bash
npm install
npm run dev
# or for a stable local demo:
npm run build && npm start
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317). Workspace state persists in `.data/workspace.json` (created on first run, gitignored).

Optional: set `OPENAI_API_KEY` in `.env.local` for future live model enrichment (MVP uses deterministic templates).

## How Floor exports from Sales Nav & imports

1. In **LinkedIn Sales Navigator**, build or open a Lead List aimed at **Belgian / Dutch** law firms or professional-services contacts (title + geography filters in Sales Nav itself).
2. Export the list as **CSV** (Lead List export — columns typically include First Name, Last Name, Title, Company, LinkedIn URL, Location, etc.).
3. Open Sales Generator → **Leads** → **Import LinkedIn Sales Navigator**.
4. Drag/drop or pick the CSV. Confirm column mapping (auto-detected aliases).
5. Keep the default geo chips **BE** + **NL** (expand only if you intentionally want nearby EU).
6. Review ICP scores, duplicates, and filtered rows → **Select suggested** or tick rows manually → **Import selected**.
7. Draft email/InMail per lead and **mark sent** yourself — nothing auto-blasts.

**Demo without a CSV:** use the dashed **Demo / sample data** controls to add labeled BE/NL-biased sample leads for walkthroughs.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port **4317** |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:evals` | Validate governance + import eval cases |
| `npm run test:import` | Unit checks for CSV map / geo / dedupe |

## Governance (agent structure)

Mirrors [agent-data/job-search](https://github.com/agent-data/job-search):

- [AGENTS.md](./AGENTS.md) — entry map
- [ARCHITECTURE.md](./ARCHITECTURE.md) — domains × layers
- [docs/PRD.md](./docs/PRD.md) — requirements (BE/NL ICP, Sales Nav P0)
- [docs/RULES.md](./docs/RULES.md) · [docs/TASKS.md](./docs/TASKS.md) · [docs/GOVERNANCE.md](./docs/GOVERNANCE.md)
- [tests/evals.json](./tests/evals.json) — valid/invalid cases

## API (local)

- `GET/POST /api/leads` — list / `import_preview` / `import_commit` / demo `generate` / update stage
- `GET/POST /api/outreach` — list / create draft
- `GET/POST /api/bookings` — list / schedule demo

## Still mock / out of scope this turn

- Outreach templates (deterministic) — not live LLM unless key set later
- AE booking meet links — mock URLs
- **HubSpot** — next P0, not this PR
- Sales Nav **API** — CSV only

## Stack

Next.js 16 · TypeScript · Tailwind · shadcn/ui
