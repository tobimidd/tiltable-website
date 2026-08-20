# Tiltable — marketing site

A static 5-page pitch/demo site. Plain HTML5 + Tailwind CSS (via CDN) +
vanilla JS — no build step, no npm install. Double-click `index.html` (or
any other page) and it works.

## Structure

```
index.html              Product — hero, 3-step flip story, features, business case
dashboard.html           Fleet dashboard — HTML/CSS mockup + live simulated demo
service.html              Server wearable — section logic + smartwatch demo
design.html                 Design gallery — reference image archive + lightbox
waitlist.html                 Waitlist signup form

assets/
  css/style.css              all shared styles, design tokens, components
  js/
    main.js                  shared: nav scroll state, mobile menu, scroll-reveal,
                              PRODUCT_NAME constant
    hero.js                  index.html only — Three.js rotating device + the
                              3-step scroll-triggered flip cards
    dashboard.js              dashboard.html only — live floor-plan demo simulation
    service.js                 service.html only — smartwatch call demo
    gallery.js                   design.html only — image data, masonry grid, lightbox
    waitlist.js                   waitlist.html only — form validation + submission
  fonts/                        self-hosted Inter .woff2 files (300/400/500/600)
  reference/                       your source reference images (shown on design.html)

NAMING.md                  naming alternatives considered ("Tiltable" is the current pick)
README.md                    this file
```

Each page repeats the same nav/footer markup and the same small Tailwind
`tailwind.config` block in its `<head>` — there's no templating layer in a
plain static site, so that duplication is intentional. Edit all five files
if you change the nav/footer structure itself.

## Renaming the product

"Tiltable" is written directly into the HTML copy everywhere — titles,
headlines, nav, footer. It's also used, lowercased, as the prefix for CSS
variables and Tailwind color keys (`--tiltable-green`, `bg-tiltable-green`,
etc.) throughout `style.css` and every page's inline Tailwind config. A full
rename needs both cases, across HTML, CSS and JS, e.g. from the project
root:

```bash
grep -rl "Tiltable" *.html assets/css assets/js | xargs sed -i '' 's/Tiltable/YourName/g'
grep -rl "tiltable" *.html assets/css assets/js | xargs sed -i '' 's/tiltable/yourname/g'
# (drop the '' after -i on Linux/GNU sed)
```

Also update:

- The `PRODUCT_NAME` constant near the top of `assets/js/main.js` — used
  anywhere JS itself generates text that mentions the product.
- The `<title>` and `og:title` / `og:description` tags in each page's
  `<head>` — a find-and-replace already swaps the name in them, but it's
  worth a quick read-through since some of those lines are written as full
  sentences, not just "Tiltable + suffix."

The lowercase CSS/JS rename is cosmetic — the site works fine even if it's
skipped — but keeping it in sync avoids a codebase that still says
"tiltable" under the hood after the brand has moved on. See `NAMING.md` for
alternative names that were considered.

## Brand color

One CSS variable is the source of truth: `--tiltable-green` at the top of
`assets/css/style.css` (`:root` block). `--tiltable-green-deep` is the same
hue, deepened so it still passes text-contrast when used on buttons —
update both together if you change the hue. Every page's Tailwind config
reads `tiltable.green` / `tiltable.deep` / `tiltable.soft` from these same CSS
variables, so nothing else needs to change.

## Adding or replacing design gallery images

`assets/js/gallery.js` starts with a `GALLERY_ITEMS` array — one object per
image, with `src`, `alt`, `caption` and `tag`. The masonry grid, the tag
filter row, and the lightbox are all generated from this array at runtime
(static HTML can't read a directory, so there's no way to auto-discover
files). To add, remove or reorder images:

1. Put the image file in `assets/reference/`.
2. Add (or remove) its entry in the `GALLERY_ITEMS` array.

That's the only place you need to touch.

## Connecting the waitlist endpoint

`assets/js/waitlist.js` starts with:

```js
const WAITLIST_ENDPOINT = "[replace-with-form-endpoint]";
```

Left as-is, the form runs in **demo mode**: full client-side validation
still runs, but submitting just simulates a short delay and shows the
success state — nothing is sent over the network.

To go live, set `WAITLIST_ENDPOINT` to a URL that accepts a `POST` with a
JSON body (`name`, `email`, `restaurant`, `tables`, `consent`,
`submittedAt`):

- **Formspree** — create a form at formspree.io and use the endpoint it
  gives you (`https://formspree.io/f/xxxxxxxx`). Their standard endpoints
  accept a JSON POST as-is.
- **Tally** — Tally is built around its own hosted form/embed flow rather
  than accepting arbitrary JSON POSTs. Either swap this form for a Tally
  embed/redirect instead, or point `WAITLIST_ENDPOINT` at a small
  serverless function (Cloudflare Worker, Vercel/Netlify function, etc.)
  that forwards the payload to Tally's API.
- **Google Forms** — Google Forms expects
  `application/x-www-form-urlencoded` data keyed by each field's entry ID,
  not JSON. Either change the `fetch(...)` call in `waitlist.js` to build a
  `URLSearchParams` body with your form's real entry IDs, or proxy through
  a small serverless function the same way as Tally.
- **Your own backend** — point it at any endpoint that accepts the JSON
  POST and returns a 2xx status; no other changes needed.

## Fonts

Inter (weights 300/400/500/600) is self-hosted as `.woff2` files in
`assets/fonts/`, loaded via `@font-face` in `style.css` with
`font-display: swap` and a system-font fallback stack. This is why
typography renders correctly even opened straight from disk with no
internet connection — only Tailwind's CDN script and (on index.html) the
Three.js CDN script need network access; the page still reads fine without
them, just without their styling/3D render.

To add more weights or italics, fetch more `.woff2` files (e.g. via Google
Fonts' `css2` endpoint with a modern browser user-agent string to get the
`latin` subset specifically) into `assets/fonts/` and add matching
`@font-face` blocks.

## Demo simulations

- **Dashboard live demo** (`assets/js/dashboard.js`) — constants at the top
  of the file (`TABLE_COUNT`, `MAX_CONCURRENT`, `SPAWN_MIN_MS`/`MAX_MS`,
  `AUTO_SERVE_MIN_MS`/`MAX_MS`) control how many tables exist, how often
  calls spawn, and how long a call stays active before auto-resolving if
  nobody clicks "Mark served."
- **Service wearable demo** (`assets/js/service.js`) — `AUTO_CLEAR_MS`
  controls how long a simulated call stays up before auto-clearing; it also
  fires once automatically the first time the module scrolls into view, so
  passive visitors see it work without clicking anything.

Both are fully client-side and fake — no real devices, network calls, or
backend involved.

## Hero device render

`assets/js/hero.js` builds the rotating device entirely procedurally in
Three.js (core build, loaded from a CDN `<script>` tag in `index.html`) —
there's no 3D model or texture file being loaded, so nothing breaks when
the page is opened via `file://`. It auto-rotates slowly, pauses on hover,
and can be dragged. If WebGL isn't available (or the CDN script fails to
load, e.g. no internet), `.hero-stage` gets a `no-webgl` class and a
CSS-only fallback puck (defined in `style.css`) shows instead.

## Browser support note

The stylesheet uses `color-mix()` and the site relies on Tailwind's Play
CDN — both want a reasonably current browser (2023 or newer: Chrome/Edge
111+, Safari 16.4+, Firefox 113+). That's a fair assumption for a pitch
site you're opening on your own machine, not a constraint for a public
production deployment.
