import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { router } from '~/router'

import App from './App.vue'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'

import '~/styles/main.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
  .use(router)
  .use(autoAnimatePlugin)
  .mount('#app')
