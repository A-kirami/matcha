import { createRouter, createWebHistory } from 'vue-router'

import { useStatusStore, useSessionStore } from '@/stores'

import type { State } from '@/stores/session'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/window/MainWindow.vue'),
      redirect: '/chat',
      children: [
        {
          name: 'chat',
          path: '/chat',
          component: () => import('@/views/ChatStage.vue'),
          beforeEnter: (to) => {
            if (to.name !== 'session') {
              const status = useStatusStore()
              return status.latelySession || true
            }
          },
          children: [
            {
              name: 'session',
              path: ':chatType(private|group)/:chatId(\\d+)',
              components: {
                default: () => import('@/components/ChatBox.vue'),
                action: () => import('@/components/ChatAction.vue'),
              },
              props: { default: true, action: true },
              beforeEnter: async (to) => {
                if (!Number(to.params.chatId)) {
                  return '/chat'
                }
                const session = useSessionStore()
                await session.loadSessionState(
                  to.fullPath,
                  to.params.chatType as State['type'],
                  to.params.chatId as State['id']
                )
              },
            },
          ],
        },
        {
          name: 'code',
          path: '/code',
          component: () => import('@/components/JumbotronDev.vue'),
        },
        {
          name: 'service',
          path: '/service',
          component: () => import('@/components/JumbotronDev.vue'),
        },
        {
          name: 'test',
          path: '/test',
          component: () => import('@/components/JumbotronDev.vue'),
        },
        {
          name: 'tool',
          path: '/tool',
          component: () => import('@/components/JumbotronDev.vue'),
        },
        {
          name: 'setting',
          path: '/setting',
          component: () => import('@/views/SettingStage.vue'),
        },
      ],
    },
    {
      name: 'preview',
      path: '/preview/:type(image|video)',
      component: () => import('@/views/window/PreviewWindow.vue'),
      props: true,
    },
  ],
})
