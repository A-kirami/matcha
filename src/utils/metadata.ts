import { isCI, isPR } from '~build/ci'
import { github, tag } from '~build/git'
import { isBuild, isRelease, prNum, buildSha } from '~build/meta'
import { version } from '~build/package'

interface Version {
  name: string
  link: string
}

export function getVersion(): Version {
  if (import.meta.env.DEV) {
    return {
      name: `${version}-dev`,
      link: '',
    }
  }
  if (isCI) {
    if (isBuild) {
      const shortSha = buildSha.slice(0, 7)
      return isPR
        ? {
            name: `${version}-build.${shortSha} (pr#${prNum})`,
            link: `${github}/pull/${prNum}`,
          }
        : {
            name: `${version}-build.${shortSha}`,
            link: `${github}/commit/${buildSha}`,
          }
    }
    if (isRelease && tag) {
      return {
        name: version,
        link: `${github}/releases/tag/${tag}`,
      }
    }
  }
  return {
    name: `${version}-unknown`,
    link: '',
  }
}
