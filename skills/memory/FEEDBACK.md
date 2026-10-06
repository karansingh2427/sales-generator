# Floor learned feedback

_Active seeds below · runtime entries also live in `.data/feedback.json` (gitignored)._

Load and apply these on every HubSpot pull / sequence draft / lead-run.
Governance: feedback never bypasses draft → approve → mark sent.

## How to promote from the UI

1. Open Sales Generator → **Feedback** tab (or `GET /api/feedback?format=markdown`).
2. Copy active entries into this file for Claude/Cursor sessions that cannot hit the local API.
3. Or ask: “Remember this feedback: …” → `sales-feedback-learn` appends here when the API is unavailable.

## Example entry shape

```markdown
## fb_example
- category: `company` · target: company/Acme Legal
- source: skill · 2026-10-02T12:00:00.000Z
- instruction: `{"kind":"skip_company","companyName":"Acme Legal"}`
- text: Skip company Acme Legal forever
```

## fb_story_arc_playbook
- category: `messaging_tone` · target: —
- source: skill · 2026-10-06T00:00:00.000Z
- instruction: `{"kind":"tone","note":"senior_story_arc"}`
- text: Emails should look like a 20–30 year sales pro. One story only — HubSpot insight → one tension → soft Willow on the same thread → short CTA. Never vacancy opener then random content calendar. Match Floor’s past HubSpot sent emails for tone/length. Emails 2–3 continue the same story.

## fb_consistency_phrasing
- category: `messaging_tone` · target: —
- source: skill · 2026-10-06T00:00:00.000Z
- instruction: `{"kind":"consistency_phrasing"}`
- text: Consistency angle = “I see you haven’t been posting consistently” — never “I saw your post yesterday/Friday”. One recent post does NOT invalidate inconsistent-posting. Skip / don’t follow up if they post frequently (strong presence = bad lead). Do NOT live-check LinkedIn vs notes every run — trust HubSpot notes. (Supersedes any earlier “skip not-posting when company posted recently” guidance.)

## ~~fb_soften_not_posting_recent~~ (retracted)
- active: **false** · retracted 2026-10-06
- text: ~~Skip or soften not-posting angles when company posted recently~~ — Floor corrected: one post ≠ consistent; keep consistency angle with correct phrasing.

_Runtime entries also live in `.data/feedback.json` (gitignored)._
