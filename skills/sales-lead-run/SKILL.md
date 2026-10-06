---
name: sales-lead-run
description: Orchestrate Floor’s Dutch cold-email pass — Dutch HubSpot tasks, Gmail sequences (max 3), prefer HubSpot notes, optional LinkedIn research when notes thin or Floor asks, approve → Gmail send. No Lemlist, no LinkedIn send/API.
---

# sales-lead-run

One operator pass for Floor Hoefkens (Willow BDR). Orchestrates domain skills; does not replace them.

## End vision (Floor — exact)

| | |
|---|---|
| **Input** | Dutch HubSpot **daily tasks** + company notes (preferred background) |
| **Transform** | Personalize the **full** Gmail sequence from notes; **LinkedIn scrape/research OK** when notes thin or Floor asks — don’t force every run |
| **Sequence** | Email 1 → wait ~1 week if no reply → Email 2 → … **cap 3** |
| **Stop early** | Clear **no** → close · **Interest** → Slack Floor with **full conversation** → she books Ludwig |
| **Tone** | Learn from feedback / “remember how I write” |
| **Pilot** | Approve-before-send → Gmail send |
| **Never** | Lemlist · LinkedIn **API / send** · auto-book Calendar |

## Invoke in order

0. **`sales-feedback-learn`** — load active feedback (tone / skips / “how I write”). One-line digest.
1. **`sales-hubspot-pull`** — Dutch HubSpot **daily tasks** + company notes. Chunk **50**. Skip Belgian unless asked.
2. **`sales-sequence-draft`** — personalize Gmail drafts (max 3) from notes (± optional LinkedIn enrich) → **approve queue**.
3. **`sales-gmail-send`** — after approve, send due emails via **Gmail** (Cowork). Prerequisite: Gmail connected (same Google as Calendar if possible).
4. **Watch replies** — clear no → stop sequence · interest → **`sales-demo-book`** (Slack Floor + conversation → she books Ludwig).

## Geography

- **Netherlands first**; Belgium second; **NL + BE only**.
- Pilot: **Dutch tasks only** unless Floor includes BE.

## Pass contract

```text
1. Preflight — HubSpot + Gmail (+ Slack); load feedback; Gmail max 3; approve before send; LinkedIn send forbidden.
2. Pull — Dutch HubSpot daily tasks + company notes (chunk 50).
3. Draft — sales-sequence-draft from notes; enrich via LinkedIn only if thin / Floor asks — not every company.
4. Approve — Floor approve / edit / skip.
5. Send — sales-gmail-send for approved due steps (Gmail only).
6. Cadence — if no reply ~1 week → next email (still ≤3); stop early on no or interest.
7. Interest — Slack Floor with full conversation → she books Ludwig (never auto-book).
8. Learn — “Remember how I write: …” / skip rules → next batch.
```

### Example prompts

**Batch draft:**

> Batch 50 Dutch HubSpot tasks. Transform company notes into Gmail cold sequences (max 3 emails, ~1 week between). Show approve queue. Do not send yet. Skip Belgian leads.

**Approve then send:**

> approve 1-20  
> Send approved emails via Gmail.

**Optional enrich:**

> Enrich #7 from LinkedIn, then redraft Email 1.

## What this pass never does

- LinkedIn **API / InMail / connect send** (scrape/research is allowed when warranted).
- Force LinkedIn re-scrape on every company every batch.
- Draft more than **3** emails per lead.
- Continue after clear **no** or after interest handoff.
- Use Lemlist.
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
