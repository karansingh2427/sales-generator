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

_No active committed feedback by default — Floor’s live memory stays local._
