# Contributing to Space-Guard

Thank you for your interest in contributing! 🚀

## How to Add Yourself as a Contributor

GitHub automatically tracks everyone who has a merged Pull Request — you will appear in the **Contributors** tab on the repository page once your PR is merged.

To contribute:

1. **Fork** this repository (click the Fork button on GitHub)
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/space-guard.git
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit with a descriptive message:
   ```bash
   git add .
   git commit -m "feat: describe your change here"
   ```
5. **Push** your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** on GitHub against the `main` branch of this repo
7. Once reviewed and **merged**, your GitHub avatar will appear in the Contributors section! ✅

---

## Development Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.api.main:app --port 8000 --reload
```

---

## Commit Message Convention

We use conventional commits:

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `refactor:` | Code refactoring |
| `test:` | Adding tests |
| `chore:` | Maintenance tasks |

---

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to learn and build something cool.
