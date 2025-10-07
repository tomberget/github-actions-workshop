# Lesson 5: Secrets and Environment Variables

**Estimated Time**: 45 minutes
**Difficulty**: Intermediate

## Problem Statement

Your workflow needs to deploy code to AWS, but that requires authentication credentials. You could hardcode the access key directly in your workflow file... but then anyone with access to your repository (including every contributor in a public repo) would see your credentials. Within minutes, bad actors could use them to rack up thousands of dollars in cloud bills or steal sensitive data.

The same problem applies to API keys, database passwords, and any other sensitive information your workflows need. You need a way to use these secrets without exposing them. Additionally, you need to configure environment-specific settings (like different URLs for staging vs production) without duplicating workflows.

In this lesson, you'll learn to securely manage secrets and use environment variables to make your workflows flexible and secure.

## Concepts Introduction

### What Are Secrets?

Secrets are encrypted environment variables that store sensitive information like:
- API keys and tokens
- Cloud provider credentials
- Database passwords
- SSH keys
- Webhook URLs with authentication

GitHub encrypts secrets using [libsodium sealed boxes](https://libsodium.gitbook.io/doc/public-key_cryptography/sealed_boxes). Once stored, secrets cannot be viewed again—only used in workflows.

### Secret Scopes

Secrets can be defined at three levels:

**1. Repository Secrets**: Available only to workflows in a specific repository

**2. Organization Secrets**: Shared across multiple repositories in an organization

**3. Environment Secrets**: Specific to deployment environments (production, staging, etc.)

### Environment Variables

Environment variables are non-sensitive configuration values accessible in your workflow. They can be defined:
- At the workflow level (available to all jobs)
- At the job level (available to all steps in that job)
- At the step level (available only to that step)
- From the system (GitHub provides many built-in variables)

Unlike secrets, environment variables are visible in workflow files and logs.

### When to Use Secrets vs Environment Variables

**Use Secrets for:**
- Passwords and API keys
- Authentication tokens
- Private keys
- Anything that would compromise security if exposed

**Use Environment Variables for:**
- Configuration settings (URLs, file paths)
- Feature flags
- Non-sensitive identifiers
- Build configuration

### Default Environment Variables

GitHub provides many built-in environment variables:
- `GITHUB_TOKEN` - Authentication token (automatically available)
- `GITHUB_REPOSITORY` - Repository name (owner/repo)
- `GITHUB_SHA` - Commit SHA that triggered the workflow
- `GITHUB_REF` - Git ref (branch or tag)
- `RUNNER_OS` - Operating system (Linux, Windows, macOS)

[Full list in documentation](https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables)

## Step-by-Step Instructions

### Step 1: Create Repository Secrets

Let's add some secrets to your repository:

1. Go to your GitHub repository
2. Click "Settings" (top navigation)
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Create these secrets:

   **Secret 1:**
   - Name: `API_KEY`
   - Value: `test-api-key-12345`

   **Secret 2:**
   - Name: `DATABASE_PASSWORD`
   - Value: `super-secret-password`

   **Secret 3:**
   - Name: `SLACK_WEBHOOK_URL`
   - Value: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`
   (Use a fake URL for this workshop)

### Step 2: Create a Workflow Using Secrets

Create `.github/workflows/secrets-demo.yml`:

```yaml
name: Secrets Demo

on: workflow_dispatch

jobs:
  use-secrets:
    name: Demonstrate Secret Usage
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Secrets are accessed via ${{ secrets.SECRET_NAME }}
      - name: Use API key
        run: |
          echo "Calling API with key..."
          # In real scenario, you'd call an actual API
          # The secret value is masked in logs
          API_KEY="${{ secrets.API_KEY }}"
          echo "API Key length: ${#API_KEY}"
          echo "First 3 characters: ${API_KEY:0:3}"

      # GitHub automatically masks secret values in logs
      - name: Attempt to print secret
        run: |
          echo "Trying to print secret: ${{ secrets.API_KEY }}"
          # In logs, you'll see: Trying to print secret: ***

      # Using secrets in environment variables
      - name: Configure database
        env:
          DB_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
          DB_HOST: localhost
          DB_PORT: 5432
        run: |
          echo "Connecting to database at $DB_HOST:$DB_PORT"
          echo "Password is hidden: $DB_PASSWORD"
          # In real workflow, you'd use these to connect to a database

      # Secrets can be passed to actions
      - name: Send notification
        env:
          WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          echo "Sending notification to Slack..."
          # curl -X POST "$WEBHOOK_URL" -d '{"text":"Deployment complete!"}'
          echo "Notification sent!"
```

**Important**: Notice how secrets are accessed with `${{ secrets.SECRET_NAME }}`. GitHub automatically masks these values in logs—they'll appear as `***`.

### Step 3: Define Environment Variables

Create `.github/workflows/environment-vars.yml`:

```yaml
name: Environment Variables Demo

# Workflow-level environment variables (available to all jobs)
env:
  APP_NAME: TaskManager
  BUILD_NUMBER: ${{ github.run_number }}
  IS_PRODUCTION: false

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest

    # Job-level environment variables (available to all steps in this job)
    env:
      NODE_ENV: production
      BUILD_DIR: dist

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Step-level environment variable (only for this step)
      - name: Print configuration
        env:
          STEP_MESSAGE: "Building the app!"
        run: |
          echo "=== Configuration ==="
          echo "App Name: $APP_NAME"
          echo "Build Number: $BUILD_NUMBER"
          echo "Node Environment: $NODE_ENV"
          echo "Build Directory: $BUILD_DIR"
          echo "Step Message: $STEP_MESSAGE"
          echo "Is Production: $IS_PRODUCTION"

      # Using default GitHub environment variables
      - name: Print GitHub variables
        run: |
          echo "=== GitHub Variables ==="
          echo "Repository: $GITHUB_REPOSITORY"
          echo "Commit SHA: $GITHUB_SHA"
          echo "Ref: $GITHUB_REF"
          echo "Actor: $GITHUB_ACTOR"
          echo "Workflow: $GITHUB_WORKFLOW"
          echo "Run ID: $GITHUB_RUN_ID"
          echo "Run Number: $GITHUB_RUN_NUMBER"

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # Environment variables in actual commands
      - name: Install dependencies
        run: npm ci

      - name: Build with environment
        env:
          VITE_APP_NAME: ${{ env.APP_NAME }}
          VITE_BUILD_NUMBER: ${{ env.BUILD_NUMBER }}
        run: |
          echo "Building with environment variables..."
          npm run build --if-present
          echo "Build complete in $BUILD_DIR directory"
```

### Step 4: Use Environments for Different Deployment Targets

Environments allow you to have different secrets and variables for staging vs production.

First, create environments in GitHub:
1. Go to repository Settings → Environments
2. Click "New environment"
3. Create two environments: `staging` and `production`

For the `production` environment:
- Add required reviewers (optional but recommended)
- Add secret: `DEPLOY_URL` = `https://prod.example.com`

For the `staging` environment:
- Add secret: `DEPLOY_URL` = `https://staging.example.com`

Now create `.github/workflows/deploy-environments.yml`:

```yaml
name: Deploy to Environments

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

jobs:
  deploy:
    name: Deploy to ${{ inputs.environment }}
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}  # Use the environment

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Environment-specific secrets are automatically available
      - name: Deploy application
        env:
          DEPLOY_URL: ${{ secrets.DEPLOY_URL }}
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          echo "Deploying to: ${{ inputs.environment }}"
          echo "Deploy URL: $DEPLOY_URL"
          echo "Simulating deployment..."
          sleep 2
          echo "✅ Deployed successfully to ${{ inputs.environment }}!"
```

### Step 5: The GITHUB_TOKEN Secret

GitHub automatically provides a `GITHUB_TOKEN` secret for authenticating with the GitHub API. Create `.github/workflows/github-token-demo.yml`:

```yaml
name: GitHub Token Demo

on: workflow_dispatch

jobs:
  use-github-token:
    name: Use GITHUB_TOKEN
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Use GITHUB_TOKEN to interact with GitHub API
      - name: Create issue comment
        env:
          GH_TOKEN: ${{ github.token }}  # or ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "GITHUB_TOKEN is automatically available"
          echo "Can be used to interact with GitHub API"
          # Example: List repository issues
          # gh issue list --repo ${{ github.repository }}

      # Token permissions are automatically scoped to this repository
      - name: List workflow runs
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          gh run list --limit 5 --repo ${{ github.repository }}
```

**Note**: `github.token` and `secrets.GITHUB_TOKEN` are equivalent. The token is automatically scoped to your repository and expires after the workflow completes.

### Step 6: Test Your Workflows

Commit and push all the workflows:

```bash
git add .github/workflows/secrets-demo.yml
git add .github/workflows/environment-vars.yml
git add .github/workflows/deploy-environments.yml
git add .github/workflows/github-token-demo.yml
git commit -m "Add workflows for secrets and environment variables"
git push origin main
```

Manually trigger each workflow from the Actions tab and observe:
- Secrets are masked as `***` in logs
- Environment variables are visible
- Different environments use different secret values

## Common Pitfalls and Troubleshooting

### Secret Not Found

If you see "secret not found" errors:
- Check the secret name spelling (case-sensitive)
- Verify you created the secret in the correct location (repository vs environment)
- For environment secrets, ensure the job specifies `environment:`

### Secrets in Logs

Even though GitHub masks secrets, avoid constructing strings that might reveal parts:

```yaml
# Bad - might partially reveal secret
run: echo "API key starts with ${{ secrets.API_KEY }}"

# Good - completely hidden
run: |
  API_KEY="${{ secrets.API_KEY }}"
  # Use it without echoing
```

### Secrets in Pull Requests from Forks

**Security Warning**: Secrets are NOT available to workflows triggered by pull requests from forked repositories. This prevents malicious PRs from stealing your secrets.

If you need secrets in PR workflows, only use them on PRs from branches in your own repository, not forks.

### Environment Variable Precedence

When the same variable is defined at multiple levels, the most specific wins:
1. Step-level (highest precedence)
2. Job-level
3. Workflow-level
4. System default (lowest precedence)

### Secret Size Limits

- Maximum size per secret: 64 KB
- Maximum number of secrets: 100 per repository, 100 per organization, 100 per environment

### Updating Secrets

To update a secret:
1. Go to Settings → Secrets and variables → Actions
2. Click on the secret name
3. Click "Update secret"
4. Enter new value and save

You cannot view the old value—secrets are write-only after creation.

## Exercise

Create a workflow that:

1. Triggers on push to main
2. Has workflow-level environment variables for `APP_VERSION` and `BUILD_TYPE`
3. Has a job that uses a secret called `DEPLOY_TOKEN` (you'll need to create this secret)
4. Prints the GitHub-provided `GITHUB_REPOSITORY` and `GITHUB_SHA` variables
5. Uses different secrets for `staging` and `production` environments

**Success criteria**: The workflow runs successfully, secrets are masked, and environment variables are visible in logs.

<details>
<summary>Click to see solution</summary>

First, create the secret `DEPLOY_TOKEN` in Settings → Secrets with value `token-12345`.

Then create `.github/workflows/exercise-solution.yml`:

```yaml
name: Exercise Solution

env:
  APP_VERSION: 1.0.0
  BUILD_TYPE: release

on:
  push:
    branches: [ main ]

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Print configuration
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: |
          echo "App Version: $APP_VERSION"
          echo "Build Type: $BUILD_TYPE"
          echo "Repository: $GITHUB_REPOSITORY"
          echo "Commit SHA: $GITHUB_SHA"
          echo "Deploy token length: ${#DEPLOY_TOKEN}"

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    environment: staging

    steps:
      - name: Deploy
        run: echo "Deploying to staging..."

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    environment: production

    steps:
      - name: Deploy
        run: echo "Deploying to production..."
```
</details>

## Key Takeaways

- Secrets store sensitive data encrypted and are never exposed in logs or to fork PRs
- Access secrets with `${{ secrets.SECRET_NAME }}`
- Environment variables configure non-sensitive settings at workflow, job, or step level
- GitHub provides many default variables like `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, and `GITHUB_SHA`
- Environments (staging, production) allow different secrets for different deployment targets
- `GITHUB_TOKEN` is automatically available for GitHub API authentication

---

**Previous Lesson**: [Working with Actions from Marketplace](004-marketplace-actions.md)

**Next Lesson**: [Debugging Workflows](006-debugging-workflows.md) - Learn to troubleshoot failing workflows effectively.

**Additional Resources**:
- [Encrypted Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Environment Variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables)
- [Using Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GITHUB_TOKEN Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
