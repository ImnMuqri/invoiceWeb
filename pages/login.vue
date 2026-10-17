<script setup lang="ts">
/**
 * Sign in.
 *
 * The previous version (.archive/login.legacy.vue) had no `autocomplete`
 * attributes — which quietly breaks every password manager — no password
 * reveal, no inline validation, and a "Forgot?" link pointing at href="#": a
 * dead end with no recovery path at all. See the note on that link below.
 */
import { useAuthStore } from '~/stores/authStore'
import { useSocialAuth } from '~/composables/useSocialAuth'

definePageMeta({ layout: false })

const router = useRouter()
const authStore = useAuthStore()
const social = useSocialAuth()

const email = ref('')
const password = ref('')
const errors = ref<{ email?: string; password?: string }>({})
const formError = ref('')
const submitting = ref(false)

function validate() {
  const next: { email?: string; password?: string } = {}
  if (!email.value.trim()) next.email = 'Enter the email address on your account.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
    next.email = 'That does not look like an email address.'
  if (!password.value) next.password = 'Enter your password.'
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
    /* The API returns one message for both "no such email" and "wrong
       password", which is correct — telling an attacker which half matched is
       an account-enumeration hole. Surfaced as-is. */
    formError.value =
      err?.response?.data?.message ||
      authStore.error ||
      'Could not sign you in. Check your details and try again.'
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
    eyebrow="Welcome back"
    title="Sign in to"
    title-accent="InvoKita."
    lead="Pick up where you left off. Anything that came due while you were away has already been chased."
    meta-title="Sign in — InvoKita"
    panel-title="It kept working while you were gone."
    :panel-points="[
      'Reminders went out on the schedule you set, in your words.',
      'Anything your gateway confirmed is already marked paid.',
      'Invoices that got paid stopped being chased automatically.',
    ]">
    <form class="form" novalidate @submit.prevent="handleLogin">
      <!-- Google slot. Off until the backend route exists — see
           composables/useSocialAuth.ts for exactly what that takes. -->
      <template v-if="social.enabled">
        <a :href="social.googleUrl" class="social">
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62Z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26A5.4 5.4 0 0 1 9 14.42a5.42 5.42 0 0 1-5.09-3.75H.96v2.33A9 9 0 0 0 9 18Z" fill="#34A853" />
            <path d="M3.91 10.67a5.41 5.41 0 0 1 0-3.34V5H.96a9 9 0 0 0 0 8l2.95-2.33Z" fill="#FBBC05" />
            <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .96 5l2.95 2.33A5.42 5.42 0 0 1 9 3.58Z" fill="#EA4335" />
          </svg>
          Continue with Google
        </a>
        <p class="divider"><span>or</span></p>
      </template>

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
        label="Email"
        type="email"
        autocomplete="username"
        inputmode="email"
        placeholder="you@yourbusiness.com"
        :error="errors.email"
        required />

      <AuthField
        id="password"
        v-model="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        placeholder="Your password"
        :error="errors.password"
        required>
        <template #action>
          <!-- No password reset flow exists in the backend yet, so this reaches
               a human rather than the dead href="#" it pointed at before. -->
          <a
            href="mailto:support@invokita.my?subject=Password%20reset%20request"
            class="forgot">Forgot?</a>
        </template>
      </AuthField>

      <button type="submit" class="k-btn k-btn--primary submit" :disabled="submitting">
        {{ submitting ? 'Signing you in…' : 'Sign in' }}
      </button>
    </form>

    <template #alt>
      New here?
      <a href="/register" class="k-link">Create a free account</a>
    </template>
  </AuthShell>
</template>

<style scoped>
.form {
  display: grid;
  gap: var(--space-5);
}

.submit {
  width: 100%;
  margin-top: var(--space-2);
}
.submit:disabled {
  opacity: 0.7;
  cursor: progress;
}

.forgot {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-accent);
  text-decoration: none;
}
.forgot:hover {
  text-decoration: underline;
}

.social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 3rem;
  padding: var(--space-3) var(--space-5);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-full);
  background-color: var(--surface-raised);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
  text-decoration: none;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);
}
.social:hover {
  border-color: var(--text-primary);
  background-color: var(--chip-hover-bg);
}
.social svg {
  width: 18px;
  height: 18px;
}

.divider {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--border-default);
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--state-error);
  border-radius: var(--radius-md);
  background-color: var(--state-error-surface);
  color: var(--state-error);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
}
.alert svg {
  width: 16px;
  height: 16px;
  flex: none;
  margin-top: 2px;
}
</style>
