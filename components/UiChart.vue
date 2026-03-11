<template>
  <div class="ui-chart-container relative w-full h-full">
    <Line
      v-if="chartData"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  index: {
    type: String,
    default: 'date'
  },
  categories: {
    type: Array,
    default: () => ['amount']
  },
  showLegend: {
    type: Boolean,
    default: false
  },
  gradient: {
    type: Boolean,
    default: true
  }
})

const chartData = computed(() => {
  return {
    labels: props.data.map(item => {
      const date = new Date(item[props.index])
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: props.categories.map(category => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      data: props.data.map(item => item[category]),
      borderColor: '#059669', // emerald-600
      backgroundColor: props.gradient ? (context) => {
        const chart = context.chart
        const { ctx, chartArea } = chart
        if (!chartArea) return null
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
        gradient.addColorStop(0, 'rgba(5, 150, 105, 0)')
        gradient.addColorStop(1, 'rgba(5, 150, 105, 0.1)')
        return gradient
      } : 'transparent',
      fill: props.gradient,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#059669',
      pointHoverRadius: 6,
      borderWidth: 2,
    }))
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.showLegend,
      position: 'top',
      labels: {
        font: {
          family: 'Inter, sans-serif',
          weight: '600',
          size: 11
        },
        color: '#475569' // slate-600
      }
    },
    tooltip: {
      backgroundColor: '#0f172a', // slate-900
      titleFont: {
        family: 'Inter, sans-serif',
        size: 12,
        weight: '600'
      },
      bodyFont: {
        family: 'Inter, sans-serif',
        size: 12
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          weight: '500'
        },
        color: '#94a3b8' // slate-400
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9' // slate-100
      },
      ticks: {
        font: {
          size: 11,
          weight: '500'
        },
        color: '#94a3b8', // slate-400
        callback: (value) => value.toLocaleString()
      }
    }
  }
}))
</script>

<style scoped>
.ui-chart-container {
  min-height: 200px;
}
</style>
