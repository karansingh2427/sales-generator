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
| **Batch 50 (draft)** | `Batch 50 Dutch HubSpot tasks. Transform company notes into Gmail cold sequences (max 3 emails, ~1 week between). Show approve queue. Do not send yet. Skip Belgian leads.` |
| **Approve** | `approve 1-20` / `edit #7` / `skip #12` / `approve-all pending` |
| **Send via Gmail** | `Send approved emails via Gmail.` |
| **Enrich (optional)** | `Enrich #7 from LinkedIn, then redraft Email 1.` |
| **Tone / feedback** | `Remember how I write: warmer, shorter` / `Remember: skip companies that already post a lot` |
| **Demo → Slack you** | *(automatic on interest — includes full conversation)* |
| **You book Ludwig** | Book Ludwig yourself — Claude does **not** auto-create events |
| **After meeting** | `Mark Demo Completed` / `Rescheduled` / `Cancelled` |

**One-liner:** HubSpot notes = preferred background; personalize the full Gmail sequence. LinkedIn **scrape/research** OK when notes are thin or you ask — don’t force every run. LinkedIn **send/API** still forbidden. Gmail is the only send channel.

**Rules:** Gmail only · max 3 emails · prefer HubSpot notes · approve before send · no Lemlist · no LinkedIn send · clear no → stop · interest → Slack you → you book Ludwig.
