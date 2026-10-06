# Floor — quick test guide (Sales Generator)

**App:** https://sales-generator-delta.vercel.app  
**Who:** Floor Hoefkens (Willow BDR) · **Pilot:** Dutch-first — Gmail cold sequences from HubSpot notes  
**Mode:** Mock HubSpot for this URL. Live path = Claude Cowork (HubSpot + Gmail + Slack).

---

## What this tool is for

Your lead-gen agent already drops **company notes** in HubSpot. Those notes are **background**. The agent **personalizes the full Gmail sequence** from that note only (no LinkedIn/website re-scrape):

1. Pull Dutch HubSpot tasks / leads (mock sync here)  
2. Draft **Gmail** sequences — max **3** emails, ~1 week between if no reply  
3. (Live Cowork) **Approve** → Claude sends via **Gmail**  
4. Interest → Claude **Slacks you** with the conversation → **you book Ludwig**  
5. Teach tone with **feedback** (“remember how I write”)

Pilot: approve before Gmail send. Nothing auto-books Calendar. No Lemlist. No LinkedIn send.

---

## 5-minute click-through (website mock)

### 1. Open the app
https://sales-generator-delta.vercel.app — confirm HubSpot **mock** mode.

### 2. Sync leads
- Sync → NL/BE sample companies with notes (why / opener / right contact)

### 3. Build a sequence
- Pick a Dutch lead → **Build sequence**
- You should see **Email 1 / wait ~1 week / Email 2 / wait / Email 3** (Gmail, max 3)
- Edit → **Approve** → **Mark sent** (UI simulator; live Cowork uses real Gmail)

### 4. Teach the agent
- Feedback tab: *“Remember how I write: warmer, shorter”* or *“Skip company Peeters Accountants”*

### 5. Demo handoff (live skills — not this mock URL)
- Interest → Slack you with **conversation** → you book **Ludwig** → Demo Booked / Completed / Rescheduled / Cancelled

---

## Live Cowork prompts

See [START-HERE-FLOOR.md](../START-HERE-FLOOR.md) and [floor-open-in-cowork.md](./floor-open-in-cowork.md).
