<script setup lang="ts">
/**
 * Shared shell for the three legal documents.
 *
 * Design brief for a policy page is different from a landing page: nobody is
 * being persuaded, they are looking for one clause. So the priorities are
 * scannability and deep-linkability, not atmosphere. Hence a sticky numbered
 * table of contents, every section anchored with a copyable link, generous
 * measure, and no scroll animation to fight through.
 *
 * It reuses the landing nav and footer so the marketing surface feels like one
 * site, and the same design tokens so dark mode and AA contrast come for free.
 */
import type { LegalDoc } from '~/composables/useLegalContent'
import { LEGAL_SUPPORT_EMAIL } from '~/composables/useLegalContent'
import { useLandingCopy, SITE_URL } from '~/composables/useLandingCopy'
import { THEME_INIT_SCRIPT } from '~/composables/useTheme'
import { BRAND } from '~/composables/useBrandTokens'

const props = defineProps<{ doc: LegalDoc }>()

/* Legal pages are English-only and say so. A machine-translated policy that
   disagrees with the English one is a liability, not a feature. */
const copy = useLandingCopy('en')

const canonical = `${SITE_URL}/legal/${props.doc.slug}`
const activeId = ref<string>('')

const OTHER_DOCS = [
  { slug: 'terms', label: 'Terms of service' },
  { slug: 'privacy', label: 'Privacy policy' },
  { slug: 'refund', label: 'Refund policy' },
] as const

const others = computed(() => OTHER_DOCS.filter((d) => d.slug !== props.doc.slug))

/* Highlights the section you are currently reading in the contents list. */
let observer: IntersectionObserver | undefined
onMounted(() => {
  const headings = Array.from(document.querySelectorAll<HTMLElement>('[data-legal-section]'))
  if (!headings.length || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) activeId.value = (e.target as HTMLElement).id
      }
    },
    { rootMargin: '-88px 0px -70% 0px', threshold: 0 }
  )
  headings.forEach((h) => observer!.observe(h))
  activeId.value = headings[0].id
})
onBeforeUnmount(() => observer?.disconnect())

useHead({
  htmlAttrs: { lang: 'en-MY', class: 'kirim-scroll' },
  title: props.doc.metaTitle,
  link: [{ rel: 'canonical', href: canonical }],
  script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: 'head' }],
})

