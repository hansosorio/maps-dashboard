import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useDashboardStore } from '@/stores/dashboard'
import SocioeconomicChart from '../../dashboard/SocioeconomicChart.vue'

describe('SocioeconomicChart.vue', () => {
  let store

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        dashboard: {
          totalSocioeconomic: { A: 10, B: 20, C: 50, D: 30, E: 15 },
          dashboardData: {
            totalSocioeconomic: { A: 10, B: 20, C: 50, D: 30, E: 15 },
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
    const wrapper = mount(SocioeconomicChart, {
      global: {
        plugins: [createTestingPinia()],
      },
    })
    expect(wrapper.find('#socioeconomic-chart-title').text()).toBe('Socioeconomic Levels')
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-labelledby')).toBe('socioeconomic-chart-title')
  })
})
