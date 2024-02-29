<script setup lang="ts">
import hljsVuePlugin from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

import 'highlight.js/styles/stackoverflow-light.css'

hljs.registerLanguage('json', json)

const { language, code } = defineProps<{
  language: string
  code: string
}>()

const HighlightJs = hljsVuePlugin.component

const preCode = $ref<InstanceType<typeof HighlightJs> | null>(null)

onMounted(() => {
  const codeEl = (preCode!.$el as HTMLPreElement).firstChild as HTMLElement
  if (codeEl) {
    const codeSpan = codeEl.getElementsByTagName('span')
    for (let index = 0; index < codeSpan.length; index++) {
      const element = codeSpan[index]
      if (element.innerText.startsWith('"base64://')) {
        element.classList.add('line-fold')
      }
    }
  }
})
</script>

<template>
  <HighlightJs ref="preCode" :language="language" :code="code"></HighlightJs>
</template>
