/* eslint-disable new-cap */
import path from 'node:path'

import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import postcssNesting from 'postcss-nesting'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Info from 'unplugin-info/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import MetaLayouts from 'vite-plugin-vue-meta-layouts'

import type { UserConfig } from 'vite'

const host = process.env.TAURI_DEV_HOST

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
        vueJsx: vueJsx(),
        vueRouter: VueRouter({
          routesFolder: 'src/views',
          dts: 'src/typed-router.d.ts',
        }),
      },
      betterDefine: false,
    }),
    MetaLayouts(),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        'pinia',
        VueRouterAutoImports,
        {
          '@tauri-apps/plugin-log': [['*', 'logger']],
        },
      ],
      dirs: [
        'src/composables',
        'src/database',
        'src/stores',
        'src/utils',
        {
          glob: 'src/types',
          types: true,
        },
      ],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
    Components({
      dts: 'src/components.d.ts',
    }),
    UnoCSS(),
    Info({
      meta: {
        isBuild: process.env.GITHUB_WORKFLOW === 'Build',
        isRelease: process.env.GITHUB_WORKFLOW === 'Release',
        prNum: process.env.GITHUB_PR_NUMBER,
        buildSha: process.env.GITHUB_BUILD_SHA,
      },
    }),
    TurboConsole(),
    VueDevTools(),
  ],

  resolve: {
    alias: {
      '~/': `${path.resolve(import.meta.dirname, 'src')}/`,
    },
  },

  css: {
    postcss: {
      plugins: [postcssNesting()],
    },
    modules: {
      localsConvention: 'camelCaseOnly',
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
    host: host ?? false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
} satisfies UserConfig)
