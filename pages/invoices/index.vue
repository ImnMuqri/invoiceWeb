<template>
  <div class="invoices-page">
    <div class="sm:flex sm:items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">
          Invoices
        </h1>
        <p class="mt-2 text-sm text-slate-500 font-medium">
          A list of all the invoices including their status, client, and amount.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-4">
        <!-- Search Input -->
        <div class="relative rounded-md shadow-sm w-full sm:w-64">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              class="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            class="block w-full rounded-md border-0 py-2 pl-9 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-950 sm:text-sm sm:leading-6"
            placeholder="Search invoices..." />
        </div>
        <NuxtLink
          to="/invoices/create"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors whitespace-nowrap"
          >Create Invoice</NuxtLink
        >
      </div>
    </div>

    <UiTable
      :loading="invoiceStore.loading"
      :is-empty="filteredInvoices.length === 0"
      :column-count="8">
      <template #header>
        <th
          scope="col"
          class="py-4 pl-6 pr-3 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Invoice ID
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Client
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Amount
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Status
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap">
          Late Risk
          <svg
            class="w-3 h-3 inline-block ml-1 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Date
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          WhatsApp
        </th>
        <th scope="col" class="relative py-4 pl-3 pr-6">
          <span class="sr-only">Actions</span>
        </th>
      </template>

      <tr
        v-for="invoice in filteredInvoices"
        :key="invoice?.id || Math.random()"
        class="hover:bg-slate-50 transition-colors">
        <td
          class="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-slate-900">
          INVM - {{ invoice?.id || "N/A" }}
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">
          {{ invoice?.client?.name || invoice?.client || "Untitled" }}
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-900">
          ${{ invoice?.amount?.toLocaleString() || "0" }}
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm">
          <span
            v-if="invoice?.status === 'Paid'"
            class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100"
            >Paid</span
          >
          <span
            v-else-if="invoice?.status === 'Overdue'"
            class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 border border-red-100"
            >Overdue</span
          >
          <span
            v-else
            class="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-100"
            >Pending</span
          >
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm">
          <div
            v-if="invoice?.status !== 'Paid'"
            class="flex items-center gap-1.5"
            :class="
              invoice?.latePrediction === 'High'
                ? 'text-red-600'
                : invoice?.latePrediction === 'Medium'
                  ? 'text-amber-500'
                  : 'text-emerald-600'
            ">
            <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
            <span class="font-semibold text-xs">{{
              invoice?.latePrediction || "Unknown"
            }}</span>
          </div>
          <span v-else class="text-slate-400 font-medium text-xs">-</span>
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          {{ formatDate(invoice?.date) }}
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm">
          <span
            v-if="invoice?.whatsappStatus === 'Sent'"
            class="inline-flex items-center text-emerald-600 font-medium text-xs">
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"></path>
            </svg>
            Sent
          </span>
          <span
            v-else-if="invoice?.whatsappStatus === 'Sending...'"
            class="inline-flex items-center text-amber-500 font-medium text-xs">
            <svg
              class="w-4 h-4 mr-1 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Sending...
          </span>
          <span v-else class="text-slate-400 font-medium text-xs">-</span>
        </td>
        <td
          class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-semibold flex items-center justify-end gap-3 h-full">
          <div class="flex items-center justify-end gap-2">
            <button
              v-if="invoice?.status !== 'Paid'"
              @click="openWhatsAppModal(invoice)"
              class="p-2 text-slate-400 hover:text-[#25D366] hover:bg-emerald-50 rounded-lg transition-all"
              title="Send WhatsApp Reminder">
              <UiIcon icon="simple-icons:whatsapp" custom-class="w-4 h-4" />
            </button>
            <NuxtLink
              v-if="invoice?.id"
              :to="`/pay/${invoice.id}`"
              target="_blank"
              class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="View Public Invoice">
              <UiIcon
                icon="heroicons:arrow-top-right-on-square"
                custom-class="w-4 h-4" />
            </NuxtLink>
            <NuxtLink
              v-if="invoice?.id"
              :to="`/invoices/edit/${invoice.id}`"
              class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit Invoice">
              <UiIcon icon="heroicons:pencil-square" custom-class="w-4 h-4" />
            </NuxtLink>
            <button
              @click="openDeleteModal(invoice)"
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete Invoice">
              <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    </UiTable>

    <!-- Toast Notification -->
    <UiToast v-model="toast" />

    <!-- Delete Confirmation Modal -->
    <UiModal v-model="isDeleteModalOpen" maxWidth="md">
      <div class="p-6">
        <div
          class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <UiIcon icon="heroicons:trash" class="w-6 h-6 text-red-600" />
        </div>
        <div class="text-center">
          <h3 class="text-lg font-semibold text-slate-900">Delete Invoice?</h3>
          <p class="mt-2 text-sm text-slate-500">
            Are you sure you want to delete invoice
            <span class="font-semibold text-slate-900"
              >INVM-{{ invoiceToDelete?.id }}</span
            >? This action cannot be undone.
          </p>
        </div>
        <div class="mt-6 flex flex-col gap-3">
          <button
            @click="confirmDelete"
            :disabled="isDeleting"
            class="w-full inline-flex justify-center items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 transition-colors">
            <UiIcon
              v-if="isDeleting"
              icon="heroicons:arrow-path"
              class="w-4 h-4 mr-2 animate-spin" />
            {{ isDeleting ? "Deleting..." : "Yes, Delete Invoice" }}
          </button>
          <button
            @click="isDeleteModalOpen = false"
            class="w-full inline-flex justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </UiModal>

    <!-- WhatsApp Sandbox Modal -->
    <div v-if="showModal" class="relative z-50">
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        @click="closeModal"></div>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            class="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-slate-200">
            <div>
              <div
                class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  class="h-6 w-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div class="mt-3 sm:mt-5">
                <h3
                  class="text-lg font-semibold leading-6 text-slate-900 text-center">
                  Send WhatsApp Auto-Chaser
                </h3>
                <div class="mt-2 text-center text-sm text-slate-500 mb-6">
                  Review the drafted message before the AI sends it to
                  <span class="font-semibold text-slate-800">{{
                    selectedInvoice?.client?.name ||
                    selectedInvoice?.client ||
                    "Untitled"
                  }}</span
                  >.
                </div>

                <div
                  class="bg-[#f0f2f5] rounded-xl p-4 relative mb-6 border border-[#e5e5e5]">
                  <!-- WhatsApp Tail -->
                  <div
                    class="absolute -left-2 top-4 w-4 h-4 bg-[#f0f2f5] rotate-45 border-l border-b border-[#e5e5e5]"></div>
                  <p
                    class="text-[15px] text-slate-800 leading-relaxed font-sans relative z-10 whitespace-pre-wrap">
                    {{ previewMessage }}
                  </p>
                  <div
                    class="mt-2 text-right text-[11px] font-medium text-slate-400">
                    {{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </div>
                </div>

              </div>
            </div>
            <div
              class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                @click="confirmSend"
                type="button"
                class="inline-flex w-full justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:col-start-2 transition-colors">
                Confirm & Send
              </button>
              <button
                @click="closeModal"
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:col-start-1 sm:mt-0 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useAuthStore } from "~/stores/authStore";
import { formatDate } from "~/utils/date";
const invoiceStore = useInvoiceStore();
const authStore = useAuthStore();


onMounted(() => {
  invoiceStore.fetchInvoices();
});

const emit = defineEmits(["invoice-updated"]);

const searchQuery = ref("");

const filteredInvoices = computed(() => {
  const allInvoices = invoiceStore.invoices || [];
  if (!searchQuery.value) return allInvoices;

  const query = searchQuery.value.toLowerCase().trim();
  return allInvoices.filter((invoice) => {
    if (!invoice) return false;

    const clientId = String(invoice.id || "").toLowerCase();
    const clientName = (
      invoice.client?.name ||
      invoice.client ||
      ""
    ).toLowerCase();
    const status = (invoice.status || "").toLowerCase();

    return (
      clientId.includes(query) ||
      clientName.includes(query) ||
      status.includes(query)
    );
  });
});

const isDeleteModalOpen = ref(false);
const invoiceToDelete = ref(null);
const isDeleting = ref(false);
const toast = ref({ message: "", type: "success" });

const openDeleteModal = (invoice) => {
  invoiceToDelete.value = invoice;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!invoiceToDelete.value) return;

  isDeleting.value = true;
  try {
    await invoiceStore.deleteInvoice(invoiceToDelete.value.id);
    isDeleteModalOpen.value = false;
    toast.value = { message: "Invoice deleted successfully", type: "success" };
  } catch (err) {
    console.error("Failed to delete invoice:", err);
    toast.value = {
      message:
        err.response?.data?.message ||
        "Failed to delete invoice. Please try again.",
      type: "error",
    };
  } finally {
    isDeleting.value = false;
    invoiceToDelete.value = null;
  }
};

