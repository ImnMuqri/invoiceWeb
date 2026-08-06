<script setup>
/**
 * BUSINESS — who you are, and how you speak to clients.
 *
 * Split out of Settings, which had grown to seven tabs holding two unrelated
 * jobs. Four of them were about your business as your clients experience it —
 * your name and address, what prints on a document, the words that go out over
 * email and WhatsApp. The other three are about your account with us: card
 * details, plan, password. Those stay in Settings.
 *
 * The split is not cosmetic. These four are things you set up once when you
 * start and revisit when the business changes; the other three are things you
 * touch when something about *the software* needs attention. Keeping them in one
 * list meant your company address sat two clicks from cancelling your plan.
 *
 * The tab table from Settings comes with it unchanged — `form` says which object
 * a tab edits and therefore which snapshot resets on save, `saves` says whether
 * it gets a footer. One table answering both is what stops a tab being counted
 * dirty in one place and forgotten in the other.
 *
 * Partial saves are safe: PUT /users/settings/profile writes `data.X` straight
 * into Prisma, and undefined means "leave it alone", so posting only the fields
 * this page owns cannot clear the ones Settings owns.
 */
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";

const authStore = useAuthStore();
const uiStore = useUiStore();
const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

/* "Invoices" was the old name of the Documents tab. It could not keep that name
   next to a real Invoices module, and it was never only about invoices — it owns
   quotation numbering too, which until now had no interface at all. */
const TABS = [
  { id: "details", name: "Details", icon: "heroicons:building-office-2", form: "profile", saves: true },
  { id: "documents", name: "Documents", icon: "heroicons:document-text", form: "profile", saves: true },
  { id: "email", name: "Email", icon: "heroicons:envelope", form: "profile", saves: true },
  { id: "whatsapp", name: "WhatsApp", icon: "simple-icons:whatsapp", form: "settings", saves: true },
];

/* Old deep links kept working. /settings?tab=general and the three beside it
   are in muscle memory, in the help modal, and quite possibly in a bookmark. */
const ALIASES = { general: "details", invoice_config: "documents" };
const resolveTab = (id) => {
  const wanted = ALIASES[id] || id;
  return TABS.some((t) => t.id === wanted) ? wanted : "details";
};

const activeTab = ref(resolveTab(route.query.tab));
const tab = computed(() => TABS.find((t) => t.id === activeTab.value) || TABS[0]);

watch(
  () => route.query.tab,
  (next) => (activeTab.value = resolveTab(next)),
);

const go = (id) => {
  if (!id) return router.push("/clients");
  if (!TABS.some((t) => t.id === (ALIASES[id] || id))) {
    /* A tab that lives in Settings now — Payments and Plan are linked to from
       the upgrade prompts inside these panels. */
    return router.push({ path: "/settings", query: { tab: id } });
  }
  router.push({ query: { ...route.query, tab: ALIASES[id] || id } });
};

/* ─── Forms ─────────────────────────────────────────────────────────────── */
const profileForm = ref({
  name: "",
  phoneNumber: "",
  defaultCurrency: "MYR",
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  address: "",
  defaultTaxRate: 0,
  reminderInterval: 0,
  invoiceIncludeName: true,
  invoiceIncludeEmail: false,
  invoiceIncludePersonalPhone: false,
  invoiceIncludeCompanyPhone: true,
  invoiceIncludeCompanyName: true,
  invoiceIncludeAddress: true,
  globalAutoChaser: true,
  invoicePrefix: "INV",
  quotePrefix: "QUO",
});

const settingsForm = ref({
  whatsappSendTemplate: "",
  whatsappReminderTemplate: "",
  whatsappMode: "SYSTEM",
  twilioSid: "",
  twilioAuthToken: "",
  twilioPhoneNumber: "",
  whatsappReminderInterval: 0,
});

const cleanProfile = ref({});
const cleanSettings = ref({});

const isDirty = computed(() => {
  if (tab.value.form === "profile")
    return JSON.stringify(profileForm.value) !== JSON.stringify(cleanProfile.value);
  if (tab.value.form === "settings")
    return JSON.stringify(settingsForm.value) !== JSON.stringify(cleanSettings.value);
  return false;
});

const currencyOptions = ref([]);
const saving = ref(false);

const fetchCurrencies = async () => {
  try {
    const { data } = await $api.get("/currencies");
    currencyOptions.value = data;
  } catch {
    currencyOptions.value = [
      { value: "MYR", label: "MYR (RM)" },
      { value: "USD", label: "USD ($)" },
    ];
  }
};

