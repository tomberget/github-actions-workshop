# Lesson 7: Running Tests Automatically

**Estimated Time**: 60 minutes **Difficulty**: Intermediate

## Problem Statement

Your team has comprehensive test coverage, but developers sometimes forget to run tests before pushing code. Last week,
a broken commit made it to the main branch because someone was in a hurry. The bug wasn't discovered until it reached
staging, wasting hours of debugging time and delaying other features.

Manual testing is unreliable. Human memory fails. People get busy. But automated testing never forgets—every push, every
pull request gets tested consistently. This is the heart of Continuous Integration: automatically verifying that new
code works with existing code.

In this lesson, you'll build a complete automated testing pipeline that runs unit tests, generates coverage reports, and
prevents broken code from being merged.

## Concepts Introduction

### Continuous Integration (CI)

CI is the practice of automatically testing code changes. Key principles:

- Run tests on every push and pull request
- Fail fast—detect problems immediately
- Test in clean, reproducible environments
- Report results clearly to developers

### Types of Tests in CI

**Unit Tests**: Test individual functions and components in isolation

- Fast to run (seconds)
- High coverage is achievable
- Foundation of test pyramid

**Integration Tests**: Test how components work together

- Slower than unit tests
- Test realistic scenarios
- May require database or external services

**End-to-End (E2E) Tests**: Test complete user workflows

- Slowest to run (minutes)
- Most brittle
- Catch issues unit tests miss

In CI, prioritize fast tests that run on every commit. Save slow E2E tests for less frequent runs.

### Test Coverage

Coverage measures which lines of code are executed during tests:

- **Line coverage**: Percentage of code lines executed
- **Branch coverage**: Percentage of conditional branches taken
- **Function coverage**: Percentage of functions called

High coverage doesn't guarantee good tests, but low coverage reveals gaps.

### Failing Fast vs Comprehensive Reporting

Two strategies:

1. **Fail fast**: Stop at first test failure (faster feedback)
2. **Continue**: Run all tests to see all failures (better for debugging)

Most CI pipelines fail fast on PR tests but run comprehensive tests on main branch.

## Step-by-Step Instructions

### Step 1: Create a Basic Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Run Test Suite
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
```

This workflow:

- Runs on pushes and PRs to main/develop
- Installs dependencies with `npm ci` (cleaner than `npm install`)
- Runs linter, tests, and build
- Fails if any step returns non-zero exit code

### Step 2: Add Test Coverage

Modify the workflow to generate and upload coverage reports:

```yaml
name: Run Tests with Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Test and Coverage
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Display coverage summary
        run: |
          echo "## Test Coverage Summary" >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          cat coverage/coverage-summary.txt || echo "No coverage summary found"
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 30

      - name: Check coverage thresholds
        run: |
          echo "Checking coverage meets minimum thresholds..."
          # In real workflow, you'd use a tool to enforce thresholds
          # Example: jest --coverage --coverageThreshold='{"global":{"branches":80}}'
```

**Key additions**:

- Uses Node.js built-in coverage (`npm run test:coverage`)
- Writes summary to `$GITHUB_STEP_SUMMARY` (appears on workflow run page)
- Uploads coverage artifacts
- Can enforce minimum coverage thresholds

### Step 3: Test Multiple Node Versions (Preview of Lesson 9)

Good CI tests against multiple versions of your runtime:

```yaml
name: Test Multiple Node Versions

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test on Node ${{ matrix.node-version }}
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

This creates three parallel jobs, one for each Node version. If your app breaks on Node 22, you'll know immediately.

### Step 4: Add Status Checks and PR Protections

After pushing the workflow, configure branch protection:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Check "Require status checks to pass before merging"
4. Select your test workflow as a required check
5. (Optional) Check "Require branches to be up to date before merging"

Now PRs cannot be merged if tests fail!

### Step 5: Create Separate Workflows for Different Test Types

Split fast and slow tests. Create `.github/workflows/pr-checks.yml`:

```yaml
name: PR Checks (Fast)

on:
  pull_request:
    branches: [main]

jobs:
  quick-checks:
    name: Quick Validation
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint check
        run: npm run lint

      - name: Type check
        run: |
          echo "Running type checks..."
          # npx tsc --noEmit (if using TypeScript)

      - name: Unit tests only (fast)
        run: npm test -- --selectProjects=unit
        env:
          CI: true
```

