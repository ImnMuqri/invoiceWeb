<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Clients</h2>
        <p class="text-xs font-medium text-slate-500 mt-1">Manage your client list and billing details.</p>
      </div>
      <div class="flex items-center gap-4">
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
            placeholder="Search clients..." />
        </div>
        <button
          @click="openAddModal"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors whitespace-nowrap">
          Add Client
        </button>
      </div>
    </div>

    <UiTable
      :loading="clientStore.loading"
      :is-empty="filteredClients.length === 0"
      :column-count="9">
      <template #header>
        <th
          scope="col"
          class="py-4 pl-6 pr-3 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Name
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Email
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Company
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold whitespace-nowrap text-slate-400 tracking-wider uppercase">
          Risk Score
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
          Whatsapp Chaser
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Email Chaser
        </th>

        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Address
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Avg Delay
        </th>
        <th scope="col" class="relative py-4 pl-3 pr-6">
          <span class="sr-only">Actions</span>
        </th>
      </template>

      <tr
        v-for="client in filteredClients"
        :key="client.id"
        class="hover:bg-slate-50 transition-colors">
        <td
          class="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-slate-900">
          {{ client.name }}
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-500">
          {{ client.email }}
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">
          {{ client.company }}
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold">
          <div class="flex items-center gap-2">
            <div class="w-10 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                class="h-1.5 rounded-full"
                :class="
                  client.riskScore > 60
                    ? 'bg-red-500'
                    : client.riskScore > 30
                      ? 'bg-amber-400'
                      : 'bg-emerald-600'
                "
                :style="`width: ${client.riskScore}%`"></div>
            </div>
            <span
              :class="
                client.riskScore > 60
                  ? 'text-red-700'
                  : client.riskScore > 30
                    ? 'text-amber-600'
                    : 'text-emerald-700'
              "
              >{{ client.riskScore }}/100</span
            >
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold relative">
          <div class="flex items-center gap-2">
            <!-- Whatsapp Chaser -->
            <label
              class="relative inline-flex items-center cursor-pointer"
              :class="{ 'opacity-50 pointer-events-none': !authStore.isPro }"
              title="Whatsapp Chaser">
              <input
                type="checkbox"
                disabled
                :checked="client.autoChaser"
                class="sr-only peer" />
              <div
                class="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
            </label>
            <UiIcon
              v-if="!authStore.isPro"
              icon="heroicons:lock-closed"
              class="w-3 h-3 text-slate-400" />
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold relative">
          <div class="flex items-center gap-2">
            <!-- Email Chaser -->
            <label
              class="relative inline-flex items-center cursor-pointer"
              :class="{ 'opacity-50 pointer-events-none': !authStore.isPro }"
              title="Email Chaser">
              <input
                type="checkbox"
                disabled
                :checked="client.autoEmailChaser"
                class="sr-only peer" />
              <div
                class="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
            </label>
            <UiIcon
              v-if="!authStore.isPro"
              icon="heroicons:lock-closed"
              class="w-3 h-3 text-slate-400" />
          </div>
        </td>

        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-500 truncate max-w-[150px]"
          :title="client.address">
          {{ client.address || "-" }}
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">
          {{ client.averageDelayDays }} days
        </td>
        <td
          class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-semibold">
          <div class="flex items-center justify-end gap-2">
            <button
              @click="openEditModal(client)"
              class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit Client">
              <UiIcon icon="heroicons:pencil-square" class="w-4 h-4" />
            </button>
            <button
              @click="openDeleteModal(client)"
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete Client">
              <UiIcon icon="heroicons:trash" class="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    </UiTable>

    <!-- Add/Edit Client Modal -->
    <div
      v-if="showModal"
      class="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true">
      <div
        class="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity backdrop-blur-sm"></div>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            class="relative transform overflow-hidden rounded-xl bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8 border border-slate-200">
            <div>
              <div class="mt-3 text-center sm:mt-5">
                <h3
                  class="text-xl font-semibold leading-6 text-slate-900 tracking-tight"
                  id="modal-title">
                  {{ isEditMode ? "Edit Client" : "Add New Client" }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-slate-500">
                    {{
                      isEditMode
                        ? "Update the client information below."
                        : "Fill in the information below to add a new client to your system."
                    }}
                  </p>
                </div>
              </div>
            </div>
            <form
              @submit.prevent="submitClient"
              class="mt-6 space-y-5 text-left">
              <div>
                <label
                  for="name"
                  class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                  >Name</label
                >
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  required
                  class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white"
                  placeholder="e.g. John Doe" />
              </div>
              <div>
                <label
                  for="email"
                  class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                  >Email</label
                >
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  required
                  class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white"
                  placeholder="john@example.com" />
              </div>
              <div>
                <label
                  for="phone"
                  class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                  >Phone</label
                >
                <input
                  type="text"
                  id="phone"
                  v-model="form.phone"
                  class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white"
                  placeholder="e.g. +60123456789" />
              </div>
              <div>
                <label
                  for="company"
                  class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                  >Company</label
                >
                <input
                  type="text"
                  id="company"
                  v-model="form.company"
                  class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white"
                  placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label
                  for="address"
                  class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                  >Address</label
                >
                <textarea
                  id="address"
                  v-model="form.address"
                  rows="3"
                  class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white"
                  placeholder="Enter client address"></textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 relative overflow-hidden group">
                  <label
                    class="relative inline-flex items-center cursor-pointer"
                    :class="{
                      'opacity-50 cursor-not-allowed': !authStore.isPro,
                    }">
                    <input
                      type="checkbox"
                      v-model="form.autoChaser"
                      :disabled="!authStore.isPro"
                      class="sr-only peer" />
                    <div
                      class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-semibold text-slate-700 uppercase tracking-tight"
                      >Whatsapp Chaser</span
                    >
                    <UiIcon
                      v-if="!authStore.isPro"
                      icon="heroicons:lock-closed"
                      class="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                <div
                  class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 relative overflow-hidden group">
                  <label
                    class="relative inline-flex items-center cursor-pointer"
                    :class="{
                      'opacity-50 cursor-not-allowed': !authStore.isPro,
                    }">
                    <input
                      type="checkbox"
                      v-model="form.autoEmailChaser"
                      :disabled="!authStore.isPro"
                      class="sr-only peer" />
                    <div
                      class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-semibold text-slate-700 uppercase tracking-tight"
                      >Email Chaser</span
                    >
                    <UiIcon
                      v-if="!authStore.isPro"
                      icon="heroicons:lock-closed"
                      class="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>
              <div class="mt-8 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-4">
                <button
                  type="submit"
                  :disabled="isSaving"
                  class="inline-flex w-full justify-center items-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-colors disabled:opacity-50">
                  <UiIcon
                    v-if="isSaving"
                    icon="heroicons:arrow-path"
                    custom-class="w-4 h-4 mr-2 animate-spin text-white" />
                  {{
                    isEditMode
                      ? isSaving
                        ? "Updating..."
                        : "Update Client"
                      : isSaving
                        ? "Adding..."
                        : "Add Client"
                  }}
                </button>
                <button
                  type="button"
                  @click="showModal = false"
                  :disabled="isSaving"
                  class="mt-3 inline-flex w-full justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 sm:mt-0 transition-colors disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

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
          <h3 class="text-lg font-semibold text-slate-900">Delete Client?</h3>
          <p class="mt-2 text-sm text-slate-500">
            Are you sure you want to delete client
            <span class="font-semibold text-slate-900">{{
              clientToDelete?.name
            }}</span
            >? This will also affect their associated invoices. This action
            cannot be undone.
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
            {{ isDeleting ? "Deleting..." : "Yes, Delete Client" }}
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
import { ref, computed, onMounted } from "vue";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";

