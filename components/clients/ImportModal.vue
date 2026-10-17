<script setup>
/**
 * CLIENT IMPORT (spec 08).
 *
 * Four steps, and the third is the one that matters:
 *
 *   input   paste a block of text, or drop a CSV on it
 *   map     confirm which column is which — pre-filled, usually correct
 *   preview what will be created, what already exists, what is broken and why
 *   done    a summary with counts and everything that was skipped
 *
 * NOTHING IS WRITTEN UNTIL THE PREVIEW IS CONFIRMED. The spec requires it and
 * it is the difference between a tool people try and a tool people trust: an
 * import that silently created 200 half-right clients would be worse than no
 * import at all, because unpicking it is manual.
 *
 * All the parsing, phone normalisation, column detection and duplicate matching
 * happens on the SERVER — see Backend/src/utils/clientImport.js. This component
 * sends text and renders answers. That is deliberate: the commit re-derives
 * everything from the same text through the same functions, so what the user
 * approved on screen and what reaches the database cannot differ. If this file
 * started parsing rows itself, there would be two implementations to keep in
 * agreement and one of them would be wrong.
 *
 * Deliberately small, per the spec. It reads a list of people and stops.
 */
import { computed, ref, watch } from "vue";
import { useClientStore } from "~/stores/clientStore";

const emit = defineEmits(["close", "imported"]);

const { $api } = useNuxtApp();
const clientStore = useClientStore();

const step = ref("input"); // input | map | preview | done
const busy = ref(false);
const error = ref("");

const text = ref("");
const fileName = ref("");
const dragging = ref(false);

/** The server's analysis: columns, mapping, rows, summary. */
const analysis = ref(null);
/** Per-row overrides the user makes in the preview, keyed by row index. */
const decisions = ref({});
/** The mapping the user has confirmed or corrected. */
const mapping = ref([]);
const hasHeader = ref(true);
const result = ref(null);

const FIELD_OPTIONS = [
  { value: "", label: "Don't import" },
  { value: "name", label: "Name" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "company", label: "Company" },
  { value: "address", label: "Address" },
  { value: "registrationNumber", label: "Registration No." },
  { value: "tin", label: "TIN" },
  { value: "notes", label: "Notes" },
];

const canAnalyse = computed(() => text.value.trim().length > 0 && !busy.value);

/* ─── Reading a file ──────────────────────────────────────────────────────
   Read in the browser and sent as text, so the endpoint takes one shape
   whether the rows were pasted or uploaded. There is no multipart upload path
   to secure, and the two inputs cannot drift apart in behaviour. */
const readFile = async (file) => {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    error.value = "That file is over 2MB. Import it in a couple of batches.";
    return;
  }
  try {
    text.value = await file.text();
    fileName.value = file.name;
    error.value = "";
  } catch {
    error.value = "That file could not be read.";
  }
};

const onFile = (event) => readFile(event.target.files?.[0]);

const onDrop = (event) => {
  dragging.value = false;
  readFile(event.dataTransfer?.files?.[0]);
};

const downloadTemplate = async () => {
  try {
    const res = await $api.get("/clients/import/template", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "invokita-clients-template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    error.value = "Could not download the template.";
  }
};

/* ─── Steps ─────────────────────────────────────────────────────────────── */

const analyseText = async (overrideMapping = null) => {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await $api.post("/clients/import/preview", {
      text: text.value,
      ...(overrideMapping ? { mapping: overrideMapping } : {}),
      ...(overrideMapping ? { hasHeader: hasHeader.value } : {}),
    });
    analysis.value = data;
    if (!overrideMapping) {
      mapping.value = [...data.mapping];
      hasHeader.value = data.hasHeader;
    }
    decisions.value = {};
    return true;
  } catch (err) {
    error.value =
      err.response?.data?.message || "That could not be read. Check the text and try again.";
    return false;
  } finally {
    busy.value = false;
  }
};

const toMap = async () => {
  if (await analyseText()) step.value = "map";
};

const toPreview = async () => {
  /* Re-analysed with the user's mapping so the preview reflects their
     corrections, not the guess. */
  if (await analyseText(mapping.value.map((m) => m || null))) step.value = "preview";
};

/* Toggling "the first row is headings" changes what the rows ARE, so the column
   samples underneath have to be re-read. Without this the checkbox looked
   inert: the user unticks it, the sample values still show the second row
   onwards, and the header row they were trying to rescue stays invisible until
   they reach the preview. Only fires on the mapping step, and keeps whatever
   mapping the user has already corrected. */
watch(hasHeader, async () => {
  if (step.value !== "map") return;
  await analyseText(mapping.value.map((m) => m || null));
});

