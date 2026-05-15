@AGENTS.md

# WRD Photography Portfolio — Project Context

## What This Project Is
A personal photography portfolio for WRD Photography, based in Phnom Penh, Cambodia. Displays street, rural, landscape, and portrait photography. Content is managed via Sanity CMS. Deployed on Vercel.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) + React 19.2.4 |
| Language | JavaScript only — no TypeScript |
| CMS | Sanity v5 + next-sanity v12 |
| Animation | GSAP 3.15 + ScrollTrigger plugin |
| Styling | Tailwind CSS v4 (import only) + CSS custom properties via inline styles |
| Fonts | Google Fonts via `next/font`: Manrope, Libre Caslon Display, JetBrains Mono |
| Deployment | Vercel |
| Testing | None |

---

## Architecture

- **Single route** — `/` is the entire app. No Next.js page routing used for navigation.
- **Three "pages"** — Featured, Gallery, About — toggled via `activePage` state in `app/page.js`
- **Page transition** — GSAP `clip-path` reveal (`page-clip--in` CSS animation) + opacity/translateY fade
- **Data flow** — `page.js` fetches all data once via `Promise.all` → props passed down to page components
- **All components are `'use client'`** — no server components in `app/components/`
- **Pages are lazy-loaded** via `next/dynamic` with `{ ssr: false }` to keep GSAP client-only
- **Sanity Studio** embedded at `/studio/[[...tool]]/page.jsx`

---

## Key Files
| File | Role |
|---|---|
| `app/page.js` | Root: intro animation, data fetch, page state, navigation logic |
| `app/layout.js` | Font loading, metadata, HTML shell |
| `app/globals.css` | CSS vars (dark/light themes), `page-clip` keyframe, scrollbar |
| `app/components/Nav.js` | Fixed nav, hide/show on mouse proximity, dark/light theme toggle |
| `app/components/FeaturedPage.js` | Fullscreen vertical slideshow with GSAP transitions |
| `app/components/GalleryPage.js` | Scroll gallery: horizontal street strip, masonry rural/landscape, portrait grid |
| `app/components/AboutPage.js` | About: hero, philosophy, collage, approach grid, CTA |
| `app/components/Cursor.js` | Custom cursor dot + lagging ring via GSAP |
| `app/components/Lightbox.js` | Fullscreen photo viewer with GSAP open/close + keyboard nav |
| `sanity/lib/queries.js` | All GROQ queries — featured, all photos, gallery hero, about page |
| `sanity/lib/client.js` | Sanity client config |
| `sanity/lib/image.js` | `urlFor()` image URL builder |
| `sanity/schemaTypes/photo.js` | Photo schema: title, image, location, series, featured, date, writeup, order |
| `sanity/schemaTypes/siteSettings.js` | Gallery hero image schema |
| `sanity/schemaTypes/aboutPage.js` | About page hero + collage images schema |

---

## Conventions — Follow These Always

### Styling
- **All styling is inline `style={{}}`** — no Tailwind utility classes inside components
- **Always use CSS vars** for colors and fonts — never raw hex or font names:
  - Colors: `var(--accent)`, `var(--dark)`, `var(--mid)`, `var(--cream)`, `var(--muted)`, `var(--text)`, `var(--border)`, etc.
  - Fonts: `var(--font-mono)`, `var(--font-sans)`, `var(--font-garamond)` (alias for `--font-display`)
- Add new design tokens to `:root` and `[data-theme="light"]` in `globals.css`

### GSAP
- **Import GSAP dynamically inside `useEffect`** — `const { gsap } = await import('gsap')` — to avoid SSR issues
- Exception: `Cursor.js` and `FeaturedPage.js` import at top-level (they are `ssr:false` or already client-only)
- **Always register plugins** before use: `gsap.registerPlugin(ScrollTrigger)`
- **`initedRef` guard** — use `if (initedRef.current) return; initedRef.current = true` to prevent double-init in scroll pages
- **Kill ScrollTrigger instances** in `useEffect` cleanup: `ScrollTrigger.getAll().forEach(t => t.kill())`

### React patterns
- **`mounted` flag** in all async `useEffect` to guard against state updates after unmount
- **`fmt(n)`** helper for zero-padded numbers — `n < 10 ? \`0${n}\` : \`${n}\``
- All GROQ queries live in `sanity/lib/queries.js` — never inline in components
- `urlFor(image).width(W).quality(Q).url()` for all Sanity image URLs

### Components
- All new page-level components go in `app/components/`
- Mark `'use client'` at top of every component file
- Load new pages via `next/dynamic` with `{ ssr: false }` in `page.js`

---

## Sanity Data Model

### `photo` document
Fields: `title` (required), `image` (required, hotspot), `location`, `series` (street | rural | landscape | portraits), `featured` (boolean), `date`, `writeup`, `order`

### `galleryHeroPhoto` document
Fields: `title`, `description`, `credit`, `location`, `galleryHeroImage`

### `aboutPage` document
Fields: `heroImage`, `collageImages[]`

---

## Known Issues / Tech Debt

| Severity | Issue |
|---|---|
| MEDIUM | Hard-coded Unsplash fallback URLs in `AboutPage.js:187-189` — should use local or Sanity assets |
| MEDIUM | Email `hello@wrdphoto.com` hard-coded in `AboutPage.js:392` — should come from Sanity |
| MEDIUM | Social links in About footer are `href="#"` — not wired to real URLs |
| MEDIUM | `landscape` filter in `GalleryPage.js:45-49` has no branch — falls through to `all` |
| LOW | Duplicate `onMouseEnter` on `← Prev` button in `Lightbox.js:243` — second handler wins |
| LOW | Portraits section labeled `03` in `GalleryPage.js:630` — same number as Landscape |
| LOW | `body { font-weight: 800 }` in `globals.css` — unusually heavy baseline |
| LOW | `next.config.mjs` is empty — no `images.domains` set |
| LOW | No tests of any kind |
