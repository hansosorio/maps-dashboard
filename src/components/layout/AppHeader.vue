<template>
  <header class="bg-blue-700 text-white p-4 shadow-md flex items-center justify-between">
    <div class="flex items-center">
      <h1 class="text-2xl font-extrabold tracking-tight">Geograph Dashboard</h1>
    </div>
    <div class="relative w-1/3 max-w-md">
      <input
        id="place-search"
        type="text"
        v-model="searchQuery"
        @input="handleSearchInput"
        @keydown.enter="selectFirstPlace"
        placeholder="Search for a place..."
        aria-controls="place-suggestions"
        :aria-expanded="showSuggestions"
        class="w-full p-2 pl-10 rounded-lg bg-blue-600 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-blue-500"
        role="combobox"
        aria-autocomplete="list"
      />
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-5 h-5"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
      <ul
        v-if="showSuggestions"
        id="place-suggestions"
        role="listbox"
        class="absolute z-20 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
      >
        <li v-if="loadingPlaces" class="p-2 text-gray-500">Loading suggestions...</li>
        <li
          v-else-if="placeSuggestions.length === 0 && searchQuery.length > 2"
          class="p-2 text-gray-500"
        >
          No results found.
        </li>
        <li
          v-for="(place, index) in placeSuggestions"
          :key="place.place_id"
          @click="selectPlace(place)"
          @keydown.enter="selectPlace(place)"
          @mouseover="highlightIndex = index"
          @mouseleave="highlightIndex = -1"
          role="option"
          :aria-selected="index === highlightIndex"
          :class="[
            'p-2 cursor-pointer text-gray-800 hover:bg-blue-100',
            { 'bg-blue-100': index === highlightIndex },
          ]"
          tabindex="0"
        >
          {{ place.description }}
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { searchGooglePlaces } from '@/data/mockData'

const searchQuery = ref('')
const placeSuggestions = ref([])
const loadingPlaces = ref(false)

const showSuggestions = computed(
  () => placeSuggestions.value.length > 0 && searchQuery.value.length > 2,
)
const highlightIndex = ref(-1)

let searchTimeout = null

const handleSearchInput = () => {
  if (searchQuery.value.length < 3) {
    placeSuggestions.value = []
    clearTimeout(searchTimeout)
    return
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  loadingPlaces.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const results = await searchGooglePlaces(searchQuery.value)
      placeSuggestions.value = results
    } catch (error) {
      console.error('Error searching places:', error)
      placeSuggestions.value = []
    } finally {
      loadingPlaces.value = false
    }
  }, 300)
}

const selectPlace = (place) => {
  searchQuery.value = place.description
  placeSuggestions.value = []
  highlightIndex.value = -1
  console.log('Selected place:', place)
}

const selectFirstPlace = () => {
  if (placeSuggestions.value.length > 0) {
    selectPlace(placeSuggestions.value[0])
  }
}

watch(searchQuery, (newVal) => {
  if (newVal.length < 3) {
    highlightIndex.value = -1
  }
})
</script>