useSeoMeta({
  description: props.doc.metaDescription,
  ogType: 'article',
  ogSiteName: 'InvoKita',
  ogTitle: props.doc.metaTitle,
  ogDescription: props.doc.metaDescription,
  ogUrl: canonical,
  ogLocale: 'en_MY',
  ogImage: `${SITE_URL}/og/og-en.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: props.doc.metaTitle,
  twitterDescription: props.doc.metaDescription,
  themeColor: [
    { content: BRAND.paper, media: '(prefers-color-scheme: light)' },
    { content: BRAND.ink, media: '(prefers-color-scheme: dark)' },
  ],
})

/* Marks the document as a dated, revisable policy rather than an article. */
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: props.doc.metaTitle,
        description: props.doc.metaDescription,
        inLanguage: 'en-MY',
        dateModified: props.doc.updatedISO,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'InvoKita', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: props.doc.metaTitle, item: canonical },
          ],
        },
      }),
    },
  ],
})
</script>

<template>
  <div class="kirim legal">
    <a href="#main" class="k-skip">{{ copy.nav.skip }}</a>

    <!-- section-base="/" because the nav's links are landing-page sections;
         without it "#pricing" points at a section this page does not have. -->
    <LandingNav :copy="copy" locale="en" section-base="/" />

    <main id="main">
      <!-- ── Masthead ────────────────────────────────────────────────────── -->
      <header class="mast">
        <div class="k-container mast__inner">
          <nav class="crumbs" aria-label="Breadcrumb">
            <a href="/">InvoKita</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{{ doc.title }} {{ doc.titleAccent }}</span>
          </nav>

          <h1 class="k-display mast__title">
            {{ doc.title }}
            <span class="mast__accent"><KirimText :text="doc.titleAccent" /></span>
          </h1>

          <p class="mast__summary">{{ doc.summary }}</p>

          <dl class="meta">
            <div class="meta__item">
              <dt>Last updated</dt>
              <dd><time :datetime="doc.updatedISO">{{ doc.updated }}</time></dd>
            </div>
            <div class="meta__item">
              <dt>Applies to</dt>
              <dd>InvoKita and invokita.my</dd>
            </div>
            <div class="meta__item">
              <dt>Language</dt>
              <dd>English (governing version)</dd>
            </div>
          </dl>
        </div>
      </header>

      <!-- ── Body ────────────────────────────────────────────────────────── -->
      <div class="k-container doc">
        <!-- Contents -->
        <nav class="toc" aria-labelledby="toc-title">
          <div class="toc__sticky k-scroll">
            <h2 id="toc-title" class="toc__title">Contents</h2>
            <ol class="toc__list">
              <li v-for="(s, i) in doc.sections" :key="s.id">
                <a
                  :href="`#${s.id}`"
                  class="toc__link"
                  :class="{ 'toc__link--active': activeId === s.id }"
                  :aria-current="activeId === s.id ? 'true' : undefined">
                  <span class="toc__n k-num">{{ String(i + 1).padStart(2, '0') }}</span>
                  <span>{{ s.title }}</span>
                </a>
              </li>
            </ol>

            <div class="toc__other">
              <h2 class="toc__title">Also</h2>
              <ul>
                <li v-for="o in others" :key="o.slug">
                  <a :href="`/legal/${o.slug}`">{{ o.label }}</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Sections -->
        <article class="prose">
          <section
            v-for="(s, i) in doc.sections"
            :id="s.id"
            :key="s.id"
            data-legal-section
            class="sec"
            :aria-labelledby="`${s.id}-h`">
            <h2 :id="`${s.id}-h`" class="sec__h">
              <span class="sec__n k-num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
              {{ s.title }}
              <a :href="`#${s.id}`" class="sec__anchor" :aria-label="`Link to section: ${s.title}`">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M6.6 9.4a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.9.9M9.4 6.6a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l.9-.9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round" />
                </svg>
              </a>
            </h2>

            <template v-for="(b, bi) in s.blocks" :key="bi">
              <p v-if="b.type === 'p'" class="sec__p">{{ b.text }}</p>

              <ul v-else-if="b.type === 'ul'" class="sec__ul">
                <li v-for="(item, ii) in b.items" :key="ii">{{ item }}</li>
              </ul>

              <dl v-else-if="b.type === 'dl'" class="sec__dl">
                <div v-for="(item, ii) in b.items" :key="ii" class="sec__dl-row">
                  <dt>{{ item.term }}</dt>
                  <dd>{{ item.desc }}</dd>
                </div>
              </dl>

              <div v-else-if="b.type === 'table'" class="sec__table-wrap k-scroll">
                <table class="sec__table">
                  <thead>
                    <tr>
                      <th v-for="h in b.head" :key="h" scope="col">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, ri) in b.rows" :key="ri">
                      <th scope="row">{{ row[0] }}</th>
                      <td v-for="(cell, ci) in row.slice(1)" :key="ci">{{ cell }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-if="b.caption" class="sec__caption">{{ b.caption }}</p>
              </div>

              <aside v-else-if="b.type === 'note'" class="sec__note">
                <svg class="sec__note-ico" viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.4" />
                  <path d="M8 7.2v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  <circle cx="8" cy="4.9" r="0.9" fill="currentColor" />
                </svg>
                <p>{{ b.text }}</p>
              </aside>
            </template>
          </section>

          <!-- Contact -->
          <aside class="contact">
            <h2 class="contact__h">{{ doc.contactHeading }}</h2>
            <p class="contact__p">{{ doc.contactBody }}</p>
            <a :href="`mailto:${LEGAL_SUPPORT_EMAIL}`" class="k-btn k-btn--primary">
              Email {{ LEGAL_SUPPORT_EMAIL }}
            </a>
          </aside>
        </article>
      </div>
    </main>

    <LandingFooter :copy="copy" locale="en" />
  </div>
</template>

<style scoped>
/* ─── Masthead ────────────────────────────────────────────────────────────── */
.mast {
  position: relative;
  padding-block: clamp(2rem, 6vw, 4rem) clamp(2.5rem, 5vw, 3.5rem);
  background-color: var(--surface-sunken);
  border-bottom: 1px solid var(--border-default);
}
.mast__inner {
  max-width: 60rem;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-tertiary);
  margin-bottom: var(--space-5);
}
.crumbs a {
  color: var(--text-accent);
  text-decoration: none;
}
.crumbs a:hover {
  text-decoration: underline;
}

.mast__title {
  max-width: 20ch;
}
.mast__accent {
  color: var(--text-accent);
}

.mast__summary {
  max-width: var(--measure);
  margin-top: var(--space-5);
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-8);
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-default);
}
.meta__item dt {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 2px;
}
.meta__item dd {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

/* ─── Layout ──────────────────────────────────────────────────────────────── */
.doc {
  display: grid;
  gap: clamp(2.5rem, 5vw, 3.5rem);
  padding-block: clamp(2.5rem, 6vw, 4.5rem) clamp(3.5rem, 8vw, 6rem);
}

/* ─── Table of contents ───────────────────────────────────────────────────── */
.toc__title {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}
.toc__list {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.toc__link {
  display: grid;
  grid-template-columns: 1.75rem minmax(0, 1fr);
  gap: var(--space-2);
  align-items: baseline;
  padding: var(--space-2) var(--space-3);
  margin-left: calc(var(--space-3) * -1);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);
}
.toc__link:hover {
  color: var(--text-primary);
  background-color: var(--chip-hover-bg);
}
.toc__link--active {
  color: var(--text-accent);
  font-weight: var(--weight-semibold);
  background-color: var(--surface-accent-soft);
}
.toc__n {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  color: var(--text-tertiary);
}
.toc__link--active .toc__n {
  color: var(--text-accent);
}

.toc__other {
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-default);
}
.toc__other ul {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.toc__other a {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
}
.toc__other a:hover {
  color: var(--text-accent);
}

/* ─── Prose ───────────────────────────────────────────────────────────────── */
.prose {
  min-width: 0;
}

.sec {
  padding-top: var(--space-8);
  scroll-margin-top: 6rem; /* clears the sticky nav on anchor jumps */
}
.sec:first-child {
  padding-top: 0;
}
.sec + .sec {
  border-top: 1px solid var(--border-subtle);
}

.sec__h {
  position: relative;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-size: var(--text-title);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  margin-bottom: var(--space-5);
  text-wrap: balance;
}
.sec__n {
  font-size: var(--text-2xs);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-widest);
  color: var(--text-accent);
}
.sec__anchor {
  display: inline-grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.sec__anchor svg {
  width: 15px;
  height: 15px;
}
.sec__h:hover .sec__anchor,
.sec__anchor:focus-visible {
  opacity: 1;
}
.sec__anchor:hover {
  color: var(--text-accent);
}

.sec__p {
  max-width: var(--measure);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.sec__p + .sec__p {
  margin-top: var(--space-4);
}

.sec__ul {
  display: grid;
  gap: var(--space-3);
  max-width: var(--measure);
  margin-top: var(--space-4);
  padding: 0;
  list-style: none;
}
.sec__ul li {
  position: relative;
  padding-left: var(--space-5);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.sec__ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
}

.sec__dl {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-5);
  max-width: 46rem;
}
.sec__dl-row {
  padding: var(--space-5);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background-color: var(--surface-raised);
}
.sec__dl dt {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
.sec__dl dd {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

/* Tables scroll inside their own box; the page never scrolls sideways. */
.sec__table-wrap {
  margin-top: var(--space-5);
  max-width: 46rem;
}
.sec__table {
  width: 100%;
  min-width: 38rem;
  border-collapse: collapse;
  /* Fixed layout so the narrow middle column stops wrapping "Delivers
     WhatsApp messages" onto three lines while the first column sits empty. */
  table-layout: fixed;
  font-size: var(--text-sm);
}
.sec__table th:nth-child(1) { width: 30%; }
.sec__table th:nth-child(2) { width: 22%; }
.sec__table th:nth-child(3) { width: 48%; }
.sec__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background-color: var(--surface-raised);
}
.sec__table th,
.sec__table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--border-subtle);
  line-height: var(--leading-normal);
}
.sec__table thead th {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
  background-color: var(--surface-sunken);
  white-space: nowrap;
}
.sec__table tbody th {
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  white-space: nowrap;
}
.sec__table tbody td {
  color: var(--text-secondary);
}
.sec__table tbody tr:last-child th,
.sec__table tbody tr:last-child td {
  border-bottom: 0;
}
.sec__caption {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border-subtle);
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--text-tertiary);
}

