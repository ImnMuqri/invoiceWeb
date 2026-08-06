# InvoKita landing page — "KIRIM"

Art direction, colour system, asset swap points and SEO map for the marketing
page at `/` (English) and `/ms` (Bahasa Malaysia).

---

## 1. The argument the page makes

**Promise:** *InvoKita sends the invoice, then chases it on WhatsApp until it's
paid — so you stop being the person who has to ask.*

The ICP does not have an invoicing problem. They already make invoices, in Word
or Canva or on a paper pad. What breaks them is the fourth follow-up message to
a client they don't want to annoy. So the page sells relief from the awkward
conversation, not "billing software".

Section order follows the objection list, not a template. Every section exists
to kill one specific objection:

| # | Section | Component | Objection it answers |
|---|---|---|---|
| 1 | Hero | `LandingHero` | — (promise, mechanism, one CTA, one proof) |
| 2 | The thread | `LandingStory` | "A robot reminder will make me look cold" |
| 3 | Three steps | `LandingSteps` | "Setting this up is an afternoon I don't have" |
| 4 | Getting paid | `LandingPayments` | "Can my customer pay it? Is my money safe?" |
| 5 | Chaser log | `LandingChaser` | "Does it actually do anything unattended?" |
| 6 | Feature bento | `LandingBento` | "What am I actually buying?" |
| 7 | Pricing | `LandingPricing` | "What does it cost, really?" |
| 8 | FAQ | `LandingFaq` | residual objections + `FAQPage` schema |
| 9 | Close | `LandingClose` | — (one CTA, no new information) |

There is no "Features" grid, no "Why choose us", and no logo carousel. They were
cut because they answer nothing.

---

## 2. Art direction

**KIRIM** — Malay for *to send*.

**Type**
- `Plus Jakarta Sans` (variable 400–800) — UI and body. Drawn for a Southeast
  Asian typographic context, geometric-humanist, wide Latin coverage.
- `Instrument Serif` — used **exactly twice**: the hero headline and the closing
  line. The page opens and shuts on the same voice. If you find yourself adding
  a third, the rationing is what makes it work.
- Both self-hosted, Latin-subset, `font-display: swap`, preloaded. 47 KB total.

**Palette deployment**
Warm paper carries the page. Ink provides structure and brackets the argument
with a single full slab (Getting paid) and a closing slab. Green does double
duty on purpose: it is both the outgoing-message colour in the conversation and
the CTA fill, so "the colour of the thing that gets you paid" and "the colour of
the button" are literally the same colour. Clay appears only where money is late.
Roughly 65% neutral / 20% ink / 15% green.

**Layout logic** — asymmetric split. Argument column left, a sticky device rail
right from 1024px up. Section rhythm is deliberately uneven
(`--section-tight` / `--normal` / `--loose`); there is no stack of identically
padded bands.

**Signature device — the sticky conversation rail.** One continuous WhatsApp
thread that advances as you scroll `LandingStory`. Each claim on the left is
proved by the next message arriving on the right. **The page's argument and the
product demo are the same object.** By the end of the section the reader has
watched a full collection cycle complete without the business owner touching
anything.

**Second device — the torn receipt** (`LandingChaser`). Carried over from a
rejected direction because it earns its place here specifically: the section's
job is to prove work happened while nobody was watching, and a printed audit log
is the most credible possible form for that claim. The teeth are generated from
a `clip-path` polygon in the component, not an image.

**Motion philosophy — "conversation cadence".** Nothing on the page moves
faster, further, or longer than a chat message arriving. Enforced in
`composables/useReveal.ts`, not by convention: duration ≤ 300ms, travel ≤ 14px,
ease-out only, never a spring. `prefers-reduced-motion` short-circuits
everything, including the sticky rail (which jumps to its final state so the
argument still completes).

### motion.dev

`animate` comes from `motion/mini` — the Web Animations API driver. These
reveals are plain opacity/transform tweens, so none of the full engine's spring,
layout or independent-transform machinery is needed.

Viewport detection uses the platform's own `IntersectionObserver` via a 15-line
wrapper (`observeInView`). Importing motion's `inView` helper pulled the full DOM
entry back into the bundle and cost **~65 KB gzipped**, measured. Motion still
drives every animation on the page; only the observer is native. `observeInView`
has the same signature as motion's helper, so swapping back is a one-line change.

---

## 3. Colour system

**Locked brand colours — these four are the brand. Do not shift them.**

