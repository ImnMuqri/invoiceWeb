<script setup>
/**
 * SYSTEM MANAGEMENT — the shell.
 *
 * Five tabs on the desk layer. The tab bodies live in components/admin/; this
 * file owns the nav, the stores and the confirmations. It was 1,729 lines with
 * every tab inline, roughly 280 raw Tailwind slate utilities, and four
 * window.confirm() dialogs.
 *
 * THE CONFIRMS. Suspending an account, cancelling somebody's subscription,
 * deleting a plan and deleting a user all went through `confirm()`. Three
 * problems with that on this particular screen: the dialog is unstyled and
 * unbranded while the rest of the app confirms in UiModal; it is suppressed
 * outright in some embedded and automated contexts, where it returns false and
 * the action silently does not happen; and it cannot show what is actually at
 * stake. "All associated data will be lost forever" is a sentence about a
 * stranger's account, and it deserves to name them and say what goes.
 *
 * Also fixed here rather than in a component, because it is store wiring:
 * creating, updating and deleting a promo code never refetched, so the table
 * only reflected the change if the store happened to mutate its own array.
 */
import { computed, onMounted, ref } from "vue";
import { useAdminStore } from "~/stores/adminStore";
import { usePromoStore } from "~/stores/promoStore";
import { useSystemStore } from "~/stores/systemStore";
import { toInputDate } from "~/utils/date";

definePageMeta({ layout: "default", middleware: "admin" });

const adminStore = useAdminStore();
const promoStore = usePromoStore();
const systemStore = useSystemStore();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const TABS = [
  { id: "general", label: "Switches", icon: "heroicons:bolt" },
  { id: "users", label: "Users", icon: "heroicons:users" },
  { id: "plans", label: "Plans", icon: "heroicons:sparkles" },
  { id: "transactions", label: "Money", icon: "heroicons:banknotes" },
  { id: "promo", label: "Promo", icon: "heroicons:ticket" },
];
const activeTab = ref("general");

/* ─── General ───────────────────────────────────────────────────────────── */
const localConfig = ref({ ...systemStore.config });
const cleanConfig = ref({});
const savingConfig = ref(false);

const configDirty = computed(
  () => JSON.stringify(localConfig.value) !== JSON.stringify(cleanConfig.value),
);

const saveConfig = async () => {
  savingConfig.value = true;
  const ok = await systemStore.updateSystemConfig(localConfig.value);
  if (ok) {
    cleanConfig.value = JSON.parse(JSON.stringify(localConfig.value));
    notify("Applied to every account.");
  } else {
    notify(systemStore.error || "Could not apply those changes.", "error");
  }
  savingConfig.value = false;
};

/* ─── Users ─────────────────────────────────────────────────────────────── */
const userSearch = ref("");
const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase();
  if (!q) return adminStore.users;
  return adminStore.users.filter(
    (u) =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
  );
});

const toggleUserStatus = async (user) => {
  const wasActive = user.isActive;
  const ok = await adminStore.updateUser(user.id, { isActive: !wasActive });
  notify(
    ok
      ? `${user.email} ${wasActive ? "suspended" : "reactivated"}.`
      : adminStore.error ||
          `Could not ${wasActive ? "suspend" : "reactivate"} ${user.email}.`,
    ok ? "success" : "error",
  );
};

/* ── Billing date ── */
const billingFor = ref(null);
const billingDate = ref("");
const savingBilling = ref(false);

const openBillingEditor = (user) => {
  billingFor.value = user;
  /* Was `getTime() + Math.abs(getTimezoneOffset() * 60000)` then toISOString().
     Math.abs drops the sign, so west of UTC the date came back a day out.
     toInputDate formats from local parts with no UTC round trip. */
  billingDate.value = toInputDate(user.subscriptions?.[0]?.subscriptionEnds);
};

const saveBillingDate = async () => {
  savingBilling.value = true;
  const ok = await adminStore.updateUser(billingFor.value.id, {
    subscriptionEnds: billingDate.value || null,
  });
  if (ok) {
    const who = billingFor.value.email;
    billingFor.value = null;
    await adminStore.fetchUsers();
    notify(`Renewal date updated for ${who}.`);
  } else {
    notify(adminStore.error || "Could not update that date.", "error");
  }
  savingBilling.value = false;
};

