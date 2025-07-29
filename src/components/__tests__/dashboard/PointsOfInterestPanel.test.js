import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useDashboardStore } from '@/stores/dashboard'
import PointsOfInterestPanel from '../../dashboard/PointsOfInterestPanel.vue'

describe('PointsOfInterestPanel.vue', () => {
  let store

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        dashboard: {
          totalInterestPoints: [
            { type: 'Restaurants', count: 12, icon: '🍔' },
            { type: 'Shops', count: 8, icon: '🛍️' },
            { type: 'Parks', count: 3, icon: '🌳' },
          ],
          dashboardData: {
            totalInterestPoints: [
              { type: 'Restaurants', count: 12, icon: '🍔' },
              { type: 'Shops', count: 8, icon: '🛍️' },
              { type: 'Parks', count: 3, icon: '🌳' },
            ],
          },
        },
      },
      stubActions: false,
      createSpy: vi.fn,
    })
    store = useDashboardStore()
    store.$reset()
  })

  it('renders the title correctly', () => {
    const wrapper = mount(PointsOfInterestPanel, {
      global: {
        plugins: [createTestingPinia()],
      },
    })
    expect(wrapper.find('#poi-panel-title').text()).toBe('Points of Interest')
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-labelledby')).toBe('poi-panel-title')
  })

  it('displays "No points of interest data available" when POI list is empty', async () => {
    const pinia = createTestingPinia({
      initialState: {
        dashboard: {
          totalInterestPoints: [],
          dashboardData: {
            totalInterestPoints: [],
          },
        },
      },
    })
    const wrapper = mount(PointsOfInterestPanel, { global: { plugins: [pinia] } })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('p').text()).toBe('No points of interest data available.')
    expect(wrapper.findAll('li').length).toBe(0)
  })
})
