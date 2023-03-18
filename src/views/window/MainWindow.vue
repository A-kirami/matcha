<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { watch } from 'vue'

import Loading from '@/components/Loading.vue'
import Sidebar from '@/components/Sidebar.vue'
import Titlebar from '@/components/Titlebar.vue'
import { db } from '@/database'
import { useStatusStore, useAdapterStore } from '@/stores'

const status = useStatusStore()
const adapter = useAdapterStore()

watch(
  () => status.assignBot,
  async (botId) => {
    if (botId) {
      status.bot = (await db.users.get(botId)) || null
      await adapter.bot.reboot()
    }
  },
  { immediate: true }
)

watch(
  () => status.assignUser,
  async (userId) => {
    if (userId) {
      status.user = (await db.users.get(userId)) || null
    }
  },
  { immediate: true }
)
</script>

<template>
  <Loading v-if="status.isLoading" />
  <a-config-provider :locale="zhCN">
    <main
      class="h-screen flex flex-row bg-light-50 text-gray-700 transition-colors duration-500"
      dark="text-gray-400 bg-dark-800"
    >
      <Sidebar />
      <div class="w-full flex flex-col justify-self-stretch">
        <Titlebar />
        <div class="stage">
          <RouterView v-slot="{ Component }">
            <KeepAlive>
              <component :is="Component" />
            </KeepAlive>
          </RouterView>
        </div>
      </div>
    </main>
  </a-config-provider>
</template>

<style scoped lang="postcss">
.stage {
  height: calc(100vh - 2.5rem);
}
</style>
