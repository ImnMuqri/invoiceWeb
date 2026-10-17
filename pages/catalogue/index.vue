<script setup>
/**
 * CATALOGUE — the things you sell, priced once.
 *
 * A price list, not an inventory. Nothing here tracks stock, because nothing in
 * this product decrements a quantity when an invoice goes out, and a column
 * called "in stock" that never moves is worse than no column at all.
 *
 * The list is sorted by use rather than alphabetically. A catalogue is a long
 * tail — four or five things earn nearly all the money and the rest are once-a-
 * year — and A-to-Z buries exactly the ones you came here to find.
 *
 * Editing is inline in a modal rather than on its own page. These records have
 * four fields; a route transition for four fields is ceremony.
 */
import { computed, onMounted, ref } from "vue";
import { useCatalogueStore } from "~/stores/catalogueStore";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { cash, currencySymbol, parsePrice, priceToInput } from "~/utils/invoice";

const store = useCatalogueStore();
const authStore = useAuthStore();
const uiStore = useUiStore();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const search = ref("");
const showArchived = ref(false);

const cur = computed(() => currencySymbol(authStore.user?.defaultCurrency || "MYR"));

onMounted(() => store.fetchItems({ includeArchived: true, force: true }));

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return store.items
    .filter((i) => (showArchived.value ? true : !i.archived))
    .filter((i) =>
      !q
        ? true
        : [i.name, i.description, i.unit]
            .filter(Boolean)
            .some((f) => String(f).toLowerCase().includes(q)),
    );
});

const liveCount = computed(() => store.items.filter((i) => !i.archived).length);
const archivedCount = computed(() => store.items.filter((i) => i.archived).length);
const busiest = computed(() =>
  store.items
    .filter((i) => !i.archived && i.timesUsed > 0)
    .sort((a, b) => b.timesUsed - a.timesUsed)[0],
);

/* ─── The editor ──────────────────────────────────────────────────────────── */
const editorOpen = ref(false);
const editing = ref(null);
const saving = ref(false);
const draft = ref({ name: "", description: "", price: "", unit: "" });

const openNew = () => {
  editing.value = null;
  draft.value = { name: "", description: "", price: "", unit: "" };
  editorOpen.value = true;
};

const openEdit = (item) => {
  editing.value = item;
  draft.value = {
    name: item.name || "",
    description: item.description || "",
    /* CatalogueItem.price is sen; the field holds what a person types.
       `String(item.price)` put "10000" in the box for a RM100 item, and saving
       it back stored 10000 SEN — so opening an item and pressing save without
       touching anything repriced it from RM100 to RM1. The table beside it was
       already formatting correctly, so the two disagreed on the same screen. */
    price: priceToInput(item.price),
    unit: item.unit || "",
  };
  editorOpen.value = true;
};

const canSave = computed(() => !!draft.value.name.trim());