/* ── Confirmations ── */
const cancelSubFor = ref(null);
const deleteUserFor = ref(null);
const busy = ref(false);

const doCancelSub = async () => {
  busy.value = true;
  const u = cancelSubFor.value;
  const ok = await adminStore.cancelSubscription(u.id);
  cancelSubFor.value = null;
  busy.value = false;
  notify(
    ok
      ? `${u.email} moved to FREE.`
      : adminStore.error || `Could not cancel for ${u.email}.`,
    ok ? "success" : "error",
  );
};

const doDeleteUser = async () => {
  busy.value = true;
  const u = deleteUserFor.value;
  const ok = await adminStore.deleteUser(u.id);
  deleteUserFor.value = null;
  busy.value = false;
  notify(
    ok ? `${u.email} deleted.` : adminStore.error || `Could not delete ${u.email}.`,
    ok ? "success" : "error",
  );
};

/* ─── Plans ─────────────────────────────────────────────────────────────── */
const planModal = ref(false);
const editingPlan = ref(null);
const deletePlanFor = ref(null);

const blankPlan = () => ({
  name: "",
  description: "",
  price: 0,
  currency: "MYR",
  interval: "month",
  waSends: 0,
  emailSends: 0,
  aiCredits: 0,
  waReminders: 0,
  emailReminders: 0,
  invoices: 0,
  quotes: 0,
  features: [],
  isActive: true,
});
const planForm = ref(blankPlan());

const openCreatePlan = () => {
  editingPlan.value = null;
  planForm.value = blankPlan();
  planModal.value = true;
};

const openEditPlan = (plan) => {
  editingPlan.value = plan;
  planForm.value = {
    ...blankPlan(),
    ...plan,
    features: Array.isArray(plan.features) ? [...plan.features] : [],
  };
  planModal.value = true;
};

const savePlan = async () => {
  /* Only the fields the form owns — planForm is spread from the API record when
     editing, so id/createdAt/relations were going back in the write body. */
  const f = planForm.value;
  const payload = {
    name: f.name,
    description: f.description,
    price: f.price,
    currency: f.currency,
    interval: f.interval,
    waSends: f.waSends,
    emailSends: f.emailSends,
    aiCredits: f.aiCredits,
    waReminders: f.waReminders,
    emailReminders: f.emailReminders,
    invoices: f.invoices,
    quotes: f.quotes,
    features: (f.features || []).map((x) => String(x).trim()).filter(Boolean),
    isActive: f.isActive,
  };
  busy.value = true;
  const ok = editingPlan.value
    ? await adminStore.updatePlan(editingPlan.value.id, payload)
    : await adminStore.createPlan(payload);
  busy.value = false;
  if (ok) {
    planModal.value = false;
    await adminStore.fetchPlans();
    notify(editingPlan.value ? `${payload.name} updated.` : `${payload.name} created.`);
  } else {
    notify(adminStore.error || `Could not save ${payload.name}.`, "error");
  }
};

const doDeletePlan = async () => {
  busy.value = true;
  const p = deletePlanFor.value;
  const ok = await adminStore.deletePlan(p.id);
  deletePlanFor.value = null;
  busy.value = false;
  if (ok) await adminStore.fetchPlans();
  notify(
    ok ? `${p.name} removed.` : adminStore.error || `Could not remove ${p.name}.`,
    ok ? "success" : "error",
  );
};

/* ─── Analytics ─────────────────────────────────────────────────────────── */
const month = ref(new Date().getMonth() + 1);
const year = ref(new Date().getFullYear());
const monthlyRevenue = ref(0);
const loadingMonthly = ref(false);

const loadMonthly = async () => {
  loadingMonthly.value = true;
  try {
    const data = await adminStore.fetchMonthlyRevenue(month.value, year.value);
    if (data) monthlyRevenue.value = data.revenue;
  } finally {
    loadingMonthly.value = false;
  }
};

