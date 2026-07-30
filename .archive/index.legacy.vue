<template>
  <div class="root">
    <!-- ══════════════════ NAV ══════════════════ -->
    <!-- Scroll progress bar -->
    <div class="scroll-progress" :style="{ transform: `scaleX(${scrollProgress})` }" aria-hidden="true"></div>

    <nav class="nav" :class="{ 'nav--scrolled': isScrolled }">
      <div class="nav__inner">
        <UiLogo
          size="md"
          @click="scrollToSection('hero')"
          class="cursor-pointer" />

        <div class="nav__links">
          <button
            v-for="link in navLinks"
            :key="link.id"
            @click="scrollToSection(link.id)"
            class="nav__link">
            {{ link.name }}
          </button>
        </div>

        <div class="nav__actions">
          <NuxtLink to="/register" class="nav__signin">Register </NuxtLink>
          <NuxtLink to="/dashboard" class="btn btn--dark">Enter App</NuxtLink>
          <button
            @click="isMobileMenuOpen = true"
            class="nav__hamburger lg:hidden"
            aria-label="Open menu">
            <span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile drawer -->
    <Transition name="menu-fade">
      <div
        v-if="isMobileMenuOpen"
        class="drawer-overlay"
        @click="isMobileMenuOpen = false">
        <Transition name="menu-slide">
          <div class="drawer" @click.stop>
            <div class="drawer__head">
              <UiLogo size="md" />
              <button
                @click="isMobileMenuOpen = false"
                class="drawer__close"
                aria-label="Close">
                ✕
              </button>
            </div>
            <nav class="drawer__nav">
              <button
                v-for="link in navLinks"
                :key="link.id"
                @click="scrollToSection(link.id)"
                class="drawer__link">
                {{ link.name }}
              </button>
            </nav>
            <div class="drawer__footer">
              <NuxtLink to="/login" class="drawer__link">Sign in</NuxtLink>
              <NuxtLink to="/register" class="btn btn--dark w-full text-center"
                >Get Started Free</NuxtLink
              >
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══════════════════ HERO ══════════════════ -->
    <section id="hero" class="hero" aria-labelledby="hero-heading">
      <!-- Thin drifting lines (the only decoration) -->
      <div class="lines" aria-hidden="true" ref="heroLinesRef">
        <svg
          class="lines__svg"
          viewBox="0 0 1200 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice">
          <path
            class="line line--1"
            d="M-100 350 Q300 100 600 350 Q900 600 1300 350"
            stroke-width="1.5"
            fill="none" />
          <path
            class="line line--2"
            d="M-100 420 Q250 200 600 420 Q950 640 1300 420"
            stroke-width="1"
            fill="none" />
          <path
            class="line line--3"
            d="M100 600 Q400 200 700 500 Q900 700 1300 300"
            stroke-width="1"
            fill="none" />
          <circle class="dot dot--1" r="3" fill="currentColor" />
          <circle class="dot dot--2" r="2" fill="currentColor" />
          <circle class="dot dot--3" r="2.5" fill="currentColor" />
        </svg>
      </div>

      <div class="hero__body" ref="heroBodyRef">
        <div class="hero__eyebrow ri" style="--d: 0">
          <span class="hero__tag">For Malaysian businesses</span>
        </div>

        <h1 id="hero-heading" class="hero__h1 ri" style="--d: 1">
          Billing that<br />
          <em class="hero__em">gets out of your way.</em>
        </h1>

        <p class="hero__sub ri" style="--d: 2">
          InvoKita is an AI-powered invoicing platform built for Malaysian
          freelancers and businesses. Create, send, and get paid. Simple as that
        </p>

        <div class="hero__cta ri" style="--d: 3">
          <NuxtLink to="/register" class="btn btn--dark btn--lg"
            >Start for free</NuxtLink
          >
          <NuxtLink to="/login" class="btn btn--ghost btn--lg"
            >Sign in</NuxtLink
          >
        </div>

        <p class="hero__note ri" style="--d: 4">
          No credit card required &middot; Free plan available
        </p>
      </div>

      <!-- Stat strip -->
      <div class="hero__stats ri" style="--d: 5" ref="statsRef">
        <div class="stat" v-for="s in stats" :key="s.label">
          <span class="stat__val">{{ s.label === 'Active businesses' ? animatedStats.businesses : s.label === 'Invoiced via platform' ? animatedStats.invoiced : s.label === 'Avg. invoice creation' ? animatedStats.speed : animatedStats.uptime }}</span>
          <span class="stat__label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <!-- ══════════════════ MARQUEE ══════════════════ -->
    <div class="marquee-wrap" aria-hidden="true">
      <div class="marquee">
        <span v-for="n in 3" :key="n" class="marquee__track">
          <span
            v-for="item in marqueeItems"
            :key="item"
            class="marquee__item"
            >{{ item }}</span
          >
        </span>
      </div>
    </div>

    <!-- ══════════════════ HOW IT WORKS ══════════════════ -->
    <section id="how-it-works" class="section" aria-labelledby="hiw-heading">
      <div class="wrap">
        <header class="section__head ri">
          <span class="eyebrow">Process</span>
          <h2 id="hiw-heading" class="h2">Three steps.<br />Zero friction.</h2>
        </header>

        <div class="steps">
          <div
            class="step ri ri--scale"
            v-for="(step, i) in steps"
            :key="step.title"
            :style="{ '--d': i * 0.8 + 1 }">
            <div class="step__n">{{ String(i + 1).padStart(2, "0") }}</div>
            <div class="step__divider"></div>
            <h3 class="step__title">{{ step.title }}</h3>
            <p class="step__body">{{ step.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ FEATURES ══════════════════ -->
    <section
      id="features"
      class="section section--dark"
      aria-labelledby="feat-heading">
      <div class="wrap">
        <header class="section__head ri">
          <span class="eyebrow eyebrow--light">Capabilities</span>
          <h2 id="feat-heading" class="h2 h2--light">
            Everything you need.<br />Nothing you don't.
          </h2>
        </header>

        <div class="feat-grid">
          <article
            v-for="(f, i) in features"
            :key="f.title"
            class="feat-card ri"
            :style="{ '--d': i * 0.5 + 1 }">
            <div class="feat-card__icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :d="f.icon" />
              </svg>
            </div>
            <h3 class="feat-card__title">{{ f.title }}</h3>
            <p class="feat-card__body">{{ f.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ══════════════════ AUTOMATION ══════════════════ -->
    <section class="section" aria-labelledby="auto-heading">
      <div class="wrap">
        <div class="split">
          <div class="split__copy ri ri--left">
            <span class="eyebrow">Automation</span>
            <h2 id="auto-heading" class="h2">
              Payment detection,<br /><span class="accent">on autopilot.</span>
            </h2>
            <p class="body-text">
              We've built direct integrations with Billplz and ToyyibPay. The
              moment your client pays, InvoKita marks the invoice as Paid and
              silences all pending reminders — automatically.
            </p>
            <ul class="check-list">
              <li v-for="item in autoPoints" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div class="split__visual ri ri--right" style="--d: 2">
            <div class="flow-panel">
              <div
                class="flow-step"
                v-for="(step, i) in flowSteps"
                :key="step.label">
                <div
                  class="flow-step__icon"
                  :class="`flow-step__icon--${step.color}`">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="w-4 h-4">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :d="step.icon" />
                  </svg>
                </div>
                <div class="flow-step__text">
                  <span class="flow-step__label">{{ step.label }}</span>
                  <span class="flow-step__sub">{{ step.sub }}</span>
                </div>
                <span
                  class="flow-step__badge"
                  :class="`flow-step__badge--${step.color}`"
                  >{{ step.tag }}</span
                >
                <div
                  v-if="i < flowSteps.length - 1"
                  class="flow-step__connector"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ LOCAL ══════════════════ -->
    <section class="section section--tinted" aria-labelledby="local-heading">
      <div class="wrap">
        <div class="split split--flip">
          <div class="split__copy ri ri--right">
            <span class="eyebrow">Built for Malaysia</span>
            <h2 id="local-heading" class="h2">
              Local payment gateways,<br /><span class="accent"
                >natively integrated.</span
              >
            </h2>
            <p class="body-text">
              Invoicing should feel local, not foreign. InvoKita supports MYR
              natively, SST configuration, and deep integrations with the
              gateways Malaysians trust.
            </p>
          </div>

          <div class="gw-grid ri ri--left" style="--d: 2">
            <div class="gw-card" v-for="gw in gateways" :key="gw.name">
              <img
                :src="gw.logo"
                :alt="gw.name"
                class="gw-card__logo"
                loading="lazy" />
              <span class="gw-card__name">{{ gw.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ AI DEMO ══════════════════ -->
    <section class="section" aria-labelledby="ai-heading">
      <div class="wrap">
        <header class="section__head ri">
          <span class="eyebrow">AI Builder</span>
          <h2 id="ai-heading" class="h2">Describe it.<br />Invoice sent.</h2>
          <p class="h2__sub">
            Type a sentence. Get a complete, ready-to-send invoice in seconds.
          </p>
        </header>

        <div class="demo-win ri" style="--d: 2">
          <!-- Tabs -->
          <div class="demo-tabs">
            <button
              class="demo-tab"
              :class="previewTab === 'manual' ? 'demo-tab--active' : ''"
              @click="previewTab = 'manual'">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                style="width: 14px; height: 14px">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Manual Entry
            </button>
            <button
              class="demo-tab"
              :class="previewTab === 'ai' ? 'demo-tab--ai' : ''"
              @click="previewTab = 'ai'">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                style="width: 14px; height: 14px">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Builder Chat
            </button>
          </div>

          <!-- ── MANUAL ENTRY ── -->
          <div v-show="previewTab === 'manual'" class="demo-panel">
            <p class="demo-section-title">Invoice Details</p>

            <div class="df-group">
              <label class="df-label"
                >People <span class="df-required">*</span></label
              >
              <div class="df-client-box">
                <div class="df-avatar">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    style="width: 16px; height: 16px; color: #9ca3af">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div style="flex: 1">
                  <div class="df-client-name">Select Client</div>
                  <div class="df-client-sub">No email set</div>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  style="width: 14px; height: 14px; color: #9ca3af">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <button class="df-add-link">+ Add New Client Details</button>
            </div>

            <div class="df-group">
              <label class="df-label">Invoice Name</label>
              <div class="df-field">Website Overhaul</div>
            </div>

            <div class="df-group">
              <label class="df-label">Subject</label>
              <div class="df-field">Service per June 2023</div>
            </div>

            <div class="df-row">
              <div class="df-group" style="flex: 1">
                <label class="df-label df-label--sm">Due Date</label>
                <div class="df-field df-field--row">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    style="
                      width: 12px;
                      height: 12px;
                      color: #9ca3af;
                      flex-shrink: 0;
                    ">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  6 May 2026
                </div>
              </div>
              <div class="df-group" style="flex: 1">
                <label class="df-label df-label--sm">Currency</label>
                <div class="df-field df-field--row">
                  MYR (RM)
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    style="
                      width: 12px;
                      height: 12px;
                      color: #9ca3af;
                      margin-left: auto;
                    ">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="df-group">
              <label class="df-label df-label--sm">Status</label>
              <div class="df-field df-field--row">
                Pending
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  style="
                    width: 12px;
                    height: 12px;
                    color: #9ca3af;
                    margin-left: auto;
                  ">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div class="df-group">
              <label class="df-label">Invoice Theme</label>
              <div class="df-themes">
                <div class="df-theme df-theme--active">
                  <div class="df-theme-mock">
                    <div
                      style="
                        height: 6px;
                        background: #e5e7eb;
                        border-radius: 2px;
                        margin-bottom: 4px;
                      "></div>
                    <div
                      style="
                        height: 4px;
                        background: #f3f4f6;
                        border-radius: 2px;
                        width: 60%;
                      "></div>
                  </div>
                </div>
                <div class="df-theme">
                  <div class="df-theme-mock df-theme-mock--dark">
                    <div
                      style="
                        width: 28px;
                        background: #1a1d23;
                        height: 100%;
                        border-radius: 4px 0 0 4px;
                      "></div>
                    <div style="flex: 1; padding: 6px 4px">
                      <div
                        style="
                          height: 4px;
                          background: #e5e7eb;
                          border-radius: 2px;
                          margin-bottom: 3px;
                        "></div>
                      <div
                        style="
                          height: 3px;
                          background: #f3f4f6;
                          border-radius: 2px;
                          width: 50%;
                        "></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="demo-footer">
              <span class="demo-footer__saved"
                >Last saved: Today at 4:30 PM</span
              >
              <div class="demo-footer__btns">
                <button class="demo-cancel">Cancel</button>
                <button class="demo-process">Process Invoice</button>
              </div>
            </div>
          </div>

          <!-- ── AI CHAT ── -->
          <div v-show="previewTab === 'ai'" class="demo-panel demo-panel--chat">
            <div class="dc-msgs">
              <div class="dc-msg dc-msg--bot">
                <div class="dc-avatar">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    style="width: 14px; height: 14px">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="dc-bubble dc-bubble--bot">
                  Hi! I can help you draft this invoice instantly. Try
                  typing:<br />
                  <em class="dc-example"
                    >"create invoice for Wayne, software RM1200"</em
                  ><br />
                  <em class="dc-example"
                    >"due on 15 Nov, currency USD, subject: Web Design"</em
                  >
                </div>
              </div>

              <div class="dc-msg dc-msg--user">
                <div class="dc-bubble dc-bubble--user">
                  create invoice for Wayne, software RM1200
                </div>
              </div>

              <div class="dc-msg dc-msg--bot">
                <div class="dc-avatar">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    style="width: 14px; height: 14px">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="dc-bubble dc-bubble--bot">
                  Draft updated! I've applied those changes to the invoice based
                  on your instructions.
                </div>
              </div>
            </div>

            <div class="dc-input-row">
              <div class="dc-input">Message AI Builder...</div>
              <button class="dc-send">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  style="width: 14px; height: 14px">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            <div class="demo-footer">
              <span class="demo-footer__saved"
                >Last saved: Today at 4:30 PM</span
              >
              <div class="demo-footer__btns">
                <button class="demo-cancel">Cancel</button>
                <button class="demo-process">Process Invoice</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ SECURITY ══════════════════ -->
    <section class="section section--dark" aria-labelledby="sec-heading">
      <div class="wrap">
        <header class="section__head ri">`n          <span class="eyebrow eyebrow--light">Trust & Security</span>
          <h2 id="sec-heading" class="h2 h2--light">
            Bank-grade security.<br />No compromises.
          </h2>
        </header>
        <div class="sec-grid">
          <div
            class="sec-item ri"
            v-for="(item, i) in secItems"
            :key="item.title"
            :style="{ '--d': i * 0.5 + 1 }">
            <div class="sec-item__num">
              {{ String(i + 1).padStart(2, "0") }}
            </div>
            <h3 class="sec-item__title">{{ item.title }}</h3>
            <p class="sec-item__body">{{ item.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ PRICING ══════════════════ -->
    <section id="pricing" class="section" aria-labelledby="price-heading">
      <div class="wrap">
        <header class="section__head ri">
          <span class="eyebrow">Pricing</span>
          <h2 id="price-heading" class="h2">
            Simple pricing.<br />Serious value.
          </h2>
          <p class="h2__sub">No hidden fees. Cancel anytime.</p>
        </header>

        <!-- Skeleton while loading -->
        <div v-if="dynamicPlans.length === 0" class="pricing-grid">
          <div v-for="n in 4" :key="n" class="plan plan--skeleton">
            <div class="skel skel--sm"></div>
            <div class="skel skel--lg" style="margin: 1rem 0"></div>
            <div class="skel skel--sm" style="width: 70%"></div>
            <div
              style="
                margin-top: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 0.625rem;
              ">
              <div class="skel skel--sm" v-for="i in 4" :key="i"></div>
            </div>
            <div
              class="skel skel--btn"
              style="margin-top: auto; padding-top: 2rem"></div>
          </div>
        </div>

        <div v-else class="pricing-grid">
          <div
            v-for="(plan, i) in dynamicPlans"
            :key="plan.id"
            class="plan ri"
            :style="{ '--d': i * 0.5 + 1 }"
            :class="{
              'plan--featured': plan.name.toUpperCase() === 'PRO',
              'plan--max': plan.name.toUpperCase() === 'MAX',
            }">
            <div class="plan__header">
              <span class="plan__name">{{ plan.name }}</span>
              <span v-if="plan.name.toUpperCase() === 'PRO'" class="plan__badge"
                >Popular</span
              >
            </div>
            <div class="plan__price">
              <span class="plan__amount"
                >{{ plan.currency }} {{ plan.price }}</span
              >
              <span v-if="plan.price > 0" class="plan__period"
                >/{{ plan.interval }}</span
              >
            </div>
            <p class="plan__desc">{{ plan.description }}</p>
            <ul class="plan__features">
              <li v-for="feat in plan.features" :key="feat">
                <span class="plan__check">✓</span> {{ feat }}
              </li>
            </ul>
            <NuxtLink
              :to="authStore.isAuthenticated ? '/dashboard' : '/register'"
              class="plan__cta"
              :class="{
                'plan__cta--featured': plan.name.toUpperCase() === 'PRO',
                'plan__cta--max': plan.name.toUpperCase() === 'MAX',
              }">
              {{
                plan.name.toUpperCase() === "FREE"
                  ? "Get started"
                  : plan.name.toUpperCase() === "STARTER"
                    ? "Get Starter"
                    : plan.name.toUpperCase() === "PRO"
                      ? "Go Pro"
                      : "Get Max"
              }}
            </NuxtLink>
          </div>
        </div>

        <p class="pricing-note ri" style="--d: 5">
          Need a custom plan?
          <a href="mailto:contact@invokita.my" class="link">Contact us</a>
        </p>
      </div>
    </section>

    <!-- ══════════════════ FAQ ══════════════════ -->
    <section
      id="faq"
      class="section section--tinted"
      aria-labelledby="faq-heading">
      <div class="wrap wrap--narrow">
        <header class="section__head ri">
          <span class="eyebrow">FAQ</span>
          <h2 id="faq-heading" class="h2">Questions answered.</h2>
        </header>

        <div class="faq-list">
          <details
            v-for="(item, i) in faqItems"
            :key="i"
            class="faq ri"
            :style="{ '--d': i * 0.3 + 1 }">
            <summary class="faq__q">{{ item.question }}</summary>
            <div class="faq__a">{{ item.answer }}</div>
          </details>
        </div>
      </div>
    </section>

    <!-- ══════════════════ CTA STRIPE ══════════════════ -->
    <section class="cta-stripe">
      <div class="wrap">
        <div class="cta-stripe__inner ri ri--scale">
          <h2 class="cta-stripe__h2">
            Start invoicing<br /><em>the right way.</em>
          </h2>
          <div class="cta-stripe__actions">
            <NuxtLink to="/register" class="btn btn--white btn--lg"
              >Get started free</NuxtLink
            >
            <NuxtLink to="/login" class="cta-stripe__secondary"
              >Already have an account →</NuxtLink
            >
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ FOOTER ══════════════════ -->
    <footer class="footer">
      <div class="wrap">
        <div class="footer__grid">
          <div class="footer__brand">
            <span class="footer__logo"
              >InvoKita<span class="footer__dot">.</span></span
            >
            <p class="footer__tagline">
              Invoicing made effortless for Malaysian businesses.
            </p>
          </div>

          <div>
            <p class="footer__col-title">Product</p>
            <ul class="footer__col">
              <li>
                <button
                  @click="scrollToSection('features')"
                  class="footer__link">
                  Features
                </button>
              </li>
              <li>
                <button
                  @click="scrollToSection('pricing')"
                  class="footer__link">
                  Pricing
                </button>
              </li>
              <li>
                <button
                  @click="scrollToSection('how-it-works')"
                  class="footer__link">
                  How it works
                </button>
              </li>
              <li>
                <button @click="scrollToSection('faq')" class="footer__link">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p class="footer__col-title">Legal</p>
            <ul class="footer__col">
              <li>
                <NuxtLink to="/legal/terms" class="footer__link"
                  >Terms of Service</NuxtLink
                >
              </li>
              <li>
                <NuxtLink to="/legal/privacy" class="footer__link"
                  >Privacy Policy</NuxtLink
                >
              </li>
              <li>
                <NuxtLink to="/legal/refund" class="footer__link"
                  >Refund Policy</NuxtLink
                >
              </li>
            </ul>
          </div>

          <div>
            <p class="footer__col-title">Company</p>
            <ul class="footer__col">
              <li>
                <a href="mailto:contact@invokita.my" class="footer__link"
                  >Contact</a
                >
              </li>
              <li>
                <a href="mailto:support@invokita.my" class="footer__link"
                  >Support</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="footer__bottom">
          <span>© 2026 InvoKita — BSYX LABS SDN BHD (202603086039)</span>
        </div>
      </div>
    </footer>

    <!-- Scroll-to-top -->
    <Transition name="fade">
      <button
        v-if="showToTop"
        @click="scrollToTop"
        class="to-top"
        aria-label="Back to top">
        ↑
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useAuthStore } from "~/stores/authStore";

// ── SCROLL PROGRESS & PARALLAX ───────────────────────────
const scrollProgress = ref(0);
const heroBodyRef = ref(null);
const heroLinesRef = ref(null);
const statsRef = ref(null);
const statsAnimated = ref(false);

const animatedStats = ref({
  businesses: '0',
  invoiced: 'RM 0',
  speed: '0s',
  uptime: '0%',
});

const animateCounter = (from, to, duration, formatter, key) => {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    animatedStats.value[key] = formatter(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
};

const triggerStatsAnimation = () => {
  if (statsAnimated.value) return;
  statsAnimated.value = true;
  animateCounter(0, 2000, 1800, (v) => v.toLocaleString() + '+', 'businesses');
  animateCounter(0, 12, 2000, (v) => `RM ${v}M+`, 'invoiced');
  setTimeout(() => { animatedStats.value.speed = '< 60s'; }, 800);
  setTimeout(() => { animatedStats.value.uptime = '99.9%'; }, 1000);
};

// ── SEO ──────────────────────────────────────────────────
useHead({
  title: "InvoKita — AI-Powered Invoicing for Malaysian Businesses",
  meta: [
    {
      name: "description",
      content:
        "Create, send, and track professional invoices in seconds. InvoKita is the AI-powered billing platform built for Malaysian freelancers and businesses — with Billplz, ToyyibPay & WhatsApp integration.",
    },
    {
      name: "keywords",
      content:
        "invoicing Malaysia, invoice software, billing platform, AI invoice, Billplz, ToyyibPay, WhatsApp invoice, freelance MYR",
    },
    { name: "author", content: "BSYX LABS SDN BHD" },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://invokita.my/" },
    {
      property: "og:title",
      content: "InvoKita — AI-Powered Invoicing for Malaysian Businesses",
    },
    {
      property: "og:description",
      content:
        "AI-powered billing for Malaysian businesses. Create invoices in seconds.",
    },
    { property: "og:site_name", content: "InvoKita" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "InvoKita — AI-Powered Invoicing" },
    {
      name: "twitter:description",
      content: "AI-powered billing for Malaysian freelancers and businesses.",
    },
    { name: "theme-color", content: "#f8f9fa" },
  ],
  link: [
    { rel: "canonical", href: "https://invokita.my/" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "InvoKita",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "MYR" },
        description: "AI-powered invoicing platform for Malaysian businesses.",
        url: "https://invokita.my",
        publisher: {
          "@type": "Organization",
          name: "BSYX LABS SDN BHD",
          url: "https://invokita.my",
        },
      }),
    },
  ],
});

// ── STATE ────────────────────────────────────────────────
const authStore = useAuthStore();
const previewTab = ref("ai");
const dynamicPlans = ref([]);
const isScrolled = ref(false);
const showToTop = ref(false);
const isMobileMenuOpen = ref(false);

// ── CONTENT ──────────────────────────────────────────────
const navLinks = [
  { name: "Features", id: "features" },
  { name: "How it works", id: "how-it-works" },
  { name: "Pricing", id: "pricing" },
  { name: "FAQ", id: "faq" },
];

const stats = [
  { val: "2,000+", label: "Active businesses" },
  { val: "RM 12M+", label: "Invoiced via platform" },
  { val: "< 60s", label: "Avg. invoice creation" },
  { val: "99.9%", label: "Uptime SLA" },
];

const marqueeItems = [
  "Billplz",
  "ToyyibPay",
  "HitPay",
  "SenangPay",
  "WhatsApp",
  "FPX",
  "Credit Card",
  "Auto-Reconciliation",
  "AI Invoice",
  "MYR",
  "SST",
  "PDF Export",
];

const steps = [
  {
    title: "Create",
    body: "Use our intuitive form builder or let the AI draft your invoice from a single sentence. Either way, you're done in under a minute.",
  },
  {
    title: "Send",
    body: "Dispatch a secure payment link via Email or WhatsApp. Automated reminders keep clients on track — without you lifting a finger.",
  },
  {
    title: "Get paid",
    body: "Accept payments through Billplz or ToyyibPay. The moment they pay, your invoice is reconciled and reminders are silenced. Automatically.",
  },
];

const features = [
  {
    title: "Smart Invoicing",
    body: "Create professional invoices with smart autofill, line-item discounts, SST/tax support, and one-click duplication.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "AI Invoice Builder",
    body: "Just describe what you need. The AI drafts a complete invoice — client, items, amounts — ready in seconds.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "WhatsApp Delivery",
    body: "Send a beautiful payment link directly via WhatsApp. No PDF attachments, no inbox clutter. Just a tap to pay.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    title: "Client CRM",
    body: "Centralize your client base. Store contact details, billing preferences, and track lifetime revenue per client.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    title: "Financial Dashboard",
    body: "Bird's eye view of your business health. Revenue graphs, outstanding balances, and AI-powered suggestions.",
    icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z",
  },
  {
    title: "Auto-Reminders",
    body: "Schedule payment reminders that go out automatically. And stop automatically the moment your client pays.",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
];

const autoPoints = [
  "Billplz & ToyyibPay webhook integration",
  "Instant invoice reconciliation on payment",
  "Auto-silence all pending reminders",
  "Zero manual intervention required",
];

const flowSteps = [
  {
    label: "Webhook received",
    sub: "Billplz / ToyyibPay fires instantly",
    tag: "Active",
    color: "indigo",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    label: "Invoice reconciled",
    sub: "Matched and marked as Paid",
    tag: "Done",
    color: "green",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Reminders silenced",
    sub: "All future chasers cancelled",
    tag: "Stopped",
    color: "amber",
    icon: "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const gateways = [
  {
    name: "Billplz",
    logo: "https://make-cxp-documentation.ams3.digitaloceanspaces.com/apps-center-icons/billplz.png",
  },
  {
    name: "ToyyibPay",
    logo: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/e2hhr8kgl2hq5bkkqueq?ik-sanitizeSvg=true",
  },
  {
    name: "HitPay",
    logo: "https://avatars.githubusercontent.com/u/67738149?s=280&v=4",
  },
  {
    name: "SenangPay",
    logo: "https://media.glassdoor.com/sqll/5772920/senangpay-squareLogo-1701835868144.png",
  },
];

const secItems = [
  {
    title: "AES-256 Encryption",
    body: "Every byte encrypted at rest and in transit. Same standard as international banks.",
  },
  {
    title: "Absolute Data Isolation",
    body: "Multi-layer authorization ensures your business data is never accessible by anyone but you.",
  },
  {
    title: "Daily Automated Backups",
    body: "Database snapshots every 24 hours. Your business continuity is never at risk.",
  },
  {
    title: "Secure Public Links",
    body: "Invoice payment links are tokenized, expirable, and tied to a single transaction.",
  },
];

const faqItems = [
  {
    question: "Can I really draft an invoice using AI?",
    answer:
      "Yes. InvoKita includes an AI Builder that lets you describe your work in plain language. It instantly drafts a complete invoice with items, quantities, and totals ready for your review.",
  },
  {
    question: "How does automated payment detection work?",
    answer:
      "We integrate directly with Billplz and ToyyibPay. When your client pays, those gateways fire a webhook to InvoKita, which marks the invoice as Paid and cancels all pending reminders instantly.",
  },
  {
    question: "Do I need to manually send reminders?",
    answer:
      "Only if you want to. The Auto-Chaser sends scheduled WhatsApp and Email reminders. Once a payment is detected, all future reminders for that invoice are disabled automatically.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. We use AES-256 encryption and strict per-user data isolation. Your financial information is only accessible by you.",
  },
  {
    question: "Does it support MYR and SST?",
    answer:
      "InvoKita was built for Malaysia. It supports MYR natively, and you can configure SST or other tax rates globally in your settings.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. No long-term contracts. Upgrade, downgrade, or cancel any time from your dashboard.",
  },
];

// ── METHODS ──────────────────────────────────────────────
const scrollToSection = (id) => {
  isMobileMenuOpen.value = false;
  const el = document.getElementById(id);
  if (el)
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.pageYOffset - 80,
      behavior: "smooth",
    });
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
  showToTop.value = window.scrollY > 600;
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const fetchPlans = async () => {
  const { $api } = useNuxtApp();
  try {
    const { data } = await $api.get("/plans");
    dynamicPlans.value = data;
  } catch (e) {
    console.error("Plans fetch failed", e);
  }
};

let _observer = null;
let _statsObserver = null;

const initObserver = () => {
  if (_observer) {
    _observer.disconnect();
  }
  _observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("ri--in");
          _observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.06, rootMargin: "0px 0px -40px 0px" },
  );
  document
    .querySelectorAll(".ri:not(.ri--in)")
    .forEach((el) => _observer.observe(el));
};

const initStatsObserver = () => {
  if (!statsRef.value) return;
  _statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          triggerStatsAnimation();
          _statsObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 },
  );
  _statsObserver.observe(statsRef.value);
};

const handleScrollAnimations = () => {
  const winH = window.innerHeight;
  const docH = document.documentElement.scrollHeight - winH;
  scrollProgress.value = docH > 0 ? window.scrollY / docH : 0;

  // Parallax: hero decoration lines scroll slower than content (depth effect)
  if (heroLinesRef.value) {
    const offset = window.scrollY * 0.4;
    heroLinesRef.value.style.transform = `translateY(${offset}px)`;
  }
  // Subtle counter-parallax on hero text (moves up slightly slower)
  if (heroBodyRef.value && window.scrollY < winH) {
    const offset = window.scrollY * 0.15;
    heroBodyRef.value.style.transform = `translateY(${offset}px)`;
  }
};

onMounted(async () => {
  // Reveal items already in viewport immediately
  initObserver();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("scroll", handleScrollAnimations, { passive: true });
  initStatsObserver();

  await fetchPlans();
  await nextTick();
  // Re-scan for newly rendered pricing cards
  initObserver();

  // Safety net: keep re-scanning for 3s in case of render delays
  const intervals = [300, 600, 1200, 2400];
  intervals.forEach((ms) => setTimeout(initObserver, ms));
});

definePageMeta({ layout: false });
</script>

<style scoped>
/* ─────────────── TOKENS ─────────────── */
/* Using hardcoded values since CSS custom properties in scoped
   styles can have inconsistent behavior in Nuxt SSR */

/* ─────────────── RESET ─────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.root {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: #f8f9fa;
  color: #1a1d23;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─────────────── NAV ─────────────── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1.125rem 2rem;
  transition:
    background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    padding 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav--scrolled {
  background: rgba(248, 249, 250, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
  padding: 0.875rem 2rem;
}

.nav__inner {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.nav__links {
  display: none;
  align-items: center;
  gap: 1.75rem;
}
@media (min-width: 1024px) {
  .nav__links {
    display: flex;
  }
}

.nav__link {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
  letter-spacing: -0.01em;
}
.nav__link:hover {
  color: #1a1d23;
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav__signin {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s ease;
  display: none;
}
@media (min-width: 640px) {
  .nav__signin {
    display: inline;
  }
}
.nav__signin:hover {
  color: #1a1d23;
}

.nav__hamburger {
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
}
@media (min-width: 1024px) {
  .nav__hamburger {
    display: none;
  }
}
.nav__hamburger span {
  display: block;
  width: 16px;
  height: 1.5px;
  background: #1a1d23;
  border-radius: 2px;
}

/* ─────────────── BUTTONS ─────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  padding: 0.5625rem 1.125rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}
.btn--lg {
  font-size: 0.9375rem;
  padding: 0.75rem 1.625rem;
}

.btn--dark {
  background: #1a1d23;
  color: #fff;
}
.btn--dark:hover {
  background: #2d3748;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn--ghost {
  background: transparent;
  color: #1a1d23;
  border-color: rgba(0, 0, 0, 0.12);
}
.btn--ghost:hover {
  background: #fff;
  border-color: rgba(0, 0, 0, 0.2);
}

.btn--white {
  background: #fff;
  color: #1a1d23;
  border-color: transparent;
}
.btn--white:hover {
  background: #f0f2f5;
  transform: translateY(-1px);
}

/* ─────────────── DRAWER ─────────────── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 17, 23, 0.5);
  backdrop-filter: blur(4px);
}
.drawer {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: min(380px, 100%);
  background: #fff;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.drawer__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.drawer__close {
  background: none;
  border: none;
  font-size: 1.125rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  padding: 0.25rem;
}
.drawer__nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.drawer__link {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #1a1d23;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0.625rem 0;
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: color 0.15s ease;
}
.drawer__link:hover {
  color: #059669;
}
.drawer__footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

/* ─────────────── HERO ─────────────── */
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rem 1.5rem 4rem;
  text-align: center;
  overflow: hidden;
}

/* Thin drifting SVG lines */
.lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.lines__svg {
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

.line {
  stroke-dasharray: 8 12;
  animation: dash-drift 20s linear infinite;
}

.line--1 {
  stroke: #059669;
  animation-duration: 18s;
  opacity: 0.4;
}
.line--2 {
  stroke: #3b82f6;
  animation-duration: 24s;
  animation-delay: -8s;
  opacity: 0.3;
}
.line--3 {
  stroke: #f59e0b;
  animation-duration: 30s;
  animation-delay: -15s;
  opacity: 0.25;
}

.dot {
  opacity: 0.5;
  animation: dot-orbit 14s linear infinite;
}
.dot--1 {
  animation-duration: 18s;
  color: #059669;
  offset-path: path("M-100 350 Q300 100 600 350 Q900 600 1300 350");
}
.dot--2 {
  animation-duration: 24s;
  animation-delay: -8s;
  color: #3b82f6;
  offset-path: path("M-100 420 Q250 200 600 420 Q950 640 1300 420");
}
.dot--3 {
  animation-duration: 30s;
  animation-delay: -15s;
  color: #f59e0b;
  offset-path: path("M100 600 Q400 200 700 500 Q900 700 1300 300");
}

.hero__body {
  position: relative;
  z-index: 1;
  max-width: 760px;
  width: 100%;
}

.hero__eyebrow {
  margin-bottom: 1.75rem;
}

.hero__tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--accent);
  border: 1px solid var(--accent-light);
  background: var(--accent-light);
  padding: 0.3rem 0.875rem;
  border-radius: var(--radius-pill);
}

.hero__h1 {
  font-size: clamp(2.25rem, 5.5vw, 4rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.1;
  color: var(--text);
  margin-bottom: 1.5rem;
}

.hero__em {
  font-style: italic;
  font-weight: 300;
  color: var(--text-muted);
}

.hero__sub {
  font-size: 1.0625rem;
  font-weight: 400;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 540px;
  margin: 0 auto 2.5rem;
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.hero__note {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 400;
}

/* Stats strip */
.hero__stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  margin-top: 5rem;
  max-width: 600px;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--surface);
}

@media (min-width: 640px) {
  .hero__stats {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 1rem;
  border-right: 1px solid var(--border);
}
.stat:last-child {
  border-right: none;
}
.stat:nth-child(2) {
  border-right: 1px solid var(--border);
}

@media (max-width: 639px) {
  .stat:nth-child(2n) {
    border-right: none;
  }
  .stat:nth-child(1),
  .stat:nth-child(2) {
    border-bottom: 1px solid var(--border);
  }
}

.stat__val {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--text);
}
.stat__label {
  font-size: 0.6875rem;
  color: var(--text-muted);
  margin-top: 2px;
  font-weight: 400;
}

/* ─────────────── MARQUEE ─────────────── */
.marquee-wrap {
  overflow: hidden;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 0.875rem 0;
  background: var(--surface);
}

.marquee {
  display: flex;
  animation: marquee-scroll 30s linear infinite;
  width: max-content;
}

.marquee__track {
  display: flex;
  gap: 2.5rem;
  margin-right: 2.5rem;
}

.marquee__item {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.marquee__item::before {
  content: "·";
  margin-right: 2.5rem;
  color: var(--border);
}
.marquee__item:first-child::before {
  display: none;
}

/* ─────────────── LAYOUT ─────────────── */
.section {
  padding: 7rem 1.5rem;
}
.section--dark {
  background: #0f1117;
}
.section--tinted {
  background: #f0f2f5;
}

.wrap {
  max-width: 1120px;
  margin: 0 auto;
}
.wrap--narrow {
  max-width: 680px;
  margin: 0 auto;
}

.section__head {
  margin-bottom: 4rem;
}
.section__head.ri {
  text-align: center;
}

.eyebrow {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #059669;
  margin-bottom: 1rem;
}
.eyebrow--light {
  color: rgba(255, 255, 255, 0.45);
}

.h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.625rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #1a1d23;
}

.h2--light {
  color: #fff;
}

.h2__sub {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 400;
  color: #6b7280;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.accent {
  color: #059669;
}

.body-text {
  font-size: 1rem;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.75;
}

.split {
  display: grid;
  gap: 5rem;
  align-items: center;
}
@media (min-width: 1024px) {
  .split {
    grid-template-columns: 1fr 1fr;
  }
}

.split--flip .split__copy {
  order: 2;
}
.split--flip .split__visual {
  order: 1;
}
@media (min-width: 1024px) {
  .split--flip .split__copy {
    order: 2;
  }
  .split--flip .split__visual {
    order: 1;
  }
}

/* ─────────────── STEPS ─────────────── */
.steps {
  display: grid;
  gap: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 28px;
  overflow: hidden;
  background: #fff;
}

@media (min-width: 768px) {
  .steps {
    grid-template-columns: repeat(3, 1fr);
  }
}

.step {
  padding: 2.5rem 2rem;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  transition: background 0.2s ease;
}
.step:last-child {
  border-right: none;
}
.step:hover {
  background: #fafafa;
}

@media (max-width: 767px) {
  .step {
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  .step:last-child {
    border-bottom: none;
  }
}

.step__n {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #059669;
  margin-bottom: 1.25rem;
}

.step__divider {
  width: 24px;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin-bottom: 1.25rem;
}

.step__title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: #1a1d23;
  letter-spacing: -0.02em;
  margin-bottom: 0.75rem;
}

.step__body {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.7;
}

/* ─────────────── FEATURES GRID ─────────────── */
.feat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 28px;
  overflow: hidden;
}

@media (min-width: 640px) {
  .feat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .feat-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feat-card {
  background: #16191f;
  padding: 2rem;
  transition: background 0.2s ease;
}
.feat-card:hover {
  background: #1c1f27;
}

.feat-card__icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 1.25rem;
  color: #059669;
}

.feat-card__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.015em;
  margin-bottom: 0.5rem;
}

.feat-card__body {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.7;
}

/* ─────────────── AUTOMATION FLOW ─────────────── */
.check-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: 1.5rem;
}

.check-list li {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.check-list li::before {
  content: "✓";
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  flex-shrink: 0;
}

.flow-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  padding-bottom: 2rem;
}

.flow-step:last-child {
  padding-bottom: 0;
}

.flow-step__connector {
  position: absolute;
  left: 1.125rem;
  top: 2.5rem;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, var(--border), transparent);
}

.flow-step__icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.flow-step__icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
}
.flow-step__icon--green {
  background: #d1fae5;
  color: #059669;
}
.flow-step__icon--amber {
  background: #fef3c7;
  color: #d97706;
}

.flow-step__text {
  flex: 1;
}
.flow-step__label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text);
  letter-spacing: -0.01em;
}
.flow-step__sub {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.flow-step__badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-pill);
  flex-shrink: 0;
}
.flow-step__badge--indigo {
  background: #eef2ff;
  color: #4f46e5;
}
.flow-step__badge--green {
  background: #d1fae5;
  color: #065f46;
}
.flow-step__badge--amber {
  background: #fef3c7;
  color: #92400e;
}

/* ─────────────── GATEWAYS ─────────────── */
.gw-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.gw-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.gw-card:hover {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.gw-card__logo {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
  border-radius: 8px;
}
.gw-card__name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
}

/* ─────────────── TERMINAL ─────────────── */
.terminal {
  max-width: 680px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
  background: var(--surface);
}

.terminal__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.terminal__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.terminal__dot--red {
  background: #ef4444;
}
.terminal__dot--yellow {
  background: #f59e0b;
}
.terminal__dot--green {
  background: #22c55e;
}

.terminal__title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.terminal__tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  padding: 0 1.25rem;
  background: #fafafa;
}

.terminal__tab {
  padding: 0.75rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s ease;
  margin-bottom: -1px;
}
.terminal__tab--active {
  color: var(--text);
  border-bottom-color: var(--text);
}
.terminal__tab--active-green {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.terminal__panel {
  padding: 1.5rem;
  min-height: 300px;
}

/* Manual form mock */
.mock-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.mock-row {
  display: flex;
  gap: 0.75rem;
}
.mock-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
}
.mock-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-muted);
}
.mock-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fafafa;
  min-height: 2.5rem;
}
.mock-input--tall {
  align-items: flex-start;
  min-height: 5rem;
  padding-top: 0.75rem;
  flex-direction: column;
}
.mock-chip {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #e5e7eb;
  flex-shrink: 0;
}
.mock-text {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
}
.mock-btn-wrap {
  display: flex;
  align-items: flex-end;
}
.mock-send-btn {
  background: #1a1d23;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  cursor: default;
}

/* Chat mock */
.chat {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
}
.chat__msg {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.chat__msg--user {
  flex-direction: row-reverse;
}
.chat__avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #0f1117;
  color: #fff;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.chat__bubble {
  background: #f3f4f6;
  border-radius: 1rem;
  border-top-left-radius: 4px;
  padding: 0.625rem 0.875rem;
  font-size: 0.8125rem;
  color: #1a1d23;
  max-width: 80%;
  line-height: 1.5;
}
.chat__bubble--user {
  background: #1a1d23;
  color: #fff;
  border-radius: 1rem;
  border-top-right-radius: 4px;
}
.chat__draft {
  background: #fff;
  border: 1px solid #a7f3d0;
  border-radius: 0.875rem;
  border-top-left-radius: 4px;
  padding: 1rem;
  max-width: 90%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chat__draft-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.chat__draft-ready {
  font-size: 0.625rem;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.chat__draft-client {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1d23;
  letter-spacing: -0.01em;
}
.chat__draft-amount {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1d23;
  letter-spacing: -0.02em;
}
.chat__draft-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  background: #f9fafb;
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
}
.chat__draft-actions {
  display: flex;
  gap: 0.5rem;
}
.chat__draft-send {
  flex: 1;
  background: #1a1d23;
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.chat__draft-edit {
  background: #f3f4f6;
  color: #1a1d23;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.chat__input {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #9ca3af;
  background: #fafafa;
}
.chat__placeholder {
}
.chat__cursor {
  animation: cursor-blink 1s step-end infinite;
  color: #059669;
  font-weight: 600;
}

/* ─────────────── DEMO WINDOW ─────────────── */
.demo-win {
  max-width: 760px;
  margin: 0 auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.07);
}

/* Tabs row */
.demo-tabs {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 1.25rem;
  background: #fff;
}

.demo-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.875rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s ease;
  margin-bottom: -1px;
  font-family: "Inter", sans-serif;
}
.demo-tab:hover {
  color: #1a1d23;
}
.demo-tab--active {
  color: #1a1d23;
  border-bottom-color: #1a1d23;
}
.demo-tab--ai {
  color: #059669;
  border-bottom-color: #059669;
}

/* Panel */
.demo-panel {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.demo-panel--chat {
  padding: 0;
}

.demo-section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1d23;
  letter-spacing: -0.015em;
  margin-bottom: 1.25rem;
}

/* Form fields */
.df-group {
  margin-bottom: 1.125rem;
}
.df-row {
  display: flex;
  gap: 1rem;
}
.df-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}
.df-label--sm {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7280;
}
.df-required {
  color: #ef4444;
}

.df-client-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  cursor: default;
}
.df-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.df-client-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1a1d23;
}
.df-client-sub {
  font-size: 0.6875rem;
  color: #9ca3af;
}
.df-add-link {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  color: #059669;
  cursor: pointer;
  padding: 0;
  margin-top: 0.375rem;
  font-family: "Inter", sans-serif;
}

.df-field {
  display: flex;
  align-items: center;
  padding: 0.5625rem 0.875rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  font-size: 0.8125rem;
  color: #1a1d23;
  gap: 0.5rem;
}
.df-field--row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.df-themes {
  display: flex;
  gap: 0.75rem;
}
.df-theme {
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  padding: 2px;
}
.df-theme--active {
  border-color: #059669;
}
.df-theme-mock {
  width: 80px;
  height: 52px;
  background: #f9fafb;
  border-radius: 6px;
  padding: 8px;
}
.df-theme-mock--dark {
  display: flex;
  background: #f9fafb;
  width: 80px;
  height: 52px;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
}

/* Footer bar */
.demo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  background: #fafafa;
  margin-top: 1.25rem;
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  margin-bottom: -1.5rem;
}
.demo-panel--chat .demo-footer {
  margin: 0;
}
.demo-footer__saved {
  font-size: 0.75rem;
  color: #9ca3af;
}
.demo-footer__btns {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.demo-cancel {
  background: none;
  border: none;
  font-size: 0.8125rem;
  color: #6b7280;
  cursor: pointer;
  font-family: "Inter", sans-serif;
}
.demo-cancel:hover {
  color: #1a1d23;
}
.demo-process {
  background: #1a1d23;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: background 0.15s ease;
}
.demo-process:hover {
  background: #2d3748;
}

/* AI Chat */
.dc-msgs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0.5rem;
  min-height: 280px;
}

.dc-msg {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
}
.dc-msg--user {
  flex-direction: row-reverse;
}

.dc-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #059669;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dc-bubble {
  max-width: 75%;
  font-size: 0.8125rem;
  line-height: 1.6;
  padding: 0.75rem 0.875rem;
  border-radius: 1rem;
}

.dc-bubble--bot {
  background: #f3f4f6;
  color: #1a1d23;
  border-top-left-radius: 4px;
}

.dc-bubble--user {
  background: #059669;
  color: #fff;
  border-radius: 1rem;
  border-top-right-radius: 4px;
}

.dc-example {
  display: inline-block;
  font-style: italic;
  color: #059669;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
.dc-bubble--bot .dc-example {
  color: #059669;
}

.dc-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.dc-input {
  flex: 1;
  font-size: 0.8125rem;
  color: #9ca3af;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #f9fafb;
}

.dc-send {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #f3f4f6;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.dc-send:hover {
  background: #1a1d23;
  color: #fff;
  border-color: #1a1d23;
}

/* ─────────────── SECURITY ─────────────── */
.sec-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 28px;
  overflow: hidden;
}
@media (min-width: 640px) {
  .sec-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sec-item {
  background: #16191f;
  padding: 2.5rem 2rem;
  transition: background 0.2s ease;
}
.sec-item:hover {
  background: #1c1f27;
}

.sec-item__num {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.25);
  margin-bottom: 1.5rem;
}

.sec-item__title {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.015em;
  margin-bottom: 0.5rem;
}
.sec-item__body {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.65;
}

/* ─────────────── PRICING ─────────────── */
.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 768px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.plan {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.plan:hover {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}

.plan--featured {
  background: #1a1d23;
  border-color: #1a1d23;
}
.plan--featured:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.plan--max {
  background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
  border-color: rgba(99, 102, 241, 0.3);
}

.plan__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.plan__name {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a1d23;
}
.plan--featured .plan__name {
  color: rgba(255, 255, 255, 0.65);
}
.plan--max .plan__name {
  color: rgba(165, 180, 252, 0.7);
}

.plan__badge {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #059669;
  background: #d1fae5;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}

.plan__price {
  margin-bottom: 0.5rem;
}
.plan__amount {
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: #1a1d23;
}
.plan--featured .plan__amount {
  color: #ffffff;
}
.plan--max .plan__amount {
  color: #ffffff;
}
.plan__period {
  font-size: 0.8125rem;
  font-weight: 400;
  color: #6b7280;
}
.plan--featured .plan__period {
  color: rgba(255, 255, 255, 0.45);
}
.plan--max .plan__period {
  color: rgba(165, 180, 252, 0.6);
}

.plan__desc {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}
.plan--featured .plan__desc {
  color: rgba(255, 255, 255, 0.45);
}
.plan--max .plan__desc {
  color: rgba(165, 180, 252, 0.65);
}

.plan__features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.plan__features li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.5;
}
.plan--featured .plan__features li {
  color: rgba(255, 255, 255, 0.6);
}
.plan--max .plan__features li {
  color: rgba(165, 180, 252, 0.8);
}

.plan__check {
  color: #059669;
  font-weight: 600;
  flex-shrink: 0;
}
.plan--featured .plan__check {
  color: #6ee7b7;
}
.plan--max .plan__check {
  color: #818cf8;
}

.plan__cta {
  display: block;
  text-align: center;
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-decoration: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #1a1d23;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.plan__cta:hover {
  border-color: rgba(0, 0, 0, 0.2);
  background: #f9fafb;
}

.plan__cta--featured {
  background: #ffffff;
  color: #1a1d23;
  border-color: transparent;
}
.plan__cta--featured:hover {
  background: #f3f4f6;
}

.plan__cta--max {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border-color: rgba(99, 102, 241, 0.3);
}
.plan__cta--max:hover {
  background: rgba(99, 102, 241, 0.25);
}

.pricing-note {
  text-align: center;
  margin-top: 2.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.link {
  color: var(--accent);
  font-weight: 500;
}

/* ─────────────── FAQ ─────────────── */
.faq-list {
  display: flex;
  flex-direction: column;
}

.faq {
  border-bottom: 1px solid var(--border);
}
.faq:first-child {
  border-top: 1px solid var(--border);
}

.faq__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.375rem 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text);
  letter-spacing: -0.01em;
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.faq__q::-webkit-details-marker {
  display: none;
}
.faq__q::after {
  content: "+";
  font-size: 1.125rem;
  font-weight: 300;
  color: var(--text-muted);
  transition: transform 0.3s var(--ease);
  flex-shrink: 0;
  margin-left: 1rem;
}
details[open] .faq__q::after {
  transform: rotate(45deg);
  color: var(--accent);
}

.faq__a {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.75;
  padding-bottom: 1.5rem;
  max-width: 88%;
}

/* ─────────────── CTA STRIPE ─────────────── */
.cta-stripe {
  background: #0f1117;
  padding: 7rem 1.5rem;
}

.cta-stripe__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2.5rem;
}

@media (min-width: 768px) {
  .cta-stripe__inner {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.cta-stripe__h2 {
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #fff;
  max-width: 520px;
}

.cta-stripe__h2 em {
  font-style: italic;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
}

.cta-stripe__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  flex-shrink: 0;
}
@media (min-width: 640px) {
  .cta-stripe__actions {
    align-items: flex-end;
  }
}

.cta-stripe__secondary {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  transition: color 0.15s ease;
}
.cta-stripe__secondary:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* ─────────────── FOOTER ─────────────── */
.footer {
  background: #0f1117;
  padding: 4rem 1.5rem 2.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  margin-bottom: 3.5rem;
}
@media (min-width: 640px) {
  .footer__grid {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
}

.footer__logo {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #fff;
}
.footer__dot {
  color: #059669;
}
.footer__tagline {
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.6;
}

.footer__col-title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 1rem;
}

.footer__col {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer__link {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  transition: color 0.15s ease;
  text-align: left;
}
.footer__link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 2rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* ─────────────── SCROLL TOP ─────────────── */
.to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 90;
  width: 2.25rem;
  height: 2.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s var(--ease);
}
.to-top:hover {
  transform: translateY(-2px);
  color: var(--text);
}

/* ─────────────── SCROLL PROGRESS BAR ─────────────── */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #059669, #3b82f6);
  transform-origin: left;
  z-index: 9999;
  will-change: transform;
  pointer-events: none;
}

/* ─────────────── REVEAL ANIMATIONS ─────────────── */
.ri {
  opacity: 0;
  transform: translateY(22px);
  will-change: opacity, transform;
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--d, 0) * 0.08s);
}

.ri--in {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* Slide from left */
.ri--left {
  transform: translateX(-32px) translateY(0);
}
.ri--left.ri--in {
  transform: translateX(0) !important;
}

/* Slide from right */
.ri--right {
  transform: translateX(32px) translateY(0);
}
.ri--right.ri--in {
  transform: translateX(0) !important;
}

/* Scale up */
.ri--scale {
  transform: scale(0.96) translateY(12px);
}
.ri--scale.ri--in {
  transform: scale(1) translateY(0) !important;
}

/* Ensure dark-section items that fail to animate are still readable */
.section--dark .ri,
.cta-stripe .ri {
  opacity: 0;
}
.section--dark .ri--in,
.cta-stripe .ri--in {
  opacity: 1 !important;
}

/* Reduced motion — skip animation entirely */
@media (prefers-reduced-motion: reduce) {
  .ri, .ri--left, .ri--right, .ri--scale {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .scroll-progress {
    display: none;
  }
  [ref="heroBodyRef"] {
    transform: none !important;
  }
}

/* ─────────────── SKELETON ─────────────── */
.plan--skeleton {
  pointer-events: none;
  opacity: 1 !important;
  transform: none !important;
}

.skel {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skel--sm {
  height: 10px;
  width: 100%;
}
.skel--lg {
  height: 40px;
  width: 60%;
}
.skel--btn {
  height: 42px;
  width: 100%;
  border-radius: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ─────────────── TRANSITIONS ─────────────── */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.25s ease;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: transform 0.35s var(--ease);
}
.menu-slide-enter-from,
.menu-slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ─────────────── KEYFRAMES ─────────────── */
@keyframes dash-drift {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -200;
  }
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.333%);
  }
}

@keyframes cursor-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
