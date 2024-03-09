<script setup lang="ts">
import InlineSvg from 'vue-inline-svg'

interface NavItem {
  path: string
  position: number
  icon: {
    normal: string
    active: string
  }
}

const router = useRouter()

const routes = router.getRoutes()

const navItems: NavItem[] = routes
  .filter((route) => route.meta.navDisplay)
  .map((route) => {
    return {
      path: route.path,
      position: (route.meta.position as number) ?? 0,
      icon: {
        normal: getAssetsUrl(route.meta.icon as string),
        active: getAssetsUrl(route.meta.activeIcon as string),
      },
    }
  })
  .sort((a, b) => a.position - b.position)

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
        v-for="navItem in navItems"
        :key="navItem.path"
        class="mb-2 size-10"
        @click="handleSlider"
        @mouseenter="handleSlider"
        @mouseleave="handleSlider"
      >
        <RouterLink v-slot="{ isActive }" :to="navItem.path" class="h-full flex items-center justify-center rounded-lg">
          <InlineSvg
            :src="isActive ? navItem.icon.active : navItem.icon.normal"
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
