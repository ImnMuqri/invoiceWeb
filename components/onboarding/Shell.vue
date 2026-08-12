<script setup lang="ts">
/**
 * Onboarding shell, in the KIRIM system.
 *
 * This is deliberately the same furniture as AuthShell — ink slab on one side,
 * warm paper on the other — because onboarding is the second half of the
 * sign-up someone just finished. The previous screen was a white card floating
 * on Tailwind slate, which read as a different product from the page they
 * registered on. Same slab, same paper, same type ramp: one continuous room.
 *
 * The slab carries the STEP LEDGER rather than a marketing panel. Once someone
 * has an account, reassurance has done its job; what they need is to know how
 * much is left. A bare "Step 3 of 5" progress bar could not say what step 4
 * was, so the optional step was indistinguishable from a required one — which
 * is what made a skippable client import feel like a wall.
 *
 * Completed steps are buttons; upcoming ones are not. Going forward has to
 * clear validation, so only backwards is offered here.
 */
import { BRAND } from '~/composables/useBrandTokens'
import { THEME_INIT_SCRIPT } from '~/composables/useTheme'

export interface OnboardingStep {
  /** Rail label — short, so it survives a 22rem column. */
  label: string
  /** Rail sub-label. */
  hint?: string
  optional?: boolean
}

const props = withDefaults(
  defineProps<{
    steps: OnboardingStep[]
    /** 1-based. */
    current: number
    /** The plan step needs the full width; the form steps read better narrow. */
    wide?: boolean
    /** Whoever is signed in. Omitted rather than shown empty while it loads. */
    identity?: string
  }>(),
  { wide: false, identity: '' }
)

const emit = defineEmits<{ navigate: [step: number] }>()

const total = computed(() => props.steps.length)
const currentStep = computed(() => props.steps[props.current - 1])
const pct = computed(() => Math.round((props.current / total.value) * 100))

useHead({
  htmlAttrs: { lang: 'en-MY', class: 'kirim-scroll' },
  title: 'Set up your workspace — InvoKita',
  script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: 'head' }],
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})

useSeoMeta({
  themeColor: [
    { content: BRAND.paper, media: '(prefers-color-scheme: light)' },
    { content: BRAND.ink, media: '(prefers-color-scheme: dark)' },
  ],
})

/* This page paints itself from the semantic tokens, which key off [data-theme]
   — the marketing/auth marker, resolved before first paint by the script
   above. The one component here that answers to the app's `html.dark` marker
   instead is the shared client import modal, and that is handled where it is
   opened rather than for the whole page — see the `showImport` watcher. */
</script>

