# AI governance & data handling

## Data classes

| Class | Examples | Storage | Git |
|---|---|---|---|
| Public | Willow marketing copy, ICP rules, NL-first geo defaults, skills | `src/lib/willow-context.ts`, `src/lib/icp.ts`, `src/lib/geo.ts`, `skills/` | Yes |
| Mock PII | Demo / mock HubSpot leads with `.example` emails | `.data/workspace.json` | No (gitignored) |
| Live PII | HubSpot sync + Sales Nav CSV imports | `.data/workspace.json` on BDR machine | Never |
| Floor feedback | ICP/company/tone/geo memory (may name clients) | `.data/feedback.json` (+ optional promote to `skills/memory/FEEDBACK.md`) | Runtime no; promote markdown only if Floor OK |
| Secrets | Optional `HUBSPOT_ACCESS_TOKEN`, `OPENAI_API_KEY` | `.env.local` | Never |

## Consent & automation

- **No auto-send** — Floor must **approve** each sequence step, then **mark sent** after sending outside the app/skill.
- Floor asked for full automation; product default remains human-in-the-loop until Willow policy + explicit OK.
- **No silent HubSpot write storms** — stage push is explicit; sync is operator-triggered.
- **No silent CSV import** — Sales Nav commit requires human-selected rows.
- Skills prefer **session HubSpot MCP/tools**; do not require embedding a private-app token in the web app.
- **Feedback learning** applies skip/prefer/tone on later runs but **never** auto-sends and never bypasses approve-before-send.
- Future auto-sequences require documented opt-in and unsubscribe (EU GDPR; NL + BE book).
- **CRM language:** HubSpot writebacks English-only; outreach drafts may be edited freely.

## Model use

- Default: deterministic templates in `outreach-engine.ts` + `sequence-engine.ts` (auditable).
- Skills: prose drafts following RULES; human approve still required.
- Optional: `OPENAI_API_KEY` + `useLiveModel: true` reserved for v2.

## Threat model (this slice)

- Local JSON workspace readable on disk — single-BDR (Floor) machine only.
- API routes unauthenticated — **do not expose** dev server publicly without auth.
- HubSpot access via Floor’s Claude session or optional private-app token — rotate if leaked; delete `.data/workspace.json` when rotating machines.

## Incident response

1. Revoke keys in `.env.local` (HubSpot private app + OpenAI) and/or disconnect HubSpot from Claude/Cursor if compromised.
2. Delete `.data/workspace.json` and `.data/feedback.json` (clears imported PII + client-named feedback).
3. File issue with eval case ID if behavior regressed.
