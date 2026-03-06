<template>
  <div>
    <div class="sm:flex sm:items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Invoices</h1>
        <p class="mt-2 text-sm text-slate-500 font-medium">A list of all the invoices including their status, client, and amount.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <NuxtLink to="/invoices/create" class="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors">Create Invoice</NuxtLink>
      </div>
    </div>
    
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow-sm border border-slate-200 bg-white sm:rounded-xl">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" class="py-4 pl-6 pr-3 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Invoice ID</th>
                  <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Client</th>
                  <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Amount</th>
                  <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Status</th>
                  <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap">
                     Late Risk
                     <svg class="w-3 h-3 inline-block ml-1 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </th>
                  <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Date</th>
                  <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">WhatsApp</th>
                  <th scope="col" class="relative py-4 pl-3 pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                <tr v-for="invoice in invoiceStore.invoices" :key="invoice.id" class="hover:bg-slate-50 transition-colors">
                  <td class="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-slate-900">#{{ invoice.id }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">{{ invoice.client }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-900">${{ invoice.amount.toLocaleString() }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                     <span v-if="invoice.status === 'Paid'" class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">Paid</span>
                     <span v-else-if="invoice.status === 'Overdue'" class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 border border-red-100">Overdue</span>
                     <span v-else class="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-100">Pending</span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                     <div v-if="invoice.status !== 'Paid'" class="flex items-center gap-1.5" :class="invoice.latePrediction === 'High' ? 'text-red-600' : invoice.latePrediction === 'Medium' ? 'text-amber-500' : 'text-emerald-600'">
                        <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
                        <span class="font-semibold text-xs">{{ invoice.latePrediction }}</span>
                     </div>
                     <span v-else class="text-slate-400 font-medium text-xs">-</span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">{{ invoice.date }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span v-if="invoice.whatsappStatus === 'Sent'" class="inline-flex items-center text-emerald-600 font-medium text-xs">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                          Sent
                      </span>
                      <span v-else-if="invoice.whatsappStatus === 'Sending...'" class="inline-flex items-center text-amber-500 font-medium text-xs">
                          <svg class="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                          Sending...
                      </span>
                      <span v-else class="text-slate-400 font-medium text-xs">-</span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-semibold flex items-center justify-end gap-3 h-full">
                    <button v-if="invoice.status !== 'Paid'" @click="openWhatsAppModal(invoice)" class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                        <svg class="w-3.5 h-3.5 mr-1.5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Send Reminder
                    </button>
                    <button class="text-indigo-600 hover:text-indigo-900 transition-colors ml-2 object-contain">View</button>
                    <button @click="invoiceStore.deleteInvoice(invoice.id)" class="text-slate-400 hover:text-red-600 transition-colors ml-4">Delete</button>
                  </td>
                </tr>
                <tr v-if="invoiceStore.invoices.length === 0">
                    <td colspan="7" class="py-12 text-center text-sm font-medium text-slate-500">No invoices found. <NuxtLink to="/invoices/create" class="text-indigo-600 hover:underline">Create one</NuxtLink>.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- WhatsApp Sandbox Modal -->
    <div v-if="showModal" class="relative z-50">
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-slate-200">
            <div>
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <div class="mt-3 sm:mt-5">
                <h3 class="text-lg font-semibold leading-6 text-slate-900 text-center">Send WhatsApp Auto-Chaser</h3>
                <div class="mt-2 text-center text-sm text-slate-500 mb-6">
                  Review the drafted message before the AI sends it to <span class="font-semibold text-slate-800">{{ selectedInvoice?.client }}</span>.
                </div>
                
                <div class="bg-[#f0f2f5] rounded-xl p-4 relative mb-6 border border-[#e5e5e5]">
                    <!-- WhatsApp Tail -->
                    <div class="absolute -left-2 top-4 w-4 h-4 bg-[#f0f2f5] rotate-45 border-l border-b border-[#e5e5e5]"></div>
                    <p class="text-[15px] text-slate-800 leading-relaxed font-sans relative z-10 whitespace-pre-wrap">Hi boss! Just a gentle reminder regarding invoice <span class="font-semibold">{{ selectedInvoice?.id }}</span> for <span class="font-semibold">{{ selectedInvoice?.currency }} {{ selectedInvoice?.amount.toLocaleString() }}</span>.

We noted there is an outstanding amount and wanted to provide an easy payment option via our secure FPX / DuitNow gateway:
https://pay.arto.my/inv/{{ selectedInvoice?.id.replace('INV-', '') }}

Let us know if you have any questions. Thank you for your business! 🙏</p>
                    <div class="mt-2 text-right text-[11px] font-medium text-slate-400">10:42 AM</div>
                </div>

              </div>
            </div>
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button @click="confirmSend" type="button" class="inline-flex w-full justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:col-start-2 transition-colors">
                Confirm & Send
              </button>
              <button @click="closeModal" type="button" class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:col-start-1 sm:mt-0 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useInvoiceStore } from '~/stores/invoiceStore'
const invoiceStore = useInvoiceStore()

const showModal = ref(false)
const selectedInvoice = ref(null)

const openWhatsAppModal = (invoice) => {
    selectedInvoice.value = invoice
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    setTimeout(() => {
        selectedInvoice.value = null
    }, 200)
}

const confirmSend = () => {
    if (selectedInvoice.value) {
        invoiceStore.sendWhatsAppReminder(selectedInvoice.value.id)
    }
    closeModal()
}
</script>
