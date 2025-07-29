<template>
  <div
    class="flex items-center w-full my-2"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="maxValue"
  >
    <div class="text-sm font-medium w-24 text-gray-700 pr-2 truncate" :title="label" tabindex="0">
      {{ label }}
    </div>
    <div class="flex-grow bg-gray-200 rounded-full h-3.5 relative overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :style="{ width: barWidth, backgroundColor: color }"
        :aria-label="`${label}: ${value} units`"
        tabindex="0"
      ></div>
    </div>
    <div class="ml-2 text-sm font-semibold text-gray-800 w-12 text-right" tabindex="0">
      {{ value }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  maxValue: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: '#3b82f6', // blue-500
  },
})

const barWidth = computed(() => {
  if (props.maxValue === 0) return '0%'
  const percentage = (props.value / props.maxValue) * 100
  return `${Math.min(100, percentage)}%`
})
</script>
