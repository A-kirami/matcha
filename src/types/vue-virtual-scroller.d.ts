// Type definitions for vue-virtual-scroller
// Project: https://github.com/Akryum/vue-virtual-scroller/
declare module 'vue-virtual-scroller' {
  import Vue, { ComponentOptions, PluginObject, Component } from 'vue'

  interface PluginOptions {
    installComponents?: boolean
    componentsPrefix?: string
  }

  const plugin: PluginObject<PluginOptions> & { version: string }

  export const RecycleScroller: Component<unknown, unknown, unknown, unknown>
  export const DynamicScroller: Component<unknown, unknown, unknown, unknown>
  export const DynamicScrollerItem: Component<unknown, unknown, unknown, unknown>

  export function IdState(options?: { idProp?: (vm: unknown) => unknown }): ComponentOptions<Vue> | typeof Vue

  export default plugin
}
