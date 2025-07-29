<template>
  <div
    class="bg-white rounded-lg shadow-lg p-4"
    role="region"
    aria-labelledby="socioeconomic-chart-title"
  >
    <h2
      id="socioeconomic-chart-title"
      class="text-lg font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2"
    >
      Socioeconomic Levels
    </h2>
    <p v-if="chartData.length === 0" class="text-gray-500 text-sm">
      No socioeconomic data available.
    </p>
    <div v-else class="space-y-4">
      <div v-for="data in chartData" :key="data.label">
        <ProgressBar
          :label="data.label"
          :value="data.value"
          :max-value="maxValue"
          :bar-color="data.color"
          :label-sr-only="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import ProgressBar from '@/components/ui/ProgressBar.vue'

const dashboardStore = useDashboardStore()

const chartData = computed(() => dashboardStore.getSocioeconomicChartData)
const maxValue = computed(() => dashboardStore.getMaxSocioeconomicValue)
</script>
