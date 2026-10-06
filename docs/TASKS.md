# Task catalog — operator flows

| Task ID | Trigger | Steps | Done when |
|---|---|---|---|
| T-HS-01 | CRM notes ready | HubSpot panel → Sync **or** skill `sales-hubspot-pull` | HubSpot leads with **company** why/opener/contact; NL-first |
| T-SEQ-01 | High-ICP HubSpot lead (NL first) | Sequences tab / `sales-sequence-draft` → Generate | Multi-step draft (LI → wait → FU → email) |
| T-SEQ-02 | Review touch | Edit body → Approve → send in LI/email client → Mark sent | Step `sent`; lead `contacted` |
| T-SEQ-03 | No reply after wait | Mark wait done → Approve follow-up → Mark sent → Email step | Sequence progresses without cold call |
| T-01 | Offline list | Sales Nav CSV import (fallback) → **NL+BE default** → select → Import | `sales_nav_csv` rows |
| T-01b | Demo without CRM | Demo / sample data → Add demo samples | Labeled demo leads (NL/BE only) |
| T-02 | Single-touch email | Email icon → review → Mark sent | Stage `contacted` |
| T-05 | Book demo | Calendar icon / `sales-demo-book` → AE + slot → Confirm | Booking on **AE calendar link** + `demo_booked` |
| T-06 | Post-demo outcome | Bookings tab / skill → Completed / Rescheduled / Cancelled | Stage + HubSpot EN writeback |
| T-07 | Governance audit | Open `/governance` | Checklist signed off |
| T-SK-01 | Cursor/Claude session | Follow [docs/skills.md](./skills.md) first-run | Skills produce NL-first pull + drafts + booking CTA |
| T-FB-01 | Floor steers ICP / company / tone | Feedback tab **or** “Remember this feedback: …” / Teach agent on a lead | Entry in `.data/feedback.json`; visible in Feedback list |
| T-FB-02 | Next HubSpot sync / sequence | Sync or Generate after active feedback | Skip companies / prefer titles / tone applied; still draft-only |
| T-FB-03 | Fix a bad rule | Feedback tab → Disable or Delete | Entry inactive/removed; later runs ignore it |

## HubSpot setup (Floor / ops)

**Preferred:** use HubSpot already connected to Floor’s Claude / Cursor (MCP/session tools). Skills instruct that path.

**Optional web-app fallback:**

1. Create HubSpot private app with CRM contacts/companies/**notes** read (and contacts write for stage push). Agent notes live on **Company**.
2. Put token in `.env.local` as `HUBSPOT_ACCESS_TOKEN`.
3. Optional: `HUBSPOT_STAGE_MAP` JSON — include Demo Booked / Completed / Rescheduled / Cancelled.
4. Optional: `HUBSPOT_PROPERTY_MAP` JSON for company why/opener/right contact property names.
5. Sync → generate sequence → approve → mark sent (still human). CRM fields stay English.

## Agent tasks (skill pack)

| Task ID | Skill | Notes |
|---|---|---|
| A-01 | `sales-hubspot-pull` | NL-first companies + company notes via session HubSpot tools |
| A-02 | `sales-sequence-draft` | LI + email drafts; approve before send |
| A-03 | `sales-demo-book` | Per-AE calendar links; post-demo outcomes |
| A-04 | `sales-lead-run` | Orchestrates A-01 → A-02 → A-03 (loads feedback first) |
| A-05 | `sales-feedback-learn` | Persist / list / disable Floor feedback memory |

This slice implements T-HS-01, T-SEQ-01–03, T-05–06, T-SK-01, T-FB-01–03, plus prior T-01. Auto-send remains **out of scope**. Feedback never bypasses HITL.
