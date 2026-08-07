<script setup>
/**
 * ACCOUNTANT EXPORT (spec 04).
 *
 * One action produces a complete record of a period. The measure of success is
 * that somebody stops keeping a parallel spreadsheet, because a user with a
 * parallel spreadsheet is already half migrated away.
 *
 * The preview is deliberate: a year of invoices takes real time to pack, and
 * being told what a range contains — and whether the PDFs will fit — before
 * committing is better than a spinner and a surprise.
 */
import { computed, onMounted, ref, watch } from "vue";
import { useClientStore } from "~/stores/clientStore";
import { useUiStore } from "~/stores/uiStore";
import { cash } from "~/utils/invoice";

const clientStore = useClientStore();
const uiStore = useUiStore();
const config = useRuntimeConfig();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const preview = ref(null);
const loading = ref(false);
const downloading = ref("");

const iso = (d) => d.toISOString().split("T")[0];
const now = new Date();

const PRESETS = [
  {
    key: "last-month",
    label: "Last month",
    range: () => {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return [iso(from), iso(to)];
    },
  },
  {
    key: "last-quarter",
    label: "Last quarter",
    range: () => {
      const q = Math.floor(now.getMonth() / 3);
      const from = new Date(now.getFullYear(), (q - 1) * 3, 1);
      const to = new Date(now.getFullYear(), q * 3, 0);
      return [iso(from), iso(to)];
    },
  },
  {
    key: "this-year",
    label: "This year so far",
    range: () => [iso(new Date(now.getFullYear(), 0, 1)), iso(now)],
  },
  {
    key: "last-year",
    label: "Last year",
    range: () => [
      iso(new Date(now.getFullYear() - 1, 0, 1)),
      iso(new Date(now.getFullYear() - 1, 11, 31)),
    ],
  },
];

const form = ref({
  from: PRESETS[0].range()[0],
  to: PRESETS[0].range()[1],
  clientId: "",
  status: "",
  includeVoided: false,
});

const applyPreset = (p) => {
  const [from, to] = p.range();
  form.value.from = from;
  form.value.to = to;
};

const query = computed(() => {
  const q = new URLSearchParams();
  if (form.value.from) q.set("from", form.value.from);
  if (form.value.to) q.set("to", form.value.to);
  if (form.value.clientId) q.set("clientId", form.value.clientId);
  if (form.value.status) q.set("status", form.value.status);
  if (form.value.includeVoided) q.set("includeVoided", "true");
  return q.toString();
});

const loadPreview = async () => {
  loading.value = true;
  try {
    const { data } = await $api.get(`/exports/preview?${query.value}`);
    preview.value = data;
  } catch {
    preview.value = null;
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  clientStore.fetchClients();
  loadPreview();
});
watch(query, loadPreview);

/**
 * Downloaded through the API client rather than a plain link, because the
 * export routes are authenticated and a bare <a href> carries no bearer token.
 */
