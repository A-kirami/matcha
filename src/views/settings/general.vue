<route lang="yaml">
meta:
  isSettings: true
  title: 通用
  description: 配置 Matcha 应用的通用设置
  position: 0
</route>

<script setup lang="ts">
import { type as getOsType } from '@tauri-apps/plugin-os'
import { toTypedSchema } from '@vee-validate/zod'
import { TriangleAlert } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import { FormField } from '~/components/ui/form'

import { isRelease } from '~build/meta'

const general = useGeneralSettingsStore()

const generalSettingsSchema = toTypedSchema(
  z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    sendMessageShortcut: z.enum(['enter', 'ctrlEnter']),
    autoUpdate: z.boolean(),
    enbaleSuperUser: z.boolean(),
    showRecallMessage: z.boolean(),
    applyAcrylicWindowEffects: z.boolean(),
  })
)

const { handleSubmit, values, resetForm } = useForm({
  validationSchema: generalSettingsSchema,
  initialValues: general.$state as unknown as Record<string, unknown>,
})

const onSubmit = handleSubmit((values) => {
  general.$patch(values)
})

watchDebounced(
  values,
  async () => {
    await onSubmit()
  },
  { deep: true, debounce: 250, maxWait: 1000 }
)

const themeOptions = [
  { value: 'light', label: '白日' },
  { value: 'dark', label: '黑夜' },
  { value: 'auto', label: '跟随系统' },
] as const

let themeMode = inject('themeMode')

defineExpose({ resetForm })

const osType = getOsType()
</script>

<template>
  <form>
    <FormField v-slot="{ componentField }" type="radio" name="theme">
      <FormItem class="space-y-1">
        <FormLabel>主题</FormLabel>
        <FormDescription>选择 Matcha 应用的主题</FormDescription>
        <FormMessage />
        <RadioGroup class="flex flex-wrap gap-8 pt-2" v-bind="componentField">
          <FormItem v-for="themeOp in themeOptions" :key="themeOp.value">
            <FormLabel class="[&:has([data-state=checked])>div]:border-primary" @click="themeMode = themeOp.value">
              <FormControl>
                <RadioGroupItem :value="themeOp.value" class="sr-only" />
              </FormControl>
              <ThemeStyleMap :theme="themeOp.value" />
              <span class="block w-full p-2 text-center font-normal">{{ themeOp.label }}</span>
            </FormLabel>
          </FormItem>
        </RadioGroup>
      </FormItem>
    </FormField>
    <FormField v-if="osType === 'windows'" v-slot="{ value, handleChange }" name="applyAcrylicWindowEffects">
      <FormItem class="max-w-120 flex flex-row items-center justify-between rounded-lg">
        <div class="space-y-0.5">
          <FormLabel>亚力克模糊效果</FormLabel>
          <FormDescription v-auto-animate>
            是否为窗口应用亚力克模糊效果
            <p v-if="value" class="mt-2 flex flex-row text-xs text-red-400">
              <TriangleAlert class="mr-1 size-4" />在部分设备上可能导致调整窗口大小或拖动窗口时的性能问题
            </p>
          </FormDescription>
        </div>
        <FormControl>
          <Switch :checked="value" aria-readonly @update:checked="handleChange" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="sendMessageShortcut">
      <FormItem>
        <FormLabel>发送消息</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="h-9 max-w-80">
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="enter">Enter</SelectItem>
              <SelectItem value="ctrlEnter">Ctrl + Enter</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormDescription>发送消息的快捷键</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-if="isRelease" v-slot="{ value, handleChange }" name="autoUpdate">
      <FormItem class="max-w-120 flex flex-row items-center justify-between rounded-lg">
        <div class="space-y-0.5">
          <FormLabel>自动更新</FormLabel>
          <FormDescription>当有新版本时自动下载并安装</FormDescription>
        </div>
        <FormControl>
          <Switch :checked="value" aria-readonly @update:checked="handleChange" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ value, handleChange }" name="enbaleSuperUser">
      <FormItem class="max-w-120 flex flex-row items-center justify-between rounded-lg">
        <div class="space-y-0.5">
          <FormLabel>启用超级用户模式</FormLabel>
          <FormDescription>超级用户模式下允许用户越权操作</FormDescription>
        </div>
        <FormControl>
          <Switch :checked="value" aria-readonly @update:checked="handleChange" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ value, handleChange }" name="showRecallMessage">
      <FormItem class="max-w-120 flex flex-row items-center justify-between rounded-lg">
        <div class="space-y-0.5">
          <FormLabel>显示撤回消息</FormLabel>
          <FormDescription>撤回后的消息是否显示在聊天记录中</FormDescription>
        </div>
        <FormControl>
          <Switch :checked="value" aria-readonly @update:checked="handleChange" />
        </FormControl>
      </FormItem>
    </FormField>
  </form>
</template>
