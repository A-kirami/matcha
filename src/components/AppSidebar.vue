<template>
  <aside
    class="w-15 flex flex-col items-center gap-4 bg-white pb-5 pt-7"
    :class="[focused ? 'bg-opacity-40' : 'bg-opacity-60']"
  >
    <AppLogo class="size-9" />
    <AppSidebarNavigation />
    <AppSidebarUserAvatar class="mt-auto size-9 cursor-pointer" />
    <AppSidebarManageButton />
  </aside>
</template>
