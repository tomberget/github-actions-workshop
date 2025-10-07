# Lesson 1: Getting Started with GitHub Actions

**Estimated Time**: 30 minutes
**Difficulty**: Beginner

## Problem Statement

You've just joined a development team, and every time someone pushes code to the repository, another developer has to manually verify that the code runs without errors.
This is time-consuming, prone to human error, and delays feedback.
Sometimes bugs slip through because someone forgot to run the checks before merging.

In modern software development, teams push code dozens or even hundreds of times per day.
Manual verification simply doesn't scale.
This is where automation becomes essential—not just a nice-to-have, but a fundamental requirement for productive, high-quality software development.

In this lesson, you'll create your first GitHub Actions workflow that automatically runs every time you push code.
You'll see firsthand how automation can save time and catch issues immediately.

## Concepts Introduction

### What are GitHub Actions?

GitHub Actions is a continuous integration and continuous deployment (CI/CD) platform built directly into GitHub.
It allows you to automate tasks in your software development lifecycle right where your code lives—no need for external services or complex configurations.

Think of GitHub Actions as a robot assistant that watches your repository and performs tasks automatically based on events you define.
When you push code, open a pull request, create an issue, or even on a schedule, GitHub Actions can spring into action.

### What is CI/CD?

**Continuous Integration (CI)** is the practice of automatically testing and building your code every time changes are made.
Instead of waiting until the end of the week to discover that your code doesn't work with your teammate's changes, you find out within minutes.

**Continuous Deployment/Delivery (CD)** takes this further by automatically deploying your tested and built code to production or staging environments.
This means your users get features and fixes faster, with less manual work and fewer mistakes.

### Why GitHub Actions?

Before GitHub Actions, developers often used external CI/CD tools (like Jenkins, Travis CI, or CircleCI) that required separate accounts, configuration, and management. GitHub Actions simplifies this by integrating everything directly into GitHub:

- No separate service to manage or pay for (free tier is generous)
- Configuration lives in your repository alongside your code
- Seamless integration with pull requests, issues, and other GitHub features
- Access to thousands of pre-built actions from the community
- Works with any language or platform

### How GitHub Actions Works

At its core, GitHub Actions uses **workflows**—automated processes defined in YAML files. These workflows contain:

- **Events** that trigger the workflow (like pushing code)
- **Jobs** that run on virtual machines called runners
- **Steps** that execute commands or use pre-built actions

When an event occurs in your repository, GitHub spins up a fresh virtual machine, runs your workflow, and provides detailed logs of everything that happened.

## Step-by-Step Instructions

Let's create your first GitHub Actions workflow! We'll make a simple workflow that runs every time you push code and prints a welcome message.

### Step 1: Understand the Repository Structure

GitHub Actions workflows must be stored in a specific location in your repository:

```
your-repository/
└── .github/
    └── workflows/
        └── your-workflow.yml
```

The `.github/workflows/` directory is where all your workflow files live. You can have multiple workflow files, and GitHub will run each one according to its own triggers.

### Step 2: Create the Workflow Directory

In your terminal, make sure you're in the root of your cloned workshop repository, then create the necessary directories:

```bash
mkdir -p .github/workflows
```

The `-p` flag creates parent directories if they don't exist, so this command creates both `.github` and `.github/workflows`.

### Step 3: Create Your First Workflow File

Create a new file called `hello-world.yml` in the `.github/workflows/` directory. You can use your favorite text editor or run:

```bash
touch .github/workflows/hello-world.yml
```

### Step 4: Write the Workflow

Open `.github/workflows/hello-world.yml` and copy the following content:

```yaml
name: Hello World Workflow

on: [push]

jobs:
  say-hello:
    runs-on: ubuntu-latest

    steps:
      - name: Print greeting
        run: echo "Hello, GitHub Actions! Welcome to the workshop!"

      - name: Print date and time
        run: date

      - name: Print system information
        run: |
          echo "Running on:"
          uname -a
```

Let's break down what each part means:

- `name: Hello World Workflow` - This is the human-readable name that appears in the GitHub Actions UI
- `on: [push]` - This defines the trigger. The workflow runs on every push to any branch
- `jobs:` - A workflow can have multiple jobs. We have one called `say-hello`
- `runs-on: ubuntu-latest` - Specifies the type of runner (virtual machine) to use. GitHub provides Ubuntu, Windows, and macOS runners
- `steps:` - The list of tasks to execute in this job
- `name:` (in steps) - Descriptive name for each step
- `run:` - The command to execute. The `|` symbol allows multi-line commands

### Step 5: Commit and Push Your Workflow

Now let's push this workflow to GitHub so it can run:

```bash
git add .github/workflows/hello-world.yml
git commit -m "Add hello world workflow"
git push origin main
```

**Note**: If you're working on a different branch, replace `main` with your branch name.

### Step 6: View Your Workflow Run

This is where the magic happens! Navigate to your repository on GitHub in your web browser:

1. Click on the **"Actions"** tab at the top of your repository
2. You should see your "Hello World Workflow" listed on the left sidebar
3. Click on the most recent workflow run (it should be running or completed)
4. Click on the `say-hello` job to see the details

**Expected Output**: You should see each step executed with green checkmarks, and the output from your echo and date commands.

### Step 7: Verify the Output

Expand each step by clicking on it to see the output:

- "Print greeting" should show: `Hello, GitHub Actions! Welcome to the workshop!`
- "Print date and time" should show the current date and time
- "Print system information" should show details about the Ubuntu system running your workflow

### Step 8: Make a Change and Trigger It Again

Let's verify that the workflow triggers on every push. Modify the workflow to add another step:

Open `.github/workflows/hello-world.yml` and add this step at the end of the steps list:

```yaml
      - name: Show working directory
        run: pwd
```

Then commit and push:

```bash
git add .github/workflows/hello-world.yml
git commit -m "Add working directory step to workflow"
git push origin main
```

Go back to the Actions tab and watch a new workflow run start automatically!

## Common Pitfalls and Troubleshooting

### Workflow Doesn't Appear

If you don't see your workflow in the Actions tab:
- **Check the file location**: Must be in `.github/workflows/`
- **Check YAML syntax**: One misplaced space can break YAML. Use a YAML validator like [yamllint.com](http://www.yamllint.com/)
- **Verify the file extension**: Must be `.yml` or `.yaml`
- **Ensure you pushed**: Run `git push` to upload your changes

### Workflow Fails

If your workflow shows a red X:
- Click on the failed workflow run to see error details
- Expand the failing step to see the exact error message
- Common issues include typos in commands or incorrect YAML indentation

### YAML Indentation

YAML is sensitive to indentation (like Python). Use spaces, not tabs, and be consistent:

```yaml
# Correct
jobs:
  say-hello:
    runs-on: ubuntu-latest
    steps:
      - name: Step 1
        run: echo "works!"

# Incorrect (inconsistent indentation)
jobs:
  say-hello:
   runs-on: ubuntu-latest
     steps:
     - name: Step 1
       run: echo "breaks!"
```

## Key Takeaways

- GitHub Actions automates tasks in your repository based on events like pushes, pull requests, or schedules
- Workflows are defined in YAML files stored in `.github/workflows/`
- A workflow consists of triggers (events), jobs, and steps
- Every push to GitHub can trigger automated workflows, giving you instant feedback
- The Actions tab in your GitHub repository shows all workflow runs with detailed logs

---

**Next Lesson**: [Understanding Workflow Anatomy](002-workflow-anatomy.md) - Dive deeper into the structure and components of workflows.

**Additional Resources**:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [YAML Tutorial](https://learnxinyminutes.com/docs/yaml/)
