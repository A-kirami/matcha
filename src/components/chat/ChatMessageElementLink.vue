<script setup lang="ts">
import { fetch } from '@tauri-apps/plugin-http'
import urlMetadata from 'url-metadata'

import type { LinkContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: LinkContent['data']
}>()

interface MetaData {
  title: string
  description: string
  image: string
  url: string
  hostname: string
}

let metadata = $ref<MetaData>()

onBeforeMount(async () => {
  const response = await fetch(data.url, { mode: 'no-cors' })
  // eslint-disable-next-line unicorn/no-null
  const result = await urlMetadata(null, { parseResponseObject: response })
  metadata = {
    title: (result.title || result['og:title'] || result['twitter:title']) as MetaData['title'],
    description: (result.description || result['og:description'] || result['twitter:description']) as MetaData['description'],
    image: (result.image || result['og:image'] || result['twitter:image']) as MetaData['image'],
    url: (result.url || result['og:url'] || result.url) as MetaData['url'],
    hostname: (result.hostname || result['expected-hostname'] || new URL(data.url).hostname) as MetaData['hostname'],
  }
})
</script>

<template>
  <div data-type="link">
    <a :href="data.url" class="break-all text-blue-400 font-medium underline hover:no-underline">{{ data.url }}</a>
    <a v-if="metadata?.image" :href="metadata.url">
      <div
        class="mt-2 border border-gray-200 rounded-xl p-3 transition-colors dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
      >
        <img :src="metadata.image" class="mb-2 rounded-lg" alt="image">
        <div class="text-sm text-gray-900 font-medium dark:text-white">
          {{ metadata.title }}
        </div>
        <span class="text-xs text-gray-500 font-normal dark:text-gray-400">{{ metadata.hostname }}</span>
      </div>
    </a>
  </div>
</template>
