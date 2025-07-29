import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CheckboxToggle from '../../ui/CheckboxToggle.vue'

describe('CheckboxToggle.vue', () => {
  it('renders correctly with given label and initial state', () => {
    const wrapper = mount(CheckboxToggle, {
      props: {
        id: 'test-checkbox',
        label: 'Enable Feature',
        modelValue: true,
      },
    })

    // Check if label is rendered
    expect(wrapper.find('span').text()).toBe('Enable Feature')
    // Check if checkbox is checked
    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true)
    // Check for correct id attribute
    expect(wrapper.find('input').attributes('id')).toBe('test-checkbox')
  })

  it('emits "update:modelValue" event when checkbox is clicked', async () => {
    const wrapper = mount(CheckboxToggle, {
      props: {
        id: 'click-checkbox',
        label: 'Click Me',
        modelValue: false,
      },
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(true)

    await checkbox.setValue(false)
    expect(wrapper.emitted('update:modelValue')[1][0]).toBe(false)
  })

  it('applies correct accessibility attributes', () => {
    const wrapper = mount(CheckboxToggle, {
      props: {
        id: 'a11y-checkbox',
        label: 'Accessibility Check',
        modelValue: false,
      },
    })

    const input = wrapper.find('input')
    const label = wrapper.find('label')

    expect(input.attributes('aria-label')).toBe('Accessibility Check')
    expect(input.attributes('role')).toBe('checkbox')
    expect(label.attributes('for')).toBe('a11y-checkbox')
  })
})
