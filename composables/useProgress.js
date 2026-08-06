/**
 * The page progress bar.
 *
 * One counter, fed from two places: route changes (page:start / page:finish)
 * and every request that goes through $api. "Something on this page is loading"
 * is almost always the second one — the route resolves instantly and then the
 * page sits there fetching — so a router-only indicator, which is what Nuxt
 * gives you out of the box, would be dark for the part that actually takes time.
 *
 * Two pieces of timing do the real work, and both exist to stop the bar being
 * more distracting than the wait:
 *
 *   SHOW_DELAY  A request that finishes in under 140ms never shows a bar at all.
 *               Most cached calls land well inside that, and a bar that appears
 *               and vanishes within a frame reads as a glitch, not as progress.
 *
 *   MIN_VISIBLE Once it IS showing, it stays for at least 320ms. Without this a
 *               request that takes 150ms would paint the bar and remove it two
 *               frames later, which is the same flicker arriving by a different
 *               route.
 *
 * The fill never reaches 100% on its own. It eases toward 92% and waits there,
 * because the honest answer to "how much longer" is unknown — an XHR reports no
 * progress until it completes. Claiming 100% before the data lands would be a
 * lie the user catches every time. 100% is only ever set by completion.
 */
import { computed } from "vue";

/* Module scope, and only ever touched on the client. Timers cannot live in
   useState, and nothing here should run during SSR — there is no bar to animate
   on the server, and shared module state across requests would leak between
   users. Every entry point below returns early unless import.meta.client. */
let trickleTimer = null;
let showTimer = null;
let shownAt = 0;

export const useProgress = () => {
  /* useState rather than module refs: these are read during render, and on the
     server that has to be per-request state. */
  const pending = useState("progress-pending", () => 0);
  const value = useState("progress-value", () => 0);
  const visible = useState("progress-visible", () => false);

  const SHOW_DELAY = 140;
  const MIN_VISIBLE = 320;
  const CEILING = 92;

  const stopTrickle = () => {
    if (trickleTimer) {
      clearInterval(trickleTimer);
      trickleTimer = null;
    }
  };

  const beginTrickle = () => {
    stopTrickle();
    trickleTimer = setInterval(() => {
      /* Decelerating: each step covers a fraction of what is left, so it slows
         as it approaches the ceiling instead of stopping dead against it. */
      if (value.value < CEILING) {
        value.value += (CEILING - value.value) * 0.14;
      }
    }, 220);
  };

  const show = () => {
    visible.value = true;
    shownAt = Date.now();
    value.value = 8;
    beginTrickle();
  };

  const hide = () => {
    stopTrickle();
    value.value = 100;
    /* Let the fill animate out to full before it disappears, otherwise the bar
       vanishes mid-travel and the completion is never seen. */
    setTimeout(() => {
      visible.value = false;
      /* Reset only after it has faded, or the next start would animate the
         width backwards from 100 to 0 in view. */
      setTimeout(() => {
        if (!visible.value) value.value = 0;
      }, 200);
    }, 220);
  };

  /** Something started. Safe to nest — this counts, it does not toggle. */
  const start = () => {
    if (!import.meta.client) return;
    pending.value += 1;
    if (pending.value > 1 || visible.value || showTimer) return;
    showTimer = setTimeout(() => {
      showTimer = null;
      /* It may have finished during the delay, which is the whole point. */
      if (pending.value > 0) show();
    }, SHOW_DELAY);
  };

  /** Something finished, successfully or not. */
  const done = () => {
    if (!import.meta.client) return;
    pending.value = Math.max(0, pending.value - 1);
    if (pending.value > 0) return;

    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
      return; // Fast enough that it never appeared.
    }
    if (!visible.value) return;

    const left = MIN_VISIBLE - (Date.now() - shownAt);
    if (left > 0) setTimeout(() => pending.value === 0 && hide(), left);
    else hide();
  };

  /** Hard reset, for a navigation that abandons whatever was in flight. */
  const reset = () => {
    if (!import.meta.client) return;
    stopTrickle();
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    pending.value = 0;
    visible.value = false;
    value.value = 0;
  };

  return {
    value: computed(() => value.value),
    visible: computed(() => visible.value),
    active: computed(() => pending.value > 0),
    start,
    done,
    reset,
  };
};
