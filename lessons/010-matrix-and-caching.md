# Lesson 9: Matrix Builds and Caching

**Estimated Time**: 60 minutes **Difficulty**: Intermediate

## Problem Statement

Your application needs to support multiple Node.js versions, multiple operating systems, and multiple configurations.
Running separate workflows for each combination would be tedious and hard to maintain. Meanwhile, every workflow run
downloads the same dependencies, wasting 2-3 minutes every single time.

Matrix builds let you test multiple configurations in parallel with minimal code duplication. Caching stores
dependencies between runs, dramatically speeding up workflows. Together, these features make your CI/CD pipeline faster
and more comprehensive.

## Concepts Introduction

### Matrix Strategy

A matrix creates multiple job variations from a single configuration. Instead of writing 9 separate jobs for 3 Node
versions × 3 operating systems, you write one job with a matrix.

### Caching in CI/CD

Caching stores files between workflow runs:

- Dependencies (node_modules, pip packages, etc.)
- Build outputs
- Tools and binaries

GitHub Actions provides 10GB of cache storage per repository (free tier).

## Step-by-Step Instructions

### Step 1: Basic Matrix Build

`.github/workflows/matrix-basic.yml`:

```yaml
name: Matrix Build

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - run: npm ci
      - run: npm test

      - name: Show configuration
        run: echo "Testing on ${{ matrix.os }} with Node ${{ matrix.node-version }}"
```

This creates 9 jobs (3 OS × 3 Node versions) that run in parallel.

### Step 2: Matrix with Includes and Excludes

`.github/workflows/matrix-advanced.yml`:

```yaml
name: Advanced Matrix

on: push

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [18, 20]
        include:
          # Add special case: Node 22 only on Ubuntu
          - os: ubuntu-latest
            node-version: 22
        exclude:
          # Skip Node 18 on Windows
          - os: windows-latest
            node-version: 18

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm test
```

Creates 4 jobs: Ubuntu 18/20/22, Windows 20.

### Step 3: Fail-Fast vs Continue-on-Error

```.yaml
name: Matrix with Fail Fast

on: push

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false  # Don't cancel other jobs if one fails
      matrix:
        os: [ubuntu-latest, macos-latest]
        node-version: [18, 20]

    continue-on-error: ${{ matrix.node-version == 22 }}  # Allow Node 22 to fail

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm test
```

### Step 4: Manual Caching

`.github/workflows/manual-cache.yml`:

```yaml
name: Manual Caching

on: push

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Cache dependencies
        id: cache-deps
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        if: steps.cache-deps.outputs.cache-hit != 'true'
        run: npm ci

      - name: Build
        run: npm run build

      - name: Cache build output
        uses: actions/cache@v4
        with:
          path: dist
          key: ${{ runner.os }}-build-${{ github.sha }}
```

### Step 5: Complete Example with Matrix and Caching

`.github/workflows/optimized-ci.yml`:

```yaml
name: Optimized CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    name: Test (Node ${{ matrix.node-version }}, ${{ matrix.os }})
    runs-on: ${{ matrix.os }}

    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20]
        include:
          - os: ubuntu-latest
            node-version: 22

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Upload coverage
        if: matrix.os == 'ubuntu-latest' && matrix.node-version == 20
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

## Exercise

Create a matrix workflow that:

1. Tests on Ubuntu, Windows, and macOS
2. Tests Node 18 and 20
3. Only uploads artifacts from Ubuntu + Node 20 job
4. Uses caching for dependencies
5. Doesn't fail fast

## Key Takeaways

- Use matrix strategy to test multiple configurations with one job definition
- `fail-fast: false` runs all matrix jobs even if one fails
- Caching dramatically speeds up workflows by reusing dependencies
- `actions/setup-node` has built-in caching with `cache: 'npm'`
- Use `hashFiles()` to create cache keys based on lockfile content

---

**Previous**: [Building and Deploying](009-building-and-deploying.md) | **Next**:
[Multi-Job Workflows](011-multi-job-workflows.md)
