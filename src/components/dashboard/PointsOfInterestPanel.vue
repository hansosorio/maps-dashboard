<template>
  <div class="bg-white rounded-lg shadow-lg p-4" role="region" aria-labelledby="poi-panel-title">
    <h2
      id="poi-panel-title"
      class="text-lg font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2"
    >
      Points of Interest
    </h2>
    <p v-if="poiList.length === 0" class="text-gray-500 text-sm">
      No points of interest data available.
    </p>
    <ul v-else class="space-y-3">
      <li v-for="poi in poiList" :key="poi.type" class="flex items-start text-gray-800">
        <span class="text-xl mr-3" role="img" :aria-label="poi.type + ' icon'">{{
          poi.icon || '📍'
        }}</span>
        <span class="font-semibold">{{ poi.type }}:</span>
        <span class="ml-auto font-bold text-blue-600">{{ poi.count }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()

const poiList = computed(() => dashboardStore.getInterestPointsSummary)
</script>

<style scoped>
ul {
  padding-inline-start: 0px;
}
</style>
