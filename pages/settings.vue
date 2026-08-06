<script setup>
/**
 * SETTINGS — your account with us.
 *
 * Three tabs now. Details, Documents, Email and WhatsApp moved to /business,
 * where they belong: those describe your business as clients experience it, and
 * these describe your relationship with this software. What is left is money in
 * (Payments), money out (Plan) and the key to the door (Security).
 *
 * Bugs fixed when this page was seven tabs, still standing:
 *
 *  1. Whether a tab has a save footer is a property of the tab. It used to
 *     render for every tab except Billing, which put a permanently disabled
 *     primary button on Security.
 *  2. Two native `confirm()` dialogs — disconnecting a gateway, removing a logo
 *     — in an app with UiModal on every other destructive action.
 *  3. The QR upload accepted any file of any size and fed it straight to an
 *     Image, while the logo upload two functions away checked both.
 *  4. `authStore.user?.plan.toUpperCase()` guarded `user` and not `plan`.
 *
 * Data contracts unchanged: same stores, same payloads, same endpoints.
 */
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { useSubscribeStore } from "~/stores/subscribeStore";
import jsQR from "jsqr";

const authStore = useAuthStore();
const uiStore = useUiStore();
const subscribeStore = useSubscribeStore();
const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const TABS = [
  { id: "payments", name: "Payments", icon: "heroicons:banknotes", form: "settings", saves: false },
  { id: "billing", name: "Plan", icon: "heroicons:sparkles", form: null, saves: false },
  { id: "security", name: "Security", icon: "heroicons:lock-closed", form: null, saves: false },
];

/* The four tabs that left. A bookmark, a help-modal link or a habit still
   arrives here asking for them, and a silent fallback to Payments would look
   like the setting had been deleted. Send them where it went. */
const MOVED = {
  general: "details",
  invoice_config: "documents",
  details: "details",
  documents: "documents",
  email: "email",
  whatsapp: "whatsapp",
};

const activeTab = ref(TABS.some((t) => t.id === route.query.tab) ? route.query.tab : "payments");
const tab = computed(() => TABS.find((t) => t.id === activeTab.value) || TABS[0]);

const route_ = (next) => {
  if (MOVED[next]) {
    router.replace({ path: "/business", query: { tab: MOVED[next] } });
    return;
  }
  activeTab.value = TABS.some((t) => t.id === next) ? next : "payments";
};

onMounted(() => route_(route.query.tab));
watch(() => route.query.tab, route_);

const go = (id) => {
  if (!id) return router.push("/clients");
  if (MOVED[id]) return router.push({ path: "/business", query: { tab: MOVED[id] } });
  router.push({ query: { ...route.query, tab: id } });
};

/* ─── Forms ─────────────────────────────────────────────────────────────── */
const settingsForm = ref({
  manualBankName: "",
  manualAccountNumber: "",
  manualAccountName: "",
  manualQrCode: "",
});

const cleanSettings = ref({});

const isDirty = computed(() =>
  tab.value.form === "settings"
    ? JSON.stringify(settingsForm.value) !== JSON.stringify(cleanSettings.value)
    : false,
);

const plans = ref([]);
const saving = ref(false);

/* ─── Load ──────────────────────────────────────────────────────────────── */
const fetchPlans = async () => {
  try {
    const { data } = await $api.get("/plans");
    plans.value = data;
  } catch {
    plans.value = [];
  }
};

const providers = ref([]);
const fetchProviders = async () => {
  providers.value = (await authStore.fetchPaymentProviders()) || [];
};

onMounted(async () => {
  /* Gateway return trip. Clearing the flag out of the URL keeps a refresh from
     re-announcing a payment that happened minutes ago. */
  if (route.query.success === "true" || route.query.failed === "true") {
    notify(
      route.query.success === "true"
        ? "You are set up. Your plan is active."
        : "That did not go through, and you have not been charged.",
      route.query.success === "true" ? "success" : "error",
    );
    const q = { ...route.query };
    delete q.success;
    delete q.failed;
    router.replace({ query: q });
  }

  fetchPlans();
  await authStore.fetchProfile();

  const pay = (await authStore.fetchPaymentSettings()) || {};
  settingsForm.value = {
    manualBankName: pay.manualBankName || "",
    manualAccountNumber: pay.manualAccountNumber || "",
    manualAccountName: pay.manualAccountName || "",
    manualQrCode: pay.manualQrCode || "",
  };
  cleanSettings.value = JSON.parse(JSON.stringify(settingsForm.value));

  fetchProviders();
});

