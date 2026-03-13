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
          {{ invoice?.currency === "MYR" ? "RM" : "$"
          }}{{ invoice?.amount?.toLocaleString() || "0" }}
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
            <UiIcon
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 mr-1 animate-spin text-amber-500" />
            Sending...
          </span>
          <span v-else class="text-slate-400 font-medium text-xs">-</span>
        </td>
        <td
          class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-semibold flex items-center justify-end gap-1.5 h-full">
          <!-- Always visible: Public Preview -->
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

          <!-- Popover for other actions -->
          <UiPopover placement="bottom-end">
            <template #trigger>
              <button
                class="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                title="More Actions">
                <UiIcon
                  icon="heroicons:ellipsis-horizontal"
                  custom-class="w-5 h-5" />
              </button>
            </template>

            <template #default="{ close }">
              <!-- Actions Group: Communications -->
              <div class="px-2 py-1.5 border-b border-slate-100 bg-slate-50/50">
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >Communications</span
                >
              </div>

              <div class="p-1">
                <button
                  @click="
                    close();
                    handleSendAction(invoice, 'email', false);
                  "
                  :disabled="invoice?.status === 'Paid'"
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed">
                  <UiIcon icon="heroicons:envelope" custom-class="w-4 h-4" />
                  Send Email
                </button>
                <button
                  @click="
                    close();
                    handleSendAction(invoice, 'email', true);
                  "
                  :disabled="invoice?.status === 'Paid'"
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed">
                  <UiIcon icon="heroicons:bell" custom-class="w-4 h-4" />
                  Send Reminder Email
                </button>
                <div class="h-px bg-slate-100 my-1 mx-2"></div>
                <button
                  v-if="authStore.user?.plan !== 'FREE'"
                  @click="
                    close();
                    handleSendAction(invoice, 'whatsapp', false);
                  "
                  :disabled="invoice?.status === 'Paid'"
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#25D366] hover:bg-emerald-50 rounded-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed">
                  <UiIcon icon="simple-icons:whatsapp" custom-class="w-4 h-4" />
                  Send WhatsApp
                </button>
                <button
                  v-if="authStore.user?.plan !== 'FREE'"
                  @click="
                    close();
                    handleSendAction(invoice, 'whatsapp', true);
                  "
                  :disabled="invoice?.status === 'Paid'"
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#25D366] hover:bg-emerald-50 rounded-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed">
                  <UiIcon
                    icon="heroicons:chat-bubble-left-right"
                    custom-class="w-4 h-4" />
                  Send Reminder WA
                </button>
              </div>

              <!-- Actions Group: Management -->
              <div
                class="px-2 py-1.5 border-t border-b border-slate-100 bg-slate-50/50">
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >Management</span
                >
              </div>

              <div class="p-1">
                <NuxtLink
                  v-if="invoice?.id"
                  :to="`/invoices/edit/${invoice.id}`"
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                  <UiIcon
                    icon="heroicons:pencil-square"
                    custom-class="w-4 h-4" />
                  Edit Invoice
                </NuxtLink>

                <button
                  @click="
                    close();
                    openDeleteModal(invoice);
                  "
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all text-left">
                  <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                  Delete Invoice
                </button>
              </div>
            </template>
          </UiPopover>
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
              custom-class="w-4 h-4 mr-2 animate-spin text-white" />
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useAuthStore } from "~/stores/authStore";
import { formatDate } from "~/utils/date";
const invoiceStore = useInvoiceStore();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    await invoiceStore.fetchInvoices();
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Failed to fetch invoices",
      type: "error",
    };
  }
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
    const res = await invoiceStore.deleteInvoice(invoiceToDelete.value.id);
    isDeleteModalOpen.value = false;
    toast.value = {
      message: res?.message || "Invoice deleted successfully",
      type: "success",
    };
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

const handleSendAction = async (invoice, method, isReminder) => {
  try {
    const res = await invoiceStore.sendInvoice(
      invoice.id,
      method,
      null,
      isReminder,
    );
    if (method === "whatsapp" && res.waLink) {
      window.open(res.waLink, "_blank");
      toast.value = { message: "WhatsApp message prepared!", type: "success" };
    } else {
      toast.value = {
        message: res.message || "Message sent successfully!",
        type: "success",
      };
    }
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || err.message,
      type: "error",
    };
  }
};
</script>

<style scoped></style>
