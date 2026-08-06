<script setup>
/**
 * The reminder-interval control, shared by the Email and WhatsApp tabs.
 *
 * Both tabs had their own copy: the same select, the same Pro chip, the same
 * quota warning, and three `v-if` branches each explaining what the chosen
 * interval means — written twice, in different words, from different fields.
 * One component, one explanation, so the two channels cannot describe the same
 * mechanism differently.
 */
import { computed } from "vue";

const props = defineProps({
  /** The interval in days. Negative means "before due". */
  modelValue: { type: [Number, String], default: 0 },
  /** "email" | "WhatsApp" — used in the sentence, so it reads naturally. */
  channel: { type: String, default: "email" },
  isPro: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "go"]);

const OPTIONS = [
  { value: 0, label: "Never — I chase them myself" },
  { value: -3, label: "3 days before it is due" },
  { value: 3, label: "Every 3 days once late" },
  { value: 7, label: "Every 7 days once late" },
  { value: 14, label: "Every 14 days once late" },
];

const value = computed({
  get: () => Number(props.modelValue) || 0,
  set: (v) => emit("update:modelValue", Number(v) || 0),
});

/* One sentence, derived. The old page had two of these per tab and they
   disagreed: the email tab said reminders repeat "until it is marked as Paid",
   the WhatsApp tab said they repeat forever without qualification. */
const explains = computed(() => {
  const n = value.value;
  if (!n)
    return `No automatic ${props.channel} reminders. Nothing goes out unless you send it.`;
  if (n < 0)
    return `One ${props.channel} reminder, ${Math.abs(n)} days before the due date. Nothing after it falls due.`;
  return `A ${props.channel} reminder every ${n} days after the due date, until the invoice is paid or cancelled.`;
});
</script>

<template>
  <div>
    <div v-if="!isPro" class="gate">
      <UiIcon icon="heroicons:lock-closed" custom-class="w-4 h-4" />
      <span class="gate__grow">
        Automatic {{ channel }} reminders are a paid feature. You can still send
        them by hand from any invoice.
      </span>
      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        @click="emit('go', 'billing')">
        See plans
      </button>
    </div>

    <template v-else>
      <div class="f" style="max-width: 22rem">
        <UiSelect
          v-model="value"
          label="How often"
          :options="OPTIONS"
          placeholder="Pick an interval" />
      </div>
      <p class="f__hint">{{ explains }}</p>

      <div v-if="value !== 0" class="banner" style="margin-top: 1rem">
        <UiIcon icon="heroicons:information-circle" custom-class="w-5 h-5" />
        <span>
          Every reminder counts against your monthly quota. A short interval
          across a lot of late invoices spends it quickly.
        </span>
      </div>
    </template>
  </div>
</template>
