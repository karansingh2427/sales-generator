# Floor feedback learning — how to teach Sales Generator

**For:** Floor Hoefkens (BDR @ Willow)  
**Product rule:** Belgium first, NL second, BE+NL only · draft → approve → mark sent (feedback never auto-sends)

Sales Generator remembers your steering on ICP, companies, tone, disqualifiers, geo, and sequence quality — then applies it on the **next** HubSpot pull, sequence draft, or lead-run.

---

## How to submit feedback

### 1. UI — Feedback tab

1. Open Sales Generator → **Feedback** tab.
2. Pick a **category** (ICP, company, tone, title preference, …).
3. Optionally name a **company target**.
4. Write the rule in plain language, e.g.:
   - `Skip company Acme Legal`
   - `Prefer Partner titles`
   - `Never pitch pricing`
   - `BE ICP: Ops manager for larger cos`
   - `Warmer tone, less salesy on LinkedIn`
5. Click **Remember this feedback**.

### 2. UI — Teach agent (per lead)

On the Leads table, click the graduation-cap icon on a row → edit the note → **Remember feedback**. Useful for “skip this firm” or “wrong contact forever.”

### 3. Cursor / Claude skill

Say any of:

- **“Remember this feedback: skip company X”**
- **“Teach the agent: prefer Ops manager titles”**
- **“Never pitch Z on LinkedIn”**

That runs `sales-feedback-learn` and saves structured memory (category, target, text, timestamp, source).

---

## What gets stored

| Field | Example |
|---|---|
| category | `company` / `icp` / `messaging_tone` / … |
| target | optional company / lead |
| text | your free-text note |
| instruction | structured when clear (`skip_company`, `prefer_title`, `never_pitch`, …) |
| timestamp | ISO |
| source | `ui` · `skill` · `teach_lead` |
| active | on/off |

**Files:** `.data/feedback.json` (local, not git) · optional promote copy `skills/memory/FEEDBACK.md` for Claude sessions without the web API.

---

## How the next run uses it

| Run | Applies |
|---|---|
| HubSpot sync / `sales-hubspot-pull` | Skip listed companies; prefer preferred titles; ICP/geo notes; DQ patterns |
| Sequence generate / `sales-sequence-draft` | Tone + never-pitch injected into drafts; skipped firms blocked |
| Outreach draft | Same skip + never-pitch |
| `sales-lead-run` | Loads memory in preflight, shows digest, then pull → draft → book |

**Still required:** you approve every message, send it yourself, then mark sent. Feedback does **not** unlock auto-send.

---

## See / disable / delete

- Feedback tab lists all learned rules.
- **Disable** = keep history but stop applying.
- **Delete** = remove permanently.
- Skill: “Show my learned feedback” / “Disable that feedback.”

---

## Promote to skills memory (optional)

If you use Claude/Cursor without the Next.js API:

1. `GET /api/feedback?format=markdown` (or copy from Feedback tab).
2. Paste active entries into `skills/memory/FEEDBACK.md`.
3. Skills read that file when `.data/feedback.json` is empty.

---

## Examples that work well

| You say | Effect next run |
|---|---|
| Skip company Peeters Accountants | Firm DQ’d / omitted from sync working set |
| Prefer Partner titles | Partners float to top of pull |
| Never pitch pricing | Drafts scrub “pricing” |
| Warmer tone | Guidance attached to sequence rationale |
| BE ICP: Ops manager for larger cos | ICP memory in digests + drafts |

Geo lock still wins — feedback cannot add countries outside Belgium + Netherlands.
