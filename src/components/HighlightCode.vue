<script setup lang="ts">
import hljsVuePlugin from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

import 'highlight.js/styles/atom-one-dark.css'

hljs.registerLanguage('json', json)

const { language, code } = $defineProps<{
  language: string
  code: string
}>()

const HighlightJs = hljsVuePlugin.component

const preCode = $ref<InstanceType<typeof HighlightJs>>()

onMounted(() => {
  const codeEl = (preCode!.$el as HTMLPreElement).firstChild as HTMLElement
  if (codeEl) {
    const codeSpan = codeEl.querySelectorAll('span')
    for (const element of codeSpan) {
      if (element.textContent?.startsWith('"base64://')) {
        element.classList.add('line-clamp-3 cursor-pointer')
        element.addEventListener('click', () => {
          element.classList.toggle('line-clamp-3')
        })
      }
    }
  }
})
</script>

<template>
  <HighlightJs ref="preCode" :language="language" :code="code" />
</template>
