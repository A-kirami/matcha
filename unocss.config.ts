import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetAnimations } from 'unocss-preset-animations'
import { presetScrollbar } from 'unocss-preset-scrollbar'
import { presetShadcn } from 'unocss-preset-shadcn'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetScrollbar(),
    presetAnimations(),
    presetShadcn({
      color: {
        base: 'blue',
        light: { primary: '213 94% 68%', ring: '213 94% 68%' },
        dark: { background: '222 22% 15%', primary: '210 100% 75%', ring: '210 100% 75%', popover: '222 22% 15%' },
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    pipeline: {
      include: ['src/**/*.{vue,svelte,[jt]s,[jt]sx,md?(x),astro,elm,php,phtml,html}'],
    },
  },
})
