// @ts-check
/* eslint-disable camelcase */

/** @type {Record<string, string>} */
const platformIcon = {
  windows: '🪟',
  macos: '🍎',
  linux: '🐧',
  unknown: '❔',
}

/**
 * @param {Object} param0
 * @param {number} param0.id
 * @param {string} param0.name
 * @param {number} param0.size_in_bytes
 */
function createMarkdownTableRow({ id, name, size_in_bytes }) {
  const icon = platformIcon[process.env.RUNNER_OS?.toLowerCase() || 'unknown']
  const platform = name.split('_')[2]
  const url = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/artifacts/${id}`
  const fileSize = parseFloat((size_in_bytes / 1024 ** 2).toFixed(2))
  return `| ${icon} ${platform} | [${name}](${url}) | ${fileSize} MB |`
}

function createMarkdownTableHeader() {
  return ['| 平台 | 文件 | 大小 |', '| --- | --- | --- |']
}

/**
 * @param {{id:number, name: string, size_in_bytes: number}[]} artifacts
 * @param {string} sha
 */
function createArtifactComment(artifacts, sha) {
  const tableHeader = createMarkdownTableHeader()
  const tableBody = artifacts
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((artifact) => createMarkdownTableRow(artifact))
  const comment = [
    '### 📦️ 此 PR 构建的应用已经准备就绪',
    '',
    ...tableHeader,
    ...tableBody,
    '',
    `\\**从提交 ${sha} 构建*`,
  ]
  return comment.join('\n')
}

export default createArtifactComment