<template>
  <div class="kirim ob">
    <a href="#ob-step" class="k-skip">Skip to this step</a>

    <!-- ── Step ledger ──────────────────────────────────────────────────── -->
    <aside class="ob__rail k-grain-host" aria-label="Setup progress">
      <KirimGrain id="onboarding" :opacity="0.16" />

      <div class="rail__inner">
        <p class="rail__mark">InvoKita<span class="rail__dot" aria-hidden="true">.</span></p>

        <div class="rail__head">
          <h1 class="rail__title">Set up your workspace</h1>
          <p class="rail__lead">
            About a minute. Everything here can be changed later in Settings.
          </p>
        </div>

        <!-- Compact form of the same information, for when the rail is a
             banner rather than a column. -->
        <div class="rail__compact">
          <p class="compact__label">
            <span class="k-num">Step {{ current }} of {{ total }}</span>
            <span aria-hidden="true">·</span>
            <span class="compact__step">{{ currentStep?.label }}</span>
          </p>
          <div
            class="compact__track"
            role="progressbar"
            :aria-valuenow="current"
            aria-valuemin="1"
            :aria-valuemax="total"
            :aria-valuetext="`Step ${current} of ${total}: ${currentStep?.label}`">
            <span class="compact__fill" :style="{ width: `${pct}%` }" />
          </div>
        </div>

        <!-- NOT `.ledger`: app-desk.css owns that name globally for the invoice
             table shell, and this page mirrors `html.dark` so those rules are
             live here. It wrapped the steps in a bordered --desk-card box. -->
        <ol class="ob-steps">
          <li
            v-for="(s, i) in steps"
            :key="s.label"
            class="ob-steps__item"
            :class="{
              'is-done': i + 1 < current,
              'is-current': i + 1 === current,
            }">
            <component
              :is="i + 1 < current ? 'button' : 'div'"
              class="ob-steps__row"
              :type="i + 1 < current ? 'button' : undefined"
              :aria-current="i + 1 === current ? 'step' : undefined"
              @click="i + 1 < current && emit('navigate', i + 1)">
              <span class="ob-steps__marker" aria-hidden="true">
                <svg v-if="i + 1 < current" viewBox="0 0 16 16">
                  <path
                    d="M3.4 8.4 6.4 11.4 12.6 4.6"
                    fill="none" stroke="currentColor" stroke-width="2.2"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span v-else class="k-num">{{ i + 1 }}</span>
              </span>

              <span class="ob-steps__text">
                <span class="ob-steps__label">
                  {{ s.label }}
                  <span v-if="s.optional" class="ob-steps__optional">optional</span>
                </span>
                <span v-if="s.hint" class="ob-steps__hint">{{ s.hint }}</span>
                <span v-if="i + 1 < current" class="k-sr">— completed, go back to this step</span>
              </span>
            </component>
          </li>
        </ol>

        <p v-if="identity" class="rail__foot">
          Signed in as
          <strong class="rail__who">{{ identity }}</strong>
        </p>
      </div>
    </aside>

    <!-- ── Working area ─────────────────────────────────────────────────── -->
    <main class="ob__main">
      <div id="ob-step" class="ob__inner" :class="{ 'ob__inner--wide': wide }">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.ob {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background-color: var(--surface-page);
}

/* ─── Rail ───────────────────────────────────────────────────────────────── */
.ob__rail {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background-color: var(--surface-slab);
  color: var(--text-on-slab);
  padding: var(--space-4) var(--gutter);
}
.rail__inner {
  position: relative;
  z-index: 1;
  display: grid;
  gap: var(--space-4);
}

.rail__mark {
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-on-slab);
}
.rail__dot {
  color: var(--text-on-slab-accent);
  margin-left: -0.06em;
}

/* The full heading and the step list are the column form; below 1024 the rail
   is a banner and only the compact progress line survives. */
.rail__head,
.ob-steps,
.rail__foot {
  display: none;
}

.rail__compact {
  display: grid;
  gap: var(--space-2);
}
.compact__label {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-on-slab-muted);
}
.compact__step {
  color: var(--text-on-slab);
}
.compact__track {
  height: 3px;
  border-radius: var(--radius-full);
  background-color: var(--border-on-slab);
  overflow: hidden;
}
.compact__fill {
  display: block;
  height: 100%;
  border-radius: var(--radius-full);
  background-color: var(--text-on-slab-accent);
  transition: width var(--dur-slow) var(--ease-out);
}

/* ─── Steps ──────────────────────────────────────────────────────────────────
   Spacing here is driven by one number: the marker is 1.75rem, and the label's
   line box is set to the same 1.75rem so a single-line step centres itself
   against its own marker without a magic padding offset. Everything else — the
   row's vertical padding, where the connector starts and stops — is measured
   off that marker rather than eyeballed, which is what keeps the rhythm even
   when one row grows a second line for its hint.
   ─────────────────────────────────────────────────────────────────────────── */
.ob-steps {
  --_marker: 1.75rem;
  --_pad: var(--space-4);
  /* Cancels the first and last row's own padding, so the 40px the rail puts
     between its blocks is the 40px you actually see above and below the list
     rather than 40 + a row's worth of air. */
  margin: calc(var(--_pad) * -1) 0;
  padding: 0;
  list-style: none;
  gap: 0; /* the pitch comes from row padding, so the connector can span it */
}

.ob-steps__item {
  position: relative;
}

/* A hairline from one marker to the next. Five circles with air between them
   read as five unrelated chips; joined up, the air reads as a sequence with
   room to breathe, which is the point of giving it the room. */
