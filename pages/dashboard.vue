<template>
  <div class="max-w-7xl mx-auto font-sans pb-8">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p class="text-sm font-medium text-slate-500 mt-1">
          Here's your financial overview for today.
        </p>
      </div>
      <NuxtLink
        to="/invoices/create"
        class="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors">
        <svg
          class="-ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd" />
        </svg>
        New Invoice
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Revenue Card -->
      <div
        class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 shadow-sm hover:border-indigo-200 transition-colors">
        <dt class="text-sm font-semibold text-indigo-800 mb-1">
          Total Revenue
        </dt>
        <dd class="text-2xl font-semibold text-indigo-950 tracking-tight">
          {{ dashboardStore.stats.totalRevenue.toLocaleString() }} MYR
        </dd>
      </div>
      <!-- Outstanding Card -->
      <div
        class="bg-amber-50/50 border border-amber-100 rounded-xl p-6 shadow-sm hover:border-amber-200 transition-colors">
        <dt class="text-sm font-semibold text-amber-800 mb-1">
          Outstanding Invoices
        </dt>
        <dd class="text-2xl font-semibold text-amber-950 tracking-tight">
          {{ dashboardStore.stats.outstandingAmount.toLocaleString() }} MYR
        </dd>
      </div>
      <!-- Active Clients Card -->
      <div
        class="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6 shadow-sm hover:border-emerald-200 transition-colors">
        <dt class="text-sm font-semibold text-emerald-800 mb-1">
          Active Clients
        </dt>
        <dd class="text-2xl font-semibold text-emerald-950 tracking-tight">
          {{ dashboardStore.stats.activeClients }}
        </dd>
      </div>
      <!-- Overdue Card -->
      <div
        class="bg-rose-50/50 border border-rose-100 rounded-xl p-6 shadow-sm hover:border-rose-200 transition-colors">
        <dt class="text-sm font-semibold text-rose-800 mb-1">Overdue</dt>
        <dd class="text-2xl font-semibold text-rose-600 tracking-tight">
          {{ dashboardStore.stats.overdueCount }}
        </dd>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Left Column: Primary Data -->
      <div class="xl:col-span-2 flex flex-col gap-6">
        <!-- Smart Cashflow Forecast Card -->
        <div
          class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
              Smart Cashflow Forecast
            </h2>
            <select
              class="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-950 outline-none uppercase tracking-wider">
              <option>Next 30 Days</option>
              <option>Next 60 Days</option>
              <option>Next 90 Days</option>
            </select>
          </div>
          <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div class="w-full lg:w-1/3 space-y-6">
              <div
                class="p-4 rounded-lg bg-indigo-50 border border-indigo-100/50">
                <p class="text-sm font-semibold text-indigo-800 mb-1">
                  Expected Revenue
                </p>
                <p
                  class="text-3xl font-semibold text-indigo-950 tracking-tight">
                  {{ dashboardStore.stats.outstandingAmount.toLocaleString() }}
                  MYR
                </p>
              </div>
              <div
                class="p-4 rounded-lg bg-amber-50 border border-amber-100/50">
                <p
                  class="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-2">
                  At Risk / Delayed
                  <svg
                    class="w-4 h-4 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </p>
                <p class="text-xl font-semibold text-amber-700 tracking-tight">
                  {{
                    (
                      dashboardStore.stats.outstandingAmount * 0.1
                    ).toLocaleString()
                  }}
                  MYR
                </p>
              </div>
              <div class="px-2">
                <p class="text-sm font-semibold text-slate-500 mb-1">
                  Strong Predictability
                </p>
                <div class="w-full bg-slate-100 rounded-full h-2 mb-1">
                  <div
                    class="bg-emerald-500 h-2 rounded-full"
                    style="width: 85%"></div>
                </div>
                <p class="text-xs font-semibold text-emerald-600">
                  85% Confidence Score
                </p>
              </div>
            </div>
            <div
              class="flex-1 w-full h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-6 relative">
              <!-- Mock Chart Visual -->
              <div
                class="absolute inset-0 flex items-end justify-between px-8 py-6 opacity-40">
                <div
                  v-for="(record, idx) in (
                    dashboardStore.cashflow?.history || []
                  )
                    .slice(-3)
                    .concat(dashboardStore.cashflow?.forecast || [])
                    .slice(0, 3)"
                  :key="idx"
                  class="w-8 bg-indigo-400 rounded-t-sm"
                  :style="{
                    height:
                      Math.min(
                        90,
                        (record.amount /
                          (dashboardStore.stats.totalRevenue || 1)) *
                          100 +
                          20,
                      ) + '%',
                  }"></div>
              </div>
              <span
                class="text-sm font-semibold text-slate-500 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 shadow-sm"
                >AI Predictive Chart Visualization</span
              >
            </div>
          </div>
        </div>

        <!-- Client Profitability Insights -->
        <div
          class="bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col overflow-hidden">
          <div
            class="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                Client Profitability
              </h3>
              <p class="text-sm text-slate-500 font-medium mt-1">
                AI analysis ranking clients by effective margin.
              </p>
            </div>
            <select
              class="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-950 outline-none uppercase tracking-wider shadow-sm">
              <option>Top 5</option>
              <option>Bottom 5</option>
            </select>
          </div>
          <div class="flex-1 overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th
                    class="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th
                    class="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Avg Margin
                  </th>
                  <th
                    class="px-6 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Impact
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-100">
                <tr
                  v-for="client in dashboardStore.topClients"
                  :key="client.id"
                  class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="text-sm font-semibold text-slate-900">
                      {{ client.name }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm font-medium text-slate-600">
                    {{ client.totalRevenue.toLocaleString() }} MYR
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                      :class="
                        client.profitMargin > 20
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      "
                      >{{ client.profitMargin }}%</span
                    >
                  </td>
                  <td
                    class="px-6 py-4 text-right text-sm font-semibold"
                    :class="
                      client.profitMargin > 20
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    ">
                    {{ client.profitMargin > 20 ? "High" : "Low" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Secondary Widgets -->
      <div class="xl:col-span-1 flex flex-col gap-6">
        <!-- Smart Suggestions -->
        <div
          class="bg-indigo-50/30 shadow-sm rounded-xl border border-indigo-100 p-6 flex flex-col">
          <div class="flex items-center gap-2 mb-4">
            <div class="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
              AI Suggestions
            </h3>
          </div>
          <div class="space-y-3">
            <div
              class="p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors cursor-pointer">
              <div class="flex items-start gap-3">
                <div
                  class="mt-0.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                <div>
                  <p class="text-sm font-medium text-slate-900">
                    Send reminder to Stark Industries
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Invoice #INV-2023-002 is overdue by 14 days.
                  </p>
                </div>
              </div>
            </div>
            <div
              class="p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors cursor-pointer">
              <div class="flex items-start gap-3">
                <div
                  class="mt-0.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                <div>
                  <p class="text-sm font-medium text-slate-900">
                    Offer discount to Acme Corp
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Repeat client with perfect payment history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Invoices List -->
        <div
          class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col flex-1">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
              Recent Invoices
            </h2>
            <NuxtLink
              to="/invoices"
              class="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md transition-colors border border-slate-200"
              >View All</NuxtLink
            >
          </div>
          <ul role="list" class="divide-y divide-slate-100 flex-1">
            <li
              v-for="invoice in dashboardStore.recentInvoices"
              :key="invoice.id"
              class="py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group rounded-lg px-2 -mx-2">
              <div class="flex-shrink-0">
                <span
                  v-if="invoice.status === 'Paid'"
                  class="inline-flex items-center justify-center p-2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                <span
                  v-else-if="invoice.status === 'Overdue'"
                  class="inline-flex items-center justify-center p-2 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </span>
                <span
                  v-else
                  class="inline-flex items-center justify-center p-2 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900 truncate">
                  {{ invoice.client?.name || invoice.client }}
                </p>
                <div class="flex items-center gap-2 mt-0.5">
                  <p class="text-xs text-slate-500 font-medium">
                    {{ invoice.id }}
                  </p>
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded font-medium border"
                    :class="
                      invoice.status === 'Paid'
                        ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200'
                        : invoice.status === 'Overdue'
                          ? 'bg-rose-50/50 text-rose-700 border-rose-200'
                          : 'bg-amber-50/50 text-amber-800 border-amber-200'
                    ">
                    {{ invoice.status }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-slate-900">
                  {{
                    invoice.amount > 0 ? invoice.amount.toLocaleString() : "0"
                  }}
                  {{ invoice.currency }}
                </p>
              </div>
            </li>
            <li
              v-if="dashboardStore.recentInvoices.length === 0"
              class="py-6 text-center text-sm text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-2">
              No recent invoices found.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useDashboardStore } from "~/stores/dashboardStore";

const dashboardStore = useDashboardStore();

onMounted(() => {
  dashboardStore.fetchDashboardData();
});
</script>
