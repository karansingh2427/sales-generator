# AI governance & data handling

## Data classes

| Class | Examples | Storage | Git |
|---|---|---|---|
| Public | Willow marketing copy, ICP rules, BE/NL geo defaults | `src/lib/willow-context.ts`, `src/lib/icp.ts`, `src/lib/geo.ts` | Yes |
| Mock PII | Demo / mock HubSpot leads with `.example` emails | `.data/workspace.json` | No (gitignored) |
| Live PII | HubSpot sync + Sales Nav CSV imports | `.data/workspace.json` on BDR machine | Never |
| Secrets | `HUBSPOT_ACCESS_TOKEN`, `OPENAI_API_KEY` | `.env.local` | Never |

## Consent & automation

- **No auto-send** — Floor must **approve** each sequence step, then **mark sent** after sending outside the app.
- Floor asked for full automation; product default remains human-in-the-loop until Willow policy + explicit OK.
- **No silent HubSpot write storms** — stage push is explicit `push_stage`; sync is operator-triggered.
- **No silent CSV import** — Sales Nav commit requires human-selected rows.
- Future auto-sequences require documented opt-in and unsubscribe (EU GDPR; BE/NL book).

## Model use

- Default: deterministic templates in `outreach-engine.ts` + `sequence-engine.ts` (auditable).
- Optional: `OPENAI_API_KEY` + `useLiveModel: true` reserved for v2.

## Threat model (this slice)

- Local JSON workspace readable on disk — single-BDR (Floor) machine only.
- API routes unauthenticated — **do not expose** dev server publicly without auth.
- HubSpot token grants CRM access — rotate if leaked; delete `.data/workspace.json` when rotating machines.

## Incident response

1. Revoke keys in `.env.local` (HubSpot private app + OpenAI).
2. Delete `.data/workspace.json` (clears imported PII).
3. File issue with eval case ID if behavior regressed.
