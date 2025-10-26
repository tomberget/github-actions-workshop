# Lesson 12: Keeping Dependencies Up to Date with Dependabot

## The Story: The Friday Security Alert

It's Friday afternoon, and Hannah, a senior developer, gets a Slack notification that makes her heart skip a beat:
"CRITICAL SECURITY VULNERABILITY found in your project dependencies." The company security scanner has detected that the
`marked` package they're using has a known vulnerability that could expose their application to XSS attacks.

Hannah quickly checks their `package.json` and realizes they're using `marked` version `14.1.4`, but the latest secure
version is `16.4.1`. That's not just a patch update—it's a major version jump that could introduce breaking changes.

"How long have we been running with this vulnerability?" she wonders, scrolling through Git history. Turns out, they've
been using the outdated version for 8 months! The team has been so focused on delivering new features that nobody
remembered to regularly check for dependency updates.

Now Hannah faces a dilemma: spend her weekend manually reviewing and updating dozens of dependencies (and potentially
breaking things), or leave the security vulnerability in place until Monday. Neither option feels good.

"There has to be a better way to stay on top of this," Hannah thinks.

**Enter Dependabot!** 🦾🤖

## The Problem

Manual dependency management creates real risks:

- **Security Vulnerabilities**: Outdated packages often contain known security flaws
- **Technical Debt**: The longer you wait, the harder updates become
- **Manual Overhead**: Checking for updates is tedious and error-prone
- **Breaking Changes**: Major version jumps can introduce unexpected issues
- **Forgotten Dependencies**: It's easy to miss indirect dependencies that need updates

Most projects use dozens or even hundreds of dependencies. Keeping them all current manually is practically impossible
for busy development teams.

## Concepts Introduction

**Dependabot** is GitHub's built-in dependency management tool that automatically:

- Monitors your dependencies for updates
- Creates pull requests with proposed upgrades
- Provides security vulnerability alerts
- Handles different update schedules (daily, weekly, monthly)
- Supports multiple package managers (npm, pip, Maven, Gradle, etc.)

The best part? It integrates seamlessly with your existing GitHub Actions workflows to test updates automatically before
merging.

## Step-by-Step Instructions

Let's set up Dependabot to keep our workshop project's dependencies current and secure.

> [!IMPORTANT]
> **Free GitHub Account Compatibility**:
>
> - **Dependabot security updates** work for all repositories (public and private)
> - **Dependabot version updates** are free for public repositories
> - If your repository is private and you're on a free account, you'll only get security updates, not regular version
>   updates

### Step 1: Introduce the Vulnerable Dependency

For the sake of this task, we will use a known vulnerable version of the `marked` package. Let's check out a new branch
and install the vulnerable version:

```bash
# Create and switch to a new branch
git checkout -b dependabot-demo
# Install the vulnerable version of marked
npm install marked@14.1.4
# Commit the change
git add package.json package-lock.json
git commit -m "Install vulnerable version of marked (14.1.4) for Dependabot demo"
# Push the branch to GitHub
git push -u origin dependabot-demo
```

### Step 2: Check Current Dependencies

First, let's see what dependencies our project currently has:

```bash
npm list --depth=0
```

You should see output showing packages like `marked@14.1.4`, `puppeteer`, `github-markdown-css`, etc.

### Step 3: Create Dependabot Configuration

Dependabot uses a special configuration file to know how to manage your dependencies.

Create a new file at `.github/dependabot.yml` (note: this goes in the `.github` folder, not in `.github/workflows/`):

```yaml
# Configuration for Dependabot
# See: https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file

version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly" # This is just an example of how Dependabot can be scheduled!
      day: "monday"
      time: "09:00"
    # Limit the number of open PRs for version updates
    open-pull-requests-limit: 5
    # Add reviewers and assignees
    reviewers:
      - "your-github-username" # Replace with your actual GitHub username
    # Group all dependency updates together
    groups:
      all-updates:
        patterns:
          - "*"
        update-types:
          - "major"
          - "minor"
          - "patch"
```

> [!IMPORTANT]
> Replace `"your-github-username"` with your actual GitHub username so you'll be assigned to review the
> dependency update PRs.

### Step 4: Commit and Push the Configuration

```bash
# Add the configuration file
git add .github/dependabot.yml

# Commit the changes
git commit -m "Add Dependabot configuration for npm dependencies"

# Push the branch to GitHub
git push -u origin dependabot-demo
```

After pushing, create a pull request:

1. Go to your repository on GitHub
2. You should see a banner suggesting to "Compare & pull request" for your new branch
3. Click "Create pull request"
4. Add a title like "Add Dependabot configuration"
5. Click "Create pull request"

### Step 5: Merge the Configuration PR

Once you've created the pull request:

1. Review the changes in the PR
2. Click "Merge pull request"
3. Delete the branch when prompted
4. Switch back to main branch locally:
   ```bash
   git checkout main
   git pull
   ```

