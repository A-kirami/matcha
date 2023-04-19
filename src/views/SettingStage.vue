<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core'

import { useConfigStore, useAdapterStore } from '@/stores'

import type { Config } from '@/stores/config'

const configStore = useConfigStore()

const adapter = useAdapterStore()

const configState = $ref<Config>({
  protocol: configStore.protocol,
  comm: configStore.comm,
  host: configStore.host,
  port: configStore.port,
  url: configStore.url,
  accessToken: configStore.accessToken,
  reconnectInterval: configStore.reconnectInterval,
  heartbeatInterval: configStore.heartbeatInterval,
  timeout: configStore.timeout,
  postSelfEvents: configStore.postSelfEvents,
})

const throttledFn = useThrottleFn(async () => {
  await adapter.bot.reboot()
}, 3000)

async function onFinish(config: Config) {
  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      configStore[key] = config[key]
    }
  }
  throttledFn()
}
</script>

<template>
  <div class="pt-8">
    <a-form
      :model="configState"
      name="basic"
      autocomplete="off"
      :label-col="{ span: 2 }"
      :wrapper-col="{ span: 5 }"
      @finish="onFinish"
    >
      <a-form-item label="协议" name="protocol" :colon="false">
        <a-select v-model:value="configState.protocol" placeholder="Please select a country">
          <a-select-option value="OneBot.V11.Standard">OneBot v11 标准</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="驱动" name="comm" :colon="false">
        <a-select v-model:value="configState.comm" placeholder="Please select a country">
          <a-select-option value="websocketClient">反向 websocket</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="连接地址" name="url" :colon="false">
        <a-input v-model:value="configState.url" />
      </a-form-item>
      <a-form-item label="访问令牌" name="accessToken" :colon="false">
        <a-input v-model:value="configState.accessToken" />
      </a-form-item>
      <a-form-item label="重连间隔" name="reconnectInterval" :colon="false">
        <a-input-number id="inputNumber" v-model:value="configState.reconnectInterval" :min="0" addon-after="秒" />
      </a-form-item>
      <a-form-item label="心跳间隔" name="heartbeatInterval" :colon="false">
        <a-input-number id="inputNumber" v-model:value="configState.heartbeatInterval" :min="0" addon-after="秒" />
      </a-form-item>
      <a-form-item label="上报自身事件" name="postSelfEvents" :colon="false">
        <a-switch v-model:checked="configState.postSelfEvents" />
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 2 }">
        <a-button type="primary" html-type="submit">保存设置</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
