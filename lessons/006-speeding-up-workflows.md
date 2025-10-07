# Lesson 6: Speeding Up Workflows

**Estimated Time**: 45 minutes
**Difficulty**: Intermediate

## Problem Statement

Your CI/CD pipeline works perfectly—tests pass, builds succeed, deployments complete—but it takes 15 minutes to run. Developers wait around for feedback, context-switching to other tasks and losing focus. Pull requests pile up because nobody wants to wait for the slow pipeline. When someone finds a typo in documentation, they still have to wait through the entire 15-minute build process.

Slow workflows kill productivity and discourage frequent commits. Fast feedback is essential for modern development. A 2-minute pipeline enables rapid iteration, while a 15-minute pipeline creates bottlenecks. The difference between a fast and slow CI/CD pipeline can determine whether your team ships features daily or weekly.

In this lesson, you'll learn practical techniques to dramatically speed up your GitHub Actions workflows without sacrificing thoroughness or reliability.

## Concepts Introduction

### Why Workflow Speed Matters

**Developer Productivity**: Developers stay in flow when feedback is fast. Waiting 15 minutes breaks concentration and reduces output.

**Faster Iteration**: Quick feedback enables rapid experimentation. Try an approach, get results in 2 minutes, adjust, repeat.

**Reduced Costs**: GitHub Actions bills by compute minutes. Faster workflows cost less, especially for organizations with hundreds of repositories.

**Better Developer Experience**: Fast CI/CD makes developers happy. Slow CI/CD frustrates them and encourages shortcuts.

### The Performance Bottleneck Trinity

Most workflow slowdowns come from three sources:

1. **Dependency Installation**: Downloading and installing packages (npm, pip, etc.)
2. **Compilation/Build**: Transpiling, bundling, minifying code
3. **Test Execution**: Running comprehensive test suites

### Optimization Strategies

**Caching**: Store and reuse files between workflow runs (dependencies, build artifacts)

**Parallelization**: Run independent jobs simultaneously instead of sequentially

**Selective Execution**: Only run tests/builds for changed code

**Job Concurrency**: Cancel outdated workflow runs when new commits are pushed

**Artifact Reuse**: Build once, deploy many times

**Targeted Triggers**: Don't run full pipelines for documentation changes

## Step-by-Step Instructions

### Step 1: Benchmark Your Current Workflow

First, let's create a baseline workflow to measure. Create `.github/workflows/slow-workflow.yml`:

```yaml
name: Slow Workflow (Baseline)

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  build-and-test:
    name: Build and Test (No Optimization)
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          # NO CACHING - this will be slow

      - name: Install dependencies
        run: |
          echo "⏱️  Installing dependencies without cache..."
          time npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Workflow timing
        run: echo "⏱️  Check the workflow duration in the Actions tab"
```

Run this workflow and note the total execution time. For a typical Node.js project, expect 3-5 minutes.

### Step 2: Add Dependency Caching

The fastest dependency install is the one you skip. Create `.github/workflows/cached-workflow.yml`:

```yaml
name: Cached Workflow (Step 1)

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  build-and-test:
    name: Build and Test (With Caching)
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js with caching
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # 🚀 This one line can save 1-2 minutes!

      - name: Install dependencies
        run: |
          echo "⏱️  Installing dependencies with cache..."
          time npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
```

**What changed**: The `cache: 'npm'` parameter tells `actions/setup-node` to automatically cache `node_modules` between runs.

**Expected speedup**: First run is same speed (cache is empty), but subsequent runs are **1-3 minutes faster**.

### Step 3: Parallelize Independent Jobs

Why run linting, tests, and builds sequentially when they can run simultaneously? Create `.github/workflows/parallel-workflow.yml`:

```yaml
name: Parallel Workflow (Step 2)

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  # These three jobs run in parallel
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

**Expected speedup**: If each step takes 2 minutes, sequential execution takes 6 minutes. Parallel execution takes 2 minutes (the longest job).

**Tradeoff**: You're running `npm ci` three times (once per job). But with caching, this is still faster than running sequentially.

### Step 4: Cancel Outdated Workflow Runs

When you push multiple commits to a PR, old workflow runs are usually irrelevant. Cancel them automatically:

```yaml
name: Workflow with Concurrency Control

on:
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # 🚀 Cancel old runs when new commits arrive

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

**What this does**: If you push a new commit while a workflow is running, GitHub cancels the old run and starts the new one.

**Why it helps**: Saves compute minutes and shows results for the latest code faster.

**When to use**: Always for PR workflows. Never for main branch deployment workflows (you want those to complete).

### Step 5: Path-Based Selective Execution

Don't run tests when only documentation changes. Create `.github/workflows/smart-triggers.yml`:

```yaml
name: Smart Trigger Workflow

on:
  pull_request:
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package.json'
      - 'package-lock.json'
      # NOT docs/** or *.md

jobs:
  test:
    name: Test (Only for Code Changes)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

Create a separate workflow for documentation: `.github/workflows/docs-check.yml`:

```yaml
name: Documentation Check

on:
  pull_request:
    paths:
      - 'docs/**'
      - '**.md'

jobs:
  lint-docs:
    name: Lint Documentation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check markdown
        run: |
          echo "Checking markdown files..."
          # Use a markdown linter here
          echo "✅ Documentation checks passed"
