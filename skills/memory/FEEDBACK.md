# Floor learned feedback

_Active: 0 · Seed file — runtime entries live in `.data/feedback.json` (gitignored)._

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

_Runtime entries also live in `.data/feedback.json` (gitignored)._
