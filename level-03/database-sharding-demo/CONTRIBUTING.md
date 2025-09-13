# Contributing to Database Sharding Demo

Thank you for considering contributing to the Database Sharding Demo project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Branching Strategy](#branching-strategy)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Code Style](#code-style)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. By participating, you are expected to uphold this code.

- Be respectful and inclusive
- Be patient and welcoming
- Be open to different viewpoints and experiences
- Focus on what is best for the community
- Use welcoming and inclusive language

## Getting Started

1. Fork the repository on GitHub
2. Clone your forked repository to your local machine
3. Set up the development environment as described in the [SETUP.md](./SETUP.md) file
4. Create a new branch for your changes

## Development Environment

To set up your development environment:

1. Ensure you have the following installed:
   - Node.js 18+
   - npm
   - Docker and Docker Compose
   - MongoDB (latest version)
   - Git

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Start the MongoDB sharding cluster:
   ```bash
   npm run docker:up
   ```

4. Initialize the database:
   ```bash
   npm run init:db
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

## Branching Strategy

- `main`: The main branch containing the stable code
- `dev`: Development branch where all feature branches are merged
- `feature/{feature-name}`: Branch for developing new features
- `bugfix/{bug-name}`: Branch for fixing bugs
- `hotfix/{fix-name}`: Branch for critical fixes to production code
- `docs/{doc-name}`: Branch for documentation updates

## Making Changes

1. Create a new branch from the `dev` branch:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the code style guidelines
3. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "feat: add new feature for xyz"
   ```
   
   We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding or modifying tests
   - `chore:` for changes to the build process, etc.

4. Push your branch to your forked repository:
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing

Before submitting a pull request, ensure that all tests pass:

1. Run backend tests:
   ```bash
   cd server
   npm test
   ```

2. Run frontend tests:
   ```bash
   cd client
   npm test
   ```

3. Run end-to-end tests:
   ```bash
   npm run test:e2e
   ```

## Pull Requests

1. Create a pull request from your branch to the `dev` branch of the original repository
2. Fill out the pull request template with:
   - A clear title and description
   - References to any related issues
   - A summary of the changes made
   - Any additional information or context

3. Wait for a maintainer to review your pull request
4. Address any requested changes or feedback
5. Once approved, your pull request will be merged into the `dev` branch

## Code Style

This project follows specific code style guidelines to maintain consistency:

### TypeScript/JavaScript

- We use ESLint and Prettier for code formatting and linting
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript interfaces and types for all data structures
- Document functions and complex code blocks with JSDoc comments

### React

- Use functional components with hooks
- Use TypeScript for type checking
- Follow React best practices for state management
- Use named exports instead of default exports where possible

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Follow a component-first approach
- Use CSS modules or styled-components for custom styling

## Documentation

Documentation is a crucial part of this project. When making changes:

1. Update or add documentation for any new features or changes
2. Document APIs using JSDoc comments
3. Update the README.md or other documentation files as needed
4. Provide examples or use cases where appropriate

## Issue Reporting

If you find a bug or have a suggestion for improvement:

1. Check the existing issues to see if it has already been reported
2. If not, create a new issue using the provided issue template
3. Provide as much detail as possible, including:
   - Steps to reproduce the issue
   - Expected behavior
   - Actual behavior
   - Screenshots or error messages
   - Environment information (OS, browser, Node.js version, etc.)

## Feature Requests

For feature requests:

1. Check the existing issues to see if the feature has already been suggested
2. If not, create a new issue using the feature request template
3. Clearly describe the feature and its potential benefits
4. Provide examples or use cases where appropriate
5. Be open to discussion and feedback

Thank you for contributing to the Database Sharding Demo project!
