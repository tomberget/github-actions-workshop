# Lesson 8: Building and Deploying Applications

**Estimated Time**: 75 minutes
**Difficulty**: Intermediate

## Problem Statement

Your tests pass. Your code is reviewed and merged. But it's still not in production. Someone needs to manually build the application, upload it to servers, and restart services. This process is error-prone, time-consuming, and blocks deployments until someone with the right permissions is available.

Modern software teams deploy multiple times per day. Manual deployment doesn't scale. You need Continuous Deployment: automatically building and deploying code that passes all checks. This reduces time to market, eliminates human error, and frees developers to focus on writing code instead of managing deployments.

In this lesson, you'll create workflows that automatically build your application and deploy it to different environments (staging and production) with appropriate safeguards.

## Concepts Introduction

### Continuous Delivery vs Continuous Deployment

**Continuous Delivery (CD)**: Code is automatically built and ready to deploy, but deployment requires manual approval.

**Continuous Deployment**: Code automatically deploys to production after passing all automated checks (no manual gate).

Most teams start with Continuous Delivery for production while using Continuous Deployment for staging/development environments.

### Deployment Environments

Typical progression:
1. **Development**: Deploys on every commit, no manual approval
2. **Staging**: Deploys automatically or on demand, mirrors production
3. **Production**: Requires approval, deployed from stable branches

### Build Artifacts

The build process produces artifacts—compiled code, bundled assets, container images—that get deployed. Key principles:
- Build once, deploy many times
- Store artifacts in a registry (npm, Docker Hub, GitHub Packages, etc.)
- Version artifacts with semantic versioning or commit SHAs

### Deployment Strategies

**Blue-Green Deployment**: Run two identical environments, switch traffic instantly

**Rolling Deployment**: Gradually replace old versions with new ones

**Canary Deployment**: Deploy to small subset of users first, then gradually increase

For this lesson, we'll simulate deployments. Real deployments would use platform-specific tools (AWS, Azure, Vercel, etc.).

## Step-by-Step Instructions

### Step 1: Create a Build Workflow

Create `.github/workflows/build.yml`:

```yaml
name: Build Application

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20'

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

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

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Create build info
        run: |
          echo "Build Time: $(date)" > dist/build-info.txt
          echo "Commit SHA: ${{ github.sha }}" >> dist/build-info.txt
          echo "Branch: ${{ github.ref_name }}" >> dist/build-info.txt

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/
          retention-days: 7

      - name: Build summary
        run: |
          echo "## Build Completed Successfully ✅" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "- **Commit**: \`${{ github.sha }}\`" >> $GITHUB_STEP_SUMMARY
          echo "- **Branch**: \`${{ github.ref_name }}\`" >> $GITHUB_STEP_SUMMARY
          echo "- **Artifact**: \`build-${{ github.sha }}\`" >> $GITHUB_STEP_SUMMARY
```

### Step 2: Create Staging Deployment Workflow

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]
  workflow_dispatch:

jobs:
  deploy-staging:
    name: Deploy to Staging Environment
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build for staging
        run: npm run build
        env:
          NODE_ENV: staging
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}

      - name: Deploy to staging
        env:
          DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }}
        run: |
          echo "Deploying to staging environment..."
          echo "API URL: ${{ secrets.STAGING_API_URL }}"
          # Real deployment commands would go here:
          # - Upload files via FTP/SSH
          # - Deploy to cloud provider (AWS, Azure, Vercel)
          # - Update container registry
          echo "Deployment complete!"

      - name: Run smoke tests
        run: |
          echo "Running smoke tests against staging..."
          # curl https://staging.example.com/health
          # npm run test:smoke -- --url=https://staging.example.com
          echo "Smoke tests passed ✅"

      - name: Notify deployment
        if: always()
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            echo "✅ Staging deployment successful"
            # Send Slack notification
            # curl -X POST $SLACK_WEBHOOK -d '{"text":"Staging deployed"}'
          else
            echo "❌ Staging deployment failed"
          fi