const setField = (columnIndex, value) => {
  /* A field can only be used once. Assigning it somewhere new clears it
     wherever it was, because two columns both called "Phone" is not a
     question the importer can answer. */
  const next = [...mapping.value];
  if (value) {
    for (let i = 0; i < next.length; i++) if (next[i] === value) next[i] = null;
  }
  next[columnIndex] = value || null;
  mapping.value = next;
};

const actionFor = (row) => decisions.value[row.index] ?? row.action;

const setAction = (row, action) => {
  decisions.value = { ...decisions.value, [row.index]: action };
};

/** Live counts that follow the user's per-row choices. */
const counts = computed(() => {
  const rows = analysis.value?.rows || [];
  const tally = { create: 0, update: 0, skip: 0, problems: 0 };
  for (const row of rows) {
    if (row.status === "problem") {
      tally.problems++;
      continue;
    }
    tally[actionFor(row)] = (tally[actionFor(row)] || 0) + 1;
  }
  return tally;
});

const commit = async () => {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await $api.post("/clients/import/commit", {
      text: text.value,
      mapping: mapping.value.map((m) => m || null),
      hasHeader: hasHeader.value,
      decisions: Object.fromEntries(
        Object.entries(decisions.value).map(([k, v]) => [String(k), v]),
      ),
    });
    result.value = data;
    step.value = "done";
    await clientStore.fetchClients();
    emit("imported", data);
  } catch (err) {
    error.value = err.response?.data?.message || "The import did not go through.";
  } finally {
    busy.value = false;
  }
};

const restart = () => {
  step.value = "input";
  text.value = "";
  fileName.value = "";
  analysis.value = null;
  decisions.value = {};
  result.value = null;
  error.value = "";
};

/** Human phone for the preview. The stored value is digits; this is reading. */
const showPhone = (row) => {
  const p = row.values.phone;
  if (!p) return "—";
  if (p.startsWith("60")) {
    const n = p.slice(2);
    return `0${n.slice(0, 2)}-${n.slice(2)}`;
  }
  return `+${p}`;
};
</script>

<template>
  <div class="imp">
    <!-- ── 1. Input ─────────────────────────────────────────────────────── -->
    <template v-if="step === 'input'">
      <h3 class="dlg__title">Bring your clients in</h3>
      <p class="dlg__body">
        Paste straight from a spreadsheet, or drop a CSV on the box. Name, phone
        and email in any order — the columns are worked out for you and you get
        to check everything before anything is saved.
      </p>

      <div
        class="imp__drop"
        :class="{ 'imp__drop--over': dragging }"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop">
        <label class="sr-only" for="imp-text">Client rows</label>
        <textarea
          id="imp-text"
          v-model="text"
          rows="9"
          class="inp imp__area no-ik"
          placeholder="Ahmad Faizal&#9;012-345 6789&#9;ahmad@example.com
