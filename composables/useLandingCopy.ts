/**
 * Landing page copy — English and Bahasa Malaysia.
 *
 * Both locales are written, not machine-translated. The BM version is
 * Malaysian-colloquial-professional, the register a freelancer in KL would
 * actually use with a client — not formal Dewan Bahasa prose.
 *
 * HONESTY RULE: nothing in this file states a customer count, a volume figure,
 * an uptime number, or a testimonial. The product has no proof yet, so the page
 * makes no proof claims. Every capability described here is verifiable in the
 * codebase; see README for the line references.
 */

export type Locale = 'en' | 'ms'

export const LOCALES: Locale[] = ['en', 'ms']

const copy = {
  en: {
    htmlLang: 'en-MY',
    localeName: 'English',
    localeSwitchTo: 'Baca dalam Bahasa Malaysia',

    meta: {
      // 57 chars
      title: 'InvoKita — Invoices That Chase Themselves on WhatsApp',
      // 149 chars
      description:
        'Send invoices on WhatsApp, then let InvoKita follow up automatically until your client pays. Works with Billplz, ToyyibPay, HitPay. Free plan, no card.',
      ogAlt:
        'InvoKita — an invoice sent on WhatsApp with an automatic follow-up marked paid',
    },

    nav: {
      skip: 'Skip to main content',
      home: 'InvoKita home',
      links: [
        { id: 'how', label: 'How it works' },
        { id: 'payments', label: 'Getting paid' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'faq', label: 'FAQ' },
      ],
      signIn: 'Sign in',
      cta: 'Start free',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      themeToggle: 'Switch colour theme',
    },

    hero: {
      eyebrow: 'Built in Malaysia, for Malaysian businesses',
      // The one serif moment on the page.
      titleLead: 'You sent the invoice.',
      titleSerif: 'We do the chasing.',
      lead: 'InvoKita sends your invoice over WhatsApp, then follows up on the schedule you set — in your words, under your business name — and stops the second your client pays.',
      ctaPrimary: 'Send your first invoice free',
      ctaSecondary: 'See what your client receives',
      ctaNote: 'Free plan · 5 invoices a month · no card needed',
      proofLabel: 'Connects to the gateways you already use',
      threadCaption: 'The default follow-up, word for word',
    },

    thread: {
      eyebrow: 'The awkward part',
      title: 'Your client gets a message, not a robot.',
      lead: 'This is the reminder InvoKita sends, exactly as it ships. It is a text field in your settings — rewrite every word of it, or switch it to Malay. Your name and your business name sit at the top, so nobody is left wondering who is texting them.',
      points: [
        {
          title: 'You write the words',
          body: 'The send and reminder messages are editable templates. Change the tone, the language, the sign-off. What you write is what goes out.',
        },
        {
          title: 'Any client can be left alone',
          body: 'Auto-chasing is a per-client switch. Turn it off for the regular you would rather call yourself, and it stays off.',
        },
        {
          title: 'It stops the moment they pay',
          body: 'When your gateway confirms the payment, every queued reminder for that invoice is cancelled. Nobody gets chased for money they already sent.',
        },
      ],
      senderNote:
        'Messages go out from InvoKita’s WhatsApp number by default. You can connect your own WhatsApp Business number in settings so they arrive from you.',
    },

    steps: {
      eyebrow: 'Setting it up',
      title: 'From nothing to sent, in one sitting.',
      lead: 'There is no data import and no onboarding call. You can do this before your coffee goes cold.',
      items: [
        {
          n: '01',
          title: 'Write the invoice',
          body: 'Type one line — "invoice Wayne RM1,200 for the website" — and the AI drafts it: client, items, amounts, total. Or fill the form yourself. Either way it is a minute of work.',
        },
        {
          n: '02',
          title: 'Send it where they read',
          body: 'WhatsApp, email, or both. Your client gets a link that opens a payment page — not a PDF attachment they have to download, find later, and lose.',
        },
        {
          n: '03',
          title: 'Set the chase and walk away',
          body: 'Pick how many days between follow-ups. That is the last decision you make about this invoice unless something goes wrong.',
        },
      ],
    },

    payments: {
      eyebrow: 'Where the money lands',
      title: 'It goes to your account. We never hold it.',
      lead: 'You connect your own Billplz, ToyyibPay, HitPay or senangPay account. Your client pays into it directly. InvoKita is not in the middle of the transaction — it just listens for the gateway’s confirmation, marks the invoice paid, and cancels the follow-ups that were queued.',
      gatewaysLabel: 'Payment gateways you can connect',
      localTitle: 'Built for how business works here',
      localPoints: [
        { title: 'MYR by default', body: 'Ringgit is the default currency, not a setting you have to hunt for. Other currencies are there when you need them.' },
        { title: 'SST handled', body: 'Set your tax rate once in settings and it applies across your invoices.' },
        { title: 'DuitNow and FPX', body: 'Whatever your gateway supports, your client can use — including online banking and QR.' },
      ],
      reconTitle: 'What happens the moment they pay',
      reconSteps: [
        { label: 'Gateway confirms', body: 'Billplz or ToyyibPay fires a webhook the instant the payment clears.' },
        { label: 'Invoice marked paid', body: 'InvoKita matches it to the invoice and updates the status. No manual ticking off.' },
        { label: 'Follow-ups cancelled', body: 'Every reminder still queued for that invoice is dropped.' },
      ],
    },

    chaser: {
      eyebrow: 'The signature bit',
      title: 'What it did while you were working.',
      lead: 'A real chase cycle, printed the way your accountant would want it. Nothing here needed you.',
      receiptTitle: 'AUTO-CHASER LOG',
      receiptSub: 'STUDIO KIRANA · EXAMPLE',
      receiptNote: 'Illustrative example. Your log shows your own invoices and the intervals you set.',
      log: [
        { date: '02 NOV', time: '10:04', event: 'INVOICE SENT', detail: 'INV-0042 · RM 2,400.00 · WHATSAPP + EMAIL', by: 'YOU' },
        { date: '15 NOV', time: '00:00', event: 'DUE DATE PASSED', detail: 'STATUS CHANGED TO OVERDUE', by: 'AUTO' },
        { date: '18 NOV', time: '09:00', event: 'REMINDER 1 SENT', detail: 'WHATSAPP · TEMPLATE: DEFAULT', by: 'AUTO' },
        { date: '18 NOV', time: '09:12', event: 'PAYMENT RECEIVED', detail: 'TOYYIBPAY WEBHOOK · RM 2,400.00', by: 'AUTO' },
        { date: '18 NOV', time: '09:12', event: 'REMINDERS CANCELLED', detail: '2 SCHEDULED FOLLOW-UPS DROPPED', by: 'AUTO' },
      ],
      totalLabel: 'TIMES YOU HAD TO ASK',
      totalValue: 'NONE',
      byYou: 'YOU',
      byAuto: 'AUTO',
      footnote:
        'Follow-up intervals are yours to set — daily, every three days, weekly. Set it to zero and nothing is ever sent automatically.',
    },

    bento: {
      eyebrow: 'Everything else it does',
      title: 'The small things that stop you losing money.',
      lead: 'Not a feature list for its own sake — these are the parts you notice after a month of using it.',
      tiles: {
        ai: {
          title: 'Describe it. Get a draft.',
          body: 'Type "invoice Wayne RM1,200 for the website, due 15 Nov" and the AI fills in the client, the line items, the amounts and the due date. You check it before anything goes out.',
          prompt: 'invoice Wayne RM1,200 for the website, due 15 Nov',
          rows: [
            { label: 'Client', value: 'Wayne Lim' },
            { label: 'Website build', value: 'RM 1,200.00' },
            { label: 'Due', value: '15 Nov' },
          ],
          total: 'RM 1,200.00',
          totalLabel: 'Total',
        },
        risk: {
          title: 'It knows who pays late.',
          body: 'Every client builds a payment history. New invoices are flagged by how that particular client has actually behaved — not by a guess.',
          riskLabel: 'Late risk',
          rows: [
            { client: 'Rumah Kopi', meta: 'pays in 4 days on average', risk: 'low' },
            { client: 'Cahaya Digital', meta: 'pays in 12 days on average', risk: 'high' },
          ],
          levels: { low: 'Low', medium: 'Medium', high: 'High' },
        },
        perClient: {
          title: 'Chase this one, not that one.',
          body: 'Auto-chasing is a switch on each client — WhatsApp and email separately.',
          on: 'Chasing on',
          off: 'Chasing off',
          names: ['Cahaya Digital', 'Pak Samad'],
        },
        brand: {
          title: 'Your logo, not ours.',
          body: 'Upload your logo and pick an invoice theme. It arrives looking like your business.',
          slot: 'Your logo',
        },
        money: {
          title: 'Ringgit first, the rest when you need it.',
          body: 'MYR is the default. Set SST once and it applies across your invoices. Other currencies are there for overseas clients.',
          chips: ['MYR', 'SGD', 'USD', 'EUR'],
          taxLabel: 'SST',
          taxValue: '8%',
        },
        deliver: {
          title: 'A link to pay. A PDF when they ask.',
          body: 'Clients get a payment page, not an attachment they have to download and lose. If their accounts department wants a PDF, that is one click.',
          link: 'invokita.my/pay/k3f9a',
          pdf: 'Invoice-INV-0042.pdf',
        },
      },
      cta: 'Try it on your own invoices',
    },

    pricing: {
      eyebrow: 'Pricing',
      title: 'Free to invoice. Pay when you want it chased.',
      lead: 'Making and sending invoices costs nothing. The paid plans exist because every WhatsApp message and every automatic follow-up costs us money to send.',
      loading: 'Loading current plans…',
      error: 'Plans could not be loaded right now.',
      errorAction: 'See plans in the app',
      perMonth: '/month',
      free: 'Free',
      cta: 'Choose this plan',
      ctaFree: 'Start free',
      chaserBadge: 'Includes auto-chasing',
      noChaserNote: 'Manual reminders only — you press send.',
      footnote: 'Prices in MYR, billed monthly. Cancel from your dashboard at any time.',
      customTitle: 'Need something bigger?',
      customBody: 'Higher volumes and white-labelling are available. Tell us what you need.',
      customCta: 'Talk to us',
    },

    faq: {
      eyebrow: 'Straight answers',
      title: 'The things people ask before signing up.',
      items: [
        {
          q: 'Will my clients find automatic reminders rude?',
          a: 'That is up to what you write. The default reminder is deliberately gentle and ends with "please ignore if you have already paid". You can rewrite it entirely, set your own interval, or turn chasing off for specific clients who you would rather handle personally.',
        },
        {
          q: 'Does the WhatsApp message come from my number?',
          a: 'By default it is sent from InvoKita’s WhatsApp number, with your name and business name written at the top of the message. If you would rather it arrive from your own number, you can connect your own WhatsApp Business account in settings.',
        },
        {
          q: 'Do you hold my money?',
          a: 'No. You connect your own Billplz, ToyyibPay, HitPay or senangPay account and your client pays into it directly. InvoKita only receives the confirmation that a payment happened so it can update the invoice and stop the reminders.',
        },
        {
          q: 'What happens if a client pays offline, by bank transfer?',
          a: 'Mark the invoice paid yourself in the dashboard and the queued reminders are cancelled the same way. Automatic detection only applies to payments made through a connected gateway.',
        },
        {
          q: 'Can I use it in Malay?',
          a: 'Yes. Your invoices, messages and reminder templates are plain text fields — write them in Malay, English, or a mix, whichever your client reads. This page is available in Malay too.',
        },
        {
          q: 'What does the AI actually do?',
          a: 'It turns a sentence into a draft invoice. You type something like "invoice Wayne RM1,200 for the website, due 15 Nov" and it fills in the client, line items, amounts and due date for you to check before sending. It never sends anything on its own.',
        },
        {
          q: 'Is my data safe?',
          a: 'Invoice data is isolated per account and payment gateway credentials are stored encrypted. Public invoice links are tokenised and tied to a single invoice, so a link cannot be used to browse anything else.',
        },
        {
          q: 'Can I cancel?',
          a: 'Any time, from your dashboard. There is no contract and no cancellation step that requires talking to somebody.',
        },
      ],

      /* Spec 06, Part B. Kept as its own entry rather than another item in the
         list above because it is the one answer that needs to carry a link,
         and because it is the objection most likely to stop a signup dead.
         Written to close it honestly: it does not imply compliance the product
         does not have. */
      einvoice: {
        q: 'Does InvoKita handle LHDN e-Invoice?',
        a: [
          'Not the MyInvois submission, and we would rather say so than let you find out later. InvoKita sends your invoices over WhatsApp and email, chases them until they are paid, and takes payment through your own gateway. It does not submit to MyInvois and using it does not make your business compliant.',
          'For most of the people who use InvoKita that is not a problem, because many freelancers and small businesses fall under LHDN’s exemption threshold and have nothing to submit. Whether you do depends on your own circumstances, which is what the checker below is for.',
          'If a client asks you for a validated e-Invoice and you are under the threshold, say so — a buyer who is mandated can usually issue a self-billed e-Invoice covering the transaction. For anything definitive, LHDN is the only source that counts.',
        ],
        linkLabel: 'Check whether e-Invoice applies to you',
      },
    },

    close: {
      title: 'Send the invoice. Go back to work.',
      lead: 'Set it up once. The next time an invoice goes late, you will find out because it has already been handled.',
      cta: 'Send your first invoice free',
      note: 'Free plan · no card needed',
    },

    footer: {
      tagline: 'Invoicing that follows up so you do not have to.',
      product: 'Product',
      company: 'Company',
      legal: 'Legal',
      links: {
        how: 'How it works',
        payments: 'Getting paid',
        pricing: 'Pricing',
        faq: 'FAQ',
        einvoice: 'e-Invoice checker',
        signIn: 'Sign in',
        register: 'Create an account',
        support: 'Support',
        terms: 'Terms of service',
        privacy: 'Privacy policy',
        refund: 'Refund policy',
      },
      rights: 'All rights reserved.',
    },
  },

  ms: {
    htmlLang: 'ms-MY',
    localeName: 'Bahasa Malaysia',
    localeSwitchTo: 'Read in English',

    meta: {
      title: 'InvoKita — Invois Yang Kejar Bayaran Sendiri',
      description:
        'Hantar invois melalui WhatsApp, biar InvoKita susul sendiri sampai pelanggan bayar. Sokong Billplz, ToyyibPay, HitPay. Pelan percuma, tanpa kad.',
      ogAlt:
        'InvoKita — invois dihantar melalui WhatsApp dengan susulan automatik yang bertanda sudah dibayar',
    },

    nav: {
      skip: 'Terus ke kandungan utama',
      home: 'Laman utama InvoKita',
      links: [
        { id: 'how', label: 'Cara guna' },
        { id: 'payments', label: 'Terima bayaran' },
        { id: 'pricing', label: 'Harga' },
        { id: 'faq', label: 'Soalan lazim' },
      ],
      signIn: 'Log masuk',
      cta: 'Mula percuma',
      openMenu: 'Buka menu',
      closeMenu: 'Tutup menu',
      themeToggle: 'Tukar tema warna',
    },

    hero: {
      eyebrow: 'Dibina di Malaysia, untuk perniagaan Malaysia',
      titleLead: 'Anda dah hantar invois.',
      titleSerif: 'Kami yang kejar.',
      lead: 'InvoKita hantar invois anda melalui WhatsApp, kemudian susul ikut jadual yang anda tetapkan — guna ayat anda sendiri, atas nama perniagaan anda — dan berhenti sebaik sahaja pelanggan bayar.',
      ctaPrimary: 'Hantar invois pertama, percuma',
      ctaSecondary: 'Lihat apa pelanggan anda terima',
      ctaNote: 'Pelan percuma · 5 invois sebulan · tanpa kad kredit',
      proofLabel: 'Sambung terus ke gateway yang anda guna sekarang',
      threadCaption: 'Mesej susulan lalai, perkataan demi perkataan',
    },

    thread: {
      eyebrow: 'Bahagian yang janggal',
      title: 'Pelanggan anda terima mesej, bukan robot.',
      lead: 'Inilah peringatan yang InvoKita hantar, tepat seperti yang disediakan. Ia cuma kotak teks dalam tetapan — tulis semula setiap perkataan, atau tukar terus ke Bahasa Malaysia. Nama anda dan nama syarikat anda ada di atas, jadi tiada siapa tertanya-tanya siapa yang menghantar.',
      points: [
        {
          title: 'Ayat itu ayat anda',
          body: 'Mesej hantar dan mesej peringatan adalah templat yang boleh diedit. Ubah nada, bahasa, cara tutup ayat. Apa yang anda tulis, itulah yang keluar.',
        },
        {
          title: 'Ada pelanggan yang tak perlu dikejar',
          body: 'Kejaran automatik ada suis untuk setiap pelanggan. Matikan untuk pelanggan lama yang anda lebih suka telefon sendiri, dan ia kekal mati.',
        },
        {
          title: 'Berhenti sebaik mereka bayar',
          body: 'Sebaik gateway sahkan bayaran, semua peringatan yang beratur untuk invois itu dibatalkan. Tiada siapa dikejar untuk duit yang dah pun dibayar.',
        },
      ],
      senderNote:
        'Secara lalai, mesej dihantar dari nombor WhatsApp InvoKita. Anda boleh sambungkan nombor WhatsApp Business anda sendiri dalam tetapan supaya mesej sampai atas nama anda.',
    },

    steps: {
      eyebrow: 'Cara mula',
      title: 'Dari kosong ke hantar, dalam satu duduk.',
      lead: 'Tiada import data, tiada sesi onboarding. Boleh siap sebelum kopi anda sejuk.',
      items: [
        {
          n: '01',
          title: 'Tulis invois',
          body: 'Taip satu ayat — "invois Wayne RM1,200 untuk website" — dan AI akan draf: pelanggan, item, jumlah, total. Atau isi borang sendiri. Dua-dua ambil masa seminit.',
        },
        {
          n: '02',
          title: 'Hantar ke tempat mereka baca',
          body: 'WhatsApp, emel, atau kedua-duanya. Pelanggan dapat pautan yang terus buka halaman bayaran — bukan fail PDF yang kena muat turun, cari balik, kemudian hilang.',
        },
        {
          n: '03',
          title: 'Set kejaran, kemudian tinggalkan',
          body: 'Pilih berapa hari jarak antara susulan. Itu keputusan terakhir yang anda buat untuk invois ini melainkan ada masalah.',
        },
      ],
    },

    payments: {
      eyebrow: 'Ke mana duit masuk',
      title: 'Masuk akaun anda. Kami tak pegang duit anda.',
      lead: 'Anda sambungkan akaun Billplz, ToyyibPay, HitPay atau senangPay anda sendiri. Pelanggan bayar terus ke situ. InvoKita bukan orang tengah dalam transaksi — ia cuma dengar pengesahan dari gateway, tandakan invois sebagai dibayar, dan batalkan susulan yang beratur.',
      gatewaysLabel: 'Gateway pembayaran yang boleh disambungkan',
      localTitle: 'Dibina ikut cara perniagaan di sini',
      localPoints: [
        { title: 'MYR sebagai lalai', body: 'Ringgit adalah mata wang lalai, bukan tetapan yang kena cari. Mata wang lain ada bila anda perlukan.' },
        { title: 'SST terus jalan', body: 'Set kadar cukai sekali dalam tetapan dan ia digunakan merentas invois anda.' },
        { title: 'DuitNow dan FPX', body: 'Apa sahaja yang gateway anda sokong, pelanggan boleh guna — termasuk perbankan online dan QR.' },
      ],
      reconTitle: 'Apa yang berlaku sebaik mereka bayar',
      reconSteps: [
        { label: 'Gateway sahkan', body: 'Billplz atau ToyyibPay hantar webhook sebaik bayaran selesai.' },
        { label: 'Invois ditanda dibayar', body: 'InvoKita padankan dengan invois dan kemas kini status. Tak perlu tanda sendiri.' },
        { label: 'Susulan dibatalkan', body: 'Semua peringatan yang masih beratur untuk invois itu digugurkan.' },
      ],
    },

    chaser: {
      eyebrow: 'Bahagian istimewa',
      title: 'Apa yang ia buat masa anda sibuk kerja.',
      lead: 'Satu kitaran kejaran sebenar, dicetak macam akauntan anda suka. Tiada satu pun yang perlukan anda.',
      receiptTitle: 'LOG AUTO-CHASER',
      receiptSub: 'STUDIO KIRANA · CONTOH',
      receiptNote: 'Contoh gambaran. Log anda akan tunjuk invois anda sendiri dan jarak masa yang anda tetapkan.',
      log: [
        { date: '02 NOV', time: '10:04', event: 'INVOIS DIHANTAR', detail: 'INV-0042 · RM 2,400.00 · WHATSAPP + EMEL', by: 'ANDA' },
        { date: '15 NOV', time: '00:00', event: 'TARIKH AKHIR LEPAS', detail: 'STATUS BERTUKAR KE TERTUNGGAK', by: 'AUTO' },
        { date: '18 NOV', time: '09:00', event: 'PERINGATAN 1 DIHANTAR', detail: 'WHATSAPP · TEMPLAT: LALAI', by: 'AUTO' },
        { date: '18 NOV', time: '09:12', event: 'BAYARAN DITERIMA', detail: 'WEBHOOK TOYYIBPAY · RM 2,400.00', by: 'AUTO' },
        { date: '18 NOV', time: '09:12', event: 'PERINGATAN DIBATALKAN', detail: '2 SUSULAN BERJADUAL DIGUGURKAN', by: 'AUTO' },
      ],
      totalLabel: 'BERAPA KALI ANDA KENA MINTA',
      totalValue: 'TIADA',
      byYou: 'ANDA',
      byAuto: 'AUTO',
      footnote:
        'Jarak susulan anda yang tentukan — setiap hari, tiga hari sekali, seminggu sekali. Set kepada sifar dan tiada apa dihantar automatik.',
    },

    bento: {
      eyebrow: 'Apa lagi yang ia buat',
      title: 'Perkara kecil yang halang duit anda tercicir.',
      lead: 'Bukan senarai ciri semata-mata — ini bahagian yang anda perasan selepas guna sebulan.',
      tiles: {
        ai: {
          title: 'Cerita je. Draf siap.',
          body: 'Taip "invois Wayne RM1,200 untuk website, due 15 Nov" dan AI isikan pelanggan, item, jumlah dan tarikh akhir. Anda semak dulu sebelum apa-apa keluar.',
          prompt: 'invois Wayne RM1,200 untuk website, due 15 Nov',
          rows: [
            { label: 'Pelanggan', value: 'Wayne Lim' },
            { label: 'Pembinaan website', value: 'RM 1,200.00' },
            { label: 'Tarikh akhir', value: '15 Nov' },
          ],
          total: 'RM 1,200.00',
          totalLabel: 'Jumlah',
        },
        risk: {
          title: 'Ia tahu siapa yang lambat bayar.',
          body: 'Setiap pelanggan bina rekod pembayaran sendiri. Invois baharu ditanda ikut cara pelanggan itu betul-betul berkelakuan — bukan agakan.',
          riskLabel: 'Risiko lewat',
          rows: [
            { client: 'Rumah Kopi', meta: 'purata bayar dalam 4 hari', risk: 'low' },
            { client: 'Cahaya Digital', meta: 'purata bayar dalam 12 hari', risk: 'high' },
          ],
          levels: { low: 'Rendah', medium: 'Sederhana', high: 'Tinggi' },
        },
        perClient: {
          title: 'Kejar yang ini, bukan yang itu.',
          body: 'Kejaran automatik ada suis untuk setiap pelanggan — WhatsApp dan emel berasingan.',
          on: 'Kejaran hidup',
          off: 'Kejaran mati',
          names: ['Cahaya Digital', 'Pak Samad'],
        },
        brand: {
          title: 'Logo anda, bukan logo kami.',
          body: 'Muat naik logo dan pilih tema invois. Ia sampai nampak macam perniagaan anda.',
          slot: 'Logo anda',
        },
        money: {
          title: 'Ringgit dahulu, yang lain bila perlu.',
          body: 'MYR jadi lalai. Set SST sekali, terus guna merentas invois. Mata wang lain ada untuk pelanggan luar negara.',
          chips: ['MYR', 'SGD', 'USD', 'EUR'],
          taxLabel: 'SST',
          taxValue: '8%',
        },
        deliver: {
          title: 'Pautan untuk bayar. PDF bila diminta.',
          body: 'Pelanggan dapat halaman bayaran, bukan fail lampiran yang kena muat turun kemudian hilang. Kalau bahagian akaun mereka nak PDF, satu klik je.',
          link: 'invokita.my/pay/k3f9a',
          pdf: 'Invois-INV-0042.pdf',
        },
      },
      cta: 'Cuba dengan invois anda sendiri',
    },

    pricing: {
      eyebrow: 'Harga',
      title: 'Percuma untuk hantar invois. Bayar bila nak ia dikejar.',
      lead: 'Buat dan hantar invois tak berbayar. Pelan berbayar wujud sebab setiap mesej WhatsApp dan setiap susulan automatik ada kos untuk kami hantar.',
      loading: 'Sedang muatkan pelan semasa…',
      error: 'Pelan tidak dapat dimuatkan buat masa ini.',
      errorAction: 'Lihat pelan dalam aplikasi',
      perMonth: '/bulan',
      free: 'Percuma',
      cta: 'Pilih pelan ini',
      ctaFree: 'Mula percuma',
      chaserBadge: 'Termasuk kejaran automatik',
      noChaserNote: 'Peringatan manual sahaja — anda yang tekan hantar.',
      footnote: 'Harga dalam MYR, dibil bulanan. Batal dari papan pemuka bila-bila masa.',
      customTitle: 'Perlu sesuatu yang lebih besar?',
      customBody: 'Volum lebih tinggi dan white-label ada disediakan. Beritahu kami apa yang anda perlukan.',
      customCta: 'Hubungi kami',
    },

    faq: {
      eyebrow: 'Jawapan terus',
      title: 'Soalan yang orang tanya sebelum daftar.',
      items: [
        {
          q: 'Peringatan automatik ni kasar tak pada pelanggan saya?',
          a: 'Bergantung pada apa yang anda tulis. Peringatan lalai sengaja dibuat lembut dan berakhir dengan "abaikan jika sudah dibayar". Anda boleh tulis semula sepenuhnya, set jarak masa sendiri, atau matikan kejaran untuk pelanggan tertentu yang anda lebih suka uruskan sendiri.',
        },
        {
          q: 'Mesej WhatsApp datang dari nombor saya ke?',
          a: 'Secara lalai ia dihantar dari nombor WhatsApp InvoKita, dengan nama anda dan nama syarikat anda tertulis di atas mesej. Kalau anda lebih suka ia sampai dari nombor anda sendiri, anda boleh sambungkan akaun WhatsApp Business anda dalam tetapan.',
        },
        {
          q: 'Anda pegang duit saya ke?',
          a: 'Tidak. Anda sambungkan akaun Billplz, ToyyibPay, HitPay atau senangPay anda sendiri dan pelanggan bayar terus ke situ. InvoKita cuma terima pengesahan bahawa bayaran berlaku, supaya ia boleh kemas kini invois dan hentikan peringatan.',
        },
        {
          q: 'Kalau pelanggan bayar offline, transfer bank, macam mana?',
          a: 'Tandakan invois sebagai dibayar sendiri dalam papan pemuka, dan peringatan yang beratur dibatalkan dengan cara yang sama. Pengesanan automatik hanya untuk bayaran melalui gateway yang disambungkan.',
        },
        {
          q: 'Boleh guna dalam Bahasa Malaysia?',
          a: 'Boleh. Invois, mesej dan templat peringatan anda semuanya kotak teks biasa — tulis dalam Bahasa Malaysia, Inggeris, atau campur, ikut apa yang pelanggan anda baca. Halaman ini pun ada dalam Bahasa Malaysia.',
        },
        {
          q: 'AI ni buat apa sebenarnya?',
          a: 'Ia tukar satu ayat jadi draf invois. Anda taip macam "invois Wayne RM1,200 untuk website, due 15 Nov" dan ia isikan pelanggan, item, jumlah dan tarikh akhir untuk anda semak sebelum hantar. Ia tak pernah hantar apa-apa sendiri.',
        },
        {
          q: 'Data saya selamat?',
          a: 'Data invois diasingkan mengikut akaun dan kredensial gateway pembayaran disimpan dalam bentuk tersulit. Pautan invois awam adalah token dan terikat pada satu invois sahaja, jadi pautan itu tak boleh digunakan untuk melihat benda lain.',
        },
        {
          q: 'Boleh batal bila-bila masa?',
          a: 'Boleh, terus dari papan pemuka. Tiada kontrak dan tiada langkah pembatalan yang memaksa anda bercakap dengan sesiapa.',
        },
      ],

      einvoice: {
        q: 'InvoKita uruskan e-Invois LHDN ke?',
        a: [
          'Bukan penghantaran ke MyInvois, dan kami lebih rela cakap terus terang daripada biar anda tahu kemudian. InvoKita hantar invois anda melalui WhatsApp dan emel, susul sampai ia dibayar, dan terima bayaran melalui gateway anda sendiri. Ia tidak menghantar ke MyInvois dan menggunakannya tidak menjadikan perniagaan anda patuh.',
          'Bagi kebanyakan pengguna InvoKita itu bukan masalah, sebab ramai pekerja bebas dan perniagaan kecil berada di bawah ambang pengecualian LHDN dan tiada apa untuk dihantar. Sama ada anda termasuk atau tidak bergantung pada keadaan anda sendiri — itulah gunanya penyemak di bawah ini.',
          'Kalau pelanggan minta e-Invois yang disahkan sedangkan anda di bawah ambang, beritahu mereka — pembeli yang diwajibkan selalunya boleh keluarkan e-Invois bil sendiri (self-billed) untuk transaksi itu. Untuk apa-apa yang muktamad, LHDN sahaja sumber yang dikira.',
        ],
        linkLabel: 'Semak sama ada e-Invois terpakai kepada anda',
      },
    },

    close: {
      title: 'Hantar invois. Sambung kerja.',
      lead: 'Set sekali sahaja. Lain kali bila ada invois lewat, anda akan tahu sebab ia dah pun diuruskan.',
      cta: 'Hantar invois pertama, percuma',
      note: 'Pelan percuma · tanpa kad kredit',
    },

    footer: {
      tagline: 'Invois yang susul sendiri, supaya anda tak perlu.',
      product: 'Produk',
      company: 'Syarikat',
      legal: 'Undang-undang',
      links: {
        how: 'Cara guna',
        payments: 'Terima bayaran',
        pricing: 'Harga',
        faq: 'Soalan lazim',
        einvoice: 'Penyemak e-Invois',
        signIn: 'Log masuk',
        register: 'Buka akaun',
        support: 'Sokongan',
        terms: 'Terma perkhidmatan',
        privacy: 'Dasar privasi',
        refund: 'Dasar bayaran balik',
      },
      rights: 'Hak cipta terpelihara.',
    },
  },
} as const

