<script setup lang="ts">
/**
 * Objection 1 — "an automated reminder will make me look cold."
 *
 * This is the page's signature moment. The argument and the demo are the same
 * object: each claim on the left is proved by the next message arriving in the
 * phone on the right. By the end of the section the reader has watched a full
 * collection cycle complete without the business owner touching anything.
 */
import type { Locale, LandingCopy } from '~/composables/useLandingCopy'
import { useThread, STORY_CHAPTERS } from '~/composables/useThread'
import { useStoryProgress } from '~/composables/useReveal'

const props = defineProps<{ copy: LandingCopy; locale: Locale }>()
const { messages, labels } = useThread(props.locale)

const chapterEls = ref<HTMLElement[]>([])
const active = ref(0)
const isDesktop = ref(false)

/* On mobile the whole thread is shown at once above the chapters — a sticky
   rail on a 390px screen would eat the viewport and fight the page scroll. */
const visibleCount = computed(() =>
  isDesktop.value ? (STORY_CHAPTERS[active.value]?.upTo ?? messages.length) : messages.length
)

let mq: MediaQueryList | undefined
const syncMq = () => {
  isDesktop.value = mq?.matches ?? false
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 1024px)')
  syncMq()
  mq.addEventListener('change', syncMq)
})
onBeforeUnmount(() => mq?.removeEventListener('change', syncMq))

useStoryProgress(chapterEls, (i) => {
  if (isDesktop.value) active.value = i
})

function setChapterEl(el: Element | ComponentPublicInstance | null, i: number) {
  if (el instanceof HTMLElement) chapterEls.value[i] = el
}
</script>

<template>
  <section id="how" class="story k-section k-section--loose" aria-labelledby="story-title">
    <div class="k-container k-container--wide">
      <!-- DOM order is heading -> phone -> chapters, which is exactly the
           mobile reading order and a sensible screen-reader order. Grid areas
           move the phone into a sticky right-hand rail at >=1024 without
           reordering the document. -->
      <div class="story__grid">
        <header class="story__head" data-reveal>
          <p class="k-eyebrow">{{ copy.thread.eyebrow }}</p>
          <h2 id="story-title" class="k-headline story__title"><KirimText :text="copy.thread.title" /></h2>
          <p class="k-lead story__lead">{{ copy.thread.lead }}</p>
        </header>

        <div class="story__rail">
          <div class="story__sticky">
            <KirimPhone
              :messages="messages"
              :labels="labels"
              :visible-count="visibleCount"
              :instant="!isDesktop" />
          </div>
        </div>

        <ol class="story__chapters">
          <li
            v-for="(point, i) in copy.thread.points"
            :key="point.title"
            :ref="(el) => setChapterEl(el, i)"
            class="chapter"
            :class="{ 'chapter--active': isDesktop && active === i }">
            <span class="chapter__index k-num" aria-hidden="true">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <h3 class="k-title chapter__title">{{ point.title }}</h3>
            <p class="k-body chapter__body">{{ point.body }}</p>
          </li>
        </ol>
      </div>

      <p class="story__note" data-reveal>
        <svg class="story__note-ico" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="M8 7.2v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          <circle cx="8" cy="4.9" r="0.9" fill="currentColor" />
        </svg>
        {{ copy.thread.senderNote }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.story {
  background-color: var(--surface-sunken);
}

.story__head {
  max-width: var(--measure);
}
.story__title {
  margin-block: var(--space-4) var(--space-5);
}
.story__lead {
  max-width: 42rem;
}

.story__grid {
  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
  grid-template-areas:
    'head'
    'rail'
    'chapters';
}
.story__head { grid-area: head; }
.story__rail { grid-area: rail; }
.story__chapters { grid-area: chapters; }

.story__rail {
  display: flex;
  justify-content: center;
}

/* ─── Chapters ──────────────────────────────────────────────────────────── */
.story__chapters {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: chapter;
}

.chapter {
  position: relative;
  padding-left: var(--space-6);
  border-left: 2px solid var(--border-default);
  transition:
    border-color var(--dur-slow) var(--ease-out),
    opacity var(--dur-slow) var(--ease-out);
}
.chapter__index {
  display: block;
  font-size: var(--text-2xs);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-widest);
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
  transition: color var(--dur-slow) var(--ease-out);
}
.chapter__title {
  margin-bottom: var(--space-3);
}
.chapter__body {
  max-width: 34rem;
}

/* ─── Sender note ───────────────────────────────────────────────────────── */
.story__note {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  max-width: 46rem;
  margin-top: clamp(2.5rem, 5vw, 3.5rem);
  padding: var(--space-5);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background-color: var(--surface-raised);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.story__note-ico {
  width: 17px;
  height: 17px;
  flex: none;
  margin-top: 2px;
  color: var(--text-accent);
}

/* ─── 1024: sticky rail, dimmed inactive chapters ───────────────────────── */
@media (min-width: 1024px) {
  .story__grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    grid-template-areas:
      'head     rail'
      'chapters rail';
    grid-template-rows: auto 1fr;
    column-gap: clamp(3rem, 6vw, 5.5rem);
    row-gap: 0;
    align-items: start;
  }
  .story__chapters {
    gap: 0;
    /* row-gap is 0 so the rail can span both rows cleanly; the breathing room
       between the heading and the first chapter is restored here instead. */
    margin-top: clamp(2.5rem, 5vw, 3.5rem);
  }

  /* Two things have to be true for the phone to stay put, and both were wrong:
     1. The RAIL must span the full section, so the sticky child has somewhere
        to travel. `align-items: start` on the grid was shrink-wrapping it.
     2. The STICKY CHILD must NOT stretch to that same height — the rail is a
        flex container, so its default `align-items: stretch` was making the
        phone 1603px tall, exactly as tall as the rail. A sticky element the
        size of its own container has a pin window of zero, which is why it
        simply scrolled away. */
  .story__rail {
    align-self: stretch;
    height: 100%;
    align-items: flex-start;
  }

  .story__sticky {
    position: sticky;
    /* Vertically centred in the viewport (the phone is ~37rem tall), with a
       floor so it clears the nav on short laptop screens. */
    top: max(5.5rem, calc(50vh - 18.5rem));
    display: flex;
    justify-content: center;
  }

  /* Scroll runway. A sticky element stays pinned for
     (container height − offset − element height); with short chapters the
     container ran out and the phone scrolled away by the third bullet. Each
     chapter is now sized in viewport units so the runway scales with the
     screen, and the column carries trailing padding so the container outlasts
     the last chapter. */
  .chapter {
    padding-block: clamp(3rem, 10vh, 6rem);
  }
  .chapter:first-child {
    padding-top: 0;
  }
  .story__chapters {
    /* keeps the last chapter inside the pin window rather than level with the
       container's bottom edge, where the phone would be releasing */
    padding-bottom: clamp(3rem, 14vh, 8rem);
  }
  /* The active chapter is signalled by the rule and the numeral only.
     Dimming the inactive chapters with opacity was the obvious move and it
     was wrong: body copy at 0.42 opacity lands around 2.5:1, so two thirds of
     this section would have failed AA at any given moment. The green rule
     carries the same signal and costs nothing in contrast. */
  .chapter--active {
    border-left-color: var(--surface-accent);
    border-left-width: 3px;
    padding-left: calc(var(--space-6) - 1px);
  }
  .chapter--active .chapter__index {
    color: var(--text-accent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chapter {
    transition: none;
  }
}
</style>
