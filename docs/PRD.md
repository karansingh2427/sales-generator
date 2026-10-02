# PRD — Willow Sales Generator

**Owner:** Karandeep Singh (prototype for Floor Hoefkens, BDR @ [Willow](https://willow.co/))  
**Stakeholder:** Floor Hoefkens — LinkedIn: [floor-hoefkens](https://www.linkedin.com/in/floor-hoefkens/)

## Problem

BDR time is spent on cold calls and manual research. Willow sells best to **professional-services firms (especially law)** with a consultative demo. Floor needs automated lead surfacing, on-brand outreach, and reliable AE handoff.

## Goals

1. Reduce cold-call volume by front-loading email/LinkedIn sequences with AI drafts.
2. Focus ICP on **Belgian & Dutch law firms / professional services** (Benelux first; nearby EU secondary) — most Willow clients are in **Belgium and the Netherlands**.
3. Book **30-minute Willow Create demos** for AEs with context notes.
4. Ship governance artifacts matching Karandeep's agent-data/job-search structure.
5. **P0 live leads:** import from LinkedIn Sales Navigator CSV / Lead List export (not mock-first).

## Geography (locked)

| Priority | Markets | Behavior |
|---|---|---|
| Core (default filter) | **Belgium (BE), Netherlands (NL)** | Import UI defaults here; highest ICP geo bonus |
| Benelux | + Luxembourg (LU) | Optional expand |
| Nearby EU | DE, FR, UK, IE, CH | Lower score; opt-in via geo filter |
| Other | Rest of world | Filtered out unless Floor selects OTHER |

Do **not** assume US-first ICP copy or filters.

## Non-goals (this turn)

- **HubSpot** sync (queued P0 next — not in this PR).
- Live Sales Nav API (restricted; CSV/import-first).
- Auto-dialer or call recording.
- Multi-tenant auth.
- Silent auto-blast of outreach — human-in-the-loop remains mandatory.

## User stories

| ID | Story | Acceptance |
|---|---|---|
| RF-01 | As Floor, I import a Sales Nav Lead List CSV | Preview + column map; selected rows persist to workspace |
| RF-01b | As Floor, I filter imports to BE+NL by default | Geo chips default BE+NL; non-matching rows filtered unless expanded |
| RF-01c | As Floor, I demo without a CSV | Labeled **Demo / sample data** adds BE/NL-biased mock leads |
| RF-02 | As Floor, I draft email/InMail without cold calling | Draft + rationale; stage → outreach_drafted |
| RF-03 | As Floor, I mark outreach sent | Stage → contacted |
| RF-04 | As Floor, I book an AE demo | Valid AE + datetime; meet link; stage → demo_booked |
| RF-05 | As Karandeep, I audit AI governance | PRD, RULES, TASKS, evals in repo |
| RF-06 | As Floor, duplicates are not re-imported | Same email or LinkedIn URL skipped with count |

## Success metrics (pilot)

- ≥70% of touched leads move via async channels before any call.
- ≥3 booked demos/week from pipeline (once live calendar exists).
- Zero PII committed to git (workspace local only).
- Import path used for real BE/NL lists; demo samples only for walkthroughs.

## Notion guide implications

From [Claude Opus 5.5 for sales](https://kakiyo.notion.site/claude-opus-55-for-sales) and [Claude Opus 5.5](https://kakiyo.notion.site/claude-opus-55):

- **Research before write:** rationale string on every draft (and ICP rationale on import).
- **One clear CTA:** 30-minute live demo on the call.
- **Voice:** professional, concise, no hype — matches Willow's regulated-audience positioning.
- **Human review:** import requires row selection; drafts are reviewable; nothing auto-sends.
