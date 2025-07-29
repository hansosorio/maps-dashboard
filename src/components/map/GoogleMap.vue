<template>
  <div class="w-full h-[70vh] relative">
    <GMapMap
      :api-key="googleMapsApiKey"
      :center="mapCenter"
      :options="{
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        disableDefaultUi: false,
      }"
      :zoom="mapZoom"
      class="w-full h-full"
      ref="mapRef"
      @click="handleMapClick"
      @ready="onMapReady"
      @onMapReady="onMapReady"
      @loaded="onMapReady"
      @idle="onMapReady"
      @tilesloaded="onMapReady"
    >
      <Polyline
        v-if="dashboardStore.getPathCoordinates.length > 0"
        :options="{
          path: dashboardStore.getPathCoordinates,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 5,
        }"
      />

      <Marker
        v-for="point in dashboardStore.getKilometerPoints"
        :key="`km-${point.id}`"
        :options="{
          position: { lat: point.lat, lng: point.lng },
          label: {
            text: `${point.id}`,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px',
          },
          icon: kilometerMarkerIcon,
          title: `Kilometer ${point.id}`,
          optimized: true,
        }"
        @click="openInfoWindow(point)"
      />

      <Circle
        v-for="point in dashboardStore.getInfluenceCircles"
        :key="`circle-${point.id}`"
        :center="{ lat: point.lat, lng: point.lng }"
        :options="{
          center: { lat: point.lat, lng: point.lng },
          radius: point.radius,
          strokeColor: '#1A73E8',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#1A73E8',
          fillOpacity: 0.35,
        }"
      />

      <InfoWindow
        :options="{
          position: infoWindowPosition,
          pixelOffset: { width: 0, height: -30 },
        }"
        :close-button="true"
        v-model="isInfoWindowOpen"
        @closeclick="closeInfoWindow"
      >
        <div class="p-2 text-gray-800">
          <h3 class="font-bold text-lg mb-2">{{ selectedPoint?.description }}</h3>
          <p class="text-sm">Kilometer: {{ selectedPoint?.kilometer }}</p>
          <p class="text-sm">Estimated Flow: {{ selectedPoint?.estimatedFlow }}</p>
          <p class="text-sm">Influence Radius: {{ selectedPoint?.radius }}m</p>

          <div v-if="selectedPoint?.streetViewPanoramaId" class="mt-3">
            <h4 class="font-semibold text-md mb-1">Street View:</h4>
            <div
              id="street-view-pano"
              class="w-[300px] h-[200px] bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
            >
              Loading Street View...
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 mt-3">No Street View available for this point.</p>
        </div>
      </InfoWindow>
    </GMapMap>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { Polyline, Marker, Circle, InfoWindow } from '@fawmi/vue-google-maps'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()

const googleMapsApiKey = import.meta.env.VITE_GMAPS_API_KEY

const mapRef = ref(null)
const mapCenter = ref({ lat: 4.73, lng: -74.065 })
const mapZoom = ref(12)

const isInfoWindowOpen = ref(false)
const infoWindowPosition = ref(null)
const selectedPoint = ref(null)
const panorama = ref(null)

let googleMapsAPI = ref(null)

const pendingStreetViewRequest = ref(null)

const onMapReady = (mapInstance) => {
  googleMapsAPI.value = mapRef.value.$mapObject
  if (pendingStreetViewRequest.value) {
    const { lat, lng } = pendingStreetViewRequest.value
    pendingStreetViewRequest.value = null
    initializeStreetView(lat, lng)
  }
}

watch(
  () => dashboardStore.getPathCoordinates,
  (newPath) => {
    if (newPath && newPath.length > 0 && mapRef.value && googleMapsAPI.value) {
      const bounds = new googleMapsAPI.value.LatLngBounds()
      newPath.forEach((coord) =>
        bounds.extend(new googleMapsAPI.value.LatLng(coord.lat, coord.lng)),
      )
      mapRef.value.$mapObject.fitBounds(bounds)
    } else {
      console.log('Skipping bounds fit: Path data, map, or Google Maps API not ready.', {
        newPath,
        mapRef: mapRef.value,
        googleMapsAPI: googleMapsAPI.value,
      })
    }
  },
  { immediate: true },
)

