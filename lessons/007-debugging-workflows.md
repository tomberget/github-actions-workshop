# Lesson 6: Debugging Workflows

**Estimated Time**: 60 minutes
**Difficulty**: Intermediate

## Problem Statement

It's 3 PM on a Friday. You push code to trigger your deployment workflow, but it fails with a cryptic error message. You try again—same result. Your team is waiting for this deployment, and you have no idea what's wrong. The workflow logs show hundreds of lines of output, and you're not sure where to start looking.

Debugging workflows is fundamentally different from debugging application code. You can't attach a debugger or add breakpoints. The code runs on remote servers you don't control. Logs can be overwhelming. But with the right techniques and tools, you can systematically identify and fix issues.

In this lesson, you'll learn debugging strategies, common failure patterns, and how to use GitHub Actions' debugging features. And yes—you'll intentionally break a workflow and fix it.

## Concepts Introduction

### Types of Workflow Failures

**Syntax Errors**: Invalid YAML or workflow syntax
- Easy to fix but can be hard to spot
- GitHub won't even start the workflow

**Runtime Errors**: Code executes but fails
- Commands return non-zero exit codes
- Missing dependencies or environment issues
- Permission problems

**Logic Errors**: Workflow runs but produces wrong results
- Hardest to debug
- Requires careful log analysis and testing

### GitHub Actions Logging

Every workflow step produces logs showing:
- Commands executed
- Standard output (stdout)
- Standard error (stderr)
- Exit codes
- Timestamps

Logs are hierarchical:
- Workflow run → Jobs → Steps → Command output

### Debug Mode

GitHub Actions has a built-in debug mode that provides additional logging:
- **Step debug logging**: More verbose output from actions
- **Runner diagnostic logging**: Information about the runner itself

Enable by setting repository secrets:
- `ACTIONS_STEP_DEBUG` = `true`
- `ACTIONS_RUNNER_DEBUG` = `true`

### Common Debugging Techniques

1. **Add echo statements**: Print variables and checkpoint messages
2. **Use continue-on-error**: Let workflow complete despite failures
3. **Fail fast vs complete**: Choose when to stop on errors
4. **Upload artifacts**: Save logs and files for offline analysis
5. **Re-run with debug**: Enable debug logging for failing runs
6. **Use annotations**: Actions can create error/warning messages that appear in GitHub UI

### Exit Codes

Commands return exit codes to indicate success or failure:
- `0` = Success
- Non-zero = Failure (e.g., `1`, `127`, `255`)

GitHub Actions stops a job if any step returns non-zero, unless you configure it otherwise.

## Step-by-Step Instructions

### Step 1: Create a Workflow with Intentional Bugs

This workflow has THREE bugs. Your job is to find and fix them!

Create `.github/workflows/buggy-workflow.yml`:

```yaml
name: Buggy Workflow (Find the Bugs!)

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  APP_NAME: TaskManager
  VERSION: 1.0.0

jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      # BUG #1: This command has an intentional typo
      - name: Build application
        run: npm run biuld

      # BUG #2: This file doesn't exist
      - name: Check build output
        run: cat dist/non-existent-file.txt

      # BUG #3: Environment variable is misspelled
      - name: Display version
        run: |
          echo "Building $APP_NOME version $VERSION"

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```

### Step 2: Commit and Watch It Fail

```bash
git add .github/workflows/buggy-workflow.yml
git commit -m "Add buggy workflow for debugging practice"
git push origin main
```

Go to the Actions tab and watch it fail. **Don't fix it yet!** First, let's learn debugging techniques.

### Step 3: Analyze the Failure

1. Click on the failed workflow run
2. Click on the "Build Application" job
3. Expand each step and read the error messages

**Questions to ask**:
- Which step failed first?
- What was the error message?
- What was the exit code?
- Was there any helpful output before the error?

### Step 4: Enable Debug Logging

Let's get more information:

1. Go to Settings → Secrets and variables → Actions
2. Add a new secret:
   - Name: `ACTIONS_STEP_DEBUG`
   - Value: `true`

3. Re-run the failed workflow:
   - Go to the workflow run
   - Click "Re-run jobs" → "Re-run failed jobs"

Now expand the steps again—you'll see much more detailed output prefixed with `##[debug]`.

### Step 5: Create a Debugging Workflow

While that runs, create a workflow that demonstrates debugging techniques. Create `.github/workflows/debugging-techniques.yml`:

