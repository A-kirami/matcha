/* eslint-disable new-cap */
import { join } from 'path'

import Vue from '@vitejs/plugin-vue'
import { internalIpV4 } from 'internal-ip'
import postcssPresetEnv from 'postcss-preset-env'
import UnoCSS from 'unocss/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'
import Eslint from 'vite-plugin-eslint'
import Stylelint from 'vite-plugin-stylelint'

const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM)

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const isDev = mode === 'development'

  const plugins = [
    VueMacros({
      plugins: {
        vue: Vue(),
      },
    }),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    UnoCSS(),
  ]

  if (!isDev) {
    plugins.push(Eslint(), Stylelint())
  }

  return {
    plugins,

    resolve: {
      alias: {
        '@': join(__dirname, 'src'),
      },
    },

    css: {
      postcss: {
        plugins: [
          postcssPresetEnv({
            stage: 3,
            features: {
              'nesting-rules': true,
            },
          }),
        ],
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
  }
})
