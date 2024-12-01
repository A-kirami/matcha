<script setup lang="ts">
import { open } from '@tauri-apps/plugin-shell'

import { github } from '~build/git'

const version = getVersion()

const isDark = document.documentElement.classList.contains('dark')
</script>

<template>
  <div class="relative flex flex-col items-center justify-between bg-background py-6">
    <AppLogo class="size-24" />
    <img :src="isDark ? '/matcha-text-dark.svg' : '/matcha-text-light.svg'" alt="matcha text" class="w-42">
    <div
      class="text-sm text-foreground"
      :class="{ 'cursor-pointer': version.link }"
      @click="version.link && open(version.link)"
    >
      版本: {{ version.name }}
    </div>
    <div class="mt-2 flex gap-4 text-xs">
      <div class="flex cursor-pointer items-center gap-1 hover:underline" @click="github && open(github)">
        <span i="carbon-logo-github" class="inline-block text-lg text-foreground" />
        <span class="text-muted-foreground">项目地址</span>
      </div>
      <div class="flex cursor-pointer items-center gap-1 hover:underline" @click="github && open(github + '/releases')">
        <span i="carbon-change-catalog" class="inline-block text-lg text-foreground" />
        <span class="text-muted-foreground">更新日志</span>
      </div>
      <div
        class="flex cursor-pointer items-center gap-1 hover:underline"
        @click="github && open(github + '/blob/main/LICENSE')"
      >
        <span i="carbon-certificate" class="inline-block text-lg text-foreground" />
        <span class="text-muted-foreground">开源许可</span>
      </div>
    </div>
  </div>
</template>
