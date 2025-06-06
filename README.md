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

### 环境变量配置

在项目根目录下，将 `.env.example` 复制为 `.env` 文件，并配置必要的环境变量：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，添加您的 OpenAI API 密钥：

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
VITE_OPENAI_API_URL=https://api.openai.com/v1/chat/completions
```

**重要提醒：**

- 请确保您拥有有效的 OpenAI API 密钥
- 不要将包含真实 API 密钥的 `.env` 文件提交到 Git 仓库
- `.env` 文件已被添加到 `.gitignore` 中以防止意外提交

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

## 算法训练功能

算法训练模块提供了模拟面试题练习功能，包括：

1. **多种题型支持**：
   - 单选题：每题4分
   - 多选题：每题6分，少选得部分分
   - 编程题：使用Monaco编辑器实现在线代码编写和执行

2. **代码执行功能**：
   - 支持在线运行JavaScript代码
   - 使用Function构造函数安全执行用户代码
   - 自动验证代码结果是否正确

3. **答案验证**：
   - 自动评分系统，根据答题情况计算总分
   - 单选题判断选项是否正确
   - 多选题支持部分得分
   - 编程题通过测试用例验证代码正确性

4. **在线编程环境**：
   - 集成Monaco编辑器提供专业的代码编辑体验
   - 实时显示代码运行结果
   - 支持查看标准答案和AI解析
