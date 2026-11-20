# Automatic mode — the default since 20 Nov 2026

**Floor’s decision (20 Nov 2026):** outreach runs fully automatically. No approval per line — except leads the agent marks **⚠️**, which wait for her. This replaces “approve every line” for the daily Cowork outreach. Replies to prospects still need her OK, and she still books Ludwig herself.

The live campaign is **“Willow NL pilot”** in Lemlist (launched 20 Nov 2026), reached through Floor’s Lemlist Claude connector. Senders: floor@willow.co (email) and @floor-hoefkens (LinkedIn).

## The three Cowork tasks (Mon–Fri, Europe/Amsterdam)

| Task | When | What |
|---|---|---|
| **1 · Morning outreach** | 08:00 | Find, write, check, add to Lemlist, Slack a report |
| **2 · Reply check** | hourly 08:00–18:00 | Slack Floor once per new reply + draft answer (`sales-reply-demo`) |
| **3 · Daily update** | 08:50 | Short Slack update (`sales-daily-update`) |

Cowork runs only while Floor’s laptop is on with Claude open; a missed run happens when she’s back.

## Task 1 — morning outreach

1. **Volume:** 15 leads/day in the first week after setup (mailbox + LinkedIn ramp-up), then **30/day**. If fewer good leads exist, send fewer and say why — never pad with weak leads.
2. **Find** (`sales-hubspot-pull`): Dutch HubSpot tasks, **newest first** — today’s, then yesterday’s, back day by day up to **2 months**.
3. **Never contacted only:** skip HubSpot Contact again later = “Definitely not” / Lead Status = “Unqualified”, anyone who is a lead in **any** Lemlist campaign, Belgian leads, frequent posters, anyone handled before.
4. **Write** (`sales-sequence-draft`) for the decision maker in the HubSpot note: invite note (≤200 chars), ONE email with Floor’s signature, LinkedIn message (on accept), LinkedIn follow-up (+2 days). One story. Normal `linkedin.com/in/…` links only.
5. **Quality gate** — the agent’s check replaces Floor’s approval. A lead passes only if: right person (decision maker), all 5 texts filled, invite note ≤200 chars, correct name + company in every text, no invented facts, never a single-post callout (“I saw your post yesterday”), no pitch that breaks the story. **Anything uncertain → ⚠️** (unclear contact, thin note, no profile link, odd company) — not added.
6. **Add** (`sales-lemlist-push`) every passing lead to “Willow NL pilot” with `connectNote`, `emailSubject`, `emailBody`, `linkedinMessage`, `linkedinFollowup`, and start them. **Max 20/day get the LinkedIn steps**; the rest go in without a LinkedIn URL (email-only branch). Never touch another campaign.
7. **Read back** in Lemlist: every new lead has all 5 texts. If one is wrong → pause that lead.
8. **Slack Floor:** how many went out, which ⚠️ wait (name, company, why), where today’s texts are (`approve-queue/` file).

**Stop conditions — add nothing, only Slack Floor:** email or LinkedIn sender disconnected in Lemlist, Lemlist errors or bounces, or anything that looks off.

## LinkedIn safety (Lemlist account limits)

LinkedIn allows ~100 invites per rolling week; Lemlist recommends ≤20 invites, ≤30 visits, ≤30 messages per day and <100 actions/day in total.

- Sending window Mon–Fri **09:00–17:30**; Lemlist spaces actions through the day (~20 min apart).
- Invites **10/day with ramp-up to 20/day**; profile visits **25/day**; messages **25/day**.
- Manual LinkedIn invites/messages by Floor count toward the same quota.

## Floor’s controls

- `show me the ⚠️ leads` — handle the leads waiting for her.
- `show me today's texts` — read what went out (recommended daily in the first weeks).
- **`Stop the automatic outreach`** — immediately pause Task 1 **and** the campaign “Willow NL pilot”, then confirm.

## What stays manual

- **Replies to prospects:** drafted by the agent, sent only after Floor’s OK.
- **Demos:** Slack with 2 slots → Floor books Ludwig herself. Never auto-book.
- **Launching / pausing other campaigns, changing senders:** never by the agent.
- **The web-app Campaigns page** keeps its per-line approve gate (it’s a manual tool, not the automatic run).

The one-message setup Floor pastes is in [`START-HERE-FLOOR.md`](../START-HERE-FLOOR.md).
