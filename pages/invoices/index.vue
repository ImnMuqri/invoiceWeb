<template>
  <div class="invoices-page">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
          Invoices
        </h2>
        <p class="text-xs font-medium text-slate-500 mt-1">
          Manage and track your client billings.
        </p>
      </div>
        <div class="flex items-center gap-3">
        <button
          @click="uiStore.openModuleHelp('invoices')"
            class="text-slate-400 hover:text-blue-600 transition-colors p-1"
            title="Invoices Help">
            <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
          </button>
          <NuxtLink
            v-if="systemStore.isInvoiceCreationEnabled"
            to="/invoices/create"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors whitespace-nowrap"
            >Create Invoice</NuxtLink
          >
          <button
            v-else
            disabled
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-200 px-6 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed shadow-sm transition-colors whitespace-nowrap"
            title="Invoice creation is temporarily disabled by admin">
            Create Invoice
          </button>
        </div>
    </div>

    <UiTable
      :loading="invoiceStore.loading"
      :is-empty="filteredInvoices.length === 0"
      :column-count="10"
      show-refresh
      @refresh="invoiceStore.fetchInvoices()">
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
          Issued Date
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap">
          Due Date
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap">
          Email Sent
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap">
          WhatsApp Sent
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap">
          <div class="flex items-center gap-1.5">
            Late Risk
            <div class="group relative">
              <!-- AI Thunder Icon as Tooltip Trigger -->
              <svg
                class="w-3.5 h-3.5 text-emerald-600 cursor-help hover:text-emerald-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>

              <!-- Premium Tooltip -->
              <div
                class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[60] -translate-y-1 group-hover:translate-y-0 text-left normal-case tracking-normal">
                <p
                  class="font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
                  Predictive Analysis
                </p>
                <div class="leading-relaxed text-slate-200">
                  <p class="whitespace-pre-wrap mb-1">
                    This predicts the likelihood of late payment based on this
                    client's historical behavior (**Average Delay Days**).
                  </p>
                  <span class="font-bold text-green-400">Low</span>: &lt; 3 days
                  delay.<br />
                  <span class="font-bold text-yellow-500">Medium</span>: 4-10
                  days delay.<br />
                  <span class="font-bold text-red-500">High</span>: &gt; 10 days
                  delay.
                </div>
                <!-- Arrow pointing up -->
                <div
                  class="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
              </div>
            </div>
          </div>
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
          {{ invoice?.invoiceNumber || invoice?.id || "N/A" }}
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
            v-else-if="invoice?.status === 'Cancelled'"
            class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-200"
            >Cancelled</span
          >
          <span
            v-else
            class="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-100"
            >Pending</span
          >
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          {{ formatDate(invoice?.date) }}
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          {{ formatDate(invoice?.dueDate) }}
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          {{ invoice?.emailLastSent ? formatDate(invoice.emailLastSent) : "-" }}
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          {{
            invoice?.whatsappLastSent
              ? formatDate(invoice.whatsappLastSent)
              : "-"
          }}
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm">
          <div
            v-if="invoice?.status !== 'Paid'"
            class="flex items-center gap-1.5"
            :class="
              getLateRisk(invoice) === 'High'
                ? 'text-red-600'
                : getLateRisk(invoice) === 'Medium'
                  ? 'text-amber-500'
                  : 'text-emerald-600'
            ">
            <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
            <span class="font-semibold text-xs">{{
              getLateRisk(invoice)
            }}</span>
          </div>
          <span
            v-else
            class="text-emerald-600 font-bold text-[10px] flex items-center gap-1 capitalize tracking-tight">
            <UiIcon
              icon="heroicons:check-circle"
              custom-class="w-4 h-4 text-emerald-600" />
          </span>
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

          <!-- Quick Status Update Popover -->
          <UiPopover placement="bottom-end">
            <template #trigger>
              <button
                :disabled="
                  invoice?.status === 'Paid' ||
                  invoice?.status === 'Cancelled' ||
                  loadingInvoices[invoice.id]
                "
                class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                :title="
                  invoice?.status === 'Paid' || invoice?.status === 'Cancelled'
                    ? `Locked: ${invoice.status}`
                    : 'Update Status'
                ">
                <UiIcon
                  v-if="loadingInvoices[invoice.id] === 'status'"
                  icon="heroicons:arrow-path"
                  custom-class="w-4 h-4 animate-spin text-emerald-600" />
                <UiIcon
                  v-else
                  icon="heroicons:check-badge"
                  custom-class="w-4 h-4" />
              </button>
            </template>

            <template #default="{ close }">
              <div class="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >Update Status</span
                >
              </div>
              <div class="p-1 min-w-[160px]">
                <button
                  v-if="invoice?.status !== 'Paid'"
                  @click="updateStatus(invoice, 'Paid')"
                  :disabled="loadingInvoices[invoice.id]"
                  class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all text-left disabled:opacity-50">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Mark as Paid
                  </div>
                  <UiIcon
                    v-if="loadingInvoices[invoice.id] === 'Paid'"
                    icon="heroicons:arrow-path"
                    custom-class="w-3 h-3 animate-spin text-emerald-600" />
                </button>
                <button
                  v-if="invoice?.status !== 'Overdue'"
                  @click="updateStatus(invoice, 'Overdue')"
                  :disabled="loadingInvoices[invoice.id]"
                  class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all text-left disabled:opacity-50">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    Mark as Overdue
                  </div>
                  <UiIcon
                    v-if="loadingInvoices[invoice.id] === 'Overdue'"
                    icon="heroicons:arrow-path"
                    custom-class="w-3 h-3 animate-spin text-red-600" />
                </button>
                <button
                  v-if="invoice?.status !== 'Pending'"
                  @click="updateStatus(invoice, 'Pending')"
                  :disabled="loadingInvoices[invoice.id]"
                  class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all text-left disabled:opacity-50">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    Mark as Pending
                  </div>
                  <UiIcon
                    v-if="loadingInvoices[invoice.id] === 'Pending'"
                    icon="heroicons:arrow-path"
                    custom-class="w-3 h-3 animate-spin text-amber-600" />
                </button>
                <div
                  v-if="invoice?.status !== 'Cancelled'"
                  class="h-px bg-slate-100 my-1 mx-2"></div>
                <button
                  v-if="invoice?.status !== 'Cancelled'"
                  @click="updateStatus(invoice, 'Cancelled')"
                  :disabled="loadingInvoices[invoice.id]"
                  class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all text-left disabled:opacity-50">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    Cancelled
                  </div>
                  <UiIcon
                    v-if="loadingInvoices[invoice.id] === 'Cancelled'"
                    icon="heroicons:arrow-path"
                    custom-class="w-3 h-3 animate-spin text-slate-600" />
                </button>
              </div>
            </template>
          </UiPopover>

          <!-- Popover for other actions -->
          <UiPopover placement="bottom-end">
            <template #trigger>
              <button
                :disabled="loadingInvoices[invoice.id]"
                class="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30"
                title="More Actions">
                <UiIcon
                  v-if="
                    ['email', 'reminder', 'whatsapp', 'waReminder'].includes(
                      loadingInvoices[invoice.id],
                    )
                  "
                  icon="heroicons:arrow-path"
                  custom-class="w-5 h-5 animate-spin text-slate-600" />
                <UiIcon
                  v-else
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
                  @click="handleSendAction(invoice, 'email', false)"
                  :disabled="
                    invoice?.status === 'Paid' || !systemStore.isEmailEnabled || loadingInvoices[invoice.id]
                  "
                  class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="!systemStore.isEmailEnabled ? 'Email is temporarily disabled by admin' : ''">
                  <div class="flex items-center gap-2">
                    <UiIcon icon="heroicons:envelope" custom-class="w-4 h-4" />
                    Send Email
                  </div>
                  <UiIcon
                    v-if="loadingInvoices[invoice.id] === 'email'"
                    icon="heroicons:arrow-path"
                    custom-class="w-3 h-3 animate-spin text-green-600" />
                </button>
                <button
                  @click="handleSendAction(invoice, 'email', true)"
                  :disabled="
                    invoice?.status === 'Paid' || !systemStore.isEmailEnabled || loadingInvoices[invoice.id]
                  "
                  class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="!systemStore.isEmailEnabled ? 'Email is temporarily disabled by admin' : ''">
                  <div class="flex items-center gap-2">
                    <UiIcon icon="heroicons:bell" custom-class="w-4 h-4" />
                    Send Reminder Email
                  </div>
                  <UiIcon
                    v-if="loadingInvoices[invoice.id] === 'reminder'"
                    icon="heroicons:arrow-path"
                    custom-class="w-3 h-3 animate-spin text-green-600" />
                </button>
                <div class="h-px bg-slate-100 my-1 mx-2"></div>
                <button
                  v-if="authStore.user?.plan !== 'FREE'"
                  @click="handleSendAction(invoice, 'whatsapp', false)"
                  :disabled="
                    invoice?.status === 'Paid' || !systemStore.isWhatsappEnabled || loadingInvoices[invoice.id]
                  "
                  class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#25D366] hover:bg-emerald-50 rounded-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="!systemStore.isWhatsappEnabled ? 'WhatsApp is temporarily disabled by admin' : ''">
                  <div class="flex items-center gap-2">
                    <UiIcon
                      icon="simple-icons:whatsapp"
                      custom-class="w-4 h-4" />
                    Send WhatsApp
                  </div>
                  <UiIcon
                    v-if="loadingInvoices[invoice.id] === 'whatsapp'"
                    icon="heroicons:arrow-path"
                    custom-class="w-3 h-3 animate-spin text-[#25D366]" />
                </button>
                <button
                  v-if="authStore.user?.plan !== 'FREE'"
                  @click="handleSendAction(invoice, 'whatsapp', true)"
                  :disabled="
                    invoice?.status === 'Paid' || !systemStore.isWhatsappEnabled || loadingInvoices[invoice.id]
                  "
                  class="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#25D366] hover:bg-emerald-50 rounded-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="!systemStore.isWhatsappEnabled ? 'WhatsApp is temporarily disabled by admin' : ''">
                  <div class="flex items-center gap-2">
                    <UiIcon
                      icon="heroicons:chat-bubble-left-right"
                      custom-class="w-4 h-4" />
                    Send Reminder WA
                  </div>
                  <UiIcon
                    v-if="loadingInvoices[invoice.id] === 'waReminder'"
                    icon="heroicons:arrow-path"
                    custom-class="w-3 h-3 animate-spin text-[#25D366]" />
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
    <UiModal
      v-model="isDeleteModalOpen"
      maxWidth="md"
      title="Delete Invoice?"
      description="Are you sure you want to delete this invoice? This action cannot be undone.">
      <div class="p-6">
        <div
          class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <UiIcon icon="heroicons:trash" class="w-6 h-6 text-red-600" />
        </div>
        <div class="text-center">
          <p class="mt-2 text-sm text-slate-500">
            Are you sure you want to delete invoice
            <span class="font-semibold text-slate-900">{{
              invoiceToDelete?.invoiceNumber || invoiceToDelete?.id
            }}</span
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
import { useUiStore } from "~/stores/uiStore";
import { useSystemStore } from "~/stores/systemStore";
import { formatDate } from "~/utils/date";

