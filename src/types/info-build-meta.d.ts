declare module '~build/meta' {
  export const isBuild: boolean
  export const isRelease: boolean
  export const prNum: string | undefined
}
