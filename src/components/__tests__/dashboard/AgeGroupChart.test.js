import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useDashboardStore } from '@/stores/dashboard'
import AgeGroupChart from '../../dashboard/AgeGroupChart.vue'

describe('AgeGroupChart.vue', () => {
  let store

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        dashboard: {
          totalDemographics: { '0-17': 100, '18-35': 300, '36-55': 250, '56+': 50 },
          dashboardData: {
            totalDemographics: { '0-17': 100, '18-35': 300, '36-55': 250, '56+': 50 },
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
    const wrapper = mount(AgeGroupChart, {
      global: {
        plugins: [createTestingPinia()],
      },
    })
    expect(wrapper.find('#age-chart-title').text()).toBe('Age Group Distribution')
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-labelledby')).toBe('age-chart-title')
  })
})
