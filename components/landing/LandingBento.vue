<script setup lang="ts">
/**
 * The bento. Replaces the earlier "inside the app" dashboard mockup.
 *
 * Why a bento and not a screenshot: the dashboard shot showed one screen and
 * argued for none of the things that actually keep people subscribed. Each tile
 * here is a capability that is real in the codebase, paired with a small
 * generated visual of that capability doing its job — so the section proves six
 * things instead of illustrating one.
 *
 * Every claim is verifiable:
 *   ai        -> Groq draft builder, Backend/src/utils/aiService.js
 *   risk      -> latePrediction from client.averageDelayDays,
 *                Backend/src/routes/invoices/index.js:191
 *   perClient -> client.autoChaser / client.autoEmailChaser (schema.prisma)
 *   brand     -> profile.logoUrl + invoice.template
 *   money     -> invoice.currency (MYR default) + tax settings
 *   deliver   -> tokenised /pay/:id page + puppeteer PDF export
 *   quotes    -> tokenised /quote/:token accept-decline page + one-click
 *                conversion, Backend/src/routes/quote/index.js
 *
 * The tiles are asymmetric by design — a grid of six equal cards is the exact
 * SaaS template this direction is trying not to be.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

defineProps<{ copy: LandingCopy }>()
</script>

<template>
  <section class="bento k-section" aria-labelledby="bento-title">
    <div class="k-container k-container--wide">
      <header class="bento__head" data-reveal>
        <p class="k-eyebrow">{{ copy.bento.eyebrow }}</p>
        <h2 id="bento-title" class="k-headline bento__title">
          <KirimText :text="copy.bento.title" />
        </h2>
        <p class="k-lead bento__lead">{{ copy.bento.lead }}</p>
      </header>

      <div class="grid">
        <!-- ── AI draft: the hero tile ─────────────────────────────────── -->
        <article class="tile tile--ai" data-reveal data-reveal-group="bento">
          <div class="tile__text">
            <h3 class="tile__title">{{ copy.bento.tiles.ai.title }}</h3>
            <p class="tile__body">{{ copy.bento.tiles.ai.body }}</p>
          </div>

          <div class="tile__art art-ai" aria-hidden="true">
            <p class="art-ai__prompt">
              <span class="art-ai__caret"></span>{{ copy.bento.tiles.ai.prompt }}
            </p>
            <svg class="art-ai__flow" viewBox="0 0 220 22" preserveAspectRatio="none">
              <path
                d="M14 0 V10 Q14 20 30 20 H190 Q206 20 206 10 V0"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-dasharray="3 4" />
            </svg>
            <div class="art-ai__doc">
              <div v-for="r in copy.bento.tiles.ai.rows" :key="r.label" class="art-ai__row">
                <span>{{ r.label }}</span>
                <span class="k-num">{{ r.value }}</span>
              </div>
              <div class="art-ai__row art-ai__row--total">
                <span>{{ copy.bento.tiles.ai.totalLabel }}</span>
                <span class="k-num">{{ copy.bento.tiles.ai.total }}</span>
              </div>
            </div>
          </div>
        </article>

        <!-- ── Late-risk prediction ────────────────────────────────────── -->
        <article class="tile tile--risk" data-reveal data-reveal-group="bento">
          <div class="tile__text">
            <h3 class="tile__title">{{ copy.bento.tiles.risk.title }}</h3>
            <p class="tile__body">{{ copy.bento.tiles.risk.body }}</p>
          </div>

          <ul class="tile__art art-risk" aria-hidden="true">
            <li v-for="r in copy.bento.tiles.risk.rows" :key="r.client" class="art-risk__row">
              <span class="art-risk__client">{{ r.client }}</span>
              <span class="art-risk__meta">{{ r.meta }}</span>
              <span class="art-risk__chip" :class="`art-risk__chip--${r.risk}`">
                {{ copy.bento.tiles.risk.levels[r.risk as 'low' | 'high'] }}
              </span>
            </li>
          </ul>
        </article>

        <!-- ── Per-client chase switch ─────────────────────────────────── -->
        <article class="tile tile--switch" data-reveal data-reveal-group="bento">
          <div class="tile__text">
            <h3 class="tile__title">{{ copy.bento.tiles.perClient.title }}</h3>
            <p class="tile__body">{{ copy.bento.tiles.perClient.body }}</p>
          </div>

          <div class="tile__art art-switch" aria-hidden="true">
            <div class="art-switch__row">
              <span>{{ copy.bento.tiles.perClient.names[0] }}</span>
              <span class="toggle toggle--on"><i></i></span>
            </div>
            <div class="art-switch__row art-switch__row--off">
              <span>{{ copy.bento.tiles.perClient.names[1] }}</span>
              <span class="toggle"><i></i></span>
            </div>
          </div>
        </article>

        <!-- ── Branding ────────────────────────────────────────────────── -->
        <article class="tile tile--brand" data-reveal data-reveal-group="bento">
          <div class="tile__text">
            <h3 class="tile__title">{{ copy.bento.tiles.brand.title }}</h3>
            <p class="tile__body">{{ copy.bento.tiles.brand.body }}</p>
          </div>

          <div class="tile__art art-brand" aria-hidden="true">
            <div class="art-brand__sheet">
              <span class="art-brand__slot">{{ copy.bento.tiles.brand.slot }}</span>
              <span class="art-brand__line"></span>
              <span class="art-brand__line art-brand__line--short"></span>
            </div>
            <div class="art-brand__swatches">
              <i class="sw sw--a"></i><i class="sw sw--b"></i><i class="sw sw--c"></i>
            </div>
          </div>
        </article>

        <!-- ── Currency + tax ──────────────────────────────────────────── -->
        <article class="tile tile--money" data-reveal data-reveal-group="bento">
          <div class="tile__text">
            <h3 class="tile__title">{{ copy.bento.tiles.money.title }}</h3>
            <p class="tile__body">{{ copy.bento.tiles.money.body }}</p>
          </div>

          <div class="tile__art art-money" aria-hidden="true">
            <ul class="art-money__chips">
              <li v-for="(c, i) in copy.bento.tiles.money.chips" :key="c" :class="{ 'is-on': i === 0 }">
                {{ c }}
              </li>
            </ul>
            <p class="art-money__tax">
              <span>{{ copy.bento.tiles.money.taxLabel }}</span>
              <span class="k-num">{{ copy.bento.tiles.money.taxValue }}</span>
            </p>
          </div>
        </article>

        <!-- ── Delivery: link vs PDF ───────────────────────────────────── -->
        <article class="tile tile--deliver" data-reveal data-reveal-group="bento">
          <div class="tile__text">
            <h3 class="tile__title">{{ copy.bento.tiles.deliver.title }}</h3>
            <p class="tile__body">{{ copy.bento.tiles.deliver.body }}</p>
          </div>

          <div class="tile__art art-deliver" aria-hidden="true">
            <p class="art-deliver__link">
              <svg viewBox="0 0 16 16" class="art-deliver__ico">
                <path
                  d="M6.6 9.4a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.9.9M9.4 6.6a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l.9-.9"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round" />
              </svg>
              {{ copy.bento.tiles.deliver.link }}
            </p>
            <span class="art-deliver__or"></span>
            <p class="art-deliver__pdf">
              <svg viewBox="0 0 16 16" class="art-deliver__ico">
                <path
                  d="M9.2 1.6H4.4a1.2 1.2 0 0 0-1.2 1.2v10.4a1.2 1.2 0 0 0 1.2 1.2h7.2a1.2 1.2 0 0 0 1.2-1.2V5.2Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linejoin="round" />
                <path d="M9.2 1.6V5.2h3.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              </svg>
              {{ copy.bento.tiles.deliver.pdf }}
            </p>
          </div>
        </article>
        <!-- ── Quotations: the answer comes back ───────────────────────── -->
        <article class="tile tile--quotes" data-reveal data-reveal-group="bento">
          <div class="tile__text">
            <h3 class="tile__title">{{ copy.bento.tiles.quotes.title }}</h3>
            <p class="tile__body">{{ copy.bento.tiles.quotes.body }}</p>
          </div>

          <div class="tile__art art-quotes" aria-hidden="true">
            <div class="art-quotes__sheet">
              <span class="art-quotes__num">{{ copy.bento.tiles.quotes.number }}</span>
              <div class="art-quotes__acts">
                <span class="art-quotes__btn art-quotes__btn--yes">
                  {{ copy.bento.tiles.quotes.accept }}
                </span>
                <span class="art-quotes__btn">
                  {{ copy.bento.tiles.quotes.decline }}
                </span>
              </div>
            </div>

            <p class="art-quotes__result">
              <svg viewBox="0 0 16 16" class="art-quotes__ico">
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              {{ copy.bento.tiles.quotes.result }}
            </p>
            <p class="art-quotes__convert">{{ copy.bento.tiles.quotes.convert }}</p>
          </div>
        </article>
      </div>

      <p class="bento__cta" data-reveal>
        <a href="/register" class="k-btn k-btn--secondary">{{ copy.bento.cta }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.bento__head {
  max-width: var(--measure);
  margin-bottom: clamp(2rem, 5vw, 3rem);
}
.bento__title {
  margin-block: var(--space-4) var(--space-5);
}

/* ─── The bento ─────────────────────────────────────────────────────────────
   Mobile: one column. 640: two. 1024: a four-column asymmetric arrangement,
   deliberately not six equal cards.
   ─────────────────────────────────────────────────────────────────────────── */
