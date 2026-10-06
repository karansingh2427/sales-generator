---
name: sales-lead-run
description: Orchestrate one Floor BDR pass — pull NL-first HubSpot company notes, draft LinkedIn+email sequences for approval, and prepare AE calendar booking. Use when Floor says run leads, do a sales pass, work my HubSpot list, or start outreach for Netherlands/Belgium today.
---

# sales-lead-run

One operator pass for Floor Hoefkens (Willow BDR). This skill **orchestrates** the three domain skills; it does not replace them.

## Invoke in order

0. **`sales-feedback-learn`** — **load active feedback first** (`.data/feedback.json` or `skills/memory/FEEDBACK.md`). Show a one-line digest of skip/prefer/tone rules. If Floor gives new feedback mid-pass, save it via the skill before continuing.
1. **`sales-hubspot-pull`** — Netherlands-first companies + company notes (why / opener / right contact); **apply** skip-company / prefer-title / ICP notes from memory.
2. **`sales-sequence-draft`** — multi-channel drafts using tone / never-pitch / sequence notes; **approve before send**.
3. **`sales-demo-book`** — when a prospect is ready; per-AE calendar link + post-demo stages.

## Geography (hard rule — do not regress)

- **Netherlands first**, Belgium second.
- **NL + BE only** — no other countries in the pull, drafts, filters, or digests.
- Supersedes any older Belgium-first defaults in the web app.
- Feedback cannot override the geo lock.

## HubSpot path

Prefer **HubSpot MCP/tools in Floor’s Claude or Cursor session**. Do not block on storing a private-app token in the Sales Generator web app. Company-level notes are the handoff surface.

## Pass contract

```text
1. Preflight
   - Confirm HubSpot tools visible in session (or mock web-app fallback labeled as demo).
   - Geo lock: NL primary, BE secondary.
   - Load active Floor feedback; list skip companies / prefer titles / tone rules.
2. Pull
   - Run sales-hubspot-pull with feedback applied (skip listed companies).
   - Present NL-first table; Floor selects who to sequence.
3. Draft
   - Run sales-sequence-draft per selected company (inject tone / never-pitch).
   - Stop for approve on every message step.
4. Send (human)
   - Floor sends in LinkedIn / email client.
   - Mark sent only after she confirms.
5. Book (when warm)
   - Run sales-demo-book with the right AE calendar link.
   - After the meeting: Completed | Rescheduled | Cancelled.
6. Learn (anytime)
   - “Remember this feedback: …” → sales-feedback-learn → persists for next pass.
```

## What this pass never does

- Auto-send LinkedIn or email.
- Prospect outside NL/BE.
- Rebuild the internal lead-gen agent (notes already exist on the company).
- Write non-English into HubSpot.
- Let feedback bypass approve-before-send.

## Digest (end of pass)

Give Floor a short digest:

```text
# Sales lead run — <date>
Feedback applied: <n active> (skipped companies: <…>)
Pulled: <n> companies (BE <n> · NL <n>)
Skipped strong presence: <n>
Sequences drafted: <n>
Approved / sent: <n> / <n>
Demos booked: <n>
Blocked: <anything waiting on Floor/ops>
```

## Related app surfaces

When she prefers the UI: HubSpot panel → Sequences → Feedback tab → Bookings on the Sales Generator Next.js app. Skills and UI share the same RULES / PRD contracts and `.data/feedback.json` memory.
