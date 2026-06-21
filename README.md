# travel-booking

A US hotel-search site (flights later) — built in public as an SEO experiment and a showcase.

**Model:** affiliate-first, merchant-ready. v1 searches hotels and hands off to partners (no
checkout, no liability). The own-checkout path (LiteAPI book) and the flights vertical (Duffel) are
architected in but **feature-flagged off** until traffic justifies the legal/ops cost.

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, SSR + ISR) |
| Hosting | Vercel |
| Database | Supabase (Postgres) — hotel content |
| Search | Typesense — geo autocomplete + faceted search |
| Rate cache | Upstash Redis — short-TTL live-rate cache |
| Hotel data + rates | LiteAPI |
| Affiliate (v1 $) | Travelpayouts / CJ |
| Flights (later) | Duffel |

## Getting started

```bash
cp .env.example .env.local   # fill in keys (see below)
npm install
npm run dev                  # http://localhost:3000
```

### Environment

Copy `.env.example` → `.env.local` and fill in. `.env.local` is gitignored; only the template is
committed. The app builds with empty values (Phase 0) — `requireEnv()` throws at runtime only when a
missing secret is actually used.

Accounts to provision (all have free tiers): **LiteAPI**, **Supabase**, **Typesense**, **Upstash**,
**Travelpayouts**.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Feature flags

- `NEXT_PUBLIC_BOOKING_MODE` — `affiliate` (default) or `merchant`
- `NEXT_PUBLIC_FLIGHTS_ENABLED` — `false` (default) until the flights phase

## Roadmap

Phase 0 foundations → 1 ingestion (LiteAPI → Postgres → Typesense) → 2 search UX → 3 property pages →
4 programmatic SEO → 5 measure & scale → 6 (later) merchant checkout + Duffel flights.
