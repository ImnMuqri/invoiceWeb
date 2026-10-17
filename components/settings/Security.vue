<script setup>
/**
 * Settings → Security.
 *
 * One form: change your password.
 *
 * This tab used to show the page's global "Save settings" button in its footer,
 * permanently disabled — `saveSettings()` returns early for `security` and
 * `isDirty` is hard-coded false here, so it was a dead primary control at
 * opacity 0.5. The footer is now rendered per tab, and this tab does not ask for
 * one, because its own button is the button.
 */
import { computed } from "vue";

const props = defineProps({
  busy: { type: Boolean, default: false },
});

const emit = defineEmits(["change"]);

const form = ref({ oldPassword: "", newPassword: "", confirmPassword: "" });

/* Said before you submit, not after. The old version validated on submit and
   returned one error at a time through the toast. */
const problems = computed(() => {
  const f = form.value;
  const out = [];
  if (!f.oldPassword) out.push("your current password");
  if (f.newPassword.length < 8) out.push("a new password of at least 8 characters");
  else if (f.confirmPassword && f.newPassword !== f.confirmPassword)
    out.push("the two new passwords to match");
  return out;
});

const submit = () => {
  if (problems.value.length) return;
  emit("change", { ...form.value }, () => {
    form.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
  });
};
</script>

<template>
  <form class="sec" style="max-width: 26rem" @submit.prevent="submit">
    <div class="sec__head">
      <h2 class="sec__title">Password</h2>
      <p class="sec__note">
        Changing it does not sign you out anywhere else. Eight characters
        minimum.
      </p>
    </div>

    <div class="f">
      <label class="f__label" for="pw-old">Current password</label>
      <input
        id="pw-old"
        v-model="form.oldPassword"
        type="password"
        autocomplete="current-password"
        class="inp no-ik" />
    </div>

    <div class="f">
      <label class="f__label" for="pw-new">New password</label>
      <input
        id="pw-new"
        v-model="form.newPassword"
        type="password"
        autocomplete="new-password"
        class="inp no-ik" />
      <p class="f__hint">
        <template v-if="!form.newPassword">
          Long beats complicated — three or four unrelated words is stronger than
          one word with symbols in it.
        </template>
        <template v-else-if="form.newPassword.length < 8">
          {{ 8 - form.newPassword.length }} more
          {{ 8 - form.newPassword.length === 1 ? "character" : "characters" }} to go.
        </template>
        <template v-else>Long enough.</template>
      </p>
    </div>

    <div class="f">
      <label class="f__label" for="pw-confirm">New password again</label>
      <input
        id="pw-confirm"
        v-model="form.confirmPassword"
        type="password"
        autocomplete="new-password"
        class="inp no-ik" />
      <p
        v-if="form.confirmPassword && form.newPassword !== form.confirmPassword"
        class="f__hint"
        style="color: var(--desk-late)">
        These two do not match yet.
      </p>
    </div>

    <div class="bar" style="margin-top: 1.5rem">
      <button
        type="submit"
        class="desk-btn desk-btn--primary"
        :disabled="busy || problems.length > 0">
        <UiIcon
          v-if="busy"
          icon="heroicons:arrow-path"
          custom-class="w-4 h-4 spin" />
        {{ busy ? "Changing…" : "Change password" }}
      </button>
      <span v-if="problems.length" class="set__dirty">
        Needs {{ problems.join(", and ") }}.
      </span>
    </div>
  </form>
</template>
