<script setup lang="ts">
/**
 * Auth form field.
 *
 * The old forms were missing `autocomplete` entirely, which quietly breaks
 * every password manager and is the single biggest friction point on a sign-in
 * screen. It is required here rather than optional.
 *
 * Password fields get a visibility toggle. On a phone, typing a long password
 * blind into a 390px screen is where sign-ups are abandoned.
 */
const props = withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    type?: 'text' | 'email' | 'password'
    /** Required: an auth field without it breaks password managers. */
    autocomplete: string
    placeholder?: string
    hint?: string
    error?: string
    required?: boolean
    inputmode?: string
    optionalLabel?: string
  }>(),
  { type: 'text', required: false }
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const resolvedType = computed(() =>
  isPassword.value && revealed.value ? 'text' : props.type
)
const describedBy = computed(() => {
  const ids: string[] = []
  if (props.error) ids.push(`${props.id}-error`)
  else if (props.hint) ids.push(`${props.id}-hint`)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <div class="field" :class="{ 'field--invalid': !!error }">
    <div class="field__top">
      <label :for="id" class="field__label">
        {{ label }}
        <span v-if="optionalLabel" class="field__optional">{{ optionalLabel }}</span>
      </label>
      <slot name="action" />
    </div>

    <div class="field__control">
      <input
        :id="id"
        :type="resolvedType"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :inputmode="inputmode"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        class="field__input no-ik"
        :class="{ 'field__input--pad': isPassword }"
        spellcheck="false"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />

      <button
        v-if="isPassword"
        type="button"
        class="field__reveal"
        :aria-pressed="revealed"
        :aria-label="revealed ? 'Hide password' : 'Show password'"
        @click="revealed = !revealed">
        <svg v-if="revealed" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10S14.5 15.5 10 15.5 2.5 10 2.5 10Z"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M3.5 3.5 16.5 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10S14.5 15.5 10 15.5 2.5 10 2.5 10Z"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>
    </div>

    <!-- One slot: the error replaces the hint rather than stacking, so the form
         never grows taller as you fix it. -->
    <p v-if="error" :id="`${id}-error`" class="field__msg field__msg--error">
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path d="M8 4.6v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
      </svg>
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="field__msg">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: var(--space-2);
}

.field__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}
.field__optional {
  margin-left: var(--space-2);
  font-weight: var(--weight-regular);
  color: var(--text-tertiary);
}

.field__control {
  position: relative;
  display: flex;
}

.field__input {
  width: 100%;
  min-height: 3rem;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background-color: var(--surface-raised);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--text-base); /* 16px: anything smaller zooms iOS Safari */
  line-height: 1.4;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}
.field__input--pad {
  padding-right: 3rem;
}
.field__input::placeholder {
  color: var(--text-tertiary);
}
.field__input:hover {
  border-color: var(--text-tertiary);
}
/* Focus = accent border + the global design-token ring from landing.css
   (`.kirim :focus-visible`). The input carries `no-ik` so main.css's legacy
   input block — which forces its own halo with !important and suppresses the
   outline — does not apply here.

   Deliberately NO `outline` rule of its own: an earlier local `outline: none`
   on :focus out-specified the global ring and left the three text inputs with
   no visible ring at all. And deliberately no halo either — with the ring
   present, a border + halo + outline stacks three indicators on one field.

   Note text inputs match :focus-visible on pointer focus as well as keyboard,
   per spec, because they accept keyboard input. So the ring shows on click too.
   That is correct and matches native browser behaviour. */
.field__input:focus {
  border-color: var(--surface-accent);
}

.field--invalid .field__input,
.field--invalid .field__input:focus {
  border-color: var(--state-error);
}

.field__reveal {
  position: absolute;
  right: 0;
  top: 0;
  display: grid;
  place-items: center;
  width: 3rem;
  height: 100%;
  min-height: 3rem;
  border: 0;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: color var(--dur-fast) var(--ease-out);
}
.field__reveal:hover {
  color: var(--text-primary);
}
.field__reveal svg {
  width: 19px;
  height: 19px;
}

.field__msg {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
}
.field__msg--error {
  color: var(--state-error);
  font-weight: var(--weight-semibold);
}
.field__msg svg {
  width: 14px;
  height: 14px;
  flex: none;
  margin-top: 1px;
}
</style>
