<script setup>
/**
 * "Just describe it" — the AI drafting pane.
 *
 * Presentational. The parent owns the transcript and the request, because the
 * create and edit endpoints differ by one flag and the parent is the only thing
 * that knows which it is.
 *
 * Two fixes carried over from the old inline version:
 *  - `chatContainer` was declared on the create page but never bound to an
 *    element, so auto-scroll silently did nothing there while working on edit.
 *    The ref lives here now, next to the element it scrolls.
 *  - the transcript rendered `v-html` on model output after a bold-substitution
 *    regex, which is a live HTML injection path through a third-party API
 *    response. Bold is now applied by splitting the string, so the model cannot
 *    emit markup.
 */
import { computed, nextTick, ref, watch } from "vue";

const props = defineProps({
  messages: { type: Array, default: () => [] },
  busy: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  /** The two example prompts shown before anyone has typed anything. */
  examples: { type: Array, default: () => [] },
  greeting: { type: String, default: "" },
  placeholder: { type: String, default: "Describe the change…" },
});

const emit = defineEmits(["send", "clear"]);

const draft = ref("");
const log = ref(null);

/* **bold** without v-html: split on the delimiter and let Vue create the text
   nodes. Odd indices are the emphasised runs. */
const parts = (content) =>
  String(content ?? "")
    .split(/\*\*(.*?)\*\*/g)
    .map((text, i) => ({ text, bold: i % 2 === 1 }));

const canSend = computed(
  () => !!draft.value.trim() && !props.busy && !props.disabled,
);

const send = () => {
  if (!canSend.value) return;
  emit("send", draft.value.trim());
  draft.value = "";
};

const toBottom = async () => {
  await nextTick();
  if (log.value) log.value.scrollTop = log.value.scrollHeight;
};
watch(() => [props.messages.length, props.busy], toBottom);
</script>

<template>
  <div class="chat">
    <div ref="log" class="chat__log">
      <div class="msg">
        <span class="msg__av" aria-hidden="true">
          <UiIcon icon="heroicons:sparkles" custom-class="w-4 h-4" />
        </span>
        <div class="msg__body">
          {{ greeting }}
          <span v-for="(eg, i) in examples" :key="i" class="msg__eg">
            “{{ eg }}”
          </span>
        </div>
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="msg"
        :class="msg.role === 'user' ? 'msg--me' : 'msg--ai'">
        <span v-if="msg.role !== 'user'" class="msg__av" aria-hidden="true">
          <UiIcon icon="heroicons:sparkles" custom-class="w-4 h-4" />
        </span>
        <div class="msg__body">
          <template v-for="(part, p) in parts(msg.content)" :key="p">
            <b v-if="part.bold">{{ part.text }}</b>
            <template v-else>{{ part.text }}</template>
          </template>
        </div>
      </div>

      <div v-if="busy" class="msg msg--ai">
        <span class="msg__av" aria-hidden="true">
          <UiIcon icon="heroicons:arrow-path" custom-class="w-4 h-4 spin" />
        </span>
        <div class="msg__body">Reading that…</div>
      </div>
    </div>

    <form class="chat__form" @submit.prevent="send">
      <div class="search search--plain bar__grow">
        <label class="sr-only" for="assist-input">
          Describe what this invoice should say
        </label>
        <input
          id="assist-input"
          v-model="draft"
          type="text"
          class="search__inp no-ik"
          :placeholder="placeholder"
          :disabled="disabled" />
      </div>
      <button
        v-if="messages.length"
        type="button"
        class="desk-btn desk-btn--icon"
        aria-label="Clear this conversation"
        @click="emit('clear')">
        <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
      </button>
      <button
        type="submit"
        class="chat__send"
        :disabled="!canSend"
        aria-label="Send">
        <UiIcon icon="heroicons:arrow-right" custom-class="w-4 h-4" />
      </button>
    </form>
  </div>
</template>
