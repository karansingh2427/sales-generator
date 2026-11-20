# Rules — BDR + AI conduct

These rules govern human and agent operators. Violations are **invalid** scenarios in [tests/evals.json](../tests/evals.json).

## Outreach & sequence rules

1. **No outreach to disqualified leads** — including **strong social presence** (Floor disqualifier).
2. **Channels — Lemlist (LinkedIn + email)** (Floor, 2026-11-13; live since 2026-11-20 as “Willow NL pilot”). Playbook: profile visit → like latest post → invite → **one** personal email (all day 0, one after another) → LinkedIn message as soon as they accept → LinkedIn follow-up 2 days later. **Max 1 email** — follow-ups happen on LinkedIn. **Lemlist** runs every step through Floor’s Lemlist Claude connector. Lead with no LinkedIn URL → just the email. Gmail (`sales-gmail-send`) only if Lemlist’s email sender is down. No LinkedIn automation outside Lemlist.
2a. **Stop on reply** — any reply on LinkedIn **or** email stops the whole sequence at any point (Lemlist stop-on-reply; mirror with `record_reply`), then `sales-reply-demo` classifies it. No automated touch after a reply, whatever the class.
2b. **LinkedIn copy** — invite note ≤200 chars (Lemlist limit, variables included), no pitch; LinkedIn messages 2–3 short lines — the first refers back to the email (“I sent you an email — connecting here because …”) and asks one question. Same story arc as the email. Profile visit + like latest post are automatic (no copy); Floor may skip them per lead.
2c. **LinkedIn safety** — Lemlist limits on Floor’s account: sending window Mon–Fri 09:00–17:30; invites 10/day with ramp-up to 20/day; profile visits 25/day; messages 25/day (LinkedIn allows ~100 invites per rolling week). Max 20 new leads/day get LinkedIn steps.
3. **Every draft includes rationale** — CRM why-good / opener / opportunity angles (`scoreLeadRationale` / sequence engine).
4. **One story arc** — open with HubSpot-note insight → one tension → soft Willow bridge on the *same* story → short CTA. Never pivot (e.g. vacancy → random content calendar). Emails 2–3 continue the same thread.
5. **Senior voice** — write as a sales pro with 20–30 years experience; calm, peer-to-peer; never AI-ish or feature dump. Once per batch, learn tone from Floor’s past HubSpot sent emails + feedback playbook.
6. **CTA** — the email = curious / open to chat (soft); the LinkedIn follow-up may ask for a short chat. When they agree, **Slack Floor** (include conversation) — she books Ludwig’s calendar manually. Do not promise pricing or legal outcomes.
7. **No fabricated case studies** — use only Willow public claims (expertise firms, EU/GDPR, coaching) and only when they continue the same story.
8. **Automatic mode (default since 2026-11-20, Floor’s decision)** — see [AUTOMATIC-MODE.md](AUTOMATIC-MODE.md). The agent’s **quality gate** replaces per-line approval: right decision maker, all 5 texts filled, invite ≤200 chars, correct name/company everywhere, no invented facts, no single-post callout, no story-breaking pitch. **Anything uncertain → ⚠️, held for Floor, never added.** Stop and only Slack Floor if a sender is disconnected, Lemlist shows errors/bounces, or something looks off. “Stop the automatic outreach” pauses the morning task + the campaign immediately. Replies to prospects still need Floor’s OK.
9. **Web-app Campaigns page** keeps its manual gate: **mark_sent** without prior **approve_step** is invalid for message steps there.
10. Outreach drafts are **editable** (any language Floor prefers); CRM writebacks stay English.
11. **Floor UX** — `START-HERE-FLOOR.md` stays tiny; one paste prompt; do not overwhelm her with jargon or extra docs.

## HubSpot rules

1. **Hero path:** HubSpot sync of contacts + **company-level** agent notes (why / opener / right contact). Sales Nav CSV is fallback. Do not treat agent handoff as contact-only.
2. **Prefer session HubSpot MCP/tools** (Floor’s Claude/Cursor). Web-app `HUBSPOT_ACCESS_TOKEN` is optional fallback only — do not require embedding a private-app token for skills to work.
3. Without `HUBSPOT_ACCESS_TOKEN`, the web connector must run in **mock mode** (no silent failure pretending to be live).
4. Stage mapping uses configurable labels (`HUBSPOT_STAGE_MAP`); unknown labels → `new`.
5. After **Demo Booked** → **Demo Completed** | **Demo Rescheduled** | **Demo Cancelled** (Floor confirmed).
6. Property map for agent fields is configurable (`HUBSPOT_PROPERTY_MAP`); defaults `sg_why_good`, `sg_opener`, `sg_right_contact` on **Company** preferred.
7. Strong social presence → stage `disqualified` / skip outreach — do not sequence.
8. HubSpot PII stays in `.data/workspace.json` only — never commit to git. Token only in `.env.local` if used.
9. **CRM language = English** for anything written into HubSpot (stage labels, notes, outcomes).
10. **Task lookback:** Dutch HubSpot tasks **newest first** — today, then yesterday, back up to **2 months** — until the day’s volume (15/day first week, then 30/day) is reached. Fewer good leads → send fewer and say why.
11. **Never-contacted only:** skip contact/company with prior outbound email or logged outreach before drafting.
12. **Daily automatic run:** one 08:00 run per weekday (Floor may ask for extra runs); never treat “already ran once” as done forever; never recycle already-contacted leads.

