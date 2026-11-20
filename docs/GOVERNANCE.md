# AI governance & data handling

## Data classes

| Class | Examples | Storage | Git |
|---|---|---|---|
| Public | Willow marketing copy, ICP rules, NL-first geo defaults, skills | `src/lib/willow-context.ts`, `src/lib/icp.ts`, `src/lib/geo.ts`, `skills/` | Yes |
| Mock PII | Demo / mock HubSpot leads with `.example` emails | `.data/workspace.json` | No (gitignored) |
| Live PII | HubSpot sync + Sales Nav CSV imports | `.data/workspace.json` on BDR machine | Never |
| Floor feedback | ICP/company/tone/geo memory (may name clients) | `.data/feedback.json` (+ optional promote to `skills/memory/FEEDBACK.md`) | Runtime no; promote markdown only if Floor OK |
| Secrets | Optional `HUBSPOT_ACCESS_TOKEN`, `LEMLIST_API_KEY`, `OPENAI_API_KEY` | `.env.local` | Never |

## Consent & automation

- **Automatic mode (Floor’s decision, 20 Nov 2026)** — the morning task adds quality-gate-passed leads to “Willow NL pilot” without per-line approval; uncertain leads get ⚠️ and wait for Floor; stop conditions + the “Stop the automatic outreach” phrase pause everything. Replies still need her OK. Spec: [AUTOMATIC-MODE.md](AUTOMATIC-MODE.md).
- **Stop on reply** — a reply on LinkedIn or email skips every remaining step on both channels.
- HubSpot notes are **background only**; personalize the full sequence from the note — **no re-scrape**.
- Unattended send is allowed **only** within automatic mode’s guardrails (quality gate, ⚠️ hold, LinkedIn limits, stop conditions). Floor reviews “today’s texts” and can stop it anytime.
- **No silent HubSpot write storms** — stage push is explicit; sync is operator-triggered.
- **No silent CSV import** — Sales Nav commit requires human-selected rows.
- Skills prefer **session HubSpot MCP/tools**; do not require embedding a private-app token in the web app.
- **Feedback learning** applies skip/prefer/tone on later runs but never bypasses the quality gate or the ⚠️ hold.
- **Cadence:** weekday 08:00 automatic run; HubSpot tasks newest first up to **2 months** back; **never-contacted** + do-not-contact filters; Lemlist dedup across all campaigns.
- Future auto-sequences require documented opt-in and unsubscribe (EU GDPR; NL + BE book).
- **CRM language:** HubSpot writebacks English-only; outreach drafts may be edited freely.

## Model use

- Default: deterministic templates in `outreach-engine.ts` + `sequence-engine.ts` (auditable).
- Skills: prose drafts following RULES; the quality gate replaces per-line approval in automatic mode; ⚠️ leads need Floor.
- Optional: `OPENAI_API_KEY` + `useLiveModel: true` reserved for v2.

## Threat model (this slice)

- Local JSON workspace readable on disk — single-BDR (Floor) machine only.
- API routes unauthenticated — **do not expose** dev server publicly without auth.
- HubSpot access via Floor’s Claude session or optional private-app token — rotate if leaked; delete `.data/workspace.json` when rotating machines.

## Incident response

1. Revoke keys in `.env.local` (HubSpot private app + Lemlist + OpenAI) and/or disconnect HubSpot from Claude/Cursor if compromised.
2. Delete `.data/workspace.json` and `.data/feedback.json` (clears imported PII + client-named feedback).
3. File issue with eval case ID if behavior regressed.