Siti Nurhaliza&#9;011-2345 6789&#9;siti@example.com"></textarea>
      </div>

      <div class="imp__row">
        <label class="desk-btn desk-btn--ghost desk-btn--sm imp__file">
          <UiIcon icon="heroicons:document-arrow-up" custom-class="w-4 h-4" />
          {{ fileName || "Choose a CSV" }}
          <input type="file" accept=".csv,text/csv,text/plain" @change="onFile" />
        </label>
        <button
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--sm"
          @click="downloadTemplate">
          <UiIcon icon="heroicons:arrow-down-tray" custom-class="w-4 h-4" />
          Download a template
        </button>
      </div>
      <p class="f__hint">
        The template is there if you want it — pasting works fine without one.
      </p>

      <p v-if="error" class="imp__err">{{ error }}</p>

      <div class="dlg__acts">
        <button type="button" class="desk-btn desk-btn--ghost" @click="emit('close')">
          Cancel
        </button>
        <button
          type="button"
          class="desk-btn desk-btn--primary"
          :disabled="!canAnalyse"
          @click="toMap">
          <UiIcon v-if="busy" icon="heroicons:arrow-path" custom-class="w-4 h-4 spin" />
          {{ busy ? "Reading…" : "Continue" }}
        </button>
      </div>
    </template>

    <!-- ── 2. Mapping ───────────────────────────────────────────────────── -->
    <template v-else-if="step === 'map'">
      <h3 class="dlg__title">Check the columns</h3>
      <p class="dlg__body">
        This is what we made of your list. Change anything that is wrong —
        nothing has been saved yet.
      </p>

      <label class="imp__check">
        <input v-model="hasHeader" type="checkbox" />
        <span>The first row is column headings, not a client</span>
      </label>

      <ul class="imp__cols">
        <li v-for="col in analysis?.columns || []" :key="col.index" class="imp__col">
          <div class="imp__colinfo">
            <span class="imp__colname">
              {{ col.header || `Column ${col.index + 1}` }}
            </span>
            <span class="imp__colsample">
              {{ col.sample.join(" · ") || "empty" }}
            </span>
          </div>
          <select
            class="inp imp__sel"
            :value="mapping[col.index] || ''"
            :aria-label="`What is in column ${col.index + 1}?`"
            @change="setField(col.index, $event.target.value)">
            <option v-for="o in FIELD_OPTIONS" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </li>
      </ul>

      <p v-if="!mapping.includes('name')" class="imp__err">
        Nothing is set as the name. Every client needs one.
      </p>
      <p v-if="error" class="imp__err">{{ error }}</p>

      <div class="dlg__acts">
        <button type="button" class="desk-btn desk-btn--ghost" @click="step = 'input'">
          Back
        </button>
        <button
          type="button"
          class="desk-btn desk-btn--primary"
          :disabled="busy || !mapping.includes('name')"
          @click="toPreview">
          <UiIcon v-if="busy" icon="heroicons:arrow-path" custom-class="w-4 h-4 spin" />
          {{ busy ? "Checking…" : "Preview the import" }}
        </button>
      </div>
    </template>

    <!-- ── 3. Preview ───────────────────────────────────────────────────────
         The step the spec insists on. Every row, what will happen to it, and
         for anything that cannot be imported, why — in a sentence rather than
         an error code.
    -->
    <template v-else-if="step === 'preview'">
      <h3 class="dlg__title">Here is what will happen</h3>
      <p class="dlg__body">
        <b>{{ counts.create }}</b> to add<template v-if="counts.update">
          , <b>{{ counts.update }}</b> to update</template
        ><template v-if="counts.skip">
          , <b>{{ counts.skip }}</b> skipped</template
        ><template v-if="counts.problems">
          , <b>{{ counts.problems }}</b> with problems</template
        >. Nothing is saved until you press import.
      </p>

      <div class="imp__tablewrap">
        <table class="imp__table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Phone</th>
              <th scope="col">Email</th>
              <th scope="col">What happens</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in analysis?.rows || []"
              :key="row.index"
              :class="{ 'imp__tr--bad': row.status === 'problem' }">
              <td>
                <span class="imp__name">{{ row.values.name || "—" }}</span>
                <span v-if="row.values.company" class="imp__sub">
                  {{ row.values.company }}
                </span>
              </td>
              <td class="imp__mono">{{ showPhone(row) }}</td>
              <td class="imp__mono">{{ row.values.email || "—" }}</td>
              <td>
                <!-- A row with problems cannot be imported, so it gets a
                     reason rather than a control that would not work. -->
                <template v-if="row.status === 'problem'">
                  <span class="chip chip--late">
                    <i class="chip__dot" aria-hidden="true"></i>Cannot import
                  </span>
                  <span
                    v-for="issue in row.issues"
                    :key="issue.code"
                    class="imp__sub">
                    {{ issue.message }}
                  </span>
                </template>

                <!-- Duplicates, of both kinds: already in your clients, or
                     repeated within this list. Both default to skip and both
                     get the same controls — keyed on `status` rather than on
                     `match`, because an in-file repeat has no existing client
                     to point at and would otherwise render no way to choose. -->
                <template v-else-if="row.status === 'duplicate'">
                  <span class="imp__sub">
                    <template v-if="row.match">
                      Already in your clients — matched on {{ row.matchedOn }}
                    </template>
                    <template v-else>
                      Same as row {{ row.duplicateOfRow + 1 }} in this list
                    </template>
                  </span>
                  <div class="imp__choice" role="group" aria-label="What to do with this row">
                    <button
                      v-for="opt in row.match
                        ? [
                            { key: 'skip', label: 'Skip' },
                            { key: 'update', label: 'Update' },
                            { key: 'create', label: 'Add anyway' },
                          ]
                        : [
                            { key: 'skip', label: 'Skip' },
                            { key: 'create', label: 'Add anyway' },
                          ]"
                      :key="opt.key"
                      type="button"
                      class="seg"
                      :class="{ 'seg--on': actionFor(row) === opt.key }"
                      :aria-pressed="actionFor(row) === opt.key"
                      @click="setAction(row, opt.key)">
                      {{ opt.label }}
                    </button>
                  </div>
                </template>

                <template v-else>
                  <span class="chip chip--paid">
                    <i class="chip__dot" aria-hidden="true"></i>New
                  </span>
                  <span
                    v-for="warn in row.warnings"
                    :key="warn.code"
                    class="imp__sub imp__sub--warn">
                    {{ warn.message }}
                  </span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="error" class="imp__err">{{ error }}</p>

      <div class="dlg__acts">
        <button type="button" class="desk-btn desk-btn--ghost" @click="step = 'map'">
          Back
        </button>
        <button
          type="button"
          class="desk-btn desk-btn--primary"
          :disabled="busy || (counts.create === 0 && counts.update === 0)"
          @click="commit">
          <UiIcon v-if="busy" icon="heroicons:arrow-path" custom-class="w-4 h-4 spin" />
          {{
            busy
              ? "Importing…"
              : `Import ${counts.create + counts.update} ${
                  counts.create + counts.update === 1 ? "client" : "clients"
                }`
          }}
        </button>
      </div>
    </template>

    <!-- ── 4. Done ──────────────────────────────────────────────────────────
         A summary with counts AND a list of everything skipped, per the spec.
         "23 imported" alone leaves the user wondering about the other four.
    -->
    <template v-else>
      <h3 class="dlg__title">{{ result?.message }}</h3>

      <p v-if="result?.skipped?.length" class="dlg__body">
        These were not imported:
      </p>
      <ul v-if="result?.skipped?.length" class="imp__skips">
        <li v-for="s in result.skipped" :key="s.index">
          <b>{{ s.name || `Row ${s.index + 1}` }}</b> — {{ s.reason }}
        </li>
      </ul>
      <p v-else class="dlg__body">Everything on your list went in.</p>

      <div class="dlg__acts">
        <button type="button" class="desk-btn desk-btn--ghost" @click="restart">
          Import another list
        </button>
        <button type="button" class="desk-btn desk-btn--primary" @click="emit('close')">
          Done
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Backgrounded and font-set like .dlg, and for the same reason: UiModal
   teleports its panel to <body>, so this markup renders outside .desk and
   inherits none of its typography. The panel itself is a Tailwind `bg-white`
   that a global !important flips in dark mode — painting --desk-card here means
   the surface and the token-coloured text inside it are decided by the same
   system, instead of light-on-white when the theme changes. */