.grid {
  display: grid;
  gap: var(--space-4);
}

.tile {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background-color: var(--surface-raised);
  overflow: hidden;
  transition:
    border-color var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}
.tile:hover {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) {
  .tile:hover {
    transform: none;
  }
}

.tile__title {
  font-size: var(--text-title);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  text-wrap: balance;
}
.tile__body {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.tile__art {
  margin-top: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ─── AI tile art ───────────────────────────────────────────────────────── */
.art-ai {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: auto;
}
.art-ai__prompt {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background-color: var(--surface-page);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-secondary);
  line-height: 1.4;
}
.art-ai__caret {
  flex: none;
  width: 2px;
  height: 0.85rem;
  background-color: var(--surface-accent);
  animation: k-caret 1.1s steps(1) infinite;
}
@keyframes k-caret {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .art-ai__caret { animation: none; }
}

.art-ai__flow {
  width: 100%;
  height: 22px;
  color: var(--border-accent);
}

.art-ai__doc {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background-color: var(--surface-page);
  padding: var(--space-4);
}
.art-ai__row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  padding-block: var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
}
.art-ai__row--total {
  border-bottom: 0;
  padding-bottom: 0;
  margin-top: var(--space-1);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}
.art-ai__row--total span:last-child {
  color: var(--text-accent);
}

