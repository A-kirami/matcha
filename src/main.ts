import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { router } from '~/router'

import App from './App.vue'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'

import '~/styles/main.css'

createApp(App).use(createPinia().use(piniaPluginPersistedstate)).use(router).use(autoAnimatePlugin).mount('#app')
