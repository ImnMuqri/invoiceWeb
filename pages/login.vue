<script setup lang="ts">
/**
 * Sign in.
 *
 * `autocomplete` on every field (password managers), a reveal toggle, inline
 * validation, and a real "Forgot?" route now that the backend has a reset flow.
 * EN | BM via useAuthLocale. Google sign-in is not shown until it exists.
 */
import { useAuthStore } from '~/stores/authStore'
import { useAuthLocale } from '~/composables/useAuthCopy'

definePageMeta({ layout: false })

const router = useRouter()
const authStore = useAuthStore()
const { t } = useAuthLocale()
const c = computed(() => t.value.login)

const email = ref('')
const password = ref('')
const errors = ref<{ email?: 'empty' | 'format'; password?: 'empty' }>({})
const formError = ref('')
const submitting = ref(false)

const emailError = computed(() =>
  errors.value.email === 'empty' ? c.value.errEmail : errors.value.email === 'format' ? c.value.errEmailFormat : undefined
)
const passwordError = computed(() => (errors.value.password ? c.value.errPassword : undefined))

function validate() {
  const next: typeof errors.value = {}
  const e = email.value.trim()
  if (!e) next.email = 'empty'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) next.email = 'format'
  if (!password.value) next.password = 'empty'
  errors.value = next
  return Object.keys(next).length === 0
}

async function handleLogin() {
  formError.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    await authStore.login(email.value.trim(), password.value)
    await router.push('/dashboard')
  } catch (err: any) {
    /* One message for "no such email" and "wrong password" — telling an
       attacker which half matched is an account-enumeration hole. */
    formError.value = err?.response?.data?.message || authStore.error || c.value.errGeneric
  } finally {
    submitting.value = false
  }
}

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
    :title="c.title"
    :title-accent="c.accent"
    :lead="c.lead">
    <template #alt>
      {{ c.alt }} <a href="/register">{{ c.altLink }}</a>
    </template>

    <form class="form" novalidate @submit.prevent="handleLogin">
      <p v-if="formError" class="alert" role="alert">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M8 4.6v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
        </svg>
        {{ formError }}
      </p>

      <AuthField
        id="email"
        v-model="email"
        :label="c.email"
        type="email"
        autocomplete="username"
        inputmode="email"
        :placeholder="c.emailPh"
        :error="emailError"
        required />

      <AuthField
        id="password"
        v-model="password"
        :label="c.password"
        type="password"
        autocomplete="current-password"
        :placeholder="c.passwordPh"
        :error="passwordError"
        :show-label="t.shell.show"
        :hide-label="t.shell.hide"
        required>
        <template #action>
          <a href="/forgot-password" class="inline-link">{{ c.forgot }}</a>
        </template>
      </AuthField>

      <button type="submit" class="k-btn k-btn--primary submit" :disabled="submitting">
        {{ submitting ? c.submitting : c.submit }}
      </button>
    </form>

    <template #panel>
      <AuthPanel kind="feed" :t="t" />
    </template>
  </AuthShell>
</template>

<style scoped src="~/assets/css/auth-form.css"></style>
