<script setup lang="ts">
/**
 * Forgot password — ask for a reset link.
 *
 * Two states: the email form, then "check your email". The second state is
 * shown whatever the API says about the address, because the API itself never
 * says whether an account exists (POST /auth/forgot-password is enumeration-
 * safe). Resend is throttled client-side to one per 30s; the server also
 * rate-limits per IP.
 */
import { useAuthStore } from '~/stores/authStore'
import { useAuthLocale } from '~/composables/useAuthCopy'

definePageMeta({ layout: false })

const authStore = useAuthStore()
const { t, locale } = useAuthLocale()
const c = computed(() => t.value.forgot)

const email = ref('')
const error = ref<'empty' | 'format' | null>(null)
const formError = ref('')
const submitting = ref(false)
const sent = ref(false)
const cooldown = ref(0)

const emailError = computed(() =>
  error.value === 'empty' ? c.value.errEmail : error.value === 'format' ? c.value.errEmailFormat : undefined
)

let timer: ReturnType<typeof setInterval> | undefined
function startCooldown() {
  if (timer) clearInterval(timer)
  cooldown.value = 30
  timer = setInterval(() => {
    cooldown.value = Math.max(0, cooldown.value - 1)
    if (cooldown.value === 0 && timer) clearInterval(timer)
  }, 1000)
}
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

async function send() {
  formError.value = ''
  const e = email.value.trim()
  if (!e) return (error.value = 'empty')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return (error.value = 'format')
  submitting.value = true
  try {
    await authStore.forgotPassword(e, locale.value)
    sent.value = true
    startCooldown()
  } catch (err: any) {
    /* 429 from the per-IP limit lands here too. */
    formError.value = err?.response?.data?.message || c.value.errGeneric
  } finally {
    submitting.value = false
  }
}

async function resend() {
  if (cooldown.value > 0) return
  await send()
}

function restart() {
  sent.value = false
  if (timer) clearInterval(timer)
  cooldown.value = 0
}

watch(email, () => {
  error.value = null
})
</script>

<template>
  <AuthShell
    :meta-title="c.meta"
    :eyebrow="sent ? undefined : c.eyebrow"
    :title="sent ? undefined : c.title"
    :title-accent="c.accent"
    :lead="c.lead">
    <template #top>
      <a href="/login" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 12H5" /><path d="M11 6l-6 6 6 6" />
        </svg>
        {{ c.back }}
      </a>
    </template>

    <template v-if="!sent">
      <form class="form" novalidate @submit.prevent="send">
        <p v-if="formError" class="alert" role="alert">{{ formError }}</p>
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
        <button type="submit" class="k-btn k-btn--primary submit" :disabled="submitting">
          {{ submitting ? c.submitting : c.submit }}
        </button>
      </form>
      <p class="help">{{ c.help }} <a href="mailto:support@invokita.my">support@invokita.my</a></p>
    </template>

    <Transition name="fade">
      <div v-if="sent" class="state" role="status">
        <span class="state__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
          </svg>
        </span>
        <h1 class="state__title">{{ c.sentTitle }}</h1>
        <p class="state__body">{{ c.sentA }} <strong>{{ email.trim() }}</strong>{{ c.sentB }}</p>
        <ul class="tips">
          <li><b>{{ c.tipsTitle }}</b></li>
          <li v-for="tip in c.tips" :key="tip">· {{ tip }}</li>
        </ul>
        <p v-if="formError" class="alert" role="alert">{{ formError }}</p>
        <div class="row">
          <button type="button" class="k-btn k-btn--secondary" :disabled="cooldown > 0 || submitting" @click="resend">
            {{ cooldown > 0 ? c.resendIn.replace('{s}', String(cooldown)) : c.resend }}
          </button>
          <button type="button" class="text-btn" @click="restart">{{ c.wrong }}</button>
        </div>
      </div>
    </Transition>

    <template #panel>
      <AuthPanel kind="mail" :t="t" />
    </template>
  </AuthShell>
</template>

<style scoped src="~/assets/css/auth-form.css"></style>
