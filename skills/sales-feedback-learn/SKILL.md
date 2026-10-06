---
name: sales-feedback-learn
description: Persist Floor’s feedback on ICP, companies, tone, disqualifiers, geo, or sequence quality so the next Dutch batch HubSpot pull and approve-queue drafts apply it. Use when Floor says remember this feedback, teach the agent, skip companies that already post a lot / post frequently, prefer this title, never pitch X, or lists learned feedback to disable/delete.
---

# sales-feedback-learn

Capture Floor’s steering in structured memory. Later **`sales-hubspot-pull`**, **`sales-sequence-draft`**, and **`sales-lead-run`** **must** load active feedback before acting.

## Invoke phrases

- “Remember this feedback: …”
- “Teach the agent: skip company X”
- “Remember: skip companies that already post a lot” / “skip frequent posters”
- “Prefer Partner titles going forward”
- “Never pitch pricing / never pitch Z”
- “Show my learned feedback” / “Disable that feedback”

**Do not** save “skip not-posting angles when company posted recently” — Floor retracted that. One post ≠ consistent posting.

## Persist (required)

Write one entry with:

| Field | Values |
|---|---|
| `category` | `icp` \| `company` \| `contact` \| `messaging_tone` \| `disqualifier` \| `geo` \| `sequence_quality` \| `title_preference` \| `other` |
| `target` | optional company / contact / lead / title / geo |
| `text` | Floor’s free text (always keep) |
| `instruction` | structured when clear (`skip_company`, `prefer_title`, `never_pitch`, `tone`, `icp_tweak`, `skip_strong_social`, …) |
| `source` | `skill` |
| `active` | `true` |
| `createdAt` | ISO timestamp |

### Storage

1. **Primary (web app):** `POST /api/feedback { action: "remember", category, text, source: "skill", companyName? }` → `.data/feedback.json` (gitignored).
2. **Skill session without UI:** append to [`skills/memory/FEEDBACK.md`](../memory/FEEDBACK.md) (same shape as API markdown export). Prefer API when the Next.js app is running.

Confirm in **one line**: what was saved + that the **next Dutch batch pull/draft** will apply it.

If Floor accidentally re-states the retracted rule (“skip not-posting when they posted recently”), **disable** any such entry and confirm: consistency angle stays; phrasing = “haven’t been posting consistently”; skip only **frequent** posters.

## Applying feedback (for sibling skills)

When **any** of these run, load active feedback first:

1. `sales-hubspot-pull` — skip listed companies; skip/flag **strong social / frequent posters**; prefer preferred titles; apply ICP/geo notes.
2. `sales-sequence-draft` — inject tone / never-pitch; use consistency phrasing **“haven’t been posting consistently”** (never single-post date callouts); still **approve before send**.
3. `sales-gmail-send` — on confused / don’t-understand replies: gracious short reply, HubSpot log, cancel E2/E3, no demo.
4. `sales-lead-run` — preflight: load memory → digest → batch pull/draft.

## List / disable / delete

- List: `GET /api/feedback` or read `skills/memory/FEEDBACK.md`.
- Disable: `POST /api/feedback { action: "disable", id }` (keeps history).
- Delete: `POST /api/feedback { action: "delete", id }`.
- UI: Feedback tab + per-lead **Teach agent** (graduation-cap) action.

## Governance (hard)

- Feedback **never** auto-sends LinkedIn or email.
- Feedback does **not** bypass draft → approve queue → mark sent.
- Feedback does **not** allow silent calendar auto-book.
- Geo hard rule still wins: **Netherlands first**, Belgium second, **NL+BE only**.
- CRM writebacks stay English.
- **Do not** live-check LinkedIn every run because of feedback.

## Examples

```text
User: Remember this feedback: skip company Acme Legal forever
→ category=company, instruction=skip_company(Acme Legal), save, confirm.

User: Remember: skip companies that already post a lot / post frequently
→ category=disqualifier, instruction=skip_strong_social / frequent_posters, save.
→ Next Dutch batch pull flags/skips strong presence before drafting.

User: Prefer Ops manager titles for larger firms
→ category=title_preference, instruction=prefer_title([Ops manager]), save.

User: Never pitch pricing on LinkedIn
→ category=messaging_tone, instruction=never_pitch(pricing), save.

User: Remember: Skip or soften not-posting angles when company posted recently
→ Do NOT save as active. Disable any prior soften_not_posting_if_recent_posts entry.
→ Confirm: one post ≠ consistent; keep “haven’t been posting consistently”; skip only frequent posters.
```
