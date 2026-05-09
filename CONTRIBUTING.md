# Contributing Guidelines

Thank you for your interest in contributing to the Angular Art Gallery!

## Branch Protection and CI/CD
We follow a strict PR-based workflow to ensure the stability of the `main` branch:

1.  **Main Branch Protection**: The `main` branch is protected. Direct pushes are disabled.
2.  **Pull Requests**: All changes must be submitted via a Pull Request.
3.  **Automated Previews**: Every PR triggers a GitHub Action that builds the project and deploys a preview version to Firebase Hosting.
4.  **Continuous Deployment**: Once a PR is merged into `main`, it is automatically deployed to the production site at `angular-history-showcase.web.app`.

## How to Contribute
1.  Fork the repository.
2.  Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`.
3.  Make your changes and ensure the local build passes (`npm run build`).
4.  Commit your changes using clear and descriptive messages.
5.  Push your branch to your fork and open a Pull Request using our template.