const clientStore = useClientStore();
const authStore = useAuthStore();
const uiStore = useUiStore();

onMounted(() => {
  clientStore.fetchClients();
});

const showModal = ref(false);
const isEditMode = ref(false);
const editingClientId = ref(null);
const searchQuery = ref("");
const form = ref({
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  autoChaser: false,
  autoEmailChaser: false,
});

const isDeleteModalOpen = ref(false);
const clientToDelete = ref(null);
const isDeleting = ref(false);
const isSaving = ref(false);
const toast = ref({ message: "", type: "success" });

const openAddModal = () => {
  isEditMode.value = false;
  editingClientId.value = null;
  form.value = {
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    autoChaser: false,
    autoEmailChaser: false,
  };
  showModal.value = true;
};

const openEditModal = (client) => {
  isEditMode.value = true;
  editingClientId.value = client.id;
  form.value = { ...client };
  showModal.value = true;
};

const openDeleteModal = (client) => {
  clientToDelete.value = client;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!clientToDelete.value) return;

  isDeleting.value = true;
  try {
    const res = await clientStore.deleteClient(clientToDelete.value.id);
    isDeleteModalOpen.value = false;
    toast.value = {
      message: res?.message || "Client deleted successfully",
      type: "success",
    };
  } catch (err) {

    toast.value = {
      message: err.response?.data?.message || "Failed to delete client.",
      type: "error",
    };
  } finally {
    isDeleting.value = false;
    clientToDelete.value = null;
  }
};

const filteredClients = computed(() => {
  if (!searchQuery.value) return clientStore.clients;

  const query = searchQuery.value.toLowerCase();
  return clientStore.clients.filter((client) => {
    return (
      (client.name && client.name.toLowerCase().includes(query)) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.company && client.company.toLowerCase().includes(query)) ||
      (client.address && client.address.toLowerCase().includes(query))
    );
  });
});

const submitClient = async () => {
  if (!form.value.name || !form.value.email) {
    toast.value = {
      message: "Name and Email are required",
      type: "error",
    };
    return;
  }
  isSaving.value = true;
  try {
    if (isEditMode.value) {
      const res = await clientStore.updateClient(editingClientId.value, {
        ...form.value,
      });

      toast.value = {
        message: res?.message || "Client updated successfully",
        type: "success",
      };
    } else {
      const res = await clientStore.addClient({ ...form.value });
      toast.value = {
        message: res?.message || "Client added successfully",
        type: "success",
      };
    }
    form.value = {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      autoChaser: false,
      autoEmailChaser: false,
    };
    showModal.value = false;
  } catch (err) {

    toast.value = {
      message: err.response?.data?.message || "Failed to save client.",
      type: "error",
    };
  } finally {
    isSaving.value = false;
  }
};
const toggleChaser = async (client, field) => {
  try {
    const newValue = !client[field];
    const res = await clientStore.updateClient(client.id, {
      [field]: newValue,
    });
    toast.value = {
      message: res?.message || "Chaser setting updated",
      type: "success",
    };
  } catch (err) {

    toast.value = {
      message:
        err.response?.data?.message || "Failed to update Chaser setting.",
      type: "error",
    };
  }
};
</script>

<style scoped></style>