```

### Step 3: Create Production Deployment with Manual Approval

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy (e.g., v1.2.3 or commit SHA)'
        required: true
        type: string

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: ${{ inputs.version }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run full test suite
        run: npm test

      - name: Build for production
        run: npm run build
        env:
          NODE_ENV: production
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}

      - name: Create deployment package
        run: |
          tar -czf deployment-${{ inputs.version }}.tar.gz dist/
          echo "Package created: deployment-${{ inputs.version }}.tar.gz"

      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.PRODUCTION_DEPLOY_KEY }}
        run: |
          echo "🚀 Deploying version ${{ inputs.version }} to production"
          # Real deployment would happen here
          sleep 3
          echo "✅ Deployment complete"

      - name: Verify deployment
        run: |
          echo "Verifying production deployment..."
          # curl -f https://example.com/health || exit 1
          echo "✅ Health check passed"

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          tag_name: ${{ inputs.version }}
          release_name: Release ${{ inputs.version }}
          body: |
            ## Production Deployment
            Deployed on $(date)

            **Deployed by**: @${{ github.actor }}

      - name: Notify team
        if: success()
        run: |
          echo "✅ Production deployment successful!"
          echo "Notifying team..."
          # Post to Slack, send email, etc.
```

**Note**: Configure the `production` environment in GitHub Settings → Environments to require manual approval from specific reviewers before deploying.

### Step 4: Create a Complete CI/CD Pipeline

Create `.github/workflows/cicd-pipeline.yml` that combines everything:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: production-build
          path: dist/

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: production-build
          path: dist/

      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
          ls -la dist/
          echo "Deployment complete!"

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment:
      name: production
      url: https://example.com

    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: production-build
          path: dist/

      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          ls -la dist/
          echo "Deployment complete!"
```

This pipeline:
1. Runs tests
2. Builds the application (only if tests pass)
3. Deploys to staging (only if build succeeds)
4. Deploys to production (only if staging succeeds, and requires manual approval)

### Step 5: Add Rollback Capability

Create `.github/workflows/rollback.yml`:

```yaml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to rollback to'
        required: true
        type: string

jobs:
  rollback:
    name: Rollback ${{ inputs.environment }}
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}

    steps:
      - name: Confirm rollback
        run: |
          echo "⚠️  Rolling back ${{ inputs.environment }} to version ${{ inputs.version }}"

      - name: Checkout previous version
        uses: actions/checkout@v4
        with:
          ref: ${{ inputs.version }}

      - name: Deploy previous version
        run: |
          echo "Deploying version ${{ inputs.version }} to ${{ inputs.environment }}"
          # Deploy previous version
          echo "✅ Rollback complete"

      - name: Verify rollback
        run: |
          echo "Verifying deployment..."
          echo "✅ Verification successful"
```

## Common Pitfalls and Troubleshooting

### Build Works Locally But Fails in CI

Check for:
- Hardcoded paths that differ between local and CI
- Missing environment variables
- Different Node.js versions
- Dependencies installed globally locally but not in CI

### Secrets Not Working

Remember:
- Secrets are not available in workflows triggered by forks
- Secrets are environment-specific if using GitHub Environments
- Secret names are case-sensitive

### Deployment Succeeds But Application Doesn't Work

- Verify all environment variables are set correctly
- Check that the build includes all necessary files
- Ensure database migrations run before deployment
- Test in staging before production

## Exercise

Create a complete CI/CD workflow that:

1. Runs tests on pull requests
2. Builds the application when code is merged to main
3. Automatically deploys to staging
4. Allows manual deployment to production with approval
5. Creates a GitHub release when deploying to production

<details>
<summary>Click to see solution outline</summary>

You'll need:
- One workflow for PR checks (tests only)
- One workflow for main branch (test → build → deploy staging)
- One workflow for production (manual trigger with environment protection)
- Configure environments in Settings → Environments with appropriate protections
</details>

## Key Takeaways

- Build artifacts once and deploy them to multiple environments
- Use GitHub Environments to manage deployment targets with secrets and protections
- Require manual approval for production deployments
- Always test in staging before deploying to production
- Use `needs:` to create dependencies between jobs (test → build → deploy)
- Tag releases and maintain deployment history
- Have a rollback strategy ready

---

**Previous Lesson**: [Running Tests Automatically](008-automated-testing.md)

**Next Lesson**: [Matrix Builds and Caching](010-matrix-and-caching.md) - Optimize workflows with parallel execution and caching.

**Additional Resources**:
- [Deploying with GitHub Actions](https://docs.github.com/en/actions/deployment)
- [Using Environments for Deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Deployment Best Practices](https://docs.github.com/en/actions/deployment/about-deployments/deploying-with-github-actions)
