<script setup>
/**
 * REFERRALS (spec 09, part B).
 *
 * Rebuilt on the desk design layer, like the rest of the app — no Tailwind
 * utilities, so nothing here depends on the `!important` dark-mode remaps.
 *
 * Four numbers, not one. Clicks, signups, converted and credit are separate
 * because they are separate problems: nobody clicking is a sharing problem,
 * clicks without signups is a landing-page problem, and signups without
 * conversions is a product problem. A single "referrals" figure hides which one
 * you have and therefore what to do about it.
 *
 * The share text is prefilled in English and Malay because most sharing here
 * happens on WhatsApp, and a message somebody has to compose is a message they
 * do not send.
 */
import { computed, onMounted, ref } from "vue";
import { useReferralStore } from "~/stores/referralStore";
import { useUiStore } from "~/stores/uiStore";
/* `cash`, not `money`: money() rounds to whole ringgit, and the cap can grant a
   partial credit (a conversion worth RM2.50 when only that much of the monthly
   allowance is left). Rounding a balance somebody is owed up to "RM 3" is the
   kind of small dishonesty that costs trust in a page whose entire job is to
   say what they have earned. */
import { cash } from "~/utils/invoice";
import { formatDate } from "~/utils/date";

const referralStore = useReferralStore();
const uiStore = useUiStore();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const lang = ref("en");
const copied = ref("");

onMounted(() => referralStore.fetchStats());

const stats = computed(() => referralStore.stats);
const terms = computed(() => stats.value.terms || {});

const shareMessage = computed(() => stats.value.share?.[lang.value] || "");

const copy = async (what, text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copied.value = what;
    setTimeout(() => (copied.value = ""), 2000);
  } catch {
    notify("Could not reach your clipboard — select the text and copy it.", "error");
  }
};

/* wa.me rather than a share sheet: it is the channel this is actually shared
   on, and it works on desktop where the Web Share API does not. */
const whatsappHref = computed(
  () => `https://wa.me/?text=${encodeURIComponent(shareMessage.value)}`,
);

const STATUS_LABEL = {
  PENDING: "Signed up",
  CONVERTED: "Subscribed",
  REVERSED: "Refunded",
  REJECTED: "Not counted",
};