```

**Expected speedup**: Documentation PRs now take seconds instead of minutes.

### Step 6: Build Once, Use Multiple Times

For deployment workflows, build once and reuse the artifact:

```yaml
name: Build Once, Deploy Everywhere

on:
  push:
    branches: [ main ]

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

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-staging:
    name: Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - name: Deploy
        run: echo "Deploying to staging..."

  deploy-production:
    name: Deploy to Production
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - name: Deploy
        run: echo "Deploying to production..."
```

**Why it's faster**: Build happens once. Both deployments use the same artifact, no need to rebuild.

### Step 7: The Complete Optimized Workflow

Putting it all together. Create `.github/workflows/optimized-workflow.yml`:

```yaml
name: Optimized Workflow (Complete)

on:
  push:
    branches: [ main ]
  pull_request:
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package*.json'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

jobs:
  # Quick validation runs first
  quick-check:
    name: Quick Validation
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  # Parallel test and build
  test:
    name: Test
    needs: quick-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  build:
    name: Build
    needs: quick-check
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
          name: build-${{ github.sha }}
          path: dist/
          retention-days: 7

  # Only deploy on main branch
  deploy:
    name: Deploy
    if: github.ref == 'refs/heads/main'
    needs: [test, build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/
      - run: echo "Deploying..."
```

**Optimization techniques used**:
1. ✅ Dependency caching
2. ✅ Parallel job execution
3. ✅ Concurrency control (cancel old PR runs)
4. ✅ Path-based triggers
5. ✅ Build artifact reuse
6. ✅ Timeout limits
7. ✅ Fast-fail strategy (lint first, then test/build)

## Performance Comparison

### Before Optimization
```
Sequential workflow:
- Setup + Dependencies: 2 min
- Lint: 1 min
- Test: 2 min
- Build: 2 min
Total: ~7 minutes
```

### After Optimization
```
Parallel workflow with caching:
- Setup + Dependencies: 30 sec (cached)
- Lint, Test, Build (parallel): 2 min (longest job)
Total: ~2.5 minutes
```

**Result**: **65% faster** (7 min → 2.5 min)

## Common Pitfalls and Troubleshooting

### Cache Not Restoring

If caching doesn't work:
- Verify `cache: 'npm'` is set in `setup-node`
- Check that `package-lock.json` exists (cache key depends on it)
- First run after adding caching is always slow (cache is empty)

### Parallel Jobs Increase Total Time

If parallelization makes things slower:
- You're paying the setup cost multiple times
- Only parallelize if each job is substantial (> 1 minute)
- Consider sharing setup between jobs with artifacts

### Cancelled Workflows Cause Confusion

If `cancel-in-progress: true` causes issues:
- Don't use it on main/production branches
- Only use for PR branches where latest code matters most

### Path Filters Too Restrictive

If workflows don't trigger when they should:
- Review your path filters carefully
- Test by making changes to different file types
- Remember: `paths:` is an AND condition with branch filters

## Advanced Optimization Tips

### 1. Use Faster Runners

```yaml
jobs:
  test:
    # GitHub's larger runners (paid)
    runs-on: ubuntu-latest-4-cores
    # Or use self-hosted runners with SSD and more RAM
```

### 2. Cache Multiple Levels

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
      dist/
    key: ${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

### 3. Skip CI for Trivial Changes

Add `[skip ci]` to commit messages for documentation fixes:
```bash
git commit -m "Fix typo in README [skip ci]"
```

### 4. Use Sparse Checkout for Large Repos

```yaml
- uses: actions/checkout@v4
  with:
    sparse-checkout: |
      src/
      tests/
```

## Exercise

Optimize your current workflow:

1. Add dependency caching to your workflow
2. Identify 2-3 jobs that can run in parallel
3. Add concurrency control for PR workflows
4. Create path filters to skip unnecessary runs
5. Compare the "before" and "after" execution times

**Success criteria**: Your workflow should be at least 40% faster.

**Bonus**: Create a comparison table showing execution times before and after each optimization technique.

<details>
<summary>Click to see example comparison table</summary>

```markdown
| Optimization | Time Before | Time After | Improvement |
|--------------|-------------|------------|-------------|
| Baseline | 7:30 | 7:30 | - |
| + Caching | 7:30 | 5:45 | 23% |
| + Parallelization | 5:45 | 3:15 | 43% |
| + Concurrency | 3:15 | 3:15 | 0%* |
| + Path filters | 3:15 | 0:30** | 85% |

*Saves compute time on cancelled runs, not wall time
**For documentation-only changes
```
</details>

## Key Takeaways

- Dependency caching is the easiest and most impactful optimization (enable with `cache: 'npm'`)
- Parallelize independent jobs to dramatically reduce total workflow time
- Use concurrency controls to cancel outdated PR workflow runs
- Path-based triggers prevent unnecessary workflow executions
- Build once and deploy multiple times using artifacts
- Fast feedback (< 3 minutes) significantly improves developer productivity
- Always measure before and after optimization to validate improvements

---

**Previous Lesson**: [Secrets and Environment Variables](005-secrets-and-environment.md)

**Next Lesson**: [Debugging Workflows](007-debugging-workflows.md) - Learn to troubleshoot failing workflows effectively.

**Additional Resources**:
- [Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Using Concurrency](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#concurrency)
- [Workflow Triggers: paths filter](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)
- [Best Practices for Speed](https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration)
