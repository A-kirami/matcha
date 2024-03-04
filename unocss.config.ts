import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetAnimations } from 'unocss-preset-animations'
import { presetScrollbar } from 'unocss-preset-scrollbar'
import { presetShadcn } from 'unocss-preset-shadcn'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons(), presetScrollbar(), presetAnimations(), presetShadcn()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
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
  content: {
    pipeline: {
      include: ['src/**/*.{vue,svelte,[jt]s,[jt]sx,md?(x),astro,elm,php,phtml,html}'],
    },
  },
})
