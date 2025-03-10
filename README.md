# 职捷径（Job Pilot）

一个基于Electron、Vue 3和TypeScript构建的桌面应用程序，旨在帮助求职者一站式管理求职过程。

## 项目简介

职捷径（Job Pilot）是一款专为求职者设计的桌面应用工具，集成了题库管理、面试准备、面后复盘等功能，帮助用户高效地管理求职流程，提高求职成功率。

## 功能特点

- **面试准备**：提供面试问题库和准备工具
- **数据可视化**：通过图表直观展示求职进度和统计数据
- **跨平台支持**：支持Windows、macOS和Linux系统

## 技术栈

- **框架**：Electron + Vue 3 + TypeScript
- **UI**：TailwindCSS
- **图表**：ECharts
- **构建工具**：Vite + Electron Vite

## 开发环境设置

### 推荐的IDE配置

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

### 安装依赖

```bash
# 使用pnpm（推荐）
$ pnpm install

# 如果pnpm失败，可以使用npm
$ npm install
```

### 开发模式

```bash
# 使用pnpm
$ pnpm dev

# 使用npm
$ npm run dev
```

### 构建应用

```bash
# Windows版本
$ pnpm build:win

# macOS版本
$ pnpm build:mac

# Linux版本
$ pnpm build:linux
```

## 项目结构

```
one-step-to-job/
├── src/                    # 源代码
│   ├── main/               # Electron主进程
│   ├── preload/            # 预加载脚本
│   └── renderer/           # 渲染进程（Vue前端）
├── resources/              # 应用资源
├── electron.vite.config.ts # Electron Vite配置
└── electron-builder.yml    # Electron Builder配置
```

## 贡献指南

欢迎提交问题和功能请求！如果您想为项目做出贡献，请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 电子邮件：[moninla@126.com](mailto:moninla@126.com)
