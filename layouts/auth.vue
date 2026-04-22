<template>
  <div class="auth-root">
    <!-- ── LEFT: Brand panel ── -->
    <div class="brand-panel" aria-hidden="true">
      <!-- Thin SVG lines (same as hero) -->
      <svg
        class="brand-lines"
        viewBox="0 0 600 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice">
        <path
          class="bl bl--1"
          d="M-50 300 Q150 100 300 400 Q450 700 650 300"
          stroke-width="1.5"
          fill="none" />
        <path
          class="bl bl--2"
          d="M-50 450 Q100 250 300 500 Q500 750 650 450"
          stroke-width="1"
          fill="none" />
        <path
          class="bl bl--3"
          d="M100 700 Q250 300 400 600 Q500 800 650 400"
          stroke-width="1"
          fill="none" />
      </svg>

      <!-- Logo -->
      <NuxtLink to="/" class="brand-logo">
        <UiLogo size="md" theme="white" />
      </NuxtLink>

      <!-- Editorial copy -->
      <div class="brand-copy">
        <p class="brand-eyebrow">For Malaysian businesses</p>
        <h2 class="brand-headline">
          Invoicing that<br />
          <em class="brand-em">works while<br />you don't.</em>
        </h2>
        <p class="brand-sub">
          AI-powered billing with Billplz, ToyyibPay, and WhatsApp built right
          in.
        </p>
      </div>

      <!-- Stats -->
      <div class="brand-stats">
        <div class="brand-stat" v-for="s in stats" :key="s.label">
          <span class="brand-stat__val">{{ s.val }}</span>
          <span class="brand-stat__label">{{ s.label }}</span>
        </div>
      </div>

      <!-- Bottom back link -->
      <NuxtLink to="/" class="brand-back">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="brand-back__arrow">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to site
      </NuxtLink>
    </div>

    <!-- ── RIGHT: Form panel ── -->
    <div class="form-panel">
      <!-- Mobile: back + logo -->
      <div class="form-panel__mobile-nav">
        <NuxtLink to="/" class="mobile-back">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            style="width: 14px; height: 14px">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </NuxtLink>
        <NuxtLink to="/"><UiLogo size="sm" /></NuxtLink>
      </div>

      <div class="form-panel__inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const stats = [
  { val: "2,000+", label: "Active businesses" },
  { val: "RM 12M+", label: "Invoiced" },
  { val: "< 60s", label: "Per invoice" },
];
</script>

<style scoped>
/* ─── Root ─── */
.auth-root {
  display: flex;
  min-height: 100svh;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ─── Brand panel (left) ─── */
.brand-panel {
  position: relative;
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 50%;
  flex-shrink: 0;
  background: #0f1117;
  padding: 2.5rem;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .brand-panel {
    display: flex;
  }
}

/* Thin animated SVG lines */
.brand-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.45;
}

.bl {
  stroke-dasharray: 8 14;
  animation: line-drift 20s linear infinite;
}
.bl--1 {
  stroke: #059669;
  animation-duration: 18s;
}
.bl--2 {
  stroke: #3b82f6;
  animation-duration: 26s;
  animation-delay: -9s;
}
.bl--3 {
  stroke: #f59e0b;
  animation-duration: 34s;
  animation-delay: -17s;
  opacity: 0.6;
}

@keyframes line-drift {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -200;
  }
}

.brand-logo {
  position: relative;
  z-index: 1;
  text-decoration: none;
  display: inline-block;
  opacity: 0.9;
  transition: opacity 0.15s ease;
}
.brand-logo:hover {
  opacity: 1;
}

.brand-copy {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 0;
}

.brand-eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #059669;
  margin-bottom: 1.25rem;
}

.brand-headline {
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.1;
  color: #f8fafc;
  margin-bottom: 1.25rem;
}

.brand-em {
  font-style: italic;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.4);
}

.brand-sub {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.7;
  max-width: 280px;
}

/* Stats */
.brand-stats {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.brand-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.02);
}
.brand-stat:last-child {
  border-right: none;
}

.brand-stat__val {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: -0.025em;
}
.brand-stat__label {
  font-size: 0.6375rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 2px;
  text-align: center;
}

/* Back link */
.brand-back {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.3);
  text-decoration: none;
  transition: color 0.15s ease;
}
.brand-back:hover {
  color: rgba(255, 255, 255, 0.7);
}
.brand-back__arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.15s ease;
}
.brand-back:hover .brand-back__arrow {
  transform: translateX(-2px);
}

/* ─── Form panel (right) ─── */
.form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow-y: auto;
}

/* Mobile top bar */
.form-panel__mobile-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  background: #fff;
}
@media (min-width: 1024px) {
  .form-panel__mobile-nav {
    display: none;
  }
}

.mobile-back {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s ease;
}
.mobile-back:hover {
  color: #1a1d23;
}

/* Center the slot content */
.form-panel__inner {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}
</style>
