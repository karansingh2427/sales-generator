# Floor — start here (no GitHub)

You do **not** need GitHub, git, or a developer laptop setup.

## Prerequisite

Connect **Gmail** in Claude Cowork (Google connector). Prefer the **same Google account** as Calendar. Keep **HubSpot** + **Slack** connected.

## What this does (your end vision)

| Input | Your Dutch HubSpot **daily tasks** + company notes (**background** — opener / situation already there) |
| Output | Agent personalizes the **full** cold **Gmail** sequence from that note only (no re-scrape): Email 1 → wait ~1 week if no reply → Email 2 → **max 3 emails** |
| Stop early | Clear **no** → stop · Interest → Claude **Slacks you** with the **full conversation** → **you book Ludwig** |
| Tone | Claude learns from your feedback (“remember how I write”) |
| Pilot | You still **approve** before Claude sends via Gmail |
| Not used | Lemlist · LinkedIn send · re-scraping LinkedIn/websites |

## 1) Batch of 50 — draft

1. **Unzip** `sales-generator-for-floor.zip` → open the folder in **Claude Cowork**.
2. Paste:

> Batch 50 Dutch HubSpot tasks. Transform company notes into Gmail cold sequences (max 3 emails, ~1 week between). Show approve queue. Do not send yet. Do not scrape LinkedIn. Skip Belgian leads.

3. Review → `approve 1-20` / `edit #7` / `skip #12` / `approve-all pending`.
4. Then:

> Send approved emails via Gmail.

Next chunk: `Draft the next 50 Dutch tasks into the approve queue — do not send yet.`

## 2) Teach your tone

> Remember how I write: warmer, shorter, less salesy

Or: `Remember: skip companies that already post a lot` / `prefer Partner titles`.

## 3) Lead wants a demo (or asks “what are you talking about?”)

1. Claude **Slacks you** with lead/company + the **full conversation** + why interested + links.
2. **You book yourself on Ludwig’s calendar**.
3. Claude must **not** auto-create calendar events.

Optional after Slack: `Propose 3 times for Ludwig — draft only, don’t create the event.`

## 4) After the meeting

**Demo Completed** / **Rescheduled** / **Cancelled** (English in HubSpot).

## Also in this zip

| File | What |
|---|---|
| `docs/floor-open-in-cowork.md` | Prompts table |
| `docs/floor-test-guide.md` | Website click-through (mock) |
| `skills/` | Cowork instruction packs |
| `AGENTS.md` | Skill map |
| `media/floor-sales-generator-demo.mp4` | Optional demo |

**Website only:** https://sales-generator-delta.vercel.app

Stuck? Ask Karandeep for a 10‑min screen share.
