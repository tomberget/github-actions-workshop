# Lesson 4: Working with Actions from Marketplace

**Estimated Time**: 45 minutes
**Difficulty**: Beginner

## Problem Statement

You've learned how to write workflow steps with `run:` commands, but writing everything from scratch is time-consuming and error-prone. Need to set up Node.js? You could manually download and install it with a series of commands. Want to deploy to AWS? You'd need to write dozens of lines of configuration code.

This is like building furniture without power tools—technically possible, but unnecessarily difficult. The GitHub Actions Marketplace contains thousands of pre-built, tested, and maintained actions that solve common problems. Using these actions saves time, reduces errors, and lets you focus on what makes your project unique.

In this lesson, you'll learn how to find, evaluate, and use actions from the Marketplace to supercharge your workflows without reinventing the wheel.

## Concepts Introduction

### What is the GitHub Actions Marketplace?

The GitHub Actions Marketplace is a catalog of reusable actions created by GitHub, verified partners, and the community. Think of it like a package manager (npm, pip, Maven) but specifically for CI/CD tasks.

Actions in the Marketplace can:
- Set up programming language environments (Node.js, Python, Go, etc.)
- Deploy to cloud platforms (AWS, Azure, Google Cloud, Vercel, etc.)
- Send notifications (Slack, Discord, email)
- Manage issues and pull requests
- Run security scans and code quality checks
- Much more!

### Anatomy of an Action Reference

When you use an action, you reference it with this syntax:

```yaml
uses: owner/repository@version
```

For example:
```yaml
uses: actions/checkout@v4
```

- **`actions`** - The GitHub user or organization that owns the action
- **`checkout`** - The repository name (the action itself)
- **`@v4`** - The version (can be a tag, branch, or commit SHA)

### Action Versions: Tags, Branches, and SHAs

You can reference actions using three different version formats:

**1. Tags (Recommended)**
```yaml
uses: actions/setup-node@v4
```
Most stable; action maintainers tag releases with semantic versions.

**2. Branches**
```yaml
uses: actions/setup-node@main
```
Gets the latest code from a branch; less stable but useful for bleeding-edge features.

**3. Commit SHAs**
```yaml
uses: actions/setup-node@b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8
```
Most secure; locks to a specific commit so the code can never change. Used in security-critical environments.

**Best Practice**: Use major version tags like `@v4`. Action maintainers can push bug fixes to `v4` without breaking your workflow, but won't introduce breaking changes (those come in `v5`).

### Action Inputs and Outputs

Many actions accept inputs (configuration parameters) and produce outputs (data for later steps).

**Inputs**:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

**Outputs**:
```yaml
- uses: actions/checkout@v4
  id: checkout
- name: Use checkout output
  run: echo "Checked out ref: ${{ steps.checkout.outputs.ref }}"
```

The `id:` field gives a step a unique identifier so later steps can reference its outputs with `steps.<id>.outputs.<output-name>`.

### Official vs Community Actions

**Official Actions** (by GitHub):
- Start with `actions/` (like `actions/checkout`)
- Heavily tested and maintained
- Generally safe to use

**Verified Creator Actions**:
- Created by GitHub partners
- Display a verified badge
- Usually high quality

**Community Actions**:
- Created by anyone
- Quality varies
- Check stars, recent updates, and code before using in production

### How to Evaluate an Action

Before using an action, check:
1. **Stars and usage**: Popular actions are usually reliable
2. **Last update**: Actively maintained? Or abandoned?
3. **README documentation**: Clear instructions?
4. **Issues**: Any unresolved critical bugs?
5. **Code review** (for security): Does the code look safe?

## Step-by-Step Instructions

Let's build a workflow that uses several popular Marketplace actions.

### Step 1: Explore the Marketplace