onMounted(async () => {
  fetchCurrencies();
  await authStore.fetchProfile();
  const s = (await authStore.fetchSettings()) || {};
  const u = authStore.user;

  if (u) {
    profileForm.value = {
      name: u.name || "",
      phoneNumber: u.phoneNumber || "",
      defaultCurrency: u.defaultCurrency || "MYR",
      companyName: s.companyName || "",
      companyEmail: s.companyEmail || "",
      companyPhone: s.companyPhone || "",
      address: s.address || "",
      defaultTaxRate: s.defaultTaxRate || 0,
      reminderInterval: authStore.isPro ? s.reminderInterval || 0 : 0,
      invoiceIncludeName: !!s.invoiceIncludeName,
      invoiceIncludeEmail: !!s.invoiceIncludeEmail,
      invoiceIncludePersonalPhone: !!s.invoiceIncludePersonalPhone,
      invoiceIncludeCompanyPhone: !!s.invoiceIncludeCompanyPhone,
      invoiceIncludeCompanyName: !!s.invoiceIncludeCompanyName,
      invoiceIncludeAddress: !!s.invoiceIncludeAddress,
      globalAutoChaser: authStore.isPro ? !!s.globalAutoChaser : false,
      invoicePrefix: s.invoicePrefix || "INV",
      quotePrefix: s.quotePrefix || "QUO",
    };
  }

  settingsForm.value = {
    whatsappSendTemplate: s.whatsappSendTemplate || "",
    whatsappReminderTemplate: s.whatsappReminderTemplate || "",
    whatsappMode: s.whatsappMode || "SYSTEM",
    twilioSid: s.twilioSid || "",
    twilioAuthToken: s.twilioAuthToken || "",
    twilioPhoneNumber: s.twilioPhoneNumber || "",
    whatsappReminderInterval: authStore.isPro ? s.whatsappReminderInterval || 0 : 0,
  };

  cleanProfile.value = JSON.parse(JSON.stringify(profileForm.value));
  cleanSettings.value = JSON.parse(JSON.stringify(settingsForm.value));
});

/* ─── Save ──────────────────────────────────────────────────────────────── */
const save = async () => {
  const which = tab.value.form;
  if (!which) return;
  saving.value = true;
  try {
    if (which === "profile") {
      await authStore.updateProfile(profileForm.value);
      await authStore.updateSettings(profileForm.value);
      cleanProfile.value = JSON.parse(JSON.stringify(profileForm.value));
    } else {
      await authStore.updateSettings(settingsForm.value);
      cleanSettings.value = JSON.parse(JSON.stringify(settingsForm.value));
    }
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

/* ─── Logo ──────────────────────────────────────────────────────────────── */
const uploadingLogo = ref(false);
const confirmLogoRemoval = ref(false);

const uploadLogo = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    notify("That is not an image file.", "error");
    event.target.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    notify("That file is over 5MB. Try a smaller one.", "error");
    event.target.value = "";
    return;
  }
  uploadingLogo.value = true;
  try {
    await authStore.uploadLogo(file);
    notify("Logo updated. It is on your invoices from now on.");
  } catch (err) {
    notify(err.response?.data?.message || "Could not upload that logo.", "error");
  } finally {
    uploadingLogo.value = false;
    event.target.value = "";
  }
};

const removeLogo = async () => {
  uploadingLogo.value = true;
  try {
    await authStore.deleteLogo();
    confirmLogoRemoval.value = false;
    notify("Logo removed.");
  } catch {
    notify("Could not remove the logo.", "error");
  } finally {
    uploadingLogo.value = false;
  }
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Business</h1>
        <p class="desk__sub">
          Your details, what prints on a document, and the words that go out
          under your name.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('business', activeTab)">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
      </div>
    </header>

    <div class="set">
      <nav class="set__nav" aria-label="Business sections">
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
          <BusinessDetails
            v-if="activeTab === 'details'"
            :form="profileForm"
            :account="authStore.user || {}"
            :currencies="currencyOptions"
            :logo-url="authStore.user?.profile?.logoUrl || ''"
            :uploading-logo="uploadingLogo"
            @upload-logo="uploadLogo"
            @remove-logo="confirmLogoRemoval = true" />

          <BusinessDocuments
            v-else-if="activeTab === 'documents'"
            :form="profileForm"
            :is-pro="authStore.isPro"
            @go="go" />

          <BusinessEmail
            v-else-if="activeTab === 'email'"
            :form="profileForm"
            :is-pro="authStore.isPro"
            :sender-name="authStore.user?.name || ''"
            @go="go" />

          <BusinessWhatsapp
            v-else-if="activeTab === 'whatsapp'"
            :form="settingsForm"
            :is-pro="authStore.isPro"
            :company-name="profileForm.companyName"
            :sender-name="authStore.user?.name || ''"
            :currency="profileForm.defaultCurrency"
            @go="go" />
        </div>

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

    <UiModal v-model="confirmLogoRemoval" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">Remove your logo?</h3>
        <p class="dlg__body">
          Invoices you send after this go out without it. Ones already sent keep
          the logo they were sent with.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="confirmLogoRemoval = false">
            Keep it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="uploadingLogo"
            @click="removeLogo">
            Remove it
          </button>
        </div>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
