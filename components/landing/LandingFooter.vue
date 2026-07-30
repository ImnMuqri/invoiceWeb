<script setup lang="ts">
import type { Locale, LandingCopy } from '~/composables/useLandingCopy'
import { localePath } from '~/composables/useLandingCopy'

const props = defineProps<{ copy: LandingCopy; locale: Locale }>()

const year = new Date().getFullYear()
const otherLocale = computed<Locale>(() => (props.locale === 'ms' ? 'en' : 'ms'))
</script>

<template>
  <footer class="foot">
    <div class="k-container k-container--wide">
      <div class="foot__top">
        <div class="foot__brand">
          <p class="foot__mark">InvoKita<span class="foot__dot" aria-hidden="true">.</span></p>
          <p class="foot__tagline">{{ copy.footer.tagline }}</p>
          <a
            :href="localePath(otherLocale)"
            class="foot__lang"
            :hreflang="otherLocale === 'ms' ? 'ms-MY' : 'en-MY'">
            {{ copy.localeSwitchTo }}
          </a>
        </div>

        <nav class="foot__cols" aria-label="Footer">
          <div class="foot__col">
            <h2 class="foot__h">{{ copy.footer.product }}</h2>
            <ul>
              <li><a href="#how">{{ copy.footer.links.how }}</a></li>
              <li><a href="#payments">{{ copy.footer.links.payments }}</a></li>
              <li><a href="#pricing">{{ copy.footer.links.pricing }}</a></li>
              <li><a href="#faq">{{ copy.footer.links.faq }}</a></li>
            </ul>
          </div>
          <div class="foot__col">
            <h2 class="foot__h">{{ copy.footer.company }}</h2>
            <ul>
              <li><a href="/register">{{ copy.footer.links.register }}</a></li>
              <li><a href="/login">{{ copy.footer.links.signIn }}</a></li>
              <li><a href="mailto:support@invokita.my">{{ copy.footer.links.support }}</a></li>
            </ul>
          </div>
          <div class="foot__col">
            <h2 class="foot__h">{{ copy.footer.legal }}</h2>
            <ul>
              <li><a href="/legal/terms">{{ copy.footer.links.terms }}</a></li>
              <li><a href="/legal/privacy">{{ copy.footer.links.privacy }}</a></li>
              <li><a href="/legal/refund">{{ copy.footer.links.refund }}</a></li>
            </ul>
          </div>
        </nav>
      </div>

      <hr class="k-rule foot__rule" />

      <p class="foot__legal">
        © {{ year }} InvoKita — BSYX LABS SDN BHD (202603086039). {{ copy.footer.rights }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.foot {
  padding-block: var(--space-9) var(--space-8);
  background-color: var(--surface-page);
  border-top: 1px solid var(--border-default);
}

.foot__top {
  display: grid;
  gap: var(--space-8);
}

.foot__mark {
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
}
.foot__dot {
  color: var(--text-accent);
}
.foot__tagline {
  margin-top: var(--space-2);
  max-width: 22rem;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.foot__lang {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-accent);
  text-decoration: none;
  border-bottom: 1px solid var(--border-accent);
  padding-bottom: 2px;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.foot__lang:hover {
  border-bottom-color: currentColor;
}

.foot__cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-7) var(--space-5);
}
.foot__h {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}
.foot__col ul {
  display: grid;
  gap: var(--space-2);
}
.foot__col a {
  /* inline-flex + min-height gives each link a 24px hit area (WCAG 2.5.8)
     without changing the visual rhythm of the column */
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-out);
}
.foot__col a:hover {
  color: var(--text-accent);
}

.foot__rule {
  margin-block: var(--space-7) var(--space-5);
}
.foot__legal {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

@media (min-width: 768px) {
  .foot__cols {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .foot__top {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
    gap: var(--space-10);
  }
}
</style>
