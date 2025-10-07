# Lesson 10: Multi-Job Workflows and Dependencies

**Estimated Time**: 60 minutes
**Difficulty**: Advanced

## Problem Statement

Your workflow has grown complex: tests, builds, deployments, security scans, and notifications. Running everything sequentially takes 30 minutes. Some steps could run in parallel, but others depend on previous steps completing. You need fine-grained control over job execution order.

Multi-job workflows with dependencies let you parallelize independent work while enforcing necessary sequencing. This optimizes CI/CD pipeline speed without compromising correctness.

## Concepts Introduction

### Jobs Run in Parallel by Default

Unless specified, all jobs in a workflow run simultaneously:

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps: [...]

  job2:
    runs-on: ubuntu-latest
    steps: [...]  # Runs at the same time as job1
```

### Job Dependencies with `needs:`

Use `needs:` to create dependencies:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    needs: build  # Waits for build to complete
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: [build, test]  # Waits for BOTH build and test
    runs-on: ubuntu-latest
    steps: [...]
```

### Sharing Data Between Jobs

Jobs run on separate runners, so files don't persist. Use:
- **Artifacts**: Upload/download files between jobs
- **Outputs**: Pass small strings between jobs
- **Cache**: Share dependencies (but not guaranteed to exist)

## Step-by-Step Instructions

### Step 1: Parallel Independent Jobs

`.github/workflows/parallel-jobs.yml`:

```yaml
name: Parallel Jobs

on: push

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: echo "Running type checks..."
```

All three jobs run simultaneously.

### Step 2: Sequential Job Dependencies

`.github/workflows/sequential-jobs.yml`:

```yaml
name: Sequential Pipeline

on: push

jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

  test:
    name: Test
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  deploy:
    name: Deploy
    needs: [build, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/
      - run: |
          echo "Deploying..."
          ls -la dist/
```

Flow: `build` → `test` → `deploy`

### Step 3: Passing Data with Job Outputs

`.github/workflows/job-outputs.yml`:

```yaml
name: Job Outputs

on: workflow_dispatch

jobs:
  generate-version:
    name: Generate Version
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      build-number: ${{ steps.version.outputs.build-number }}

    steps:
      - id: version
        run: |
          VERSION="1.0.${{ github.run_number }}"
          BUILD_NUMBER=${{ github.run_number }}
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "build-number=$BUILD_NUMBER" >> $GITHUB_OUTPUT
          echo "Generated version: $VERSION"

  build:
    name: Build v${{ needs.generate-version.outputs.version }}
    needs: generate-version
    runs-on: ubuntu-latest

    steps:
      - run: |
          echo "Building version ${{ needs.generate-version.outputs.version }}"
          echo "Build number: ${{ needs.generate-version.outputs.build-number }}"
```

### Step 4: Complex Dependency Graph

`.github/workflows/complex-pipeline.yml`:

```yaml
name: Complex Pipeline

on: push

jobs:
  # Stage 1: Run in parallel
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Linting..."

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Unit testing..."

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Security scanning..."

  # Stage 2: Build (after stage 1 completes)
  build:
    needs: [lint, unit-tests, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Building..."
      - run: mkdir -p dist && echo "build" > dist/app.js
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  # Stage 3: Parallel integration tests
  integration-test-api:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - run: echo "Testing API..."

  integration-test-ui:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - run: echo "Testing UI..."

  # Stage 4: Deploy (after all tests pass)
  deploy-staging:
    needs: [integration-test-api, integration-test-ui]
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - run: echo "Deploying to staging..."

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - run: echo "Deploying to production..."
```

Dependency graph:
```
lint ─────┐
unit-tests─┤
security──┘
           ↓
         build
           ↓
    ┌──────┴──────┐
    ↓             ↓
 test-api     test-ui
    └──────┬──────┘
           ↓
    deploy-staging
           ↓
   deploy-production
```

### Step 5: Conditional Job Execution

`.github/workflows/conditional-jobs.yml`:

```yaml
name: Conditional Jobs

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing..."

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to staging..."

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to production..."
```

## Exercise

Create a workflow with:
1. Three parallel jobs: lint, test, build
2. A "package" job that needs all three to complete
3. Two parallel deployment jobs (staging and production) that need "package"
4. Use artifacts to share build output
5. Add job outputs to pass version number through the pipeline

## Key Takeaways

- Jobs run in parallel by default; use `needs:` for dependencies
- `needs: [job1, job2]` waits for ALL listed jobs
- Use artifacts to share files between jobs
- Use job outputs for small data (strings, numbers)
- Complex pipelines can have multiple stages with parallel and sequential execution
- `if:` conditions control whether jobs run

---

**Previous**: [Matrix Builds and Caching](010-matrix-and-caching.md) | **Next**: [Creating Custom Actions](012-custom-actions.md)