const setMonth = (v) => {
  month.value = v;
  loadMonthly();
};
const setYear = (v) => {
  year.value = v;
  loadMonthly();
};

/* ─── Transactions ──────────────────────────────────────────────────────── */
const txSearch = ref("");
const filteredTx = computed(() => {
  const q = txSearch.value.trim().toLowerCase();
  if (!q) return adminStore.transactions;
  return adminStore.transactions.filter(
    (tx) =>
      tx.user?.name?.toLowerCase().includes(q) ||
      tx.user?.email?.toLowerCase().includes(q) ||
      tx.plan?.toLowerCase().includes(q) ||
      tx.status?.toLowerCase().includes(q),
  );
});

/* ─── Promo ─────────────────────────────────────────────────────────────── */
const promoSearch = ref("");
const filteredPromo = computed(() => {
  const q = promoSearch.value.trim().toLowerCase();
  if (!q) return promoStore.promoCodes;
  return promoStore.promoCodes.filter(
    (p) =>
      p.code?.toLowerCase().includes(q) ||
      p.discountType?.toLowerCase().includes(q),
  );
});

const promoModal = ref(false);
const editingPromo = ref(null);
const deletePromoFor = ref(null);

const blankPromo = () => ({
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  maxUses: null,
  expiresAt: null,
});
const promoForm = ref(blankPromo());

const DISCOUNT_TYPES = [
  { value: "PERCENTAGE", label: "Percentage off" },
  { value: "FIXED", label: "Fixed amount off (MYR)" },
];

const openCreatePromo = () => {
  editingPromo.value = null;
  promoForm.value = blankPromo();
  promoModal.value = true;
};

const openEditPromo = (promo) => {
  editingPromo.value = promo;
  promoForm.value = { ...blankPromo(), ...promo };
  promoModal.value = true;
};

const savePromo = async () => {
  const f = promoForm.value;
  const payload = {
    code: String(f.code || "").trim().toUpperCase(),
    discountType: f.discountType,
    discountValue: Number(f.discountValue) || 0,
    maxUses: f.maxUses === "" || f.maxUses === null ? null : Number(f.maxUses),
    expiresAt: f.expiresAt || null,
  };
  if (!payload.code) {
    notify("Give the code something to be typed as.", "warning");
    return;
  }
  busy.value = true;
  try {
    if (editingPromo.value) {
      await promoStore.updatePromoCode(editingPromo.value.id, payload);
    } else {
      await promoStore.createPromoCode(payload);
    }
    /* None of the three promo writes refetched, so the table was only correct if
       the store happened to mutate its own array. */
    await promoStore.fetchAllPromoCodes();
    promoModal.value = false;
    notify(editingPromo.value ? `${payload.code} updated.` : `${payload.code} created.`);
  } catch (err) {
    notify(err.message || `Could not save ${payload.code}.`, "error");
  } finally {
    busy.value = false;
  }
};

const doDeletePromo = async () => {
  const p = deletePromoFor.value;
  busy.value = true;
  try {
    await promoStore.deletePromoCode(p.id);
    await promoStore.fetchAllPromoCodes();
    deletePromoFor.value = null;
    notify(`${p.code} deleted.`);
  } catch (err) {
    notify(err.message || `Could not delete ${p.code}.`, "error");
  } finally {
    busy.value = false;
  }
};

const togglePromo = async (p) => {
  try {
    await promoStore.togglePromoStatus(p.id);
    await promoStore.fetchAllPromoCodes();
  } catch (err) {
    notify(err.message || `Could not change ${p.code}.`, "error");
  }
};

