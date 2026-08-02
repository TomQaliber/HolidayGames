# Holiday Games

A lightweight, mobile-first family holiday games site. One daily challenge, one scorekeeper enters everyone's results, and the group can view them — no rankings, just fun.

## Quick start

```bash
npm install
cp .env.example .env.local   # set FAMILY_PIN
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your PIN.

## Editing challenges

Edit [`data/holiday.json`](data/holiday.json) — dates and daily challenges. Redeploy after changes.

## Managing players

Use **Manage players** in the header (or go to `/setup`) to add, edit, or remove family members, pick emojis, and mark them as kid or grown-up. Players are saved to Redis (production) or `.data/players.json` (local dev).

Default players from `holiday.json` are used only the first time, before anyone visits setup.

## Deploy to Vercel

1. Push this repo to GitHub and import in [Vercel](https://vercel.com).
2. Add a **Redis** integration from the Vercel Marketplace (Upstash Redis).  
   Accept either `KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.  
   Without Redis, the site still loads, but players/results will not persist on Vercel.
3. Set environment variable `FAMILY_PIN` in the Vercel project settings.
4. Deploy and share the URL + PIN with your family.

## Local development without Redis

If `KV_REST_API_URL` is not set, results are stored in `.data/results.json` on disk automatically.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- Vercel KV / Upstash Redis (production)
- JSON config for challenges
