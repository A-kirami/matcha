import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'

import { router } from '@/router'

import App from './App.vue'

import './style.css'

// eslint-disable-next-line import/no-unresolved
import 'uno.css'
import '@unocss/reset/tailwind.css'
import 'virtual:unocss-devtools'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import 'overlayscrollbars/overlayscrollbars.css'
import 'ant-design-vue/es/message/style/css'

createApp(App)
  .use(createPinia().use(piniaPluginPersistedstate))
  .use(router)
  .use(autoAnimatePlugin)
  .use(VueVirtualScroller)
  .mount('#app')
