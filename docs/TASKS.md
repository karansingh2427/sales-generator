# Task catalog — operator flows

| Task ID | Trigger | Steps | Done when |
|---|---|---|---|
| T-HS-01 | CRM notes ready | HubSpot panel → Sync **or** skill `sales-hubspot-pull` | Dutch tasks + company notes as background; NL-first; no scrape |
| T-SEQ-01 | High-ICP Dutch HubSpot lead | `sales-sequence-draft` → Generate | Gmail sequence max 3 personalized from note |
| T-SEQ-02 | Review touch | Edit → Approve → `sales-gmail-send` → Mark sent | Step `sent` via Gmail; lead `contacted` |
| T-SEQ-03 | No reply after ~1 week | Approve next email (≤3) → Gmail send | Sequence progresses; hard cap 3 |
| T-SEQ-04 | Clear no / interest reply | Stop sequence · interest → Slack Floor | No further emails; Ludwig booked by Floor |
| T-01 | Offline list | Sales Nav CSV import (fallback) → **NL+BE** → select → Import | `sales_nav_csv` rows |
| T-01b | Demo without CRM | Demo / sample data → Add demo samples | Labeled demo leads (NL/BE only) |
| T-02 | Single-touch email | Email icon → review → Mark sent | Stage `contacted` |
| T-05 | Book demo | Interest → `sales-demo-book` → Slack Floor → she books Ludwig | Slack + conversation; never auto-book |
| T-06 | Post-demo outcome | Completed / Rescheduled / Cancelled | Stage + HubSpot EN writeback |
| T-07 | Governance audit | Open `/governance` | Checklist signed off |
| T-SK-01 | Cowork session | Follow [docs/skills.md](./skills.md) | Dutch pull + Gmail drafts + Gmail send + Slack handoff |
| T-FB-01 | Floor steers tone / ICP | “Remember how I write: …” / Feedback tab | Entry in `.data/feedback.json` |
| T-FB-02 | Next HubSpot sync / sequence | Sync or Generate after active feedback | Tone/skips applied; still approve before Gmail send |
| T-FB-03 | Fix a bad rule | Feedback tab → Disable or Delete | Entry inactive/removed |

## Agent tasks (skill pack)

| Task ID | Skill | Notes |
|---|---|---|
| A-01 | `sales-hubspot-pull` | Dutch daily tasks + notes (background; no scrape) |
| A-02 | `sales-sequence-draft` | Personalize full Gmail sequence from note; max 3; approve queue |
| A-03 | `sales-gmail-send` | Send approved via Gmail; stop on no/interest |
| A-04 | `sales-demo-book` | Slack Floor + conversation; she books Ludwig |
| A-05 | `sales-lead-run` | Orchestrates A-01 → A-02 → A-03 → A-04 (loads feedback first) |
| A-06 | `sales-feedback-learn` | Tone / ICP memory |

Pilot keeps **approve-before-send**. No Lemlist. No LinkedIn API send.
