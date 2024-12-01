<script setup lang="ts">
import { Play, Pause } from 'lucide-vue-next'
import WaveSurfer from 'wavesurfer.js'

import type { AudioContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: AudioContent['data']
}>()

const waveformId = 'waveform-' + crypto.randomUUID()

let wavesurfer = $ref<WaveSurfer>()

let isPlaying = $ref(false)

let remainingTime = $ref<string>()

onMounted(() => {
  wavesurfer = WaveSurfer.create({
    container: `#${waveformId}`,
    width: 180,
    height: 36,
    waveColor: '#c4c4c4',
    progressColor: '#4fc3f7',
    cursorWidth: 0,
    url: data.url,
    renderFunction: (channels, ctx) => {
      const { width, height } = ctx.canvas
      const scale = channels[0].length / width
      const step = 4

      ctx.lineWidth = 1.5
      ctx.translate(0, height / 2)
      ctx.strokeStyle = ctx.fillStyle
      ctx.beginPath()

      for (let i = 0; i < width; i += step * 2) {
        const index = Math.floor(i * scale)
        const value = Math.abs(channels[0][index])
        let x = i
        let y = (height / 2) * value

        ctx.moveTo(x, 0)
        ctx.lineTo(x, y)
        ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, true)
        ctx.lineTo(x + step, 0)

        x = x + step
        y = -y
        ctx.moveTo(x, 0)
        ctx.lineTo(x, y)
        ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, false)
        ctx.lineTo(x + step, 0)
      }

      ctx.stroke()
      ctx.closePath()
    },
  })

  wavesurfer.on('ready', updateRemainingTime)
  wavesurfer.on('audioprocess', updateRemainingTime)
  wavesurfer.on('seeking', updateRemainingTime)
})

async function handleClick() {
  if (wavesurfer?.isPlaying()) {
    wavesurfer?.pause()
    isPlaying = false
  } else {
    await wavesurfer?.play()
    isPlaying = true
  }
}

function updateRemainingTime() {
  if (wavesurfer) {
    const remaining = wavesurfer.getDuration() - wavesurfer.getCurrentTime()
    const minutes = Math.floor(remaining / 60)
    const seconds = Math.floor(remaining % 60)
    remainingTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }
}
</script>

<template>
  <div data-type="audio" class="flex items-center gap-1 text-background">
    <Button
      variant="ghost"
      size="icon"
      class="size-9 svg:fill-background svg:hover:fill-foreground"
      @click="handleClick"
    >
      <Pause v-if="isPlaying" class="stroke-1" />
      <Play v-else class="stroke-1" />
    </Button>
    <div :id="waveformId" class="whitespace-normal" />
    <span v-if="remainingTime" class="mx-2">{{ remainingTime }}</span>
  </div>
</template>
