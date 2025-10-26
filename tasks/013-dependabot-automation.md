# Lesson 13: Advanced Dependabot Automation Challenge

## The Story: The Overwhelmed Maintainer

Alex is the lead maintainer of a popular open-source library with over 50 dependencies. After setting up Dependabot,
they're thrilled to see security vulnerabilities getting fixed automatically. However, there's a new problem: they're
getting 3-5 Dependabot PRs every week for minor and patch updates to development dependencies.

Each PR requires manual review, waiting for CI to pass, and clicking merge. What should be a 2-minute task often
stretches to 10-15 minutes when Alex gets distracted or forgets to check back after CI completes.

"I love that Dependabot keeps us updated," Alex thinks, "but I'm spending too much time managing dependency PRs. There
has to be a way to safely auto-merge the low-risk updates."

Alex wants to automatically merge Dependabot PRs that meet these criteria:

- Only patch and minor version updates (no major versions)
- Only for development dependencies (not production dependencies)
- Only if the new package version has been available for at least 24 hours (giving time for the community to report
  issues with the new version)
- Only if all CI checks pass

**The Challenge: Build a custom GitHub Actions workflow to automate this!**

## The Challenge

You'll create a sophisticated GitHub Actions workflow that:

1. **Triggers** on Dependabot pull requests
2. **Analyzes** the PR to determine if it's safe to auto-merge
3. **Checks** if the new package version is mature enough (24+ hours old)
4. **Validates** that all checks have passed
5. **Auto-merges** qualifying PRs

This is a **challenge task** that combines multiple GitHub Actions concepts you've learned throughout the workshop.

## Challenge Requirements

Your workflow must:

✅ **Trigger Conditions**:

- Run only on Dependabot PRs
- Target patch and minor version updates only
- Apply only to `devDependencies` (not regular dependencies)

✅ **Safety Checks**:

- Ensure the new package version has been available for at least 24 hours
- Ensure all CI checks are passing
- Verify the PR is still mergeable

✅ **Smart Behavior**:

- Add a comment explaining why it's auto-merging
- Use appropriate GitHub API permissions
- Handle edge cases gracefully

## Getting Started

Here's a skeleton to help you get started:

### Step 1: Create the Workflow File

Create `.github/workflows/auto-merge-dependabot.yml`:

```yaml
name: Auto-merge Dependabot PRs

# TODO: Define when this workflow should run
on:
  # HINT: You'll need to trigger on specific PR events
  # and filter for Dependabot PRs

jobs:
  auto-merge:
    # TODO: Define job conditions and permissions
    runs-on: ubuntu-latest

    steps:
      # TODO: Add steps to:
      # 1. Check if this is a Dependabot PR
      # 2. Analyze the type of update (patch/minor/major)
      # 3. Check if it's a devDependency
      # 4. Verify the PR age
      # 5. Check CI status
      # 6. Auto-merge if all conditions are met
```

## Hints and Resources

### 🔍 **Key Concepts to Research**:

1. **PR Events**: Which `pull_request` events should trigger your workflow?
2. **Dependabot Detection**: How can you identify if a PR is from Dependabot?
3. **API Interactions**: How do you check PR details, CI status, and merge PRs via GitHub API?
4. **Package Version Age**: How can you check when a specific npm package version was published?
5. **Package Analysis**: How can you determine if an update is patch/minor and affects devDependencies?

### 📚 **Useful GitHub Actions**:

- `actions/checkout@v4` - Check out the repository
- `actions/github-script@v7` - Run JavaScript with GitHub API access
- GitHub CLI (`gh`) - Command-line GitHub operations

### 🔧 **APIs to Explore**:

- **GitHub API**:
  - Pull request details: `/repos/{owner}/{repo}/pulls/{pull_number}`
  - Check runs: `/repos/{owner}/{repo}/commits/{ref}/check-runs`
  - Merge PR: `PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`