const invoiceStore = useInvoiceStore();
const authStore = useAuthStore();
const uiStore = useUiStore();
const systemStore = useSystemStore();

const getLateRisk = (invoice) => {
  // Use existing prediction if available
  if (invoice?.latePrediction) return invoice.latePrediction;

  // Fallback calculation based on client average delay if missing
  const delay = invoice?.client?.averageDelayDays || 0;
  if (delay > 10) return "High";
  if (delay > 3) return "Medium";
  return "Low";
};

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

const loadingInvoices = reactive({});

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

const updateStatus = async (invoice, newStatus) => {
  loadingInvoices[invoice.id] = newStatus; // Use status name as loading state for specific button
  try {
    const res = await invoiceStore.updateInvoice(
      invoice.id,
      {
        status: newStatus,
      },
      true, // isLocal = true
    );
    toast.value = {
      message: res?.message || `Invoice marked as ${newStatus}`,
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Failed to update status",
      type: "error",
    };
  } finally {
    delete loadingInvoices[invoice.id];
  }
};

const handleSendAction = async (invoice, method, isReminder) => {
  const actionType =
    method === "whatsapp"
      ? isReminder
        ? "waReminder"
        : "whatsapp"
      : isReminder
        ? "reminder"
        : "email";
  loadingInvoices[invoice.id] = actionType;
  try {
    const res = await invoiceStore.sendInvoice(
      invoice.id,
      method,
      null,
      isReminder,
      true, // isLocal = true
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
  } finally {
    delete loadingInvoices[invoice.id];
  }
};
</script>

<style scoped></style>
