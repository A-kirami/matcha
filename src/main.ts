import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VueVirtualScroller from 'vue-virtual-scroller'

import { router } from '~/router'

import App from './App.vue'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import 'overlayscrollbars/overlayscrollbars.css'
import 'ant-design-vue/es/message/style/css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

import './styles/main.css'

createApp(App)
  .use(createPinia().use(piniaPluginPersistedstate))
  .use(router)
  .use(autoAnimatePlugin)
  .use(VueVirtualScroller)
  .use(ContextMenu)
  .mount('#app')
