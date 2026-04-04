<template>
  <UiModal v-model="uiStore.isModuleHelpOpen" maxWidth="md" :showClose="true">
    <div class="relative overflow-hidden">
      <!-- Background Accents -->
      <div
        class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20"
        :class="moduleConfig.accentBase"></div>

      <div class="p-8 relative">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border"
            :class="moduleConfig.iconBg">
            <UiIcon
              :icon="moduleConfig.icon"
              :custom-class="'w-6 h-6 ' + moduleConfig.iconColor" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{ moduleConfig.title }}
            </h3>
            <p class="text-xs font-medium text-slate-500">Module Guide</p>
          </div>
        </div>

        <!-- Content Steps -->
        <div class="space-y-6">
          <div
            v-for="(tip, index) in moduleConfig.tips"
            :key="index"
            class="flex gap-4 group">
            <div
              class="shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-slate-100">
              <span class="text-xs font-bold">{{ index + 1 }}</span>
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900">{{ tip.label }}</h4>
              <p class="text-[13px] text-slate-500 mt-1 leading-relaxed">
                {{ tip.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action -->
        <div class="mt-10">
          <button
            @click="uiStore.closeModuleHelp"
            class="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-slate-900/10">
            Got it, Thanks!
          </button>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { computed } from "vue";
import { useUiStore } from "@/stores/uiStore";

const uiStore = useUiStore();

const configs = {
  dashboard: {
    title: "Dashboard Overview",
    icon: "heroicons:presentation-chart-bar",
    iconBg: "bg-indigo-50 border-indigo-100",
    iconColor: "text-indigo-600",
    accentBase: "bg-indigo-500",
    tips: [
      {
        label: "Module Statistics",
        description:
          "View your Total Revenue, Pending Payments, Active Clients, and Overdue count at a glance.",
      },
      {
        label: "Monthly Revenue Forecast",
        description:
          "Track your income performance and projects with our interactive revenue chart.",
      },
      {
        label: "AI Chaser Insights",
        description:
          "Review automated suggestions on client payment health and follow-up priorities.",
      },
      {
        label: "Activity History",
        description:
          "Monitor the latest invoice events, including sent, viewed, and paid updates.",
      },
    ],
  },
  invoices: {
    title: "Invoice Management",
    icon: "heroicons:document-duplicate",
    iconBg: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
    accentBase: "bg-blue-500",
    tips: [
      {
        label: "Invoice Table",
        description:
          "Manage all invoices here. Track status (Sent, Viewed, Paid), due dates, and amount total.",
      },
      {
        label: "Share Public Link",
        description:
          "Every invoice has a public link. Share it with clients so they can view and pay immediately.",
      },
      {
        label: "Payment Gateway",
        description:
          "To accept online payments via public links, ensure you setup ToyyibPay or Billplz in Settings first.",
      },
      {
        label: "Manual Marking",
        description:
          "Click the 'Check' icon in the table action menu to manually mark an invoice as paid once received.",
      },
      {
        label: "Actions Menu",
        description:
          "Use the actions column to Send (Email/WhatsApp), Edit, or Delete your invoices easily.",
      },
    ],
  },
  clients: {
    title: "Client Relationships",
    icon: "heroicons:user-group",
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    accentBase: "bg-amber-500",
    tips: [
      {
        label: "Client Management",
        description:
          "Add and organize your client database for faster invoice creation and tracking.",
      },
      {
        label: "Auto-Chaser Switch",
        description:
          "Toggle the Chaser switch per client to enable automated reminders for overdue invoices.",
      },
      {
        label: "Average Delay",
        description:
          "Monitor the 'Avg Delay' to see the average number of days a client takes to pay after due date.",
      },
    ],
  },
  settings: {
    title: "Platform Settings",
    icon: "heroicons:cog-6-tooth",
    iconBg: "bg-slate-50 border-slate-200",
    iconColor: "text-slate-600",
    accentBase: "bg-slate-400",
    tips: [], // Dynamic below
  },
  referrals: {
    title: "Rewards Program",
    icon: "heroicons:gift",
    iconBg: "bg-pink-50 border-pink-100",
    iconColor: "text-pink-600",
    accentBase: "bg-pink-500",
    tips: [
      {
        label: "Share & Earn",
        description:
          "Copy and share your unique code to earn credits for every successful signup.",
      },
      {
        label: "Claim Rewards",
        description:
          "Redeem your accumulated credits for free months of PRO or MAX plans.",
      },
      {
        label: "Status tracking",
        description:
          "Monitor your referral status and claimable rewards in real-time.",
      },
    ],
  },
};

const settingsSubTips = {
  general: [
    {
      label: "User Details",
      description:
        "Update your personal profile, email, and password settings.",
    },
    {
      label: "Company Details",
      description:
        "Manage your business name, phone, and official address for invoices.",
    },
    {
      label: "Preferences",
      description: "Set your default currency and platform language options.",
    },
  ],
  invoice_config: [
    {
      label: "Display Fields",
      description:
        "Choose which fields to show or hide on your generated PDF invoices.",
    },
    {
      label: "Global Automation",
      description:
        "Toggle the global switch for automated payment reminders and chasers.",
    },
    {
      label: "Invoice Prefix",
      description: "Set your custom invoice numbering prefix (e.g., INV-001).",
    },
    {
      label: "Default Tax Rate",
      description:
        "Set a standard tax percentage to apply automatically to new invoices.",
    },
  ],
  whatsapp: [
    {
      label: "WhatsApp Mode",
      description:
        "Choose between using our System number or your own Twilio configuration.",
    },
    {
      label: "Reminder Interval",
      description:
        "Set how many days between automated WhatsApp payment reminders.",
    },
    {
      label: "Message Template",
      description:
        "Customize the message content sent to your clients via WhatsApp.",
    },
  ],
  email: [
    {
      label: "Client Side Preview",
      description:
        "View exactly how your invoice emails appear to your customers.",
    },
    {
      label: "Reminder Interval",
      description:
        "Set the frequency of automated email reminders for overdue payments.",
    },
  ],
  payments: [
    {
      label: "Payment Gateways",
      description:
        "Connect to ToyyibPay or Billplz to accept online payments instantly.",
    },
    {
      label: "Manual Bank Transfer",
      description:
        "Setup your bank details or QR code for direct manual payments.",
    },
  ],
  billing: [
    {
      label: "Plan Overview",
      description:
        "View your current subscription plan, usage limits, and billing history.",
    },
  ],
};

const moduleConfig = computed(() => {
  const baseConfig = configs[uiStore.activeModuleHelp] || configs.dashboard;

  if (uiStore.activeModuleHelp === "settings" && uiStore.activeSubContext) {
    return {
      ...baseConfig,
      tips: settingsSubTips[uiStore.activeSubContext] || baseConfig.tips,
    };
  }

  return baseConfig;
});
</script>

<style scoped></style>
