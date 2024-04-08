<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { commandFn } from '~/command'

let open = $(defineModel('open', { default: false }))

const { Meta_J, Ctrl_J } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
    }
  },
})

watch([Meta_J, Ctrl_J], (v) => {
  if (v[0] || v[1]) {
    handleOpenChange()
  }
})

function handleOpenChange() {
  open = !open
}
</script>

<template>
  <CommandDialog v-model:open="open">
    <CommandInput placeholder="输入命令或搜索..." />
    <CommandList>
      <CommandEmpty>未找到结果</CommandEmpty>
      <CommandGroup heading="调试">
        <CommandItem
          value="openDevtools"
          @click="
            () => {
              commandFn.openDevtools()
              open = false
            }
          "
          >打开控制台</CommandItem
        >
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
