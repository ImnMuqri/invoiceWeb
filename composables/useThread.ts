/**
 * The conversation shown in the signature sticky phone.
 *
 * The two outbound messages are the product's REAL default templates, taken
 * verbatim from Backend/prisma/schema.prisma (whatsappSendTemplate and
 * whatsappReminderTemplate), with the {{placeholders}} filled in. If those
 * defaults change in the schema, update them here too — see README.
 *
 * The invoice, the business and the client are an illustrative example and the
 * phone is labelled as such on screen. No real customer is depicted and the
 * inbound reply is not presented as a testimonial.
 */

import type { Locale } from './useLandingCopy'

export type BubbleKind = 'invoice' | 'text' | 'system' | 'meta'

export interface ThreadMessage {
  id: string
  kind: BubbleKind
  side: 'out' | 'in'
  /** Rendered as separate paragraphs so the sender line can be styled apart. */
  lines?: string[]
  time?: string
  /** Marks a message the auto-chaser sent without the user doing anything. */
  automatic?: boolean
  invoice?: {
    number: string
    business: string
    amount: string
    due: string
    action: string
  }
}

export interface StoryChapter {
  /** How many messages of the thread are visible by this chapter. */
  upTo: number
}

/** Chapter -> message-count mapping. Shared by both locales. */
export const STORY_CHAPTERS: StoryChapter[] = [
  { upTo: 3 },
  { upTo: 5 },
  { upTo: 8 },
]

const EXAMPLE = {
  en: {
    label: 'Example conversation',
    contact: 'Wayne Lim',
    contactStatus: 'Client · Kuala Lumpur',
    automaticTag: 'Sent automatically',
    invoiceAction: 'View and pay',
    paidChip: 'Paid',
  },
  ms: {
    label: 'Contoh perbualan',
    contact: 'Wayne Lim',
    contactStatus: 'Pelanggan · Kuala Lumpur',
    automaticTag: 'Dihantar automatik',
    invoiceAction: 'Lihat dan bayar',
    paidChip: 'Dibayar',
  },
}

const threads: Record<Locale, ThreadMessage[]> = {
  en: [
    {
      id: 'm0',
      kind: 'invoice',
      side: 'out',
      time: '2 Nov, 10:04',
      invoice: {
        number: 'INV-0042',
        business: 'Studio Kirana',
        amount: 'RM 2,400.00',
        due: 'Due 15 Nov',
        action: 'View and pay',
      },
    },
    {
      id: 'm1',
      kind: 'text',
      side: 'out',
      time: '2 Nov, 10:04',
      // whatsappSendTemplate, verbatim
      lines: [
        'Aina Rahman · Studio Kirana via InvoKita',
        'Hello Wayne, here is your invoice INV-0042 for 2,400.00 MYR. Due on 15 Nov. View here: invokita.my/pay/k3f9a',
      ],
    },
    { id: 'm2', kind: 'meta', side: 'out', lines: ['Delivered'] },
    {
      id: 'm3',
      kind: 'text',
      side: 'out',
      time: '18 Nov, 09:00',
      automatic: true,
      // whatsappReminderTemplate, verbatim
      lines: [
        'Aina Rahman · Studio Kirana via InvoKita',
        'Friendly reminder for Wayne: Your invoice INV-0042 (2,400.00 MYR) is due on 15 Nov. Please ignore if already paid.',
      ],
    },
    { id: 'm4', kind: 'meta', side: 'out', lines: ['Read'] },
    {
      id: 'm5',
      kind: 'text',
      side: 'in',
      time: '18 Nov, 09:12',
      lines: ['Alamak, I missed this one. Paying now.'],
    },
    {
      id: 'm6',
      kind: 'system',
      side: 'out',
      lines: ['Payment received via ToyyibPay — INV-0042 marked Paid'],
    },
    {
      id: 'm7',
      kind: 'system',
      side: 'out',
      lines: ['2 scheduled reminders cancelled'],
    },
  ],

  ms: [
    {
      id: 'm0',
      kind: 'invoice',
      side: 'out',
      time: '2 Nov, 10:04',
      invoice: {
        number: 'INV-0042',
        business: 'Studio Kirana',
        amount: 'RM 2,400.00',
        due: 'Tarikh akhir 15 Nov',
        action: 'Lihat dan bayar',
      },
    },
    {
      id: 'm1',
      kind: 'text',
      side: 'out',
      time: '2 Nov, 10:04',
      // The same template, rewritten in Malay — which is the point being made.
      lines: [
        'Aina Rahman · Studio Kirana melalui InvoKita',
        'Hai Wayne, ini invois INV-0042 anda berjumlah 2,400.00 MYR. Tarikh akhir 15 Nov. Lihat di sini: invokita.my/pay/k3f9a',
      ],
    },
    { id: 'm2', kind: 'meta', side: 'out', lines: ['Dihantar'] },
    {
      id: 'm3',
      kind: 'text',
      side: 'out',
      time: '18 Nov, 09:00',
      automatic: true,
      lines: [
        'Aina Rahman · Studio Kirana melalui InvoKita',
        'Peringatan mesra untuk Wayne: Invois INV-0042 (2,400.00 MYR) sepatutnya dijelaskan pada 15 Nov. Abaikan jika sudah dibayar.',
      ],
    },
    { id: 'm4', kind: 'meta', side: 'out', lines: ['Dibaca'] },
    {
      id: 'm5',
      kind: 'text',
      side: 'in',
      time: '18 Nov, 09:12',
      lines: ['Alamak, terlepas pandang. Saya bayar sekarang.'],
    },
    {
      id: 'm6',
      kind: 'system',
      side: 'out',
      lines: ['Bayaran diterima melalui ToyyibPay — INV-0042 ditanda Dibayar'],
    },
    {
      id: 'm7',
      kind: 'system',
      side: 'out',
      lines: ['2 peringatan berjadual dibatalkan'],
    },
  ],
}

export function useThread(locale: Locale = 'en') {
  return {
    messages: threads[locale],
    labels: EXAMPLE[locale],
  }
}
