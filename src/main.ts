import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import VueGoogleMaps from '@fawmi/vue-google-maps'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const VITE_GMAPS_API_KEY = import.meta.env.VITE_GMAPS_API_KEY

if (!VITE_GMAPS_API_KEY) {
  console.error('VITE_GMAPS_API_KEY is not defined in your .env file!')
} else {
  app.use(VueGoogleMaps, {
    load: {
      key: VITE_GMAPS_API_KEY,
      libraries: 'places', // , geometry, drawing
    },
  })
}

app.mount('#app')