export type LandingCopy = (typeof copy)['en']

export function useLandingCopy(locale: Locale = 'en') {
  return copy[locale] as unknown as LandingCopy
}

/**
 * Canonical + hreflang helpers. BM lives at /ms/, English at the root.
 *
 * The TRAILING SLASH is deliberate: the production host issues a 308 from /ms
 * to /ms/. Emitting the unslashed form meant every internal link took a
 * redirect hop and — worse — the canonical URL pointed at a URL that redirects,
 * which is a canonical/redirect mismatch that search engines treat as a soft
 * error. Emit the URL that is actually served.
 */
export const SITE_URL = 'https://invokita.my'

export function localePath(locale: Locale, path = '/') {
  const clean = path === '/' ? '' : path.replace(/\/$/, '')
  if (locale !== 'ms') return clean || '/'
  return clean ? `/ms${clean}/` : '/ms/'
}

/**
 * The e-Invoice scope checker (spec 06), per locale.
 *
 * Lives here beside localePath rather than in useScopeCheckerCopy because the
 * footer and the FAQ link to it, and having the copy file import from here
 * while this file imported the path back would be a cycle. One definition, and
 * Backend/src/utils/einvoiceEmail.js mirrors it so the emailed copy links home.
 */
export function scopeCheckerPath(locale: Locale) {
  return localePath(locale, '/e-invoice-check')
}
