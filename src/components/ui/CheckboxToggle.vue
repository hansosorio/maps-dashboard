<template>
  <label
    class="flex items-center space-x-2 cursor-pointer text-gray-800 hover:text-blue-600 focus-within:ring-2 focus-within:ring-blue-500 rounded p-1 transition-colors duration-200"
    :for="id"
  >
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-2 border-gray-300 transition-colors duration-200"
      :aria-label="label"
      role="checkbox"
    />
    <span class="text-sm font-medium select-none" :class="{ 'text-blue-700': modelValue }">{{
      label
    }}</span>
  </label>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.toggle-bg {
  @apply bg-gray-300;
}

input:checked + .toggle-bg {
  @apply bg-blue-500;
}

.dot {
  transform: translateX(0);
}

input:checked ~ .dot {
  transform: translateX(calc(100% + 4px));
}
</style>
