# Lesson 3: Events and Triggers

**Estimated Time**: 45 minutes
**Difficulty**: Beginner

## Problem Statement

So far, your workflows have triggered on every push to the repository. But what if you only want to run tests when a pull request is opened? Or deploy to production only when you create a release? Or run maintenance tasks every night at 2 AM?

Without fine-grained control over when workflows run, you'll waste computing resources, slow down feedback, and potentially deploy code at the wrong time. Imagine accidentally deploying to production every time someone pushes to their feature branch—that would be a disaster!

In this lesson, you'll master GitHub Actions events and learn how to trigger workflows at exactly the right moment for exactly the right reason. This precision is what separates amateur automation from production-grade CI/CD pipelines.

## Concepts Introduction

### What Are Workflow Events?

Events are specific activities that trigger a workflow run. Think of them as "webhooks" or "signals" that tell GitHub Actions, "Hey, something happened—you should probably run this workflow now."

GitHub provides dozens of event types, from code-related events (push, pull requests) to project management events (issues, project cards) to scheduled events (cron jobs).

### Event Categories

Events generally fall into these categories:

**Code Events**: Triggered by code changes
- `push` - Code pushed to the repository
- `pull_request` - PR opened, updated, or closed
- `pull_request_review` - PR reviewed
- `release` - Release created, published, or deleted

**Issue/Project Events**: Triggered by project management activities
- `issues` - Issue opened, closed, labeled, etc.
- `issue_comment` - Comment on issue or PR
- `project_card` - Project board card moved

**Scheduled Events**: Triggered by time
- `schedule` - Runs on a cron schedule (like "every Monday at 9 AM")

**Manual Events**: Triggered by you
- `workflow_dispatch` - Manual trigger from GitHub UI or API
- `repository_dispatch` - Trigger via external API call

**Workflow Events**: Triggered by other workflows
- `workflow_call` - Called by another workflow (reusable workflows)
- `workflow_run` - When another workflow completes

### Event Filtering

Most events support filters to be more specific about when they should trigger. For example:

- Only trigger on pushes to `main` branch
- Only trigger on PRs with label `ready-for-review`
- Only trigger on issues with specific labels
- Only trigger when certain files change

This precision prevents unnecessary workflow runs and saves resources.

### Activity Types

Many events have activity types that specify exactly what happened. For example, `pull_request` has activity types like:
- `opened` - PR was just created
- `synchronize` - New commits pushed to PR
- `closed` - PR was closed
- `labeled` - Label added to PR
- `reopened` - PR was reopened

By default, GitHub uses sensible defaults, but you can specify exactly which activity types you care about.

## Step-by-Step Instructions

Let's explore different event types by creating several workflows.

### Step 1: Create a Pull Request Workflow

Create `.github/workflows/pr-checks.yml`:

```yaml
name: Pull Request Checks

on:
  pull_request:
    types: [ opened, synchronize, reopened ]
    branches: [ main, develop ]

jobs:
  validate:
    name: Validate Pull Request
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: PR Information
        run: |
          echo "PR #${{ github.event.pull_request.number }}"
          echo "Title: ${{ github.event.pull_request.title }}"
          echo "Author: ${{ github.event.pull_request.user.login }}"
          echo "Base branch: ${{ github.event.pull_request.base.ref }}"
          echo "Head branch: ${{ github.event.pull_request.head.ref }}"

      - name: Check PR title format
        run: |
          PR_TITLE="${{ github.event.pull_request.title }}"
          if [[ $PR_TITLE =~ ^(feat|fix|docs|chore|refactor):\ .+ ]]; then
            echo "✅ PR title follows convention"
          else
            echo "❌ PR title must start with feat:, fix:, docs:, chore:, or refactor:"
            exit 1
          fi
```

**What this does**:
- Triggers on PRs that are opened, updated (synchronize), or reopened
- Only for PRs targeting `main` or `develop` branches
- Validates that PR titles follow a convention (e.g., "feat: add new feature")

### Step 2: Create a Release Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release Workflow

on:
  release:
    types: [ published ]

