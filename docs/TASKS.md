# Task catalog — operator flows

| Task ID | Trigger | Steps | Done when |
|---|---|---|---|
| T-01 | New Sales Nav list | Export Lead List CSV → Import panel → confirm BE+NL geo → map columns → select rows → Import | New `sales_nav_csv` rows in Leads tab |
| T-01b | Demo without CSV | Demo / sample data → practice + count → Add demo samples | Labeled demo leads (BE/NL-biased) |
| T-02 | New high-ICP lead | Email icon → review dialog → Mark sent | Stage `contacted` |
| T-03 | LinkedIn-first account | InMail → edit copy → Mark sent | Draft in Outreach tab |
| T-04 | Positive reply (manual stage) | Update stage to `replied` via API/UI future | Ready for T-05 |
| T-05 | Book demo | Calendar icon → pick AE + slot → Confirm | Booking row + stage `demo_booked` |
| T-06 | Weekly review | Outreach tab → verify rationale coverage | All drafts have rationale |
| T-07 | Governance audit | Open `/governance` → cross-check PRD | Checklist signed off |
| T-08 | Expand geo | Toggle DE/FR/UK etc. on import → Re-score → select | Nearby EU leads optional |

## Sales Nav export (Floor)

1. LinkedIn Sales Navigator → Lead List (BE/NL lawyer / professional-services search).
2. Export / download as CSV (Lead List export).
3. Drop into Sales Generator import panel; keep default geo **BE + NL** unless intentionally expanding.
4. Review ICP scores + duplicates; import selected only.
5. Draft outreach per lead — still human send.

## Agent tasks (future plugin)

| Task ID | Skill (planned) | Notes |
|---|---|---|
| A-01 | `sales-lead-run` | Sales Nav CSV + future HubSpot sync |
| A-02 | `sales-outreach-draft` | Wrap `draftOutreach` + optional LLM |
| A-03 | `sales-book-demo` | Calendly + AE round-robin |

MVP implements T-01–T-05 and T-08 in the web UI. HubSpot is **out of scope this turn**.
