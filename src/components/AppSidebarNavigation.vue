<script setup lang="ts">
import InlineSvg from 'vue-inline-svg'

import ChatActiveIcon from '~/assets/chat-active.svg?url'
import ChatIcon from '~/assets/chat.svg?url'
import CodeActiveIcon from '~/assets/code-active.svg?url'
import CodeIcon from '~/assets/code.svg?url'
import ServiceActiveIcon from '~/assets/service-active.svg?url'
import ServiceIcon from '~/assets/service.svg?url'
import TestActiveIcon from '~/assets/test-active.svg?url'
import TestIcon from '~/assets/test.svg?url'
import ToolActiveIcon from '~/assets/tool-active.svg?url'
import ToolIcon from '~/assets/tool.svg?url'

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
]

let activeSliderTop = $ref('')

let hoverSliderTop = $ref('')

let hoverSliderOpacity = $ref(0)

function handleSlider(event: MouseEvent) {
  const targetTop = (event.currentTarget as HTMLElement).offsetTop

  if (event.type === 'click') {
    activeSliderTop = targetTop + 'px'
  } else if (event.type === 'mouseenter') {
    hoverSliderTop = targetTop + 'px'
    hoverSliderOpacity = 0.4
  } else if (event.type === 'mouseleave') {
    hoverSliderOpacity = 0
  }
}

onMounted(() => {
  const el = document.querySelector<HTMLElement>('.navbar a.router-link-active')
  if (el) {
    activeSliderTop = el.offsetTop + 'px'
  }
})
</script>

<template>
  <nav>
    <ul class="navbar">
      <li
        v-for="navitem in navbar"
        :key="navitem.name"
        class="mb-2 size-10"
        @click="handleSlider"
        @mouseenter="handleSlider"
        @mouseleave="handleSlider"
      >
        <RouterLink
          v-slot="{ isActive }"
          :to="`/${navitem.name}`"
          class="h-full flex items-center justify-center rounded-lg"
        >
          <InlineSvg
            :src="isActive ? navitem.icon.active : navitem.icon.normal"
            class="size-6 text-gray-500 transition-transform"
            :class="{ 'active': isActive }"
          />
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  @apply flex flex-col relative;

  &::before,
  &::after {
    @apply content-empty size-10 absolute rounded-lg transition-all duration-300;
    transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  }

  &::before {
    @apply z--1 bg-blue-300 bg-opacity-60;
    top: v-bind(activeSliderTop);
  }

  &::after {
    @apply z--2 bg-blue-200;
    top: v-bind(hoverSliderTop);
    opacity: v-bind(hoverSliderOpacity);
  }

  & svg {
    @apply transition-colors duration-300;

    &.active {
      @apply text-[#70aeff];
    }
  }

  & li:hover svg {
    @apply text-[#70aeff];
  }
}
</style>
