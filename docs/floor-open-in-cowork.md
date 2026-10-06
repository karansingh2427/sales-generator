# Floor — open Sales Generator in Claude Cowork

You do **not** need GitHub. Goal: unzip once so Cowork can use the skills with **HubSpot + Gmail + Slack**.

**Website (mock only):** https://sales-generator-delta.vercel.app

---

## Prerequisite

1. Connect **Gmail** in Claude Cowork (same Google as Calendar if possible).
2. Keep **HubSpot** and **Slack** connected.

## Unzip

1. Get `sales-generator-for-floor.zip`.
2. Unzip → open the folder in **Claude Cowork**.
3. Open `START-HERE-FLOOR.md`, or paste prompts below.

## Prompts

| Step | Paste this |
|---|---|
| **Batch 50 (draft)** | `Batch 50 Dutch HubSpot tasks. Transform company notes into Gmail cold sequences (max 3 emails, ~1 week between). Show approve queue. Do not send yet. Do not scrape LinkedIn. Skip Belgian leads.` |
| **Approve** | `approve 1-20` / `edit #7` / `skip #12` / `approve-all pending` |
| **Send via Gmail** | `Send approved emails via Gmail.` |
| **Tone / feedback** | `Remember how I write: warmer, shorter` / `Remember: skip companies that already post a lot` |
| **Demo → Slack you** | *(automatic on interest — includes full conversation)* |
| **You book Ludwig** | Book Ludwig yourself — Claude does **not** auto-create events |
| **After meeting** | `Mark Demo Completed` / `Rescheduled` / `Cancelled` |

**Rules:** Gmail only · max 3 emails · note-only (no scrape) · approve before send · no Lemlist · no LinkedIn send · clear no → stop · interest → Slack you → you book Ludwig.
