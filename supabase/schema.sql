-- travelpluscost — scale framework schema (run once in Supabase → SQL Editor).
-- Two tables: hotels (the lightweight "phone book" of every property) and posts (SEO blog that
-- links into inventory). Full hotel content + live rates are fetched from LiteAPI on demand, NOT
-- mirrored here — so this stays small enough to hold every hotel in the US, then the world.

-- Fuzzy text search for name/city autocomplete.
create extension if not exists pg_trgm;

-- ── Hotels directory (thin index) ───────────────────────────────────────────
create table if not exists public.hotels (
  id            text primary key,          -- LiteAPI hotel id (e.g. lp1e13c)
  name          text not null,
  slug          text,                      -- url slug (name + city + id-suffix)
  city          text,
  state         text,                      -- US state / market label
  country       text,                      -- ISO-2, lowercase
  lat           double precision,
  lng           double precision,
  stars         real,                      -- property class 0–5
  rating        real,                      -- guest rating /10
  review_count  integer,
  thumbnail     text,                      -- one image url for cards
  updated_at    timestamptz not null default now()
);

create index if not exists hotels_name_trgm on public.hotels using gin (name gin_trgm_ops);
create index if not exists hotels_city_idx   on public.hotels (lower(city));
create index if not exists hotels_country_idx on public.hotels (country);
create index if not exists hotels_geo_idx     on public.hotels (lat, lng);          -- bounding-box geo
create index if not exists hotels_slug_idx    on public.hotels (slug);

-- Amenity flags for city-hub grouping ("pool/spa hotels in {city}"). Backfilled by
-- scripts/enrich-amenities.mjs (one LiteAPI /data/hotel call per hotel). Run this once:
alter table public.hotels add column if not exists amenities text[];
create index if not exists hotels_amenities_idx on public.hotels using gin (amenities);

-- AI-sentiment review highlights ("Friendly staff", "Great location") for honest social proof on
-- cards. Backfilled per-city by scripts/blog/backfill-pros.mjs (LiteAPI /data/hotel sentiment_analysis.
-- pros). No index — selected for display, never filtered. Run this once:
alter table public.hotels add column if not exists pros text[];

-- `images`: up to 6 LiteAPI photos per hotel (hero first) for the blog SHOWCASE swipable gallery.
-- Backfilled per-city by scripts/blog/backfill-images.mjs. No index — selected for display only. Run once:
alter table public.hotels add column if not exists images text[];

-- ── Blog posts (SEO content wired to inventory) ─────────────────────────────
create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  excerpt          text,
  body             text,                   -- markdown
  cover_image      text,
  meta_description text,
  status           text not null default 'draft',   -- 'draft' | 'published'
  author           text default 'travelpluscost',
  published_at     timestamptz,
  -- the content → booking funnel: a post can point at a city/country and specific hotels
  related_city     text,
  related_country  text,
  related_hotel_ids text[] default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists posts_published_idx on public.posts (status, published_at desc);
create index if not exists posts_city_idx       on public.posts (lower(related_city));

-- ── Row-level security ──────────────────────────────────────────────────────
-- Server (secret key) bypasses RLS for ingest/admin. These policies only govern public/anon reads.
alter table public.hotels enable row level security;
alter table public.posts  enable row level security;

drop policy if exists hotels_public_read on public.hotels;
create policy hotels_public_read on public.hotels for select using (true);

drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts for select using (status = 'published');