And `.github/workflows/full-test-suite.yml`:

```yaml
name: Full Test Suite (Slow)

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 2 * * *" # Nightly at 2 AM

jobs:
  comprehensive-tests:
    name: Run All Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run all tests
        run: npm test

      - name: Integration tests
        run: npm run test:integration --if-present

      - name: E2E tests
        run: npm run test:e2e --if-present

      - name: Performance tests
        run: npm run test:performance --if-present
```

**Strategy**:

- **PR checks**: Fast tests (< 5 minutes), required for merging
- **Full suite**: Comprehensive tests (20-30 minutes), runs on main branch and nightly

### Step 6: Add Test Result Reporting

Create `.github/workflows/test-with-reporting.yml`:

```yaml
name: Tests with Reporting

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        id: tests
        run: npm test 2>&1 | tee test-output.log
        continue-on-error: true

      - name: Parse test results
        if: always()
        run: |
          if [ "${{ steps.tests.outcome }}" == "failure" ]; then
            echo "## ❌ Tests Failed" >> $GITHUB_STEP_SUMMARY
          else
            echo "## ✅ Tests Passed" >> $GITHUB_STEP_SUMMARY
          fi
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### Test Output" >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          tail -n 50 test-output.log >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY

      - name: Fail if tests failed
        if: steps.tests.outcome == 'failure'
        run: exit 1
```

This creates a formatted summary visible on the workflow run page.

## Common Pitfalls and Troubleshooting

### Tests Pass Locally But Fail in CI

Common causes:

- **Environment differences**: Missing environment variables or dependencies
- **File paths**: CI runs in different directory structure
- **Timing issues**: Tests that depend on timing may be flaky
- **Parallel execution**: Tests interfere with each other

Fix: Make tests independent and use consistent environments.

### Flaky Tests

Tests that pass sometimes and fail other times:

- Usually caused by timing, randomness, or external dependencies
- Solution: Increase timeouts, mock external services, use deterministic data

### Slow Test Execution

If tests take too long:

- Run faster tests more frequently (unit tests on every commit)
- Run slow tests less frequently (E2E tests nightly)
- Parallelize tests across multiple runners (Lesson 9)
- Cache dependencies aggressively

### npm ci vs npm install

Always use `npm ci` in CI environments:

- `npm install`: May update dependencies within semver ranges
- `npm ci`: Exactly installs versions from package-lock.json
- CI needs reproducible builds

## Exercise

Create a workflow that:

1. Runs on pull requests to main
2. Installs dependencies and runs tests
3. Generates coverage report
4. Uploads coverage as artifact
5. Fails if coverage is below 80% (you'll need to check this somehow)
6. Adds coverage summary to the step summary

Hint: You may need to modify `package.json` scripts or parse coverage output.

<details>
 <summary>Click to see solution</summary>

```yaml
name: PR Tests with Coverage

on:
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test with Coverage Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Check coverage threshold
        run: |
          # This is a simple example - real implementation would parse JSON
          echo "Checking coverage thresholds..."
          # You could use: npx c8 check-coverage --lines 80 --functions 80 --branches 80

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

      - name: Add coverage to summary
        if: always()
        run: |
          echo "## Test Coverage Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Coverage report uploaded as artifact." >> $GITHUB_STEP_SUMMARY
```

</details>

## Key Takeaways

- Automate all tests to run on every push and pull request
- Use `npm ci` for reproducible installs in CI
- Generate and track test coverage over time
- Split fast tests (run often) from slow tests (run less frequently)
- Use branch protection to prevent merging failing code
- Make tests deterministic and independent to avoid flaky failures
- Upload test results and coverage as artifacts for historical analysis

---

**Previous Lesson**: [Debugging Workflows](007-debugging-workflows.md)

**Next Lesson**: [Building and Deploying Applications](009-building-and-deploying.md) - Deploy your tested code
automatically.

**Additional Resources**:

- [Running Tests in CI/CD](https://docs.github.com/en/actions/automating-builds-and-tests)
- [About Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
