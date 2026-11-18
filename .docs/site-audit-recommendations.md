# Hinkart site audit: recommendations and improvement plan

## Context
You asked for a full-project check with `modern-web-guidance` and recommendations for the site and the codebase.
- `legacy-scan src` returned **0 findings** (52 rules, 38 guides). That scan only covers about 20% of the guidance catalog.
- I then audited the code by hand against these guides: `performance`, `forms`, `tabs`, `lazy-load-video-and-audio`, `visually-stable-font-fallbacks`, `consistent-cross-document-transitions` and `search-hidden-content`.

The code base is in reasonable shape: modern CSS (oklab, `interpolate-size`, `details-content`, `name` on `<details>`, `dvh`/`lvh`), `prefers-reduced-motion` in menu and logo, and `inert` while the menu is open. The real problems are page weight, broken semantics in shared components, scripts that don't re-run under `<ClientRouter />`, and missing SEO and legal basics.

Findings are ordered by impact. Each phase can ship on its own.

---

## Phase 1: Bugs and launch blockers (do first)

1. **`Button.astro` always renders `<a>`.** `href == '' && href == null` can never be true. So the menu toggle and the booking **Submit** are `<a href="">`, not buttons: the form can't submit natively, and "disabled" buttons can still get keyboard focus (`menu.ts` works around this with `role=button`).
   → Use `<button type={submit|button}>` when there's no `href`. Use the real `disabled` attribute on buttons. Make `formSubmit` `type="submit"`. Then drop the `role` patch in `src/scripts/menu.ts:24`.
2. **Scripts run once under the ClientRouter.** `tabs.ts`, `bookingForm.ts`, `followCursor.ts`, `fileupload.ts`, `studio.ts`, `button.ts`, `RadioButton.ts` and the inline script in `InputField.astro` all run once, at module load. If you go Home → Aftercare → elsewhere → Aftercare, tabs and hover images stop working.
   → Wrap each script's setup in an `init()` and register it with `document.addEventListener('astro:page-load', init)`, as `index.ts` and `artists.ts` already do. Clean up listeners on `astro:before-swap`.
3. **The footer links to pages that don't exist.** `/legal-notice` and `/data-privacy` return 404. The booking form collects personal data and file uploads from EU/NL visitors, so a privacy page is legally required (GDPR).
4. **The gift card form posts to `webhooktest.net` with the default GET** (`src/pages/giftcards.astro:89`). Personal data ends up in the URL and goes to a test service.
   → Use `method="post"` and the real production endpoint.
5. **Content bugs.**
   - `han.md`: the bio says "Hika", the email is `hika@`, and "Portugese" is misspelled.
   - Footer address: "Osterstraat" should be "Oosterstraat", and "9711 en" should be "9711 EN".
   - `src/pages/faq/question.md` is lorem ipsum and is published as the live route `/faq/question`.
6. **Booking form fields.**
   - `required` is never passed to `InputField`.
   - No `autocomplete` values (`name`, `email`).
   - The `console.log` calls are still in (`InputField.astro:55`, `fileupload.ts:24`).
   - The counter uses `keyup`; it should use `input`.
   - `inputMaxLength != NaN` is always true.
   - `bookingForm.ts` imports Astro internals (`astro/virtual-modules/transitions-events.js`), which can break on any Astro update.

## Phase 2: Performance (largest wins)

| Asset | Now | Fix | Expected |
|---|---|---|---|
| Aftercare meme GIFs (`src/assets/images/memes`) | **32 MB** | Convert to muted looping `<video autoplay muted loop playsinline>` (WebM + MP4), or to animated WebP/AVIF. Add `loading="lazy"` / `preload="none"`: they only appear on hover. | ~1–3 MB |
| `NotoSansJP-VariableFont_wght.ttf` | **8.7 MB** | Subset to the ~40 kana actually used (nav, buttons, titles) with `pyftsubset`/`glyphhanger` → WOFF2 | ~10–20 KB |
| Atkinson ×4 TTF | 224 KB | Convert to WOFF2 with `format('woff2')`. Preload only Regular and Gore with `crossorigin`. | ~100 KB |
| Hero video WebM 1080p | 4.8 MB | Add a smaller mobile encode via `<source media="(width < 64rem)">`. Preload the poster with `fetchpriority="high"` (the guide says to do this when video is the LCP element). Add `width`/`height`. | -50% on mobile |
| Artist videos | 0.5–1.1 MB each | `preload="none"` + `loading="lazy"` on off-screen slides. Add `playsinline` in `Artist.astro`. | |

