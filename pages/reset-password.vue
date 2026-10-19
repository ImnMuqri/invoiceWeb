<script setup lang="ts">
/**
 * Set a new password — the page the reset email links to (?token=…).
 *
 * States: checking the link → form, or "link expired" → done.
 * The token is checked as soon as the page opens so nobody types a new
 * password twice into a link that was already dead. Submit is enabled only
 * when both rules pass; the server enforces the same 8-character minimum.
 */
import { useAuthStore } from '~/stores/authStore'
import { useAuthLocale, passwordScore } from '~/composables/useAuthCopy'

definePageMeta({ layout: false })

const route = useRoute()
const authStore = useAuthStore()
const { t } = useAuthLocale()
const c = computed(() => t.value.reset)

const token = computed(() => {
  const raw = route.query.token
  return String(Array.isArray(raw) ? raw[0] : raw || '')
})

type Phase = 'checking' | 'form' | 'invalid' | 'done'
const phase = ref<Phase>('checking')
const accountEmail = ref('')
const password = ref('')
const confirm = ref('')
const submitting = ref(false)
const formError = ref('')

onMounted(async () => {
  if (!token.value) {
    phase.value = 'invalid'
    return
  }
  try {
    const res = await authStore.checkResetToken(token.value)
    if (res?.valid) {
      accountEmail.value = res.email || ''
      phase.value = 'form'
    } else {
      phase.value = 'invalid'
    }
  } catch {
    phase.value = 'invalid'
  }
})

const score = computed(() => passwordScore(password.value))
const lit = computed(() => (password.value ? score.value + 1 : 0))
const okLength = computed(() => password.value.length >= 8)
const okMatch = computed(() => password.value.length > 0 && password.value === confirm.value)
const ready = computed(() => okLength.value && okMatch.value)

async function save() {
  if (!ready.value) return
  formError.value = ''
  submitting.value = true
  try {
    await authStore.resetPassword(token.value, password.value)
    phase.value = 'done'
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 400 && /expired|invalid/i.test(err?.response?.data?.message || '')) {
      phase.value = 'invalid'
    } else {
      formError.value = err?.response?.data?.message || c.value.errGeneric
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell
    :meta-title="c.meta"
    :eyebrow="phase === 'form' ? c.eyebrow : undefined"
    :title="phase === 'form' ? c.title : undefined"
    :title-accent="c.accent">
    <p v-if="phase === 'checking'" class="help" role="status">{{ c.checking }}</p>

    <template v-else-if="phase === 'form'">
      <p class="state__body">{{ c.lead }} <strong>{{ accountEmail }}</strong></p>
      <form class="form" novalidate @submit.prevent="save">
        <!-- Lets password managers attach the new password to the right account. -->
        <input type="email" name="username" autocomplete="username" :value="accountEmail" readonly hidden />
        <p v-if="formError" class="alert" role="alert">{{ formError }}</p>
        <AuthField
          id="new-password"
          v-model="password"
          :label="c.newPassword"
          type="password"
          autocomplete="new-password"
          :placeholder="c.newPasswordPh"
          :show-label="t.shell.show"
          :hide-label="t.shell.hide"
          required />
        <div class="strength" :data-score="score">
          <div class="strength__bars" aria-hidden="true">
            <span v-for="i in 4" :key="i" :class="{ 'is-on': i <= lit }"></span>
          </div>
          <span class="strength__label">{{ password ? c.strength[score] : '' }}</span>
        </div>
        <AuthField
          id="confirm-password"
          v-model="confirm"
          :label="c.confirm"
          type="password"
          autocomplete="new-password"
          :placeholder="c.confirmPh"
          :show-label="t.shell.show"
          :hide-label="t.shell.hide"
          required />
        <ul class="rules" aria-live="polite">
          <li :class="{ 'is-ok': okLength }"><i aria-hidden="true">{{ okLength ? '✓' : '' }}</i>{{ c.rules[0] }}</li>
          <li :class="{ 'is-ok': okMatch }"><i aria-hidden="true">{{ okMatch ? '✓' : '' }}</i>{{ c.rules[1] }}</li>
        </ul>
        <button type="submit" class="k-btn k-btn--primary submit" :disabled="!ready || submitting">
          {{ submitting ? c.submitting : c.submit }}
        </button>
      </form>
    </template>

    <div v-else-if="phase === 'invalid'" class="state" role="status">
      <span class="state__icon state__icon--warn" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v6" /><path d="M12 16.5h.01" />
        </svg>
      </span>
      <h1 class="state__title">{{ c.invalidTitle }}</h1>
      <p class="state__body">{{ c.invalidBody }}</p>
      <div class="row">
        <a href="/forgot-password" class="k-btn k-btn--primary">{{ c.invalidCta }}</a>
        <a href="/login" class="back-link">{{ c.back }}</a>
      </div>
    </div>

    <div v-else class="state" role="status">
      <span class="state__icon state__icon--solid" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <h1 class="state__title">{{ c.doneTitle }}</h1>
      <p class="state__body">{{ c.doneBody }}</p>
      <a href="/login" class="k-btn k-btn--primary submit">{{ c.doneCta }}</a>
    </div>

    <template #panel>
      <AuthPanel kind="queue" :t="t" />
    </template>
  </AuthShell>
</template>

<style scoped src="~/assets/css/auth-form.css"></style>
