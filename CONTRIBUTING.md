# Contributing to WSL Manager | 贡献指南

Thank you for your interest in contributing to WSL Manager! Below are the guidelines for contributing.

感谢你对 WSL Manager 的关注！以下是贡献指南。

## How to Contribute | 如何贡献

### Reporting Bugs | 报告 Bug

1. Check existing [Issues](https://github.com/modiao2018/WSL-Manager/issues) to avoid duplicates.
2. Open a new issue with a clear title and description.
3. Include steps to reproduce, expected behavior, and actual behavior.
4. Include your Windows version and WSL version.

### Suggesting Features | 建议功能

Open an issue with the `enhancement` label describing the feature and its use case.

### Submitting Code | 提交代码

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test locally.
4. Commit with a descriptive message: `git commit -m "feat: add your feature"`
5. Push and open a Pull Request.

## Development Setup | 开发环境

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/WSL-Manager.git
cd WSL-Manager

# Install dependencies
npm install

# Start development server
npm run dev
```

## Code Guidelines | 代码规范

- Use **TypeScript** for all source files.
- Follow existing code style and naming conventions.
- Use **functional components** and **React hooks**.
- All user-facing strings must use the i18n system (`useTranslation` / `i18next.t()`).
- Add translations to both `src/renderer/src/i18n/locales/zh.ts` and `en.ts`.

## Commit Convention | 提交规范

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, no logic change)
- `refactor:` — Code refactoring
- `chore:` — Build, tooling, or dependency changes

## License | 许可证

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
