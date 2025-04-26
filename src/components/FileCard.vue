<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import mime from 'mime/lite'

const { id, name, size, type, downloadable } = $defineProps<
  {
    id: string
    name: string
    size: number
    type?: string | FileType
    downloadable?: boolean
  }
>()

defineEmits<(e: 'download') => void>()

function getFileType() {
  if (!type) {
    return {
      type: mime.getType(name),
      extension: mime.getExtension(name),
    }
  }
  if (typeof type === 'string') {
    return {
      type,
      extension: mime.getExtension(name) || type.split('/').at(-1),
    }
  }
  return {
    type: type.mimeType,
    extension: type.extension,
  }
}

const fileType = getFileType()
const [category] = (fileType.type || '').split('/')
const supported = new Set(['image', 'audio', 'video'])
const categorySupported = supported.has(category) ? (category as 'image' | 'audio' | 'video') : 'file'

let fileUrl = $ref('')

onMounted(async () => {
  fileUrl = await getFile(GetType.URL, id)
})
</script>

<template>
  <div
    data-type="file"
    :data-file-id="id"
    :data-file-type="categorySupported"
    :data-file-url="fileUrl"
    class="w-56 inline-flex select-none items-center gap-2 border border-muted-foreground rounded-md p-2"
    contenteditable="false"
  >
    <FileIcon :type="categorySupported" class="size-10 flex-shrink-0" />
    <div class="flex flex-col overflow-auto">
      <span class="mb-1 truncate text-foreground font-medium">{{ name }}</span>
      <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{{ formatBytes(size) }}</span>
        <svg class="size-1 text-muted-foreground" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25" cy="25" r="25" fill="currentColor" />
        </svg>
        <span>{{ fileType.extension?.toUpperCase() || 'FILE' }}</span>
      </span>
    </div>
    <Button v-if="downloadable" variant="ghost" size="icon" class="size-8" @click="$emit('download')">
      <Download class="size-6 stroke-1.5 text-muted-foreground" />
    </Button>
  </div>
</template>
