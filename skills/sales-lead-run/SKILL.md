---
name: sales-lead-run
description: Orchestrate Floor’s BDR pass — bulk-pull Dutch HubSpot tasks, batch-draft LinkedIn+email into an approve queue (approve/edit/skip — never auto-send), and when a lead wants a demo Slack Floor (with conversation) so she manually books Ludwig’s calendar. Use when Floor says run leads, batch 50, do a sales pass, work my HubSpot list, or start outreach for Netherlands/Belgium today.
---

# sales-lead-run

One operator pass for Floor Hoefkens (Willow BDR). This skill **orchestrates** the domain skills; it does not replace them.

**Phase 1 (now):** bulk Dutch pull → **approve queue** → Floor approves/edits/skips → she sends.  
**Phase 2 (later):** auto-send — **do not implement**.

## Invoke in order

0. **`sales-feedback-learn`** — **load active feedback first** (`.data/feedback.json` or `skills/memory/FEEDBACK.md`). Show a one-line digest of skip/prefer/tone rules. If Floor gives new feedback mid-pass, save it via the skill before continuing.
1. **`sales-hubspot-pull`** — **bulk** Netherlands-first / Dutch HubSpot **tasks** + company notes; apply skip-company / prefer-title / ICP notes. Default chunk **50**.
2. **`sales-sequence-draft`** — **batch-draft** into an **approve queue**; Floor **approves / edits / skips** per item or approve-all selected — **never auto-send**.
3. **`sales-demo-book`** — yes-demo → **Slack Floor** (with **conversation**) → she **books Ludwig herself** → **never auto-create** calendar events. Calendar propose/draft only if she **explicitly asks after** the Slack ping. Optional Slack Ludwig. Then Demo Booked → Completed | Rescheduled | Cancelled.

## Geography (hard rule — do not regress)

- **Netherlands first**, Belgium second.
- **NL + BE only** — no other countries in the pull, drafts, filters, or digests.
- Phase-1 pilot batches: **Dutch tasks only** unless Floor includes BE.
- Feedback cannot override the geo lock.

## HubSpot + Slack path

Prefer **HubSpot and Slack MCP/tools in Floor’s Claude or Cursor session**. Do not block on storing a private-app token in the Sales Generator web app. Company-level notes are the lead-gen handoff surface; Slack is the **demo handoff** surface to Floor.

## Pass contract (batch — phase 1)

```text
1. Preflight
   - Confirm HubSpot (+ Slack) tools visible in session (or mock web-app fallback labeled as demo).
   - Geo lock: NL primary, BE secondary; pilot = Dutch tasks.
   - Load active Floor feedback; list skip companies / prefer titles / tone rules.
   - Confirm phase 1 = approve queue only (no auto-send).
2. Bulk pull
   - Run sales-hubspot-pull for today’s Dutch HubSpot tasks (chunk default 50; tens–hundreds OK).
   - Present NL-first table; Floor selects all / subset / next chunk.
3. Batch draft → approve queue
   - Run sales-sequence-draft in batch mode for selected companies.
   - Build numbered approve queue; stop for approve / edit / skip (or approve-all selected).
4. Send (human)
   - Floor sends approved steps in LinkedIn / email client.
   - Mark sent only after she confirms — never auto-send (phase 2 not built).
5. Demo handoff (when warm) — **hard default**
   - Slack Floor with lead/company, **conversation**, interest, links.
   - Floor **books herself on Ludwig’s calendar** — never auto-create calendar events.
   - Calendar propose/draft **only if Floor explicitly asks after** the Slack ping.
   - Optional: Slack Ludwig with lead context when Floor asks.
   - After she confirms → HubSpot Demo Booked; later Completed | Rescheduled | Cancelled.
6. Learn (anytime)
   - “Remember this feedback: …” / “skip companies that already post a lot”
     → sales-feedback-learn → applied on next Dutch batch pull/drafts.
```

### Example — Floor runs a batch of 50

Floor pastes:

> Pull today’s Dutch HubSpot tasks. Batch-draft LinkedIn + email for the first 50 into an approve queue. Do not send. Skip Belgian leads.

Agent:

1. Loads feedback → pulls ~50 Dutch tasks/companies with notes.  
2. Drafts 50 sequences into the approve queue.  
3. Shows queue digest + drafts.  
4. Floor: `approve 1-20` / `edit #7` / `skip #12` / then sends approved LinkedIn/email herself.  
5. Agent marks sent only when she confirms.

## What this pass never does

- Auto-send LinkedIn or email (phase 2 — not implemented).
- Auto-book Calendar / Calendly / HubSpot meetings.
- Prospect outside NL/BE.
- Rebuild the internal lead-gen agent (notes already exist on the company).
- Write non-English into HubSpot.
- Let feedback bypass approve-before-send.
- Slack a demo ping without the **conversation** (transcript or clear summary).
- Treat “approve-all” as permission to send.

## Digest (end of pass)

Give Floor a short digest:

```text
# Sales lead run — <date>
Mode: phase 1 approve queue (no auto-send)
Feedback applied: <n active> (skipped companies: <…>)
Pulled: <n> (Dutch tasks / NL <n> · BE <n>)
Chunk: <shown> / <remaining>
Skipped strong presence: <n>
Queued drafts: <n>
Approved / edited / skipped: <n> / <n> / <n>
Sent (Floor confirmed): <n>
Slack demo handoffs: <n>
Demos booked (Floor confirmed on Ludwig): <n>
Blocked: <anything waiting on Floor/ops>
```

## Related app surfaces

When she prefers the UI: HubSpot panel → Sequences → Feedback tab on the Sales Generator Next.js app (often single-lead). **Cowork skills are the bulk approve-queue path.** Production demo handoff is **Slack → Floor books Ludwig**, not the mock booking UI.
