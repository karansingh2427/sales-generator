# AI governance & data handling

## Data classes

| Class | Examples | Storage | Git |
|---|---|---|---|
| Public | Willow marketing copy, ICP rules | `src/lib/willow-context.ts` | Yes |
| Mock PII | Seed leads with `.example` emails | `.data/workspace.json` | No (gitignored) |
| Live PII | Real prospects (future) | Encrypted store + DPA | Never |
| Secrets | `OPENAI_API_KEY`, Apollo | `.env.local` | Never |

## Consent & automation

- **No auto-send** in MVP — operator explicitly marks sent.
- Future sequences require documented opt-in and unsubscribe (EU GDPR alignment with Willow product story).

## Model use

- Default: deterministic templates in `outreach-engine.ts` (auditable, no token spend).
- Optional: `OPENAI_API_KEY` + `useLiveModel: true` reserved for v2; must log prompt hash externally.

## Threat model (MVP)

- Local JSON workspace readable on disk — acceptable for single-BDR dev machine only.
- API routes unauthenticated — **do not expose** dev server to public internet without auth layer.

## Incident response

1. Revoke keys in `.env.local`.
2. Delete `.data/workspace.json`.
3. File issue with eval case ID if behavior regressed.