1. Go to [github.com/marketplace?type=actions](https://github.com/marketplace?type=actions)
2. Browse by category: "Deployment," "Code quality," "Utilities," etc.
3. Search for "setup node" to find `actions/setup-node`
4. Click on it to see:
   - Description and usage instructions
   - Input parameters
   - Example workflows
   - Version history

### Step 2: Create a Node.js Workflow with Marketplace Actions

Create `.github/workflows/node-ci.yml`:

```yaml
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    name: Build and Test
    runs-on: ubuntu-latest

    steps:
      # Action 1: Checkout code
      - name: Checkout repository
        uses: actions/checkout@v4

      # Action 2: Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # Action 3: Cache dependencies (implicit in setup-node with cache: 'npm')
      # This action automatically caches node_modules to speed up future runs

      # Now use the Node.js environment
      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint --if-present

      - name: Run tests
        run: npm test --if-present

      - name: Build application
        run: npm run build --if-present

      # Action 4: Upload build artifacts
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        if: success()
        with:
          name: build-output
          path: dist/
          retention-days: 7
```

**What each action does**:

1. **`actions/checkout@v4`**: Clones your repository code into the runner
2. **`actions/setup-node@v4`**: Installs Node.js version 20 and configures npm caching
3. **`actions/upload-artifact@v4`**: Saves the build output so you can download it later or use it in another job

### Step 3: Understand Action Inputs

The `actions/setup-node` action accepts several inputs:

```yaml
uses: actions/setup-node@v4
with:
  # Which Node.js version to install
  node-version: '20'

  # Or use a version range
  # node-version: '>=18'

  # Or read from a file
  # node-version-file: '.nvmrc'

  # Cache dependencies for faster builds
  cache: 'npm'  # or 'yarn' or 'pnpm'

  # Registry for publishing (optional)
  # registry-url: 'https://registry.npmjs.org'
```

To find what inputs an action supports:
- Check the action's README on GitHub
- Look at the `action.yml` file in the action's repository

### Step 4: Using Action Outputs

Some actions produce outputs you can use in later steps. Create `.github/workflows/action-outputs.yml`:

```yaml
name: Action Outputs Demo

on: workflow_dispatch

jobs:
  demo-outputs:
    name: Demonstrate Action Outputs
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # This action generates a unique run ID
      - name: Generate ID
        id: generate-id
        run: |
          UNIQUE_ID="build-$(date +%s)"
          echo "unique_id=$UNIQUE_ID" >> $GITHUB_OUTPUT
          echo "Generated ID: $UNIQUE_ID"

      # Use the output from previous step
      - name: Use generated ID
        run: |
          echo "Using ID from previous step: ${{ steps.generate-id.outputs.unique_id }}"

      # Example with a real action that has outputs
      - name: Setup Node.js
        id: node-setup
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # Reference node-setup outputs
      - name: Display Node version
        run: |
          echo "Node version installed: ${{ steps.node-setup.outputs.node-version }}"
```

**Key points**:
- Give steps an `id:` to reference them later
- Access outputs with `steps.<id>.outputs.<output-name>`
- Check the action's documentation to see what outputs are available

### Step 5: Conditional Action Execution

You can control when actions run with conditions. Create `.github/workflows/conditional-actions.yml`:

```yaml
name: Conditional Actions

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  conditional-demo:
    name: Run Actions Conditionally
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      # Only run tests on pull requests
      - name: Run tests
        if: github.event_name == 'pull_request'
        run: npm test

      # Only deploy on pushes to main
      - name: Deploy to production
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          echo "Deploying to production..."
          echo "This only runs on pushes to main branch"

      # Always upload logs, even if previous steps failed
      - name: Upload logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: logs
          path: |
            *.log
            logs/
```

**Common conditions**:
- `if: success()` - Only if previous steps succeeded (default)
- `if: failure()` - Only if a previous step failed
- `if: always()` - Run regardless of previous step results
- `if: cancelled()` - Only if workflow was cancelled
- Custom expressions: `if: github.ref == 'refs/heads/main'`

### Step 6: Commit and Test

```bash
git add .github/workflows/node-ci.yml
git commit -m "Add Node.js CI with Marketplace actions"
git push origin main
```

Watch the workflow run in the Actions tab. Notice how fast it is thanks to caching!

### Step 7: Download Artifacts

After the workflow completes:
1. Go to the Actions tab
2. Click on the workflow run
3. Scroll down to "Artifacts"
4. Click "build-output" to download the built files

Artifacts are useful for:
- Downloading build results for manual testing
- Sharing files between jobs
- Debugging by downloading logs

## Common Pitfalls and Troubleshooting

### Action Version Conflicts

If you see errors like "Action version not found":
- Check that the version exists (visit the action's releases page)
- Try using a major version tag like `@v4` instead of `@v4.1.2`

### Missing Inputs

If an action fails with "required input not provided":
- Check the action's README for required inputs
- Add the missing input in the `with:` section

### Cache Not Working

If caching doesn't speed up your builds:
- Ensure you're using the same `node-version` across runs
- Check that the `cache:` input matches your package manager (`npm`, `yarn`, or `pnpm`)
- Cache takes effect on the second run, not the first

### Referencing Outputs

If `steps.<id>.outputs.<name>` returns empty:
- Verify the step has an `id:`
- Check the action's documentation for correct output name
- Ensure the step actually ran (not skipped due to condition)

### Security: Pinning Versions

For production workflows, consider pinning to commit SHAs for security:

```yaml
# Instead of:
uses: actions/checkout@v4

# Use:
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

This prevents malicious code from being injected if the `v4` tag is moved.

## Exercise

Create a workflow that:

1. Triggers on push to main
2. Uses `actions/checkout` to clone the repo
3. Uses `actions/setup-node` to install Node.js 20
4. Runs `npm ci` and `npm test`
5. Uses `actions/upload-artifact` to save test results
6. Only uploads artifacts if tests pass

**Bonus**: Add another job that downloads the artifacts from the first job and does something with them (Hint: look up `actions/download-artifact`).

<details>
<summary>Click to see solution</summary>

```yaml
name: Test and Upload Results

on:
  push:
    branches: [ main ]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Upload test results
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: coverage/

  # Bonus: Job that uses the artifact
  report:
    name: Process Test Report
    runs-on: ubuntu-latest
    needs: test  # This job runs after 'test' completes

    steps:
      - name: Download test results
        uses: actions/download-artifact@v4
        with:
          name: test-results
          path: ./results

      - name: Process results
        run: |
          echo "Test results downloaded to ./results"
          ls -la ./results
```
</details>

## Key Takeaways

- The GitHub Actions Marketplace offers thousands of pre-built actions for common tasks
- Actions are referenced with `uses: owner/repo@version` syntax
- Use major version tags (like `@v4`) for stability while still getting bug fixes
- Actions accept inputs via `with:` and produce outputs accessible via `steps.<id>.outputs`
- Evaluate actions before using them: check stars, recent updates, and code quality
- Official GitHub actions (`actions/*`) are generally safe and well-maintained

---

**Previous Lesson**: [Events and Triggers](003-events-and-triggers.md)

**Next Lesson**: [Secrets and Environment Variables](005-secrets-and-environment.md) - Learn to handle sensitive data securely.

**Additional Resources**:
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Finding and Customizing Actions](https://docs.github.com/en/actions/learn-github-actions/finding-and-customizing-actions)
- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-node](https://github.com/actions/setup-node)
- [actions/upload-artifact](https://github.com/actions/upload-artifact)
- [Awesome Actions](https://github.com/sdras/awesome-actions) - Curated list
