# Contributing to NZXT-ESC

First off, thank you for considering contributing to NZXT-ESC! 🎉

This document provides guidelines and instructions for contributing to the project. Following these guidelines helps communicate that you respect the time of the developers managing and developing this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Questions?](#questions)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

**Important:** This project is licensed under the Personal Use License. All contributions must respect this license. No contributions intended for commercial deployment will be accepted.

NZXT-ESC is a React/TypeScript project that provides a web-based configuration tool for NZXT Kraken Elite LCD displays. Before contributing, familiarize yourself with:

- **Project Purpose**: Customize NZXT Kraken Elite LCD screens with system monitoring overlays and media display
- **Tech Stack**: React 18, TypeScript, Vite, Framer Motion
- **Architecture**: Web Integration that runs inside NZXT CAM with localStorage-based synchronization

## Development Setup

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher (or yarn/pnpm)
- **Git**: Latest version

### Installation

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nzxt-esc.git
   cd nzxt-esc
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/mrgogo7/nzxt-esc.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

### Project Structure

```
nzxt-esc/
├── src/
│   ├── ui/              # UI components and styles
│   ├── hooks/           # React hooks
│   ├── constants/       # Constants and defaults
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .github/             # GitHub workflows and templates
├── dist/                # Build output (git-ignored)
└── docs/                # Documentation and assets
```

## Development Workflow

### 1. Create a Branch

Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Type checking
npm run type-check

# Build test
npm run build

# Preview build
npm run preview
```

**Important**: Test your changes inside NZXT CAM Web Integration. The application has two entry points:
- **Config Page**: `http://localhost:5173/config.html` (for development/testing)
- **LCD Display**: `http://localhost:5173/?kraken=1` (LCD display mode)

Note: In production, everything runs inside NZXT CAM via Web Integration.

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git commit -m "feat: add new metric type support"
git commit -m "fix: correct offset calculation in positioning"
git commit -m "docs: update README with new features"
```

**Commit Message Format**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### 5. Keep Your Branch Updated

Regularly sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always enabled, follow strict typing rules
- **Type Definitions**: Place in `src/types/` directory
- **Interfaces**: Use interfaces for object shapes, types for unions/intersections
- **No `any`**: Avoid `any` type; use `unknown` if needed

### React

- **Functional Components**: Use functional components with hooks
- **Component Organization**: One component per file
- **Props Interface**: Define props interfaces above components
- **Hooks**: Custom hooks in `src/hooks/` directory

### CSS

- **CSS Modules**: Use for component-scoped styles (`.module.css`)
- **Global Styles**: Use regular CSS files sparingly
- **Naming**: Use kebab-case for class names

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings, double for JSX attributes
- **Semicolons**: Use semicolons
- **Trailing Commas**: Yes, for multi-line structures

### Example Code Structure

```typescript
// src/ui/components/ExampleComponent.tsx
import React from 'react';
import styles from './ExampleComponent.module.css';

interface ExampleComponentProps {
  title: string;
  value: number;
  onChange: (value: number) => void;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  value,
  onChange,
}) => {
  // Component logic here
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      {/* ... */}
    </div>
  );
};
```

## Pull Request Process

### Before Submitting

1. **Update Documentation**: Update README.md if you've changed functionality
2. **Test Thoroughly**: Test in both config and display modes
3. **Check Type Errors**: Run `npm run type-check`
4. **Verify Build**: Run `npm run build` successfully
5. **Sync with Main**: Rebase your branch on latest `main`

### Submitting a Pull Request

1. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**:
   - Go to the [GitHub repository](https://github.com/mrgogo7/nzxt-esc)
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Description Should Include**:
   - What changes were made
   - Why these changes were necessary
   - How to test the changes
   - Screenshots/videos (for UI changes)
   - Related issue numbers

4. **Respond to Feedback**:
   - Address review comments promptly
   - Make requested changes
   - Update PR if needed

## Reporting Bugs

### Before Reporting

1. **Search existing issues** to see if it's already reported
2. **Test in latest version** to confirm it's still present
3. **Check README** and documentation

### Bug Report Template

Use the bug report template when creating an issue. Include:

- **Clear Title**: Brief description of the bug
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots/Videos**: Visual evidence
- **Environment**:
  - Browser and version
  - NZXT CAM version
  - Operating system
  - Project version
- **Console Errors**: Any errors in browser console

## Suggesting Features

### Feature Request Process

1. **Check existing issues** and discussions
2. **Use feature request template** when opening an issue
3. **Provide context**:
   - What problem does it solve?
   - How would it work?
   - Any design mockups?

### Good Feature Requests Include

- Clear use case
- Detailed description
- Examples of similar features (if any)
- Potential implementation approach (optional)

## Questions?

If you have questions about contributing:

- **Check Documentation**: README.md and this file
- **Open a Discussion**: Use GitHub Discussions
- **Ask in Issues**: Use the question template

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [NZXT Web Integration](https://www.nzxt.com/cam)

## Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes (for significant contributions)
- README acknowledgements (for major contributions)

Thank you for contributing to NZXT-ESC! Your efforts help make NZXT LCD customization better for everyone. 🚀

