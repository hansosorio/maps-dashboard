import { defineStore } from 'pinia'
import { fetchDashboardData, fetchMapPointDetails } from '@/data/mockData'

/**
 * @typedef {Object} MapControls
 * @property {boolean} showKilometerPoints
 * @property {boolean} showInfluenceCircles
 * @property {boolean} showInterestPoints
 */

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardData: null,
    isLoading: false,
    error: null,
    mapControls: {
      showKilometerPoints: true,
      showInfluenceCircles: true,
      showInterestPoints: true,
    },
    selectedMapPoint: null,
  }),

  actions: {
    async loadDashboardData() {
      this.isLoading = true
      this.error = null
      try {
        this.dashboardData = await fetchDashboardData()
      } catch (err) {
        this.error = err.message
        console.error('Failed to load dashboard data:', err)
      } finally {
        this.isLoading = false
      }
    },

    toggleMapControl(controlName) {
      if (this.mapControls.hasOwnProperty(controlName)) {
        this.mapControls[controlName] = !this.mapControls[controlName]
      } else {
        console.warn(`Attempted to toggle unknown map control: ${controlName}`)
      }
    },

    async setSelectedMapPoint(pointId) {
      if (!pointId) {
        this.selectedMapPoint = null
        return
      }
      try {
        this.selectedMapPoint = await fetchMapPointDetails(pointId)
      } catch (err) {
        console.error(`Failed to load details for map point ${pointId}:`, err)
        this.selectedMapPoint = null
      }
    },
    clearSelectedMapPoint() {
      this.selectedMapPoint = null
    },
  },

  getters: {
    getPathCoordinates: (state) => state.dashboardData?.path.coordinates || [],

    getKilometerPoints: (state) => {
      if (!state.mapControls.showKilometerPoints) return []
      return (
        state.dashboardData?.mapPoints.map((p) => ({
          lat: p.lat,
          lng: p.lng,
          id: p.id,
          streetViewPanoramaId: p.streetViewPanoramaId,
          kilometer: p.kilometer,
          estimatedFlow: p.estimatedFlow,
          description: p.description,
          radius: p.radius,
        })) || []
      )
    },

    getInfluenceCircles: (state) => {
      if (!state.mapControls.showInfluenceCircles) return []
      return (
        state.dashboardData?.mapPoints.map((p) => ({
          lat: p.lat,
          lng: p.lng,
          radius: p.radius,
          id: p.id,
        })) || []
      )
    },

    getInterestPoints: (state) => {
      if (!state.mapControls.showInterestPoints) return []
      return (
        state.dashboardData?.mapPoints.map((p) => ({ lat: p.lat, lng: p.lng, id: `ip-${p.id}` })) ||
        []
      )
    },

    getDemographicsChartData: (state) => {
      if (!state.dashboardData) return []
      const demographics = state.dashboardData.totalDemographics

      return Object.entries(demographics).map(([key, value]) => ({
        label: `${key} years`,
        value: value,
        color:
          key === '0-17'
            ? '#6366f1' // indigo-500
            : key === '18-35'
              ? '#3b82f6' // blue-500
              : key === '36-55'
                ? '#22c55e' // green-500
                : key === '56+'
                  ? '#ef4444' // red-500
                  : '#94a3b8', // slate-400
      }))
    },

    getSocioeconomicChartData: (state) => {
      if (!state.dashboardData) return []
      const socioeconomic = state.dashboardData.totalSocioeconomic
      return Object.entries(socioeconomic).map(([key, value]) => ({
        label: `Class ${key}`,
        value: value,
        color:
          key === 'A'
            ? '#10b981' // emerald-500
            : key === 'B'
              ? '#06b6d4' // cyan-500
              : key === 'C'
                ? '#f59e0b' // amber-500
                : key === 'D'
                  ? '#f43f5e' // rose-500
                  : key === 'E'
                    ? '#8b5cf6' // violet-500
                    : '#94a3b8', // slate-400
      }))
    },

    getInterestPointsSummary: (state) => {
      if (!state.dashboardData) return []
      return state.dashboardData.totalInterestPoints
    },

    getMaxDemographicValue: (state) => {
      if (!state.dashboardData) return 0
      return Math.max(...Object.values(state.dashboardData.totalDemographics))
    },

    getMaxSocioeconomicValue: (state) => {
      if (!state.dashboardData) return 0
      return Math.max(...Object.values(state.dashboardData.totalSocioeconomic))
    },
  },
})
