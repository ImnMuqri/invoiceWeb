<script setup lang="ts">
/**
 * Create an account.
 *
 * Three fields, because that is all POST /auth/register actually needs
 * (name, email, password). The referral code was a fourth field shown to
 * everybody; it now only appears when there is a reason for it — either ?ref=
 * is in the URL, in which case it is confirmed rather than asked, or the
 * visitor opens it deliberately.
 *
 * NOTE: the backend does not validate password length — it hashes whatever
 * arrives. The 8-character rule below is enforced here only, so it is a UX
 * guardrail, not a security control. See README.
 *
 * Previous version preserved at .archive/register.legacy.vue
 */
import { useAuthStore } from '~/stores/authStore'
import { useSocialAuth } from '~/composables/useSocialAuth'

definePageMeta({ layout: false })

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const social = useSocialAuth()

const PASSWORD_MIN = 8

const name = ref('')
const email = ref('')
const password = ref('')
const referralCode = ref('')
const showReferral = ref(false)
/** True when the code arrived via a referral link rather than being typed. */
const referredByLink = ref(false)

const errors = ref<{ name?: string; email?: string; password?: string }>({})
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

function validate() {
  const next: { name?: string; email?: string; password?: string } = {}
  if (!name.value.trim()) next.name = 'We need a name to put on your invoices.'
  if (!email.value.trim()) next.email = 'Enter an email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
    next.email = 'That does not look like an email address.'
  if (!password.value) next.password = 'Choose a password.'
  else if (password.value.length < PASSWORD_MIN)
    next.password = `Use at least ${PASSWORD_MIN} characters.`
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
    /* New accounts have onboardingCompleted false, so go straight there rather
       than to /dashboard and let the middleware bounce them. One hop fewer. */
    await router.push('/onboarding')
  } catch (err: any) {
    formError.value =
      err?.response?.data?.message ||
      authStore.error ||
      'Could not create your account. Please try again.'
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
    eyebrow="Free plan · no card"
    title="Send your first invoice"
    title-accent="free."
    lead="Three fields and you are in. Connect a payment gateway later, when you actually need one."
    meta-title="Create your free account — InvoKita"
    panel-title="You will not be asked for a card."
    :panel-points="[
      'The free plan covers 5 invoices and 5 email deliveries a month.',
      'Automatic chasing is on the paid plans — nothing starts sending on its own.',
      'Cancel or downgrade yourself, from your dashboard, any time.',
    ]">
    <form class="form" novalidate @submit.prevent="handleRegister">
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
        id="name"
        v-model="name"
        label="Your name or business name"
        type="text"
        autocomplete="name"
        placeholder="Aina Rahman"
        hint="This is what your clients see at the top of an invoice."
        :error="errors.name"
        required />

      <AuthField
        id="email"
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        inputmode="email"
        placeholder="you@yourbusiness.com"
        :error="errors.email"
        required />

      <AuthField
        id="password"
        v-model="password"
        label="Password"
        type="password"
        autocomplete="new-password"
        :hint="`At least ${PASSWORD_MIN} characters.`"
        :error="errors.password"
        required />

      <!-- Referral: confirmed when it came from a link, otherwise tucked away
           so it is not a fourth field for everyone who has no code. -->
      <div v-if="referredByLink" class="referral-chip">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3.4 8.4 6.4 11.4 12.6 4.6"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Referral code <strong class="k-num">{{ referralCode }}</strong> applied</span>
      </div>

      <template v-else>
        <button
          v-if="!showReferral"
          type="button"
          class="referral-toggle"
          @click="showReferral = true">
          Have a referral code?
        </button>
        <AuthField
          v-else
          id="referralCode"
          v-model="referralCode"
          label="Referral code"
          optional-label="optional"
          type="text"
          autocomplete="off"
          placeholder="e.g. 4F9A2C1B" />
      </template>

      <button type="submit" class="k-btn k-btn--primary submit" :disabled="submitting">
        {{ submitting ? 'Creating your account…' : 'Create my free account' }}
      </button>

      <p class="terms">
        By creating an account you agree to our
        <a href="/legal/terms">Terms of Service</a> and
        <a href="/legal/privacy">Privacy Policy</a>.
      </p>
    </form>

    <template #alt>
      Already have an account?
      <a href="/login" class="k-link">Sign in</a>
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

.terms {
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--text-tertiary);
  text-align: center;
}
.terms a {
  color: var(--text-accent);
  text-decoration: none;
}
.terms a:hover {
  text-decoration: underline;
}

.referral-toggle {
  justify-self: start;
  padding: var(--space-1) 0;
  border: 0;
  background: none;
  color: var(--text-accent);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.referral-chip {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-md);
  background-color: var(--surface-accent-soft);
  color: var(--text-accent);
  font-size: var(--text-sm);
}
.referral-chip svg {
  width: 16px;
  height: 16px;
  flex: none;
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
