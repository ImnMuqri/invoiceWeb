<template>
  <div class="mt-8 flex flex-col">
    <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div
          class="overflow-hidden shadow-sm border border-slate-200 bg-white sm:rounded-xl">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <slot name="header"></slot>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <!-- Loading State -->
              <template v-if="loading">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td
                    v-for="j in columnCount"
                    :key="j"
                    class="whitespace-nowrap py-4 px-6">
                    <div class="h-4 bg-slate-100 rounded w-full"></div>
                  </td>
                </tr>
              </template>

              <!-- Empty State -->
              <template v-else-if="isEmpty">
                <tr>
                  <td :colspan="columnCount" class="py-24 text-center">
                    <slot name="empty">
                      <div class="flex flex-col items-center justify-center">
                        <div
                          class="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mb-6 border border-slate-200/60 shadow-sm relative overflow-hidden">
                          <div
                            class="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
                          <svg
                            class="w-10 h-10 text-slate-400 relative z-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 class="text-base font-semibold text-slate-900">
                          No records found
                        </h3>
                        <p
                          class="mt-2 text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                          We couldn't find any results. Try adjusting your
                          search or create a new entry to get started.
                        </p>
                      </div>
                    </slot>
                  </td>
                </tr>
              </template>

              <!-- Data State -->
              <template v-else>
                <slot></slot>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  isEmpty: {
    type: Boolean,
    default: false,
  },
  columnCount: {
    type: Number,
    required: true,
  },
});
</script>
