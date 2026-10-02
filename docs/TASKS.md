# Task catalog — operator flows

| Task ID | Trigger | Steps | Done when |
|---|---|---|---|
| T-HS-01 | CRM notes ready | HubSpot panel → Sync (mock or live token) | HubSpot leads with why/opener/contact in pipeline |
| T-SEQ-01 | High-ICP HubSpot lead | Sequences tab → select lead → Generate | Multi-step draft (LI → wait → FU → email) |
| T-SEQ-02 | Review touch | Edit body → Approve → send in LI/email client → Mark sent | Step `sent`; lead `contacted` |
| T-SEQ-03 | No reply after wait | Mark wait done → Approve follow-up → Mark sent → Email step | Sequence progresses without cold call |
| T-01 | Offline list | Sales Nav CSV import (fallback) → BE+NL → select → Import | `sales_nav_csv` rows |
| T-01b | Demo without CRM | Demo / sample data → Add demo samples | Labeled demo leads |
| T-02 | Single-touch email | Email icon → review → Mark sent | Stage `contacted` |
| T-05 | Book demo | Calendar icon → AE + slot → Confirm | Booking + `demo_booked` |
| T-07 | Governance audit | Open `/governance` | Checklist signed off |

## HubSpot setup (Floor / ops)

1. Create HubSpot private app with CRM contacts/companies/notes read (and contacts write for stage push).
2. Put token in `.env.local` as `HUBSPOT_ACCESS_TOKEN`.
3. Optional: `HUBSPOT_STAGE_MAP` JSON (label → internal stage).
4. Optional: `HUBSPOT_PROPERTY_MAP` JSON for why/opener/right contact property names.
5. Sync → generate sequence → approve → mark sent (still human).

## Agent tasks (future plugin)

| Task ID | Skill (planned) | Notes |
|---|---|---|
| A-01 | `sales-lead-run` | HubSpot sync + Sales Nav CSV fallback |
| A-02 | `sales-outreach-draft` | Sequence builder + optional LLM |
| A-03 | `sales-book-demo` | Calendly + AE round-robin |

This slice implements T-HS-01, T-SEQ-01–03, plus prior T-01/T-05. Auto-send remains **out of scope**.
