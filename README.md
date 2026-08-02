# Holiday Games

A lightweight, mobile-first family holiday games site. One daily challenge, one scorekeeper enters everyone's results, and the group can view them — no rankings, just fun.

## Quick start

```bash
npm install
cp .env.example .env.local   # set FAMILY_PIN and Redis credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your PIN.

## Editing challenges

Edit [`data/holiday.json`](data/holiday.json) — dates and daily challenges. Redeploy after changes.

## Managing players

Use **Manage players** in the header (or go to `/setup`) to add, edit, or remove family members, pick emojis, and mark them as kid or grown-up.

Players and results sync across all devices via Redis.

Default players from `holiday.json` are used only the first time, before anyone visits setup.

## Deploy to Vercel

1. Push this repo to GitHub and import in [Vercel](https://vercel.com).
2. Add a **Redis** integration from the Vercel Marketplace (Upstash Redis).  
   This automatically sets `KV_REST_API_URL` + `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`).
3. **Manually add** the `FAMILY_PIN` environment variable in Vercel:
   - Go to your project → Settings → Environment Variables
   - Add `FAMILY_PIN` with your chosen PIN value (e.g., `1234`)
   - This is separate from Redis — it's a plain environment variable for authentication
4. Deploy and share the URL + PIN with your family.

## Local development

Set the Redis credentials in `.env.local`:

```
FAMILY_PIN=1234
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

You can use your Vercel/Upstash Redis instance for local development, or create a separate Upstash database.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- Upstash Redis (via @vercel/kv)
- JSON config for challenges