.sec__note {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  max-width: 46rem;
  margin-top: var(--space-5);
  padding: var(--space-5);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-lg);
  background-color: var(--surface-accent-soft);
}
.sec__note-ico {
  width: 17px;
  height: 17px;
  flex: none;
  margin-top: 2px;
  color: var(--text-accent);
}
.sec__note p {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

/* ─── Contact ─────────────────────────────────────────────────────────────── */
.contact {
  margin-top: clamp(3rem, 6vw, 4.5rem);
  padding: clamp(1.75rem, 4vw, 2.5rem);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background-color: var(--surface-sunken);
  max-width: 46rem;
}
.contact__h {
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}
.contact__p {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  margin-bottom: var(--space-5);
  max-width: 34rem;
}

/* ─── Breakpoints ─────────────────────────────────────────────────────────── */
@media (min-width: 1024px) {
  .doc {
    grid-template-columns: 16rem minmax(0, 1fr);
    gap: clamp(3rem, 6vw, 5rem);
    align-items: start;
  }
  .toc {
    align-self: stretch;
    height: 100%;
  }
  /* Same trap as the landing page's phone rail: the sticky child must not be
     stretched to the container height, or it has nowhere to travel. */
  .toc__sticky {
    position: sticky;
    top: 6rem;
    max-height: calc(100vh - 8rem);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}

@media (min-width: 1280px) {
  .doc {
    grid-template-columns: 18rem minmax(0, 1fr);
  }
}
</style>
