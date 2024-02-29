<script setup lang="ts">
import { getAudioData, linearPath } from 'waveform-path'

const {
  src,
  waveWidth = 220,
  waveHeight = 32,
  color = '#858a8d',
  waveColor = '#c4c4c4',
  waveSlider = '#4fc3f7',
  waveProgessColor = '#4fc3f7',
  waveType = 'mirror',
} = defineProps<{
  src: string
  waveWidth?: number
  waveHeight?: number
  color?: string
  waveColor?: string
  waveProgessColor?: string
  waveSlider?: string
  waveType?: string
}>()

interface Options {
  samples: number
  type: string
  width: number
  height: number
  paths: { d: string; sy: number; x: number; ey: number }[]
  channel: number
  top: number
  left: number
  animation: boolean
  animationframes: number
  normalize: boolean
}

const options: Options = $ref({
  samples: 40,
  type: waveType,
  width: waveWidth,
  height: waveHeight,
  paths: [{ d: 'V', sy: 0, x: 50, ey: 100 }],
  channel: 0,
  top: 0,
  left: 0,
  animation: false,
  animationframes: 10,
  normalize: true,
})

let clipPathX = $ref('left-to-right-x')
let clipPathA = $ref('left-to-right')
let playPath = 'M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3l-14.4 8.3c-1.4.8-2.6.2-2.6-1.5V8.7z'
let pausePath =
  'M9.2 25c0 .5.4 1 .9 1h3.6c.5 0 .9-.4.9-1V9c0-.5-.4-.9-.9-.9h-3.6c-.4-.1-.9.3-.9.9v16zm11-17c-.5 0-1 .4-1 .9V25c0 .5.4 1 1 1h3.6c.5 0 1-.4 1-1V9c0-.5-.4-.9-1-.9 0-.1-3.6-.1-3.6-.1z'
let playIcon = $ref<SVGPathElement | null>(null)
let svg = $ref<SVGSVGElement | null>(null)
let path1 = $ref<SVGTextPathElement | null>(null)
let path2 = $ref<SVGTextPathElement | null>(null)
let animationsvg = $ref<SVGAnimateElement | null>(null)
let animationsvgx = $ref<SVGAnimateElement | null>(null)
let audio = $ref<HTMLAudioElement | null>(null)
let duration = $ref<HTMLDivElement | null>(null)
let seekSlider = $ref<HTMLInputElement | null>(null)
let currentTime = $ref<HTMLDivElement | null>(null)
let playButton = $ref<HTMLButtonElement | null>(null)
let raf = $ref<number>(0)
let audioData = $ref<AudioBuffer | null>(null)

onBeforeMount(async () => {
  await audioPath()
})

onMounted(() => {
  svg?.pauseAnimations()
  if (audio!.readyState > 0) {
    loadSong()
  } else {
    audio?.addEventListener('loadedmetadata', loadSong)
  }
  audio?.addEventListener('ended', onFinish)
  seekSlider?.addEventListener('input', sliderInput)
  seekSlider?.addEventListener('change', sliderChange)
  playButton?.addEventListener('click', playPause)
  clipPathX += '-' + Math.random().toString(36).slice(2)
  clipPathA += '-' + Math.random().toString(36).slice(2)
})

const loadSong = () => {
  duration!.textContent = calculateTime(audio!.duration)
  seekSlider!.max = audio!.duration.toString()
  svg!.unpauseAnimations()
  animationsvg?.setAttribute('dur', '' + audio?.duration + 's')
  if (!options.animation) {
    animationsvgx?.setAttribute('dur', '' + audio?.duration + 's')
  }
  svg?.pauseAnimations()
  svg?.setCurrentTime(0)
}

const playPause = () => {
  if (audio!.paused) {
    audio!.play()
    svg!.unpauseAnimations()
    path2!.style.display = 'block'
    playIcon!.setAttribute('d', pausePath)
    raf = requestAnimationFrame(whilePlaying)
  } else {
    audio!.pause()
    svg!.pauseAnimations()
    playIcon!.setAttribute('d', playPath)
    cancelAnimationFrame(raf)
  }
}

const sliderInput = () => {
  path2!.style.display = 'block'
  currentTime!.textContent = calculateTime(Number(seekSlider!.value))
  svg!.setCurrentTime(Number(seekSlider!.value))
  if (!audio!.paused) {
    cancelAnimationFrame(raf)
  }
}

const sliderChange = () => {
  audio!.currentTime = Number(seekSlider!.value)
  path2!.style.display = 'block'
  svg!.setCurrentTime(Number(seekSlider!.value))

  if (!audio!.paused) {
    raf = requestAnimationFrame(whilePlaying)
  }
}

const onFinish = () => {
  seekSlider!.value = seekSlider!.max
  svg!.setCurrentTime(audio!.duration)
  svg!.pauseAnimations()
  playIcon!.setAttribute('d', playPath)
  cancelAnimationFrame(raf)
}

const whilePlaying = () => {
  seekSlider!.value = audio!.currentTime.toString()
  currentTime!.textContent = calculateTime(Number(seekSlider!.value))
  svg?.setCurrentTime(Number(seekSlider!.value))
  raf = requestAnimationFrame(whilePlaying)
}

async function audioPath() {
  audioData = await getAudioData(src)
  svgDraw()
}

const svgDraw = () => {
  const path = linearPath(audioData as AudioBuffer, options)
  if (!options.animation) {
    path1?.setAttribute('d', path)
    path2?.setAttribute('d', path)
  } else {
    animationsvg?.setAttribute('values', path)
  }
  svg?.setCurrentTime(Number(seekSlider?.value))
}

