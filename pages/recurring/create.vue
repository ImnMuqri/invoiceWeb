<script setup>
/**
 * NEW RECURRING SCHEDULE.
 *
 * The form itself lives in components/recurring/Fields.vue, shared with the
 * edit page. This file owns loading, the payload and where it saves to.
 */
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useRecurringStore } from "~/stores/recurringStore";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { useCatalogueStore } from "~/stores/catalogueStore";
import { cash, currencySymbol } from "~/utils/invoice";

const router = useRouter();
const store = useRecurringStore();
const clientStore = useClientStore();
const authStore = useAuthStore();
const catalogue = useCatalogueStore();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const saving = ref(false);
const currencyOptions = ref([]);

const today = new Date();
const inAMonth = new Date(today.getTime() + 30 * 86400000)
  .toISOString()
  .split("T")[0];

const form = ref({
  clientId: "",
  invoiceName: "",
  subject: "",
  currency: "MYR",
  taxRate: 0,
  frequency: "MONTHLY",
  interval: 1,
  issueDay: today.getDate(),
  startDate: today.toISOString().split("T")[0],
  endMode: "NEVER",
  endAfter: 12,
  endDate: inAMonth,
  paymentTermsDays: 14,
  channels: ["EMAIL"],
  autoChase: true,
  /* Review by default. Users are nervous about software invoicing their clients
     unattended, and the schedule offers to switch itself after two clean
     cycles. */
  mode: "REVIEW",
  skipWhileUnpaid: false,
  items: [{ name: "", priceStr: "", priceNum: 0, quantity: 1 }],
});

onMounted(async () => {
  clientStore.fetchClients();
  catalogue.fetchItems();
  const cfg = (await authStore.fetchInvoiceConfig()) || {};
  if (Number(cfg.defaultTaxRate) > 0) form.value.taxRate = Number(cfg.defaultTaxRate);
  try {
    const { data } = await $api.get("/currencies");
    currencyOptions.value = data;
  } catch {
    currencyOptions.value = [
      { value: "MYR", label: "MYR (RM)" },
      { value: "USD", label: "USD ($)" },
    ];
  }
});

const cur = computed(() => currencySymbol(form.value.currency));
const total = computed(() => {
  const sub = form.value.items.reduce(
    (n, i) => n + (Number(i.priceNum) || 0) * (Number(i.quantity) || 0),
    0,
  );
  return sub * (1 + (Number(form.value.taxRate) || 0) / 100);
});

const CADENCE_WORD = {
  WEEKLY: "week",
  MONTHLY: "month",
  QUARTERLY: "quarter",
  YEARLY: "year",
};

const problems = computed(() => {
  const out = [];
  if (!form.value.clientId) out.push("pick who this is for");
  if (!form.value.items.some((i) => Number(i.priceNum) > 0))
    out.push("put a price on at least one line");
  if (!form.value.channels.length) out.push("choose how it goes out");
  return out;
});

const save = async () => {
  if (problems.value.length) {
    notify(`Almost — ${problems.value.join(", ")}.`, "warning");
    return;
  }
  saving.value = true;
  try {
    const created = await store.addSchedule({
      ...form.value,
      startDate: new Date(form.value.startDate).toISOString(),
      endDate:
        form.value.endMode === "ON_DATE"
          ? new Date(form.value.endDate).toISOString()
          : null,
      endAfter: form.value.endMode === "AFTER_N" ? Number(form.value.endAfter) : null,
      items: form.value.items.map((i) => ({
        name: i.name,
        price: Number(i.priceNum) || 0,
        quantity: Number(i.quantity) || 1,
      })),
    });
    notify("Schedule created.");
    router.push(`/recurring/${created.id}`);
  } catch (err) {
    notify(err.response?.data?.message || "Could not save that schedule.", "error");
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">New recurring schedule</h1>
        <p class="desk__sub">
          Bill the same thing on a cycle. The first two go out as drafts for you
          to approve, so you can watch it work before letting it run itself.
        </p>
      </div>
      <div class="desk__actions">
        <NuxtLink to="/recurring" class="desk-btn desk-btn--ghost">
          Back to recurring
        </NuxtLink>
      </div>
    </header>

    <div class="build">
      <div class="build__pane">
        <div class="build__body">
          <RecurringFields
            :form="form"
            :clients="clientStore.clients"
            :currencies="currencyOptions"
            mode="create" />
        </div>

        <div class="build__foot">
          <p class="build__total">
            <b>{{ cur }} {{ cash(total) }}</b>
            <span>each {{ CADENCE_WORD[form.frequency] }}</span>
          </p>
          <div class="desk__actions">
            <NuxtLink to="/recurring" class="desk-btn desk-btn--ghost">Discard</NuxtLink>
            <button
              type="button"
              class="desk-btn desk-btn--primary"
              :disabled="saving"
              @click="save">
              <UiIcon
                v-if="saving"
                icon="heroicons:arrow-path"
                custom-class="w-4 h-4 spin" />
              {{ saving ? "Saving…" : "Create schedule" }}
            </button>
          </div>
        </div>
      </div>

      <div class="pv">
        <div class="pv__head">
          <div>
            <h2 class="card__title">What will happen</h2>
            <p class="money__note">Nothing goes out until the first issue date.</p>
          </div>
        </div>

        <div class="card">
          <p v-if="problems.length" class="empty__body">
            To save this you need to <b>{{ problems.join(", and ") }}</b>.
          </p>
          <template v-else>
            <p class="dlg__body">
              Every
              {{ form.interval > 1 ? `${form.interval} ` : "" }}{{ CADENCE_WORD[form.frequency] }}{{ form.interval > 1 ? "s" : "" }},
              starting {{ form.startDate }}, an invoice for
              <b>{{ cur }} {{ cash(total) }}</b> is created for
              <b>{{
                clientStore.clients.find((c) => c.id === form.clientId)?.name ||
                "your client"
              }}</b>, due {{ form.paymentTermsDays }} days later.
            </p>
            <p class="f__hint" style="margin-top: var(--space-3)">
              <template v-if="form.mode === 'AUTO'">
                It is sent automatically on
                {{
                  form.channels
                    .map((c) => (c === "EMAIL" ? "email" : "WhatsApp"))
                    .join(" and ")
                }}.
              </template>
              <template v-else>
                It is drafted and you are notified. Nothing reaches your client
                until you approve it.
              </template>
            </p>
          </template>
        </div>
      </div>
    </div>

    <UiToast v-model="toast" />
  </div>
</template>
