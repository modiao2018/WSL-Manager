<p align="center">
  <img src="./logo.png" alt="WSL Manager" width="320" />
</p>

<h1 align="center">WSL Manager</h1>

<p align="center">
  A modern desktop application for managing Windows Subsystem for Linux (WSL) distributions.
  <br />
  <strong>一个用于管理 WSL 发行版的现代桌面应用。</strong>
</p>

<p align="center">
  <a href="https://github.com/modiao2018/WSL-Manager/releases"><img src="https://img.shields.io/github/v/release/modiao2018/WSL-Manager?style=flat-square" alt="Release" /></a>
  <a href="https://github.com/modiao2018/WSL-Manager/blob/main/LICENSE"><img src="https://img.shields.io/github/license/modiao2018/WSL-Manager?style=flat-square" alt="License" /></a>
  <a href="https://github.com/modiao2018/WSL-Manager/stargazers"><img src="https://img.shields.io/github/stars/modiao2018/WSL-Manager?style=flat-square" alt="Stars" /></a>
</p>

---

## Features | 功能特性

- **List & Monitor** — View all WSL distributions with real-time status (Running / Stopped), disk usage, and creation date.
  **列表 & 监控** — 查看所有 WSL 发行版的实时状态（运行中/已停止）、磁盘占用和创建时间。

- **Start / Stop** — Start or terminate distributions with a single click.
  **启动 / 停止** — 一键启动或终止发行版。

- **Clone** — Duplicate an existing distribution via zero-copy pipe (export → import).
  **克隆** — 通过零拷贝管道（导出 → 导入）复制现有发行版。

- **Import / Export** — Import from `.tar`, `.tar.gz`, or `.vhdx` files; export to `.tar`.
  **导入 / 导出** — 支持从 `.tar`、`.tar.gz`、`.vhdx` 文件导入；导出为 `.tar`。

- **Open Terminal** — Launch Windows Terminal (or fallback to cmd) directly into the distribution.
  **打开终端** — 直接在 Windows Terminal（或 cmd）中打开发行版。

- **Open in VS Code** — Open the WSL workspace in Visual Studio Code via Remote-WSL.
  **在 VS Code 中打开** — 通过 Remote-WSL 在 VS Code 中打开 WSL 工作区。

- **Open File Explorer** — Browse the WSL filesystem in Windows Explorer.
  **打开文件管理器** — 在 Windows 资源管理器中浏览 WSL 文件系统。

- **Hide / Unhide** — Hide distributions you don't need; toggle visibility at any time.
  **隐藏 / 取消隐藏** — 隐藏不需要的发行版，随时切换可见性。

- **i18n** — Full internationalization support with Chinese and English.
  **国际化** — 完整的中英文国际化支持。

## Screenshots | 截图

> *Screenshots coming soon.*

## Getting Started | 快速开始

### Prerequisites | 前置条件

- **Windows 10/11** with WSL enabled
- **Node.js** >= 18
- **npm** >= 9

### Download | 下载

Download the latest portable `.exe` from the [Releases](https://github.com/modiao2018/WSL-Manager/releases) page.

从 [Releases](https://github.com/modiao2018/WSL-Manager/releases) 页面下载最新的便携式 `.exe`。

### Build from Source | 从源码构建

```bash
# Clone the repository | 克隆仓库
git clone https://github.com/modiao2018/WSL-Manager.git
cd WSL-Manager

# Install dependencies | 安装依赖
npm install

# Run in development mode | 开发模式运行
npm run dev

# Build production | 构建生产版本
npm run build

# Package portable exe | 打包便携式 exe
npm run dist
```

## Tech Stack | 技术栈

| Layer | Technology |
|-------|-----------|
| Framework | [Electron](https://www.electronjs.org/) 41 |
| Frontend | [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) |
| UI Library | [Ant Design](https://ant.design/) 6 |
| Build Tool | [electron-vite](https://electron-vite.org/) + [Vite](https://vitejs.dev/) |
| i18n | [react-i18next](https://react.i18next.com/) |

## Project Structure | 项目结构

```
src/
├── main/              # Electron main process | 主进程
│   ├── index.ts       # Window creation & app lifecycle | 窗口创建和应用生命周期
│   └── wsl-service.ts # WSL command wrapper & IPC handlers | WSL 命令封装和 IPC 处理
├── preload/           # Preload script (contextBridge) | 预加载脚本
│   └── index.ts
└── renderer/          # React frontend | React 前端
    └── src/
        ├── components/  # UI components | UI 组件
        ├── hooks/       # Custom React hooks | 自定义 Hooks
        ├── i18n/        # Internationalization | 国际化
        ├── App.tsx      # Root component | 根组件
        └── types.ts     # TypeScript type definitions | 类型定义
```

## Contributing | 贡献

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

欢迎贡献！提交 PR 前请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## License | 许可证

This project is licensed under the [MIT License](LICENSE).

本项目基于 [MIT 许可证](LICENSE) 开源。
