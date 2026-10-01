# Task catalog — operator flows

| Task ID | Trigger | Steps | Done when |
|---|---|---|---|
| T-01 | Empty pipeline | Open app → Generate leads (practice + count) | New rows in Leads tab |
| T-02 | New high-ICP lead | Email icon → review dialog → Mark sent | Stage `contacted` |
| T-03 | LinkedIn-first account | InMail → edit copy → Mark sent | Draft in Outreach tab |
| T-04 | Positive reply (manual stage) | Update stage to `replied` via API/UI future | Ready for T-05 |
| T-05 | Book demo | Calendar icon → pick AE + slot → Confirm | Booking row + stage `demo_booked` |
| T-06 | Weekly review | Outreach tab → verify rationale coverage | All drafts have rationale |
| T-07 | Governance audit | Open `/governance` → cross-check PRD | Checklist signed off |

## Agent tasks (future plugin)

| Task ID | Skill (planned) | Notes |
|---|---|---|
| A-01 | `sales-lead-run` | Scheduled mock/live Apollo pull |
| A-02 | `sales-outreach-draft` | Wrap `draftOutreach` + optional LLM |
| A-03 | `sales-book-demo` | Calendly + AE round-robin |

MVP implements T-01–T-05 in the web UI only.
