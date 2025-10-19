# GitHub Actions Workshop

Welcome to this hands-on GitHub Actions workshop! This comprehensive guide will take you from complete beginner to
confidently building and deploying applications with continuous integration and continuous deployment (CI/CD) pipelines.

## What You'll Learn

By completing this workshop, you'll be able to:

- Understand core CI/CD concepts and why they matter
- Create and configure GitHub Actions workflows
- Automate testing, building, and deployment processes
- Debug workflow issues efficiently
- Implement security best practices with secrets management
- Build advanced workflows with matrix builds and caching
- Create reusable custom actions

## Prerequisites

Before starting this workshop, you should have:

- A GitHub account (create one at [github.com](https://github.com))
- Basic Git knowledge (clone, commit, push, pull)
- Familiarity with command line/terminal
- Experience with at least one programming language (we use Node.js in examples)
- A text editor or IDE of your choice

**No prior CI/CD or GitHub Actions experience required!**

## Workshop Structure

This workshop consists of 13 progressive lessons. Each lesson builds on previous concepts, so we recommend completing
them in order.

**Lessons 1-3** provide heavy scaffolding with detailed, copy-paste-friendly instructions to get you comfortable with
the basics.

**Lessons 4-7** introduce more independence, with some blanks to fill in and opportunities to reference earlier lessons.

**Lessons 8-13** shift to problem-based learning where you'll apply previous knowledge with minimal hand-holding.

## Getting Started

### 1. Fork This Repository

Click the "Fork" button at the top right of this repository. This creates your own copy where you'll complete all
exercises.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/github-actions-workshop.git
cd github-actions-workshop
```

### 3. Install Dependencies

This workshop includes a sample Node.js application for hands-on exercises:

```bash
npm install
```

### 4. Start with Lesson 1

Open `lessons/001-getting-started.md` and begin your journey!

## Lesson Index

| Lesson                                               | Topic                                   | Estimated Time | Difficulty   |
| ---------------------------------------------------- | --------------------------------------- | -------------- | ------------ |
| [001](lessons/001-getting-started.md)                | Getting Started with GitHub Actions     | 30 min         | Beginner     |
| [002](lessons/002-workflow-anatomy.md)               | Understanding Workflow Anatomy          | 30 min         | Beginner     |
| [003](lessons/003-events-and-triggers.md)            | Events and Triggers                     | 45 min         | Beginner     |
| [004](lessons/004-marketplace-actions.md)            | Working with Actions from Marketplace   | 45 min         | Beginner     |
| [005](lessons/005-secrets-and-environment.md)        | Secrets and Environment Variables       | 45 min         | Intermediate |
| [006](lessons/006-speeding-up-workflows.md)          | Speeding Up Workflows                   | 45 min         | Intermediate |
| [007](lessons/007-debugging-workflows.md)            | Debugging Workflows                     | 60 min         | Intermediate |
| [008](lessons/008-automated-testing.md)              | Running Tests Automatically             | 60 min         | Intermediate |
| [009](lessons/009-building-and-deploying.md)         | Building and Deploying Applications     | 75 min         | Intermediate |
| [010](lessons/010-matrix-and-caching.md)             | Matrix Builds and Caching               | 60 min         | Intermediate |
| [011](lessons/011-multi-job-workflows.md)            | Multi-Job Workflows and Dependencies    | 60 min         | Advanced     |
| [012](lessons/012-custom-actions.md)                 | Creating Custom Actions                 | 90 min         | Advanced     |
| [013](lessons/013-reusability-and-best-practices.md) | Workflow Reusability and Best Practices | 75 min         | Advanced     |

**Total estimated time: 13-16 hours**

## Workshop Sample Application

This repository includes a simple Node.js task manager application (`src/` directory) that you'll use throughout the
workshop. The app includes:

- Basic CRUD operations for tasks
- Unit tests
- A simple API
- Build configuration

You don't need to understand the application code in detail—it's just a realistic example for practicing CI/CD
workflows.

## Glossary of Terms

**Action**: A reusable unit of code that can be shared and used in workflows. Can be created by GitHub, the community,
or you.

**Artifact**: Files or collections of files produced during a workflow run that can be shared between jobs or downloaded
after the workflow completes.

**CI/CD**: Continuous Integration and Continuous Deployment/Delivery. Practices that automate testing and deployment of
code changes.

**Event**: A specific activity that triggers a workflow run (e.g., push, pull request, schedule).

**Job**: A set of steps that execute on the same runner. Workflows can have multiple jobs that run in parallel or
sequentially.

**Runner**: A server that runs your workflows when triggered. Can be GitHub-hosted or self-hosted.

**Secret**: Encrypted environment variables that store sensitive information (API keys, passwords, tokens).

**Step**: An individual task within a job that can run commands or actions.

**Workflow**: An automated process defined by a YAML file in `.github/workflows/` that runs one or more jobs.

**Workflow Run**: An instance of your workflow that executes when the triggering event occurs.

**YAML**: A human-readable data serialization language commonly used for configuration files (Yet Another Markup
Language).

## Tips for Success

- **Experiment freely**: You can't break anything! If something goes wrong, you can always fork the repository again.
- **Read error messages carefully**: GitHub Actions provides detailed logs that usually point you to the problem.
- **Use the documentation**: Link to official docs are provided throughout. Don't hesitate to explore them.
- **Take breaks**: Some lessons are long. Break them into smaller sessions if needed.
- **Ask for help**: If you get stuck, check the troubleshooting sections in each lesson or search GitHub's community
  forums.

## Common Issues

### Workflows Not Appearing

If you create a workflow but don't see it in the Actions tab:

- Check that the file is in `.github/workflows/` directory
- Verify the YAML syntax is valid (use a YAML validator)
- Ensure you've pushed the file to GitHub

### Permission Errors

If you get permission errors:

- Check your repository settings under Settings → Actions → General
- Ensure workflow permissions are set appropriately

### Slow Runner Times

GitHub-hosted runners can sometimes be slow during peak times. This is normal and not a problem with your workflow.

## What's Next?

After completing this workshop, continue your GitHub Actions journey with:

- **Official Documentation**: [docs.github.com/actions](https://docs.github.com/en/actions)
- **GitHub Actions Marketplace**: [github.com/marketplace?type=actions](https://github.com/marketplace?type=actions) -
  Explore thousands of pre-built actions
- **GitHub Skills**: [skills.github.com](https://skills.github.com/) - Interactive courses
- **Awesome Actions**: [github.com/sdras/awesome-actions](https://github.com/sdras/awesome-actions) - Curated list of
  awesome actions
- **Security Best Practices**:
  [docs.github.com/en/actions/security-guides](https://docs.github.com/en/actions/security-guides)

## Contributing

We welcome contributions to improve this workshop! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Style Requirement**: All markdown files use **one sentence per line** for better git diffs and easier review.

## License

This workshop is provided as-is for educational purposes. Feel free to use and adapt it for your learning or teaching
needs.

---

**Ready to begin?** Head to [Lesson 1: Getting Started with GitHub Actions](lessons/001-getting-started.md) and let's
automate all the things!