```yaml
name: Debugging Techniques

on: workflow_dispatch

jobs:
  debug-demo:
    name: Debugging Demonstration
    runs-on: ubuntu-latest

    steps:
      - name: Checkpoint 1 - Start
        run: echo "::notice::Workflow started successfully"

      - name: Print all environment variables
        run: |
          echo "=== Environment Variables ==="
          env | sort

      - name: Print GitHub context
        run: |
          echo "=== GitHub Context ==="
          echo "Repository: ${{ github.repository }}"
          echo "Ref: ${{ github.ref }}"
          echo "SHA: ${{ github.sha }}"
          echo "Actor: ${{ github.actor }}"
          echo "Event: ${{ github.event_name }}"

      # Demonstrate continue-on-error
      - name: Intentional failure (will continue)
        id: fail-but-continue
        continue-on-error: true
        run: |
          echo "This step will fail but workflow continues"
          exit 1

      - name: Check previous step result
        run: |
          echo "Previous step outcome: ${{ steps.fail-but-continue.outcome }}"
          echo "Previous step conclusion: ${{ steps.fail-but-continue.conclusion }}"
          # outcome can be: success, failure, cancelled, skipped
          # conclusion can be: success, failure, cancelled, skipped, or neutral

      # Demonstrate conditional execution based on failure
      - name: This runs only if previous steps succeeded
        if: success()
        run: echo "All previous steps succeeded"

      - name: This runs only if any previous step failed
        if: failure()
        run: echo "At least one previous step failed"

      - name: This always runs
        if: always()
        run: echo "This step always runs, regardless of previous failures"

      # Demonstrate debug output
      - name: Debug variable values
        run: |
          MY_VAR="test value"
          echo "::debug::MY_VAR = $MY_VAR"
          echo "Variable: $MY_VAR"

      # Demonstrate annotations
      - name: Create annotations
        run: |
          echo "::notice::This is an informational notice"
          echo "::warning::This is a warning message"
          echo "::error::This is an error message (but doesn't fail the step)"

      # Upload debugging artifacts
      - name: Save debug logs
        if: always()
        run: |
          mkdir -p debug-logs
          env > debug-logs/environment.txt
          echo "${{ toJSON(github) }}" > debug-logs/github-context.json

      - name: Upload debug artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: debug-logs
          path: debug-logs/
```

**Key debugging features demonstrated**:

- **`::notice::`**, **`::warning::`**, **`::error::`**: Create annotations in GitHub UI
- **`::debug::`**: Output only shown when debug mode is enabled
- **`continue-on-error: true`**: Step can fail without stopping the workflow
- **`if: always()`**: Runs even if previous steps failed (useful for cleanup/logging)
- **Outcome vs conclusion**: Check how previous steps completed

### Step 6: Fix the Buggy Workflow

Now that you understand debugging techniques, fix the three bugs:

**Bug #1**: Line 33 - `npm run biuld` should be `npm run build`

**Bug #2**: Line 37 - Remove or comment out the step that tries to read a non-existent file

**Bug #3**: Line 42 - `$APP_NOME` should be `$APP_NAME`

Create `.github/workflows/fixed-workflow.yml` (or edit the buggy one):

```yaml
name: Fixed Workflow

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  APP_NAME: TaskManager
  VERSION: 1.0.0

jobs:
  build:
    name: Build Application
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

      - name: Run tests
        run: npm test

      # FIXED: Correct command
      - name: Build application
        run: npm run build

      # FIXED: Check for files that actually exist
      - name: Check build output
        run: |
          echo "Build directory contents:"
          ls -la dist/

      # FIXED: Correct variable name
      - name: Display version
        run: |
          echo "Building $APP_NAME version $VERSION"

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```

### Step 7: Advanced Debugging with Workflow Commands

Create `.github/workflows/workflow-commands.yml`:

```yaml
name: Workflow Commands

on: workflow_dispatch

jobs:
  commands-demo:
    name: Workflow Command Demonstration
    runs-on: ubuntu-latest

    steps:
      - name: Group logs
        run: |
          echo "::group::Installing dependencies"
          echo "Step 1: Update package lists"
          echo "Step 2: Install packages"
          echo "Step 3: Verify installation"
          echo "::endgroup::"

          echo "::group::Running tests"
          echo "Test 1: Unit tests"
          echo "Test 2: Integration tests"
          echo "::endgroup::"

      - name: Set outputs dynamically
        id: dynamic-output
        run: |
          RANDOM_NUM=$((RANDOM % 100))
          echo "Generated number: $RANDOM_NUM"
          echo "random_number=$RANDOM_NUM" >> $GITHUB_OUTPUT

      - name: Use dynamic output
        run: |
          echo "The random number was: ${{ steps.dynamic-output.outputs.random_number }}"

      - name: Masking sensitive data
        run: |
          FAKE_TOKEN="abc123secret456"
          echo "::add-mask::$FAKE_TOKEN"
          echo "Token value: $FAKE_TOKEN"
          # In logs, this will appear as: Token value: ***

      - name: Stop commands (escape hatch)
        run: |
          STOP_TOKEN=$(uuidgen)
          echo "::stop-commands::$STOP_TOKEN"
          echo "::warning::This won't create a warning"
          echo "Regular output still works"
          echo "::$STOP_TOKEN::"
          echo "::warning::This WILL create a warning"
```

