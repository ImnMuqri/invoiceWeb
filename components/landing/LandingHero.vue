<script setup lang="ts">
import type { Locale, LandingCopy } from '~/composables/useLandingCopy'
import { useThread } from '~/composables/useThread'

const props = defineProps<{ copy: LandingCopy; locale: Locale }>()

/* The hero shows the opening beats of the same thread the sticky phone
   continues — bubbles at full size, before the camera pulls back. */
const { messages, labels } = useThread(props.locale)
const opening = computed(() => messages.slice(0, 3))

const GATEWAYS = ['Billplz', 'ToyyibPay', 'HitPay', 'senangPay']
</script>

<template>
  <section class="hero k-grain-host" aria-labelledby="hero-title">
    <KirimGrain id="hero" :opacity="0.34" />
    <div class="hero__wash" aria-hidden="true"></div>
    <div class="hero__rules" aria-hidden="true"></div>

    <div class="hero__inner k-container k-container--wide">
      <div class="hero__copy">
        <p class="k-eyebrow hero__eyebrow">
          <span class="hero__pin" aria-hidden="true"></span>
          {{ copy.hero.eyebrow }}
        </p>

        <h1 id="hero-title" class="k-display hero__title">
          <KirimText :text="copy.hero.titleLead" /><br />
          <span class="k-serif hero__serif">{{ copy.hero.titleSerif }}</span>
        </h1>

        <p class="k-lead hero__lead">{{ copy.hero.lead }}</p>

        <div class="hero__actions">
          <a href="/register" class="k-btn k-btn--primary k-btn--lg">
            {{ copy.hero.ctaPrimary }}
            <svg class="hero__arrow" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M4 10h11M10.5 5.5 15 10l-4.5 4.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
          <a href="#how" class="k-link hero__secondary">{{ copy.hero.ctaSecondary }}</a>
        </div>

        <p class="hero__note">{{ copy.hero.ctaNote }}</p>

        <!-- The single proof element: real integrations, not a fake metric. -->
        <div class="proof">
          <p class="proof__label">{{ copy.hero.proofLabel }}</p>
          <ul class="proof__list">
            <li v-for="g in GATEWAYS" :key="g" class="proof__item">{{ g }}</li>
          </ul>
        </div>
      </div>

      <div class="hero__art">
        <p class="hero__caption">{{ copy.hero.threadCaption }}</p>
        <ol class="hero__thread">
          <KirimBubble
            v-for="m in opening"
            :key="m.id"
            :message="m"
            :automatic-tag="labels.automaticTag" />
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  padding-block: clamp(2.5rem, 7vw, 5.5rem) clamp(3.5rem, 8vw, 6.5rem);
  overflow: hidden;
}

/* Green wash — an alpha of the locked green, no second hue. */
.hero__wash {
  position: absolute;
  inset: -20% -10% auto -10%;
  height: 78%;
  z-index: -2;
  background: radial-gradient(
    58% 62% at 68% 22%,
    var(--a-green-12) 0%,
    var(--a-green-04) 42%,
    transparent 72%
  );
}

/* The LEDGER hairlines, carried into KIRIM for structure under the warmth. */
.hero__rules {
  position: absolute;
  inset: 0;
  z-index: -3;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--border-subtle) 0 1px,
    transparent 1px 5.5rem
  );
  -webkit-mask-image: radial-gradient(70% 60% at 30% 40%, var(--brand-ink) 0%, transparent 78%);
  mask-image: radial-gradient(70% 60% at 30% 40%, var(--brand-ink) 0%, transparent 78%);
  opacity: 0.85;
}

.hero__inner {
  display: grid;
  gap: clamp(2.5rem, 6vw, 4rem);
}

.hero__eyebrow {
  margin-bottom: var(--space-5);
}
.hero__pin {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
  box-shadow: 0 0 0 4px var(--a-green-20);
}

.hero__title {
  max-width: 16ch;
  margin-bottom: var(--space-5);
}
/* The serif is one of exactly two appearances on the page. */
.hero__serif {
  color: var(--text-accent);
  display: inline-block;
}

.hero__lead {
  max-width: var(--measure);
  margin-bottom: var(--space-7);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-5);
  margin-bottom: var(--space-4);
}
.hero__arrow {
  width: 18px;
  height: 18px;
  transition: transform var(--dur-base) var(--ease-out);
}
.k-btn:hover .hero__arrow {
  transform: translateX(3px);
}
.hero__secondary {
  font-size: var(--text-sm);
}

.hero__note {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-9);
}

/* ─── Proof strip ───────────────────────────────────────────────────────── */
.proof {
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-default);
  max-width: 34rem;
}
.proof__label {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: var(--space-3);
}
.proof__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
}
.proof__item {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-secondary);
  background-color: var(--chip-bg);
  transition:
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}
.proof__item:hover {
  border-color: var(--border-accent);
  color: var(--text-primary);
}

/* ─── Art ───────────────────────────────────────────────────────────────── */
.hero__art {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.hero__caption {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}
.hero__thread {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ─── 768 ───────────────────────────────────────────────────────────────── */
@media (min-width: 768px) {
  .hero__art {
    max-width: 26rem;
  }
}

/* ─── 1024: the asymmetric split the direction is built on ──────────────── */
@media (min-width: 1024px) {
  .hero__inner {
    grid-template-columns: minmax(0, 1.32fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(3rem, 5vw, 5.5rem);
  }
  .hero__art {
    max-width: none;
    padding-top: var(--space-8);
  }
  .hero__note {
    margin-bottom: var(--space-8);
  }
}

@media (min-width: 1600px) {
  .hero {
    padding-block: 6.5rem 8rem;
  }
  .hero__title {
    max-width: 15ch;
  }
}
</style>
