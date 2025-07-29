import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDashboardStore } from '../dashboard'
import { mockDashboardData, fetchDashboardData, fetchMapPointDetails } from '@/data/mockData'

vi.mock('@/data/mockData', () => ({
  fetchDashboardData: vi.fn(() => Promise.resolve(mockDashboardData)),
  fetchMapPointDetails: vi.fn((id) => {
    const point = mockDashboardData.mapPoints.find((p) => p.id === id)
    return point ? Promise.resolve(point) : Promise.reject(new Error('Point not found'))
  }),
  mockDashboardData: {
    path: {
      coordinates: [
        { lat: 1, lng: 1 },
        { lat: 2, lng: 2 },
      ],
    },
    mapPoints: [
      {
        id: 'km-1',
        lat: 1.1,
        lng: 1.1,
        kilometer: 1,
        estimatedFlow: '100',
        radius: 1000,
        streetViewPanoramaId: 'pano1',
        description: 'desc1',
        demographics: { '0-17': 10, '18-35': 20, '36-55': 30, '56+': 5 },
        socioeconomic: { A: 1, B: 2, C: 3, D: 4, E: 5 },
        interestPoints: [{ type: 'Shops', count: 5, icon: '🛍️' }],
      },
      {
        id: 'km-2',
        lat: 1.2,
        lng: 1.2,
        kilometer: 2,
        estimatedFlow: '200',
        radius: 1500,
        streetViewPanoramaId: 'pano2',
        description: 'desc2',
        demographics: { '0-17': 15, '18-35': 25, '36-55': 35, '56+': 10 },
        socioeconomic: { A: 2, B: 3, C: 4, D: 5, E: 6 },
        interestPoints: [{ type: 'Restaurants', count: 3, icon: '🍔' }],
      },
    ],
    totalDemographics: { '0-17': 25, '18-35': 45, '36-55': 65, '56+': 15 },
    totalSocioeconomic: { A: 3, B: 5, C: 7, D: 9, E: 11 },
    totalInterestPoints: [
      { type: 'Shops', count: 5, icon: '🛍️' },
      { type: 'Restaurants', count: 3, icon: '🍔' },
    ],
  },
}))