| Token | Hex | Role |
|---|---|---|
| `--brand-green` | `#059669` | money, paid, the accent (inherited from the app) |
| `--brand-ink` | `#0D1B17` | text and dark surfaces |
| `--brand-paper` | `#FAF6EF` | the dominant light surface |
| `--brand-clay` | `#C05621` | unpaid / aging / warm counterweight |

Everything else is derived. Ramps are generated in OKLCH so the steps are
perceptually even: hue held constant, lightness on a fixed 11-step scale, chroma
following `C(L) = C_parent · L(1−L) / (L_p(1−L_p))` — a parabola that falls to
zero at both ends so tints desaturate naturally instead of going neon.
Out-of-gamut results are chroma-reduced until they fit sRGB.

Generator: `scratchpad/ramp.js` (regenerate and paste into the tokens file).
The neutral ramp uses `--brand-ink`'s hue at fixed low chroma, so the greys read
as belonging to the brand rather than sitting on top of it.

### Colour inventory

- **288** token declarations, **105** of which are `var()` references
- **60** ramp steps, all traceable to one of the four locked parents
- **21** alpha variants, all of a locked colour
- **4** literal values that are the locked colours themselves

**Values that cannot be traced to a locked colour — the complete list:**

| Token | Value | Status |
|---|---|---|
| `--state-error` (light) | `#8E2A1B` | **Declared exception.** The palette has no error hue. |
| `--state-error-surface` (light) | `#FDEEEA` | tint of `--state-error` |
| `--state-error` (dark) | `#E39383` | tint of `--state-error` |
| `--state-error-surface` (dark) | `#3A1109` | shade of `--state-error` |

That is the whole list. `success` derives from green, `warning` from clay, `info`
from ink — no new hues. All four semantic states are kept lower in chroma than
the locked colours so they stay visually subordinate.

> **Open decision for you:** `--state-error` sits in adjacent hue territory to
> `--brand-clay`. They are separated by lightness and chroma and never appear
> together, but if you'd rather the ambiguity didn't exist, swap Clay for a cool
> counterweight and let warm mean "problem" exclusively.

**One sanctioned mirror outside the tokens file:** `composables/useBrandTokens.ts`
holds `paper` and `ink` as literals because `<meta name="theme-color">` is read
before any CSS is parsed and cannot reference a custom property. If a locked
colour changes, that file changes with it. Nothing else in the app hardcodes a
brand colour.

### Contrast: where locked colours failed, and what changed instead

The brand colours were **not** altered. The layer was changed every time.

| Combination | Measured | Fix |
|---|---|---|
| white on `--brand-green` | **3.77:1** FAIL | Primary CTA is `ink-950` on green — **4.70:1**. Where white-on-green is unavoidable, `green-700` — **5.28:1**. |
| `--brand-green` as body text on paper | **3.50:1** FAIL | Green is a surface/accent colour, never small text. Body-weight green uses `green-700` — **4.91:1**. |
| `--brand-clay` as body text on paper | **4.24:1** FAIL | Body-weight clay uses `clay-700` — **5.51:1**. |
| `gray-600` as `--text-tertiary` | **3.65:1** FAIL | Replaced with `gray-660` — **4.99:1** page, **4.58:1** on the sunken surface. |
| dark `gray-500` as `--text-tertiary` | 6.17:1 on page but **4.16:1** on raised cards | Replaced with `gray-480` — **6.78:1** page, **4.58:1** raised. |

Dark mode is a remap of the same semantic tokens to different steps of the same
ramps. **No new hues.** The ink slab is the one deliberate exception to
"inverse": it stays dark with light text in both themes, because it is a fixed
element of the art direction rather than a semantic inversion. Making it flip
was the bug that rendered the whole Getting-paid section light-on-light.

There is **no** `@media (prefers-color-scheme: dark)` block. The OS preference is
resolved to an explicit `data-theme` by an inline head script before first paint,
so CSS has exactly one dark condition to match. Two independent sources of truth
for "is it dark" is precisely how the slab broke.

---

## 4. Swapping in real assets and real proof

The page currently states **no** customer counts, volume figures, uptime numbers
or testimonials, because none exist yet. The previous landing page shipped
`0 Active businesses`, `RM 0 Invoiced` and `0% Uptime SLA` — zeros are worse than
silence. Nothing was invented to replace them.

