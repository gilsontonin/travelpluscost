# Lighthouse Best Practices

Apply these patterns to every blog post and page. Established after the first
Lighthouse audit of `/blog/best-time-to-visit-hawaii/` (Jun 2026).

---

## 1. Performance

### Images (biggest LCP / CLS impact)

**Rule: the first image in every post must not be lazy-loaded.**

The markdown renderer in `lib/markdown.ts` tracks image index automatically:
- `img[0]` → `loading="eager" fetchpriority="high"` (LCP element)
- `img[1+]` → `loading="lazy"` (standard)

**Rule: every image needs explicit `width` and `height` HTML attributes.**

Pexels URLs support `?w=1200&h=800` — the renderer extracts these and emits
`width="1200" height="800"` on the `<img>` tag. This prevents CLS.

**Rule: request WebP and a `srcset` from Pexels.**

Always use this URL format for Pexels images in post bodies:
```
https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1200&h=800
```
The renderer generates a 640w / 960w / 1200w srcset automatically from the `w` param.

**Rule: alt text describes the image content + the primary keyword naturally.**

```md
![Luxury beach picnic setup at Ko Olina at sunset on Oahu](https://images.pexels.com/...)
```

---

### Preconnect (reduces DNS + TLS latency for LCP)

In `app/layout.tsx` the following are already set globally and must not be removed:

```html
<link rel="preconnect" href="https://images.pexels.com" />
<link rel="dns-prefetch" href="https://images.pexels.com" />
<link rel="dns-prefetch"  href="https://fonts.gstatic.com" />
```

The blog post page (`app/blog/[slug]/page.tsx`) also generates a per-post:
```html
<link rel="preload" as="image" href="{firstImageUrl}" fetchPriority="high" />
```
via `extractFirstImageUrl()` in `lib/markdown.ts`.

---

### Defer non-critical client JS

Components that only need interactivity after load (scroll-triggered, modals,
non-critical widgets) must be loaded via the `BackToTopLoader` pattern:

```tsx
// components/BackToTopLoader.tsx — client component wrapper
"use client";
import dynamic from "next/dynamic";
const Widget = dynamic(() => import("./Widget"), { ssr: false });
export default function WidgetLoader() { return <Widget />; }
```

This keeps the initial JS bundle lean and defers hydration cost.

---

### Client component scope

Keep `"use client"` as narrow as possible:
- `Header.tsx` → client (for mobile nav toggle + scroll border)
- `BackToTop.tsx` → client, but loaded dynamically via `BackToTopLoader`
- All other layout/page components → server components (no client JS)

---

### A note on Performance 100

The Lighthouse warning *"Chrome extensions negatively affected this page's load
performance"* is real — extensions (Quillbot, Capital One Shopping, Adobe Acrobat)
added ~2,200ms of TBT that is not our code. **Always run Lighthouse in incognito
mode** to get an accurate score. With extensions disabled, expected score: 85–95+.

True 100 Performance would require eliminating React's hydration cost entirely
(i.e., shipping zero client JS), which is incompatible with the Next.js App Router
architecture we use. The optimisations above push the score as high as Next.js allows
for a dynamic-capable static export.

---

## 2. Accessibility — Contrast

**All interactive and readable text must pass WCAG AA (4.5:1 normal, 3:1 large).**

The header background is `bg-soft/80` = `#f4f8ff` → effective contrast base ≈ L 0.944.

### Approved colour pairings (verified)

| Use | Class / Value | Hex | Contrast on soft bg | WCAG |
|---|---|---|---|---|
| Body text | `text-slate` | `#5a6577` | 6.2:1 | ✓ AA |
| Small labels | `text-slate` | `#5a6577` | 6.2:1 | ✓ AA |
| Links, buttons | `text-brand-700` | `#1f54e0` | 5.7:1 | ✓ AA |
| Eyebrow text | `text-brand-700` | `#1f54e0` | 5.7:1 | ✓ AA |
| Prose links | CSS var `#1f54e0` | `#1f54e0` | 5.7:1 | ✓ AA |
| White on button | `bg-brand-700 text-white` | bg `#1f54e0` | 7.9:1 | ✓ AA |
| Logo "Hawaii" | inline `#186e80` | `#186e80` | 6.3:1 | ✓ AA |
| Logo "by Wember" | inline `#7a4d00` | `#7a4d00` | 7.4:1 | ✓ AA |

### What NOT to use for text

| Class | Hex | Why it fails |
|---|---|---|
| `text-brand-600` | `#2f6bff` | 4.5:1 on white (right on boundary, fails on tinted bg) |
| `text-slate-light` | `#8b94a3` | ~3:1 on white — fails for small text |
| `text-seafoam` | `#57bccc` | 2.2:1 on white — fails all text |
| `text-gold` | `#dda53a` | ~3.2:1 on white — fails for small text |

**Rule:** Use `brand-600` only for decorative elements (icon colours, borders, shadows).
Use `brand-700` for any text or interactive element that requires contrast.

---

## 3. Best Practices — Security Headers

Security headers are configured in three files — update all three when the CSP changes.

| File | When it applies |
|---|---|
| `public/serve.json` | `npm run serve` local preview |
| `vercel.json` | Vercel deployment |
| `netlify.toml` | Netlify deployment |

### Current CSP policy

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' https://images.pexels.com data: blob:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**`unsafe-inline` is required** for Next.js static exports (the framework emits
inline hydration scripts). This is a known limitation of static Next.js. It means
the "CSP effective against XSS" Lighthouse heuristic will still show a warning,
but the header itself is present and will be scored positively for Best Practices.

**When to update the CSP:**
- You add a new external image CDN → add to `img-src`
- You add an analytics script (e.g. GA4) → add domain to `script-src` and `connect-src`
- You add a payment provider → add to `script-src` and `connect-src`

### Always include these additional headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload  (HTTPS only)
```

### Third-party cookies (known limitation)

Pexels sets a `SameSite` cookie when their CDN serves images. This will log a
"cookie issues" entry in the Chrome DevTools Issues panel. The only fix is to
self-host images rather than hotlink Pexels. Once the Pexels API key is added to
`.env`, implement a download-and-serve workflow that stores images in `public/img/`
and removes external CDN dependencies.

---

## 4. Per-page Checklist (run before every publish)

- [ ] First image: no lazy, has fetchpriority="high", has width/height, WebP
- [ ] Remaining images: lazy, width/height, WebP srcset
- [ ] All text colours use the approved pairings table above
- [ ] Eyebrow uses `text-brand-700` (not `text-brand-600`)
- [ ] Buttons with white text use `bg-brand-700` (not `bg-brand-600`)
- [ ] External links have `rel="noopener noreferrer" target="_blank"`
- [ ] CSP in all three header files allows any new external domains
- [ ] Run Lighthouse in incognito → target 90+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO
