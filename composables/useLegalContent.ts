/**
 * Legal document content — Terms of Service, Privacy Policy, Refund Policy.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE PUBLISHING
 *
 * I am not a lawyer and this has not been reviewed by one. What I have done is
 * make these documents *accurate* — every factual statement below is traceable
 * to the codebase, and the previous versions contained claims that were not.
 *
 * Sections marked `review: true` contain standard commercial boilerplate
 * (liability caps, warranty disclaimers, indemnity) whose enforceability under
 * Malaysian law is genuinely a lawyer's call, not mine. They are drafted
 * conservatively. Get them checked. The `review` flag is developer-facing only
 * and is never rendered — a "pending legal review" badge on a live policy page
 * would be worse than no badge at all.
 *
 * Corrections made to the previous versions, and why:
 *
 *  1. Privacy §"Data Security" claimed "bank-level encryption (AES-256)" for
 *     user data generally. Backend/src/utils/encryption.js applies AES-256-GCM
 *     to payment-gateway credentials ONLY; invoice and client records are
 *     ordinary database columns. A privacy policy is an enforceable
 *     representation, so this is now stated precisely.
 *  2. Groq was not disclosed anywhere. Backend/src/utils/aiService.js sends
 *     revenue totals, overdue-invoice details and top-client data to it. Now
 *     disclosed, with what is sent.
 *  3. The subprocessor list named only Billplz and ToyyibPay. The code also
 *     uses Twilio, Resend, HitPay, senangPay and Xendit. All now listed, with
 *     the cross-border transfer point that PDPA s.129 turns on.
 *  4. Terms had no acceptable-use clause. For a product whose core function is
 *     sending WhatsApp messages to third parties, that was the largest single
 *     exposure. Added, along with the user's warranty over their clients' data.
 *  5. Terms had no liability, warranty, indemnity, availability or
 *     change-of-terms clauses at all. Added.
 *  6. Refund policy did not mention that gateway fees are charged by the
 *     user's own gateway and are not ours to refund. Added.
 *  7. "BSYX LABS" is now the full registered name and number, matching the
 *     footer.
 *
 * COULD NOT VERIFY — these are deliberately absent or hedged rather than
 * invented. Fill them in once you can confirm them:
 *   • Hosting provider and the country your database physically sits in.
 *   • Whether backups exist, their frequency and retention. (The old landing
 *     page claimed "daily automated backups"; nothing in the repo proves it,
 *     so no backup promise is made here.)
 *   • A concrete data-retention period after account deletion.
 *   • Whether you are a registered data user under the PDPA.
 * Search this file for "[CONFIRM]" to find each spot.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'dl'; items: { term: string; desc: string }[] }
  | { type: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { type: 'note'; text: string }

export interface LegalSection {
  id: string
  title: string
  blocks: Block[]
  /** Developer-facing only. Never rendered. Needs a lawyer's eyes. */
  review?: boolean
}

export interface LegalDoc {
  slug: 'terms' | 'privacy' | 'refund'
  eyebrow: string
  title: string
  titleAccent: string
  metaTitle: string
  metaDescription: string
  updated: string
  updatedISO: string
  summary: string
  sections: LegalSection[]
  contactHeading: string
  contactBody: string
}

/* Sole proprietorship, so no "Sdn Bhd" — that suffix denotes a private limited
   company, and claiming it in the terms of service is a misstatement of who the
   contracting party actually is. "Registration No." rather than "Company No."
   for the same reason. */
const ENTITY = 'BSYX LABS (Registration No. 202603086039)'
const UPDATED = '31 July 2026'
const UPDATED_ISO = '2026-07-31'
const SUPPORT = 'support@invokita.my'

/* ═══════════════════════════════════════════════════════════════════════════
   TERMS OF SERVICE
   ═══════════════════════════════════════════════════════════════════════════ */
