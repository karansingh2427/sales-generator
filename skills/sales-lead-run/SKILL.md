---
name: sales-lead-run
description: Orchestrate one Floor BDR pass — pull BE-first HubSpot company notes, draft LinkedIn+email sequences for approval, and prepare AE calendar booking. Use when Floor says run leads, do a sales pass, work my HubSpot list, or start outreach for Belgium/Netherlands today.
---

# sales-lead-run

One operator pass for Floor Hoefkens (Willow BDR). This skill **orchestrates** the three domain skills; it does not replace them.

## Invoke in order

1. **`sales-hubspot-pull`** — Belgium-first companies + company notes (why / opener / right contact).
2. **`sales-sequence-draft`** — multi-channel drafts; **approve before send**.
3. **`sales-demo-book`** — when a prospect is ready; per-AE calendar link + post-demo stages.

## Geography (hard rule — do not regress)

- **Belgium first**, Netherlands second.
- **BE + NL only** — no other countries in the pull, drafts, filters, or digests.
- Supersedes any older NL-first pilot defaults in the web app.

## HubSpot path

Prefer **HubSpot MCP/tools in Floor’s Claude or Cursor session**. Do not block on storing a private-app token in the Sales Generator web app. Company-level notes are the handoff surface.

## Pass contract

```text
1. Preflight
   - Confirm HubSpot tools visible in session (or mock web-app fallback labeled as demo).
   - Geo lock: BE primary, NL secondary.
2. Pull
   - Run sales-hubspot-pull.
   - Present BE-first table; Floor selects who to sequence.
3. Draft
   - Run sales-sequence-draft per selected company.
   - Stop for approve on every message step.
4. Send (human)
   - Floor sends in LinkedIn / email client.
   - Mark sent only after she confirms.
5. Book (when warm)
   - Run sales-demo-book with the right AE calendar link.
   - After the meeting: Completed | Rescheduled | Cancelled.
```

## What this pass never does

- Auto-send LinkedIn or email.
- Prospect outside BE/NL.
- Rebuild the internal lead-gen agent (notes already exist on the company).
- Write non-English into HubSpot.

## Digest (end of pass)

Give Floor a short digest:

```text
# Sales lead run — <date>
Pulled: <n> companies (BE <n> · NL <n>)
Skipped strong presence: <n>
Sequences drafted: <n>
Approved / sent: <n> / <n>
Demos booked: <n>
Blocked: <anything waiting on Floor/ops>
```

## Related app surfaces

When she prefers the UI: HubSpot panel → Sequences → Bookings on the Sales Generator Next.js app. Skills and UI share the same RULES / PRD contracts.
