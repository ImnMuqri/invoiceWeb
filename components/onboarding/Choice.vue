<script setup lang="ts">
/**
 * A single-select card, used by the two survey steps.
 *
 * It is a real <input type="radio"> under a <label>, not a div with a click
 * handler. That buys arrow-key movement within the group, the correct
 * announcement ("2 of 5, selected"), and form semantics, for free.
 *
 * The unselected state draws an empty ring rather than nothing at all. The
 * previous version rendered an invisible 20px box until a card was chosen, so
 * nothing on the screen said these options were mutually exclusive — people
 * clicked one, saw a tick appear, and clicked another expecting both.
 */
defineProps<{
  modelValue: string
  /** The value this card represents, and the label shown on it. */
  value: string
  name: string
  description?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <label class="choice" :class="{ 'is-selected': modelValue === value }">
    <input
      class="k-sr"
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      @change="emit('update:modelValue', value)" />

    <span class="choice__text">
      <span class="choice__label">{{ value }}</span>
      <span v-if="description" class="choice__desc">{{ description }}</span>
    </span>

    <span class="choice__tick" aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <path
          d="M3.4 8.4 6.4 11.4 12.6 4.6"
          fill="none" stroke="currentColor" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </label>
</template>

<style scoped>
.choice {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background-color: var(--surface-raised);
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}
.choice:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}
.choice.is-selected {
  border-color: var(--surface-accent);
  background-color: var(--surface-accent-soft);
  box-shadow: inset 0 0 0 1px var(--surface-accent);
}

/* The radio itself is clipped, so its focus ring would be too. The card wears
   it instead — keyboard only, so a mouse click does not leave one behind. */
.choice:has(input:focus-visible) {
  outline: 2.5px solid var(--focus-ring);
  outline-offset: 3px;
}

.choice__text {
  display: grid;
  gap: var(--space-1);
}
.choice__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}
.choice__desc {
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
}

.choice__tick {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-full);
  color: transparent;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}
.choice__tick svg {
  width: 12px;
  height: 12px;
}
.is-selected .choice__tick {
  border-color: transparent;
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
</style>