## Lead generation & Sales Nav import rules

1. **Fallback path:** LinkedIn Sales Navigator CSV → preview → human select → commit.
2. **Default ICP geography:** **Netherlands (NL) primary**, **Belgium (BE) secondary**. Default filter = `NL + BE`. **No other countries** in ICP, filters, mocks, or skills.
3. ICP: decision makers (Partner / Founder / Ops manager); verticals accountancy, legal, IT, HR/recruitment/exec search, coaching, expertise B2B.
4. `minScore` floor 70 unless PRD exception documented.
5. **Deduplicate** on email and/or LinkedIn URL (and HubSpot contact id on sync).
6. **No silent import blast** — `import_commit` only accepts explicitly selected rows.
7. Demo / sample data must be labeled (`source: demo_sample`) and NL/BE only.

## Booking rules

1. **Primary AE = Ludwig.** Floor **books herself** on his calendar after the demo Slack ping.
2. Duration 15–60 minutes; default 30 (Floor may adjust when she books).
3. Disqualified leads cannot book.
4. **Hard default on yes-demo:** Slack Floor (with **conversation**) → Floor books Ludwig → **do not auto-create calendar events**.
5. Google Calendar propose/draft **only if Floor explicitly asks after** the Slack ping; still no silent create/send.
6. Demo Slack to Floor must include: lead/company, **conversation**, why interested, links/context.
7. Optional: Slack Ludwig with lead context when Floor asks.
8. Only after Floor confirms the Ludwig booking → HubSpot **Demo Booked**; later Completed | Rescheduled | Cancelled.
9. **Daily run:** weekday 08:00 Cowork task → find (2-month lookback, never-contacted + do-not-contact skips) → write → quality gate → add to “Willow NL pilot” (max 20/day with LinkedIn steps) → Slack report. ⚠️ leads wait for Floor.

## Skill pack rules

1. Skills live under `skills/*/SKILL.md` and are mapped from [AGENTS.md](../AGENTS.md).
2. `sales-hubspot-pull` must instruct NL-first pulls, **newest-first lookback up to 2 months**, **never-contacted** + do-not-contact filters, Lemlist dedup, and company notes.
3. `sales-sequence-draft` must draft **LinkedIn + email** sequences for Lemlist (visit + like + invite → 1 email → 2 LinkedIn messages) and run the quality gate; uncertain leads get ⚠️.
4. `sales-gmail-send` is only a fallback if Lemlist’s email sender is down; never for a lead already in Lemlist; never LinkedIn.
4a. `sales-lemlist-push` adds only quality-gate-passed (or Floor-approved ⚠️) leads to “Willow NL pilot” via the connector; max 20/day with LinkedIn steps; read back after every change; never another campaign. The web-app API push stays a stub (402 plan limit) and must never claim a send.
5. `sales-reply-demo` classifies Dutch-batch replies from **email and LinkedIn (Gmail + Lemlist inbox)** as **BOOK NOW / NOT YET / NO / CONFUSED**; politeness ≠ BOOK NOW; never auto-book; HubSpot-log inbound + outbound.
5a. **Every reply → one Slack ping to Floor** (Template P; BOOK NOW uses Template R). Hourly reply check Mon–Fri 08:00–18:00 Europe/Amsterdam via Cowork. Dedup — never re-ping the same reply; no ping for out-of-office.
5b. `sales-daily-update` Slacks Floor Mon–Fri at 08:30 Europe/Amsterdam: sent since the last update, replies + pilot reply rate, invite acceptance (Lemlist only — never estimated), demos, ⚠️ leads waiting, max 2 “worth adjusting” bullets. Read-only: never edits, approves or sends.
6. `sales-demo-book` must Slack Floor (with conversation), never auto-book Calendar, and use the three post-demo outcomes after she books Ludwig. BOOK NOW from reply-demo is the preferred trigger.
7. Orchestrator `sales-lead-run` may compose the skills — it must not bypass HITL, geo lock, the Lemlist channel rules, stop-on-reply, or the Slack→Ludwig handoff.
8. `sales-feedback-learn` persists structured feedback; pull/draft/lead-run **must** load active feedback.
9. Feedback never bypasses the quality gate or the ⚠️ hold.
10. Feedback cannot add countries outside NL+BE.

## Feedback learning rules

1. Storage: `.data/feedback.json` (gitignored) + optional promote to `skills/memory/FEEDBACK.md`.
2. Each entry: category, optional target entity, free text, instruction, timestamp, source (`ui` \| `skill` \| `teach_lead`), active flag.
3. Active feedback applies on HubSpot sync, sequence generate, outreach draft, and skill lead-run.
4. Floor can disable or delete any entry from the Feedback tab.
5. Per-lead **Teach agent** action creates company-targeted feedback.

## Agent communication (when driving UI or skills via Cursor)

1. One action at a time; confirm before bulk HubSpot sync interpretation or demo generate (>5 leads).
2. Present sequence drafts as readable prose before approve/mark sent.
3. Name failures in plain language.
4. Prefer **Netherlands-first** language in ICP explanations; mention Belgium as secondary; never propose other countries.
5. When Floor steers (“skip X”, “prefer title Y”), save via `sales-feedback-learn` and confirm in one line.