jobs:
  celebrate:
    name: Celebrate Release
    runs-on: ubuntu-latest

    steps:
      - name: Release information
        run: |
          echo "🎉 New release published!"
          echo "Tag: ${{ github.event.release.tag_name }}"
          echo "Name: ${{ github.event.release.name }}"
          echo "Author: ${{ github.event.release.author.login }}"
          echo "Prerelease: ${{ github.event.release.prerelease }}"

      - name: Simulate deployment
        run: |
          echo "Deploying version ${{ github.event.release.tag_name }} to production..."
          sleep 3
          echo "✅ Deployment successful!"
```

**What this does**:
- Triggers when a release is published (not drafted or created, only published)
- Accesses release-specific data via `github.event.release`
- Simulates a deployment (in real life, this would deploy to production)

### Step 3: Create a Scheduled Workflow

Create `.github/workflows/nightly-tasks.yml`:

```yaml
name: Nightly Maintenance

on:
  schedule:
    # Runs at 2:00 AM UTC every day
    - cron: '0 2 * * *'
  workflow_dispatch:  # Also allow manual triggering

jobs:
  maintenance:
    name: Run Maintenance Tasks
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Current time
        run: |
          echo "Running scheduled maintenance at: $(date)"
          echo "Triggered by: ${{ github.event_name }}"

      - name: Cleanup old logs
        run: |
          echo "Cleaning up old log files..."
          # In real scenario, you might delete old artifacts, clean caches, etc.
          echo "✅ Cleanup complete"

      - name: Generate daily report
        run: |
          echo "Generating daily statistics report..."
          echo "Repository: ${{ github.repository }}"
          echo "Report date: $(date +%Y-%m-%d)"
```

**Cron syntax quick reference**:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-6, Sunday = 0)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

Examples:
- `0 2 * * *` - Every day at 2:00 AM
- `30 5 * * 1` - Every Monday at 5:30 AM
- `0 0 1 * *` - First day of every month at midnight
- `*/15 * * * *` - Every 15 minutes

**Important**: Scheduled workflows only run on the default branch (usually `main`).

### Step 4: Create a Path-Filtered Workflow

Create `.github/workflows/docs-update.yml`:

```yaml
name: Documentation Update

on:
  push:
    branches: [ main ]
    paths:
      - 'docs/**'
      - '**.md'
      - 'README.md'

jobs:
  docs-changed:
    name: Documentation Changed
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: List changed files
        run: |
          echo "Documentation files were updated!"
          echo "This workflow only runs when docs or markdown files change."

      - name: Validate markdown
        run: |
          echo "Checking markdown files for broken links..."
          # In reality, you'd use a tool like markdownlint or markdown-link-check
          echo "✅ All markdown files are valid"