watch(
  () => dashboardStore.mapControls.showKilometerPoints,
  (show) => {
    if (mapRef.value && googleMapsAPI.value) {
      dashboardStore.toggleKilometerPoints(show, mapRef.value.$mapObject, googleMapsAPI.value)
    }
  },
)

watch(
  () => dashboardStore.mapControls.showInfluenceCircles,
  (show) => {
    if (mapRef.value && googleMapsAPI.value) {
      dashboardStore.toggleInfluenceCircles(show, mapRef.value.$mapObject, googleMapsAPI.value)
    }
  },
)

watch(
  () => dashboardStore.mapControls.showInterestPoints,
  (show) => {
    if (mapRef.value && googleMapsAPI.value) {
      dashboardStore.toggleInterestPoints(show, mapRef.value.$mapObject, googleMapsAPI.value)
    }
  },
)

const handleMapClick = (event) => {
  if (dashboardStore.mapControls.showInterestPoints) {
    openInfoWindow({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      name: 'Custom Point',
      description: 'Clicked Location',
      type: 'custom',
    })
  }
}

const kilometerMarkerIcon = computed(() => {
  if (!googleMapsAPI.value) {
    return null
  }
  return {
    path: googleMapsAPI.value.SymbolPath?.CIRCLE,
    fillColor: 'red',
    fillOpacity: 0.9,
    strokeWeight: 1,
    scale: 5,
  }
})

const openInfoWindow = async (point) => {
  selectedPoint.value = point
  infoWindowPosition.value = { lat: point.lat, lng: point.lng }
  isInfoWindowOpen.value = true

  await nextTick()

  if (point.streetViewPanoramaId) {
    if (mapRef.value) {
      initializeStreetView(point.lat, point.lng)
    } else {
      console.log('Google Maps API not yet ready for Street View, queuing request.')
      pendingStreetViewRequest.value = { lat: point.lat, lng: point.lng }
    }
  } else {
    if (panorama.value) {
      panorama.value = null
      const panoDiv = document.getElementById('street-view-pano')
      if (panoDiv) panoDiv.innerHTML = 'No Street View available for this point.'
      const map = mapRef.value?.map
      if (map) {
        map.setStreetView(null)
      }
    }
  }
}

const closeInfoWindow = () => {
  isInfoWindowOpen.value = false
  selectedPoint.value = null
  infoWindowPosition.value = null
  pendingStreetViewRequest.value = null
  if (panorama.value) {
    panorama.value = null
    const map = mapRef.value.$mapObject
    if (map) {
      map.setStreetView(null)
    }
  }
}

const initializeStreetView = async (lat, lng) => {
  const map = mapRef.value.$mapObject
  if (!map || !googleMapsAPI.value) {
    console.warn('Map or Google Maps API not ready for Street View initialization.')
  }

  const panoDiv = document.getElementById('street-view-pano')
  if (!panoDiv) {
    console.warn('Street View panorama div not found!')
  }

  panoDiv.innerHTML = 'Loading Street View...'
  panoDiv.classList.add('flex', 'items-center', 'justify-center')

  if (!googleMapsAPI.value.StreetViewService) {
    panoDiv.innerHTML = 'Street View Service not loaded.'
  }

  const service = new google.maps.StreetViewService()
  const radius = 50

  try {
    const { data, status } = await service.getPanorama({
      location: { lat, lng },
      radius: radius,
    })

    if (status === googleMapsAPI.value?.StreetViewStatus?.OK || data.location) {
      panoDiv.classList.remove('flex', 'items-center', 'justify-center')

      panorama.value = new google.maps.StreetViewPanorama(panoDiv, {
        pano: data.location.pano,
        pov: { heading: 270, pitch: 0 },
        zoom: 1,
        enableCloseButton: true,
      })

      map.setStreetView(panorama.value)
    } else {
      console.warn('No Street View data found for this location. Status:', status)
      panoDiv.innerHTML = 'No Street View available for this point.'
      map.setStreetView(null)
      panorama.value = null
    }
  } catch (e) {
    console.error('Error fetching Street View data:', e)
    panoDiv.innerHTML = 'Error loading Street View.'
    map.setStreetView(null)
    panorama.value = null
  }
}
</script>
