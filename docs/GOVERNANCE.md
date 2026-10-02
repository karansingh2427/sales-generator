# AI governance & data handling

## Data classes

| Class | Examples | Storage | Git |
|---|---|---|---|
| Public | Willow marketing copy, ICP rules, BE/NL geo defaults | `src/lib/willow-context.ts`, `src/lib/geo.ts` | Yes |
| Mock PII | Demo sample leads with `.example` emails | `.data/workspace.json` | No (gitignored) |
| Live PII | Sales Nav CSV imports (real prospects) | `.data/workspace.json` on BDR machine | Never |
| Secrets | `OPENAI_API_KEY`, HubSpot (future) | `.env.local` | Never |

## Consent & automation

- **No auto-send** — operator explicitly marks sent after reviewing drafts.
- **No silent import** — Sales Nav commit requires human-selected rows after preview + geo filter.
- Future sequences require documented opt-in and unsubscribe (EU GDPR alignment with Willow product story; BE/NL book).

## Model use

- Default: deterministic templates in `outreach-engine.ts` (auditable, no token spend).
- Optional: `OPENAI_API_KEY` + `useLiveModel: true` reserved for v2; must log prompt hash externally.

## Threat model (MVP)

- Local JSON workspace readable on disk — acceptable for single-BDR (Floor) machine only.
- API routes unauthenticated — **do not expose** dev server to public internet without auth layer.
- Sales Nav CSVs may contain personal data — delete `.data/workspace.json` when rotating machines.

## Incident response

1. Revoke keys in `.env.local`.
2. Delete `.data/workspace.json` (clears imported PII).
3. File issue with eval case ID if behavior regressed.