/* ─── Risk tile art ─────────────────────────────────────────────────────── */
.art-risk {
  display: grid;
  gap: var(--space-2);
  margin-top: auto;
}
.art-risk__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0 var(--space-3);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background-color: var(--surface-page);
}
.art-risk__client {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}
.art-risk__meta {
  grid-column: 1;
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}
.art-risk__chip {
  grid-row: 1 / 3;
  grid-column: 2;
  padding: 3px var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
.art-risk__chip--low {
  background-color: var(--state-success-surface);
  color: var(--state-success);
}
.art-risk__chip--high {
  background-color: var(--state-warning-surface);
  color: var(--state-warning);
}

/* ─── Switch tile art ───────────────────────────────────────────────────── */
.art-switch {
  display: grid;
  gap: var(--space-2);
  margin-top: auto;
}
.art-switch__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background-color: var(--surface-page);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}
.art-switch__row--off {
  color: var(--text-tertiary);
}
.toggle {
  flex: none;
  width: 2rem;
  height: 1.15rem;
  border-radius: var(--radius-full);
  background-color: var(--border-strong);
  padding: 2px;
  display: flex;
  transition: background-color var(--dur-base) var(--ease-out);
}
.toggle i {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: var(--radius-full);
  background-color: var(--surface-raised);
  box-shadow: var(--shadow-xs);
  transition: transform var(--dur-base) var(--ease-out);
}
.toggle--on {
  background-color: var(--surface-accent);
}
.toggle--on i {
  transform: translateX(0.85rem);
}

/* ─── Brand tile art ────────────────────────────────────────────────────── */
.art-brand {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  margin-top: auto;
}
.art-brand__sheet {
  flex: 1;
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background-color: var(--surface-page);
}
.art-brand__slot {
  display: grid;
  place-items: center;
  height: 1.9rem;
  border: 1px dashed var(--border-accent);
  border-radius: var(--radius-sm);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
}
.art-brand__line {
  height: 5px;
  border-radius: var(--radius-full);
  background-color: var(--border-default);
}
.art-brand__line--short {
  width: 55%;
}
.art-brand__swatches {
  display: grid;
  gap: var(--space-2);
}
.sw {
  display: block;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
}
.sw--a { background-color: var(--surface-accent); }
.sw--b { background-color: var(--ink-800); }
.sw--c { background-color: var(--clay-600); }