/* ─── Save ──────────────────────────────────────────────────────────────── */
const save = async () => {
  saving.value = true;
  try {
    await authStore.updatePaymentSettings(settingsForm.value);
    cleanSettings.value = JSON.parse(JSON.stringify(settingsForm.value));
    notify("Saved.");
  } catch (err) {
    notify(
      err.response?.data?.message ||
        authStore.error ||
        "Could not save that. Your changes are still on screen.",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

/* ─── Payment providers ─────────────────────────────────────────────────── */
const connectModal = ref(false);
const selectedProvider = ref(null);
const disconnectFor = ref(null);
const manualModal = ref(false);

const openConnect = (key) => {
  selectedProvider.value = key;
  connectModal.value = true;
};

const saveConnection = async (data) => {
  try {
    await authStore.updatePaymentProvider(data);
    await fetchProviders();
    notify("Connected. Invoices can take payment through it now.");
  } catch {
    notify("Could not connect that provider.", "error");
  }
};

const confirmDisconnect = async () => {
  const g = disconnectFor.value;
  if (!g) return;
  try {
    const p = providers.value.find((pr) => pr.provider === g.key);
    if (p) await authStore.deletePaymentProvider(p.id);
    await fetchProviders();
    disconnectFor.value = null;
    notify(`${g.name} disconnected.`);
  } catch {
    notify(`Could not disconnect ${g.name}.`, "error");
  }
};

const preferGateway = async (key) => {
  try {
    const p = providers.value.find((pr) => pr.provider === key);
    if (!p) return;
    await authStore.setPreferredPaymentProvider(p.id);
    await fetchProviders();
    notify("Your invoices will use it from now on.");
  } catch {
    notify("Could not change that.", "error");
  }
};

const preferManual = async () => {
  try {
    await $api.patch("/users/payments/manual/prefer");
    await fetchProviders();
    notify("Your invoices will show your bank details.");
  } catch {
    notify("Could not change that.", "error");
  }
};

const MALAYSIA_BANKS = [
  "Maybank", "CIMB Bank", "Public Bank", "RHB Bank", "Hong Leong Bank",
  "AmBank", "UOB Bank", "Bank Rakyat", "Bank Islam", "Affin Bank",
  "Alliance Bank", "Standard Chartered Bank", "OCBC Bank", "HSBC Bank",
  "MBSB Bank", "Bank Muamalat", "Agrobank", "Al Rajhi Bank", "Citibank",
].map((b) => ({ value: b, label: b }));

const readingQr = ref(false);

const handleQrUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  /* The logo upload checked type and size; this one checked neither and handed
     whatever it got to an Image. */
  if (!file.type.startsWith("image/")) {
    notify("That is not an image file.", "error");
    event.target.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    notify("That image is over 5MB. Try a smaller one.", "error");
    event.target.value = "";
    return;
  }
  readingQr.value = true;
  const reader = new FileReader();
  reader.onerror = () => {
    readingQr.value = false;
    notify("Could not read that file.", "error");
  };
  reader.onload = (e) => {
    const img = new Image();
    img.onerror = () => {
      readingQr.value = false;
      notify("Could not open that image.", "error");
    };
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(px.data, px.width, px.height);
        if (code?.data) {
          settingsForm.value.manualQrCode = code.data;
          notify("QR read. Save to keep it.");
        } else {
          notify("No QR code found in that image.", "error");
        }
      } catch {
        notify("Could not read a QR code from that image.", "error");
      } finally {
        readingQr.value = false;
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = "";
};

/* ─── Password ──────────────────────────────────────────────────────────── */
const changingPassword = ref(false);

const changePassword = async (payload, reset) => {
  changingPassword.value = true;
  try {
    await authStore.changePassword({
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    });
    reset?.();
    notify("Password changed.");
  } catch (err) {
    notify(
      err.response?.data?.message || "Could not change your password.",
      "error",
    );
  } finally {
    changingPassword.value = false;
  }
};

/* ─── Plan ──────────────────────────────────────────────────────────────── */
const promoCode = ref("");
const promo = ref({ code: "", valid: false, loading: false, error: "", applied: null, text: "" });

watch(promoCode, (v) => (promo.value.code = v));

const applyPromo = async () => {
  if (!promo.value.code) return;
  promo.value.loading = true;
  promo.value.error = "";
  try {
    const { data } = await $api.post("/promo/validate", { code: promo.value.code });
    promo.value.applied = data;
    promo.value.valid = true;
    promo.value.text =
      data.discountType === "PERCENTAGE"
        ? `${data.discountValue}%`
        : `${data.discountValue} MYR`;
  } catch (err) {
    promo.value.error = err.response?.data?.message || "That code is not valid.";
    promo.value.valid = false;
    promo.value.applied = null;
  } finally {
    promo.value.loading = false;
  }
};

const clearPromo = () => {
  promo.value = { code: "", valid: false, loading: false, error: "", applied: null, text: "" };
  promoCode.value = "";
};

const cancelModal = ref(false);
const cancelling = ref(false);

const currentSub = computed(() => authStore.user?.subscriptions?.[0] || null);
const activeSub = computed(() =>
  currentSub.value?.status === "ACTIVE" ? currentSub.value : null,
);
const isCancelling = computed(() => {
  const s = currentSub.value;
  if (!s) return false;
  return !!s.cancelAtPeriodEnd || s.status === "CANCELED" || s.status === "CANCELLED";
});

const choosePlan = async (plan) => {
  const name = String(plan?.name ?? "").toUpperCase();
  const mine = String(authStore.user?.plan ?? "").toUpperCase();
  if (mine === name && name !== "FREE") {
    cancelModal.value = true;
    return;
  }
  try {
    const res = await subscribeStore.subscribe(
      plan.name,
      promo.value.valid ? promo.value.code : null,
    );
    if (res?.checkoutUrl) {
      notify("Taking you to the payment page…");
      setTimeout(() => (window.location.href = res.checkoutUrl), 400);
      return;
    }
    await authStore.fetchProfile();
    notify(res?.message || `You are on ${plan.name} now.`);
  } catch (err) {
    notify(
      err.response?.data?.message || subscribeStore.error || "Could not change your plan.",
      "error",
    );
  }
};

const confirmCancel = async () => {
  cancelling.value = true;
  try {
    const res = await subscribeStore.subscribe("FREE", null);
    await authStore.fetchProfile();
    cancelModal.value = false;
    notify(res?.message || "Cancelled. You keep your benefits until the period ends.");
  } catch (err) {
    notify(
      err.response?.data?.message || subscribeStore.error || "Could not cancel your plan.",
      "error",
    );
  } finally {
    cancelling.value = false;
  }
};

const endsOn = computed(() => {
  const end = currentSub.value?.subscriptionEnds;
  if (!end) return "";
  return new Date(end).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Settings</h1>
        <p class="desk__sub">
          How you get paid, what you pay us, and who can get in.
        </p>
      </div>
      <div class="desk__actions">
        <NuxtLink to="/business" class="desk-btn desk-btn--ghost">
          Business details
        </NuxtLink>
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('settings', activeTab)">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
      </div>
    </header>

    <div class="set">
      <nav class="set__nav" aria-label="Settings sections">
        <button
          v-for="t in TABS"
          :key="t.id"
          type="button"
          class="set__tab"
          :class="{ 'set__tab--on': activeTab === t.id }"
          :aria-current="activeTab === t.id ? 'page' : undefined"
          @click="go(t.id)">
          <UiIcon :icon="t.icon" custom-class="w-4 h-4" />
          {{ t.name }}
        </button>
      </nav>

      <div class="set__panel">
        <div class="set__body">
          <SettingsPayments
            v-if="activeTab === 'payments'"
            :form="settingsForm"
            :providers="providers"
            @connect="openConnect"
            @disconnect="disconnectFor = $event"
            @prefer="preferGateway"
            @prefer-manual="preferManual"
            @edit-manual="manualModal = true" />

          <SettingsBilling
            v-else-if="activeTab === 'billing'"
            :plans="plans"
            :plan="authStore.user?.plan || 'FREE'"
            :subscription="activeSub"
            :cancelling="isCancelling"
            :promo="promo"
            @choose="choosePlan"
            @cancel="cancelModal = true"
            @apply-promo="applyPromo"
            @clear-promo="clearPromo"
            @update:code="promoCode = $event" />

          <SettingsSecurity
            v-else-if="activeTab === 'security'"
            :busy="changingPassword"
            @change="changePassword" />
        </div>

        <!-- Only tabs that have something to save get a footer. This used to
             render for every tab except billing, which put a permanently
             disabled primary button on Security. -->
        <div v-if="tab.saves" class="set__foot">
          <p class="set__dirty">
            {{ isDirty ? "You have unsaved changes." : "Everything here is saved." }}
          </p>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="saving || !isDirty"
            @click="save">
            <UiIcon
              v-if="saving"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ saving ? "Saving…" : "Save changes" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Disconnect a gateway ─────────────────────────────────────────── -->
    <UiModal
      :model-value="!!disconnectFor"
      max-width="sm"
      @update:model-value="disconnectFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Disconnect {{ disconnectFor?.name }}?</h3>
        <p class="dlg__body">
          Your keys are deleted and new invoices stop offering it. Payment links
          already sent through {{ disconnectFor?.name }} will stop working.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="disconnectFor = null">
            Keep it connected
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            @click="confirmDisconnect">
            Disconnect
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Cancel plan ──────────────────────────────────────────────────── -->
    <UiModal v-model="cancelModal" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">
          Cancel your {{ (authStore.user?.plan || "paid").toUpperCase() }} plan?
        </h3>
        <p class="dlg__body">
          <template v-if="endsOn">
            You keep everything until <b>{{ endsOn }}</b>, then move to Free.
          </template>
          <template v-else>
            You keep everything until the end of the period you have paid for,
            then move to Free.
          </template>
          Automatic chasing stops on Free, so late invoices go back to being
          yours to follow up.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="cancelModal = false">
            Stay on it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="cancelling"
            @click="confirmCancel">
            <UiIcon
              v-if="cancelling"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ cancelling ? "Cancelling…" : "Cancel plan" }}
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Bank details ─────────────────────────────────────────────────── -->
    <UiModal v-model="manualModal" max-width="lg">
      <div class="dlg">
        <h3 class="dlg__title">Your bank details</h3>
        <p class="dlg__body" style="margin-bottom: var(--space-5)">
          These print on the invoice so a client can transfer directly. We cannot
          see when that lands, so you mark those invoices paid yourself.
        </p>

        <div class="f">
          <span class="f__label">Bank</span>
          <UiSelect
            v-model="settingsForm.manualBankName"
            :options="MALAYSIA_BANKS"
            placeholder="Pick your bank" />
        </div>

        <div class="fgrid">
          <div class="f" style="margin: 0">
            <label class="f__label" for="bank-acc">Account number</label>
            <input
              id="bank-acc"
              v-model="settingsForm.manualAccountNumber"
              type="text"
              inputmode="numeric"
              class="inp no-ik"
              placeholder="1234567890" />
          </div>
          <div class="f" style="margin: 0">
            <label class="f__label" for="bank-name">Account holder</label>
            <input
              id="bank-name"
              v-model="settingsForm.manualAccountName"
              type="text"
              class="inp no-ik"
              placeholder="As it appears on the account" />
          </div>
        </div>

        <div class="f">
          <span class="f__label">DuitNow QR</span>
          <div class="logo-well">
            <div class="logo-well__box">
              <UiIcon
                v-if="readingQr"
                icon="heroicons:arrow-path"
                custom-class="w-5 h-5 spin" />
              <UiIcon
                v-else-if="settingsForm.manualQrCode"
                icon="heroicons:qr-code"
                custom-class="w-6 h-6" />
              <UiIcon
                v-else
                icon="heroicons:arrow-up-tray"
                custom-class="w-5 h-5" />
            </div>
            <div>
              <div class="bar">
                <label class="desk-btn desk-btn--ghost desk-btn--sm">
                  {{ settingsForm.manualQrCode ? "Replace" : "Upload your QR" }}
                  <input
                    type="file"
                    class="sr-only"
                    accept="image/*"
                    @change="handleQrUpload" />
                </label>
                <button
                  v-if="settingsForm.manualQrCode"
                  type="button"
                  class="desk-btn desk-btn--ghost desk-btn--sm"
                  @click="settingsForm.manualQrCode = ''">
                  Remove
                </button>
              </div>
              <p class="f__hint">
                <template v-if="settingsForm.manualQrCode">
                  Read and ready. It prints on your invoices so they can scan it.
                </template>
                <template v-else>
                  A screenshot of your DuitNow QR works. We read the code out of
                  the image rather than storing the picture.
                </template>
              </p>
            </div>
          </div>
        </div>

        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="manualModal = false">
            Cancel
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="saving"
            @click="
              save();
              manualModal = false;
            ">
            Save details
          </button>
        </div>
      </div>
    </UiModal>

    <PaymentConnectModal
      v-model="connectModal"
      :provider="selectedProvider"
      :existing-data="providers.find((p) => p.provider === selectedProvider) || {}"
      @save="saveConnection" />

    <UiToast v-model="toast" />
  </div>
</template>