Other performance items:
- Dropzone's CSS is `@import`ed into `global.css`, so every page loads it. Import it only in `FileUpload.astro`.
- `gore.css` duplicates the `@font-face` in `global.css`. Delete it.
- `IconLink` `<img>` has no `width`/`height`/`alt=""`.
- Add `font-size-adjust: from-font` on `html` to reduce CLS when fonts swap.
- Turn on Astro's `prefetch` (`prefetch: { prefetchAll: true }`) so the ClientRouter navigations feel instant.

## Phase 3: Accessibility and semantics

- **No page has an `<h1>`** except the artist pages. `Heading.astro` draws its title as SVG `<text>`. Wrap it in a real `<h1>` (keep the SVG `aria-hidden`, and put the text in the heading or a visually hidden span).
- **Duplicate IDs**:
  - `filter id="rough"` appears 6× on `/booking` (BookingForm plus every `MultiStep`).
  - `displacementShadow` repeats per `Button`, and `displacementFilter` per `Heading`.
  - → Define each filter once in `SvgFilter.astro`, which is already in the layout, and reference it from there.
- **`Artist.astro` has several problems:**
  - It nests a second `<main>` inside the layout's `<main>`.
  - It uses `<side>`, which is not an element; it should be `<aside>`.
  - The tablist mixes `role="tab"` onto links (mail, Instagram) and a "Booking" div.
  - Some `aria-controls` point to the wrong IDs.
  - The icon links have no accessible name.
  - → Keep only real tabs as `<button type="button">` with `aria-selected`. Move the links out of the tablist and give them `aria-label`. Hide inactive panels with `hidden="until-found"` and a `beforematch` sync, so find-in-page and SEO can still reach the bio and FAQ.
- **Aftercare tabs (`Tabs.astro`, `tabs.ts`)** use `<a href="#…">`. Initial `hidden`/`aria-selected` state is set only by JS, so all panels flash until the script runs. `aria-labelledby="tabs-title"` points to nothing.
  - → Render the initial state in HTML and switch to buttons. Add a non-color selected indicator; the `*` already helps.
- **Multi-step booking:**
  - Move focus to the new step's heading on Continue.
  - Expose progress with `aria-current="step"` in `BookingStepIndicator`.
  - Add a Back button.
  - Hidden steps already use `display:none`, which is fine.
- **Validation:** don't keep Continue disabled to block validation. Let users submit and show errors: validate on `:user-invalid` or blur, then focus the first invalid field.
- **Spam:** both forms post straight to webhooks. Add a honeypot field.
- **Alt text on aftercare** is wrong or duplicated: "Sonic mmm" on the scratch GIF, "You got this" ×4, and "Studio team" on the aftercare photo. The GIFs are decorative and hover-only, so use `alt=""`. Touch users never see them, so either show them inline on mobile or accept that.
- **The aftercare layout** uses fixed `-ml-64`, `ml-96` and `pr-16` with no breakpoints, so it is likely broken below `lg`. Check it on mobile.
- Add `aria-current="page"` on the active nav link. `navButton.ts` sets a visual state; make it set the attribute too.

## Phase 4: SEO and sharing

- `Layout.astro` hardcodes `<title>Hinkart Tattoo Studio</title>` on every page.
  - → Add `title` and `description` props plus `<meta name="description">`, `<link rel="canonical">` built from `Astro.site` and Open Graph/Twitter tags with an OG image.
