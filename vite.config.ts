/* eslint-disable new-cap */
import { resolve } from 'node:path'

import Vue from '@vitejs/plugin-vue'
import { internalIpV4 } from 'internal-ip'
import postcssNesting from 'postcss-nesting'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'

const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM)

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
      },
      betterDefine: false,
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        {
          '@tauri-apps/plugin-log': [['*', 'logger']],
        },
        {
          from: 'src/database',
          imports: ['User', 'Friend', 'Group', 'Member'],
          type: true,
        },
      ],
      dirs: ['src/composables', 'src/database', 'src/stores', 'src/utils'],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
    Components({
      dirs: ['src/components', 'src/views', 'src/layouts'],
      dts: 'src/components.d.ts',
    }),
    UnoCSS(),
    TurboConsole(),
    VueDevTools(),
  ],

  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },

  css: {
    postcss: {
      plugins: [postcssNesting()],
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: mobile ? '0.0.0.0' : false,
    hmr: mobile
      ? {
          protocol: 'ws',
          host: await internalIpV4(),
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}))