### Step 6: Enable Dependabot Security Updates

1. Go to your repository on GitHub
2. Click on the "Settings" tab
3. In the left sidebar, click "Code security and analysis"
4. Under "Dependabot", make sure both options are enabled:
   - **Dependabot alerts**: Get notified about vulnerabilities (Free for all repos)
   - **Dependabot security updates**: Automatic PRs for security issues (Free for all repos)

### Step 7: Wait for Dependabot to Detect Issues

After pushing the Dependabot configuration, GitHub will automatically scan your dependencies. Since our project uses
`marked@14.1.4` (which has known vulnerabilities), you should see:

1. **Security Alert**: Within a few minutes, a security alert will appear in your repository's "Security" tab
2. **Automatic PR**: Dependabot will create a security update PR automatically within a few minutes
3. **Dashboard Updates**: The Dependabot dashboard will show the detected vulnerabilities

> [!TIP]
> **Want to see it faster?** ⚡️ You can manually trigger the security scan by going to:
>
> 1. Your repository's "Security" tab
> 2. "Dependabot alerts" section
> 3. Look for the `marked` vulnerability alert
> 4. Click "Create Dependabot security update" if available

### Step 8: Monitor the Security Tab

Navigate to your repository's "Security" tab to see:

- **Dependabot alerts**: Shows the `marked` vulnerability details
- **Dependency graph**: Visual representation of your project's dependencies
- **Security advisories**: Information about the specific CVEs affecting `marked@14.1.4`

When Dependabot creates a pull request, it will:

- **Show the change**: What package is being updated and from which version to which
- **Include release notes**: Links to changelogs and release notes
- **Display compatibility score**: Based on how many other projects successfully use this version
- **Security information**: If the update fixes security vulnerabilities

### Step 9: Review the Dependabot Pull Request

When Dependabot creates the security update PR (usually within 30 minutes), you'll see:

1. **PR Title**: "Bump marked from 14.1.4 to 16.4.1" (or the latest secure version)
2. **Security Label**: A "security" badge indicating this fixes vulnerabilities
3. **Detailed Information**:
   - **Security vulnerabilities fixed**: CVE details and severity scores
   - **Release notes**: What changed between 14.1.4 and the new version
   - **Compatibility score**: How many other projects successfully use this version
   - **Commits included**: All the changes in this major version jump

4. **Automatic Testing**: Your existing GitHub Actions workflows will run to test the update

> [!IMPORTANT]
> **This is a major version update** (14.x → 16.x), so pay special attention to:
>
> - Breaking changes in the release notes
> - Test results from your CI workflows
> - Any deprecation warnings in the update

### Step 10: Merge the Security Update

When the Dependabot PR is ready:

1. **Review the security fix**:
   - Confirm it updates `marked` from `14.1.4` to `16.4.1` (or latest)
   - Read the CVE details to understand what vulnerabilities are being fixed
   - Check the release notes for any breaking changes between major versions

2. **Verify tests pass**:
   - Wait for your GitHub Actions workflows to complete
   - Ensure all checks are green ✅
   - Pay attention to any test failures that might indicate breaking changes

3. **Merge the security update**:
   - Click "Merge pull request" (security updates should be prioritized)
   - Delete the branch when prompted
   - Your application is now secure! 🔒

4. **Verify the update**:

   ```bash
   # Pull the latest changes
   git pull

   # Confirm the updated version
   npm list marked
   ```

   You should now see `marked@16.4.1` (or newer) instead of the vulnerable `14.1.4`.

> [!SUCCESS]
> **Congratulations!** You've just used Dependabot to automatically detect and fix a real security
> vulnerability. This same process will continue to protect your project from future vulnerabilities.

## Benefits of Using Dependabot

By setting up Dependabot, you've gained several important benefits:

1. **Proactive Security**: Automatic alerts and fixes for vulnerabilities
2. **Reduced Manual Work**: No more manually checking for updates
3. **Smaller, Safer Updates**: Regular small updates instead of massive upgrades
4. **Automated Testing**: Integration with your existing CI workflows
5. **Better Visibility**: Clear information about what's changing and why

## Summary

In this lesson, you learned how to set up Dependabot to automatically manage your project's dependencies. You now have:

- Automatic pull requests for security vulnerabilities
- Integration with your existing GitHub Actions workflows
- A systematic approach to keeping dependencies current

Dependabot takes the burden of manual dependency management off your shoulders, letting you focus on building features
while staying secure and up-to-date.

Next, let's take a look at a more advanced scenario for Dependabot:
[Lesson 13: Advanced Dependabot Automation Challenge](./013-dependabot-automation.md)

> [!NOTE]
> **Free Account Users**: Remember that full Dependabot version updates work best with public repositories. If
> you followed the workshop setup guide and made your repository public, you'll have access to all Dependabot features!

Remember: even with Dependabot, you should still review the pull requests it creates. Automation helps, but human
judgment is still important for major updates that might introduce breaking changes.
