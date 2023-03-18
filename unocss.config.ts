import { defineConfig, presetUno, presetAttributify, presetIcons, transformerDirectives } from 'unocss'
import { presetScrollbar } from 'unocss-preset-scrollbar'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons(), presetScrollbar()],
  transformers: [transformerDirectives()],
})
