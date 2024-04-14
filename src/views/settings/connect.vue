<route lang="yaml">
meta:
  isSettings: true
  title: 连接
  description: 配置机器人的连接信息
  position: 1
</route>

<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import { FormField } from '~/components/ui/form'

const connect = useConnectSettingsStore()

const generalFormSchema = toTypedSchema(
  z.object({
    protocol: z.enum(['OneBot.V11.Standard', 'OneBot.V12.Standard']),
    comm: z.enum(['websocketServer', 'websocketClient', 'http']),
    url: z
      .string()
      .url('请输入有效的 URL')
      .regex(/^(ws|wss):\/\//, 'URL 必须以 ws:// 或 wss:// 开头')
      .trim()
      .optional()
      .or(z.literal('')),
    accessToken: z.string().optional(),
    reconnectInterval: z
      .number({
        required_error: '重连间隔不能为空',
        invalid_type_error: '重连间隔必须为数字',
      })
      .min(0, '重连间隔必须大于等于 0'),
    heartbeatInterval: z
      .number({ required_error: '心跳间隔不能为空', invalid_type_error: '心跳间隔必须为数字' })
      .min(0, '心跳间隔必须大于等于 0'),
    postSelfEvents: z.boolean(),
    showError: z.boolean(),
  })
)

const { handleSubmit, values, resetForm } = useForm({
  validationSchema: generalFormSchema,
  initialValues: connect.$state as unknown as Record<string, unknown>,
})

const adapter = useAdapterStore()

const rebootConnect = useDebounceFn(async () => {
  await adapter.bot.reboot()
}, 1000)

const onSubmit = handleSubmit(async (values) => {
  connect.$patch(values)
  await rebootConnect()
})

watchDebounced(
  values,
  async () => {
    await onSubmit()
  },
  { deep: true, debounce: 250, maxWait: 1000 }
)

defineExpose({ resetForm })
</script>

<template>
  <form class="mb-8 space-y-5">
    <FormField v-slot="{ componentField }" name="protocol">
      <FormItem>
        <FormLabel>数据协议</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="h-9 max-w-80">
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="OneBot.V11.Standard">OneBot v11 标准</SelectItem>
              <SelectItem value="OneBot.V12.Standard">OneBot v12 标准</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormDescription>机器人使用的聊天平台数据协议</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="comm">
      <FormItem>
        <FormLabel>通信方式</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="h-9 max-w-80">
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="websocketServer" disabled>WebSocket 服务器</SelectItem>
              <SelectItem value="websocketClient">WebSocket 客户端</SelectItem>
              <SelectItem value="http" disabled>HTTP</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormDescription>机器人使用协议的通信方式</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="url">
      <FormItem v-auto-animate>
        <FormLabel>连接地址</FormLabel>
        <FormControl>
          <Input type="text" v-bind="componentField" class="h-9 max-w-100" />
        </FormControl>
        <FormDescription>机器人连接到的 WebSocket 服务器地址</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="accessToken">
      <FormItem>
        <FormLabel>访问令牌</FormLabel>
        <FormControl>
          <Input type="text" v-bind="componentField" class="h-9 max-w-100" />
        </FormControl>
        <FormDescription>机器人通信中鉴权使用的访问令牌</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="reconnectInterval">
      <FormItem v-auto-animate>
        <FormLabel>重连间隔</FormLabel>
        <FormControl>
          <Input type="number" v-bind="componentField" class="h-9 max-w-100" />
        </FormControl>
        <FormDescription>WebSocket 客户端断线重连间隔，单位秒，为 0 则不重连</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="heartbeatInterval">
      <FormItem v-auto-animate>
        <FormLabel>心跳间隔</FormLabel>
        <FormControl>
          <Input type="number" v-bind="componentField" class="h-9 max-w-100" />
        </FormControl>
        <FormDescription>WebSocket 客户端心跳间隔，单位秒，为 0 则不发送心跳</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ value, handleChange }" name="postSelfEvents">
      <FormItem class="max-w-120 flex flex-row items-center justify-between rounded-lg">
        <div class="space-y-0.5">
          <FormLabel>推送自身事件</FormLabel>
          <FormDescription>是否推送机器人自身事件</FormDescription>
        </div>
        <FormControl>
          <Switch :checked="value" aria-readonly @update:checked="handleChange" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ value, handleChange }" name="showError">
      <FormItem class="max-w-120 flex flex-row items-center justify-between rounded-lg">
        <div class="space-y-0.5">
          <FormLabel>显示连接错误</FormLabel>
          <FormDescription>显示连接中的全部错误</FormDescription>
        </div>
        <FormControl>
          <Switch :checked="value" aria-readonly @update:checked="handleChange" />
        </FormControl>
      </FormItem>
    </FormField>
  </form>
</template>
