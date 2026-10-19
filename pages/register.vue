<script setup lang="ts">
/**
 * Create an account.
 *
 * Three fields, because that is all POST /auth/register needs (name, email,
 * password). The referral code appears only when there is a reason for it —
 * ?ref= in the URL (confirmed, not asked) or the visitor opens it.
 *
 * NOTE: the backend does not validate password length on register — it hashes
 * whatever arrives. The 8-character rule here is a UX guardrail. The reset
 * endpoint does enforce it.
 */
import { useAuthStore } from '~/stores/authStore'
import { useAuthLocale, passwordScore } from '~/composables/useAuthCopy'

definePageMeta({ layout: false })

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useAuthLocale()
const c = computed(() => t.value.register)

const PASSWORD_MIN = 8

const name = ref('')
const email = ref('')
const password = ref('')
const referralCode = ref('')
const showReferral = ref(false)
const referredByLink = ref(false)

type Err = 'empty' | 'format' | 'short'
const errors = ref<{ name?: Err; email?: Err; password?: Err }>({})
const formError = ref('')
const submitting = ref(false)

onMounted(() => {
  const raw = route.query.ref
  const code = Array.isArray(raw) ? raw[0] : raw
  if (code) {
    referralCode.value = String(code).trim().toUpperCase()
    referredByLink.value = true
    showReferral.value = true
  }
})

const score = computed(() => passwordScore(password.value))
const lit = computed(() => (password.value ? score.value + 1 : 0))

const nameError = computed(() => (errors.value.name ? c.value.errName : undefined))
const emailError = computed(() =>
  errors.value.email === 'empty' ? c.value.errEmail : errors.value.email === 'format' ? c.value.errEmailFormat : undefined
)
const passwordError = computed(() =>
  errors.value.password === 'empty' ? c.value.errPassword : errors.value.password === 'short' ? c.value.errPasswordShort : undefined
)

function validate() {
  const next: typeof errors.value = {}
  if (!name.value.trim()) next.name = 'empty'
  const e = email.value.trim()
  if (!e) next.email = 'empty'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) next.email = 'format'
  if (!password.value) next.password = 'empty'
  else if (password.value.length < PASSWORD_MIN) next.password = 'short'
  errors.value = next
  return Object.keys(next).length === 0
}

async function handleRegister() {
  formError.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    await authStore.register(
      name.value.trim(),
      email.value.trim(),
      password.value,
      referralCode.value.trim() || undefined
    )
    /* New accounts have onboardingCompleted false, so go straight there. */
    await router.push('/onboarding')
  } catch (err: any) {
    formError.value = err?.response?.data?.message || authStore.error || c.value.errGeneric
  } finally {
    submitting.value = false
  }
}

watch(name, () => {
  if (errors.value.name) errors.value = { ...errors.value, name: undefined }
})
watch(email, () => {
  if (errors.value.email) errors.value = { ...errors.value, email: undefined }
})
watch(password, () => {
  if (errors.value.password) errors.value = { ...errors.value, password: undefined }
})
</script>

<template>
  <AuthShell
    :meta-title="c.meta"
    :eyebrow="c.eyebrow"
    eyebrow-pill
    :title="c.title"
    :title-accent="c.accent"
    :lead="c.lead">
    <template #alt>
      {{ c.alt }} <a href="/login">{{ c.altLink }}</a>
    </template>

    <form class="form" novalidate @submit.prevent="handleRegister">
      <p v-if="formError" class="alert" role="alert">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M8 4.6v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
        </svg>
        {{ formError }}
      </p>

      <AuthField
        id="name"
        v-model="name"
        :label="c.name"
        type="text"
        autocomplete="name"
        :placeholder="c.namePh"
        :error="nameError"
        required />

      <AuthField
        id="email"
        v-model="email"
        :label="c.email"
        type="email"
        autocomplete="email"
        inputmode="email"
        :placeholder="c.emailPh"
        :error="emailError"
        required />

      <AuthField
        id="password"
        v-model="password"
        :label="c.password"
        type="password"
        autocomplete="new-password"
        :placeholder="c.passwordPh"
        :error="passwordError"
        :show-label="t.shell.show"
        :hide-label="t.shell.hide"
        required />
      <div class="strength" :data-score="score" aria-live="polite">
        <div class="strength__bars" aria-hidden="true">
          <span v-for="i in 4" :key="i" :class="{ 'is-on': i <= lit }"></span>
        </div>
        <span class="strength__label">{{ password ? c.strength[score] : '' }}</span>
      </div>

      <p v-if="referredByLink" class="chip-ok">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.4 8.4 6.4 11.4 12.6 4.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ c.referralApplied }} <strong class="k-num">{{ referralCode }}</strong></span>
      </p>
      <Transition name="fade">
        <AuthField
          v-if="showReferral && !referredByLink"
          id="referralCode"
          v-model="referralCode"
          :label="c.referral"
          :optional-label="c.referralOptional"
          type="text"
          autocomplete="off"
          :placeholder="c.referralPh" />
      </Transition>

      <button type="submit" class="k-btn k-btn--primary submit" :disabled="submitting">
        {{ submitting ? c.submitting : c.submit }}
      </button>

      <p class="legal">
        <span>{{ c.terms1 }} <a href="/legal/terms">{{ c.terms }}</a> {{ c.and }} <a href="/legal/privacy">{{ c.privacy }}</a>.</span>
        <button v-if="!showReferral" type="button" class="text-btn" @click="showReferral = true">+ {{ c.referralToggle }}</button>
      </p>
    </form>

    <template #panel>
      <AuthPanel kind="steps" :t="t" />
    </template>
  </AuthShell>
</template>

<style scoped src="~/assets/css/auth-form.css"></style>