const download = async (path, filename) => {
  downloading.value = path;
  try {
    const res = await $api.get(`/exports/${path}?${query.value}`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify("Downloaded.");
  } catch {
    notify("Could not build that file. Try a shorter period.", "error");
  } finally {
    downloading.value = "";
  }
};

const stem = computed(() => `invokita-${form.value.from}-to-${form.value.to}`);

const STATUSES = [
  { label: "Every status", value: "" },
  { label: "Paid", value: "Paid" },
  { label: "Partially paid", value: "Partially Paid" },
  { label: "Pending", value: "Pending" },
  { label: "Overdue", value: "Overdue" },
];

const clientOptions = computed(() => [
  { label: "Every client", value: "" },
  ...clientStore.clients.map((c) => ({ label: c.name, value: c.id })),
]);
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Export</h1>
        <p class="desk__sub">
          Everything your accountant needs for a period, in one download.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('exports')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
      </div>
    </header>

    <div class="build">
      <div class="build__pane">
        <div class="build__body">
          <section class="sec">
            <div class="sec__head"><h2 class="sec__title">Which period</h2></div>

            <div class="bar" style="margin-bottom: var(--space-4)">
              <button
                v-for="p in PRESETS"
                :key="p.key"
                type="button"
                class="desk-btn desk-btn--ghost desk-btn--sm"
                @click="applyPreset(p)">
                {{ p.label }}
              </button>
            </div>

            <div class="fgrid">
              <div class="f" style="margin: 0">
                <label class="f__label" for="ex-from">From</label>
                <input id="ex-from" v-model="form.from" type="date" class="inp no-ik" />
              </div>
              <div class="f" style="margin: 0">
                <label class="f__label" for="ex-to">To</label>
                <input id="ex-to" v-model="form.to" type="date" class="inp no-ik" />
              </div>
            </div>
          </section>

          <section class="sec">
            <div class="sec__head"><h2 class="sec__title">Narrow it down</h2></div>

            <div class="fgrid">
              <div class="f" style="margin: 0">
                <UiSelect v-model="form.clientId" label="Client" :options="clientOptions" />
              </div>
              <div class="f" style="margin: 0">
                <UiSelect v-model="form.status" label="Status" :options="STATUSES" />
              </div>
            </div>

            <div class="f">
              <label class="tog" for="ex-void">
                <input
                  id="ex-void"
                  v-model="form.includeVoided"
                  type="checkbox"
                  class="tog__inp" />
                <span class="tog__mark" aria-hidden="true"></span>
                <span>
                  <span class="tog__title">Include voided invoices</span>
                  <span class="tog__note">
                    Off by default. A voided invoice was never owed, so counting
                    it would overstate the period.
                  </span>
                </span>
              </label>
            </div>
          </section>
        </div>
      </div>

      <div class="pv">
        <div class="pv__head">
          <div>
            <h2 class="card__title">What you will get</h2>
            <p class="money__note">
              {{ form.from }} to {{ form.to }}
            </p>
          </div>
        </div>

        <div class="card">
          <div v-if="loading" class="notes">
            <div v-for="n in 3" :key="n" class="note note--flat">
              <span></span>
              <span><i class="sk" style="width: 10rem"></i></span>
              <span><i class="sk" style="width: 4rem"></i></span>
            </div>
          </div>

          <template v-else-if="preview">
            <div class="usage__grid">
              <div>
                <p class="desk__eyebrow">Invoices issued</p>
                <p class="strip__v">{{ preview.issued }}</p>
                <p class="strip__n">{{ cash(preview.issuedTotal) }}</p>
              </div>
              <div>
                <p class="desk__eyebrow">Settled</p>
                <p class="strip__v">{{ preview.settled }}</p>
                <p class="strip__n">{{ cash(preview.settledTotal) }}</p>
              </div>
              <div>
                <p class="desk__eyebrow">Still outstanding</p>
                <p class="strip__v">{{ preview.outstanding }}</p>
                <p class="strip__n">{{ cash(preview.outstandingTotal) }}</p>
              </div>
            </div>

            <p v-if="!preview.issued" class="f__hint" style="margin-top: var(--space-4)">
              Nothing was issued in this period. The files will still download,
              with their headers and nothing else — which is a valid answer, not
              an error.
            </p>
            <p v-else-if="!preview.pdfsIncluded" class="f__hint" style="margin-top: var(--space-4)">
              This period has more than {{ preview.pdfLimit }} invoices, so the
              pack will contain the spreadsheets and the summary but not the
              individual PDFs. Export a shorter range if you need those.
            </p>
          </template>

          <p v-else class="empty__body">Could not read that period.</p>
        </div>

        <div class="card">
          <div class="card__head">
            <h2 class="card__title">Download</h2>
          </div>
          <div class="deliver">
            <button
              type="button"
              class="desk-btn desk-btn--primary desk-btn--block"
              :disabled="!!downloading"
              @click="download('invoices.csv', `${stem}-invoices.csv`)">
              <UiIcon
                :icon="downloading === 'invoices.csv' ? 'heroicons:arrow-path' : 'heroicons:table-cells'"
                :custom-class="downloading === 'invoices.csv' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
              Invoices spreadsheet
            </button>
            <button
              type="button"
              class="desk-btn desk-btn--ghost desk-btn--block"
              :disabled="!!downloading"
              @click="download('payments.csv', `${stem}-payments.csv`)">
              Payments spreadsheet
            </button>
            <button
              type="button"
              class="desk-btn desk-btn--ghost desk-btn--block"
              :disabled="!!downloading"
              @click="download('pack.zip', `${stem}.zip`)">
              <UiIcon
                :icon="downloading === 'pack.zip' ? 'heroicons:arrow-path' : 'heroicons:archive-box'"
                :custom-class="downloading === 'pack.zip' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
              Everything, as a ZIP
            </button>
            <p class="f__hint">
              The spreadsheets open correctly in Excel, including Malay and
              Chinese names. The ZIP adds a summary and every invoice PDF.
            </p>
          </div>
        </div>
      </div>
    </div>

    <UiToast v-model="toast" />
  </div>
</template>
