# Sales Generator — Vercel production (Floor pilot)

**Public URL:** https://sales-generator-delta.vercel.app  
**Alt alias:** https://sales-generator-karansingh2427.vercel.app  
**Dashboard:** https://vercel.com/karansingh2427/sales-generator  
**Latest deploy:** https://vercel.com/karansingh2427/sales-generator/2tTzQC1XoC7GNQJhi2ugyaGKPiNo

## What was deployed

| Item | Value |
|---|---|
| Tip branch | `cursor/deploy-vercel-3406` (feedback-learning @ `3ff7f85` + Vercel `/tmp` persistence) |
| Stack tip | HubSpot sequences → skill pack → Floor feedback learning |
| HubSpot mode | **Mock** (no `HUBSPOT_ACCESS_TOKEN`) |
| SSO / Deployment Protection | Disabled — public URL, no Vercel login |
| Framework | Next.js |

## Persistence note (serverless)

Local `.data/` is read-only on Vercel. Runtime writes go to `/tmp/sales-generator-data` (`src/lib/data-dir.ts`). State is **ephemeral across cold starts** — fine for Floor’s first mock pilot; not durable CRM storage.

## Floor click-through (mock pilot)

1. Open **https://sales-generator-delta.vercel.app**
2. Confirm header shows **mock** HubSpot (no live token required).
3. **Leads** — seed BE/NL sample list (Belgium-first scoring).
4. **HubSpot** tab → **Sync** — pulls mock company notes (why / opener / right contact); Peeters & peers appear.
5. Pick a lead → **Build sequence** — LinkedIn connect → wait → follow-up → email drafts (approve → mark sent; no auto-blast).
6. **Feedback** tab → Remember e.g. “Skip company Peeters Accountants” → Sync again / draft sequence and confirm skip applies.
7. Optional: per-lead **Teach agent** on the Leads table.

## Ops

```bash
cd ~/Projects/karansingh2427/sales-generator
npx vercel --prod --yes          # redeploy from current checkout
# If CLI auth expires:
npx vercel login
```

GitHub auto-deploy not required for this pilot; CLI production deploys were used.
