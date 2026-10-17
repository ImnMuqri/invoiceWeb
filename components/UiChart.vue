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
import { useThemeStore } from "~/stores/themeStore";
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

const themeStore = useThemeStore();

/**
 * A desk token, resolved to the literal value Chart.js needs.
 *
 * Chart.js paints onto a canvas, so it cannot read a CSS custom property the way
 * the rest of the app does — the value has to be pulled out of the document and
 * handed over as a string. The fallbacks are for SSR, where there is no document
 * to read from; the client render corrects them immediately.
 */
const token = (name, fallback) => {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  /* The desk tokens are declared as var() chains (--desk-text-3: var(--gray-660)),
     and a browser substitutes those at computed-value time — so this normally
     comes back as a literal colour. If one ever arrives unsubstituted, handing
     "var(--gray-660)" to a canvas is not an error it reports: Chart.js quietly
     paints something else. Fall back instead. */
  if (!value || value.includes("var(")) return fallback;
  return value;
};

const palette = computed(() => {
  /* Reads the app's theme flag purely to take a dependency on it. The canvas has
     already been rasterised by the time a theme toggle lands, and no stylesheet
     can reach inside it — so without this the chart would keep the colours it
     was first drawn with until something else forced a redraw. */
  void themeStore.isDark;

  return {
    /* --desk-text-3, not slate-400. The hardcoded #94a3b8 measured about 2.6:1
       on the light card, which fails AA for the axis numbers in the theme it was
       chosen for. The token is AA in both. */
    axis: token("--desk-text-3", "#656c6a"),
    legend: token("--desk-text-2", "#626a68"),
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
        color: palette.value.legend,
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
              const dateStr = d.dueDate
                ? new Date(d.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "N/A";
              lines.push(
                `${d.clientName} [#${idStr}] - ${d.invoiceNumber || "Inv"}: ${d.amount.toLocaleString()} (Due: ${dateStr})`,
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
          /* NO GRIDLINES, and no axis borders either.
             The y axis used to draw its grid at a hardcoded #f1f5f9 — slate-50,
             chosen against a white card. In dark mode that is a near-white line
             across a dark panel, which is what it looked like: stripes.

             Removed rather than re-tinted, which is what was asked for, and it
             leaves the two axes consistent — x had already been set to
             display: false. The tick labels stay, so values are still readable
             off the axis.

             `border` is a separate switch in Chart.js v4: turning the grid off
             leaves the axis line itself drawn, which would have left one more
             rule on the panel after removing the rest. */
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 10 }, color: palette.value.axis },
          },
          y: {
            beginAtZero: true,
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 10 }, color: palette.value.axis },
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
