<script setup lang="ts">
const settingsFormRef = $ref<(Component & { resetForm: () => void }) | null>(null)

const onImportSettings = () => {
  settingsFormRef?.resetForm()
}
</script>

<template>
  <main :class="$style.settingsLayout" class="grid gap-x-6 gap-y-4 px-4 pb-5 pt-2">
    <SettingsToolbar style="grid-area: toolbar" @import-settings="onImportSettings" />
    <SettingsTOC style="grid-area: toc" />
    <SettingsArea class="mr-8 flex-1" style="grid-area: settings">
      <RouterView v-slot="{ Component }">
        <component :is="Component" ref="settingsFormRef" class="mb-8 space-y-5" />
      </RouterView>
    </SettingsArea>
  </main>
</template>

<style module>
.settings-layout {
  grid:
    'toolbar toolbar' auto
    'toc settings' minmax(0, 1fr)
    / minmax(min-content, 22%) minmax(0, 1fr);
}
</style>
