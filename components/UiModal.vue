<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="modelValue"
        class="umodal__scrim fixed inset-0 z-[60]"
        @click="closeOnBackdrop && $emit('update:modelValue', false)"></div>
    </Transition>

    <Transition name="modal-content">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[70] overflow-y-auto pointer-events-none">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
          style="zoom: 0.9">
          <div
            class="umodal__card relative overflow-hidden text-left transition-all sm:my-8 w-full pointer-events-auto"
            :class="[maxWidthClass, `umodal__card--${surface}`]">
            <div v-if="title" class="umodal__head">
              <div class="umodal__heading">
                <h3 class="umodal__title">{{ title }}</h3>
                <p v-if="description" class="umodal__desc">
                  {{ description }}
                </p>
              </div>
              <button
                v-if="showClose"
                type="button"
                aria-label="Close"
                @click="$emit('update:modelValue', false)"
                class="umodal__x">
                <UiIcon icon="heroicons:x-mark" />
              </button>
            </div>

            <!-- Close Button (Absolute if no title) -->
            <button
              v-else-if="showClose"
              type="button"
              aria-label="Close"
              @click="$emit('update:modelValue', false)"
              class="umodal__x umodal__x--float">
              <UiIcon icon="heroicons:x-mark" />
            </button>
            <!-- Content Slot -->
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  maxWidth: {
    type: String,
    default: "sm", // sm, md, lg, xl, 2xl, 3xl, 4xl
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  /* "token" themes the shell from desk tokens, so it follows light/dark like
     the rest of the app — correct for any content that is itself built from
     desk classes, which is all but three call sites.

     "light" pins the old fixed-white shell. It exists for the three modals
     whose CONTENT is still hardcoded Tailwind slate (WelcomeModal,
     ModuleHelpModal, PaymentConnectModal): a themed shell would put their
     dark slate text on a dark card in dark mode. They keep today's appearance
     until that content is migrated to tokens, at which point the prop comes
     off and this branch can go with it. */
  surface: {
    type: String,
    default: "token",
    validator: (v) => ["token", "light"].includes(v),
  },
});

defineEmits(["update:modelValue"]);

const maxWidthClass = computed(() => {
  const classes = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    /* Added for the client import preview (spec 08). A preview table the user
       has to scroll sideways to read is a preview they will skip — which
       defeats the point of having one, since it is the only thing standing
       between a bad paste and 200 wrong clients. */
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
  };
  return classes[props.maxWidth] || classes.sm;
});

// Prevent body scroll when modal is open
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<style scoped>
/* ─── The shell ─────────────────────────────────────────────────────────────
   This was hardcoded light — bg-white, slate borders, slate text — so in dark
   mode every modal in the app rendered as a white card floating on a dark
   page. Worse than merely inconsistent: content styled from desk tokens (the
   pay page's bank-transfer panel) resolved its DARK token surface and text
   inside that white card, which put dark text on a dark panel and made the
   account number unreadable at the one moment a stranger needs to copy it.

   Reading the same desk tokens as the content means the shell and whatever is
   slotted into it always agree about which theme they are in. The tokens are
   already declared for BOTH theme markers (:root[data-theme='dark'] and
   html.dark), so nothing here needs to know how the theme is set.

   Class names are prefixed `umodal__` on purpose: app-desk.css owns generic
   names like `.card` and `.card__head` GLOBALLY, and scoping this block does
   not stop those rules from reaching in. */
.umodal__scrim {
  background-color: rgb(15 23 42 / 0.4);
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease;
}
:root[data-theme='dark'] .umodal__scrim,
html.dark .umodal__scrim {
  /* A 40% slate veil over an already-dark page leaves the card barely
     separated from it. Dark needs a heavier scrim to do the same job the
     lighter one does over white. */
  background-color: rgb(0 0 0 / 0.62);
}

.umodal__card {
  border: 1px solid transparent;
  border-radius: var(--desk-radius-shell);
  box-shadow: var(--shadow-lg);
}
/* A modal is the most elevated surface in the app, and "most elevated" is a
   different token in each theme — so this is a genuine per-theme pair rather
   than one alias that happens to work once.

   Light takes --desk-item (#fdfcfc, the near-white card) so the sheet reads as
   lifted off the page; --desk-card is the SIDEBAR grey (#f3f2f0) and sat only
   a shade off the --desk-sunken header, which flattened the two together.

   Dark takes --desk-card (--app-3, the lightest app surface) for the same
   reason. Using --desk-item there would resolve to --app-2, the exact value
   --desk-sunken resolves to, and the header band would vanish into the card. */
.umodal__card--token {
  background-color: var(--desk-item);
  border-color: var(--desk-line);
}
:root[data-theme='dark'] .umodal__card--token,
html.dark .umodal__card--token {
  background-color: var(--desk-card);
}
/* The pinned legacy shell — the exact slate values it carried before, kept
   verbatim so the three un-migrated modals do not shift. */
.umodal__card--light {
  background-color: #ffffff;
  border-color: rgb(226 232 240);
}

/* One step down from the card, so the title band reads as a header rather than
   as more content. --desk-sunken is below --desk-card in both themes. */
.umodal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid transparent;
}
.umodal__card--token .umodal__head {
  background-color: var(--desk-sunken);
  border-bottom-color: var(--desk-line);
}
.umodal__card--light .umodal__head {
  background-color: rgb(248 250 252 / 0.5);
  border-bottom-color: rgb(241 245 249);
}
.umodal__card--light .umodal__title {
  color: rgb(15 23 42);
}
.umodal__card--light .umodal__desc {
  color: rgb(100 116 139);
}
.umodal__card--light .umodal__x {
  color: rgb(148 163 184);
}
.umodal__card--light .umodal__x:hover {
  color: rgb(71 85 105);
  background-color: rgb(226 232 240);
}
.umodal__heading {
  flex: 1;
  min-width: 0;
}
.umodal__title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-tight);
  color: var(--desk-text);
}
.umodal__desc {
  margin: var(--space-1) 0 0;
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--desk-text-3);
}

.umodal__x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: var(--radius-full);
  background-color: transparent;
  color: var(--desk-text-3);
  cursor: pointer;
  transition:
    color 150ms ease,
    background-color 150ms ease;
}
.umodal__x:hover {
  color: var(--desk-text);
  background-color: var(--desk-line);
}
.umodal__x--float {
  position: absolute;
  right: var(--space-3);
  top: var(--space-3);
  z-index: 10;
}
/* Sized by font-size, not width/height: @nuxt/icon renders a <span> with a mask
   in css mode and an <svg> in svg mode, and both default to 1em — so this holds
   whichever mode the module is in. The belt-and-braces :deep rule covers an
   explicit size attribute on the element itself. */
.umodal__x {
  font-size: 1.15rem;
}
.umodal__x :deep(svg),
.umodal__x :deep(span) {
  width: 1em;
  height: 1em;
}

.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-content-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
  transition: all 0.2s ease-in;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(5px);
}
</style>
