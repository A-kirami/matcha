import { defineConfig, presetUno, presetAttributify, presetIcons, transformerDirectives } from 'unocss'
import { presetScrollbar } from 'unocss-preset-scrollbar'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons(), presetScrollbar()],
  transformers: [transformerDirectives()],
  rules: [
    [
      /^restrict-rows-(\d+)$/,
      ([, d]) => ({
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': d,
      }),
    ],
  ],
})
