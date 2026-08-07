<script setup>
/**
 * EDIT A RECURRING SCHEDULE.
 *
 * The one rule that governs this whole page: editing affects FUTURE instances
 * only. Nothing here can reach back into an invoice that has already been
 * issued — the client is holding that document, and a schedule quietly
 * rewriting it would leave the two saying different things.
 *
 * Two fields are therefore fixed after creation rather than merely discouraged:
 * the client, because invoices already issued name them, and the start date,
 * because it anchors every date the schedule has already issued on. Changing
 * either would renumber history. Both are stated in the form rather than
 * silently disabled.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRecurringStore } from "~/stores/recurringStore";
import { useClientStore } from "~/stores/clientStore";
import { useCatalogueStore } from "~/stores/catalogueStore";
import { formatDate, toInputDate } from "~/utils/date";
import { cash, currencySymbol, priceToInput } from "~/utils/invoice";

const route = useRoute();
const router = useRouter();
const scheduleId = route.params.id;

const store = useRecurringStore();
const clientStore = useClientStore();
const catalogue = useCatalogueStore();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const loading = ref(true);
const saving = ref(false);
const original = ref(null);
const currencyOptions = ref([]);

const form = ref({
  clientId: "",
  invoiceName: "",
  subject: "",
  currency: "MYR",
  taxRate: 0,
  frequency: "MONTHLY",
  interval: 1,
  issueDay: 1,
  startDate: "",
  endMode: "NEVER",
  endAfter: 12,
  endDate: "",
  paymentTermsDays: 14,
  channels: ["EMAIL"],
  autoChase: true,
  mode: "REVIEW",
  skipWhileUnpaid: false,
  items: [],
});

/** An ended schedule is the record of an agreement that has finished. */
const locked = computed(() => original.value?.status === "ENDED");

