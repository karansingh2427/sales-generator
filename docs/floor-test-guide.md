# Floor — quick test guide (Sales Generator)

**App:** https://sales-generator-delta.vercel.app  
**Who:** Floor Hoefkens (Willow BDR) · **Pilot:** Dutch-first pilot — Netherlands primary, Belgium secondary — NL/BE only  
**Mode:** Mock HubSpot for this URL (no login / no API token). Live HubSpot stays in your Claude/Cursor session later.

---

## What this tool is for

Your lead-gen agent already drops **company notes** in HubSpot (why good / opener / right contact). This app helps you:

1. Pull those leads (mock sync here)  
2. Draft **LinkedIn + email** sequences (instead of cold-calling everyone)  
3. (Live Cowork) When a lead wants a demo → Claude **Slacks you** with the conversation → **you book Ludwig** manually  
4. Teach the agent with **feedback** so the next run remembers

Nothing auto-sends. Nothing auto-books Calendar. You always **Approve** before **Mark sent**.

---

## 5-minute click-through

### 1. Open the app
Go to **https://sales-generator-delta.vercel.app**  
Confirm it says HubSpot is in **mock** mode.

### 2. Sync leads
- Open the **HubSpot** (or Sync) action  
- Click **Sync**  
- You should see NL/BE sample companies with notes (why / opener / right contact)

### 3. Build a sequence
- Pick a Belgian or Dutch lead  
- **Build sequence** (or similar)  
- You get steps like: LinkedIn connect → message → wait → follow-up → email  
- Edit if you want → **Approve** → **Mark sent** (simulates that you sent it yourself)

### 4. Teach the agent
- Open the **Feedback** tab  
- Example: *“Skip company Peeters Accountants”* or *“Prefer Partners at law firms”*  
- Click **Remember**  
- Sync or build a sequence again — the skip/preference should apply  

Or use the **Teach agent** control on a single lead.

### 5. Demo handoff (live skills — not this mock URL)
- On the website, bookings UI is mock-only.
- In Cowork: lead wants demo → Slack ping with **conversation** → you book **Ludwig** → then set **Demo Booked / Completed / Rescheduled / Cancelled**

---

## What to tell Karandeep after testing

Please note anything that felt wrong:

- Wrong ICP / titles / countries  
- Tone of LinkedIn or email drafts  
- Companies that should always be skipped  
- Missing fields from your real HubSpot company notes  
- Whether you’d want **draft-only** forever or true auto-send later  

You can dump that into the **Feedback** tab (best) or WhatsApp Karandeep.

---

## Limits of this Vercel pilot

| OK for pilot | Not on this URL yet |
|---|---|
| Mock HubSpot + sequences + feedback | Your real HubSpot data |
| NL/BE sample leads | Sales Nav live API |
| Approve → mark sent | Auto-send from LinkedIn/email |
| Ephemeral memory (may reset on sleep) | Durable CRM of record |

**Live HubSpot:** use Cursor/Claude skills in the session where HubSpot is already connected (`sales-hubspot-pull` → `sales-sequence-draft` → `sales-demo-book`, or `sales-lead-run`).

---

## One-line ask for you

Open the link → Sync → draft one sequence → leave one piece of Feedback → reply to Karandeep if anything should change before we wire your real HubSpot.