/* ─── Load ──────────────────────────────────────────────────────────────── */
onMounted(async () => {
  await Promise.all([
    systemStore.fetchSystemConfig(),
    adminStore.fetchUsers(),
    adminStore.fetchAnalytics(),
    adminStore.fetchPlans(),
    adminStore.fetchTransactions(),
    promoStore.fetchAllPromoCodes(),
  ]);
  localConfig.value = { ...systemStore.config };
  cleanConfig.value = JSON.parse(JSON.stringify(localConfig.value));
  loadMonthly();
});
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">System management</h1>
        <p class="desk__sub">
          Platform switches, accounts, plans and money. Everything here affects
          other people.
        </p>
      </div>
    </header>

    <div class="bar">
      <div class="segs" role="group" aria-label="Admin sections">
        <button
          v-for="t in TABS"
          :key="t.id"
          type="button"
          class="seg"
          :class="{ 'seg--on': activeTab === t.id }"
          :aria-pressed="activeTab === t.id"
          @click="activeTab = t.id">
          {{ t.label }}
        </button>
      </div>
    </div>

    <div class="set__panel">
      <div class="set__body">
        <AdminGeneral v-if="activeTab === 'general'" :config="localConfig" />

        <AdminUsers
          v-else-if="activeTab === 'users'"
          :users="filteredUsers"
          :loading="adminStore.loading"
          :search="userSearch"
          @update:search="userSearch = $event"
          @refresh="adminStore.fetchUsers()"
          @edit-billing="openBillingEditor"
          @toggle-status="toggleUserStatus"
          @cancel-sub="cancelSubFor = $event"
          @delete="deleteUserFor = $event" />

        <AdminPlans
          v-else-if="activeTab === 'plans'"
          :analytics="adminStore.analytics"
          :plans="adminStore.plans"
          :month="month"
          :year="year"
          :monthly-revenue="monthlyRevenue"
          :loading-monthly="loadingMonthly"
          @update:month="setMonth"
          @update:year="setYear"
          @create-plan="openCreatePlan"
          @edit-plan="openEditPlan"
          @delete-plan="deletePlanFor = $event" />

        <AdminTransactions
          v-else-if="activeTab === 'transactions'"
          :transactions="filteredTx"
          :loading="adminStore.loading"
          :search="txSearch"
          @update:search="txSearch = $event"
          @refresh="adminStore.fetchTransactions()" />

        <AdminPromo
          v-else-if="activeTab === 'promo'"
          :codes="filteredPromo"
          :search="promoSearch"
          @update:search="promoSearch = $event"
          @refresh="promoStore.fetchAllPromoCodes()"
          @create="openCreatePromo"
          @edit="openEditPromo"
          @toggle="togglePromo"
          @delete="deletePromoFor = $event" />
      </div>

      <!-- Only the switches tab has anything to save. Sibling of .set__body so
           it bleeds to the panel edges by structure rather than by negative
           margins guessing at the body's padding. -->
      <div v-if="activeTab === 'general'" class="set__foot">
        <p class="set__dirty">
          {{ configDirty ? "You have unsaved changes." : "Everything here is saved." }}
        </p>
        <button
          type="button"
          class="desk-btn desk-btn--primary"
          :disabled="savingConfig || !configDirty"
          @click="saveConfig">
          <UiIcon
            v-if="savingConfig"
            icon="heroicons:arrow-path"
            custom-class="w-4 h-4 spin" />
          {{ savingConfig ? "Applying…" : "Apply to all accounts" }}
        </button>
      </div>
    </div>

    <!-- ── Renewal date ─────────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!billingFor"
      max-width="sm"
      @update:model-value="billingFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Renewal date</h3>
        <p class="dlg__body">
          Sets when <b>{{ billingFor?.email }}</b> next renews. Moving it forward
          gives them the plan for longer without charging them.
        </p>
        <div class="f" style="margin-top: var(--space-5)">
          <UiDatePicker v-model="billingDate" label="Renews on" />
          <p class="f__hint">Clear it to remove the end date entirely.</p>
        </div>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="billingFor = null">
            Cancel
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="savingBilling"
            @click="saveBillingDate">
            <UiIcon
              v-if="savingBilling"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            Save date
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Cancel subscription ──────────────────────────────────────────── -->
    <UiModal
      :model-value="!!cancelSubFor"
      max-width="sm"
      @update:model-value="cancelSubFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Cancel this subscription?</h3>
        <p class="dlg__body">
          <b>{{ cancelSubFor?.email }}</b> drops to FREE immediately — not at the
          end of the period they have paid for. Automatic chasing stops for them
          and their invoices stay put.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="cancelSubFor = null">
            Leave it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="busy"
            @click="doCancelSub">
            Cancel their plan
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Delete user ──────────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!deleteUserFor"
      max-width="sm"
      @update:model-value="deleteUserFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Delete {{ deleteUserFor?.email }}?</h3>
        <p class="dlg__body">
          This removes the account and everything in it —
          <b>{{ deleteUserFor?._count?.invoices || 0 }} invoices</b> and
          <b>{{ deleteUserFor?._count?.clients || 0 }} clients</b> — permanently.
          If you only want to lock them out, suspend the account instead.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="deleteUserFor = null">
            Keep the account
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="busy"
            @click="doDeleteUser">
            Delete permanently
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Delete plan ──────────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!deletePlanFor"
      max-width="sm"
      @update:model-value="deletePlanFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Delete the {{ deletePlanFor?.name }} plan?</h3>
        <p class="dlg__body">
          It disappears from the billing page. Anyone already subscribed to it
          keeps their subscription — this does not move them off.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="deletePlanFor = null">
            Keep it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="busy"
            @click="doDeletePlan">
            Delete plan
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Delete promo ─────────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!deletePromoFor"
      max-width="sm"
      @update:model-value="deletePromoFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Delete {{ deletePromoFor?.code }}?</h3>
        <p class="dlg__body">
          Anyone who tries the code from now on is told it is invalid. Discounts
          already applied are not clawed back. To stop it without deleting the
          record, switch it off instead.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="deletePromoFor = null">
            Keep it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="busy"
            @click="doDeletePromo">
            Delete code
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Plan editor ──────────────────────────────────────────────────── -->
    <UiModal v-model="planModal" max-width="lg">
      <form class="dlg" @submit.prevent="savePlan">
        <h3 class="dlg__title">
          {{ editingPlan ? `Edit ${editingPlan.name}` : "New plan" }}
        </h3>
        <p class="dlg__body" style="margin-bottom: var(--space-5)">
          Limits are per month. Anything at 999999 or above shows as unlimited.
        </p>

        <div class="fgrid">
          <div class="f" style="margin: 0">
            <label class="f__label" for="pl-name">Name</label>
            <input id="pl-name" v-model="planForm.name" type="text" class="inp no-ik" />
          </div>
          <div class="f" style="margin: 0">
            <label class="f__label" for="pl-price">Price</label>
            <div class="money-inp">
              <span class="money-inp__cur">{{ planForm.currency }}</span>
              <input
                id="pl-price"
                v-model.number="planForm.price"
                type="number"
                step="0.01"
                min="0"
                class="money-inp__inp no-ik" />
            </div>
          </div>
        </div>

        <div class="f">
          <label class="f__label" for="pl-desc">One line about it</label>
          <input
            id="pl-desc"
            v-model="planForm.description"
            type="text"
            class="inp no-ik"
            placeholder="Shown under the name on the billing page" />
        </div>

        <div class="f">
          <span class="f__label">Monthly limits</span>
          <div class="fgrid">
            <div class="f" style="margin: 0">
              <label class="f__label" for="pl-inv">Invoices</label>
              <input id="pl-inv" v-model.number="planForm.invoices" type="number" min="0" class="inp no-ik" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="pl-quotes">Quotations</label>
              <input id="pl-quotes" v-model.number="planForm.quotes" type="number" min="0" class="inp no-ik" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="pl-ai">AI credits</label>
              <input id="pl-ai" v-model.number="planForm.aiCredits" type="number" min="0" class="inp no-ik" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="pl-was">WhatsApp sends</label>
              <input id="pl-was" v-model.number="planForm.waSends" type="number" min="0" class="inp no-ik" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="pl-es">Email sends</label>
              <input id="pl-es" v-model.number="planForm.emailSends" type="number" min="0" class="inp no-ik" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="pl-war">WhatsApp reminders</label>
              <input id="pl-war" v-model.number="planForm.waReminders" type="number" min="0" class="inp no-ik" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="pl-er">Email reminders</label>
              <input id="pl-er" v-model.number="planForm.emailReminders" type="number" min="0" class="inp no-ik" />
            </div>
          </div>
        </div>

        <div class="f">
          <span class="f__label">What it says on the card</span>
          <div class="lines">
            <div
              v-for="(feat, i) in planForm.features"
              :key="i"
              class="bar"
              style="margin-bottom: var(--space-2)">
              <input
                v-model="planForm.features[i]"
                type="text"
                class="inp no-ik bar__grow"
                placeholder="e.g. Unlimited invoices" />
              <button
                type="button"
                class="iact iact--danger"
                :aria-label="`Remove feature ${i + 1}`"
                @click="planForm.features.splice(i, 1)">
                <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--sm"
            @click="planForm.features.push('')">
            <UiIcon icon="heroicons:plus" custom-class="w-4 h-4" />
            Add a line
          </button>
        </div>

        <div class="f">
          <label class="tog" for="pl-active">
            <input id="pl-active" v-model="planForm.isActive" type="checkbox" class="tog__inp" />
            <span class="tog__track" aria-hidden="true"></span>
            <span class="tog__label">Show this plan on the billing page</span>
          </label>
        </div>

        <div class="dlg__acts">
          <button type="button" class="desk-btn desk-btn--ghost" @click="planModal = false">
            Cancel
          </button>
          <button type="submit" class="desk-btn desk-btn--primary" :disabled="busy">
            <UiIcon v-if="busy" icon="heroicons:arrow-path" custom-class="w-4 h-4 spin" />
            {{ editingPlan ? "Save plan" : "Create plan" }}
          </button>
        </div>
      </form>
    </UiModal>

    <!-- ── Promo editor ─────────────────────────────────────────────────── -->
    <UiModal v-model="promoModal" max-width="md">
      <form class="dlg" @submit.prevent="savePromo">
        <h3 class="dlg__title">
          {{ editingPromo ? `Edit ${editingPromo.code}` : "New promo code" }}
        </h3>
        <p class="dlg__body" style="margin-bottom: var(--space-5)">
          Applied on the billing page before checkout, so people see the
          discounted price before they commit.
        </p>

        <div class="f">
          <label class="f__label" for="pr-code">Code</label>
          <input
            id="pr-code"
            v-model="promoForm.code"
            type="text"
            class="inp no-ik"
            style="text-transform: uppercase; font-family: var(--font-mono)"
            placeholder="LAUNCH20" />
          <p class="f__hint">Case does not matter — it is stored uppercase.</p>
        </div>

        <div class="fgrid">
          <UiSelect
            v-model="promoForm.discountType"
            label="Type"
            :options="DISCOUNT_TYPES" />
          <div class="f" style="margin: 0">
            <label class="f__label" for="pr-val">Amount</label>
            <div class="money-inp">
              <input
                id="pr-val"
                v-model.number="promoForm.discountValue"
                type="number"
                min="0"
                step="0.01"
                class="money-inp__inp no-ik" />
              <span class="money-inp__cur">
                {{ promoForm.discountType === "PERCENTAGE" ? "%" : "MYR" }}
              </span>
            </div>
          </div>
        </div>

        <div class="fgrid">
          <div class="f" style="margin: 0">
            <label class="f__label" for="pr-max">Redemption limit</label>
            <input
              id="pr-max"
              v-model="promoForm.maxUses"
              type="number"
              min="1"
              class="inp no-ik"
              placeholder="Leave empty for unlimited" />
          </div>
          <div class="f" style="margin: 0">
            <UiDatePicker v-model="promoForm.expiresAt" label="Expires" />
            <p class="f__hint">Leave empty and it never expires.</p>
          </div>
        </div>

        <div class="dlg__acts">
          <button type="button" class="desk-btn desk-btn--ghost" @click="promoModal = false">
            Cancel
          </button>
          <button type="submit" class="desk-btn desk-btn--primary" :disabled="busy">
            <UiIcon v-if="busy" icon="heroicons:arrow-path" custom-class="w-4 h-4 spin" />
            {{ editingPromo ? "Save code" : "Create code" }}
          </button>
        </div>
      </form>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
