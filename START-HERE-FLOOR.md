# Floor — start here (no GitHub)

You do **not** need GitHub, git, or a developer laptop setup.

## 1) Batch of 50 (phase 1 — approve queue, no auto-send)

1. **Unzip** `sales-generator-for-floor.zip` → open the folder in **Claude Cowork** / **Claude Code**.
2. Paste:

> Batch 50 Dutch HubSpot tasks, draft sequences, show approve queue. Do not send. Skip Belgian leads.

3. Review → say `approve 1-20` / `edit #7` / `skip #12` / `approve-all pending`.
4. **You** send approved LinkedIn/email yourself — Claude never auto-sends.

Next chunk: `Draft the next 50 Dutch tasks into the approve queue — do not send.`

## 2) Teach the agent (feedback)

> Remember: skip companies that already post a lot

Next Dutch batch pull/drafts will apply it. Also: `Remember this feedback: skip company X` / `prefer Partner titles`.

## 3) Lead wants a demo (hard default)

1. Claude **Slacks you** with lead/company + the **conversation** + why interested + links.
2. **You book yourself on Ludwig’s calendar** and verify.
3. Claude must **not** auto-create calendar events.

Only if you want help **after** that Slack: `Propose 3 times for Ludwig — draft only, don’t create the event.`  
Optional: `Slack Ludwig with the lead context for this demo.`

## 4) After the meeting

Tell Claude: **Demo Completed** / **Rescheduled** / **Cancelled** (English in HubSpot).

## Phases

| Phase | What | Status |
|---|---|---|
| **1 — Approve queue** | Bulk draft → you approve/edit/skip → you send | **This zip** |
| **2 — Auto-send** | Claude sends without you | **Later — not built** |

## Also in this zip

| File | What it is |
|---|---|
| `docs/floor-open-in-cowork.md` | Same setup, more detail |
| `docs/floor-test-guide.md` | Website click-through (mock HubSpot) |
| `skills/` | Instruction packs for Cowork |
| `AGENTS.md` | Skill map (for Claude) |
| `media/floor-sales-generator-demo.mp4` | Optional demo video |

**Website only:** https://sales-generator-delta.vercel.app

Stuck? Ask Karandeep for a 10‑min screen share.
