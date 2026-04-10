# Team Development Rules

This document outlines the standards for version control, commit messages, and branching strategy to ensure a clean, maintainable, and predictable project history.

---

## 🏗 Branching Strategy

We follow the **GitHub Flow** model with specific naming conventions for clarity.

### Branch Names
All branch names should be lowercase and use hyphens as separators.

| Type | Pattern | Description |
| :--- | :--- | :--- |
| **Main** | `main` | Production-ready code. Always stable. |
| **Feature** | `feat/short-description` | New features or enhancements. |
| **Bugfix** | `fix/short-description` | Fixes for bugs found during development/QA. |
| **Hotfix** | `hotfix/short-description` | Urgent fixes for production issues. |
| **Documentation** | `docs/short-description` | Updates to docs, README, etc. |
| **Refactor** | `refactor/short-description` | Code changes that neither fix bugs nor add features. |

### Workflow
1. **Branch out** from `main` for any new work.
2. **Commit early and often** to your local branch.
3. **Open a Pull Request (PR)** once the task is ready for review.
4. **Code Review**: At least one team member must approve the PR.
5. **Merge**: Once approved and CI passes, merge into `main` using **Squash and Merge** to keep the history clean.
6. **Delete** the branch after merging.

---

## 📝 Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) to keep our history readable and to automate changelog generation.

### Format
```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commitment Types
| Type | Prefix | Use Case |
| :--- | :--- | :--- |
| **Feature** | `feat` | A new feature for the user. |
| **Fix** | `fix` | A bug fix for the user. |
| **Docs** | `docs` | Changes to documentation only. |
| **Style** | `style` | Formatting, missing semi-colons, etc; no code change. |
| **Refactor** | `refactor` | Refactoring production code (e.g. renaming a variable). |
| **Performance** | `perf` | Code changes that improve performance. |
| **Test** | `test` | Adding missing tests or correcting existing tests. |
| **Build** | `build` | Changes that affect the build system or external dependencies. |
| **CI** | `ci` | Changes to CI configuration files and scripts. |
| **Chore** | `chore` | Other changes that don't modify src or test files. |
| **Revert** | `revert` | Reverts a previous commit. |

### Rules for the Subject Line
- **Use the imperative, present tense**: "change" not "changed" nor "changes".
- **Don't capitalize the first letter**.
- **No dot (.) at the end**.
- **Limit to 50 characters**.

### Example
`feat(auth): add google oauth provider`

---

## 🚀 Pull Request Standards

- **Title**: Use the same format as commit messages.
- **Description**: Briefly describe what was changed, why, and any testing performed.
- **Screenshots/Videos**: Required for any UI/UX changes.
- **Self-Review**: Always review your own code before requesting a review from others.

---

## 🛠 Best Practices

- **Atomic Commits**: Each commit should do exactly one thing.
- **Never commit to `main`**: All changes must go through a PR.
- **Keep PRs small**: Smaller PRs are reviewed faster and are less prone to bugs.
- **Sync regularly**: Rebase your branch with `main` frequently to avoid complex merge conflicts.
