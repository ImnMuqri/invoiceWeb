/**
 * The quotations page (spec 07), English and Bahasa Malaysia.
 *
 * A DEDICATED page rather than more landing copy, because the search intent is
 * genuinely different: somebody typing "sebut harga" is not looking for an
 * invoice chaser and will bounce off a page whose headline is about chasing.
 * The landing hero stays about invoices — quoting is a supporting capability,
 * not a second headline — and this page is where the quotation search terms
 * land.
 *
 * ON THE MALAY TERMS. The BM copy uses "sebut harga" as the primary term
 * because that is what people actually say and type; "sebutharga" (one word)
 * and the borrowed "quotation"/"quote" are both used in practice and both
 * appear naturally in the body rather than being stuffed. The BM page also
 * lives on /ms/sebut-harga/ rather than a translated-in-name-only English
 * slug — see quotationPath in useLandingCopy.
 *
 * HONESTY RULE, inherited from useLandingCopy: no customer counts, no volume
 * figures, no testimonials. Every capability described here exists in the
 * codebase — the accept/decline page is Backend/src/routes/quote/index.js and
 * Frontend/pages/quote/[token].vue, conversion is POST /api/quotes/:id/convert.
 */

import type { Locale } from './useLandingCopy'

const copy = {
  en: {
    htmlLang: 'en-MY',
    crumb: 'Quotations',

    meta: {
      title: 'Free Quotation Maker for Malaysia — Quote, Get an Answer, Invoice',
      description:
        'Send a quotation your client can accept or decline in one tap, then turn the yes into an invoice without retyping. Built for Malaysian freelancers and small businesses. Free plan, no card.',
    },

    eyebrow: 'Quotations',
    title: 'Send a quotation.',
    titleAccent: 'Get an actual answer.',
    lead: 'Most quotations disappear. You send a PDF, the client means to reply, and three weeks later you are the one asking. InvoKita sends a quotation your client can accept or decline in one tap — and when they accept, it becomes an invoice without you retyping a thing.',
    ctaPrimary: 'Write your first quotation free',
    ctaSecondary: 'See how the chasing works',
    ctaNote: 'Free plan · no card needed',

    /* The one thing this page has to be unambiguous about, because it is the
       decision that makes the product trustworthy rather than pushy. */
    promise: {
      title: 'Quotations are never chased.',
      body: 'A client who has not replied to a quotation has not agreed to anything and owes nothing. Automated follow-up there is sales pressure, not collections — and it spends your reputation on somebody you have not won yet. InvoKita will never message your prospect about a quotation on a timer. The only automatic message about a quotation goes to you, when one expires unanswered, so you can decide whether to pick up the phone yourself.',
    },

    how: {
      eyebrow: 'How it works',
      title: 'Four steps, and two of them are theirs.',
      items: [
        {
          n: '01',
          title: 'Write it',
          body: 'Pick the client, add the lines, set how long the price holds. Your logo, your terms, your business name — the same document builder the invoices use.',
        },
        {
          n: '02',
          title: 'Send it on WhatsApp or email',
          body: 'They get a link, not an attachment. The page opens on a phone and shows exactly what you quoted, with your identifiers on it if you have entered them.',
        },
        {
          n: '03',
          title: 'They accept or decline',
          body: 'One tap, no account, no login. Accepting records their name and the date, so both of you have the same record of what was agreed. Declining lets them say why, if they want to.',
        },
        {
          n: '04',
          title: 'The yes becomes an invoice',
          body: 'One click carries the client, the lines, the amounts, the tax and the currency across. The invoice links back to the quotation and the quotation shows the invoice it became. From there it behaves like any other invoice — including the chasing.',
        },
      ],
    },

    features: {
      eyebrow: 'What you get',
      title: 'The parts that stop a quotation going cold.',
      items: [
        {
          title: 'You can see they opened it',
          body: 'A quotation that has been read and not answered is a different situation from one that might still be sitting unread. The first is worth a phone call; the second is worth waiting a day. The status tells you which one you have.',
        },
        {
          title: 'A validity date that means something',
          body: 'Set how long the price holds. When it passes, the quotation expires and you are told — once. Your client is not messaged about it, because they never agreed to anything.',
        },
        {
          title: 'Accepted and not yet billed, in one list',
          body: 'Work you have already won and not yet asked to be paid for is the easiest money in any business to forget about. It gets its own line on your dashboard.',
        },
        {
          title: 'The record survives',
          body: 'Converting does not consume the quotation. It stays, marked accepted, with the invoice attached — so you can show a client the quote they agreed to and the invoice raised against it.',
        },
        {
          title: 'Its own numbering',
          body: 'Quotations run on their own sequence with their own prefix, so issuing one never puts a gap in your invoice numbers. Your accountant will not have to ask.',
        },
        {
          title: 'Never counted as money owed',
          body: 'A quotation is not a receivable. It never appears in your outstanding total, your overdue count or your cashflow forecast — because nobody has agreed to pay it.',
        },
      ],
    },

    faq: {
      eyebrow: 'Straight answers',
      title: 'What people ask about quotations.',
      items: [
        {
          q: 'Does my client need an account to accept?',
          a: 'No. They open the link, read the quotation and tap accept or decline. There is no sign-up, no login and no app. The link is unguessable and tied to that one quotation, so it cannot be used to see anything else.',
        },
        {
          q: 'Will you chase my client for a reply?',
          a: 'Never. That is a deliberate decision, not a missing feature. Someone who has not answered a quotation has not agreed to anything and owes nothing, so an automated nudge is sales pressure on a prospect — a different product with a different tone. The chase engine only ever touches invoices.',
        },
        {
          q: 'Is the typed name a legal signature?',
          a: 'It is a record, not a certified electronic signature, and we would rather say so plainly. Accepting captures the name the client typed, the date and their IP address, which is a good deal more evidence than a verbal yes on a phone call — but it is not e-signature with legal certification, and nothing in the product claims it is.',
        },
        {
          q: 'What happens when a quotation expires?',
          a: 'Its status changes to expired and you get told, once. Nothing goes to your client. If the work is still live, change the date and send it again — the same link starts working.',
        },
        {
          q: 'Can I mark one accepted myself?',
          a: 'Yes. Plenty of quotations are still answered in a phone call or over lunch, and a product that only knows about answers pressed through its own button knows about half of them. You can record the answer yourself, and reopen it later if they change their mind.',
        },
        {
          q: 'Does converting to an invoice change the quotation?',
          a: 'No. Conversion creates a new invoice and leaves the quotation standing, marked accepted, with the invoice linked to it in both directions. The document your client agreed to survives exactly as it was.',
        },
        {
          q: 'Can I quote in a currency other than ringgit?',
          a: 'Yes. MYR is the default because that is what most of our users bill in, and other currencies are there for overseas clients. The invoice raised from a quotation carries the currency across.',
        },
      ],
    },

    close: {
      title: 'Stop wondering whether they are going to say yes.',
      lead: 'Send the quotation, get the answer, raise the invoice. Then let it chase itself.',
      cta: 'Write your first quotation free',
      note: 'Free plan · no card needed',
    },
  },

  ms: {
    htmlLang: 'ms-MY',
    crumb: 'Sebut harga',

    meta: {
      title: 'Buat Sebut Harga Percuma — Hantar, Dapat Jawapan, Terus Jadi Invois',
      description:
        'Hantar sebut harga yang pelanggan boleh terima atau tolak dengan satu tekan, kemudian tukar jadi invois tanpa taip semula. Untuk pekerja bebas dan perniagaan kecil di Malaysia. Pelan percuma, tanpa kad.',
    },

    eyebrow: 'Sebut harga',
    title: 'Hantar sebut harga.',
    titleAccent: 'Dapat jawapan betul-betul.',
    lead: 'Kebanyakan sebut harga hilang begitu sahaja. Anda hantar PDF, pelanggan niat nak balas, tiga minggu kemudian anda pula yang kena tanya. InvoKita hantar sebut harga yang pelanggan boleh terima atau tolak dengan satu tekan — dan bila mereka terima, ia terus jadi invois tanpa anda taip semula apa-apa.',
    ctaPrimary: 'Buat sebut harga pertama, percuma',
    ctaSecondary: 'Lihat cara kejaran berfungsi',
    ctaNote: 'Pelan percuma · tanpa kad kredit',

    promise: {
      title: 'Sebut harga tidak pernah dikejar.',
      body: 'Pelanggan yang belum balas sebut harga belum bersetuju apa-apa dan tidak berhutang apa-apa. Susulan automatik di situ adalah tekanan jualan, bukan kutipan hutang — dan ia membelanjakan reputasi anda pada orang yang anda belum menang lagi. InvoKita takkan sesekali hantar mesej berjadual kepada prospek anda tentang sebut harga. Satu-satunya mesej automatik tentang sebut harga pergi kepada ANDA, bila ia luput tanpa jawapan, supaya anda sendiri boleh putuskan sama ada nak telefon mereka.',
    },

    how: {
      eyebrow: 'Cara ia berfungsi',
      title: 'Empat langkah, dua daripadanya kerja mereka.',
      items: [
        {
          n: '01',
          title: 'Tulis',
          body: 'Pilih pelanggan, masukkan item, tetapkan berapa lama harga itu sah. Logo anda, terma anda, nama perniagaan anda — pembina dokumen yang sama seperti invois.',
        },
        {
          n: '02',
          title: 'Hantar melalui WhatsApp atau emel',
          body: 'Mereka dapat pautan, bukan fail lampiran. Halaman itu buka elok di telefon dan tunjuk tepat apa yang anda sebut harga, berserta nombor pendaftaran dan TIN anda kalau sudah diisi.',
        },
        {
          n: '03',
          title: 'Mereka terima atau tolak',
          body: 'Satu tekan, tanpa akaun, tanpa log masuk. Bila terima, nama dan tarikh direkodkan, jadi dua-dua pihak ada rekod yang sama tentang apa yang dipersetujui. Bila tolak, mereka boleh beritahu sebabnya kalau mahu.',
        },
        {
          n: '04',
          title: 'Yang diterima terus jadi invois',
          body: 'Satu klik bawa pelanggan, item, jumlah, cukai dan mata wang masuk ke invois. Invois itu berpaut balik ke sebut harga, dan sebut harga tunjuk invois yang terhasil. Lepas itu ia berkelakuan macam invois lain — termasuk dikejar.',
        },
      ],
    },

    features: {
      eyebrow: 'Apa yang anda dapat',
      title: 'Bahagian yang halang sebut harga jadi sejuk.',
      items: [
        {
          title: 'Anda nampak bila mereka buka',
          body: 'Sebut harga yang dah dibaca tapi tak dijawab adalah keadaan berbeza daripada yang mungkin masih belum dibuka. Yang pertama berbaloi ditelefon; yang kedua berbaloi ditunggu sehari. Status akan beritahu anda yang mana satu.',
        },
        {
          title: 'Tarikh sah yang ada makna',
          body: 'Tetapkan berapa lama harga itu kekal. Bila tarikh itu lepas, sebut harga luput dan anda diberitahu — sekali sahaja. Pelanggan anda tidak dimesej, sebab mereka memang belum bersetuju apa-apa.',
        },
        {
          title: 'Dah menang tapi belum dibilkan, dalam satu senarai',
          body: 'Kerja yang anda dah menang tapi belum minta bayaran adalah duit paling senang terlupa dalam mana-mana perniagaan. Ia dapat barisnya sendiri di papan pemuka.',
        },
        {
          title: 'Rekod itu kekal',
          body: 'Menukar kepada invois tidak memadam sebut harga. Ia kekal, bertanda diterima, dengan invois berpaut padanya — jadi anda boleh tunjuk pelanggan sebut harga yang mereka setuju dan invois yang dikeluarkan atasnya.',
        },
        {
          title: 'Penomboran tersendiri',
          body: 'Sebut harga guna turutan dan awalan sendiri, jadi mengeluarkannya tidak buat nombor invois anda berlompat. Akauntan anda tak perlu tanya kenapa.',
        },
        {
          title: 'Tak pernah dikira sebagai duit terhutang',
          body: 'Sebut harga bukan akaun belum terima. Ia tak muncul dalam jumlah tertunggak, kiraan lewat atau unjuran aliran tunai anda — sebab belum ada sesiapa bersetuju untuk bayar.',
        },
      ],
    },

    faq: {
      eyebrow: 'Jawapan terus',
      title: 'Soalan orang tanya tentang sebut harga.',
      items: [
        {
          q: 'Pelanggan saya perlu akaun untuk terima ke?',
          a: 'Tidak. Mereka buka pautan, baca sebut harga, tekan terima atau tolak. Tiada pendaftaran, tiada log masuk, tiada aplikasi. Pautan itu tak boleh diteka dan terikat pada satu sebut harga sahaja, jadi ia tak boleh digunakan untuk lihat benda lain.',
        },
        {
          q: 'Anda akan kejar pelanggan saya untuk jawapan?',
          a: 'Tak sesekali. Itu keputusan yang disengajakan, bukan ciri yang tertinggal. Orang yang belum jawab sebut harga belum bersetuju apa-apa dan tak berhutang apa-apa, jadi susulan automatik di situ adalah tekanan jualan kepada prospek — produk lain, nada lain. Enjin kejaran hanya sentuh invois.',
        },
        {
          q: 'Nama yang ditaip itu tandatangan sah di sisi undang-undang ke?',
          a: 'Ia satu rekod, bukan tandatangan elektronik bertauliah, dan kami lebih rela cakap terus terang. Bila terima, nama yang ditaip pelanggan, tarikh dan alamat IP direkodkan — jauh lebih banyak bukti daripada sekadar "ya" dalam telefon — tetapi ia bukan e-signature dengan pengesahan undang-undang, dan produk ini tak pernah mendakwa begitu.',
        },
        {
          q: 'Apa jadi bila sebut harga luput?',
          a: 'Statusnya bertukar kepada luput dan anda diberitahu, sekali. Tiada apa-apa dihantar kepada pelanggan. Kalau kerja itu masih hidup, tukar tarikh dan hantar semula — pautan yang sama akan berfungsi balik.',
        },
        {
          q: 'Boleh saya tandakan sendiri sebagai diterima?',
          a: 'Boleh. Ramai lagi jawab sebut harga dalam telefon atau masa makan tengah hari, dan produk yang cuma tahu jawapan yang ditekan melalui butangnya sendiri cuma tahu separuh cerita. Anda boleh rekod jawapan itu sendiri, dan buka semula kemudian kalau mereka tukar fikiran.',
        },
        {
          q: 'Menukar jadi invois akan ubah sebut harga tak?',
          a: 'Tidak. Penukaran menghasilkan invois baharu dan membiarkan sebut harga kekal, bertanda diterima, dengan invois berpaut dua hala. Dokumen yang pelanggan anda setuju itu kekal tepat seperti asalnya.',
        },
        {
          q: 'Boleh buat sebut harga dalam mata wang selain ringgit?',
          a: 'Boleh. MYR jadi lalai sebab itu yang kebanyakan pengguna kami guna, dan mata wang lain ada untuk pelanggan luar negara. Invois yang dikeluarkan daripada sebut harga akan bawa mata wang yang sama.',
        },
      ],
    },

    close: {
      title: 'Berhenti tertanya-tanya sama ada mereka akan setuju.',
      lead: 'Hantar sebut harga, dapat jawapan, keluarkan invois. Lepas itu biar ia kejar sendiri.',
      cta: 'Buat sebut harga pertama, percuma',
      note: 'Pelan percuma · tanpa kad kredit',
    },
  },
} as const

export type QuotationCopy = (typeof copy)['en']

export function useQuotationCopy(locale: Locale = 'en') {
  return copy[locale] as unknown as QuotationCopy
}