onMounted(async () => {
  clientStore.fetchClients();
  catalogue.fetchItems();

  try {
    const { data } = await $api.get("/currencies");
    currencyOptions.value = data;
  } catch {
    currencyOptions.value = [
      { value: "MYR", label: "MYR (RM)" },
      { value: "USD", label: "USD ($)" },
    ];
  }

  try {
    const data = await store.fetchSchedule(scheduleId);
    if (!data) throw new Error("Not found");
    original.value = data;

    form.value = {
      clientId: data.clientId,
      invoiceName: data.invoiceName || "",
      subject: data.subject || "",
      currency: data.currency || "MYR",
      taxRate: Number(data.taxRate) || 0,
      frequency: data.frequency || "MONTHLY",
      interval: Number(data.interval) || 1,
      issueDay: data.issueDay ?? 1,
      startDate: toInputDate(data.startDate),
      endMode: data.endMode || "NEVER",
      endAfter: data.endAfter ?? 12,
      endDate: toInputDate(data.endDate) || "",
      paymentTermsDays: Number(data.paymentTermsDays) || 14,
      channels: data.channels?.length ? [...data.channels] : ["EMAIL"],
      autoChase: !!data.autoChase,
      mode: data.mode || "REVIEW",
      skipWhileUnpaid: !!data.skipWhileUnpaid,
      items: (data.items || []).map((i) => ({
        name: i.name,
        priceNum: Number(i.price) || 0,
        priceStr: priceToInput(i.price),
        quantity: Number(i.quantity) || 1,
      })),
    };

    if (!form.value.items.length) {
      form.value.items = [{ name: "", priceStr: "", priceNum: 0, quantity: 1 }];
    }
  } catch {
    notify("That schedule could not be opened.", "error");
    router.push("/recurring");
  } finally {
    loading.value = false;
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

const issuedCount = computed(() => original.value?.invoices?.length || 0);

const save = async () => {
  if (locked.value) return;
  saving.value = true;
  try {
    await store.updateSchedule(Number(scheduleId), {
      /* clientId and startDate are deliberately not sent. Both are fixed after
         creation — see the header comment. */
      invoiceName: form.value.invoiceName,
      subject: form.value.subject,
      currency: form.value.currency,
      taxRate: form.value.taxRate,
      frequency: form.value.frequency,
      interval: form.value.interval,
      issueDay: form.value.issueDay,
      endMode: form.value.endMode,
      endAfter: form.value.endMode === "AFTER_N" ? Number(form.value.endAfter) : null,
      endDate:
        form.value.endMode === "ON_DATE"
          ? new Date(form.value.endDate).toISOString()
          : null,
      paymentTermsDays: form.value.paymentTermsDays,
      channels: form.value.channels,
      autoChase: form.value.autoChase,
      mode: form.value.mode,
      skipWhileUnpaid: form.value.skipWhileUnpaid,
      items: form.value.items.map((i) => ({
        name: i.name,
        price: Number(i.priceNum) || 0,
        quantity: Number(i.quantity) || 1,
      })),
    });
    notify("Saved. This applies to invoices issued from now on.");
    router.push(`/recurring/${scheduleId}`);
  } catch (err) {
    notify(
      err.response?.data?.message ||
        "Could not save those changes. Your edits are still on screen.",
      "error",
    );
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">
          Edit schedule
          <template v-if="original">— {{ original.client?.name }}</template>
        </h1>
        <p class="desk__sub">
          <i v-if="loading" class="sk" style="width: 18rem"></i>
          <template v-else-if="original">
            {{ issuedCount }}
            {{ issuedCount === 1 ? "invoice" : "invoices" }} issued so far.
            <template v-if="original.nextIssueAt">
              Next on {{ formatDate(original.nextIssueAt) }}.
            </template>
          </template>
        </p>
      </div>
      <div class="desk__actions">
        <NuxtLink :to="`/recurring/${scheduleId}`" class="desk-btn desk-btn--ghost">
          Back to schedule
        </NuxtLink>
      </div>
    </header>

    <div v-if="loading" class="banner">
      <i class="sk" style="width: 1.25rem; height: 1.25rem; border-radius: 50%"></i>
      <span><i class="sk" style="width: 16rem"></i></span>
    </div>
    <div v-else-if="locked" class="banner">
      <UiIcon icon="heroicons:lock-closed" custom-class="w-5 h-5" />
      <span>
        This schedule has ended, so it is read-only — it is the record of what
        was agreed. Set up a new one if you are billing this client again.
      </span>
    </div>
    <div v-else-if="issuedCount" class="banner">
      <UiIcon icon="heroicons:information-circle" custom-class="w-5 h-5" />
      <span>
        Changes apply to invoices issued from now on. The {{ issuedCount }}
        already sent keep the figures they were sent with.
      </span>
    </div>

    <div class="build">
      <div class="build__pane">
        <div class="build__body">
          <RecurringFields
            :form="form"
            :clients="clientStore.clients"
            :currencies="currencyOptions"
            mode="edit"
            :locked="locked"
            :loading="loading" />
        </div>

        <div class="build__foot">
          <p class="build__total">
            <b v-if="loading"><i class="sk" style="width: 6rem"></i></b>
            <b v-else>{{ cur }} {{ cash(total) }}</b>
            <span v-if="!loading">each {{ CADENCE_WORD[form.frequency] }}</span>
          </p>
          <div class="desk__actions">
            <NuxtLink :to="`/recurring/${scheduleId}`" class="desk-btn desk-btn--ghost">
              Cancel
            </NuxtLink>
            <button
              v-if="!locked"
              type="button"
              class="desk-btn desk-btn--primary"
              :disabled="saving || loading"
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

      <div class="pv">
        <div class="pv__head">
          <div>
            <h2 class="card__title">From here on</h2>
            <p class="money__note">
              What the next invoice from this schedule will look like.
            </p>
          </div>
        </div>

        <div class="card">
          <p v-if="loading" class="empty__body">
            <i class="sk" style="width: 14rem"></i>
          </p>
          <template v-else>
            <p class="dlg__body">
              Every
              {{ form.interval > 1 ? `${form.interval} ` : "" }}{{ CADENCE_WORD[form.frequency] }}{{ form.interval > 1 ? "s" : "" }},
              an invoice for <b>{{ cur }} {{ cash(total) }}</b> is created for
              <b>{{ original?.client?.name }}</b>, due
              {{ form.paymentTermsDays }} days later.
            </p>
            <p class="f__hint" style="margin-top: var(--space-3)">
              <template v-if="form.mode === 'AUTO'">
                Sent automatically on
                {{
                  form.channels
                    .map((c) => (c === "EMAIL" ? "email" : "WhatsApp"))
                    .join(" and ")
                }}.
              </template>
              <template v-else>
                Drafted for your approval. Nothing reaches your client until you
                send it.
              </template>
            </p>
          </template>
        </div>
      </div>
    </div>

    <UiToast v-model="toast" />
  </div>
</template>
