# DEPLOY — go live + tie travelpluscost.com

The app is a standard Next.js 16 SSR app → **Vercel** is the path of least resistance. These steps need
**your** login (interactive), so an agent can't finish them for you — but they're quick.

## Step 1 — push to GitHub (one time)
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
(SSH-over-443 is used because this network blocks port 22.)

## Step 2 — import to Vercel
1. vercel.com → **Add New → Project → Import** `gilsontonin/travelpluscost`.
2. Framework preset: **Next.js** (auto-detected). Build command/output: defaults.
3. **Environment Variables** — add (Production + Preview):

| Key | Value |
|---|---|
| `LITEAPI_KEY` | (production key — copy from `.env.local`) |
| `LITEAPI_SANDBOX` | (sandbox key — for later real test bookings) |
| `LITEAPI_ENV` | `production` |
| `LITEAPI_BASE_URL` | `https://api.liteapi.travel/v3.0` |
| `NEXT_PUBLIC_SITE_URL` | `https://travelpluscost.com` |
| `NEXT_PUBLIC_BOOKING_MODE` | `affiliate` |
| `NEXT_PUBLIC_FLIGHTS_ENABLED` | `false` |

4. **Deploy.** You'll get a `*.vercel.app` URL — test it.

> Alternative (no GitHub): `npx vercel` in the project folder, follow prompts, then
> `npx vercel --prod`. Set the same env vars via `npx vercel env add`.

## Step 3 — tie the domain travelpluscost.com
In Vercel: **Project → Settings → Domains → Add** `travelpluscost.com` (and `www.travelpluscost.com`).
Vercel shows the exact DNS records to set at your registrar. Typically:

| Type | Name | Value |
|---|---|---|
| `A` | `@` (apex) | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

(Use whatever Vercel's panel shows — it's authoritative.) Add those at the registrar where you bought
`travelpluscost.com`. DNS propagates in minutes–hours; Vercel auto-provisions HTTPS.

## Step 4 — verify
- `https://travelpluscost.com` loads the home page.
- Search "Oahu" → real hotels → open one → Reserve → confirm → confirmation screen.
- Set `NEXT_PUBLIC_SITE_URL=https://travelpluscost.com` (already above) so canonical/OG URLs are correct.

## Notes
- Every push to `main` auto-deploys (production); PRs get preview URLs (great for the YouTube series).
- The image host `static.cupid.travel` is loaded via plain `<img>` (no Vercel image config needed). If
  you switch to `next/image`, add it to `images.remotePatterns` in `next.config.ts`.
- Booking is still demo/no-charge — safe to have live. Don't enable real payment until the
  merchant/Seller-of-Travel phase (see BUSINESS-PLAN.md §7).
