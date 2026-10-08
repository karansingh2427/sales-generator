# Task catalog — operator flows

| Task ID | Trigger | Steps | Done when |
|---|---|---|---|
| T-HS-01 | CRM notes ready | HubSpot panel → Sync **or** skill `sales-hubspot-pull` | Dutch tasks **last ~30d** + never-contacted only + company notes; NL-first; multi-batch OK |
| T-SEQ-01 | High-ICP Dutch HubSpot lead | `sales-sequence-draft` → Generate | Gmail sequence max 3 personalized from note |
| T-SEQ-02 | Review touch | Edit → Approve → `sales-gmail-send` → Mark sent | Step `sent` via Gmail; lead `contacted` |
| T-SEQ-03 | No reply after ~1 week | Approve next email (≤3) → Gmail send | Sequence progresses; hard cap 3 |
| T-SEQ-04 | Inbound reply | `sales-reply-demo` classify BOOK NOW / NOT YET / NO / CONFUSED | Politeness ≠ BOOK NOW; HubSpot log in+out |
| T-SEQ-05 | BOOK NOW reply | Offer 2 Ludwig slots · Slack Floor · she books | Never auto-book; cancel E2/E3 |
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
| A-01 | `sales-hubspot-pull` | Dutch tasks last ~30d + never-contacted + notes (multi-batch/day) |
| A-02 | `sales-sequence-draft` | Personalize full Gmail sequence from note; max 3; approve queue |
| A-03 | `sales-gmail-send` | Send approved via Gmail; hand replies to reply-demo |
| A-04 | `sales-reply-demo` | Classify replies; BOOK NOW → 2 slots + Slack Floor |
| A-05 | `sales-demo-book` | Slack Floor + conversation; she books Ludwig |
| A-06 | `sales-lead-run` | Orchestrates A-01 → A-02 → A-03 → A-04 → A-05 (loads feedback first; 2–3 batches/day) |
| A-08 | `sales-lead-run` re-batch | “Run another Dutch batch now” | Fresh 30d never-contacted chunk; not one-shot |
| A-07 | `sales-feedback-learn` | Tone / ICP memory |

Pilot keeps **approve-before-send**. No Lemlist. No LinkedIn API send.
