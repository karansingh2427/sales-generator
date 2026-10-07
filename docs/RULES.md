# Rules — BDR + AI conduct

These rules govern human and agent operators. Violations are **invalid** scenarios in [tests/evals.json](../tests/evals.json).

## Outreach & sequence rules

1. **No outreach to disqualified leads** — including **strong social presence** (Floor disqualifier).
2. **Dutch pilot channel** — **Gmail email sequences only**. No LinkedIn API send. No Lemlist (Willow does not have it). Web-app types may still include LinkedIn kinds for legacy; default playbook is email day 0 + follow-ups.
3. **Every draft includes rationale** — CRM why-good / opener / opportunity angles (`scoreLeadRationale` / sequence engine).
4. **One story arc** — open with HubSpot-note insight → one tension → soft Willow bridge on the *same* story → short CTA. Never pivot (e.g. vacancy → random content calendar). Emails 2–3 continue the same thread.
5. **Senior voice** — write as a sales pro with 20–30 years experience; calm, peer-to-peer; never AI-ish or feature dump. Once per batch, learn tone from Floor’s past HubSpot sent emails + feedback playbook.
6. **CTA** — Email 1 = curious / open to chat (soft). Ludwig intro ok by Email 3. When they agree, **Slack Floor** (include conversation) — she books Ludwig’s calendar manually. Do not promise pricing or legal outcomes.
7. **No fabricated case studies** — use only Willow public claims (expertise firms, EU/GDPR, coaching) and only when they continue the same story.
8. **Approve → Gmail send** — draft → Floor **approves** → agent sends via **Gmail** (`sales-gmail-send`) → mark sent. Unattended send without approve is invalid.
9. **Sequence mark_sent** without prior **approve_step** is invalid for message steps.
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
9. **Dutch pilot batch:** Dutch HubSpot tasks in bulk → Gmail email approve queue → approve/edit/skip → **Gmail send** via Cowork. No LinkedIn API. No Lemlist.

## Skill pack rules

1. Skills live under `skills/*/SKILL.md` and are mapped from [AGENTS.md](../AGENTS.md).
2. `sales-hubspot-pull` must instruct NL-first pulls and company notes.
3. `sales-sequence-draft` must draft **Gmail** sequences and require approve before send.
4. `sales-gmail-send` sends only **approved** email steps via Gmail; never LinkedIn API or Lemlist.
5. `sales-reply-demo` classifies Dutch-batch Gmail replies as **BOOK NOW / NOT YET / NO / CONFUSED**; politeness ≠ BOOK NOW; never auto-book; HubSpot-log inbound + outbound.
6. `sales-demo-book` must Slack Floor (with conversation), never auto-book Calendar, and use the three post-demo outcomes after she books Ludwig. BOOK NOW from reply-demo is the preferred trigger.
7. Orchestrator `sales-lead-run` may compose the skills — it must not bypass HITL, geo lock, Gmail-only channel, or the Slack→Ludwig handoff.
8. `sales-feedback-learn` persists structured feedback; pull/draft/lead-run **must** load active feedback.
9. Feedback never bypasses draft → approve → Gmail send.
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
