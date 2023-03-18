import { createRouter, createWebHistory } from 'vue-router'

import { useStatusStore } from '@/stores'

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
              beforeEnter: (to) => {
                if (!Number(to.params.chatId)) {
                  return '/chat'
                }
              },
            },
          ],
        },
        {
          name: 'code',
          path: '/code',
          component: () => import('@/views/EmptyStage.vue'),
        },
        {
          name: 'service',
          path: '/service',
          component: () => import('@/views/EmptyStage.vue'),
        },
        {
          name: 'test',
          path: '/test',
          component: () => import('@/views/EmptyStage.vue'),
        },
        {
          name: 'tool',
          path: '/tool',
          component: () => import('@/views/EmptyStage.vue'),
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
