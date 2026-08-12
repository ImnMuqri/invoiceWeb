<script setup>
/**
 * Admin → General.
 *
 * Five kill switches and one broadcast message. These turn features off for
 * every account on the platform at once, so the copy says what each one stops
 * rather than what it "enables", and the save button says what it does rather
 * than "Deploy System Changes".
 *
 * Each `off` line has to say what it does NOT stop as well. An admin reaching
 * for one of these is usually mid-incident, and "plan upgrades off" is only a
 * decision you can make quickly if you already know it does not cancel anybody.
 */
const props = defineProps({
  config: { type: Object, required: true },
});

const FLAGS = [
  {
    key: "invoiceCreationEnabled",
    name: "Creating invoices",
    off: "Nobody can start a new invoice. Existing ones still open, send and get paid.",
  },
  {
    key: "whatsappEnabled",
    name: "WhatsApp delivery",
    off: "No invoices or reminders go out over WhatsApp, on our number or a user's own Twilio.",
  },
  {
    key: "emailEnabled",
    name: "Email delivery",
    off: "No invoices or reminders are emailed. This is the one most users notice first.",
  },
  {
    key: "paymentsEnabled",
    name: "Online payments",
    off: "Payment links stop working. Clients can still be shown bank details.",
  },
  {
    key: "planUpgradesEnabled",
    name: "Paid plans",
    off: "Free is the only plan anyone can pick, in onboarding and in Settings. Current paid plans keep running and still renew, and people can still cancel down to Free.",
  },
];
</script>

<template>
  <div>
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Feature switches</h2>
        <p class="sec__note">
          These apply to every account at once. Turning one off takes effect
          immediately — there is no rollout.
        </p>
      </div>

      <div class="flags">
        <div v-for="f in FLAGS" :key="f.key" class="flag">
          <label class="tog" :for="`flag-${f.key}`">
            <input
              :id="`flag-${f.key}`"
              type="checkbox"
              class="tog__inp"
              :checked="!!config[f.key]"
              @change="config[f.key] = !config[f.key]" />
            <span class="tog__track" aria-hidden="true"></span>
          </label>
          <span class="flag__body">
            <span class="flag__name">{{ f.name }}</span>
            <span class="flag__note">
              <template v-if="config[f.key]">Working normally.</template>
              <template v-else>{{ f.off }}</template>
            </span>
          </span>
          <span class="flag__state" :class="{ 'flag__state--on': config[f.key] }">
            {{ config[f.key] ? "On" : "Off" }}
          </span>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Notice on everyone's dashboard</h2>
        <p class="sec__note">
          Leave it empty and no banner shows. Keep it to one sentence — it sits
          above the thing people came to do.
        </p>
      </div>

      <div class="f">
        <label class="sr-only" for="notice">Broadcast notice</label>
        <textarea
          id="notice"
          v-model="config.globalNotice"
          rows="3"
          class="inp no-ik"
          placeholder="e.g. Payments are paused for about an hour while we move providers. Invoices are unaffected."></textarea>
      </div>

      <div class="f">
        <span class="f__label">What they will see</span>
        <div v-if="config.globalNotice" class="banner">
          <UiIcon icon="heroicons:megaphone" custom-class="w-5 h-5" />
          <span>{{ config.globalNotice }}</span>
        </div>
        <p v-else class="f__hint">
          Nothing. No banner is shown while this is empty.
        </p>
      </div>
    </section>

    <!-- The save footer is rendered by the page, as a sibling of .set__body
         inside the panel — same as Settings. It was here, pulled to the panel
         edges with `margin: 0 -24px -24px`, which only lined up while
         .set__body's padding happened to be exactly --space-5 and would have
         hung over the edge the moment that changed. -->
  </div>
</template>
