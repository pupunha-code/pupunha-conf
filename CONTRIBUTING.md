# Contributing to Pupunha Conf

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork:**

   ```bash
   git clone https://github.com/your-username/pupunha-conf.git
   cd pupunha-conf
   ```

3. **Install dependencies:**

   ```bash
   bun install
   ```

4. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up the database:**
   - Follow the database setup instructions in README.md

6. **Start the development server:**
   ```bash
   bun run start
   ```

## 💻 Development Workflow

### Branch Naming

Use descriptive branch names:

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/component-name` - Code refactoring
- `test/test-description` - Adding tests

### Before Committing

Always run quality checks before committing:

```bash
# Check for linting and formatting issues
bun run quality

# Or auto-fix issues
bun run quality:fix
```

The pre-commit hook will automatically:

- Run ESLint and fix issues
- Format code with Prettier
- Check TypeScript types

### Making Changes

1. Create a new branch from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes

3. Test your changes:

   ```bash
   bun run ios      # Test on iOS
   bun run android  # Test on Android
   bun run web      # Test on web
   ```

4. Run quality checks:

   ```bash
   bun run quality:fix
   ```

5. Commit your changes (see [Commit Guidelines](#commit-guidelines))

6. Push and create a Pull Request

## 📝 Code Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use proper types or `unknown`
- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Enable strict mode (already configured)

### Code Style

- Follow the existing code style
- Use Prettier for formatting (configured in `.prettierrc`)
- Use ESLint for linting (configured in `eslint.config.js`)
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas
- Maximum line length: 100 characters

### React/React Native

- Use functional components with hooks
- Prefer named exports over default exports
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for prop types

### File Organization

- Group related files in feature folders
- Use index files for clean imports
- Keep components, hooks, and utilities separate
- Follow the existing project structure

### Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Hooks:** camelCase starting with `use` (`useAuth.ts`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces:** PascalCase (`User`, `SessionData`)

## 📝 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependencies
- `ci`: CI/CD changes
- `chore`: Other changes

### Examples

```bash
# Good commit messages
feat(auth): add Google OAuth login
fix(calendar): resolve timezone display issue
docs(readme): update installation instructions
refactor(store): simplify event store logic
style(components): format code with prettier

# Bad commit messages
fix: bug fix
update code
WIP
```

### Commit Message Rules

- Use lowercase for type and scope
- Don't end subject with a period
- Keep subject under 50 characters
- Use imperative mood ("add" not "added" or "adds")
- Reference issues in footer: `Closes #123`

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run quality checks:**
   ```bash
   bun run quality:fix
   ```
4. **Test on all platforms** (iOS, Android, Web)
5. **Update CHANGELOG.md** if applicable

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on Web
- [ ] Added/updated tests

## Screenshots (if applicable)

Add screenshots here

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass
```

### Review Process

1. Ensure CI checks pass
2. Address review comments
3. Keep PRs focused and small when possible
4. Respond to feedback promptly
5. Update PR description if scope changes

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description** of the bug
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Environment:**
   - OS and version
   - Device/emulator
   - App version
   - React Native version

## 💡 Suggesting Features

When suggesting features:

1. Check if the feature already exists
2. Explain the use case
3. Describe the expected behavior
4. Consider implementation complexity
5. Be open to discussion and alternatives

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Questions?

If you have questions, feel free to:

- Open an issue for discussion
- Check existing issues and PRs
- Review the codebase

Thank you for contributing! 🎉
