<script setup>
/**
 * THE CLIENT LIST.
 *
 * On the dashboard's design layer, same as /invoices — no Tailwind utilities, so
 * nothing here depends on the ~40 `!important` dark-mode remaps in main.css.
 *
 * Four things about the old page were working against the person using it:
 *
 *  1. `searchQuery` existed, and `filteredClients` filtered on it, and there was
 *     no input anywhere on the page to set it. Exactly the bug the invoice
 *     ledger had. The filter now has a box in front of it, and it covers the
 *     address too — which is what pays for dropping the address column.
 *
 *  2. `toggleChaser()` was defined, complete and correct, and never called. The
 *     two switches in the table were `disabled` with `pointer-events: none`, so
 *     the one control this product exists to offer could only be reached by
 *     opening the edit modal and saving the whole record. They are buttons now
 *     and they call the function that was already written.
 *
 *  3. "Avg Delay" printed `{{ client.averageDelayDays }} days` raw. A client who
 *     has never paid you anything showed "0 days", which is what a perfectly
 *     punctual client shows; a null showed " days". It now says whether there is
 *     any history before it says anything about the habit.
 *
 *  4. Editing spread the entire API record into the form — `form = { ...client }`
 *     — so `id`, `createdAt`, `userId` and every invoice relation went back in
 *     the PUT body. The form now owns six fields and sends six fields.
 *
 * Data contracts unchanged: same store, same payloads, same endpoints.
 */
import { computed, onMounted, ref } from "vue";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { payDelay } from "~/utils/invoice";

const clientStore = useClientStore();
const authStore = useAuthStore();
const uiStore = useUiStore();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

onMounted(() => clientStore.fetchClients());

/* ─── Find it ─────────────────────────────────────────────────────────────── */
const search = ref("");
const view = ref("all");

const VIEWS = [
  { key: "all", label: "Everyone" },
  { key: "chased", label: "Chased" },
  { key: "quiet", label: "Not chased" },
];

const isChased = (c) => !!(c.autoChaser || c.autoEmailChaser);

const matches = (c) => {
  const q = search.value.trim().toLowerCase();
  if (!q) return true;
  return [c.name, c.email, c.company, c.address, c.phone]
    .filter(Boolean)
    .some((f) => String(f).toLowerCase().includes(q));
};

const found = computed(() => clientStore.clients.filter(matches));

const viewCounts = computed(() => ({
  all: found.value.length,
  chased: found.value.filter(isChased).length,
  quiet: found.value.filter((c) => !isChased(c)).length,
}));

