# Anaska — Git & Branching Strategy

## 1. Branch Strategy

We follow a GitFlow-inspired branching strategy tailored for the Anaska mobile + backend workspace:

- **`main`**: Production-ready code. Every merge into `main` should be stable and deployable.
- **`develop`**: Integration branch where completed epic tasks are merged and verified together.
- **Feature Branches**:
  - Format: `feature/ANS-<id>-<short-description>`
  - Examples:
    - `feature/ANS-1-mobile-init`
    - `feature/ANS-7-user-schema`
    - `feature/ANS-25-mini-player`
- **Bugfix / Hotfix Branches**:
  - Format: `fix/ANS-<id>-<short-description>` or `hotfix/<short-description>`
  - Example: `fix/ANS-10-refresh-token-expiry`

---

## 2. Commit Message Convention

Commits adhere strictly to Conventional Commits:

```
<type>(<scope>): <short description in present tense>
```

### Types:
- `feat`: New feature or user-facing capability
- `fix`: Bug fix
- `refactor`: Code reorganization with no functional changes
- `chore`: Tooling, dependencies, or configuration updates
- `docs`: Documentation updates
- `test`: Adding or updating test cases

### Scopes:
- `mobile`: Expo / React Native code
- `backend`: Express / Node.js API
- `db`: Database schemas, migrations, seeds
- `auth`: Authentication / JWT
- `player`: Music playback and player store
- `ai`: DJ Muse AI agent / streaming / RAG
- `docker`: Docker configuration
