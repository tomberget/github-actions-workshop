# Lesson 12: Workflow Reusability and Best Practices

**Estimated Time**: 75 minutes
**Difficulty**: Advanced

## Problem Statement

You've built dozens of workflows across multiple repositories. They all follow similar patterns: checkout code, setup environment, run tests, deploy. But each workflow is slightly different, making maintenance a nightmare. When you need to update Node.js versions or change security policies, you have to update every single workflow file.

Reusable workflows and established best practices solve this problem. In this final lesson, you'll learn to create maintainable, efficient, and secure GitHub Actions workflows that scale across your entire organization.

## Concepts Introduction

### Reusable Workflows

Unlike custom actions (which encapsulate steps), reusable workflows encapsulate entire jobs. They can:
- Be called from other workflows
- Accept inputs and secrets
- Be version-controlled and updated centrally
- Standardize CI/CD patterns across repositories

### Workflow Best Practices

1. **Security**: Minimize secrets exposure, pin action versions
2. **Performance**: Cache aggressively, run jobs in parallel
3. **Maintainability**: Use reusable workflows, clear naming
4. **Reliability**: Handle failures gracefully, test workflows
5. **Cost**: Optimize runner usage, limit workflow runs

## Step-by-Step Instructions

### Step 1: Create a Reusable Workflow

`.github/workflows/reusable-test.yml`:

```yaml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version to use'
        required: false
        type: string
        default: '20'
      run-coverage:
        description: 'Generate coverage report'
        required: false
        type: boolean
        default: false
    outputs:
      test-result:
        description: 'Test result summary'
        value: ${{ jobs.test.outputs.result }}

jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      result: ${{ steps.test.outputs.result }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'

      - run: npm ci

      - name: Run tests
        id: test
        run: |
          if [ "${{ inputs.run-coverage }}" == "true" ]; then
            npm run test:coverage
          else
            npm test
          fi
          echo "result=passed" >> $GITHUB_OUTPUT

      - name: Upload coverage
        if: inputs.run-coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

### Step 2: Call the Reusable Workflow

`.github/workflows/use-reusable.yml`:

```yaml
name: Use Reusable Workflow

on: [push, pull_request]

jobs:
  call-test-workflow:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '20'
      run-coverage: true

  deploy:
    needs: call-test-workflow
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Tests result: ${{ needs.call-test-workflow.outputs.test-result }}"
          echo "Deploying..."
```

### Step 3: Security Best Practices

`.github/workflows/security-best-practices.yml`:

```yaml
name: Security Best Practices

on: push

permissions:
  contents: read
  issues: write

jobs:
  secure-workflow:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # GOOD: Pin to specific SHA for critical workflows
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: '20'

      # GOOD: Limit token permissions
      - name: Use GitHub token
        env:
          GH_TOKEN: ${{ github.token }}
        run: gh api repos/${{ github.repository }}

      # GOOD: Mask sensitive data
      - name: Handle secrets securely
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          # Never echo secrets directly
          # echo "$API_KEY"  # BAD!

          # Use them in commands instead
          curl -H "Authorization: Bearer $API_KEY" https://api.example.com

      # GOOD: Validate inputs
      - name: Validate external input
        run: |
          INPUT="${{ github.event.pull_request.title }}"
          # Sanitize and validate external input before using
          SANITIZED=$(echo "$INPUT" | tr -cd '[:alnum:][:space:]')
          echo "Title: $SANITIZED"
```

### Step 4: Performance Best Practices

`.github/workflows/performance-best-practices.yml`:

```yaml
name: Performance Best Practices

on:
  push:
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package.json'
  pull_request:

jobs:
  # GOOD: Run fast checks first
  quick-checks:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # GOOD: Use built-in caching

      - run: npm ci
      - run: npm run lint

  # GOOD: Run jobs in parallel
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration --if-present

  # GOOD: Use concurrency to cancel outdated runs
  slow-e2e-tests:
    runs-on: ubuntu-latest
    concurrency:
      group: e2e-${{ github.ref }}
      cancel-in-progress: true
    steps:
      - uses: actions/checkout@v4
      - run: echo "Running E2E tests..."
```

### Step 5: Maintainability Best Practices

`.github/workflows/maintainability-best-practices.yml`:

```yaml
name: Maintainability Best Practices

on: push

# GOOD: Use env for repeated values
env:
  NODE_VERSION: '20'
  CACHE_VERSION: v1

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # GOOD: Descriptive step names
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # GOOD: Add comments for complex logic
      - name: Build application with optimizations
        run: |
          # Enable production optimizations
          # Minify code and remove debug statements
          npm run build
        env:
          NODE_ENV: production

      # GOOD: Use if conditions appropriately
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: echo "Deploying to production..."

      # GOOD: Always cleanup, even on failure
      - name: Cleanup temporary files
        if: always()
        run: rm -rf tmp/
```

### Step 6: Complete Best Practices Example

`.github/workflows/complete-best-practices.yml`:

```yaml
name: Complete Best Practices

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

# Limit concurrent runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

# Minimal permissions
permissions:
  contents: read
  pull-requests: write

env:
  NODE_VERSION: '20'

jobs:
  validate:
    name: Validate Code
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

  build:
    name: Build Application
    needs: validate
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/
          retention-days: 7

  deploy:
    name: Deploy
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    timeout-minutes: 10

    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/

      - name: Deploy
        run: echo "Deploying..."
```

## Best Practices Checklist

### Security
- [ ] Pin action versions to commit SHAs for production
- [ ] Use minimal permissions with `permissions:`
- [ ] Never log secrets
- [ ] Sanitize external inputs
- [ ] Use environments for deployment protection

### Performance
- [ ] Use caching (`actions/setup-node` with `cache: 'npm'`)
- [ ] Run independent jobs in parallel
- [ ] Use `concurrency:` to cancel outdated runs
- [ ] Filter workflows with `paths:` and `branches:`
- [ ] Set appropriate `timeout-minutes:`

### Maintainability
- [ ] Use reusable workflows for common patterns
- [ ] Define repeated values in `env:`
- [ ] Use clear, descriptive names
- [ ] Add comments for complex logic
- [ ] Group related steps

### Reliability
- [ ] Handle failures with `if: failure()` or `if: always()`
- [ ] Set timeouts to prevent hung jobs
- [ ] Use `fail-fast: false` for comprehensive testing
- [ ] Test workflows before merging
- [ ] Monitor workflow runs and fix flaky tests

## Exercise

Refactor one of your existing workflows to follow all best practices:
1. Add appropriate permissions
2. Use caching
3. Extract common logic to a reusable workflow
4. Add concurrency controls
5. Set timeouts
6. Improve naming and add comments

## Key Takeaways

- Reusable workflows centralize common patterns across repositories
- Pin action versions to commit SHAs for maximum security
- Use minimal permissions and never expose secrets unnecessarily
- Cache dependencies and run jobs in parallel for performance
- Use concurrency controls to cancel outdated workflow runs
- Clear naming, comments, and consistent structure improve maintainability
- Always set timeouts and handle failures gracefully

---

**Previous Lesson**: [Creating Custom Actions](012-custom-actions.md)

**Congratulations!** You've completed the GitHub Actions Workshop. You now have the skills to build production-grade CI/CD pipelines.

**Additional Resources**:
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Reusing Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
