---
name: sales-reply-demo
description: Pull Dutch-batch Gmail replies, classify BOOK NOW / NOT YET / NO / CONFUSED (politeness ≠ intent), draft the right next email, Slack Floor on BOOK NOW with thread + 2 Ludwig slots she can book manually. Never auto-book calendar. HubSpot-log inbound + outbound.
---

# sales-reply-demo

Turn inbound Gmail replies into demo progress — or a clean stop. **Floor books Ludwig herself.** Never auto-create calendar events.

## When to run

Floor pastes (or says):

> Check my replies from the Dutch batch and handle them.

Also invoked from `sales-lead-run` after outbound sends, and from `sales-gmail-send` / `sales-demo-book` when a reply arrives.

## Scope

- **Dutch batch leads only** (NL HubSpot tasks / companies already in the pilot). Skip Belgian / non-pilot threads.
- Pull **recent inbound Gmail replies** on threads where we sent E1/E2/E3.
- One coherent story continues (same senior voice + consistency rules as outbound). Do **not** invent a new pitch.

## Classify each reply (exactly one)

| Class | Real meaning | False-signal guard |
|---|---|---|
| **BOOK NOW** | Clear buying intent: asks for a call/demo, shares availability, “let’s talk”, wants to meet Ludwig / see Willow, concrete next-step ask | Politeness alone is **not** BOOK NOW |
| **NOT YET** | Soft interest / curiosity / “send more” / timing soft — but **no** real booking signal | “Sounds interesting”, “cool”, “thanks for reaching out”, emoji-only, vague niceties → treat as **NOT YET** (or **CONFUSED** if they missed the point), **never** BOOK NOW |
| **NO** | Clear decline, unsubscribe, not relevant, wrong person with hard stop | — |
| **CONFUSED** | Don’t understand the angle, pushback on opener (“I just posted”), missed the point | Gracious close — **not** a demo push |

**Rule:** one real signal beats ten friendly replies. Never ask for the call too early. Cap questions. Don’t repeat the prospect’s name. Don’t demo-push confused or cold leads.

## Actions by class

### BOOK NOW

1. Cancel scheduled E2/E3 (reply already happened).
2. Draft a **short** senior reply that offers **exactly 2 concrete Ludwig demo time slots** (30 min):
   - If Floor’s **Google Calendar** is connected: pick 2 real open slots in the next ~5–10 business days (CET), phrased as concrete options.
   - If Calendar is **not** connected or slots are unclear: use clear **placeholders** Floor can edit, e.g. `Tue 14 Oct, 10:00–10:30 CET` / `Thu 16 Oct, 15:00–15:30 CET` — mark them as edit-ready.
3. **Do not** create/send calendar invites. Do **not** drop a Calendly / auto-book link as the primary path unless Floor already uses one and asked.
4. Show Floor the draft reply (approve/send via Gmail — same HITL as outbound unless she already said to handle/send replies).
5. **Slack Floor** with Template R (below): full thread + classification + the 2 slots offered.
6. Hand off booking to Floor via `sales-demo-book` rules — she books Ludwig manually after she sees Slack.
7. **HubSpot-log** the inbound reply and the outbound reply (email engagements; English notes OK).

### NOT YET

1. Draft **one** value-building reply that continues the **same story** (insight → tension → soft Willow bridge). No hard demo ask. One light open question max.
2. **Keep** scheduled E2/E3 if still relevant and no further reply; do not cancel solely for soft interest.
3. Show draft → send when approved (or when Floor’s handle-replies instruction includes send).
4. **HubSpot-log** inbound + outbound.
5. **Do not** Slack Floor for booking yet. **Do not** offer Ludwig slots yet.

### NO

1. Draft a **gracious close** (2–3 sentences). No Willow pitch, no Ludwig, no “are you sure?”.
2. **Cancel** E2/E3.
3. **HubSpot-log** inbound + outbound; note closed/lost in English if useful.
4. **No** demo push. **No** Slack booking ping.

### CONFUSED

1. Draft a **gracious short ack** — thank them, clarify lightly if needed, leave the door open. No pitch, no Ludwig.
2. **Cancel** E2/E3.
3. **HubSpot-log** inbound + outbound.
4. **No** demo push. **No** Slack booking ping.
5. Consistency angle stays valid for **other** leads (one post ≠ posting consistently).

## Template R — Slack Floor (BOOK NOW only)

```text
🎯 Reply → demo — BOOK NOW (please book Ludwig)

Lead: <Name> · <Title>
Company: <Company> (NL)
HubSpot: <contact/company URL if available>
Classification: BOOK NOW
Why this is real intent (not politeness): <1–2 bullets>

2 Ludwig slots offered in our reply (30 min, CET):
1. <slot A>
2. <slot B>
(Calendar source: <Floor calendar | placeholders for Floor to edit>)

Full conversation:
---
<paste Gmail thread — enough to brief Ludwig>
---

Outbound reply drafted/sent:
---
<body>
---

Action for Floor: **book yourself on Ludwig’s calendar** for the slot they pick (or propose another), verify the invite, then tell me when confirmed → HubSpot Demo Booked.
Never auto-booked by the agent.
```

## HubSpot logging (required)

For **every** handled reply:

1. Log **inbound** prospect email on the contact (and company when known) if not already present.
2. After each successful **outbound** reply send → log email engagement (same dedup rules as `sales-gmail-send`: subject + ±few minutes).
3. English CRM language for notes/stage hints.
4. If log fails after Gmail succeeded: report; do not resend.

## Voice & posting rules (unchanged)

- Senior sales pro (20–30 years). Peer-to-peer. Same story as the sequence.
- Consistency phrasing: “haven’t been posting consistently” — never “I saw your post yesterday/Friday”.
- One post does not kill the angle; skip frequent posters as leads (already handled upstream).
- No em-dash spam; calm, short, oral. Match prospect language when they wrote in Dutch.
- No LinkedIn API/send. No Lemlist. No auto-book.

## Prefer session tools

Gmail (read replies + send) · HubSpot (log) · Slack (Floor ping) · Google Calendar **read-only for slot suggestions** when connected. Calendar **create/send** stays off unless Floor explicitly asks after Slack (see `sales-demo-book`).

## Digest

```text
# Reply → demo — <date>
Replies pulled: <n> · BOOK NOW: <n> · NOT YET: <n> · NO: <n> · CONFUSED: <n>
Slack Floor (BOOK NOW): <n> · E2/E3 cancelled: <n> · Kept scheduled: <n>
HubSpot logged (in/out): <n>/<n>
```

## Never

- Auto-create calendar events or silent Ludwig invites.
- Treat politeness / “sounds interesting” as BOOK NOW.
- Demo-push NO or CONFUSED.
- Cancel E2/E3 on NOT YET solely for soft interest.
- Expand send/setup, Lemlist, or LinkedIn send.
- Overwhelm Floor — one digest + drafts she can approve.

## Done when

Each inbound Dutch-batch reply is classified, acted on per table above, HubSpot-logged, and BOOK NOW leads have Slack + 2 slots + no auto-book.
