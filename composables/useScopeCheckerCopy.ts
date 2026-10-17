/**
 * Copy for the public e-Invoice scope checker (spec 06), English and Bahasa
 * Malaysia.
 *
 * WHAT IS AND IS NOT IN THIS FILE
 *
 * Page chrome only: headings, form labels, buttons, the empty state. The
 * VERDICT — the answer, the next steps, the disclaimer — is rendered by the
 * API in both locales and arrives with the result. That split is deliberate:
 * anything whose wording depends on an LHDN threshold or date lives next to
 * the rules that produce it, so a rule change cannot leave a stale sentence
 * behind on a page nobody thought to edit. See Backend/src/utils/einvoiceCopy.js.
 *
 * The band labels below are TEMPLATES, not figures. The ringgit amounts are
 * interpolated from the rule set the API serves. Type a threshold in here and
 * you have quietly broken the one acceptance criterion this feature has.
 *
 * Written in both languages, not machine-translated, same as useLandingCopy.
 */

import type { Locale } from '~/composables/useLandingCopy'

const copy = {
  en: {
    htmlLang: 'en-MY',

    meta: {
      title: 'Do I need to issue e-Invoices? — LHDN e-Invoice checker',
      description:
        'Free check: find out whether LHDN’s e-Invoice mandate applies to your Malaysian business. Four questions, no signup, plain-English answer.',
    },

    crumb: 'e-Invoice checker',
    eyebrow: 'Free tool · no signup',
    title: 'Do you have to issue',
    titleAccent: 'e-Invoices?',
    lead: 'LHDN’s e-Invoice mandate has worked its way down through smaller businesses, and most freelancers and small studios still do not know where they stand. Four questions, and you will.',
    reviewedPrefix: 'Rules checked against LHDN on',

    form: {
      title: 'Four questions',
      note: 'Nothing is stored. We do not need your email to show you the answer.',

      turnover: {
        label: 'Annual turnover or revenue',
        help: 'A band is enough. This is the figure in your latest accounts or tax return.',
        placeholder: 'Choose a band',
        bands: {
          lessThan: 'Less than {max}',
          rangeFrom: '{min} to {max}',
          rangeAbove: 'More than {min}, up to {max}',
          above: 'More than {min}',
          unknown: 'I am not sure',
        },
      },

      startYear: {
        label: 'Year the business started operating',
        help: 'The year you started trading, not the year you registered, if they differ.',
        placeholder: 'e.g. 2021',
      },

      group: {
        label: 'Is it part of a larger group?',
        help: 'A subsidiary, associate or related company of another business.',
        yes: 'Yes',
        no: 'No',
      },

      businessType: {
        label: 'Business type',
        placeholder: 'Choose one',
        options: {
          SOLE_PROP: 'Sole proprietor or freelancer',
          SDN_BHD: 'Sdn Bhd',
          PARTNERSHIP: 'Partnership',
          OTHER: 'Something else',
        },
      },

      submit: 'Check my position',
      submitting: 'Checking…',
      again: 'Change an answer',
      error: 'Something went wrong on our side. Try again in a moment.',
      rulesError:
        'The checker could not load its rule set just now. Refresh the page, or check your position directly with LHDN.',
      incomplete: 'Answer all four to get a result.',
    },

    result: {
      label: 'Your result',
      yourAnswers: 'Based on',
      turnoverLabel: 'Turnover',
      startYearLabel: 'Started',
      groupLabel: 'In a group',
      typeLabel: 'Type',
      shareNote: 'Screenshot this, or send yourself a copy.',
    },

    email: {
      title: 'Want a copy?',
      body: 'We will email you this result and nothing else. No account, no list, no follow-up.',
      label: 'Your email',
      placeholder: 'you@example.com',
      submit: 'Email me this',
      sending: 'Sending…',
      sent: 'Sent. Check your inbox.',
      error: 'That did not send. Check the address and try again.',
      invalid: 'That does not look like an email address.',
    },

    position: {
      title: 'Where InvoKita stands on this',
      body: [
        'InvoKita sends invoices over WhatsApp and email and chases them until they are paid. It does not submit anything to MyInvois, and using it does not make your business e-Invoice compliant. We would rather say that plainly than let you find out later.',
        'Most of the people who use InvoKita are under the exemption threshold and have no submission to make. If you are above it, InvoKita still does its job — you handle the MyInvois side through the portal or a compliance provider, and we keep getting you paid.',
      ],
      faqLink: 'Read the full position in our FAQ',
      home: 'Back to InvoKita',
    },
  },

  ms: {
    htmlLang: 'ms-MY',

    meta: {
      title: 'Perlukah saya keluarkan e-Invois? — Penyemak e-Invois LHDN',
      description:
        'Semakan percuma: ketahui sama ada mandat e-Invois LHDN terpakai kepada perniagaan anda. Empat soalan, tanpa daftar, jawapan dalam bahasa mudah.',
    },

    crumb: 'Penyemak e-Invois',
    eyebrow: 'Alat percuma · tanpa daftar',
    title: 'Anda perlu keluarkan',
    titleAccent: 'e-Invois?',
    lead: 'Mandat e-Invois LHDN sudah turun ke perniagaan yang lebih kecil, dan kebanyakan pekerja bebas dan studio kecil masih tak tahu kedudukan mereka. Empat soalan, dan anda akan tahu.',
    reviewedPrefix: 'Peraturan disemak dengan LHDN pada',

    form: {
      title: 'Empat soalan',
      note: 'Tiada apa disimpan. Kami tak perlukan emel anda untuk tunjukkan jawapan.',

      turnover: {
        label: 'Jualan atau pendapatan tahunan',
        help: 'Julat sudah memadai. Ini angka dalam akaun atau borang cukai terkini anda.',
        placeholder: 'Pilih julat',
        bands: {
          lessThan: 'Kurang daripada {max}',
          rangeFrom: '{min} hingga {max}',
          rangeAbove: 'Melebihi {min}, sehingga {max}',
          above: 'Melebihi {min}',
          unknown: 'Saya tidak pasti',
        },
      },

      startYear: {
        label: 'Tahun perniagaan mula beroperasi',
        help: 'Tahun anda mula berniaga, bukan tahun anda daftar, kalau berbeza.',
        placeholder: 'cth. 2021',
      },

      group: {
        label: 'Ia sebahagian daripada kumpulan yang lebih besar?',
        help: 'Subsidiari, syarikat sekutu atau syarikat berkaitan dengan perniagaan lain.',
        yes: 'Ya',
        no: 'Tidak',
      },

      businessType: {
        label: 'Jenis perniagaan',
        placeholder: 'Pilih satu',
        options: {
          SOLE_PROP: 'Pemilik tunggal atau pekerja bebas',
          SDN_BHD: 'Sdn Bhd',
          PARTNERSHIP: 'Perkongsian',
          OTHER: 'Lain-lain',
        },
      },

      submit: 'Semak kedudukan saya',
      submitting: 'Menyemak…',
      again: 'Tukar jawapan',
      error: 'Ada masalah di pihak kami. Cuba lagi sekejap.',
      rulesError:
        'Penyemak tidak dapat memuatkan set peraturannya sekarang. Muat semula halaman, atau semak kedudukan anda terus dengan LHDN.',
      incomplete: 'Jawab keempat-empatnya untuk dapat keputusan.',
    },

    result: {
      label: 'Keputusan anda',
      yourAnswers: 'Berdasarkan',
      turnoverLabel: 'Jualan',
      startYearLabel: 'Mula',
      groupLabel: 'Dalam kumpulan',
      typeLabel: 'Jenis',
      shareNote: 'Ambil tangkap layar, atau hantar salinan kepada diri sendiri.',
    },

    email: {
      title: 'Nak satu salinan?',
      body: 'Kami akan emelkan keputusan ini sahaja. Tiada akaun, tiada senarai, tiada susulan.',
      label: 'Emel anda',
      placeholder: 'anda@contoh.com',
      submit: 'Emelkan kepada saya',
      sending: 'Menghantar…',
      sent: 'Dah hantar. Semak peti masuk anda.',
      error: 'Gagal dihantar. Semak alamat dan cuba lagi.',
      invalid: 'Itu tidak nampak macam alamat emel.',
    },

    position: {
      title: 'Kedudukan InvoKita dalam hal ini',
      body: [
        'InvoKita hantar invois melalui WhatsApp dan emel, dan susul sampai ia dibayar. Ia tidak menghantar apa-apa ke MyInvois, dan menggunakannya tidak menjadikan perniagaan anda patuh e-Invois. Kami lebih rela cakap terus terang daripada biar anda tahu kemudian.',
        'Kebanyakan pengguna InvoKita berada di bawah ambang pengecualian dan tiada penghantaran untuk dibuat. Kalau anda di atas ambang, InvoKita tetap buat kerjanya — anda uruskan bahagian MyInvois melalui portal atau penyedia pematuhan, dan kami teruskan kerja dapatkan bayaran anda.',
      ],
      faqLink: 'Baca kedudukan penuh dalam Soalan Lazim kami',
      home: 'Kembali ke InvoKita',
    },
  },
} as const

export type ScopeCopy = (typeof copy)['en']

export function useScopeCheckerCopy(locale: Locale = 'en') {
  return copy[locale] as unknown as ScopeCopy
}

/* The route itself is defined next to localePath, so the footer and FAQ can
   link to it without this file and that one importing each other in a cycle. */
export { scopeCheckerPath } from '~/composables/useLandingCopy'