```

**Path filters**:
- `docs/**` - Any file in the `docs` directory or subdirectories
- `**.md` - Any markdown file anywhere in the repository
- `src/*.js` - JavaScript files directly in `src` (not subdirectories)
- `!dist/**` - Exclude files in `dist` directory (the `!` negates)

### Step 5: Create a Manual Trigger Workflow

Create `.github/workflows/manual-deploy.yml`:

```yaml
name: Manual Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to deploy'
        required: true
        type: string
      dry-run:
        description: 'Perform a dry run?'
        required: false
        type: boolean
        default: true

jobs:
  deploy:
    name: Deploy to ${{ inputs.environment }}
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deployment info
        run: |
          echo "Deploying to: ${{ inputs.environment }}"
          echo "Version: ${{ inputs.version }}"
          echo "Dry run: ${{ inputs.dry-run }}"

      - name: Perform deployment
        run: |
          if [ "${{ inputs.dry-run }}" == "true" ]; then
            echo "🔍 DRY RUN MODE - No actual deployment"
          else
            echo "🚀 Deploying version ${{ inputs.version }} to ${{ inputs.environment }}"
            # Actual deployment commands would go here
          fi
          echo "✅ Deployment complete"
```

**What this does**:
- Only triggers manually from the GitHub UI
- Presents a form with three inputs:
  - `environment`: Dropdown with staging/production options
  - `version`: Text input for version number
  - `dry-run`: Checkbox (boolean) with default `true`
- Accesses inputs via `inputs.<name>` (not `github.event.inputs.<name>`)

### Step 6: Commit All Workflows

```bash
git add .github/workflows/*.yml
git commit -m "Add event-triggered workflows"
git push origin main
```

### Step 7: Test the Workflows

**Test PR workflow**:
1. Create a new branch: `git checkout -b test-pr-workflow`
2. Make any small change to a file
3. Commit and push: `git push origin test-pr-workflow`
4. Open a PR on GitHub targeting `main`
5. Try different PR titles (with and without prefix) to see the validation

**Test scheduled workflow**:
- You can't easily test scheduled workflows without waiting, so use the `workflow_dispatch` trigger you added
- Go to Actions → "Nightly Maintenance" → "Run workflow"

**Test manual deployment**:
1. Go to Actions → "Manual Deployment"
2. Click "Run workflow"
3. Fill in the form:
   - Environment: staging
   - Version: 1.0.0
   - Dry run: checked
4. Run it and observe the output
5. Run again with dry-run unchecked to see the difference

**Test path-filtered workflow**:
1. Edit a markdown file (like `README.md`)
2. Commit and push to main
3. Check that "Documentation Update" workflow runs
4. Edit a non-documentation file (like `package.json`)
5. Commit and push—workflow should NOT run

## Common Pitfalls and Troubleshooting

### Scheduled Workflows Don't Run

- Scheduled workflows only run on the default branch (usually `main`)
- If your repository has low activity, GitHub may disable scheduled workflows (you'll get a notification)
- Cron uses UTC timezone—adjust for your local time
- There can be delays during high-traffic times on GitHub

### Event Payload Access

Different events provide different data. Always check the documentation for what's available:
- `github.event.pull_request.*` for PR events
- `github.event.issue.*` for issue events
- `github.event.release.*` for release events

### Path Filters and Ignoring Files

Path filters are evaluated when the workflow file is pushed. If you add a filter later, it only applies to future commits:

```yaml
# This will run for any changes EXCEPT in docs/
on:
  push:
    paths-ignore:
      - 'docs/**'
```

### Multiple Event Types

You can trigger on multiple events:

```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
```

This workflow runs on pushes to main, PRs to main, AND manual triggers.

## Exercise

Create a new workflow that:

1. Triggers when issues are opened or reopened
2. Prints the issue title, author, and labels
3. Adds a comment to the issue saying "Thank you for opening this issue!"

**Hint**: You'll need the `issues` event and `github.event.issue.*` context.

**Bonus**: Use the GitHub CLI (`gh`) or an action to actually post a comment (search GitHub Actions Marketplace for "issue comment").

<details>
<summary>Click to see solution</summary>

```yaml
name: Issue Welcome

on:
  issues:
    types: [ opened, reopened ]

jobs:
  welcome:
    name: Welcome New Issue
    runs-on: ubuntu-latest

    steps:
      - name: Issue information
        run: |
          echo "Issue #${{ github.event.issue.number }}"
          echo "Title: ${{ github.event.issue.title }}"
          echo "Author: ${{ github.event.issue.user.login }}"
          echo "Labels: ${{ github.event.issue.labels }}"

      - name: Thank the author
        run: |
          echo "Thank you for opening this issue!"
          echo "In a real workflow, we would post a comment here."

      # Bonus: Actually post a comment using GitHub CLI
      - name: Post comment
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          gh issue comment ${{ github.event.issue.number }} \
            --repo ${{ github.repository }} \
            --body "Thank you for opening this issue! Our team will review it soon."
```
</details>

## Key Takeaways

- Events determine when workflows run; choosing the right event is crucial for efficient CI/CD
- Most events support filters (branches, paths, activity types) for precise triggering
- `workflow_dispatch` enables manual workflow runs with custom inputs
- Scheduled workflows use cron syntax and only run on the default branch
- Path filters let you run workflows only when specific files change
- Different events provide different context data via `github.event.*`

---

**Previous Lesson**: [Understanding Workflow Anatomy](002-workflow-anatomy.md)

**Next Lesson**: [Working with Actions from Marketplace](004-marketplace-actions.md) - Use pre-built actions to supercharge your workflows.

**Additional Resources**:
- [Events that Trigger Workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Workflow Syntax: `on`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#on)
- [Crontab Guru](https://crontab.guru/) - Cron expression helper
- [GitHub Event Payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
