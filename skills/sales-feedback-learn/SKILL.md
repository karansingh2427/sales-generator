---
name: sales-feedback-learn
description: Persist Floor’s feedback on ICP, companies, tone, disqualifiers, geo, or sequence quality so later HubSpot pulls and sequence drafts apply it. Use when Floor says remember this feedback, teach the agent, skip this company, prefer this title, never pitch X, or lists learned feedback to disable/delete.
---

# sales-feedback-learn

Capture Floor’s steering in structured memory (job-search-style preference learning). Later `sales-hubspot-pull`, `sales-sequence-draft`, and `sales-lead-run` **must** load active feedback before acting.

## Invoke phrases

- “Remember this feedback: …”
- “Teach the agent: skip company X”
- “Prefer Partner titles going forward”
- “Never pitch pricing / never pitch Z”
- “Show my learned feedback” / “Disable that feedback”

## Persist (required)

Write one entry with:

| Field | Values |
|---|---|
| `category` | `icp` \| `company` \| `contact` \| `messaging_tone` \| `disqualifier` \| `geo` \| `sequence_quality` \| `title_preference` \| `other` |
| `target` | optional company / contact / lead / title / geo |
| `text` | Floor’s free text (always keep) |
| `instruction` | structured when clear (`skip_company`, `prefer_title`, `never_pitch`, `tone`, `icp_tweak`, …) |
| `source` | `skill` |
| `active` | `true` |
| `createdAt` | ISO timestamp |

### Storage

1. **Primary (web app):** `POST /api/feedback { action: "remember", category, text, source: "skill", companyName? }` → `.data/feedback.json` (gitignored).
2. **Skill session without UI:** append to [`skills/memory/FEEDBACK.md`](../memory/FEEDBACK.md) (same shape as API markdown export). Prefer API when the Next.js app is running.

Confirm in **one line**: what was saved + that the next pull/draft will apply it.

## Applying feedback (for sibling skills)

When **any** of these run, load active feedback first:

1. `sales-hubspot-pull` — skip listed companies; prefer preferred titles; apply ICP/geo notes; flag disqualifier patterns.
2. `sales-sequence-draft` — inject tone / never-pitch / sequence notes into drafts; still **approve before send**.
3. `sales-lead-run` — preflight step: load memory → show digest of active rules → then pull/draft/book.

## List / disable / delete

- List: `GET /api/feedback` or read `skills/memory/FEEDBACK.md`.
- Disable: `POST /api/feedback { action: "disable", id }` (keeps history).
- Delete: `POST /api/feedback { action: "delete", id }`.
- UI: Feedback tab + per-lead **Teach agent** (graduation-cap) action.

## Governance (hard)

- Feedback **never** auto-sends LinkedIn or email.
- Feedback does **not** bypass draft → approve → mark sent.
- Geo hard rule still wins: **Netherlands first**, Belgium second, **NL+BE only** — feedback cannot add other countries.
- CRM writebacks stay English.

## Examples

```text
User: Remember this feedback: skip company Acme Legal forever
→ category=company, instruction=skip_company(Acme Legal), save, confirm.

User: Prefer Ops manager titles for larger firms
→ category=title_preference, instruction=prefer_title([Ops manager]), save.

User: Never pitch pricing on LinkedIn
→ category=messaging_tone, instruction=never_pitch(pricing), save.
```
