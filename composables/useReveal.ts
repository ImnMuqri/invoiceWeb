/**
 * Scroll-linked reveals, built on motion.dev (https://motion.dev).
 *
 * Motion philosophy for the KIRIM direction: "conversation cadence".
 * Nothing on this page moves faster, further, or longer than a chat message
 * arriving. Hard limits, enforced here rather than by convention:
 *   - duration <= 300ms   (--dur-slow)
 *   - travel   <= 14px    (--reveal-distance, under the 16px ceiling)
 *   - easing   = ease-out only, never a spring or a bounce
 *
 * motion.dev is loaded with a dynamic import so it stays off the critical
 * path — the page is fully readable and interactive before it arrives.
 */

const REVEAL_DISTANCE = 14
const REVEAL_DURATION = 0.3
const STAGGER = 0.06
const FAILSAFE_MS = 1600

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Minimal `inView`, using the platform's IntersectionObserver directly.
 * Same call signature as motion's helper (element, callback, options) and
 * returns a stop function, so swapping back is a one-line change.
 */
function observeInView(
  el: Element,
  onEnter: () => void,
  opts: { amount?: number; margin?: string } = {}
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onEnter()
    return () => {}
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) onEnter()
    },
    { threshold: opts.amount ?? 0, rootMargin: opts.margin ?? '0px' }
  )
  io.observe(el)
  return () => io.disconnect()
}

function revealNow(el: Element) {
  ;(el as HTMLElement).dataset.revealed = 'true'
}

/**
 * Reveals every [data-reveal] element inside `root` as it enters the viewport.
 * Elements sharing a [data-reveal-group] value animate as a staggered set.
 */
export function useReveal(root: Ref<HTMLElement | null>) {
  let cleanups: Array<() => void> = []
  let failsafe: ReturnType<typeof setTimeout> | undefined

  onMounted(async () => {
    const host = root.value ?? document.body
    const targets = Array.from(host.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!targets.length) return

    // Net 3: honour the OS setting, skip motion entirely.
    if (prefersReducedMotion()) {
      targets.forEach(revealNow)
      return
    }

    // Net 2: if anything below throws or never fires, show everything anyway.
    failsafe = setTimeout(() => targets.forEach(revealNow), FAILSAFE_MS)

    try {
      /* `animate` comes from motion/mini — the Web Animations API driver,
         a fraction of the size of the full JS engine. These reveals are plain
         opacity/transform tweens, so none of the engine's spring, layout or
         independent-transform machinery is needed.
         Viewport detection uses the platform's own IntersectionObserver
         (see observeInView): importing motion's `inView` helper pulls the full
         DOM entry back in and cost ~65KB gzipped for what is a 15-line
         wrapper. Motion still drives every animation on the page. */
      const { animate } = await import('motion/mini')

      // Group siblings so a row of cards arrives as a sequence, not at once.
      const groups = new Map<string, HTMLElement[]>()
      const singles: HTMLElement[] = []
      for (const el of targets) {
        const g = el.dataset.revealGroup
        if (g) {
          if (!groups.has(g)) groups.set(g, [])
          groups.get(g)!.push(el)
        } else {
          singles.push(el)
        }
      }

      const play = (el: HTMLElement, delay = 0) => {
        revealNow(el)
        animate(
          el,
          { opacity: [0, 1], transform: [`translateY(${REVEAL_DISTANCE}px)`, 'translateY(0px)'] },
          { duration: REVEAL_DURATION, delay, ease: [0.16, 1, 0.3, 1] }
        )
      }

      for (const el of singles) {
        cleanups.push(
          observeInView(el, () => play(el), { amount: 0.15, margin: '0px 0px -8% 0px' })
        )
      }

      for (const members of groups.values()) {
        const lead = members[0]
        cleanups.push(
          observeInView(
            lead,
            () => members.forEach((el, i) => play(el, i * STAGGER)),
            { amount: 0.1, margin: '0px 0px -8% 0px' }
          )
        )
      }
    } catch {
      targets.forEach(revealNow)
    }
  })

  onBeforeUnmount(() => {
    if (failsafe) clearTimeout(failsafe)
    cleanups.forEach((stop) => stop())
    cleanups = []
  })
}

/**
 * Drives the signature moment: one WhatsApp thread that advances as the reader
 * scrolls. Each chapter element reports its index when it reaches the middle
 * of the viewport, and the sticky phone plays the thread up to that point.
 */
export function useStoryProgress(
  chapters: Ref<HTMLElement[]>,
  onChange: (index: number) => void
) {
  let cleanups: Array<() => void> = []

  onMounted(() => {
    if (!chapters.value.length) return

    // Without motion, land on the final state so the argument still completes.
    if (prefersReducedMotion()) {
      onChange(chapters.value.length - 1)
      return
    }

    try {
      /* A narrow band across the middle of the viewport, so exactly one
         chapter is active at a time AND scrolling back up re-activates the
         previous one. Watching for "55% visible" instead made `active` a
         ratchet that only ever counted upwards. */
      chapters.value.forEach((el, i) => {
        cleanups.push(
          observeInView(el, () => onChange(i), { amount: 0, margin: '-45% 0px -45% 0px' })
        )
      })
    } catch {
      onChange(chapters.value.length - 1)
    }
  })

  onBeforeUnmount(() => {
    cleanups.forEach((stop) => stop())
    cleanups = []
  })
}
