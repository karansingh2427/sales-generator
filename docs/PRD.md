# PRD — Willow Sales Generator (MVP)

**Owner:** Karandeep Singh (prototype for Floor Hoefkens, BDR @ [Willow](https://willow.co/))  
**Stakeholder:** Floor Hoefkens — LinkedIn: [floor-hoefkens](https://www.linkedin.com/in/floor-hoefkens/)

## Problem

BDR time is spent on cold calls and manual research. Willow sells best to **professional-services firms (especially law)** with a consultative demo. Floor needs automated lead surfacing, on-brand outreach, and reliable AE handoff.

## Goals

1. Reduce cold-call volume by front-loading email/LinkedIn sequences with AI drafts.
2. Focus ICP on **law firms** (10–100 lawyers, Benelux/UK/EU).
3. Book **30-minute Willow Create demos** for AEs with context notes.
4. Ship governance artifacts matching Karandeep's agent-data/job-search structure.

## Non-goals (MVP)

- Live Apollo/LinkedIn/HubSpot integration (mock only).
- Auto-dialer or call recording.
- Multi-tenant auth.
- Full Claude Opus 5.5 agent plugin (Notion guides inform copy, not runtime).

## User stories

| ID | Story | Acceptance |
|---|---|---|
| RF-01 | As Floor, I generate lawyer leads by practice area | 1–10 leads appear with ICP score ≥ filter |
| RF-02 | As Floor, I draft email/InMail without cold calling | Draft + rationale; stage → outreach_drafted |
| RF-03 | As Floor, I mark outreach sent | Stage → contacted |
| RF-04 | As Floor, I book an AE demo | Valid AE + datetime; meet link; stage → demo_booked |
| RF-05 | As Karandeep, I audit AI governance | PRD, RULES, TASKS, evals in repo |

## Success metrics (pilot)

- ≥70% of touched leads move via async channels before any call.
- ≥3 booked demos/week from pipeline (once live integrations exist).
- Zero PII committed to git (workspace local only).

## Notion guide implications

From [Claude Opus 5.5 for sales](https://kakiyo.notion.site/claude-opus-55-for-sales) and [Claude Opus 5.5](https://kakiyo.notion.site/claude-opus-55):

- **Research before write:** rationale string on every draft.
- **One clear CTA:** 30-minute live demo on the call.
- **Voice:** professional, concise, no hype — matches Willow's regulated-audience positioning.
- **Human review:** drafts are editable; nothing auto-sends in MVP.