.ob-steps__item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: calc(var(--_marker) / 2 - 0.5px);
  top: calc(var(--_pad) + var(--_marker) + var(--space-1));
  bottom: calc(var(--space-1) - var(--_pad));
  width: 1px;
  background-color: var(--border-on-slab);
}
.ob-steps__item.is-done::before {
  background-color: var(--a-green-32);
}

.ob-steps__row {
  display: grid;
  grid-template-columns: var(--_marker) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
  width: 100%;
  padding: var(--_pad);
  margin-inline: calc(var(--_pad) * -1);
  border: 0;
  border-radius: var(--radius-md);
  background: none;
  font-family: inherit;
  text-align: left;
  color: inherit;
}
button.ob-steps__row {
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-out);
}
button.ob-steps__row:hover {
  background-color: var(--chip-on-slab-bg);
}

.ob-steps__marker {
  display: grid;
  place-items: center;
  width: var(--_marker);
  height: var(--_marker);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-on-slab-muted);
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out);
}
.ob-steps__marker svg {
  width: 15px;
  height: 15px;
}

.is-done .ob-steps__marker {
  border-color: var(--border-accent);
  background-color: var(--a-green-12);
  color: var(--text-on-slab-accent);
}
.is-current .ob-steps__marker {
  border-color: transparent;
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}

.ob-steps__text {
  display: block;
  min-width: 0;
}
.ob-steps__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  /* = --_marker, so the label and its marker share a centre line */
  line-height: 1.75rem;
  color: var(--text-on-slab-muted);
  transition: color var(--dur-base) var(--ease-out);
}
.is-current .ob-steps__label,
.is-done .ob-steps__label {
  color: var(--text-on-slab);
}
.ob-steps__optional {
  display: inline-block;
  margin-left: var(--space-2);
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
  background-color: var(--chip-on-slab-bg);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  line-height: 1.5;
  text-transform: uppercase;
  vertical-align: 2px;
  color: var(--text-on-slab-muted);
}
/* Only the step being worked on explains itself. Five hints at once is a
   paragraph pretending to be a list. */
.ob-steps__hint {
  display: none;
  margin-top: var(--space-1);
  padding-bottom: var(--space-1);
  max-width: 15rem;
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
}
.is-current .ob-steps__hint {
  display: block;
}

.rail__foot {
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-on-slab);
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
}
.rail__who {
  display: block;
  font-weight: var(--weight-bold);
  color: var(--text-on-slab);
  word-break: break-all;
}

/* ─── Working area ───────────────────────────────────────────────────────── */
.ob__main {
  display: flex;
  justify-content: center;
  padding: var(--space-7) var(--gutter) var(--space-9);
  background-color: var(--surface-page);
}
.ob__inner {
  width: 100%;
  max-width: 32rem;
  transition: max-width var(--dur-slow) var(--ease-out);
}
.ob__inner--wide {
  max-width: var(--container-wide);
}

/* ─── Breakpoints ────────────────────────────────────────────────────────── */
@media (min-width: 1024px) {
  .ob {
    grid-template-rows: none;
    grid-template-columns: 21rem minmax(0, 1fr);
  }
  .ob__rail {
    padding: var(--space-8) var(--space-7);
    border-right: 1px solid var(--border-default);
  }
  .rail__inner {
    position: sticky;
    top: var(--space-8);
    gap: var(--space-7);
    align-content: start;
  }
  .rail__head,
  .rail__foot {
    display: block;
  }
  .ob-steps {
    display: grid;
  }
  .rail__compact {
    display: none;
  }
  .rail__title {
    font-size: var(--text-xl);
    font-weight: var(--weight-extrabold);
    letter-spacing: var(--tracking-tighter);
    line-height: var(--leading-snug);
    color: var(--text-on-slab);
    text-wrap: balance;
  }
  .rail__lead {
    margin-top: var(--space-3);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    color: var(--text-on-slab-muted);
  }
  .ob__main {
    padding: var(--space-9) var(--space-8) var(--space-10);
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .compact__fill,
  .ob__inner {
    transition: none;
  }
}
</style>