- **NPM Registry API**:
  - Package info: `https://registry.npmjs.org/{package-name}`
  - Version publish dates: Check the `time` field for specific versions
- Merge PR: `PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`

### 💡 **Logic Flow Ideas**:

```text
1. Is PR author 'dependabot[bot]'? → If no, exit
2. Parse PR title for version change → Extract old/new versions
3. Is it patch/minor update? → If major, exit
4. Check package.json changes → Is it devDependencies only?
5. Check package version age → Query NPM registry for publish date
6. Is new version > 24 hours old? → If no, exit
7. Check CI status → Are all checks passing?
8. Add comment → Explain auto-merge reasoning
9. Merge PR → Use squash merge
```

### 🧩 **Example: Checking Package Version Age**

```javascript
// In your GitHub Actions workflow using actions/github-script
const packageName = "example-package";
const newVersion = "1.2.3";

// Query NPM registry
const response = await fetch(`https://registry.npmjs.org/${packageName}`);
const packageData = await response.json();

// Get publish date for the specific version
const publishDate = new Date(packageData.time[newVersion]);
const hoursOld = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60);

if (hoursOld >= 24) {
  console.log(`Version ${newVersion} is ${hoursOld.toFixed(1)} hours old - safe to merge`);
} else {
  console.log(`Version ${newVersion} is only ${hoursOld.toFixed(1)} hours old - too new`);
}
```

## Bonus Challenges

Once you have the basic workflow working, try these advanced features:

### 🌟 **Bonus 1: Configurable Settings**

Make the workflow configurable via repository variables:

- Minimum age before auto-merge (default: 24 hours)
- Which dependency types to include (dev, peer, optional)
- Maximum version jump allowed (patch vs minor)

### 🌟 **Bonus 2: Slack Notifications**

Send a Slack message when PRs are auto-merged with:

- Package name and version change
- Link to the merged PR
- Summary of checks that passed

### 🌟 **Bonus 3: Safety Override**

Add a mechanism to prevent auto-merge:

- Check for a `no-auto-merge` label
- Skip auto-merge if PR has comments from humans
- Skip if PR has merge conflicts

## Testing Your Solution

### Test Case 1: Should Auto-Merge

1. Wait for Dependabot to create a devDependency patch/minor update PR
2. Ensure the new package version is 24+ hours old (check NPM registry)
3. Ensure CI passes
4. Verify your workflow auto-merges it

### Test Case 2: Should NOT Auto-Merge

- Major version updates
- Production dependency updates
- Package versions less than 24 hours old
- PRs with failing CI

> [!TIP]
> **Testing Package Age**: You can test with older packages by temporarily downgrading a devDependency to a much
> older version, then letting Dependabot update it to a version that's definitely 24+ hours old.

## Solution Validation

Your workflow is successful when:

1. ✅ It correctly identifies Dependabot PRs
2. ✅ It only processes patch/minor devDependency updates
3. ✅ It respects the 24-hour waiting period
4. ✅ It validates CI status before merging
5. ✅ It adds helpful comments explaining its actions
6. ✅ It handles edge cases without breaking

## Learning Objectives

By completing this challenge, you'll master:

- **Advanced GitHub Actions triggers** and event filtering
- **GitHub API integration** with actions/github-script
- **Complex conditional logic** in workflows
- **Safe automation practices** for dependency management
- **Real-world problem solving** with CI/CD

## Getting Stuck?

Remember:

- Start small and build incrementally
- Use `echo` commands to debug your logic
- Test with simple conditions before adding complexity
- The GitHub Actions marketplace has helpful actions for common tasks
- Check the GitHub API documentation for available endpoints

Good luck! This challenge will test everything you've learned about GitHub Actions while solving a real problem that
many development teams face.

## Next Steps

Once you complete this challenge, you'll have built a production-ready automation that you can use in your own projects.
Consider sharing your solution with the team or open-source community!

For further on more advanced topics, check out [Lesson 14: Advanced Topics](./014-advanced-topics.md).
