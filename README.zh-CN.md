<p align="center">
  <img src="./logo.png" alt="WSL Manager" />
</p>

<h1 align="center">WSL Manager</h1>

<p align="center">
  一个用于管理 WSL 发行版的现代桌面应用。
</p>

<p align="center">
  <a href="./README.md">🇺🇸 English</a>
</p>

<p align="center">
  <a href="https://github.com/modiao2018/WSL-Manager/releases"><img src="https://img.shields.io/github/v/release/modiao2018/WSL-Manager?style=flat-square" alt="Release" /></a>
  <a href="https://github.com/modiao2018/WSL-Manager/blob/main/LICENSE"><img src="https://img.shields.io/github/license/modiao2018/WSL-Manager?style=flat-square" alt="License" /></a>
  <a href="https://github.com/modiao2018/WSL-Manager/stargazers"><img src="https://img.shields.io/github/stars/modiao2018/WSL-Manager?style=flat-square" alt="Stars" /></a>
</p>

---

## 功能特性

- **列表 & 监控** — 查看所有 WSL 发行版的实时状态（运行中/已停止）、磁盘占用和创建时间。
- **启动 / 停止** — 一键启动或终止发行版。
- **克隆** — 通过零拷贝管道（导出 → 导入）复制现有发行版。
- **导入 / 导出** — 支持从 `.tar`、`.tar.gz`、`.vhdx` 文件导入；导出为 `.tar`。
- **打开终端** — 直接在 Windows Terminal（或 cmd）中打开发行版。
- **在 VS Code 中打开** — 通过 Remote-WSL 在 VS Code 中打开 WSL 工作区。
- **打开文件管理器** — 在 Windows 资源管理器中浏览 WSL 文件系统。
- **隐藏 / 取消隐藏** — 隐藏不需要的发行版，随时切换可见性。
- **国际化** — 完整的中英文国际化支持。

## 截图

> *截图即将添加。*

## 快速开始

### 前置条件

- **Windows 10/11** 且已启用 WSL
- **Node.js** >= 18
- **npm** >= 9

### 下载

从 [Releases](https://github.com/modiao2018/WSL-Manager/releases) 页面下载最新的便携式 `.exe`。

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/modiao2018/WSL-Manager.git
cd WSL-Manager

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 打包便携式 exe
npm run dist
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Electron](https://www.electronjs.org/) 41 |
| 前端 | [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) |
| UI 库 | [Ant Design](https://ant.design/) 6 |
| 构建工具 | [electron-vite](https://electron-vite.org/) + [Vite](https://vitejs.dev/) |
| 国际化 | [react-i18next](https://react.i18next.com/) |

## 项目结构

```
src/
├── main/              # Electron 主进程
│   ├── index.ts       # 窗口创建和应用生命周期
│   └── wsl-service.ts # WSL 命令封装和 IPC 处理
├── preload/           # 预加载脚本 (contextBridge)
│   └── index.ts
└── renderer/          # React 前端
    └── src/
        ├── components/  # UI 组件
        ├── hooks/       # 自定义 Hooks
        ├── i18n/        # 国际化
        ├── App.tsx      # 根组件
        └── types.ts     # TypeScript 类型定义
```

## 贡献

欢迎贡献！请随时提交 Issue 或 Pull Request。

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