const terms: LegalDoc = {
  slug: 'terms',
  eyebrow: 'Legal',
  title: 'Terms of',
  titleAccent: 'service.',
  metaTitle: 'Terms of Service — InvoKita',
  metaDescription:
    'The terms that govern your use of InvoKita: your account, acceptable use, plans and quotas, automatic reminders, payments, and liability.',
  updated: UPDATED,
  updatedISO: UPDATED_ISO,
  summary:
    'These terms are a contract between you and us. They are written to be read — plain sentences, no capitalised walls of text. The short version: use InvoKita for your own invoicing, only message people who expect to hear from you, and remember that the money moves through your payment gateway, not ours.',
  sections: [
    {
      id: 'who-we-are',
      title: 'Who we are, and what these terms cover',
      blocks: [
        {
          type: 'p',
          text: `InvoKita is operated by ${ENTITY}, a company registered in Malaysia ("InvoKita", "we", "us"). These Terms of Service govern your access to and use of the InvoKita website, application and related services (together, the "Service").`,
        },
        {
          type: 'p',
          text: 'By creating an account or using the Service you agree to these terms. If you are agreeing on behalf of a company or other organisation, you confirm you have authority to bind it, and "you" means that organisation.',
        },
        {
          type: 'p',
          text: 'Our Privacy Policy and Refund Policy form part of these terms. Where they say something more specific about a topic, the more specific document applies.',
        },
      ],
    },
    {
      id: 'the-service',
      title: 'What the Service does',
      blocks: [
        {
          type: 'p',
          text: 'InvoKita helps you create invoices, send them to your clients by email and WhatsApp, follow up on unpaid invoices automatically on a schedule you set, and record payment when your payment gateway confirms it.',
        },
        {
          type: 'p',
          text: 'We are a software provider. We are not an accountant, a tax adviser, a debt collection agency, a payment institution or a bank, and nothing in the Service is financial, tax or legal advice. You remain responsible for the accuracy of your invoices and for meeting your own tax and record-keeping obligations.',
        },
      ],
    },
    {
      id: 'your-account',
      title: 'Your account',
      blocks: [
        {
          type: 'p',
          text: 'You need an account to use most of the Service. You agree to give accurate registration details and to keep them current.',
        },
        {
          type: 'ul',
          items: [
            'You are responsible for everything that happens under your account, including anything done by people you give access to.',
            'Keep your password and any API or gateway credentials confidential. Tell us promptly at ' + SUPPORT + ' if you believe your account has been accessed without your permission.',
            'One account is for one business. Do not resell or share access to your account with unrelated businesses unless we have agreed in writing.',
            'You must be at least 18 years old, or old enough to enter a binding contract where you live, whichever is older.',
          ],
        },
      ],
    },
    {
      id: 'acceptable-use',
      title: 'What you may not use the Service for',
      blocks: [
        {
          type: 'p',
          text: 'The Service sends messages to real people on your behalf. That only works if it is not abused. You agree not to use InvoKita to:',
        },
        {
          type: 'ul',
          items: [
            'Send unsolicited marketing, bulk messaging or anything that would count as spam. Invoices and payment reminders to people you have actually done business with are fine; promotional broadcasts are not.',
            'Harass, threaten, intimidate or repeatedly contact someone who has asked you to stop.',
            'Invoice for goods or services that are illegal, fraudulent or misrepresented, or to demand money you are not owed.',
            'Impersonate another person or business, or send invoices under a business name you are not entitled to use.',
            'Upload malware, attempt to breach or probe our systems, bypass usage limits, scrape the Service, or reverse-engineer it.',
            'Break any applicable law, including Malaysian communications, consumer protection, anti-money-laundering and data protection law, and the terms of any messaging platform or payment gateway you connect.',
          ],
        },
        {
          type: 'note',
          text: 'WhatsApp messaging is delivered through third-party providers with their own acceptable-use rules. If a provider blocks or restricts messaging because of how your account has been used, we may have to suspend that feature for you, and we will tell you why.',
        },
      ],
    },
    {
      id: 'your-clients-data',
      title: 'Your clients’ information is your responsibility',
      blocks: [
        {
          type: 'p',
          text: 'To use InvoKita you will enter other people’s personal information — your clients’ names, phone numbers, email addresses and billing details. This is the most important obligation in these terms.',
        },
        {
          type: 'ul',
          items: [
            'You confirm you are entitled to hold that information and to have us process it in order to send invoices and reminders on your behalf.',
            'You are responsible for telling your clients how their information is used, to the extent the law requires it of you.',
            'You must honour any request from a client to stop being contacted. InvoKita gives you a per-client switch for automatic chasing and a per-message interval; use them.',
            'Do not enter special or sensitive categories of personal data (for example health information or identity-document numbers) into invoice fields. The Service is not designed for it.',
          ],
        },
        {
          type: 'p',
          text: 'In data protection terms, you decide what happens to your clients’ information and we act on your instructions. Our Privacy Policy explains this split and lists every third party involved.',
        },
      ],
    },
    {
      id: 'plans-quotas',
      title: 'Plans, quotas and fair use',
      blocks: [
        {
          type: 'p',
          text: 'The Service is offered on a free plan and on paid monthly plans. Each plan includes a monthly allowance — for example a number of invoices, WhatsApp sends, email sends and AI drafts. Current plans and allowances are shown on our pricing page and in your dashboard, and are the authoritative version.',
        },
        {
          type: 'ul',
          items: [
            'Allowances reset each billing month and do not roll over.',
            'When you reach an allowance, the related feature stops until the next cycle or until you upgrade. Your data is not affected.',
            'Automatic chasing is included only on the plans that list it. If your plan does not include it, you can still send reminders yourself.',
            'We may change plans, allowances and prices. If a change affects a plan you are paying for, we will give you reasonable notice by email before it applies to you, and you can cancel before it takes effect.',
          ],
        },
      ],
    },
    {
      id: 'payments',
      title: 'Payments, and why we never hold your money',
      blocks: [
        {
          type: 'p',
          text: 'There are two separate money flows, and it matters that you can tell them apart.',
        },
        {
          type: 'dl',
          items: [
            {
              term: 'What your clients pay you',
              desc: 'You connect your own payment gateway account — for example Billplz, ToyyibPay, HitPay or senangPay. Your client pays into your gateway account directly. InvoKita is never a party to that transaction, never takes custody of those funds, and cannot refund them. Your relationship with your gateway is governed by that gateway’s own agreement with you, including its fees, settlement times and dispute process.',
            },
            {
              term: 'What you pay us',
              desc: 'Subscription fees for the Service. Fees are stated in Malaysian Ringgit (MYR), billed monthly in advance, and are exclusive of any tax we are required to add. You can cancel at any time from your dashboard; cancellation takes effect at the end of the period you have already paid for. Fees are non-refundable except as set out in our Refund Policy or where the law requires otherwise.',
            },
          ],
        },
        {
          type: 'p',
          text: 'If a payment to us fails and is not resolved, we may suspend paid features until it is. We will not delete your data for non-payment without telling you first.',
        },
      ],
    },
    {
      id: 'reminders',
      title: 'Automatic reminders are yours to control',
      blocks: [
        {
          type: 'p',
          text: 'When you enable automatic chasing, InvoKita sends reminders about unpaid invoices on the schedule you configure, using message templates you can edit. You decide the wording, the interval, the channel, and which clients are included.',
        },
        {
          type: 'ul',
          items: [
            'Reminders stop automatically once your gateway confirms payment, or once you mark the invoice paid yourself.',
            'Set the interval to zero and nothing is ever sent automatically.',
            'Because you control the content and timing, you are responsible for the messages sent from your account.',
            'Message delivery depends on third-party networks and on your client’s phone number and email address being correct. We cannot guarantee that any individual message is delivered or read.',
          ],
        },
      ],
    },
    {
      id: 'ai',
      title: 'AI features',
      blocks: [
        {
          type: 'p',
          text: 'InvoKita uses a third-party large language model to draft invoices from a sentence you type, and to generate summaries of your invoicing activity.',
        },
        {
          type: 'ul',
          items: [
            'AI output is a draft. It can be wrong, incomplete or misleading. Check every figure, name and date before you send anything.',
            'The Service does not send an invoice on its own as a result of AI output. Sending is always an action you take.',
            'AI features consume a monthly allowance under your plan.',
            'Our Privacy Policy explains what data is sent to the AI provider.',
          ],
        },
      ],
    },
    {
      id: 'availability',
      title: 'Availability and changes to the Service',
      blocks: [
        {
          type: 'p',
          text: 'We work to keep InvoKita available and reliable, but we do not promise a specific uptime percentage and we do not offer a service-level agreement. The Service may be unavailable for maintenance, or because of a failure at a hosting, messaging or gateway provider.',
        },
        {
          type: 'p',
          text: 'We may add, change or remove features. If we remove something you depend on, or make a change that materially reduces the Service, we will give you reasonable notice where we practicably can.',
        },
      ],
    },
    {
      id: 'ip',
      title: 'Who owns what',
      blocks: [
        {
          type: 'dl',
          items: [
            {
              term: 'Ours',
              desc: `The Service itself — the software, design, layout, text, graphics and the InvoKita name and logo — belongs to ${ENTITY} or its licensors. We grant you a limited, non-exclusive, non-transferable, revocable licence to use the Service for your own business while these terms are in force. You get no other rights.`,
            },
            {
              term: 'Yours',
              desc: 'Everything you put in stays yours: your invoices, your client records, your logo, your message templates and your business details. We claim no ownership of it. You grant us only the permission we need to host, process, transmit and display that content in order to run the Service for you — for example, sending an invoice to the client you addressed it to.',
            },
          ],
        },
        {
          type: 'p',
          text: 'If you send us feedback or suggestions, we may act on them without owing you anything. That is not a licence to any of your other content.',
        },
      ],
    },
    {
      id: 'termination',
      title: 'Suspension, termination and getting your data out',
      blocks: [
        {
          type: 'p',
          text: 'You can stop using the Service at any time and close your account from your settings.',
        },
        {
          type: 'p',
          text: 'We may suspend or terminate your access if you materially breach these terms — in particular the acceptable-use and client-data sections — if we are required to by law, or if your use puts other users, a provider we depend on, or the Service itself at risk. Except where the breach is serious, unlawful or urgent, we will tell you what the problem is and give you a reasonable chance to fix it before we terminate.',
        },
        {
          type: 'p',
          text: 'Before you close your account, export anything you need: invoices can be downloaded as PDFs. After termination we may delete your content. Do not rely on us as your only copy of your business records.',
        },
      ],
    },
    {
      id: 'warranties',
      title: 'Disclaimers',
      review: true,
      blocks: [
        {
          type: 'p',
          text: 'The Service is provided "as is" and "as available". To the fullest extent permitted by law, we exclude all warranties, conditions and representations that are not expressly set out in these terms — including any implied warranty of merchantability, fitness for a particular purpose, or non-infringement.',
        },
        {
          type: 'p',
          text: 'In particular, we do not warrant that the Service will be uninterrupted or error-free, that every message will be delivered, that AI output will be accurate, or that you will collect any particular invoice or amount.',
        },
        {
          type: 'p',
          text: 'Nothing in these terms excludes or limits any right you have under Malaysian law that cannot lawfully be excluded, including under the Consumer Protection Act 1999 where it applies to you.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of liability',
      review: true,
      blocks: [
        {
          type: 'p',
          text: 'To the fullest extent permitted by law, we are not liable for loss of profit, loss of revenue, loss of anticipated savings, loss of business or goodwill, loss or corruption of data, or any indirect or consequential loss, however caused.',
        },
        {
          type: 'p',
          text: 'Where we are liable, our total aggregate liability arising out of or in connection with the Service in any twelve-month period is limited to the greater of (a) the total subscription fees you paid us for the Service in the twelve months before the event giving rise to the claim, and (b) one hundred Malaysian Ringgit (RM 100).',
        },
        {
          type: 'p',
          text: 'These limits do not apply to liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or to any other liability that cannot lawfully be limited.',
        },
      ],
    },
    {
      id: 'indemnity',
      title: 'Indemnity',
      review: true,
      blocks: [
        {
          type: 'p',
          text: 'You agree to indemnify us against claims, losses and reasonable costs (including reasonable legal fees) arising from your breach of these terms, from your use of the Service in a way these terms prohibit, or from a third party’s claim about content you sent or personal data you entered.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      blocks: [
        {
          type: 'p',
          text: 'We may update these terms. When we do, we will change the "last updated" date at the top of this page. If a change materially reduces your rights or increases your obligations, we will give you notice by email or in the app before it takes effect.',
        },
        {
          type: 'p',
          text: 'If you keep using the Service after a change takes effect, you accept the updated terms. If you do not accept them, stop using the Service and close your account.',
        },
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing law and disputes',
      blocks: [
        {
          type: 'p',
          text: 'These terms are governed by the laws of Malaysia. You and we submit to the exclusive jurisdiction of the courts of Malaysia.',
        },
        {
          type: 'p',
          text: `Before starting proceedings, please contact us at ${SUPPORT} so we have a chance to resolve the problem directly. Most things can be sorted out in an email.`,
        },
        {
          type: 'p',
          text: 'These terms are written in English. If we publish a translation and the two versions conflict, the English version governs.',
        },
      ],
    },
  ],
  contactHeading: 'Questions about these terms?',
  contactBody:
    'Email us and a person will read it. Tell us which section you are asking about and we can be specific.',
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRIVACY POLICY
   ═══════════════════════════════════════════════════════════════════════════ */
const privacy: LegalDoc = {
  slug: 'privacy',
  eyebrow: 'Legal',
  title: 'Privacy',
  titleAccent: 'policy.',
  metaTitle: 'Privacy Policy — InvoKita',
  metaDescription:
    'What data InvoKita collects, exactly which third parties process it, what we send to our AI provider, how we secure it, and your rights under the Malaysian PDPA.',
  updated: UPDATED,
  updatedISO: UPDATED_ISO,
  summary:
    'This policy says what we actually do, not what sounds reassuring. It names every third party your data reaches, including the AI provider, and it is specific about what is encrypted and what is not. We do not sell your data and we run no advertising or analytics trackers.',
  sections: [
    {
      id: 'scope',
      title: 'Who this covers, and our two different roles',
      blocks: [
        {
          type: 'p',
          text: `This policy explains how ${ENTITY} handles personal data in connection with InvoKita. It is written against the Malaysian Personal Data Protection Act 2010 ("PDPA").`,
        },
        {
          type: 'p',
          text: 'There are two kinds of personal data in InvoKita and we treat them differently:',
        },
        {
          type: 'dl',
          items: [
            {
              term: 'Your data — we decide',
              desc: 'The information about you as a user: your name, email, business details, plan and how you use the Service. For this data we are the data user, and this policy describes what we do with it.',
            },
            {
              term: 'Your clients’ data — you decide',
              desc: 'The information you enter about the people you invoice: their names, phone numbers, email addresses, addresses and what they owe you. You decide what goes in and who gets contacted. We process it on your instructions in order to run the Service for you. Your own privacy notice governs your relationship with your clients; this policy tells you what we do with it on your behalf.',
            },
          ],
        },
      ],
    },
    {
      id: 'what-we-collect',
      title: 'What we collect',
      blocks: [
        {
          type: 'dl',
          items: [
            {
              term: 'Account information',
              desc: 'Your name, email address, password (stored hashed, never in readable form), and the business profile you enter — company name, address, phone, logo and tax settings.',
            },
            {
              term: 'Invoice and client records',
              desc: 'The invoices you create and the client records you enter: names, contact details, line items, amounts, currency, due dates, payment status, and the timestamps of messages we sent about them.',
            },
            {
              term: 'Payment gateway credentials',
              desc: 'If you connect a gateway, the API keys and secrets for your own gateway account. These are encrypted before storage — see the security section.',
            },
            {
              term: 'Subscription and billing information',
              desc: 'Your plan, allowance usage, and records of payments to us. We do not receive or store your full card number; that is handled by the payment provider.',
            },
            {
              term: 'Technical and usage data',
              desc: 'Server logs including IP address, browser type, pages requested and timestamps, plus a record of which features you use, so we can keep the Service secure and working.',
            },
          ],
        },
        {
          type: 'note',
          text: 'We do not ask for and do not want special categories of personal data — health information, identity-document numbers, religious or political information. Please do not put them in invoice fields.',
        },
      ],
    },
    {
      id: 'why',
      title: 'Why we use it',
      blocks: [
        {
          type: 'ul',
          items: [
            'To provide the Service: creating invoices, sending them by email and WhatsApp, sending the reminders you have scheduled, and recording payment when your gateway confirms it.',
            'To operate your account: authentication, plan allowances, billing and support.',
            'To keep the Service safe: detecting abuse, debugging faults and protecting against fraud and unauthorised access.',
            'To communicate with you about your account, security, changes to the Service and changes to these documents.',
            'To meet legal, tax and accounting obligations that apply to us.',
          ],
        },
        {
          type: 'p',
          text: 'We do not use your data or your clients’ data to train AI models, and we do not use it for advertising.',
        },
      ],
    },
    {
      id: 'subprocessors',
      title: 'Who else processes your data',
      blocks: [
        {
          type: 'p',
          text: 'We use the third parties below to run the Service. They receive only what they need for their function. Several are outside Malaysia, which means your data — and your clients’ data — is transferred out of Malaysia when those features are used.',
        },
        {
          type: 'table',
          head: ['Provider', 'What it does', 'What it receives'],
          rows: [
            ['Twilio', 'Delivers WhatsApp messages', 'Your client’s phone number and the message content, which includes their name, your business name, the invoice number, the amount and the due date'],
            ['Resend', 'Delivers email', 'Your client’s email address and the message content, and your email address for account mail'],
            ['Groq', 'Runs the AI drafting and insight features', 'See the AI section below'],
            ['Billplz, ToyyibPay, HitPay, senangPay, Xendit', 'Payment gateways you choose to connect', 'Invoice reference, amount, currency and the details needed to create a payment page. Handled under your own agreement with that gateway'],
          ],
          caption:
            'If you have not connected a gateway, or you have automatic messaging switched off, the corresponding provider receives nothing.',
        },
        {
          type: 'p',
          // [CONFIRM] Name the hosting provider and the country the database
          // sits in, and add it to the table above. Required for a complete
          // cross-border transfer disclosure under PDPA s.129.
          text: 'We also use infrastructure providers to host the application and its database, and they necessarily store the data described above on our behalf.',
        },
        {
          type: 'p',
          text: 'We do not sell personal data, we do not rent or trade it, and we do not share it with advertisers or data brokers. We may disclose data if we are legally required to, or to establish or defend a legal claim, and we will tell you unless we are prohibited from doing so.',
        },
      ],
    },
    {
      id: 'ai-processing',
      title: 'What we send to the AI provider',
      blocks: [
        {
          type: 'p',
          text: 'Two features use a third-party large language model, currently Groq. This section exists because a vague reference to "AI" is not a disclosure.',
        },
        {
          type: 'dl',
          items: [
            {
              term: 'Invoice drafting',
              desc: 'When you type a sentence to draft an invoice, that sentence is sent to the provider. If it contains a client name or an amount, so does the request.',
            },
            {
              term: 'Dashboard insights',
              desc: 'When insights are generated, we send a summary of your recent invoicing activity: your default currency, revenue and outstanding totals, details of overdue invoices, and your top clients by revenue — which includes client names.',
            },
          ],
        },
        {
          type: 'ul',
          items: [
            'These requests are processed outside Malaysia.',
            'We do not send payment gateway credentials, passwords or card data to the AI provider.',
            'We do not use your data to train models, and we ask our provider not to either. Their own terms govern what they do; if that matters to your business, do not use the AI features.',
            'If you never use the AI features, no invoice or client data is sent to an AI provider.',
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies',
      blocks: [
        {
          type: 'p',
          text: 'We use cookies and similar local storage only for things the Service needs to work:',
        },
        {
          type: 'ul',
          items: [
            'Authentication — keeping you signed in between page loads.',
            'Preferences — remembering choices such as your light or dark theme.',
          ],
        },
        {
          type: 'p',
          text: 'We run no advertising cookies, no third-party analytics and no cross-site tracking. There is no consent banner because there is nothing to consent to beyond the cookies that make signing in possible.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Security — precisely what we do',
      blocks: [
        {
          type: 'p',
          text: 'An earlier version of this policy implied that all of your data was held under bank-grade encryption. That was broader than the truth, so here is the accurate position.',
        },
        {
          type: 'dl',
          items: [
            {
              term: 'In transit',
              desc: 'All traffic between your browser and our servers, and between our servers and the providers listed above, is encrypted using HTTPS/TLS.',
            },
            {
              term: 'Payment gateway credentials',
              desc: 'Encrypted at the application layer with AES-256-GCM before being written to the database, and decrypted only when a payment request needs them.',
            },
            {
              term: 'Passwords',
              desc: 'Stored as one-way hashes. We cannot read your password and cannot tell it to you.',
            },
            {
              term: 'Invoice and client records',
              desc: 'Stored in our database with access controls and per-account isolation, so one account cannot read another’s records. These records are not additionally encrypted at the application layer — they are protected by access control, authentication and the security of the hosting environment, not by per-field encryption.',
            },
            {
              term: 'Public invoice links',
              desc: 'The link you send a client contains a token tied to that single invoice. It cannot be used to browse anything else in your account. Anyone holding the link can view that invoice, so treat it as you would any payment link.',
            },
          ],
        },
        {
          type: 'note',
          // [CONFIRM] No backup promise is made here on purpose — nothing in
          // the repo evidences one, and the old landing page's "daily automated
          // backups" claim could not be verified. Document the real
          // arrangement, then state it.
          text: 'No system is perfectly secure and we do not claim otherwise. If we discover a breach affecting your personal data, we will tell you and take the steps the law requires.',
        },
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep it',
      blocks: [
        {
          type: 'ul',
          items: [
            'While your account is open, we keep your data so the Service works and your history stays intact.',
            // [CONFIRM] Replace 'a reasonable period' with a concrete number
            // of days once you have decided the retention window.
            'If you close your account, we delete or anonymise your account and invoice data within a reasonable period, except where we must keep records for longer to meet a legal, tax or accounting obligation, or to resolve a dispute.',
            'Server logs are kept for a limited period for security and debugging, then discarded.',
            'Anonymised or aggregated information that cannot identify anyone may be kept indefinitely.',
          ],
        },
        {
          type: 'p',
          text: 'Export what you need before closing your account. Invoices can be downloaded as PDFs at any time.',
        },
      ],
    },
    {
      id: 'your-rights',
      title: 'Your rights under the PDPA',
      blocks: [
        {
          type: 'p',
          text: 'In relation to the personal data we hold about you, you may:',
        },
        {
          type: 'ul',
          items: [
            'Ask for access to it, and for a copy.',
            'Ask us to correct it if it is inaccurate or incomplete.',
            'Withdraw your consent to processing that relies on consent, and ask us to stop processing that is causing you damage or distress. Withdrawing consent for processing we need in order to run the Service means we may no longer be able to provide it.',
            'Ask us to limit how we process it.',
            'Ask us to delete it, subject to any records we must keep by law.',
          ],
        },
        {
          type: 'p',
          text: `Most of this you can do yourself in your account settings. For anything else, email ${SUPPORT} from the address on your account and we will respond. We may need to verify who you are first.`,
        },
        {
          type: 'p',
          text: 'If your data is in InvoKita because one of our users invoiced you, we are processing it on their instructions. Contact that business directly. If you cannot reach them, write to us and we will pass the request on.',
        },
        {
          type: 'p',
          text: 'If you are unhappy with how we have handled a request, you can complain to the Personal Data Protection Commissioner in Malaysia. We would rather you told us first.',
        },
      ],
    },
    {
      id: 'children',
      title: 'Children',
      blocks: [
        {
          type: 'p',
          text: 'The Service is a business tool and is not directed at children. We do not knowingly collect personal data from anyone under 18. If you believe a child has given us personal data, contact us and we will delete it.',
        },
      ],
    },
    {
      id: 'privacy-changes',
      title: 'Changes to this policy',
      blocks: [
        {
          type: 'p',
          text: 'We may update this policy. The "last updated" date at the top always reflects the current version. If a change materially affects how we handle your personal data, we will notify you by email or in the app rather than relying on you to notice.',
        },
      ],
    },
  ],
  contactHeading: 'Questions about your data?',
  contactBody:
    'Ask us anything about what we hold, where it goes, or how to get it out. Email the address on your account and we will reply.',
}

/* ═══════════════════════════════════════════════════════════════════════════
   REFUND POLICY
   ═══════════════════════════════════════════════════════════════════════════ */
const refund: LegalDoc = {
  slug: 'refund',
  eyebrow: 'Legal',
  title: 'Refund',
  titleAccent: 'policy.',
  metaTitle: 'Refund Policy — InvoKita',
  metaDescription:
    'InvoKita’s 7-day guarantee for first-time paid subscribers, what is and is not refundable, how to request a refund, and how downgrades and cancellations work.',
  updated: UPDATED,
  updatedISO: UPDATED_ISO,
  summary:
    'The short version: the free plan costs nothing, so there is nothing to refund. If you are paying us for the first time and it is not right for you, tell us within 7 days and we will refund that payment in full. After that, you can cancel any time and you keep what you have paid for until the period ends.',
  sections: [
    {
      id: 'scope-refund',
      title: 'What this policy covers',
      blocks: [
        {
          type: 'p',
          text: `This policy covers subscription fees you pay to ${ENTITY} for InvoKita. It forms part of our Terms of Service.`,
        },
        {
          type: 'note',
          text: 'It does not cover money your clients pay you. Those payments go directly into your own payment gateway account and never pass through us, so we cannot refund, reverse or chargeback an invoice payment. For that, contact your gateway.',
        },
      ],
    },
    {
      id: 'free-plan',
      title: 'The free plan',
      blocks: [
        {
          type: 'p',
          text: 'The free plan does not require payment or card details, so no refund can arise from it. You can use it to decide whether InvoKita suits you before paying anything, and we would rather you did.',
        },
      ],
    },
    {
      id: 'guarantee',
      title: 'The 7-day guarantee',
      blocks: [
        {
          type: 'p',
          text: 'If you are subscribing to a paid plan for the first time and decide within 7 days that InvoKita is not right for your business, ask us and we will refund that first subscription payment in full. You do not need to justify it.',
        },
        {
          type: 'p',
          text: 'To qualify:',
        },
        {
          type: 'ul',
          items: [
            'It is your first paid subscription on the account.',
            'You ask within 7 days of the date that payment was taken.',
            'The account has not been suspended or terminated for breaching our Terms of Service.',
          ],
        },
      ],
    },
    {
      id: 'not-refundable',
      title: 'What is not refundable',
      blocks: [
        {
          type: 'ul',
          items: [
            'Renewal payments after your first subscription period. Cancel before a renewal date if you do not want to be billed again.',
            'Time already elapsed on the current period. Cancelling stops the next payment; it does not refund the days you have already had.',
            'Unused allowances — invoices, WhatsApp sends, email sends or AI drafts you did not use before the month ended.',
            'Partial months after a downgrade, and any difference in price for a higher tier you have already been billed for.',
            'Fees charged by your own payment gateway, bank or card issuer. Those are not ours and we cannot return them.',
          ],
        },
      ],
    },
    {
      id: 'how-to-request',
      title: 'How to ask for a refund',
      blocks: [
        {
          type: 'p',
          text: `Email ${SUPPORT} from the address on your account. Include:`,
        },
        {
          type: 'ul',
          items: [
            'The email address on your InvoKita account.',
            'Roughly when the payment was taken.',
            'Optionally, what went wrong — it is not required, but it helps us fix things.',
          ],
        },
        {
          type: 'p',
          text: 'We aim to reply within 3 business days. Approved refunds go back to the payment method you used, in MYR, and typically appear within 5–10 business days depending on your bank or gateway. We will tell you when we have sent it.',
        },
      ],
    },
    {
      id: 'downgrades',
      title: 'Downgrades and cancellation',
      blocks: [
        {
          type: 'ul',
          items: [
            'Cancel or downgrade any time from your dashboard. No email, no phone call, no retention conversation.',
            'A cancellation or downgrade takes effect at the end of the period you have already paid for. Until then you keep the plan you paid for.',
            'After that, the account moves to the free plan. Your invoices and client records stay where they are, within the free plan’s limits.',
            'Automatic chasing stops when you move to a plan that does not include it. Scheduled reminders will not be sent.',
          ],
        },
      ],
    },
    {
      id: 'errors',
      title: 'Billing errors and serious outages',
      blocks: [
        {
          type: 'p',
          text: 'If we bill you in error — the wrong amount, a duplicate charge, or a charge after you cancelled — tell us and we will correct it. This is not discretionary and the 7-day window does not apply to it.',
        },
        {
          type: 'p',
          text: 'If the Service is substantially unavailable for an extended period during a month you paid for, contact us and we will consider a credit or a partial refund in proportion to the disruption. We do not operate a service-level agreement, so there is no automatic payout, but we would rather make it right than argue.',
        },
      ],
    },
    {
      id: 'statutory',
      title: 'Your statutory rights',
      blocks: [
        {
          type: 'p',
          text: 'This policy is in addition to any rights you have under Malaysian law, including the Consumer Protection Act 1999 where it applies to you. Nothing here removes a right that cannot lawfully be removed. Where this policy gives you more than the law requires, the policy applies.',
        },
      ],
    },
  ],
  contactHeading: 'Need help with a payment?',
  contactBody:
    'Email us with your account address and we will look it up. If we got the billing wrong, we will fix it.',
}

const docs = { terms, privacy, refund } as const

export function useLegalDoc(slug: 'terms' | 'privacy' | 'refund'): LegalDoc {
  return docs[slug]
}

export const LEGAL_SUPPORT_EMAIL = SUPPORT
export const LEGAL_ENTITY = ENTITY