/* ─── Money tile art ────────────────────────────────────────────────────── */
.art-money {
  display: grid;
  gap: var(--space-3);
  margin-top: auto;
}
.art-money__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.art-money__chips li {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background-color: var(--surface-page);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  color: var(--text-tertiary);
}
.art-money__chips li.is-on {
  background-color: var(--surface-accent-soft);
  border-color: var(--border-accent);
  color: var(--text-accent);
}
.art-money__tax {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background-color: var(--surface-page);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

/* ─── Deliver tile art ──────────────────────────────────────────────────── */
.art-deliver {
  display: grid;
  gap: var(--space-2);
  margin-top: auto;
}
.art-deliver__link,
.art-deliver__pdf {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background-color: var(--surface-page);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-secondary);
  overflow-wrap: anywhere;
}
.art-deliver__link {
  border-color: var(--border-accent);
  background-color: var(--surface-accent-soft);
  color: var(--text-accent);
}
.art-deliver__ico {
  width: 14px;
  height: 14px;
  flex: none;
}
.art-deliver__or {
  height: 1px;
  background: linear-gradient(to right, var(--border-default), transparent);
}

/* ─── Quotations tile art ───────────────────────────────────────────────── */
.art-quotes {
  display: grid;
  gap: var(--space-2);
  margin-top: auto;
}
.art-quotes__sheet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background-color: var(--surface-page);
}
.art-quotes__num {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-wide);
  color: var(--text-tertiary);
}
.art-quotes__acts {
  display: flex;
  gap: var(--space-2);
}
.art-quotes__btn {
  padding: 5px var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  color: var(--text-secondary);
  white-space: nowrap;
}
/* The same two tokens .k-btn--primary uses, and like that button they resolve
   to the same green in both themes — the accent is a fixed brand colour on the
   marketing surface, not a themed one. What changes underneath it is
   --surface-page and --surface-raised, so the tile reads differently in dark
   even though the pill itself does not. Deliberate here; do NOT copy the
   pattern onto an app surface, where a filled control that renders identically
   in both themes is a bug rather than a decision. */
.art-quotes__btn--yes {
  background-color: var(--surface-accent);
  border-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.art-quotes__result {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-md);
  background-color: var(--surface-accent-soft);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
}
.art-quotes__ico {
  width: 14px;
  height: 14px;
  flex: none;
}
.art-quotes__convert {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  padding-left: var(--space-4);
}

.bento__cta {
  margin-top: var(--space-7);
}

/* ─── Breakpoints ───────────────────────────────────────────────────────── */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tile--ai {
    grid-column: span 2;
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-4);
  }
  /*  A A B B
      A A C D
      E E F F
      G G G G   <- quotations, full width: it is a whole capability rather
                   than a detail, and the accept/decline art needs the room  */
  .tile--ai      { grid-column: span 2; grid-row: span 2; }
  .tile--risk    { grid-column: span 2; }
  .tile--switch  { grid-column: span 1; }
  .tile--brand   { grid-column: span 1; }
  .tile--money   { grid-column: span 2; }
  .tile--deliver { grid-column: span 2; }
  .tile--quotes  { grid-column: span 4; }

  /* Full width means the copy would otherwise run to a 70rem measure, which is
     unreadable. Two columns instead: text left, art right. */
  .tile--quotes {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: var(--space-7);
    align-items: center;
    padding: var(--space-7);
  }
  .tile--quotes .tile__title {
    font-size: var(--text-xl);
  }
  .tile--quotes .tile__body {
    font-size: var(--text-base);
    max-width: 34rem;
  }
  .tile--quotes .tile__art {
    margin-top: 0;
  }

  .tile--ai {
    padding: var(--space-7);
  }
  /* This tile is two rows tall, so `margin-top: auto` pinned the art to the
     floor and left a dead band under the copy. Centring it in the leftover
     space distributes the emptiness instead of pooling it. */
  .tile--ai .tile__art {
    margin-block: auto;
  }
  .tile--ai .tile__title {
    font-size: var(--text-xl);
  }
  .tile--ai .tile__body {
    font-size: var(--text-base);
    max-width: 34rem;
  }
}
</style>
