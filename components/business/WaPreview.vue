<script setup>
/**
 * What the template actually looks like when it lands on a client's phone.
 *
 * Two things it does that a mock-up would not:
 *
 *  1. It fills the placeholders in. A template full of {{invoiceNumber}} tells
 *     you nothing about whether the sentence reads well; the same template with
 *     "INV-0042" in it does.
 *
 *  2. It renders WhatsApp's own formatting. WhatsApp turns *asterisks* into
 *     bold, _underscores_ into italic, ~tildes~ into strikethrough and
 *     ```backticks``` into monospace — so a template written with them looks
 *     wrong here unless the preview honours them, and a user who does not know
 *     the syntax can discover it by seeing the asterisks disappear.
 *
 * Parsed into segments and rendered as real elements rather than through
 * v-html. The string is the user's own, so injection is not the threat it is
 * with model output — but the invoice assistant had a v-html bold renderer
 * removed for exactly this shape of problem, and there is no reason to
 * reintroduce the pattern when a parser is the same amount of code.
 */
import { computed } from "vue";

const props = defineProps({
  template: { type: String, default: "" },
  /** Used when the box is empty, so the preview shows the system default. */
  fallback: { type: String, default: "" },
  companyName: { type: String, default: "" },
  senderName: { type: String, default: "" },
  currency: { type: String, default: "MYR" },
});

const SAMPLE_CLIENT = "Aisyah";

const sample = computed(() => ({
  userName: props.senderName || "Muqri",
  companyName: props.companyName || props.senderName || "your business",
  clientName: SAMPLE_CLIENT,
  invoiceNumber: "INV-0042",
  totalAmount: "1,200.00",
  currency: props.currency || "MYR",
  dueDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  invoiceUrl: "https://invokita.my/pay/1042",
}));

/** Unknown placeholders are left as-is — that is the bug you want to see. */
const filled = computed(() => {
  const src = props.template?.trim() ? props.template : props.fallback;
  return String(src || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, key) =>
    key in sample.value ? sample.value[key] : whole,
  );
});

/**
 * WhatsApp's formatting, in the order it resolves them, plus bare URLs.
 * Each match becomes a segment so the template can render elements directly.
 */
const RULES = [
  { tag: "code", re: /```([\s\S]+?)```/ },
  { tag: "b", re: /(?<![\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])/ },
  { tag: "i", re: /(?<![\w_])_(?!\s)([^_\n]+?)(?<!\s)_(?![\w_])/ },
  { tag: "s", re: /(?<![\w~])~(?!\s)([^~\n]+?)(?<!\s)~(?![\w~])/ },
  /* Trailing punctuation stays outside the link. "Pay at {{invoiceUrl}}." is
     how anyone would write the sentence, and a naive [^\s]+ swallows the full
     stop into the href — which then 404s when tapped. */
  { tag: "a", re: /(https?:\/\/[^\s<]*[^\s<.,;:!?)\]}'"])/ },
];

const parse = (input) => {
  const walk = (text) => {
    for (const rule of RULES) {
      const m = rule.re.exec(text);
      if (!m) continue;
      const before = text.slice(0, m.index);
      const after = text.slice(m.index + m[0].length);
      return [
        ...walk(before),
        { tag: rule.tag, text: m[1], href: rule.tag === "a" ? m[1] : null },
        ...walk(after),
      ];
    }
    return text ? [{ tag: null, text }] : [];
  };
  return walk(String(input || ""));
};

const parts = computed(() => parse(filled.value));

const now = computed(() =>
  new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
);

const from = computed(
  () => props.companyName || props.senderName || "Your business",
);

const initials = computed(() =>
  from.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase(),
);
</script>

<template>
  <div class="wa">
    <div class="wa__head">
      <span class="wa__av" aria-hidden="true">{{ initials }}</span>
      <span class="wa__from">{{ from }}</span>
    </div>
    <div class="wa__body">
      <div class="wa__row">
        <div class="wa__bubble">
          <span class="wa__text"
            ><template v-for="(p, i) in parts" :key="i"
              ><b v-if="p.tag === 'b'">{{ p.text }}</b
              ><i v-else-if="p.tag === 'i'">{{ p.text }}</i
              ><s v-else-if="p.tag === 's'">{{ p.text }}</s
              ><code v-else-if="p.tag === 'code'">{{ p.text }}</code
              ><a
                v-else-if="p.tag === 'a'"
                :href="p.href"
                target="_blank"
                rel="noopener noreferrer"
                >{{ p.text }}</a
              ><template v-else>{{ p.text }}</template></template
            ></span
          ><span class="wa__time">{{ now }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