const STATUS_CHIP = {
  PENDING: "chip--idle",
  CONVERTED: "chip--paid",
  REVERSED: "chip--late",
  REJECTED: "chip--idle",
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Refer someone</h1>
        <p class="desk__sub">
          Share your link. When somebody you sent subscribes, you both get
          something — they get their first month discounted, you get credit
          against your next payment.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('referrals')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- ── The four figures ─────────────────────────────────────────────── -->
    <section class="strip" aria-label="Referral summary">
      <div>
        <p class="desk__eyebrow">Credit earned</p>
        <p class="strip__v">RM {{ cash(stats.creditSen) }}</p>
        <p class="strip__n">
          Comes off your next subscription payment automatically
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Link opened</p>
        <p class="strip__v">{{ stats.clicks }}</p>
        <p class="strip__n">
          {{ stats.clicks ? "People who followed your link" : "Nobody has opened it yet" }}
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Signed up</p>
        <p class="strip__v">{{ stats.signups }}</p>
        <p class="strip__n">
          {{ stats.converted }} went on to subscribe
        </p>
      </div>
    </section>

    <!-- ── The link ─────────────────────────────────────────────────────── -->
    <section class="card" aria-labelledby="ref-link">
      <div class="card__head">
        <div>
          <h2 id="ref-link" class="card__title">Your link</h2>
          <p class="money__note">
            Anyone who signs up through this within
            {{ terms.attributionWindowDays || 30 }} days counts as yours.
          </p>
        </div>
      </div>

      <p class="reflink">{{ stats.url || "…" }}</p>
      <div class="reflink__acts">
        <button
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--sm"
          @click="copy('link', stats.url)">
          <UiIcon
            :icon="copied === 'link' ? 'heroicons:check' : 'heroicons:clipboard'"
            custom-class="w-4 h-4" />
          {{ copied === "link" ? "Copied" : "Copy link" }}
        </button>
      </div>

      <!-- ── Prefilled message ────────────────────────────────────────────
           Written to be pasted into a chat: short, first person, and it leads
           with what the reader gets rather than with what the sender earns. A
           share message that reads like an advert is one people rewrite or
           quietly do not send. -->
      <div class="refshare">
        <div class="refshare__head">
          <span class="f__label">A message to go with it</span>
          <div class="segs" role="group" aria-label="Message language">
            <button
              v-for="l in [
                { key: 'en', label: 'English' },
                { key: 'ms', label: 'Bahasa Malaysia' },
              ]"
              :key="l.key"
              type="button"
              class="seg"
              :class="{ 'seg--on': lang === l.key }"
              :aria-pressed="lang === l.key"
              @click="lang = l.key">
              {{ l.label }}
            </button>
          </div>
        </div>

        <p class="deliver__msg">{{ shareMessage }}</p>

        <div class="deliver__msg-acts">
          <a
            :href="whatsappHref"
            target="_blank"
            rel="noopener"
            class="desk-btn desk-btn--primary desk-btn--sm">
            <UiIcon icon="ic:baseline-whatsapp" custom-class="w-4 h-4" />
            Share on WhatsApp
          </a>
          <button
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--sm"
            @click="copy('msg', shareMessage)">
            <UiIcon
              :icon="copied === 'msg' ? 'heroicons:check' : 'heroicons:clipboard'"
              custom-class="w-4 h-4" />
            {{ copied === "msg" ? "Copied" : "Copy message" }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── How it works, stated plainly ─────────────────────────────────── -->
    <section class="card" aria-labelledby="ref-terms">
      <div class="card__head">
        <h2 id="ref-terms" class="card__title">How it works</h2>
      </div>
      <ul class="refterms">
        <li>
          They get <b>RM {{ cash(terms.referredDiscountSen || 0) }}</b> off their
          first month.
        </li>
        <li>
          You get <b>RM {{ cash(terms.creditSen || 0) }}</b> credit — but only
          once they actually subscribe, not when they sign up.
        </li>
        <li>
          Up to <b>RM {{ cash(terms.periodCapSen || 0) }}</b> a month.
          <template v-if="terms.remainingThisPeriodSen !== undefined">
            RM {{ cash(terms.remainingThisPeriodSen) }} of that is still
            available this month.
          </template>
        </li>
        <li>
          If their subscription is refunded, the credit comes back off. Nobody
          is charged for it — the balance just goes back down.
        </li>
      </ul>
    </section>

    <!-- ── Who you have sent ────────────────────────────────────────────────
         Addresses are masked. The referrer is owed proof their referral landed,
         not a view into somebody else's account. -->
    <section class="card" aria-labelledby="ref-list">
      <div class="card__head">
        <h2 id="ref-list" class="card__title">People you have referred</h2>
      </div>

      <ul v-if="stats.recent?.length" class="work">
        <li v-for="r in stats.recent" :key="r.id">
          <div class="work__row">
            <span class="work__client">{{ r.who }}</span>
            <span class="work__meta">
              <span class="chip" :class="STATUS_CHIP[r.status] || 'chip--idle'">
                <i class="chip__dot" aria-hidden="true"></i
                >{{ STATUS_LABEL[r.status] || r.status }}
              </span>
              · {{ formatDate(r.signedUpAt) }}
            </span>
            <span class="work__amount">
              <template v-if="r.status === 'CONVERTED' && r.creditSen">
                RM {{ cash(r.creditSen) }}
              </template>
              <template v-else>—</template>
            </span>
          </div>
        </li>
      </ul>

      <div v-else class="empty">
        <p class="empty__title">Nobody yet.</p>
        <p class="empty__body">
          Anyone who signs up through your link appears here, along with whether
          they went on to subscribe.
        </p>
      </div>
    </section>

    <!-- Only for accounts still holding the old count-based credits. Nothing
         writes to that counter any more; this exists so nobody loses what they
         already earned. -->
    <section v-if="stats.legacyCredits" class="banner">
      <UiIcon icon="heroicons:gift" custom-class="w-5 h-5" />
      <span>
        You have {{ stats.legacyCredits }} referral
        {{ stats.legacyCredits === 1 ? "credit" : "credits" }} from before we
        changed how rewards work. They can still be redeemed for a free month —
        contact support and we will apply it.
      </span>
    </section>

    <UiToast v-model="toast" />
  </div>
</template>

<style scoped>
.reflink {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--desk-text);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--desk-radius-inset);
  background-color: var(--desk-item);
  word-break: break-all;
}
.reflink__acts {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.refshare {
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--desk-line);
}
.refshare__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.refterms {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding-left: var(--space-5);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--desk-text-2);
}
</style>
