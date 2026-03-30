<template>
  <div class="ui-chart-container relative w-full h-full">
    <component
      :is="chartComponent"
      v-if="chartData"
      :data="chartData"
      :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps({
  type: {
    type: String,
    default: "line", // line, bar, doughnut
  },
  data: {
    type: [Array, Object],
    required: true,
  },
  // Compatibility with existing UiChart API
  index: {
    type: String,
    default: "date",
  },
  categories: {
    type: Array,
    default: () => ["amount"],
  },
  // Advanced API
  options: {
    type: Object,
    default: () => ({}),
  },
  showLegend: {
    type: Boolean,
    default: false,
  },
  gradient: {
    type: Boolean,
    default: true,
  },
});

const chartComponent = computed(() => {
  if (props.type === "bar") return Bar;
  if (props.type === "doughnut") return Doughnut;
  return Line;
});

const chartData = computed(() => {
  // If standard ChartJS data object is provided, use it
  if (!Array.isArray(props.data)) return props.data;

  // Otherwise, use the legacy compatibility mapping

  return {
    labels: props.data.map((item) => {
      const date = new Date(item[props.index]);
      return isNaN(date.getTime())
        ? item[props.index]
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }),
    datasets: props.categories.map((category) => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      data: props.data.map((item) => item[category] || 0),
      rawDetails: props.data.map((item) => item.details || []),
      borderColor: props.type === "line" ? "#059669" : undefined,
      backgroundColor:
        props.type === "line" && props.gradient
          ? (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return null;
              const gradient = ctx.createLinearGradient(
                0,
                chartArea.bottom,
                0,
                chartArea.top,
              );
              gradient.addColorStop(0, "rgba(5, 150, 105, 0)");
              gradient.addColorStop(1, "rgba(5, 150, 105, 0.1)");
              return gradient;
            }
          : props.type === "bar"
            ? "#059669"
            : ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
      fill: props.type === "line" ? props.gradient : false,
      tension: 0.4,
      pointRadius: props.type === "line" ? 4 : 0,
    })),
  };
});

const defaultOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      display: props.showLegend || props.type === "doughnut",
      position: "bottom",
      labels: {
        font: { family: "Inter, sans-serif", weight: "600", size: 10 },
        color: "#475569",
      },
    },
    tooltip: {
      backgroundColor: "#0f172a",
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 11, weight: "bold" },
      bodyFont: { size: 10 },
      multiKeyBackground: "#059669",
      callbacks: {
        label: (context) => {
          const dataset = context.dataset;
          const index = context.dataIndex;
          const details = dataset.rawDetails?.[index] || [];
          const val = context.parsed.y || 0;
          const lines = [`Total: ${val.toLocaleString()}`];

          if (details.length > 0) {
            lines.push(""); // Spacer
            details.forEach((d) => {
              const idStr = String(d.clientId).slice(0, 8);
              const dateStr = d.dueDate ? new Date(d.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A";
              lines.push(
                `${d.clientName} [#${idStr}] - ${d.invoiceNumber || 'Inv'}: ${d.amount.toLocaleString()} (Due: ${dateStr})`,
              );
            });
          }
          return lines;
        },
      },
    },
  },
  scales:
    props.type === "doughnut"
      ? {}
      : {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, color: "#94a3b8" },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 10 }, color: "#94a3b8" },
          },
        },
}));

const chartOptions = computed(() => {
  return { ...defaultOptions.value, ...props.options };
});
</script>

<style scoped>
.ui-chart-container {
  min-height: 200px;
}
</style>
