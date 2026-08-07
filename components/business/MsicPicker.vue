<script setup>
/**
 * MSIC code picker (spec 05).
 *
 * A picker rather than a text box because, as the spec puts it, users do not
 * know their code by heart. Almost nobody does — MSIC is a 1,500-entry
 * classification and the code you need is five digits with no mnemonic. Asking
 * someone to type it from memory is asking them to leave the field empty.
 *
 * So it searches by DESCRIPTION as well as by code. "design" is a word a
 * designer will actually type; "74102" is not.
 *
 * It does not, however, refuse anything. The underlying field accepts free
 * text and the list here is a working subset rather than the full official
 * classification (see ~/utils/msic), so a code this list has never heard of is
 * still a valid answer — it is typed into the field and stored as-is. A picker
 * that blocks a real code because its own data is incomplete would be worse
 * than no picker.
 */
import { computed, nextTick, ref, watch } from "vue";
import { MSIC, SECTIONS, searchMsic } from "~/utils/msic";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** The code currently stored, so the list can mark it. */
  selected: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "pick"]);

const search = ref("");
const searchEl = ref(null);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

watch(open, async (isOpen) => {
  if (!isOpen) {
    search.value = "";
    return;
  }
  await nextTick();
  searchEl.value?.focus();
});

const results = computed(() => searchMsic(search.value, 60));

/* Only shown when the query is empty, where "60 of 140" would otherwise look
   like the list is broken rather than trimmed. */
const trimmed = computed(
  () => !search.value.trim() && MSIC.length > results.value.length,
);

const choose = (entry) => {
  emit("pick", entry.code);
  open.value = false;
};

const chooseTop = () => {
  if (results.value.length) choose(results.value[0]);
};
</script>

<template>
  <UiModal v-model="open" max-width="lg">
    <div class="dlg">
      <h3 class="dlg__title">Find your MSIC code</h3>
      <p class="dlg__body">
        Search by what you do — “design”, “consulting”, “software” — or by the
        code itself if you already know it.
      </p>

      <div class="search" style="margin-bottom: var(--space-4)">
        <label class="sr-only" for="msic-search">Search MSIC codes</label>
        <span class="search__icon" aria-hidden="true">
          <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
        </span>
        <input
          id="msic-search"
          ref="searchEl"
          v-model="search"
          type="search"
          class="search__inp no-ik"
          placeholder="What do you do? — Enter picks the top match"
          @keydown.enter.prevent="chooseTop" />
      </div>

      <div v-if="!results.length" class="empty">
        <p class="empty__title">Nothing matches “{{ search }}”</p>
        <p class="empty__body">
          This list covers the most common activities, not the full
          classification. If you already know your code, close this and type it
          straight into the field — it will be saved exactly as you enter it.
        </p>
      </div>

      <div v-else class="cat deskbar" role="list">
        <button
          v-for="entry in results"
          :key="entry.code"
          type="button"
          role="listitem"
          class="cat__row"
          :aria-current="entry.code === selected ? 'true' : undefined"
          @click="choose(entry)">
          <span class="cat__main">
            <span class="cat__name">{{ entry.label }}</span>
            <span class="cat__note">{{ SECTIONS[entry.section] }}</span>
          </span>
          <span class="cat__price">{{ entry.code }}</span>
          <span class="cat__add">
            <template v-if="entry.code === selected">
              <UiIcon icon="heroicons:check" custom-class="w-4 h-4" />
              Current
            </template>
            <template v-else>Choose</template>
          </span>
        </button>
      </div>

      <p v-if="trimmed" class="f__hint" style="margin-top: var(--space-3)">
        Showing the first {{ results.length }}. Search to narrow it down.
      </p>

      <div class="dlg__acts">
        <button type="button" class="desk-btn desk-btn--ghost" @click="open = false">
          Cancel
        </button>
      </div>
    </div>
  </UiModal>
</template>
