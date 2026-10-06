---
name: sales-lead-run
description: Orchestrate Floor’s Dutch cold-email pass — pull Dutch HubSpot daily tasks, transform company notes into Gmail sequences (max 3, ~1 week gaps, no re-scrape), approve queue, send via Gmail after approve, stop on no/interest with Slack→Ludwig. No Lemlist, no LinkedIn send.
---

# sales-lead-run

One operator pass for Floor Hoefkens (Willow BDR). Orchestrates domain skills; does not replace them.

## End vision (Floor — exact)

| | |
|---|---|
| **Input** | Dutch HubSpot **daily tasks** + company notes (opener/situation already there) |
| **Transform** | HubSpot notes = **background**; agent personalizes the **full** email sequence from that note only — **never re-scrape** LinkedIn/website |
| **Sequence** | Email 1 → wait ~1 week if no reply → Email 2 → … **cap 3** |
| **Stop early** | Clear **no** → close · **Interest** (yes / more info / “what are you talking about?”) → Slack Floor with **full conversation** → she books Ludwig |
| **Tone** | Learn from feedback / “remember how I write” |
| **Pilot** | Approve-before-send → Gmail send |
| **Never** | Lemlist · LinkedIn API send · auto-book Calendar |

## Invoke in order

0. **`sales-feedback-learn`** — load active feedback (tone / skips / “how I write”). One-line digest.
1. **`sales-hubspot-pull`** — Dutch HubSpot **daily tasks** + company notes. Chunk **50**. Skip Belgian unless asked. Do not scrape external sites.
2. **`sales-sequence-draft`** — transform notes → Gmail drafts (max 3) → **approve queue**.
3. **`sales-gmail-send`** — after approve, send due emails via **Gmail** (Cowork). Prerequisite: Gmail connected (same Google as Calendar if possible).
4. **Watch replies** — clear no → stop sequence · interest → **`sales-demo-book`** (Slack Floor + conversation → she books Ludwig).

## Geography

- **Netherlands first**; Belgium second; **NL + BE only**.
- Pilot: **Dutch tasks only** unless Floor includes BE.

## Pass contract

```text
1. Preflight — HubSpot + Gmail (+ Slack); load feedback; confirm note-only (no scrape); Gmail max 3; approve before send.
2. Pull — Dutch HubSpot daily tasks + company notes (chunk 50).
3. Draft — sales-sequence-draft: Email 1–3 from notes → approve queue.
4. Approve — Floor approve / edit / skip.
5. Send — sales-gmail-send for approved due steps; mark sent after Gmail confirms.
6. Cadence — if no reply ~1 week → next email (still ≤3); stop early on no or interest.
7. Interest — Slack Floor with full conversation → she books Ludwig (never auto-book).
8. Learn — “Remember how I write: …” / skip rules → next batch.
```

### Example prompts

**Batch draft:**

> Batch 50 Dutch HubSpot tasks. Transform company notes into Gmail cold sequences (max 3 emails). Show approve queue. Do not send yet. Do not scrape LinkedIn. Skip Belgian leads.

**Approve then send:**

> approve 1-20  
> Send approved emails via Gmail.

## What this pass never does

- Re-scrape LinkedIn or company websites.
- Draft more than **3** emails per lead.
- Continue after clear **no** or after interest handoff.
- Use Lemlist or LinkedIn API send.
- Send before approve (pilot).
- Auto-book Ludwig / Calendar.
- Slack demo ping without the **conversation**.
- Write non-English into HubSpot.

## Digest

```text
# Sales lead run — <date>
Mode: Gmail cold sequence (max 3) · note-only · approve → Gmail
Feedback / tone: <n active>
Pulled Dutch tasks: <n>
Queued: <n> · Approved / edited / skipped: <n>/<n>/<n>
Gmail sent (E1/E2/E3): <n>/<n>/<n>
Stopped — clear no: <n> · Interest → Slack Floor: <n>
Ludwig booked (Floor confirmed): <n>
Blocked: <e.g. Gmail not connected / thin notes>
```
