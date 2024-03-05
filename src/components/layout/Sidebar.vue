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

const focused = useWindowFocus()
</script>

<template>
  <aside
    class="w-15 flex flex-col items-center justify-between bg-white"
    :class="[focused ? 'bg-opacity-40' : 'bg-opacity-60']"
  >
    <div class="mt-6">
      <img src="/matcha.webp" alt="matcha logo" class="mx-auto mb-4 h-9 w-9" />
      <nav>
        <ul class="flex flex-col">
          <li v-for="navitem in navbar" :key="navitem.name" class="navitem my-1 h-10 w-10 cursor-pointer">
            <RouterLink
              v-slot="{ isActive }"
              :to="`/${navitem.name}`"
              class="block h-full flex items-center justify-center rounded-lg"
            >
              <InlineSvg
                :src="isActive ? navitem.icon.active : navitem.icon.normal"
                class="h-6 w-6 text-zinc-400 transition-transform"
                :class="{ 'active': isActive }"
              />
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
    <div class="mb-4">
      <Avatar
        type="user"
        :aid="status.user?.id"
        :border="true"
        size="2.5rem"
        class="cursor-pointer"
        @click="() => {}"
      />
    </div>
  </aside>
</template>

<style scoped>
.active {
  @apply text-[#70aeff];
}

.navitem {
  & a.router-link-active {
    @apply bg-blue-200 bg-opacity-30;
  }

  &:hover svg:not(.active) {
    @apply text-[#70aeff];
  }
}
</style>
