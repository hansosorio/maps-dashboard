import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressBar from '../../ui/ProgressBar.vue'

describe('ProgressBar.vue', () => {
  it('renders correctly with given label, value, and color', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        label: 'Test Label',
        value: 50,
        maxValue: 100,
        color: '#ff0000',
      },
    })

    expect(wrapper.find('.text-sm.font-medium').text()).toBe('Test Label')
    expect(wrapper.find('.font-semibold').text()).toBe('50')
    expect(wrapper.find('.h-full').attributes('style')).toContain('width: 50%;')
    expect(wrapper.find('.h-full').attributes('style')).toContain(
      'background-color: rgb(255, 0, 0);',
  })

  it('calculates width correctly for different values', async () => {
    const wrapper = mount(ProgressBar, {
      props: {
        label: 'Bar',
        value: 25,
        maxValue: 100,
      },
    })
    expect(wrapper.find('.h-full').attributes('style')).toContain('width: 25%;')

    await wrapper.setProps({ value: 75 })
    expect(wrapper.find('.h-full').attributes('style')).toContain('width: 75%;')

    await wrapper.setProps({ value: 0 })
    expect(wrapper.find('.h-full').attributes('style')).toContain('width: 0%;')

    await wrapper.setProps({ value: 100, maxValue: 50 })
    expect(wrapper.find('.h-full').attributes('style')).toContain('width: 100%;')
  })

  it('handles zero maxValue correctly', async () => {
    const wrapper = mount(ProgressBar, {
      props: {
        label: 'Zero Max',
        value: 10,
        maxValue: 0,
      },
    })
    expect(wrapper.find('.h-full').attributes('style')).toContain('width: 0%;')
  })

  it('applies accessibility attributes', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        label: 'A11y Bar',
        value: 30,
        maxValue: 100,
      },
    })

    const progressbar = wrapper.find('[role="progressbar"]')
    expect(progressbar.attributes('aria-valuenow')).toBe('30')
    expect(progressbar.attributes('aria-valuemin')).toBe('0')
    expect(progressbar.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.find('.h-full').attributes('aria-label')).toBe('A11y Bar: 30 units')
  })
})