.imp {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  background-color: var(--desk-card);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--desk-text);
}

.imp__drop {
  border: 1px dashed var(--desk-line);
  border-radius: var(--desk-radius-inset);
  padding: 3px;
  transition: border-color var(--dur-base) var(--ease-out);
}
.imp__drop--over {
  border-color: var(--desk-accent);
  background-color: var(--desk-accent-surface);
}
.imp__area {
  width: 100%;
  min-height: 11rem;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.7;
  resize: vertical;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;
}

.imp__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.imp__file {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.imp__file input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.imp__check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--desk-text-2);
}

.imp__cols {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 22rem;
  overflow-y: auto;
}
.imp__col {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 11rem;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--desk-radius-inset);
  background-color: var(--desk-item);
}
.imp__colinfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.imp__colname {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--desk-text);
}
.imp__colsample {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--desk-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.imp__sel {
  height: 2.25rem;
}

.imp__tablewrap {
  max-height: 24rem;
  overflow: auto;
  border: 1px solid var(--desk-line);
  border-radius: var(--desk-radius-inset);
}
.imp__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.imp__table th {
  position: sticky;
  top: 0;
  z-index: 1;
  text-align: left;
  padding: var(--space-3) var(--space-4);
  background-color: var(--desk-sunken);
  border-bottom: 1px solid var(--desk-line);
  font-size: var(--text-2xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--desk-text-3);
}
.imp__table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--desk-line);
  vertical-align: top;
}
.imp__tr--bad td {
  background-color: var(--desk-late-surface);
}
.imp__name {
  display: block;
  font-weight: var(--weight-semibold);
  color: var(--desk-text);
}
.imp__sub {
  display: block;
  margin-top: 2px;
  font-size: var(--text-xs);
  color: var(--desk-text-3);
  line-height: var(--leading-relaxed);
}
.imp__sub--warn {
  color: var(--desk-warn);
}
.imp__mono {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--desk-text-2);
  white-space: nowrap;
}
.imp__choice {
  display: inline-flex;
  gap: 2px;
  margin-top: var(--space-2);
}

.imp__skips {
  margin: 0;
  padding-left: var(--space-5);
  display: grid;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--desk-text-2);
  max-height: 16rem;
  overflow-y: auto;
}

.imp__err {
  font-size: var(--text-sm);
  color: var(--desk-late);
}

@media (max-width: 640px) {
  .imp__col {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
