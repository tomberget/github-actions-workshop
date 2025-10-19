# Lesson 11: Creating Custom Actions

**Estimated Time**: 90 minutes **Difficulty**: Advanced

## Problem Statement

You've copy-pasted the same 20 lines of workflow code across multiple workflows. You need to set up a specific
environment, run custom deployment logic, or integrate with a proprietary tool. Existing marketplace actions don't meet
your needs, and duplicating code makes maintenance a nightmare.

Custom actions let you encapsulate reusable logic, share it across workflows and repositories, and even publish it for
others to use. This lesson teaches you to create, test, and use custom actions.

## Concepts Introduction

### Types of Actions

1. **JavaScript Actions**: Run directly on the runner (fast, cross-platform)
2. **Docker Actions**: Run in a container (any language, reproducible)
3. **Composite Actions**: Combine multiple steps into one action (YAML-based)

For this lesson, we'll focus on **composite actions** (easiest to create) and touch on JavaScript actions.

### Action Metadata

Every action needs an `action.yml` file defining:

- Name and description
- Inputs (parameters)
- Outputs (return values)
- What the action does (runs or steps)

## Step-by-Step Instructions

### Step 1: Create a Simple Composite Action

Create `.github/actions/hello-action/action.yml`:

```yaml
name: "Hello Action"
description: "A simple custom action that greets someone"

inputs:
  who:
    description: "Who to greet"
    required: true
    default: "World"

outputs:
  greeting:
    description: "The greeting message"
    value: ${{ steps.greet.outputs.greeting }}

runs:
  using: "composite"
  steps:
    - name: Greet
      id: greet
      shell: bash
      run: |
        GREETING="Hello, ${{ inputs.who }}!"
        echo "$GREETING"
        echo "greeting=$GREETING" >> $GITHUB_OUTPUT
```

Use it in a workflow `.github/workflows/use-custom-action.yml`:

```yaml
name: Use Custom Action

on: workflow_dispatch

jobs:
  test-action:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Use hello action
        id: hello
        uses: ./.github/actions/hello-action
        with:
          who: "GitHub Actions Workshop"

      - name: Show output
        run: echo "${{ steps.hello.outputs.greeting }}"
```

### Step 2: Create a Setup Action

`.github/actions/setup-app/action.yml`:

```yaml
name: "Setup Application"
description: "Sets up Node.js and installs dependencies"

inputs:
  node-version:
    description: "Node.js version to use"
    required: false
    default: "20"
  install-command:
    description: "Command to install dependencies"
    required: false
    default: "npm ci"

runs:
  using: "composite"
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: "npm"

    - name: Install dependencies
      shell: bash
      run: ${{ inputs.install-command }}

    - name: Display info
      shell: bash
      run: |
        echo "✅ Application setup complete"
        echo "Node version: $(node --version)"
        echo "npm version: $(npm --version)"
```

Use it:

```yaml
name: Use Setup Action

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup application
        uses: ./.github/actions/setup-app
        with:
          node-version: "20"

      - name: Build
        run: npm run build
```

### Step 3: Create a Deployment Action

`.github/actions/deploy/action.yml`:

```yaml
name: "Deploy Application"
description: "Deploys the application to specified environment"

inputs:
  environment:
    description: "Target environment"
    required: true
  api-url:
    description: "API URL for the environment"
    required: true
  deploy-token:
    description: "Deployment token"
    required: true

outputs:
  deployment-url:
    description: "URL of the deployed application"
    value: ${{ steps.deploy.outputs.url }}

runs:
  using: "composite"
  steps:
    - name: Validate inputs
      shell: bash
      run: |
        if [ -z "${{ inputs.environment }}" ]; then
          echo "Error: environment is required"
          exit 1
        fi

    - name: Deploy
      id: deploy
      shell: bash
      env:
        ENVIRONMENT: ${{ inputs.environment }}
        API_URL: ${{ inputs.api-url }}
        DEPLOY_TOKEN: ${{ inputs.deploy-token }}
      run: |
        echo "Deploying to $ENVIRONMENT..."
        echo "API URL: $API_URL"
        # Actual deployment logic here
        DEPLOY_URL="https://$ENVIRONMENT.example.com"
        echo "url=$DEPLOY_URL" >> $GITHUB_OUTPUT
        echo "✅ Deployed to $DEPLOY_URL"
```

### Step 4: Create a JavaScript Action (Optional Advanced)

Create `.github/actions/js-action/package.json`:

```json
{
  "name": "js-action",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@actions/core": "^1.10.0",
    "@actions/github": "^5.1.1"
  }
}
```

Create `.github/actions/js-action/index.js`:

```javascript
const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const nameInput = core.getInput("name", { required: true });
    const time = new Date().toTimeString();

    core.info(`Hello ${nameInput}! Current time: ${time}`);
    core.setOutput("time", time);

    const context = github.context;
    core.info(`Repository: ${context.repo.owner}/${context.repo.repo}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
```

Create `.github/actions/js-action/action.yml`:

```yaml
name: "JavaScript Action"
description: "A JavaScript-based custom action"

inputs:
  name:
    description: "Name to greet"
    required: true

outputs:
  time:
    description: "The current time"

runs:
  using: "node20"
  main: "index.js"
```

To use:

```yaml
- uses: ./.github/actions/js-action
  with:
    name: "Workshop Participant"
```

### Step 5: Test Your Custom Actions

Create `.github/workflows/test-actions.yml`:

```yaml
name: Test Custom Actions

on: workflow_dispatch

jobs:
  test-all-actions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Test hello action
        uses: ./.github/actions/hello-action
        with:
          who: "Tester"

      - name: Test setup action
        uses: ./.github/actions/setup-app

      - name: Test deploy action
        uses: ./.github/actions/deploy
        with:
          environment: "staging"
          api-url: "https://api.staging.example.com"
          deploy-token: "fake-token"
```

## Exercise

Create a custom composite action that:

1. Accepts inputs for app name and version
2. Creates a build info file with timestamp, app name, version, and commit SHA
3. Outputs the path to the build info file
4. Use this action in a workflow

## Key Takeaways

- Composite actions are the easiest to create (pure YAML)
- Actions must have an `action.yml` metadata file
- Store local actions in `.github/actions/` directory
- Reference local actions with `uses: ./path/to/action`
- Actions can accept inputs and produce outputs
- Composite actions must specify `shell:` for run steps
- JavaScript actions are more powerful but require Node.js coding

---

**Previous**: [Multi-Job Workflows](011-multi-job-workflows.md) | **Next**:
[Reusability and Best Practices](013-reusability-and-best-practices.md)