const calculateTime = (secs: number): string => {
  const minutes = Math.floor(secs / 60)
  const seconds = Math.floor(secs % 60)
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`
  return `${minutes}:${returnedSeconds}`
}

const playerRef = $ref<HTMLDivElement | null>(null)
const hoverPlayer = useElementHover($$(playerRef), { delayLeave: 1500 })
</script>

<template>
  <div ref="playerRef" part="player" class="player">
    <Transition name="fade">
      <button v-show="hoverPlayer" id="play" ref="playButton" part="play">
        <svg viewBox="0 0 34 34" width="34" height="34" part="button">
          <path
            id="playPathButton"
            ref="playIcon"
            d="M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3l-14.4 8.3c-1.4.8-2.6.2-2.6-1.5V8.7z"
          ></path>
        </svg>
      </button>
    </Transition>
    <div id="current-time" ref="currentTime" part="currenttime">0:00</div>
    <div id="slider" part="slider">
      <svg
        id="svg"
        ref="svg"
        part="svg"
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="`0 0 ${waveWidth} ${waveHeight}`"
        :width="waveWidth"
        :height="waveHeight"
      >
        <template v-if="!options.animation">
          <defs>
            <clipPath :id="clipPathX">
              <rect x="-1" y="-100" :width="waveWidth + 2" :height="waveHeight + 200">
                <animate
                  id="animationsvgx"
                  ref="animationsvgx"
                  attributeName="x"
                  :values="`-1;${waveWidth + 2}`"
                  dur="99999s"
                  fill="freeze"
                />
              </rect>
            </clipPath>
            <clipPath :id="clipPathA">
              <rect :x="-1 * (waveWidth + 2)" y="-100" :width="waveWidth + 2" :height="waveHeight + 200">
                <animate
                  id="animationsvg"
                  ref="animationsvg"
                  attributeName="x"
                  :values="`-${waveWidth + 2};-1`"
                  dur="99999s"
                  fill="freeze"
                />
              </rect>
            </clipPath>
          </defs>
          <path id="path1" ref="path1" part="path1" stroke-width="2" d="" :clip-path="`url(#${clipPathX})`"></path>
          <path
            id="path2"
            ref="path2"
            part="path2"
            stroke-width="2"
            d=""
            :clip-path="`url(#${clipPathA})`"
            style="display: none"
          ></path>
        </template>
        <template v-else>
          <path id="path1" ref="path1" part="path1" stroke-width="2" style="display: none"></path>
          <path id="path2" ref="path2" part="path2" stroke-width="2" style="display: block">
            <animate
              id="animationsvg"
              ref="animationsvg"
              attributeName="d"
              dur="99999s"
              calcMode="linear"
              values=""
              fill="freeze"
            ></animate>
          </path>
        </template>
      </svg>
      <input id="seek-slider" ref="seekSlider" type="range" part="input" max="100" value="0" step="any" />
    </div>
    <div id="duration" ref="duration" part="duration">0:00</div>
    <audio ref="audio" :src="src"></audio>
  </div>
</template>

<style scoped>
/* stylelint-disable value-keyword-case */
*,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
}

:host {
  display: flex;
}

.player {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  padding: 2px;
  margin: 0;
  cursor: pointer;
  background: hsl(0deg 0% 91%);
  border: none;
  border-radius: 999px;
  transition: all 0.3s ease;
  transform: translate(-50%, -50%);
}

#play:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

#play svg {
  position: relative;
  top: -0.5px;
  fill: v-bind(color);
}

#play svg path {
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: 0.2s;
}

#svg {
  margin: 0 10px;
  overflow: visible;
  fill: none;
  stroke-width: 1px;
}

#path1 {
  overflow: visible;
  stroke: v-bind(waveColor);
  stroke-linecap: round;
}

#path2 {
  overflow: visible;
  stroke: v-bind(waveProgessColor);
  stroke-linecap: round;
}

#slider {
  position: relative;
}

#duration,
#current-time {
  position: relative;
  min-width: 32px;
  margin: 0 10px;
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  font-size: 16px;
  color: v-bind(color);
}

#seek-slider {
  position: absolute;
  left: 0;
  display: none;
  width: 100%;
}

input[type='range'] {
  width: 100%;

  /* height: v-bind('`${waveHeight}px`'); */
  padding: 0;
  margin: 0;
  appearance: none;
  background: transparent;
  border: 0;
}

input[type='range']::-webkit-slider-thumb {
  position: relative;
  width: 12.5px;

  /* top: -1.5px; */
  height: 12.5px;
  appearance: none;
  cursor: pointer;
  background: v-bind(waveSlider);
  border-radius: 50%;
  box-shadow: none;
  transition: transform 0.3s;
}

input[type='range']:focus {
  outline: none;
}

input[type='range']::-ms-track {
  width: 100%;
  color: transparent;
  cursor: pointer;

  /* Hides the slider so custom styles can be added */
  background: transparent;
  border-color: transparent;
}

input[type='range']:active::-webkit-slider-thumb {
  transform: scale(1.5);
}

input[type='range']::-moz-range-thumb {
  width: 12.5px;
  height: 12.5px;
  cursor: pointer;
  background: v-bind(waveSlider);
  border: 0;
  border-radius: 50%;
  box-shadow: none;
}

input[type='range']:active::-moz-range-thumb {
  transform: scale(1.5);
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>
