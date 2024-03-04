<script setup lang="ts">
import InlineSvg from 'vue-inline-svg'

import ChatActiveIcon from '~/assets/chat-active.svg?url'
import ChatIcon from '~/assets/chat.svg?url'
import CodeActiveIcon from '~/assets/code-active.svg?url'
import CodeIcon from '~/assets/code.svg?url'
import ServiceActiveIcon from '~/assets/service-active.svg?url'
import ServiceIcon from '~/assets/service.svg?url'
import SettingActiveIcon from '~/assets/setting-active.svg?url'
import SettingIcon from '~/assets/setting.svg?url'
import TestActiveIcon from '~/assets/test-active.svg?url'
import TestIcon from '~/assets/test.svg?url'
import ToolActiveIcon from '~/assets/tool-active.svg?url'
import ToolIcon from '~/assets/tool.svg?url'

const status = useStatusStore()

interface NavItem {
  name: string
  icon: {
    normal: string
    active: string
  }
}

const navbar: NavItem[] = [
  {
    name: 'chat',
    icon: {
      normal: ChatIcon,
      active: ChatActiveIcon,
    },
  },
  {
    name: 'code',
    icon: {
      normal: CodeIcon,
      active: CodeActiveIcon,
    },
  },
  {
    name: 'service',
    icon: {
      normal: ServiceIcon,
      active: ServiceActiveIcon,
    },
  },
  {
    name: 'test',
    icon: {
      normal: TestIcon,
      active: TestActiveIcon,
    },
  },
  {
    name: 'tool',
    icon: {
      normal: ToolIcon,
      active: ToolActiveIcon,
    },
  },
  {
    name: 'setting',
    icon: {
      normal: SettingIcon,
      active: SettingActiveIcon,
    },
  },
]
</script>

<template>
  <aside class="h-screen w-16 flex flex-col items-center border-r border-light-700 px-2 py-6" dark="border-dark-400">
    <div class="mb-5">
      <img src="/matcha.webp" alt="matcha logo" class="h-10 w-10" />
    </div>
    <nav>
      <ul class="flex flex-col">
        <li v-for="navitem in navbar" :key="navitem.name" class="navitem my-3 cursor-pointer">
          <RouterLink v-slot="{ isActive }" :to="`/${navitem.name}`" class="block h-full px-1 py-2">
            <InlineSvg
              :src="isActive ? navitem.icon.active : navitem.icon.normal"
              class="text-zinc-400 transition-transform"
              :class="{ 'active': isActive }"
            />
          </RouterLink>
        </li>
      </ul>
    </nav>
    <div class="mt-auto flex flex-col items-center">
      <ThemeSwitch />
      <Avatar
        type="user"
        :aid="status.user?.id"
        :border="true"
        size="2.8rem"
        class="cursor-pointer"
        @click="() => {}"
      />
    </div>
  </aside>
</template>

<style scoped>
.active {
  @apply text-[#70aeff] scale-110;
}

.navitem:hover svg:not(.active) {
  @apply text-[#70aeff] scale-110;
}
</style>