| What | Where | How to swap |
|---|---|---|
| **Logo** | `LandingNav.vue` `.mark`, `LandingFooter.vue` `.foot__mark` | Currently the wordmark as live text (crisp, themes for free, zero requests). Replace with `<img src="/InvoKitaLogo.png" width height alt="InvoKita">` if you want the real mark. |
| **Feature bento** | `LandingBento.vue` + `useLandingCopy.ts` → `bento.tiles` | Six tiles, each a real capability with a generated visual of it working. No screenshots, so it themes and translates for free. Every claim is annotated with its source file at the top of the component. |
| **Example conversation** | `composables/useThread.ts` | The two outbound messages are the product's **real default templates**, verbatim from `Backend/prisma/schema.prisma:109-110`. If those defaults change, update this file. The client and invoice are illustrative and labelled "Example conversation" on screen. |
| **Chaser log** | `useLandingCopy.ts` → `chaser.log` | Illustrative, labelled as such in `chaser.receiptNote`. |
| **Proof / social proof** | Hero `proof` strip | Currently the four real payment-gateway integrations — honest, verifiable proof rather than a metric. When you have real numbers or a real quote **with permission**, this is where they go. |
| **OG images** | `public/og/og-en.png`, `og-ms.png` | Generated by `scratchpad/gen-assets.js` (runs on the backend's puppeteer). Re-run after copy changes. |
| **Favicons** | `public/favicon.svg` + `icon-*.png` | Same generator. |

---

## 5. SEO

**Title (57 chars):** InvoKita — Invoices That Chase Themselves on WhatsApp
**Description (149 chars):** Send invoices on WhatsApp, then let InvoKita follow
up automatically until your client pays. Works with Billplz, ToyyibPay, HitPay.
Free plan, no card.

Both are written for click-through against the target query, not stuffed.

### Keyword map

| Tier | Terms | Mapped to |
|---|---|---|
| **Primary** | invoice software Malaysia · invoicing app Malaysia · sistem invois Malaysia | `<title>`, H1 region, hero eyebrow, `SoftwareApplication` schema |
| **Secondary** | automatic payment reminder · auto chaser invoice · WhatsApp invoice Malaysia · invois WhatsApp | §2 The thread (H2 + body), §5 Chaser log |
| **Secondary** | Billplz invoice · ToyyibPay invoice · payment gateway invoice Malaysia | §4 Getting paid (H2 + gateway list) |
| **Long-tail** | how to chase unpaid invoices · client not paying invoice what to do · macam mana nak collect payment | §2 and FAQ Q1, Q4 |
| **Long-tail** | free invoice generator Malaysia · invois percuma · SST invoice format | §7 Pricing, §4 local points, FAQ Q5 |
| **Long-tail** | AI invoice generator · draft invoice from text | §3 step 01, FAQ Q6 |

Malay terms are targeted by `/ms`, which is a **real route** with its own
`<html lang="ms-MY">`, canonical and `hreflang` set — not a client-side toggle
that crawlers can't see.

### Implemented

- One `h1`, logical heading order, `main`/`nav`/`footer` landmarks, real
  `<button>`/`<a>` semantics, skip link
- JSON-LD `@graph`: `Organization` (BSYX LABS SDN BHD, 202603086039), `WebSite`,
  `SoftwareApplication` (with `AggregateOffer` built from the **live** plan data,
  so schema can never disagree with the rendered prices), `FAQPage`,
  and `BreadcrumbList` on `/ms` only (a homepage has nothing to climb back to)
- **No `aggregateRating`** — there are no ratings, and inventing one is both
  dishonest and a structured-data policy violation
- Open Graph + Twitter cards, per-locale OG images with `og:locale:alternate`
- `canonical`, `hreflang` en-MY / ms-MY / x-default, `robots.txt`, `sitemap.xml`
  with `xhtml:link` alternates, full favicon set, web manifest

> `robots.txt` now disallows `/pay/` — those are unauthenticated tokenised links
> containing a customer's name and the amount they owe. They were previously
> crawlable.

---

## 6. Measured audit

Production build, served from `.output`, Chrome headless at 1280×900, cold load.
Numbers are **measured, not estimated** — re-run with `scratchpad/audit.js`.

| Budget | Target | Measured | |
|---|---|---|---|
| LCP | < 2.0s | **1.32s** | PASS |
| CLS | < 0.05 | **0** | PASS |
| INP | < 200ms | *not measured* | needs real interaction tracing; no long tasks observed |
| JS (gzip) | < 100 KB | **128.5 KB** | **OVER** — see below |
| Contrast | AA everywhere | **0 failures** across EN/BM × light/dark | PASS |
| Keyboard | full path | 45 stops, skip link first, focus ring on every one | PASS |

### The JS budget miss, honestly

| Chunk | Size (gz) | What it is |
|---|---|---|
| app shell | **98.3 KB** | Vue + Nuxt runtime + vue-router + Pinia + axios |
| landing page | **24.7 KB** | all 14 landing components + both locales' copy |
| motion/mini | **4.7 KB** | the animation driver |

**The landing page's own code is ~29 KB gzipped, comfortably inside budget.**
The overage is the pre-existing SPA shell, which every route in this app loads —
`app.vue` imports `useAuthStore` and `middleware/auth.global.js` runs on `/`,
so Pinia, the auth store and axios are all pulled onto a page that needs none of
them.

Getting the total under 100 KB means excluding the auth store and axios from the
landing route's critical path. That is an app-wide architectural change, not a
landing-page change, so it was not done unilaterally. It is the single highest-
value performance work available here.

Already fixed at the root: the app previously loaded Inter from Google Fonts via
a **render-blocking cross-origin stylesheet in `app.vue`, requested twice**.
Inter is now self-hosted and subset alongside the two landing faces.

---

## 7. Things you need to decide (found while building)

Two are backend defects that affect what this page is allowed to claim. The
pricing section reads live from `GET /api/plans`, so it mirrors your database
faithfully — which means it will faithfully advertise a broken promise until
these are resolved.

1. **Starter (RM 19) sells "Auto Chaser" but can never receive one.**
   `Backend/src/plugins/cron.js:16` filters `plan: { in: ["PRO","MAX"] }`. The
   plan is named `Starter`, so the chaser cron skips those subscribers entirely.

2. **Enforced quotas contradict the plans you sell.** The hardcoded table at
   `Backend/src/plugins/usage.js:6-10` vs. the live plan records:

   | Plan | Sold | Enforced |
   |---|---|---|
   | Starter RM19 | 20 invoices, 10 WA, 20 email, 5 AI | **not in table → falls back to FREE: 5 invoices, 0 WhatsApp** |
   | PRO RM49 | 100 invoices, 50 WA, 100 email | 30 invoices, 30 WA, 50 email |
   | MAX RM99 | Unlimited invoices, unlimited email | 100 invoices, 100 email |

3. **`/ms` was login-walled, and the cause was structural.** Three separate
   places decided whether a logged-out visitor was allowed on a page, and they
   disagreed:

   | Where | Exempted | Effect |
   |---|---|---|
   | `middleware/auth.global.js` | an allowlist of public paths | new marketing pages were login-walled by default |
   | `plugins/axios.js:104` | only `/login`, `/register` | a failed token refresh hard-redirected readers off any public page |
   | `stores/authStore.js:158` | **nothing** | `logout()` always did `window.location.href = "/login"` |

   The last two are the dangerous ones: they are `window.location` assignments
   that fire on the client after a background refresh fails, so to a visitor
   with an expired session the landing page simply *becomes* the login page.

   All three now share one answer — `utils/routeAccess.ts` — and the logic is
   **inverted**: a route is public unless it matches a protected prefix. Adding
   a marketing page can never login-wall it again. `logout()` on a public page
   now clears the session and reloads in place instead of relocating.

   > `auth.global.js` is a **global** middleware and Nuxt does not reliably
   > hot-reload it. Restart the dev server after touching it.

4. **Trailing-slash / canonical mismatch.** The production host 308-redirects
   `/ms` to `/ms/`. The page was emitting the unslashed form in its canonical,
   hreflang and sitemap — so every internal link took a redirect hop and the
   canonical pointed at a URL that redirects. `localePath()` now emits `/ms/`,
   the URL actually served.

**Auto-chasing is gated in the page, not just flagged.** `LandingPricing.vue`
now carries `CHASER_PLANS = new Set(['PRO','MAX'])`, mirroring the plan list in
`cron.js`. Plans outside it show "manual reminders only" and any "Auto Chaser"
bullet is filtered out of their feature list — so the page cannot sell a
capability the backend will not deliver, even though the DB row claims it.
**When cron.js is fixed to include Starter, add it to that Set and the badge and
the bullet both return on their own.**

---

## 8. File map

```
assets/css/
  design-tokens.css     single source of truth: colour, type, space, radii,
                        shadow, motion, z-index, dark-mode remap
  landing.css           @font-face, .kirim base layer, buttons, focus, reveals
components/landing/
  LandingPage.vue       composition shell + all head/SEO/JSON-LD
  LandingNav.vue        sticky nav, locale toggle, theme toggle, mobile sheet
  LandingHero.vue       §1
  LandingStory.vue      §2 — the signature sticky rail
  LandingSteps.vue      §3
  LandingPayments.vue   §4 — the ink slab
  LandingChaser.vue     §5 — the torn receipt
  LandingBento.vue      §6 — the feature bento, six generated tile visuals
  LandingPricing.vue    §7 — live from /api/plans
  LandingFaq.vue        §8 — native <details>
  LandingClose.vue      §9
  LandingFooter.vue
  KirimPhone.vue        phone frame + thread, typing cadence
  KirimBubble.vue       every message type
  KirimGrain.vue        generated SVG turbulence, tinted via currentColor
  KirimText.vue         optical full-stop correction for display type
composables/
  useLandingCopy.ts     EN + BM copy, both written not translated
  useThread.ts          the conversation (real product templates)
  useReveal.ts          motion.dev reveals + story progress
  useTheme.ts           theme toggle + pre-paint init script
  useBrandTokens.ts     the one sanctioned colour mirror
pages/
  index.vue             /     (en)
  ms/index.vue          /ms   (ms)
.archive/
  index.legacy.vue      the previous 3,380-line single-file landing page
```

Run the audits: `node scratchpad/audit.js`, `node scratchpad/ramp.js`.

---

## 9. Legal pages

`/legal/terms`, `/legal/privacy`, `/legal/refund` — rebuilt in the same design
system, content in `composables/useLegalContent.ts`, shell in
`components/legal/LegalDoc.vue`. Structured content rather than hand-marked-up
HTML, so the numbered table of contents, the anchors and the schema markup are
all generated from one source and cannot drift.

**These have not been reviewed by a lawyer, and I am not one.** What I did was
make them *accurate*: every factual claim is traceable to the codebase, and the
previous versions contained several that were not.

### Factual corrections (the important part)

| Was | Reality | Now |
|---|---|---|
| "We implement bank-level encryption (AES-256) … to protect your data" | `Backend/src/utils/encryption.js` applies AES-256-GCM to **payment-gateway credentials only**. Invoice and client records are ordinary DB columns. | Security section states precisely what is encrypted, what is hashed, and what is protected by access control alone. |
| Groq not mentioned anywhere | `Backend/src/utils/aiService.js` sends revenue totals, overdue-invoice details and **top-client names** to a US LLM provider. | Named, with a section listing exactly what is sent and the fact that it leaves Malaysia. |
| Subprocessors: Billplz, ToyyibPay | Code also uses Twilio, Resend, HitPay, senangPay, Xendit. | Full table of provider / function / what it receives, plus the cross-border point PDPA s.129 turns on. |
| No acceptable-use clause | The product's core function is messaging third parties. | Added — anti-spam, anti-harassment, and the user's warranty that they may hold their clients' data. |
| No liability, warranty, indemnity, availability or change-of-terms clauses | — | Added, drafted conservatively. |
| Refund policy silent on gateway fees | Fees are charged by the user's own gateway; not ours to return. | Stated. |
| "BSYX LABS" | Registered as BSYX LABS SDN BHD (202603086039). | Full name and number, matching the footer. |

### Needs a lawyer's eyes

Sections carrying `review: true` in `useLegalContent.ts` — Disclaimers,
Limitation of liability, Indemnity. The liability cap is drafted as *greater of
12 months' fees or RM 100*; whether that survives the Consumer Protection Act
1999 for your customer mix is a judgement I am not qualified to make. The flag
is developer-facing and never rendered: a "pending legal review" badge on a live
policy page would be worse than none.

### Four things I could not verify — search `[CONFIRM]`

Deliberately hedged or omitted rather than invented:

1. **Hosting provider and the country your database sits in.** Needed to
   complete the cross-border disclosure. Currently described generically.
2. **Backups.** The old landing page claimed "daily automated backups". Nothing
   in the repo evidences it, so the privacy policy makes **no backup promise at
   all**. Document the real arrangement, then state it.
3. **A concrete retention period** after account deletion. Currently "within a
   reasonable period".
4. **Whether you are a registered data user** under the PDPA.

### Verified

One `h1` per page, clean h1→h2 order, AA contrast on all three in light *and*
dark, zero console errors, focus ring on every tab stop, skip link first, and
`scroll-margin-top` so `#anchor` deep links clear the sticky nav (measured: 96px
against a 68px nav). Each page emits its own canonical, OG tags and a `WebPage`
+ `BreadcrumbList` JSON-LD graph with `dateModified`.

English only, and the pages say so — "English (governing version)" in the
masthead. A machine-translated policy that disagrees with the English one is a
liability, not a feature.

---

## 10. Scrollbar

Scoped to `html.kirim-scroll`, a class the marketing pages add via `useHead`, so
the authenticated app keeps the platform scrollbar it was built around.

Two implementations that must not both apply: Chromium supports *both*
`scrollbar-color` and `::-webkit-scrollbar`, but silently ignores the
pseudo-elements once `scrollbar-color` is set — which would throw away the hover
state. So the standard properties are gated behind
`@supports not selector(::-webkit-scrollbar)` (Firefox) and the WebKit rules
behind the positive form.

Thumb colours are measured, not picked. WCAG 1.4.11 treats a scrollbar as a UI
component needing **3:1** against its track. The conventional pale grey
(`ink-300`) measures **1.42:1** on our track — visible only if you already know
it's there. Shipped: `gray-600` (**3.35:1**) light, `ink-700` (**3.45:1**) dark,
both going to brand green on hover. Deliberately *not* hidden or hairline-thin —
scroll position is information, and this audience is largely on mid-range Android
where a 4px thumb isn't a real drag target.

`.k-scroll` styles the inner scrollers: the legal contents rail, wide tables, the
mobile nav sheet.

**The bug this surfaced.** `scrollbar-gutter: stable` reserves a gutter — and
`.kirim` paints the page on a *div*, so that gutter (and any overscroll
rubber-band area) painted whatever was behind it: Tailwind's cool `slate-50` from
`main.css`. Against warm paper that's a visible stripe, and **in dark mode it was
a light stripe down the right edge of a dark page**, because the app's
`html.dark body` override keys off a class this theme system doesn't use.
`html.kirim-scroll, html.kirim-scroll body { background-color: var(--surface-page) }`
fixes it. Verified matching in both themes on all three marketing routes.

---

## 11. The mark

`public/favicon.svg` — the "K", ink on brand green. Two locked colours, three
stroked paths, no gradients.

**Why a letter and not a symbol.** A favicon's actual job is being findable in a
tab strip, so the tile colour matters more than the cleverness of the glyph.
Measured against browser chrome:

| Tile | vs light chrome | vs dark chrome |
|---|---|---|
| Green `#059669` | 3.77:1 | **4.27:1** |
| Ink `#0D1B17` (previous) | 15.6:1 | **1.10:1 — invisible** |

The old ink tile disappeared into dark browser chrome. Green pops in both. And
ink-on-green measures **4.70:1** for the glyph versus 3.50:1 for paper-on-green,
while being the same pairing as the primary CTA button — so the system stays
coherent.

**What was tested and rejected**, at 16/20/32/64/180px on light *and* dark
chrome:

- *A "K" built out of a checkmark* — the clever option. The detached tick read
  as "IV" at every size. Discarded.
- *"K" with a tick tail spliced onto the lower arm* — the tail collided with the
  upper arm and read as a smudge.
- *Bare checkmark* — flawlessly legible and the single most generic app icon in
  existence.
- *The previous bubble-and-tick* — loses its bubble tail entirely at 16px, so the
  metaphor evaporates and it reads as a plain checkbox.
- *Green K on ink* — dim and muddy at 16px.

### Three treatments, because the platforms want different things

| File | Treatment | Why |
|---|---|---|
| `favicon.svg`, `favicon-16/32.png` | rounded tile, alpha outside | browsers draw it as-is, so it supplies its own corners |
| `apple-touch-icon.png` (180) | **full bleed, square, no alpha** | iOS applies its own rounded mask. The previous file was a rounded tile with transparent corners — iOS double-rounds that and fills the corners black. Fixed. |
| `icon-192/512.png` | full bleed, `purpose: "any maskable"` | Android may crop to a circle; the glyph sits well inside the 80% safe zone. Verified under a circle crop. |

`site.webmanifest` `theme_color` is now the tile green so the PWA splash matches
the icon. Regenerate everything with `node scratchpad/gen-icons.js`.

---

## 12. Sign in / sign up

`pages/login.vue`, `pages/register.vue`, shell in `components/auth/AuthShell.vue`,
input in `components/auth/AuthField.vue`. Previous versions kept at
`.archive/login.legacy.vue` and `.archive/register.legacy.vue`.

### Google OAuth does not exist

`Backend/src/routes/auth/index.js` exposes exactly four routes — `register`,
`login`, `refresh`, `logout` — all email + password. There is no OAuth provider,
no `googleId`/`provider` column on `User`, and no callback handler. Every
"auth"-looking match in the backend is a **Twilio** auth token.

So the button is built and styled but switched **off** behind
`SOCIAL_AUTH_ENABLED` in `composables/useSocialAuth.ts`. Shipping a "Continue
with Google" button that 404s is worse than not offering one — it is the first
thing clicked and the last thing trusted. That file documents the full six-step
path to enabling it (Google Cloud client, env vars, schema change making
`password` nullable, two routes, the account-linking decision, then the flag).
The account-linking step is the one with a security edge: linking a Google email
to an existing password account is only safe if you check `email_verified` on
the ID token first, or you have an account-takeover vector.

### What was fixed beyond the visual rework

| Problem | Impact |
|---|---|
| **No `autocomplete` attributes at all** | Password managers could not fill or save. Now `username` / `current-password` / `new-password` / `email` / `name`. |
| **`<a href="#">Forgot?</a>`** | A dead link, and there is no password reset flow anywhere in the backend — users who forget were simply stuck. Now points at `mailto:support@invokita.my` so it reaches a human. **A real reset flow is still missing** — see below. |
| No password reveal | Typing a long password blind on a 390px screen is where sign-ups get abandoned. |
| No inline validation | Errors only appeared in a toast. Now per-field, `aria-invalid` + `aria-describedby`, error replaces the hint so the form does not grow as you fix it. |
| Referral code shown to everyone | It was a fourth field for the majority with no code. Now confirmed as a chip when `?ref=` is present, otherwise behind a "Have a referral code?" toggle. |
| Auth pages indexable | Now `noindex, follow` — thin, duplicated across every SaaS, and they dilute the pages that should rank. |
| `ring: none` in `main.css` | Not a real CSS property. Removed. |

### Still missing in the backend — not fixable from the frontend

1. **No password reset flow.** No token, no route, no email. The "Forgot?" link
   is a mailto stopgap.
2. **No password validation.** `POST /auth/register` runs
   `bcrypt.hash(password, 10)` on whatever arrives — a one-character password is
   accepted. The 8-character rule on the form is a UX guardrail only, enforced
   client-side, so it is trivially bypassable. This needs a server-side check.
3. **No email verification.** Accounts are created and issued tokens
   immediately.

### A correction worth recording

While testing focus rings I flagged `main.css`'s input block as removing the
keyboard focus ring app-wide. That was **wrong**, and the audit script caused it:
it only tested the `outline` property. The app pairs `outline: none` with an
accent border plus a halo, and the green border measures 3.50:1 against the page
— a legitimate focus indicator under WCAG 2.4.11. Worth knowing: text inputs
match `:focus-visible` on *pointer* focus too, because they accept keyboard
input, so there is no modality distinction to draw for them.

The app-wide change was reverted. `AuthField` instead opts out with `.no-ik` and
uses the design-token ring, so the change stays inside these pages. What did
survive from that detour: never write a local `outline: none` on `:focus` and
re-add it on `:focus-visible` — equal specificity, and the removal wins.

### Verified

AA contrast on both pages in light and dark; zero interactive tab stops without
a visible focus ring; empty submit blocks navigation and marks three fields with
`aria-invalid`; the reveal toggle flips `type` and reports `aria-pressed`;
`?ref=CODE` prefills and confirms; zero console errors.

### Auth layout and the ambient panel

Panel left, form right, and the form column is centred within its half
(measured: equal 117px gutters at 1280px). The form stays **first in the DOM**
and is only moved visually with `order` — it is the reason the page exists, so
the tab key and a screen reader should reach it first. Normally that visual/DOM
split risks WCAG 2.4.3, but the panel contains zero interactive elements, so
there is no focus order to contradict. The divider is `border-right` on the
panel, and it is load-bearing in dark mode where the slab (`ink-975`) and the
form side (`ink-950`) are one ramp step apart.

`components/auth/AuthLedger.vue` — **"the ledger settles"**, the panel's ambient
background. One row at a time, a green bar draws across a ruled line and a tick
lands at the end: the product's promise (invoices getting paid without you)
running as background motion. Not a floating blob or a gradient mesh.

- **motion.dev drives it** — `animate` from `motion/mini`, the Web Animations
  driver already in the bundle. The loop is sequenced in JS rather than CSS
  keyframes because each beat has to target a *different* row and wait for the
  previous one to clear, which keyframes cannot express. Beats step by 3 rows so
  consecutive settles are never adjacent.
- The slow drifting green wash *is* CSS keyframes — one looping transform is
  exactly what keyframes are for and it costs no JS.
- Timing is deliberately far slower than the scroll-reveal budget. That budget
  exists so reveals never outpace a chat message; this sits behind text and must
  never pull the eye off the form.
- Colour is alpha of the locked green only.
- `prefers-reduced-motion`: the loop **never starts** and the wash animation is
  removed; two rows are left in their settled state so the panel still reads.
  Verified — row count unchanged 2.5s later.

Verified after adding it: AA contrast still passes on both pages in both themes
(the motion layer sits behind text and does not degrade it), and the animation
runs — sampled over 4.9s it produced 4 distinct states, cycling row 1 → clear →
row 4.

---

## 13. The app: dark mode + dashboard

### Dark mode

Ran on Tailwind `slate` — blue-biased greys beside an emerald accent, which reads
as two unrelated colour families. Now on a ramp at the brand ink hue (174°) at
chroma 0.009: neutral to the eye, but related to the green. Five surfaces, each
measured ≥1.15:1 apart so elevation does real work.

`--app-0` sidebar `#0e1312` · `--app-1` page `#1c2120` · `--app-2` card `#262c2a`
· `--app-3` input/hover `#303634` · `--app-4` active `#3b413f`

Three separate causes were making it feel wrong:

1. **Hue conflict** — slate vs emerald, above.
2. **The layout was being erased.** The sidebar mapped to `slate-950`, *the same
   value as the page background*, so sidebar and content collapsed into one flat
   plane. The structure that works in light mode was the first casualty.
3. **Near-black + near-white.** `slate-950` with `slate-50` = 19.28:1, which
   causes halation on a data-dense screen. Body text now lands at 13.08:1.

Also: ~200 light pastel utilities (`bg-emerald-50`, `bg-amber-50`, …) stayed
*light* in dark mode — the dashboard carried lavender, yellow, mint and pink
slabs. Five semantic families now have dark tints with AA-verified text
(7.9–8.2:1). Black shadows were replaced with a lit top edge; a 0.8-alpha black
shadow on a near-black page is invisible.

### Contrast: dashboard went dark 8 → 0, light 17 → 0

Light was the worse of the two. Four systemic causes:

| Cause | Was | Now |
|---|---|---|
| `text-slate-400` as the muted colour (279 uses) | 2.56:1 on white | remapped to `#656c6a`, 5.38:1 |
| `.bg-slate-900` meant *both* primary button and dark tooltip | flipping it to emerald turned tooltips green under light text — 1.96:1 | flip scoped to `a`/`button`; `div`/`span` stay dark |
| `text-emerald-600` on white | 3.77:1 | `emerald-700`, 5.02:1 |
| white on an emerald chip | 3.77:1 | ink, 4.70:1 |

Opacity-modified utilities (`text-emerald-700/80`) are a *separate* Tailwind
class, so mapping the base class never touched them.

> **Tooling correction.** An earlier dashboard "PASS" was meaningless: the audit
> patch silently failed (targeted `pg.` where the script uses `page.`), so it was
> auditing `/login`. `scratchpad/audit-app.js` now aborts if it is redirected.

### Dashboard rework

**Section order** now follows the job: money → work → context → account admin.
`Monthly Usage Highlights` was sitting directly under the money summary; it is
account administration and now sits last.

**The four pastel KPI tiles are gone.** Lavender for revenue, yellow for
outstanding, mint for clients, pink for overdue — decorative, not semantic.
Nothing about revenue is "indigo", and four equal quarters of a rainbow means
nothing leads. Outstanding is now the lead figure; Collected and Active clients
are neutral supporting cards; colour appears only where it carries meaning.

**Overdue became an action, not a count.** It links to the filtered invoice list,
and when nothing is overdue it says so in green rather than showing a `0` that
reads like missing data.

Copy: "Deep insights into platform growth and system performance" → "What you are
owed, and what is chasing itself." Empty states name a next step. The forecast
card's 350px chart box collapses to 160px when there is nothing to plot — it was
the largest thing on the page for a new account.

**Not done:** the forecast, profitability and referral panels are restyled but
not restructured, and the multi-currency note was demoted rather than rewritten.
