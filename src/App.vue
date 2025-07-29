<template>
  <div class="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans antialiased">
    <AppHeader />

    <main class="flex-grow flex flex-col lg:flex-row p-4 gap-6">
      <section
        class="flex-grow flex-shrink-0 w-full lg:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center justify-center min-h-[50vh] lg:min-h-[calc(100vh-8rem)] border border-gray-200"
        aria-label="Interactive Map Dashboard"
      >
        <p v-if="dashboardStore.isLoading" class="text-xl font-semibold text-blue-600 p-4">
          Loading map data...
        </p>
        <p v-else-if="dashboardStore.error" class="text-xl font-semibold text-red-600 p-4">
          Error loading map data: {{ dashboardStore.error }}
        </p>
        <GoogleMap v-else />
      </section>

      <aside
        class="flex-shrink-0 w-full lg:w-1/3 flex flex-col gap-6"
        aria-label="Analytical Widgets"
      >
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 class="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-3">
            Map Controls
          </h2>
          <div class="space-y-3">
            <CheckboxToggle
              id="show-kilometer-points"
              label="Show Kilometer Points"
              v-model="dashboardStore.mapControls.showKilometerPoints"
            />
            <CheckboxToggle
              id="show-influence-circles"
              label="Show Influence Circles"
              v-model="dashboardStore.mapControls.showInfluenceCircles"
            />
            <CheckboxToggle
              id="show-interest-points"
              label="Show Interest Points"
              v-model="dashboardStore.mapControls.showInterestPoints"
            />
          </div>
        </div>

        <AgeGroupChart v-if="!dashboardStore.isLoading && !dashboardStore.error" />
        <SocioeconomicChart v-if="!dashboardStore.isLoading && !dashboardStore.error" />
        <PointsOfInterestPanel v-if="!dashboardStore.isLoading && !dashboardStore.error" />
      </aside>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import AppHeader from '@/components/layout/AppHeader.vue'
import GoogleMap from '@/components/map/GoogleMap.vue'
import CheckboxToggle from '@/components/ui/CheckboxToggle.vue'

import AgeGroupChart from '@/components/dashboard/AgeGroupChart.vue'
import SocioeconomicChart from '@/components/dashboard/SocioeconomicChart.vue'
import PointsOfInterestPanel from '@/components/dashboard/PointsOfInterestPanel.vue'

const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.loadDashboardData()
})
</script>
