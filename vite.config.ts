/* eslint-disable new-cap */
import { join } from 'path'

import vue from '@vitejs/plugin-vue'
import postcssPresetEnv from 'postcss-preset-env'
import UnoCSS from 'unocss/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import stylelint from 'vite-plugin-stylelint'
import SvgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default ({ mode }) => {
  const isDev = mode === 'development'

  const plugins = [
    vue({
      reactivityTransform: true,
    }),
    UnoCSS(),
    SvgLoader(),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
  ]

  if (!isDev) {
    plugins.push(eslint(), stylelint())
  }

  return defineConfig({
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
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
    },
    // to make use of `TAURI_DEBUG` and other env variables
    // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
    envPrefix: ['VITE_', 'TAURI_'],
    build: {
      // Tauri supports es2021
      target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG,
    },
  })
}
