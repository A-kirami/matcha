<script setup lang="ts">
const router = useRouter()

const routes = router.getRoutes()

const navItems = routes
  .filter((route) => route.meta.isSettings)
  .sort((a, b) => ((a.meta.position as number) ?? Infinity) - ((b.meta.position as number) ?? Infinity))
</script>

<template>
  <nav>
    <ul class="space-y-2">
      <li v-for="item in navItems" :key="item.path">
        <RouterLink v-slot="{ isActive }" :to="item.path">
          <Button
            variant="ghost"
            class="h-9 w-full justify-start text-gray-800 hover:bg-accent/80"
            dark="text-gray-300"
            :class="{ 'bg-muted/80': isActive }"
            >{{ item.meta.title }}</Button
          >
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