## Common Pitfalls and Troubleshooting

### Path Issues

Workflows start in the repository root. Be careful with relative paths:

```yaml
# Wrong - might not be where you think
run: cd src && npm test

# Better - use absolute path or stay in root
run: npm test --prefix src
```

### Environment Variable Scope

Variables defined in one step aren't automatically available in the next:

```yaml
# Wrong - MY_VAR won't persist
- run: export MY_VAR="value"
- run: echo $MY_VAR  # Empty!

# Correct - use GITHUB_ENV
- run: echo "MY_VAR=value" >> $GITHUB_ENV
- run: echo $MY_VAR  # Works!
```

### Secrets Not Available in Logs

You can't debug secrets by echoing them—they're automatically masked:

```yaml
run: echo "${{ secrets.API_KEY }}"  # Shows: ***
```

To debug, check the length or a substring:

```yaml
run: |
  KEY="${{ secrets.API_KEY }}"
  echo "Key length: ${#KEY}"
  echo "First 3 chars: ${KEY:0:3}"
```

### Workflow Not Triggering

If workflow doesn't run:
- Check YAML syntax (use yamllint.com)
- Verify file is in `.github/workflows/`
- Ensure trigger conditions are met (right branch, event, etc.)
- Check if Actions are enabled in repository settings

### Step Skipped Unexpectedly

Check the `if:` condition on the step. Default is `if: success()`.

## Exercise

Create a workflow that:

1. Has multiple steps, where one intentionally fails
2. Uses `continue-on-error` so the workflow completes
3. Checks the failed step's outcome
4. Uploads debug logs regardless of success/failure
5. Creates annotations (notice, warning, error) in appropriate places

**Bonus**: Add a step that only runs when the workflow is triggered manually (`if: github.event_name == 'workflow_dispatch'`).

<details>
<summary>Click to see solution</summary>

```yaml
name: Debugging Exercise Solution

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  debug-exercise:
    name: Debugging Exercise
    runs-on: ubuntu-latest

    steps:
      - name: Start
        run: echo "::notice::Workflow started"

      - name: Step that succeeds
        run: echo "This step succeeds"

      - name: Step that fails but continues
        id: failing-step
        continue-on-error: true
        run: |
          echo "::warning::This step will fail but workflow continues"
          exit 1

      - name: Check failure outcome
        run: |
          echo "::notice::Previous step outcome was: ${{ steps.failing-step.outcome }}"
          if [ "${{ steps.failing-step.outcome }}" == "failure" ]; then
            echo "::warning::Detected failure in previous step"
          fi

      - name: Manual trigger message
        if: github.event_name == 'workflow_dispatch'
        run: echo "::notice::This workflow was triggered manually!"

      - name: Collect debug info
        if: always()
        run: |
          mkdir -p debug-output
          echo "Workflow: ${{ github.workflow }}" > debug-output/info.txt
          echo "Run ID: ${{ github.run_id }}" >> debug-output/info.txt
          echo "Failed step outcome: ${{ steps.failing-step.outcome }}" >> debug-output/info.txt

      - name: Upload debug logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: debug-logs
          path: debug-output/

      - name: Final status
        run: echo "::error::Workflow completed with known failure"
```
</details>

## Key Takeaways

- Enable debug mode with `ACTIONS_STEP_DEBUG` and `ACTIONS_RUNNER_DEBUG` secrets
- Use `continue-on-error: true` to let workflows complete despite failures
- Workflow commands like `::notice::`, `::warning::`, and `::error::` create annotations
- Use `if: always()` for cleanup and logging steps that should always run
- Check step outcomes with `steps.<id>.outcome` to make decisions based on failures
- Upload artifacts with debug information for offline analysis
- Group related log output with `::group::` and `::endgroup::`

---

**Previous Lesson**: [Speeding Up Workflows](006-speeding-up-workflows.md)

**Next Lesson**: [Running Tests Automatically](008-automated-testing.md) - Build a complete testing pipeline.

**Additional Resources**:
- [Debugging Workflows](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging)
- [Workflow Commands](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions)
- [Workflow Syntax: continue-on-error](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepscontinue-on-error)
