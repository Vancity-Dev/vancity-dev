# Vancity Dev — Claude Context

## Project
SvelteKit 2 + Svelte 5 + TypeScript. Cloudflare Workers via `@sveltejs/adapter-cloudflare`.
Git branch is `master` (not main). CI/CD: Cloudflare Workers Builds auto-deploys on push.

## Commands
- `npm run dev` — local dev server at http://localhost:5173
- `npx playwright test tests/` — e2e tests (webServer starts automatically, no manual dev server needed)
- `npx tsc --noEmit` — TS type check (.svelte imports invisible here; use `npx svelte-check` for full check)
- `npx wrangler deploy` — manual deploy (CI handles it on push)
- `git push origin master` — triggers Cloudflare Workers Builds
- Do NOT run `prettier --write` over the repo: `.prettierrc` says `useTabs: true` but the source is 2-space throughout, so `npm run lint` is already red on ~73 files and a format pass rewrites every one of them. Match the file you are editing
- This sandbox ships an older Chromium than the pinned `@playwright/test` wants; `npx playwright install chromium chromium-headless-shell` once per container fixes the e2e run

## Architecture
- All global CSS tokens in `src/app.css` (--bg, --ink, --accent, --warm, --line, --serif, --sans, --mono)
- Brand hex values (for static assets that can't use CSS vars): --bg #f4f1ea (cream), --ink #1a2a26 (dark green), --accent #2d4f3f, --warm #c97a4a
- Global classes: `.btn`, `.btn.ghost`, `.container`, `.reveal` (scroll animation), `.sec-head`
- Root layout (`src/routes/+layout.svelte`) is minimal — only loads `app.css`
- Marketing pages live in `src/routes/(marketing)/` route group (has NavBar, cursor, scroll-reveal)
- Demo pages live in `src/routes/demo/[client]/` — no NavBar, no cursor

## Demo Subdomain System
- `src/hooks.ts` — `reroute`: `*.vancity.dev` → `/demo/[slug]` (routing only, does NOT change event.url)
- `src/hooks.server.ts` — `handle`: sets `locals.demo = slug` from hostname (needed because event.url stays as original)
- `src/lib/demos/index.ts` — registry; add new demo configs here
- Each demo page: `src/routes/demo/[slug]/+page.svelte` — uses CSS vars from parent layout palette
- Palette injection: inline `style` on `.demo-root` div (not :root — keeps demo scoped)

## Prospect Site Templates
- Admin creates a prospect at `/admin/prospects/new`; the Industry picker chooses the template. The site is then live at `<slug>.vancity.dev`
- `src/lib/prospects/types.ts` — `IndustryKey` union; `src/lib/templates/index.ts` — the `industries` registry both the picker and `/site` read
- One folder per industry: `types.ts` (the Content interface), `derive.ts` (prospect row → content), `defaults.ts` (the showcase), `<Name>Site.svelte`. Roots are scoped: `.op-root`, `.df-root`, `.el-root`, `.cpa-root`
- Shared derive helpers live in `plumbing/derive.ts` and are exported from there (`toTelHref`, `clean`, `uniqueTowns`, `joinAmp`/`joinAnd`, `postalFor`, `isCanadianRegion`). A new template imports what it needs and keeps the rest local — `defense/derive.ts` is the minimal example
- Showcases: `/p` (plumbing), `/p/defense`, `/p/electrical`, `/p/accounting` — fictional firms with every optional block filled, all `noindex`
- **Adding an industry**: a key in `IndustryKey`, a label in `industries`, the four files above, an `if` in `/site/+page.server.ts`, an `{:else if}` in `/site/+page.svelte`, a `/p/<industry>` showcase, and the new root selector in `tests/helpers/contrast.ts`
- **Template photos**: `/admin/images` uploads one photo per slot. The slots, with their on-page location text, live in `src/lib/templates/photos.ts` (`photoSlots`) — add a slot there and it appears in the admin. Bytes sit in D1 (`template_images`, migration 0002; the page downsizes client-side, server caps at 1.5 MB and sniffs magic bytes, no SVG), are served publicly at `/template-media/<industry>/<slot>` (exempted in `reroute` so prospect hosts reach it), and reach templates through the optional `photos` prop via `loadSitePhotos` in `/site` and `/p/*` loads. Photos are per template, not per prospect. A new template slot also needs the `{#if photos.x}` branch in its Site component
- A prospect row only carries company, city, region, phone and nearby areas. Everything verifiable — licence, rating, review count, named people, address, email, software — is a nullable content field that `derive.ts` leaves **null**. Never invent one: a fabricated licence or Google rating on a real firm's prototype is a liability, not a placeholder. `PlumbingSite.spec.ts` / `AccountingSite.spec.ts` enforce this with a deny-list sweep over the rendered markup
- Accounting only: `sampleProof` (true for a derived prospect, false for the showcase) marks the stand-in prices, testimonials and case stories as samples
- Accounting only: the template is bilingual by jurisdiction. `isCanadianRegion(region)` picks `'CA'` (CRA, T1/T2, RRSP, instalments, SIN) or `'US'` (IRS, 1040/1120-S, estimates, SSN). The wording map and both deadline tables are in `AccountingSite.svelte` — `UPDATE YEARLY`, and confirm the dates against the revenue agency before a client site goes live
- `templates/cpa-firm/` (repo root, outside `src/`) is the standalone static HTML/CSS version of the accounting template, with `{{TOKEN}}` placeholders and its own README. The Svelte component is a port of it; changes worth keeping should land in both
- Clearing a form's inline errors on `blur` moves the submit button between mouse-down and mouse-up, so the click misses it. Revalidate on `oninput` instead (`AccountingSite.svelte`)

## Svelte 5 Gotchas
- `<svelte:head>` cannot be inside `{#if}` blocks — put it at component top level with internal guards
- Use `onclick` not `on:click` for event handlers
- `$props()` for typed component props; `$state()` for reactive vars; `$derived()` for computed
- When converting a styled `<a>` to `<button>`, reset browser defaults: `border: none; cursor: pointer` — easy to miss if the class was shared

## Demo Routes — Known Gotchas
- `app.css` sets `cursor: none` globally (for marketing custom cursor) — demo layouts MUST set `cursor: auto` on `.demo-root` or the OS cursor disappears
- When a demo uses its own CSS var names (e.g. `--ivory`, `--gold`), map them from palette vars using `:global(.demo-root) { --ivory: var(--bg); --gold: var(--accent); }` in the page's `<style>`
- Large design reference HTML files are not covered by the `/design` gitignore entry — add them explicitly or move them into `/design/`

## Wrangler Config
- Asset binding uses `[assets]` + `binding = "ASSETS"` (not the old `[site]` format)
- Wildcard subdomain routing requires two `[[routes]]` entries: `*.vancity.dev` AND `*.vancity.dev/*`
- Wildcard CNAME (`* → @`, proxied) must be set manually in Cloudflare DNS dashboard
- `send_email` binding also needs manual activation: CF dashboard → Workers & Pages → Worker → Settings → Email
- D1 binding `DB` (database `vancity-prospects`, holds the prospects table): run `npx wrangler d1 create vancity-prospects` once per environment and paste the returned `database_id` over the placeholder in `wrangler.toml`. Deploys fail until this is done (the placeholder id doesn't resolve), so do it BEFORE merging to master
- Cloudflare Access: create an application by hand in the Zero Trust dashboard covering `vancity.dev/admin` AND `vancity.dev/admin/*` (a `/admin/*` pattern may not match bare `/admin`), apex only. `src/lib/admin-guard.ts`, called from `handle` in `hooks.server.ts` so it covers actions and endpoints as well as pages, only checks the host is allowlisted (apex/localhost; `www` and `workers.dev` get 403) and the `Cf-Access-Jwt-Assertion` header is present (defence in depth), it does not replace the policy. Disable the `workers.dev` route since Access cannot cover it (CF dashboard → the Worker → Settings → Domains & Routes). Follow-up once the Access app and its AUD tag exist: verify the JWT signature/`aud`/`iss`/expiry against the team JWKS in the guard (not done yet)
- Migrations live in `migrations/`; apply locally with `npx wrangler d1 migrations apply vancity-prospects --local`, and to the real database with `--remote` (the default without a flag is local)

## Cloudflare Built-in Modules (`cloudflare:*`)
- NEVER statically import `cloudflare:email` (or any `cloudflare:*`) at the top of server files — Node.js throws `ERR_UNSUPPORTED_ESM_URL_SCHEME` during Vite SSR build
- Fix: dynamic import inside the function — `const { EmailMessage } = await import(/* @vite-ignore */ 'cloudflare:email')`
- Ambient type declarations for `cloudflare:*` must go in a separate `.d.ts` file with no `export {}` (not inside `app.d.ts`)
- `ssr.external` in vite.config does NOT fix this in Vite 8/rolldown — dynamic import is the only solution
- Local `npm run build` may hit `EBUSY` on Windows at the adapter cleanup step — Cloudflare CI (Linux) is unaffected
