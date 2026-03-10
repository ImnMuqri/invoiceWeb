<template>
  <div>
    <div class="sm:flex sm:items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">
          Clients
        </h1>
        <p class="mt-2 text-sm text-slate-500 font-medium">
          Manage your client list, their contact information, and billing
          details.
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
            class="block w-full rounded-md border-0 py-2 pl-9 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search clients..." />
        </div>
        <button
          @click="showAddModal = true"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors whitespace-nowrap">
          Add Client
        </button>
      </div>
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div
            class="overflow-hidden shadow-sm border border-slate-200 bg-white sm:rounded-xl">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
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
                      class="w-3 h-3 inline-block ml-1 text-indigo-400"
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
                    Auto-Chaser
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
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
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
                      <div
                        class="w-10 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          class="h-1.5 rounded-full"
                          :class="
                            client.riskScore > 60
                              ? 'bg-red-500'
                              : client.riskScore > 30
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
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
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold">
                    <label
                      class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="client.riskScore > 50"
                        class="sr-only peer" />
                      <div
                        class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
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
                    <button
                      class="text-indigo-600 hover:text-indigo-900 transition-colors">
                      Edit
                    </button>
                    <button
                      @click="clientStore.deleteClient(client.id)"
                      class="ml-4 text-slate-400 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredClients.length === 0">
                  <td
                    colspan="7"
                    class="py-12 text-center text-sm font-medium text-slate-500">
                    <span v-if="searchQuery"
                      >No clients found matching "{{ searchQuery }}".</span
                    >
                    <span v-else
                      >No clients found.
                      <button
                        @click="showAddModal = true"
                        class="text-indigo-600 hover:underline">
                        Add one</button
                      >.</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Client Modal -->
    <div
      v-if="showAddModal"
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
                  Add New Client
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-slate-500">
                    Fill in the information below to add a new client to your
                    system.
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
              <div class="mt-8 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-4">
                <button
                  type="submit"
                  class="inline-flex w-full justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-colors">
                  Add Client
                </button>
                <button
                  type="button"
                  @click="showAddModal = false"
                  class="mt-3 inline-flex w-full justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 sm:mt-0 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useClientStore } from "~/stores/clientStore";
const clientStore = useClientStore();

onMounted(() => {
  clientStore.fetchClients();
});

const showAddModal = ref(false);
const searchQuery = ref("");
const form = ref({ name: "", email: "", phone: "", company: "", address: "" });

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
  await clientStore.addClient({ ...form.value });
  form.value = { name: "", email: "", phone: "", company: "", address: "" };
  showAddModal.value = false;
};
</script>
