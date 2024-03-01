// @ts-check
/* eslint-disable camelcase */

/**
 * @param {Object} param0
 * @param {string} param0.name
 * @param {number} param0.size_in_bytes
 * @param {string} param0.url
 */
function createMarkdownTableRow({ name, size_in_bytes, url }) {
  const platform = name.split('_')[2]
  const fileSize = parseFloat((size_in_bytes / 1024 ** 2).toFixed(2))
  return `| ${platform} | [${name}](${url}) | ${fileSize} MB |`
}

function createMarkdownTableHeader() {
  return ['| 平台 | 文件 | 大小 |', '| --- | --- | --- |']
}

/**
 * @param {{name: string, size_in_bytes: number, url: string}[]} artifacts
 */
function createArtifactComment(artifacts) {
  const tableHeader = createMarkdownTableHeader()
  const tableBody = artifacts
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((artifact) => createMarkdownTableRow(artifact))
  const comment = ['### 📦️ 此 PR 构建的应用已经准备就绪', '', ...tableHeader, ...tableBody, '']
  return comment.join('\n')
}

export default createArtifactComment
