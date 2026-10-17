<script setup>
/**
 * Pull saved items onto a document.
 *
 * The whole point of the catalogue is that the twentieth time you sell the same
 * thing you should not be typing it again, so this is optimised for the case
 * where you already know what you want: it opens focused on the search box, it
 * sorts by what you actually use rather than alphabetically, and Enter takes the
 * top match. Picking does not close the panel, because adding three lines is as
 * common as adding one.
 *
 * Values are copied onto the line, never linked. An invoice must keep saying
 * what it said when it was sent, so raising a price here cannot reach backwards
 * — see the model comment on CatalogueItem.
 */
import { computed, nextTick, ref, watch } from "vue";
import { useCatalogueStore } from "~/stores/catalogueStore";
import { cash } from "~/utils/invoice";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currency: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "pick"]);

const store = useCatalogueStore();
const search = ref("");
const searchEl = ref(null);
const justAdded = ref([]);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

watch(open, async (isOpen) => {
  if (!isOpen) {
    search.value = "";
    justAdded.value = [];
    return;
  }
  store.fetchItems();
  await nextTick();
  searchEl.value?.focus();
});

const results = computed(() => {
  const q = search.value.trim().toLowerCase();
  const live = store.items.filter((i) => !i.archived);
  if (!q) return live;
  return live.filter((i) =>
    [i.name, i.description, i.unit].filter(Boolean).some((f) =>
      String(f).toLowerCase().includes(q),
    ),
  );
});

const add = (item) => {
  emit("pick", item);
  justAdded.value = [...justAdded.value, item.id];
  /* The tick is the whole feedback. Anything louder — a toast per line — would
     fire four times while somebody builds a four-line invoice. */
  setTimeout(() => {
    justAdded.value = justAdded.value.filter((id) => id !== item.id);
  }, 1400);
};

const addTop = () => {
  if (results.value.length) add(results.value[0]);
};
</script>

<template>
  <UiModal v-model="open" max-width="lg">
    <div class="dlg">
      <h3 class="dlg__title">Add from your catalogue</h3>
      <p class="dlg__body">
        Pick as many as you need — each one becomes a line you can still edit.
        Prices are copied across, so changing one here later leaves this document
        alone.
      </p>

      <div class="search" style="margin-bottom: var(--space-4)">
        <label class="sr-only" for="cat-pick-search">Search your catalogue</label>
        <span class="search__icon" aria-hidden="true">
          <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
        </span>
        <input
          id="cat-pick-search"
          ref="searchEl"
          v-model="search"
          type="search"
          class="search__inp no-ik"
          placeholder="Search your catalogue — Enter adds the top match"
          @keydown.enter.prevent="addTop" />
      </div>

      <div v-if="store.loading && !store.loaded" class="cat">
        <div v-for="n in 3" :key="n" class="cat__row">
          <div class="cat__main">
            <i class="sk" style="width: 11rem"></i>
            <i class="sk" style="width: 6rem"></i>
          </div>
          <i class="sk" style="width: 5rem"></i>
          <i class="sk" style="width: 3rem"></i>
          <i class="sk" style="width: 3rem"></i>
        </div>
      </div>

      <div v-else-if="!store.items.filter((i) => !i.archived).length" class="empty">
        <p class="empty__title">Your catalogue is empty</p>
        <p class="empty__body">
          Save the things you sell once — a day rate, a service, a product — and
          they are one click away on every invoice and quotation after that.
        </p>
        <NuxtLink to="/catalogue" class="desk-btn desk-btn--primary desk-btn--sm">
          Set up your catalogue
        </NuxtLink>
      </div>

      <div v-else-if="!results.length" class="empty">
        <p class="empty__title">Nothing matches “{{ search }}”</p>
        <p class="empty__body">
          Try part of the name, or add it to your catalogue and it will be here
          next time.
        </p>
      </div>

      <div v-else class="cat deskbar" role="list">
        <button
          v-for="item in results"
          :key="item.id"
          type="button"
          role="listitem"
          class="cat__row"
          @click="add(item)">
          <span class="cat__main">
            <span class="cat__name">{{ item.name }}</span>
            <span v-if="item.description" class="cat__note">
              {{ item.description }}
            </span>
          </span>
          <span class="cat__price">{{ currency }} {{ cash(item.price) }}</span>
          <span class="cat__unit">{{ item.unit ? `/ ${item.unit}` : "" }}</span>
          <span class="cat__add">
            <template v-if="justAdded.includes(item.id)">
              <UiIcon icon="heroicons:check" custom-class="w-4 h-4" />
              Added
            </template>
            <template v-else>
              <UiIcon icon="heroicons:plus" custom-class="w-4 h-4" />
              Add
            </template>
          </span>
        </button>
      </div>

      <div class="dlg__acts">
        <NuxtLink to="/catalogue" class="desk-btn desk-btn--ghost">
          Manage catalogue
        </NuxtLink>
        <button type="button" class="desk-btn desk-btn--primary" @click="open = false">
          Done
        </button>
      </div>
    </div>
  </UiModal>
</template>
