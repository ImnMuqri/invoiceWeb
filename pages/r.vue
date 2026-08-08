<script setup>
/**
 * The referral link landing page (spec 09, part B).
 *
 * `invokita.my/r?ref=CODE` → record the click → `/register?ref=CODE`.
 *
 * A real page rather than a redirect in the register route, because the click
 * has to be counted before the visitor moves on and a redirect gives nowhere to
 * do that. It is deliberately almost empty: nobody should ever read it, and
 * anything worth reading here would just delay the person who came to sign up.
 *
 * PUBLIC. `/r` is not in PROTECTED_PREFIXES and must never be — the entire
 * point is that somebody with no account can follow it.
 *
 * THE REDIRECT ALWAYS HAPPENS. If the click cannot be recorded — the API is
 * down, the code does not exist, the request is blocked — the visitor still
 * lands on the signup form. A statistic is never worth a lost signup, which is
 * why every failure path below ends in the same place as the success path.
 */
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

definePageMeta({ layout: false });

const route = useRoute();
const router = useRouter();

/* Nothing is indexed here: this url exists to be clicked from a message, not
   found in a search result, and a thin redirect page in the index is a
   liability. */
useHead({
  title: "InvoKita",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

onMounted(async () => {
  const code = String(route.query.ref || "").trim();
  const via = String(route.query.via || "").trim();

  if (code) {
    try {
      const { $api } = useNuxtApp();
      /* `quiet` keeps the global progress bar still — this is a background
         beacon on a page the visitor is already leaving, and a loading bar
         flashing on the way to the signup form reads as a stall. */
      await $api.post(
        "/referral/click",
        { code, ...(via ? { via } : {}) },
        { quiet: true },
      );
    } catch {
      /* Deliberately swallowed. See the note at the top: the visitor's journey
         never fails over a statistic. */
    }
  }

  /* `replace`, not `push`: pressing back from the signup form should return to
     wherever the link was shared, not bounce through this page again. */
  router.replace(code ? `/register?ref=${encodeURIComponent(code)}` : "/register");
});
</script>

<template>
  <div class="rr">
    <UiLogo size="lg" :showText="true" containerClass="flex-col" />
    <p class="rr__note">Taking you to sign up…</p>
  </div>
</template>

<style scoped>
.rr {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: #f8fafc;
}
.rr__note {
  font-size: 0.875rem;
  color: #64748b;
}
</style>