const saveDraft = async () => {
  if (!canSave.value) return;
  saving.value = true;
  const payload = {
    name: draft.value.name.trim(),
    description: draft.value.description.trim() || null,
    /* The write boundary — "1,200.50" and "1200.5" both land as sen. */
    price: parsePrice(draft.value.price),
    unit: draft.value.unit.trim() || null,
  };
  try {
    if (editing.value) {
      await store.updateItem(editing.value.id, payload);
      notify(`${payload.name} updated.`);
    } else {
      await store.addItem(payload);
      notify(`${payload.name} saved. It is in the picker now.`);
    }
    editorOpen.value = false;
  } catch (err) {
    notify(
      err.response?.data?.message || "Could not save that. Your details are still here.",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

/* ─── Archive and delete ──────────────────────────────────────────────────── */
const removeFor = ref(null);
const removing = ref(false);

const confirmRemove = async () => {
  const item = removeFor.value;
  if (!item) return;
  removing.value = true;
  try {
    const res = await store.removeItem(item.id);
    removeFor.value = null;
    notify(res?.archived ? `${item.name} archived.` : `${item.name} deleted.`);
  } catch {
    notify(`Could not remove ${item.name}.`, "error");
  } finally {
    removing.value = false;
  }
};

const restore = async (item) => {
  try {
    await store.updateItem(item.id, { archived: false });
    notify(`${item.name} is back in your catalogue.`);
  } catch {
    notify("Could not restore that.", "error");
  }
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Catalogue</h1>
        <p class="desk__sub">
          The things you sell, priced once. Add them to an invoice or quotation
          in a click instead of typing them again.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('catalogue')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
        <button type="button" class="desk-btn desk-btn--primary" @click="openNew">
          <UiIcon icon="heroicons:plus" custom-class="w-4 h-4" />
          Add an item
        </button>
      </div>
    </header>

    <section class="strip" aria-label="Catalogue summary">
      <div>
        <p class="desk__eyebrow">In your catalogue</p>
        <p class="strip__v">{{ liveCount }}</p>
        <p class="strip__n">
          {{ liveCount === 1 ? "thing you sell" : "things you sell" }}
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Most used</p>
        <p class="strip__v strip__v--name">{{ busiest ? busiest.name : "—" }}</p>
        <p class="strip__n">
          <template v-if="busiest">
            on {{ busiest.timesUsed }}
            {{ busiest.timesUsed === 1 ? "document" : "documents" }}
          </template>
          <template v-else>Nothing has been used yet</template>
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Archived</p>
        <p class="strip__v">{{ archivedCount }}</p>
        <p class="strip__n">Off the picker, still on old documents</p>
      </div>
    </section>

    <div class="bar">
      <div class="search bar__grow">
        <label class="sr-only" for="cat-search">Search your catalogue</label>
        <span class="search__icon" aria-hidden="true">
          <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
        </span>
        <input
          id="cat-search"
          v-model="search"
          type="search"
          class="search__inp no-ik"
          placeholder="Name, unit, or your own note" />
      </div>
      <button
        v-if="archivedCount"
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        :aria-pressed="showArchived"
        @click="showArchived = !showArchived">
        {{ showArchived ? "Hide archived" : `Show archived (${archivedCount})` }}
      </button>
    </div>

    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Unit</th>
              <th scope="col" class="num">Price</th>
              <th scope="col" class="num">Used</th>
              <th scope="col" class="acts">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody v-if="store.loading && !store.loaded">
            <tr v-for="n in 4" :key="n">
              <td>
                <div class="cel">
                  <i class="sk" style="width: 12rem"></i>
                  <i class="sk" style="width: 8rem"></i>
                </div>
              </td>
              <td><i class="sk" style="width: 4rem"></i></td>
              <td class="num"><i class="sk" style="width: 5rem"></i></td>
              <td class="num"><i class="sk" style="width: 2rem"></i></td>
              <td></td>
            </tr>
          </tbody>

          <tbody v-else-if="!rows.length">
            <tr>
              <td colspan="5">
                <div class="empty empty--pad">
                  <template v-if="search">
                    <p class="empty__title">Nothing matches “{{ search }}”</p>
                    <p class="empty__body">
                      Try part of the name, or add it as a new item.
                    </p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--ghost desk-btn--sm"
                      @click="search = ''">
                      Clear the search
                    </button>
                  </template>
                  <template v-else>
                    <p class="empty__title">Nothing saved yet</p>
                    <p class="empty__body">
                      Add the things you sell most — a day rate, a service, a
                      product — and they will be one click away on every invoice
                      and quotation from then on.
                    </p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--primary desk-btn--sm"
                      @click="openNew">
                      Add your first item
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="item in rows" :key="item.id">
              <td>
                <button type="button" class="cel cel__link" @click="openEdit(item)">
                  <span class="cel__main">
                    {{ item.name }}
                    <span v-if="item.archived" class="chip chip--idle">Archived</span>
                  </span>
                  <span v-if="item.description" class="cel__sub">
                    {{ item.description }}
                  </span>
                </button>
              </td>
              <td>
                <span class="cel__sub">{{ item.unit || "—" }}</span>
              </td>
              <td class="num">{{ cur }} {{ cash(item.price) }}</td>
              <td class="num">{{ item.timesUsed || 0 }}</td>
              <td class="acts">
                <div class="cel cel--row" style="justify-content: flex-end">
                  <button
                    v-if="item.archived"
                    type="button"
                    class="desk-btn desk-btn--ghost desk-btn--sm"
                    @click="restore(item)">
                    Restore
                  </button>
                  <template v-else>
                    <button
                      type="button"
                      class="iact"
                      :aria-label="`Edit ${item.name}`"
                      title="Edit"
                      @click="openEdit(item)">
                      <UiIcon icon="heroicons:pencil-square" custom-class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      class="iact iact--danger"
                      :aria-label="`Remove ${item.name}`"
                      title="Remove"
                      @click="removeFor = item">
                      <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Add / edit ───────────────────────────────────────────────────── -->
    <UiModal v-model="editorOpen" max-width="lg">
      <div class="dlg">
        <h3 class="dlg__title">
          {{ editing ? `Edit ${editing.name}` : "Add to your catalogue" }}
        </h3>
        <p class="dlg__body">
          What it is called, what it costs, and what a unit of it is. Changing a
          price here changes what new documents start at — invoices you have
          already sent keep the price they were sent with.
        </p>

        <div class="f">
          <label class="f__label" for="cat-name">
            Name <span class="f__req" aria-hidden="true">*</span>
          </label>
          <input
            id="cat-name"
            v-model="draft.name"
            type="text"
            class="inp no-ik"
            placeholder="Website design"
            @keydown.enter="saveDraft" />
        </div>

        <div class="fgrid">
          <div class="f" style="margin: 0">
            <label class="f__label" for="cat-price">Price</label>
            <div class="money-inp">
              <span class="money-inp__cur">{{ cur }}</span>
              <input
                id="cat-price"
                v-model="draft.price"
                type="text"
                inputmode="decimal"
                class="money-inp__inp no-ik"
                placeholder="0.00" />
            </div>
            <p class="f__hint">
              A starting point. You can still change it on any document.
            </p>
          </div>

          <div class="f" style="margin: 0">
            <label class="f__label" for="cat-unit">Unit</label>
            <input
              id="cat-unit"
              v-model="draft.unit"
              type="text"
              class="inp no-ik"
              placeholder="hour, day, each, project" />
            <p class="f__hint">
              Optional. It reads as “per {{ draft.unit.trim() || "day" }}” on the
              line.
            </p>
          </div>
        </div>

        <div class="f">
          <label class="f__label" for="cat-desc">Description</label>
          <input
            id="cat-desc"
            v-model="draft.description"
            type="text"
            class="inp no-ik"
            placeholder="Optional — a note to yourself, to tell two similar items apart" />
          <p class="f__hint">
            For your eyes in the picker. It does not print on the document.
          </p>
        </div>

        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="editorOpen = false">
            Cancel
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="saving || !canSave"
            @click="saveDraft">
            <UiIcon
              v-if="saving"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ saving ? "Saving…" : editing ? "Save changes" : "Add it" }}
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Remove ───────────────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!removeFor"
      max-width="sm"
      @update:model-value="removeFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Remove {{ removeFor?.name }}?</h3>
        <p class="dlg__body">
          <template v-if="removeFor?.timesUsed">
            This has been used on {{ removeFor.timesUsed }}
            {{ removeFor.timesUsed === 1 ? "document" : "documents" }}, so it is
            archived rather than deleted — it leaves the picker and those
            documents are untouched. You can restore it later.
          </template>
          <template v-else>
            It has never been used on a document, so it is deleted outright.
          </template>
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="removeFor = null">
            Keep it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="removing"
            @click="confirmRemove">
            {{ removeFor?.timesUsed ? "Archive it" : "Delete it" }}
          </button>
        </div>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
