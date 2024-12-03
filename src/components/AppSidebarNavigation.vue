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
  .filter(route => route.meta.navDisplay)
  .map((route) => {
    return {
      path: route.path,
      position: (route.meta.position as number) ?? Infinity,
      icon: {
        normal: getAssetsUrl(`navbar/${route.meta.icon as string}`),
        active: getAssetsUrl(`navbar/${route.meta.activeIcon as string}`),
      },
    }
  })
  .sort((a, b) => a.position - b.position)

let activeSliderTop = $ref('')

let activeSliderOpacity = $ref(0.6)

let hoverSliderTop = $ref('')

let hoverSliderOpacity = $ref(0)

function handleSlider(event: MouseEvent) {
  const targetTop = (event.currentTarget as HTMLElement).offsetTop

  switch (event.type) {
    case 'click': {
      activeSliderTop = targetTop + 'px'

      break
    }
    case 'mouseenter': {
      hoverSliderTop = targetTop + 'px'
      hoverSliderOpacity = 0.4

      break
    }
    case 'mouseleave': {
      hoverSliderOpacity = 0

      break
    }
    // no default
  }
}

const cssModule = useCssModule()

function checkRouteInNavItems(routePath: string) {
  return navItems.some(navItem => routePath.startsWith(navItem.path))
}

watch(
  router.currentRoute,
  async (to) => {
    const isRouteInNavItems = checkRouteInNavItems(to.path)

    if (isRouteInNavItems) {
      await nextTick()
      const el = document.querySelector<HTMLElement>(`.${cssModule.navbar} a.router-link-active`)
      if (el) {
        activeSliderTop = el.offsetTop + 'px'
      }
      activeSliderOpacity = 0.6
    } else {
      activeSliderOpacity = 0
    }
  },
  { immediate: true },
)
</script>

<template>
  <nav>
    <ul :class="$style.navbar" class="relative flex flex-col space-y-2">
      <li
        v-for="navItem in navItems"
        :key="navItem.path"
        class="size-10 svg:hover:text-[#70aeff]"
        @click="handleSlider"
        @mouseenter="handleSlider"
        @mouseleave="handleSlider"
      >
        <RouterLink
          v-slot="{ isActive }"
          :to="navItem.path"
          class="h-full flex items-center justify-center rounded-lg text-gray-500"
          dark="text-gray-400"
        >
          <InlineSvg
            :src="isActive ? navItem.icon.active : navItem.icon.normal"
            class="size-6 transition-colors duration-300"
            :class="{ 'text-[#70aeff]': isActive }"
          />
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style module>
.navbar {
  &::before,
  &::after {
    @apply content-empty size-10 absolute rounded-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)];
  }

  &::before {
    @apply -z-1 bg-blue-300;

    top: v-bind(activeSliderTop);
    opacity: v-bind(activeSliderOpacity);
  }

  &::after {
    @apply -z-2 bg-blue-200;

    top: v-bind(hoverSliderTop);
    opacity: v-bind(hoverSliderOpacity);
  }
}
</style>