- Add `@astrojs/sitemap` and `public/robots.txt`.
- Add `TattooParlor`/`LocalBusiness` JSON-LD (address, Instagram, email) to the layout. This matters for "tattoo Groningen" local search.
- Think about Dutch: the site is in NL but `lang="en"` only. Astro i18n routing can be a later step.

## Phase 5: Project hygiene

- **Content collections live in `src/pages`.** `artists/*.md` uses `layout:` frontmatter, and the `artists` collection reads from the same folder.
  - → Move it to `src/content/artists/`. Add `src/pages/artists/[slug].astro` with `getStaticPaths` + `getCollection`, which gives typed data instead of `Astro.props.frontmatter`.
  - Move the FAQ there too and delete `src/pages/faq/`.
- **Delete dead code**, since git keeps history:
  - `src/pages/_bak/`, `src/pages/_dev/`
  - `layouts/Template.astro`, `layouts/Debug.astro`
  - Commented-out Newsletter/Reviews
  - Empty `class:list={[]}`
  - Unused vars in `BookingForm.astro`
- **Two lockfiles** (`package-lock.json` + `pnpm-lock.yaml`): pick one package manager.
- **Fill in `package.json`.** `description` is the template text and `main`/`license` are leftovers. Add `"check": "astro check"` and a `lint`/`format` script. `prettier-watch` uses `onchange`, which isn't installed.
- **Replace the starter `README.md`** with real setup, deploy and webhook notes.
- **Untracked folders** (`.agents/`, `.hermes/`, `data/skills`, `skills-lock.json`): either commit them or add them to `.gitignore`.
- **Type safety:** `tabs.ts` and `bookingForm.ts` are untyped (implicit `any`, unchecked `querySelector`). Run `astro check` and fix what it reports.
- **Branch:** you're working on `master`, but the main branch is `main`. Reconcile the two.

---

## Suggested order and critical files
1. Phase 1: `src/components/ui/Button.astro`, `src/scripts/*.ts` (page-load init), `src/components/layout/Footer.astro`, `src/pages/giftcards.astro`, `src/components/form/InputField.astro`, plus the new `src/pages/legal-notice.astro` and `data-privacy.astro`.
2. Phase 2: the asset conversions (meme GIFs, font subset/WOFF2, mobile hero encode), `src/styles/global.css`, `src/pages/aftercare.astro`, `src/components/FollowCursor.astro`, `src/pages/index.astro`.
3. Phase 3: `src/components/Heading.astro`, `src/components/SvgFilter.astro`, `src/layouts/Artist.astro`, `src/components/Tabs.astro`/`TabTitle.astro`/`TabPanel.astro`, `src/scripts/tabs.ts`, `src/scripts/bookingForm.ts`.
4. Phase 4: `src/layouts/Layout.astro`, `astro.config.mjs`.
5. Phase 5: `src/content.config.ts`, the content move, cleanup.

Reuse what's already there:
- The `astro:page-load` pattern in `src/scripts/index.ts:121`.
- The reduced-motion handling in `src/scripts/menu.ts:18`.
- The shared `SvgFilter.astro`, which is already mounted in `Layout.astro`.

## Verification
- `astro dev --background`, then click through every page with ClientRouter navigation: Home → Aftercare → Booking → back. Tabs, the hover GIFs, the input counter and booking steps must keep working after soft navigation.
- `npx astro check` with 0 errors, then `astro build`. Compare `dist/` size before and after; the target is dropping by about 35 MB+.
- Lighthouse/PageSpeed on `/`, `/aftercare` and `/booking`: LCP, CLS, accessibility score, and no duplicate-ID warnings.
- Keyboard-only run of the booking form: Tab order, focus moving between steps, a real submit, and validation errors.
- Re-run `npx -y modern-web-guidance@latest legacy-scan src --json` on the changed files and confirm it still reports 0.
- Check the footer links and the gift card submit in DevTools Network: POST to the production endpoint.
