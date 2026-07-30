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

3. **`/ms` was unreachable.** `middleware/auth.global.js` has a hardcoded
   public-route allowlist that didn't include it, so the Bahasa Malaysia page
   redirected every logged-out visitor and every crawler to `/login`. Added,
   with a `startsWith("/ms/")` so future BM pages are covered too.

   > That file is a **global** middleware and Nuxt does not reliably hot-reload
   > it. If `/ms` still redirects in dev, restart the dev server.

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
