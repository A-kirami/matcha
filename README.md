<p align="center">
  <a href="https://github.com/A-kirami/matcha">
    <br />
    <img src="./public/matcha.webp" alt="Matcha Logo" width="200" />
    <br />
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./public/matcha-text-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="./public/matcha-text-light.svg">
      <img src="./public/matcha-text-light.svg" alt="Matcha Text" width="200" />
    </picture>
  </a>
  <br />
  模拟聊天交互的辅助开发工具
</p>

<p align="center">
  <a href="https://github.com/A-kirami/matcha/actions/workflows/build.yml" target="__blank"
    ><img src="https://github.com/A-kirami/matcha/actions/workflows/build.yml/badge.svg?branch=main&event=push" alt="Github Actions"
  /></a>
  <a href="https://app.codacy.com/gh/A-kirami/matcha/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade" target="__blank"
    ><img src="https://app.codacy.com/project/badge/Grade/99e8f33bae854311a67ccf671a015d9a" alt="Codacy"
  /></a>
  <br />
  <a href="https://github.com/A-kirami/matcha/releases/latest" target="__blank"
    ><img src="https://img.shields.io/github/v/release/A-kirami/matcha?include_prereleases&&color=70aeff&style=social" alt="Release Version"
  /></a>
  <a href="https://github.com/A-kirami/matcha/stargazers" target="__blank"
    ><img alt="GitHub stars" src="https://img.shields.io/github/stars/A-kirami/matcha?style=social"
  /></a>
  <a href="https://github.com/A-kirami/matcha/releases" target="__blank"
    ><img alt="GitHub downloads" src="https://img.shields.io/github/downloads/A-kirami/matcha/total?style=social"
  /></a>
  <br />
  <a href="#" target="__blank">
    <strong>🌎 演示与预览</strong>
  </a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/A-kirami/matcha/releases" target="__blank">
    <strong>📦️ 下载安装包</strong>
  </a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://jq.qq.com/?_wv=1027&k=SBsy6Rrn" target="__blank">
    <strong>💬 加入交流群</strong>
  </a>
</p>

<p align="center">
  <a href="https://github.com/A-kirami/matcha" target="__blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./public/preview-dark.webp">
      <source media="(prefers-color-scheme: light)" srcset="./public/preview-light.webp">
      <img src="./public/preview-light.webp" alt="Matcha - Preview" width="100%" />
    </picture>
  </a>
</p>

Matcha is mock chat.

Matcha 是一个专为 KiramiBot 设计的辅助开发工具，能够与 KiramiBot 进行模拟聊天交互，同时提供一系列的开发辅助功能。

它旨在降低开发者的调试与测试的负担，从而更有效率的专注于功能开发。

尽管它主要为 KiramiBot 设计，但只要是符合 Matcha 支持协议的机器人，都可接入并能够使用大部分基础功能。

> KiramiBot 是一个尚在开发中的机器人

## ✨ 特性

- 小而美，轻巧体积，简约 UI
- 全平台支持（Windows，Mac，Linux）
- 多协议适配支持
- 支持多用户多群组
- 支持多媒体消息
- 原始事件展示

## 🚀 快速上手

### 创建用户

在联系栏顶部右侧的蓝色按钮上，选择创建用户

![](./docs/create-user.png)

### 设置 Bot 与 身份

从用户列表中挑选，指定使用的 Bot 和扮演的身份

![](./docs/select-user.png)

### 设置连接

修改连接配置，保存即可

![](./docs/setting-connect.png)

## 🔌 协议适配

- <details>
  <summary>OneBot v11</summary>

  ### 动作
  - [x] 发送私聊消息（send_private_msg）
  - [x] 发送群消息（send_group_msg）
  - [x] 发送消息（send_msg）
  - [x] 检查是否可以发送图片（can_send_image）
  - [x] 检查是否可以发送语音（can_send_record）
  - [x] 获取运行状态（get_status）
  - [x] 获取版本信息（get_version_info）

  ### 事件
  - [x] 私聊消息
  - [x] 群消息
  </details>

## 📋 路线图

请访问本项目的 [Projects](#)

## 🤝 贡献

请参阅[贡献指南](#)

## 🎊 活动

![Alt](https://repobeats.axiom.co/api/embed/647a10251f545090f351a6afc3b2a124494df1a2.svg 'Repobeats analytics image')

## 📄 许可证

Code: AGPL-3.0 - 2023 - Akirami

Logo: CC-BY-NC-ND, Designs by Akirami

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FA-kirami%2Fmatcha.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FA-kirami%2Fmatcha?ref=badge_large)
