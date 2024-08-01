import type { AllowedComponentProps, Component, VNodeProps } from 'vue'

export interface Contact {
  type: 'user' | 'group'
  id: string
  name: string
  avatar: string
  isBot?: boolean
}

export interface UploadFile {
  name: string
  size: number
  type?: string | FileType
}

export interface FileType {
  mimeType: string
  extension: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentProps<C extends Component> = C extends new (...args: any) => any
  ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
  : never