describe('dashboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchDashboardData.mockClear()
    fetchMapPointDetails.mockClear()
  })

  it('initial state is correct', () => {
    const store = useDashboardStore()
    expect(store.dashboardData).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.mapControls).toEqual({
      showKilometerPoints: true,
      showInfluenceCircles: true,
      showInterestPoints: true,
    })
    expect(store.selectedMapPoint).toBeNull()
  })

  it('loads dashboard data correctly', async () => {
    const store = useDashboardStore()
    expect(store.isLoading).toBe(false)

    const promise = store.loadDashboardData()
    expect(store.isLoading).toBe(true)

    await promise

    expect(fetchDashboardData).toHaveBeenCalledTimes(1)
    expect(store.dashboardData).toEqual(mockDashboardData)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('handles dashboard data loading error', async () => {
    fetchDashboardData.mockImplementationOnce(() => Promise.reject(new Error('Network error')))
    const store = useDashboardStore()

    await store.loadDashboardData()

    expect(store.dashboardData).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe('Network error')
  })

  it('toggles map controls correctly', () => {
    const store = useDashboardStore()

    expect(store.mapControls.showKilometerPoints).toBe(true)
    store.toggleMapControl('showKilometerPoints')
    expect(store.mapControls.showKilometerPoints).toBe(false)
    store.toggleMapControl('showKilometerPoints')
    expect(store.mapControls.showKilometerPoints).toBe(true)

    const consoleWarnSpy = vi.spyOn(console, 'warn')
    store.toggleMapControl('unknownControl')
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Attempted to toggle unknown map control: unknownControl',
    )
    consoleWarnSpy.mockRestore()
  })

  it('sets and clears selected map point correctly', async () => {
    const store = useDashboardStore()
    await store.loadDashboardData()

    expect(store.selectedMapPoint).toBeNull()

    // Select a point
    await store.setSelectedMapPoint('km-1')
    expect(fetchMapPointDetails).toHaveBeenCalledWith('km-1')
    expect(store.selectedMapPoint).toEqual(mockDashboardData.mapPoints[0])

    // Clear selected point
    store.clearSelectedMapPoint()
    expect(store.selectedMapPoint).toBeNull()

    // Select with null/undefined should clear
    await store.setSelectedMapPoint(null)
    expect(store.selectedMapPoint).toBeNull()
    expect(fetchMapPointDetails).not.toHaveBeenCalledWith(null)
  })

  it('handles error when setting selected map point', async () => {
    fetchMapPointDetails.mockImplementationOnce(() =>
      Promise.reject(new Error('Point details error')),
    )
    const store = useDashboardStore()
    await store.loadDashboardData()

    const consoleErrorSpy = vi.spyOn(console, 'error')

    await store.setSelectedMapPoint('non-existent-id')
    expect(store.selectedMapPoint).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load details for map point non-existent-id:',
      expect.any(Error),
    )
    consoleErrorSpy.mockRestore()
  })

  it('getPathCoordinates getter returns correct data', async () => {
    const store = useDashboardStore()
    expect(store.getPathCoordinates).toEqual([])
    await store.loadDashboardData()
    expect(store.getPathCoordinates).toEqual(mockDashboardData.path.coordinates)
  })

  it('getInfluenceCircles getter returns correct data based on control', async () => {
    const store = useDashboardStore()
    await store.loadDashboardData()

    expect(store.getInfluenceCircles.length).toBeGreaterThan(0)
    expect(store.getInfluenceCircles[0]).toEqual({
      lat: mockDashboardData.mapPoints[0].lat,
      lng: mockDashboardData.mapPoints[0].lng,
      radius: mockDashboardData.mapPoints[0].radius,
      id: mockDashboardData.mapPoints[0].id,
    })

    store.toggleMapControl('showInfluenceCircles')
    expect(store.getInfluenceCircles).toEqual([])
  })

  it('getInterestPoints getter returns correct data based on control', async () => {
    const store = useDashboardStore()
    await store.loadDashboardData()

    expect(store.getInterestPoints.length).toBeGreaterThan(0)
    expect(store.getInterestPoints[0]).toEqual({
      lat: mockDashboardData.mapPoints[0].lat,
      lng: mockDashboardData.mapPoints[0].lng,
      id: `ip-${mockDashboardData.mapPoints[0].id}`,
    })

    store.toggleMapControl('showInterestPoints')
    expect(store.getInterestPoints).toEqual([])
  })

  it('getDemographicsChartData getter returns formatted data', async () => {
    const store = useDashboardStore()
    await store.loadDashboardData()
    const chartData = store.getDemographicsChartData

    expect(chartData.length).toBe(4)
    expect(chartData[0]).toHaveProperty('label')
    expect(chartData[0]).toHaveProperty('value')
    expect(chartData[0]).toHaveProperty('color')
    expect(chartData.find((d) => d.label === '0-17 years').value).toBe(
      mockDashboardData.totalDemographics['0-17'],
    )
  })

  it('getSocioeconomicChartData getter returns formatted data', async () => {
    const store = useDashboardStore()
    await store.loadDashboardData()
    const chartData = store.getSocioeconomicChartData

    expect(chartData.length).toBe(5)
    expect(chartData[0]).toHaveProperty('label')
    expect(chartData[0]).toHaveProperty('value')
    expect(chartData[0]).toHaveProperty('color')
    expect(chartData.find((d) => d.label === 'Class A').value).toBe(
      mockDashboardData.totalSocioeconomic['A'],
    )
  })

  it('getInterestPointsSummary getter returns correct data', async () => {
    const store = useDashboardStore()
    await store.loadDashboardData()
    const summary = store.getInterestPointsSummary

    expect(summary.length).toBeGreaterThan(0)
    expect(summary[0]).toHaveProperty('type')
    expect(summary[0]).toHaveProperty('count')
    expect(summary[0]).toHaveProperty('icon')
    expect(summary).toEqual(mockDashboardData.totalInterestPoints)
  })

  it('getMaxDemographicValue getter returns the correct max value', async () => {
    const store = useDashboardStore()
    await store.loadDashboardData()
    expect(store.getMaxDemographicValue).toBe(65)
  })

  it('getMaxSocioeconomicValue getter returns the correct max value', async () => {
    const store = useDashboardStore()
    await store.loadDashboardData()
    expect(store.getMaxSocioeconomicValue).toBe(11)
  })
})
