// https://github.com/unplugin/unplugin-vue-components/issues/601#issuecomment-1437848252
import type { GlobalComponents } from 'vue'

declare global {
  type ComponentInstance = {
    [Property in keyof GlobalComponents]: InstanceType<GlobalComponents[Property]>
  }
}
