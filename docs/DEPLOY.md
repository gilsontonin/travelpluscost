# DEPLOY — go live + tie travelpluscost.com

This is a **Next.js 16 dynamic SSR app** (NOT a static export like the Hawaii site — there's no `out/`
folder here; routes render on the server and call LiteAPI per request). Both **Netlify** and **Vercel**
run it. These steps need **your** login (interactive), so an agent can't finish them — but they're quick.

**Which host?** Either works. **Netlify is recommended if you already use it** (one account, familiar)
— it supports Next SSR via the official Next runtime plugin (auto-added on detect; dynamic routes become
Netlify Functions). **Vercel** is marginally smoother for Next (first-party) — use it if you prefer.

## Step 1 — push to GitHub (one time, both hosts)
The repo is committed locally with **no remote yet**. Create an empty repo, then push:

```bash
# 1. On github.com: create an EMPTY repo "travelpluscost" (no README/.gitignore/license).
# 2. Then, in the project:
export PATH="$HOME/.local/node/bin:$PATH"
cd /Users/gilsontonin/travelpluscost
git remote add origin git@github.com:gilsontonin/travelpluscost.git
GIT_SSH_COMMAND='ssh -p 443 -o Hostname=ssh.github.com -o StrictHostKeyChecking=accept-new' \
  git push -u origin main
```
(SSH-over-443 because this network blocks port 22.)

## Env vars (set these on whichever host you pick)
| Key | Value |
|---|---|
| `LITEAPI_KEY` | production key (copy from `.env.local`) |
| `LITEAPI_SANDBOX` | sandbox key (for later real test bookings) |
| `LITEAPI_ENV` | `production` |
| `LITEAPI_BASE_URL` | `https://api.liteapi.travel/v3.0` |
| `NEXT_PUBLIC_SITE_URL` | `https://travelpluscost.com` |
| `NEXT_PUBLIC_BOOKING_MODE` | `affiliate` |
| `NEXT_PUBLIC_FLIGHTS_ENABLED` | `false` |

## Step 2A — Netlify (recommended if you already use it)
1. app.netlify.com → **Add new site → Import an existing project** → GitHub → pick `travelpluscost`.
2. Netlify **auto-detects Next.js** and adds the Next runtime plugin (`@netlify/plugin-nextjs`). Build
   command `npm run build`, publish dir is handled by the plugin. **Do NOT set `output: export`** and
   **don't** set the publish dir to `out/` — this app is SSR, not static.
3. **Site settings → Environment variables** → add all the keys above.
4. **Deploy.** You get a `*.netlify.app` URL — test it.

> CLI alternative: `npx netlify-cli deploy --build` (then `--prod`), after `npx netlify-cli link`.

## Step 2B — Vercel (alternative)
1. vercel.com → **Add New → Project → Import** `gilsontonin/travelpluscost`.
2. Framework preset **Next.js** (auto). Defaults are fine.
3. Add the env vars above (Production + Preview).
4. **Deploy** → `*.vercel.app` URL.

> CLI alternative: `npx vercel` then `npx vercel --prod`; env via `npx vercel env add`.

## Step 3 — tie the domain travelpluscost.com
In your host's dashboard → **Domains → Add** `travelpluscost.com` (and `www`). It shows the exact DNS
records to set at your registrar:
- **Netlify:** either point your registrar's nameservers to Netlify DNS, OR add an `A`/`ALIAS` record per
  Netlify's panel (apex → Netlify's load balancer IP; `www` → your `*.netlify.app`).
- **Vercel:** `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com`.

Use whatever the panel shows (authoritative). DNS propagates in minutes–hours; HTTPS auto-provisions.

## Step 4 — verify
- `https://travelpluscost.com` loads home.
- Search "Oahu" → real hotels → open one → Reserve → confirm → confirmation screen.
- `NEXT_PUBLIC_SITE_URL=https://travelpluscost.com` is set (canonical/OG URLs).

## Notes
- Every push to `main` auto-deploys; PRs get preview URLs (great for the YouTube series).
- Images use plain `<img>` from `static.cupid.travel` (no host image-config needed). If you switch to
  `next/image`, add that host to `images.remotePatterns` in `next.config.ts`.
- Booking is demo/no-charge — safe to have live. Don't enable real payment until the
  merchant/Seller-of-Travel phase (BUSINESS-PLAN.md §7).