const rows = computed(() => {
  const list = found.value.filter((c) => {
    if (view.value === "chased") return isChased(c);
    if (view.value === "quiet") return !isChased(c);
    return true;
  });
  /* Slowest first. A client list sorted by insertion order asks you to read all
     of it; sorted by who costs you the most waiting, the top row is the one
     worth acting on. Clients with no history sink rather than float, because
     "unknown" is not "urgent". */
  return [...list].sort((a, b) => {
    const av = Number(a.averageDelayDays);
    const bv = Number(b.averageDelayDays);
    const an = Number.isFinite(av) ? av : -1;
    const bn = Number.isFinite(bv) ? bv : -1;
    if (an !== bn) return bn - an;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
});

/* ─── The three figures ───────────────────────────────────────────────────────
   Derived from the rows already in memory — no extra request, and nothing here
   that the list below does not also show. */
const summary = computed(() => {
  const all = clientStore.clients;
  const quiet = all.filter((c) => !isChased(c));
  const withHistory = all.filter((c) => Number.isFinite(Number(c.averageDelayDays)));
  const slowest = withHistory.reduce(
    (worst, c) =>
      !worst || Number(c.averageDelayDays) > Number(worst.averageDelayDays)
        ? c
        : worst,
    null,
  );
  return { total: all.length, quiet: quiet.length, slowest };
});

/* ─── Chasing ─────────────────────────────────────────────────────────────── */
const busy = ref({});

const toggleChaser = async (client, field) => {
  if (!authStore.isPro) return;
  const key = `${client.id}:${field}`;
  busy.value = { ...busy.value, [key]: true };
  const next = !client[field];
  try {
    await clientStore.updateClient(client.id, { [field]: next });
    const channel = field === "autoChaser" ? "WhatsApp" : "Email";
    notify(
      next
        ? `${channel} reminders on for ${client.name}.`
        : `${channel} reminders off for ${client.name}.`,
    );
  } catch (err) {
    notify(
      err.response?.data?.message ||
        "Could not change that. Nothing has been sent either way.",
      "error",
    );
  } finally {
    const rest = { ...busy.value };
    delete rest[key];
    busy.value = rest;
  }
};

const chaserWhy = computed(() =>
  authStore.isPro
    ? ""
    : "Automatic reminders are a paid feature — upgrade to turn them on.",
);

/* ─── Add and edit ────────────────────────────────────────────────────────── */
const showForm = ref(false);
const editingId = ref(null);
const saving = ref(false);

const blank = () => ({
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  autoChaser: false,
  autoEmailChaser: false,
  /* Spec 05. Optional, like the business ones — a client with none of these
     set produces exactly the document it produced before. */
  registrationNumber: "",
  tin: "",
  isIndividual: false,
});

const form = ref(blank());

const openAdd = () => {
  editingId.value = null;
  form.value = blank();
  showForm.value = true;
};

const openEdit = (client) => {
  editingId.value = client.id;
  /* Only the fields this form owns. Spreading the whole record put `id`,
     `createdAt` and the invoice relations into the PUT body. */
  form.value = {
    name: client.name || "",
    email: client.email || "",
    phone: client.phone || "",
    company: client.company || "",
    address: client.address || "",
    autoChaser: !!client.autoChaser,
    autoEmailChaser: !!client.autoEmailChaser,
    registrationNumber: client.registrationNumber || "",
    tin: client.tin || "",
    isIndividual: !!client.isIndividual,
  };
  showForm.value = true;
};

const problems = computed(() => {
  const out = [];
  if (!form.value.name.trim()) out.push("give them a name");
  if (!form.value.email.trim()) out.push("add an email to send invoices to");
  return out;
});

const save = async () => {
  if (problems.value.length) {
    notify(`Almost — ${problems.value.join(", and ")}.`, "warning");
    return;
  }
  saving.value = true;
  try {
    const payload = { ...form.value };
    if (editingId.value) {
      await clientStore.updateClient(editingId.value, payload);
      notify(`${payload.name} updated.`);
    } else {
      await clientStore.addClient(payload);
      notify(`${payload.name} added. They will fill themselves into invoices now.`);
    }
    showForm.value = false;
    form.value = blank();
  } catch (err) {
    notify(
      err.response?.data?.message ||
        "Could not save that client. Your details are still on screen.",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

/* ─── Delete ──────────────────────────────────────────────────────────────── */
const deleteFor = ref(null);
const deleting = ref(false);

const confirmDelete = async () => {
  if (!deleteFor.value) return;
  deleting.value = true;
  const name = deleteFor.value.name;
  try {
    await clientStore.deleteClient(deleteFor.value.id);
    deleteFor.value = null;
    notify(`${name} deleted.`);
  } catch (err) {
    notify(
      err.response?.data?.message || `Could not delete ${name}.`,
      "error",
    );
  } finally {
    deleting.value = false;
  }
};

const initial = (name) => String(name || "?").trim().charAt(0) || "?";
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Clients</h1>
        <p class="desk__sub">
          Everyone you bill, how quickly they pay, and whether they get chased
          when they run late.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('clients')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
        <button type="button" class="desk-btn desk-btn--primary" @click="openAdd">
          Add a client
        </button>
      </div>
    </header>

    <!-- ── Three figures ────────────────────────────────────────────────── -->
    <section class="strip" aria-label="Client summary">
      <div>
        <p class="desk__eyebrow">On your list</p>
        <p class="strip__v">{{ summary.total }}</p>
        <p class="strip__n">
          {{ summary.total === 1 ? "client" : "clients" }}
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Nobody chasing</p>
        <p class="strip__v" :class="{ 'strip__v--late': summary.quiet > 0 }">
          {{ summary.quiet }}
        </p>
        <p class="strip__n">
          <template v-if="summary.quiet">
            You chase these ones yourself.
          </template>
          <template v-else>Every client is chased for you.</template>
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Slowest to pay</p>
        <p class="strip__v strip__v--name">
          {{ summary.slowest?.name || "—" }}
        </p>
        <p class="strip__n">
          <template v-if="summary.slowest">
            {{ payDelay(summary.slowest).label.toLowerCase() }}
          </template>
          <template v-else>Nobody has paid an invoice yet.</template>
        </p>
      </div>
    </section>

    <!-- ── Find them ────────────────────────────────────────────────────── -->
    <div class="bar">
      <div class="search bar__grow">
        <label class="sr-only" for="client-search">Search clients</label>
        <span class="search__icon" aria-hidden="true">
          <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
        </span>
        <input
          id="client-search"
          v-model="search"
          type="search"
          class="search__inp no-ik"
          placeholder="Name, email, company, phone or address" />
        <button
          v-if="search"
          type="button"
          class="search__clear"
          aria-label="Clear search"
          @click="search = ''">
          <UiIcon icon="heroicons:x-mark" custom-class="w-4 h-4" />
        </button>
      </div>

      <div class="segs" role="group" aria-label="Filter by chasing">
        <button
          v-for="v in VIEWS"
          :key="v.key"
          type="button"
          class="seg"
          :class="{ 'seg--on': view === v.key }"
          :aria-pressed="view === v.key"
          @click="view = v.key">
          {{ v.label }}
          <span class="seg__n">{{ viewCounts[v.key] }}</span>
        </button>
      </div>
    </div>

    <!-- ── The list ─────────────────────────────────────────────────────── -->
    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Contact</th>
              <th scope="col">Chasing</th>
              <th scope="col">Pays</th>
              <th scope="col" class="acts">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <!-- Rows shaped like the table, so nothing moves when the data
               lands. -->
          <tbody v-if="clientStore.loading && !clientStore.clients.length">
            <tr v-for="i in 5" :key="i">
              <td v-for="j in 5" :key="j">
                <span class="skel" style="display: block"></span>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!rows.length">
            <tr>
              <td colspan="5">
                <div class="empty empty--pad">
                  <template v-if="search">
                    <p class="empty__title">Nothing matches “{{ search }}”.</p>
                    <p class="empty__body">
                      Search covers the name, email, company, phone and address.
                      Try a shorter word.
                    </p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--ghost"
                      @click="search = ''">
                      Clear the search
                    </button>
                  </template>
                  <template v-else-if="view === 'chased'">
                    <p class="empty__title">Nobody is being chased yet.</p>
                    <p class="empty__body">
                      Turn on reminders for a client and we nudge them the day an
                      invoice goes past its due date, so you do not have to.
                    </p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--ghost"
                      @click="view = 'all'">
                      Show everyone
                    </button>
                  </template>
                  <template v-else-if="view === 'quiet'">
                    <p class="empty__title">Everyone is covered.</p>
                    <p class="empty__body">
                      Every client on your list gets chased automatically. This is
                      the view worth being empty.
                    </p>
                  </template>
                  <template v-else>
                    <p class="empty__title">No clients yet.</p>
                    <p class="empty__body">
                      Add whoever you bill once, and their details fill themselves
                      into every invoice you send them after that.
                    </p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--primary"
                      @click="openAdd">
                      Add your first client
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="c in rows" :key="c.id">
              <!-- Who. Company sits under the name rather than in a column of
                   its own; it is a fact about the name, not a separate one. -->
              <td>
                <div class="cel cel--row">
                  <span class="fact__av" aria-hidden="true">{{
                    initial(c.name)
                  }}</span>
                  <span class="cel">
                    <span class="cel__main">{{ c.name || "Unnamed client" }}</span>
                    <span class="cel__sub">{{ c.company || "Personal" }}</span>
                  </span>
                </div>
              </td>

              <!-- How to reach them. The address used to be a column here,
                   truncated to 150px with the rest in a title attribute. It is
                   on the invoice and in the edit form, and the search above
                   still finds a client by it — but nobody scans a client list by
                   street address, so it is not a column. -->
              <td>
                <div class="cel">
                  <a
                    v-if="c.email"
                    :href="`mailto:${c.email}`"
                    class="cel__main cel__link cel__act">
                    {{ c.email }}
                  </a>
                  <span v-else class="cel__main">No email on file</span>
                  <span class="cel__sub">{{ c.phone || "No phone" }}</span>
                </div>
              </td>

              <!-- The one control this product is for, finally connected. -->
              <td>
                <div class="chase">
                  <button
                    type="button"
                    class="chase__btn"
                    :class="{ 'chase__btn--on': c.autoChaser }"
                    :disabled="!authStore.isPro || busy[`${c.id}:autoChaser`]"
                    :aria-pressed="!!c.autoChaser"
                    :title="
                      chaserWhy ||
                      (c.autoChaser
                        ? 'WhatsApp reminders are on'
                        : 'Turn on WhatsApp reminders')
                    "
                    @click="toggleChaser(c, 'autoChaser')">
                    <UiIcon icon="simple-icons:whatsapp" custom-class="w-3 h-3" />
                    <span class="sr-only">
                      WhatsApp reminders for {{ c.name }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="chase__btn"
                    :class="{ 'chase__btn--on': c.autoEmailChaser }"
                    :disabled="
                      !authStore.isPro || busy[`${c.id}:autoEmailChaser`]
                    "
                    :aria-pressed="!!c.autoEmailChaser"
                    :title="
                      chaserWhy ||
                      (c.autoEmailChaser
                        ? 'Email reminders are on'
                        : 'Turn on email reminders')
                    "
                    @click="toggleChaser(c, 'autoEmailChaser')">
                    <UiIcon icon="heroicons:envelope" custom-class="w-3 h-3" />
                    <span class="sr-only">
                      Email reminders for {{ c.name }}
                    </span>
                  </button>
                  <span
                    v-if="!authStore.isPro"
                    class="chase__lock"
                    :title="chaserWhy">
                    <UiIcon icon="heroicons:lock-closed" custom-class="w-3 h-3" />
                    <span class="sr-only">{{ chaserWhy }}</span>
                  </span>
                </div>
              </td>

              <!-- What they have actually done, not a number with "days" after
                   it. "0 days" and "no history" are different facts. -->
              <td>
                <span class="pay" :class="`pay--${payDelay(c).tone}`">
                  {{ payDelay(c).label }}
                </span>
              </td>

              <td class="acts">
                <div class="cel cel--row" style="justify-content: flex-end">
                  <button
                    type="button"
                    class="iact"
                    :aria-label="`Edit ${c.name}`"
                    title="Edit"
                    @click="openEdit(c)">
                    <UiIcon icon="heroicons:pencil-square" custom-class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="iact iact--danger"
                    :aria-label="`Delete ${c.name}`"
                    title="Delete"
                    @click="deleteFor = c">
                    <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Add / edit ───────────────────────────────────────────────────── -->
    <!-- No `title` prop: UiModal draws its own header in Tailwind slate when you
         pass one, which is the surface this pass is migrating away from. The
         .dlg block below carries its own heading, same as the invoice modals. -->
    <UiModal v-model="showForm" max-width="lg">
      <form class="dlg" @submit.prevent="save">
        <h3 class="dlg__title">
          {{ editingId ? `Edit ${form.name || "client"}` : "New client" }}
        </h3>
        <p class="dlg__body" style="margin-bottom: var(--space-5)">
          <template v-if="editingId">
            Changes apply to invoices you send from now on — ones already sent
            keep the details they were sent with.
          </template>
          <template v-else>
            Fill this in once and it fills itself into every invoice you send
            them after that.
          </template>
        </p>

        <div class="f">
          <label class="f__label" for="c-name">
            Name <span class="f__req" aria-hidden="true">*</span>
          </label>
          <input
            id="c-name"
            v-model="form.name"
            type="text"
            class="inp no-ik"
            placeholder="Who are you billing?" />
          <p class="f__hint">This is the name that prints on the invoice.</p>
        </div>

        <div class="f">
          <label class="f__label" for="c-email">
            Email <span class="f__req" aria-hidden="true">*</span>
          </label>
          <input
            id="c-email"
            v-model="form.email"
            type="email"
            class="inp no-ik"
            placeholder="name@company.com" />
          <p class="f__hint">Where invoices and reminders get sent.</p>
        </div>

        <div class="fgrid">
          <div class="f" style="margin: 0">
            <label class="f__label" for="c-phone">Phone</label>
            <input
              id="c-phone"
              v-model="form.phone"
              type="tel"
              class="inp no-ik"
              placeholder="+60 12 345 6789" />
            <p class="f__hint">Needed for WhatsApp reminders.</p>
          </div>
          <div class="f" style="margin: 0">
            <label class="f__label" for="c-company">Company</label>
            <input
              id="c-company"
              v-model="form.company"
              type="text"
              class="inp no-ik"
              placeholder="Optional" />
            <p class="f__hint">Prints under their name when you fill it in.</p>
          </div>
        </div>

        <div class="f">
          <label class="f__label" for="c-address">Address</label>
          <textarea
            id="c-address"
            v-model="form.address"
            rows="2"
            class="inp no-ik"
            placeholder="Optional — prints on the invoice"></textarea>
        </div>

        <!-- ── Tax identity (spec 05) ───────────────────────────────────────
             The individual flag comes first because it decides whether the two
             fields under it are worth asking for at all. -->
        <div class="f">
          <label class="tog" for="c-individual">
            <input
              id="c-individual"
              v-model="form.isIndividual"
              type="checkbox"
              class="tog__inp" />
            <span class="tog__mark" aria-hidden="true"></span>
            <span>
              <span class="tog__title">This is a person, not a business</span>
              <span class="tog__note">
                Individuals do not have a company registration number, so there
                is no point asking you for one.
              </span>
            </span>
          </label>
        </div>

        <div v-if="!form.isIndividual" class="fgrid">
          <div class="f" style="margin: 0">
            <label class="f__label" for="c-ssm">Registration number</label>
            <input
              id="c-ssm"
              v-model="form.registrationNumber"
              type="text"
              class="inp no-ik"
              placeholder="Optional" />
          </div>
          <div class="f" style="margin: 0">
            <label class="f__label" for="c-tin">TIN</label>
            <input
              id="c-tin"
              v-model="form.tin"
              type="text"
              class="inp no-ik"
              placeholder="Optional" />
          </div>
        </div>
        <div v-else class="f">
          <label class="f__label" for="c-tin-individual">TIN</label>
          <input
            id="c-tin-individual"
            v-model="form.tin"
            type="text"
            class="inp no-ik"
            placeholder="Optional" />
          <p class="f__hint">
            Individuals have one too. Only fill it in if they have asked you to
            put it on their invoices.
          </p>
        </div>

        <div class="f">
          <span class="f__label">Chase them for you</span>
          <label class="tog" for="c-wa">
            <input
              id="c-wa"
              v-model="form.autoChaser"
              type="checkbox"
              class="tog__inp"
              :disabled="!authStore.isPro" />
            <span class="tog__track" aria-hidden="true"></span>
            <span class="tog__label">Remind them over WhatsApp</span>
          </label>
          <label class="tog" for="c-email-chase" style="margin-top: 0.75rem">
            <input
              id="c-email-chase"
              v-model="form.autoEmailChaser"
              type="checkbox"
              class="tog__inp"
              :disabled="!authStore.isPro" />
            <span class="tog__track" aria-hidden="true"></span>
            <span class="tog__label">Remind them by email</span>
          </label>
          <p class="f__hint">
            <template v-if="authStore.isPro">
              We nudge them the day an invoice goes past its due date, and keep
              going until it is paid. You can turn this off per client any time.
            </template>
            <template v-else>{{ chaserWhy }}</template>
          </p>
        </div>

        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            :disabled="saving"
            @click="showForm = false">
            Cancel
          </button>
          <!-- Deliberately not disabled when incomplete: pressing it names what
               is missing, which a greyed button cannot do on a touch device. -->
          <button type="submit" class="desk-btn desk-btn--primary" :disabled="saving">
            <UiIcon
              v-if="saving"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ saving ? "Saving…" : editingId ? "Save changes" : "Add client" }}
          </button>
        </div>
      </form>
    </UiModal>

    <!-- ── Delete ───────────────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!deleteFor"
      max-width="sm"
      @update:model-value="deleteFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Delete {{ deleteFor?.name }}?</h3>
        <p class="dlg__body">
          Their invoices stay in your records, but they lose the client details
          attached to them — and anything scheduled to chase
          <b>{{ deleteFor?.name }}</b> stops. There is no undo.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="deleteFor = null">
            Keep them
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="deleting"
            @click="confirmDelete">
            <UiIcon
              v-if="deleting"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ deleting ? "Deleting…" : "Delete for good" }}
          </button>
        </div>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
