---
name: sales-sequence-draft
description: Write personal multichannel sequences (run by Lemlist) for Dutch HubSpot leads and quality-gate them — automatic mode, ⚠️ when unsure — profile visit + like latest post + invite → ONE personal email (same day) → LinkedIn message as soon as they accept → LinkedIn follow-up 2 days later. Senior voice, one story arc, stop on any reply.
---

# sales-sequence-draft

**Floor path (Nov 2026):** HubSpot note → warm up on LinkedIn → **one** personal email → the follow-ups happen on **LinkedIn**, because that’s more personal than more emails → any reply stops everything.

## Persona (hard)

Write as a **sales professional with 20–30 years experience**. Calm, specific, peer-to-peer. Never AI-ish, never junior, never a feature dump. **Personal over generic** — Floor likes personalized messages.

## Story arc (hard rule) — one thread only

1. **Open** with the HubSpot-note insight (vacancy / consistency / visibility / etc.).
2. Develop **one** tension that logically follows that insight.
3. Soft **Willow bridge** that continues the *same* story — never pivot to an unrelated product angle.
4. Short CTA (curious / open to chat) — not a demo pitch dump.

The LinkedIn messages continue the same story as the email. Never restart with a new random angle.

### Consistency / LinkedIn posting (Floor-corrected)

- Phrase: **“I see you haven’t been posting consistently”** — **never** “I saw your post yesterday/Friday” (or any single-post callout).
- **One** recent post does **not** invalidate the inconsistent-posting angle.
- If they post **frequently** (strong / polished presence) → **bad lead** — skip / don’t follow up (existing strong-presence disqualifier).
- **Do not** live-check LinkedIn vs notes every run — trust HubSpot notes. LinkedIn research only when notes are thin or Floor asks.

### BAD vs GOOD

| | |
|---|---|
| **BAD** | Vacancy opener → sudden Willow “content calendar”. **Or** “I saw your post on Friday…” **Or** a second and third cold email. |
| **GOOD** | “I see you haven’t been posting consistently…” → one tension → soft Willow on same thread → then a personal LinkedIn message that refers back to the email. |

## CRM style learning (once per session / batch)

Before drafting: pull Floor’s **past HubSpot sent emails** for tone + apply feedback playbook.

## The sequence (hard)

The person to contact is the one in the HubSpot note (often the CEO / founder / managing partner).

| Day | Step | Who writes it | Rule |
|---|---|---|---|
| 0 | **Visit profile** | automatic (Lemlist) | — |
| 0 | **Like latest post** | automatic (Lemlist) | Skip it if the latest post is old, sensitive or off-topic. |
| 0 | **Connection request + note** | agent (quality gate) | **≤200 characters** (Lemlist limit, variables included). Name + firm + the one angle. No pitch, no link. |
| 0 | **The email** (the only one) — right after the invite | agent (quality gate) | Why we’re reaching out, from the HubSpot note: insight → one tension → soft Willow bridge → short CTA. PS: “I also sent you a connection request on LinkedIn.” |
| on accept | **LinkedIn message** | agent (quality gate) | **As soon as the invite is accepted** (Lemlist waits up to 14 days) and no reply. “Thanks for connecting — I also sent you an email, reaching out here as well because …” + **one** easy question. |
| +2 days | **LinkedIn follow-up** | agent (quality gate) | 2 days later if still no reply. One more thought on the same story + “worth a short chat, or is the timing off?” |

- **Max 1 email.** No email follow-ups — follow up on LinkedIn.
- **Stop on any reply** — LinkedIn or email — at any point. Lemlist stops the lead; mirror with `record_reply`, then `sales-reply-demo`.
- Invite not accepted → no LinkedIn messages (Lemlist can’t message non-connections). The email still goes out.
- **No LinkedIn URL in HubSpot** → just the one email. Don’t scrape to find the URL unless Floor asks.

**Automatic mode (default since 20 Nov 2026):** no per-line approval — every lead goes through the **quality gate** below; passing leads go straight to `sales-lemlist-push`, uncertain ones get **⚠️** and wait for Floor. Spec: [docs/AUTOMATIC-MODE.md](../../docs/AUTOMATIC-MODE.md).

Reply classes: **no** → close · **interest** → Slack Floor + conversation · **confused / don’t understand** → gracious short reply + HubSpot log + **no demo**. The consistency angle stays valid for other leads.

## When it runs

- **Automatically:** the weekday 08:00 Cowork task (Task 1 in `START-HERE-FLOOR.md`) — 15 leads/day the first week, then 30/day.
- **On request:** “Run another batch now.” / “Write 5 more leads.” — same rules, same quality gate.

## Research / send rules

- Prefer HubSpot notes; LinkedIn research OK when thin / asked — not every run.
- **Lemlist** runs every step (`sales-lemlist-push` via Floor’s Lemlist connector). **Gmail** only if Lemlist’s email sender is down. No other LinkedIn automation.
- Dutch leads only (NL primary); skip Belgian leads in the pilot.

## Quality gate (replaces per-line approval)

A lead goes out only if **all** of these hold — otherwise mark it **⚠️** with the reason and hold it for Floor:

1. The person is the **decision maker** named or clearly implied in the HubSpot note (not a team leader by default).
2. All **5 texts** are filled: `connectNote`, `emailSubject`, `emailBody`, `linkedinMessage`, `linkedinFollowup`.
3. Invite note **≤200 characters**; LinkedIn messages 2–3 lines, one question.
4. **Correct first name + company** in every text; Floor’s signature in the email.
5. **No invented facts** — every claim comes from the HubSpot note, the company’s own public pages, or Willow’s public claims.
6. **Never** a single-post callout (“I saw your post yesterday”); no pitch that breaks the story (e.g. vacancy → content calendar).
7. A normal **`linkedin.com/in/…`** profile link — or none (then email-only, and say so). No Sales Navigator links.
8. Thin note, unclear company fit, or anything that feels off → **⚠️**.

## Guardrail

```text
HubSpot (newest first, ≤2 months) → never-contacted + do-not-contact + Lemlist dedup
  → ONE story → invite note · the email · LinkedIn msg · LinkedIn follow-up
  → quality gate: pass → sales-lemlist-push (max 20/day with LinkedIn) · unsure → ⚠️ for Floor
  → Lemlist: d0 visit · like · invite · email → msg on accept → follow-up +2 days
  → reply on either channel? stop ALL → Slack Floor
```

## Report file

Save each run as `approve-queue/<date>-auto.md` (Floor reads it with “show me today's texts”):

```text
# Automatic run — <date> · <n> sent · <n> ⚠️ waiting

| # | Company | Contact | Status | Story | LinkedIn steps |
|---|---------|---------|--------|-------|----------------|
| 1 | Acme NL  | Jan (CEO) | sent to Lemlist | vacancy→hiring trust | yes |
| 2 | Beta BV  | Eva (Partner) | ⚠️ thin note — waiting for Floor | — | — |

(full texts per lead below)
```

## Drafting checklist

1. One insight from the HubSpot note; one tension; soft Willow on the same thread.
2. Exactly one email; LinkedIn messages refer back to it and stay on the same story.
3. Never content-calendar pivot on a vacancy story.
4. Consistency phrasing: “haven’t been posting consistently” — never a single-post date callout; skip frequent posters.
5. Invite note ≤200 chars, no pitch; LinkedIn message ends in one question.

## Done when

- Invite note + 1 email + 2 LinkedIn messages per lead, one story, senior and personal.
- Every lead either passed the quality gate and went to `sales-lemlist-push`, or is marked ⚠️ with a reason for Floor.
- Report saved in `approve-queue/` and summarised in Slack.