const showModal = ref(false);
const selectedInvoice = ref(null);

const openWhatsAppModal = (invoice) => {
  selectedInvoice.value = invoice;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    selectedInvoice.value = null;
  }, 200);
};

const previewMessage = computed(() => {
  if (!selectedInvoice.value) return "";
  const template =
    authStore.user?.whatsappReminderTemplate ||
    "Hi boss! Just a gentle reminder regarding invoice {{invoiceNumber}} for {{currency}} {{totalAmount}}. We noted there is an outstanding amount and wanted to provide an easy payment option via our secure FPX / DuitNow gateway: {{invoiceUrl}}\n\nLet us know if you have any questions. Thank you for your business! 🙏";

  const frontendUrl = "https://pay.invokita.my"; // Or use runtime config

  return template
    .replace(/{{userName}}/g, authStore.user?.name || "")
    .replace(/{{companyName}}/g, authStore.user?.companyName || "InvoKita User")
    .replace(
      /{{clientName}}/g,
      selectedInvoice.value.client?.name ||
        selectedInvoice.value.client ||
        "Valued Client",
    )
    .replace(/{{invoiceNumber}}/g, selectedInvoice.value.id || "N/A")
    .replace(
      /{{totalAmount}}/g,
      selectedInvoice.value.amount?.toLocaleString() || "0",
    )
    .replace(/{{currency}}/g, selectedInvoice.value.currency || "$")
    .replace(
      /{{invoiceUrl}}/g,
      `${frontendUrl}/pay/${selectedInvoice.value.id}`,
    )
    .replace(/{{dueDate}}/g, formatDate(selectedInvoice.value.dueDate));
});


const confirmSend = () => {
  if (selectedInvoice.value) {
    invoiceStore.sendWhatsAppReminder(selectedInvoice.value.id);
  }
  closeModal();
};
</script>

<style scoped></style>
