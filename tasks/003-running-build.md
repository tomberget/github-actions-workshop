# Lesson 3: Running a Build

## Problem Statement

In this lesson, you'll create your first GitHub Actions workflow that actually builds something!
Within this project, there is a `build.js` file that simulates a typical build process.

Running build steps like this is common in workflows in real projects.

Just a heads up before you run your workflow - I think there might be an error in the code 🧨
Let's run the workflow to see what the output looks like before we start debugging.

## Step-by-Step Instructions

Let's make a simple workflow that uses `npm run build` to run our project.

> [!TIP]
> In this task, as well as the following tasks, you will see a `uses: actions/checkout@v5` action.
> What this does is simply to checkout a repository (by default it will checkout the repo we are working in).
> The runners (we will get back to the various types of runners later!) will have various tools pre-installed, like `Git`, `Bash`, `Python` etc., but it will not know the context of the repo we are working in.












################################ vvv old 

# 2 Creating the first workflow that actually does something

</details>

Within this project there is a simple web site.
There's not much code in it, however I think there's a bug in it which has been commited to `main` by accident.
It seems that the project currently doesn't build correctly.
Let's create a workflow that will try to build the project and fail if it can't.
This is similar to how you would set up a CI workflow in a real project and verify that the code actually builds.

We'll use the `pull-request.yml` file from before, but keep in mind that the file name does not make a difference.
Nevertheless, it's good practice to name your workflow files after the event that triggers them or what they do.

## 2.1 Creating a workflow that tries to build the project

To build the project, we'll have to run the command `npm run build`.
Before we can do that, we'll need to make sure that the repository code is checked out, i.e. downloaded to the build agent.
After checking out, we have to install our Node dependencies with `npm install` (or `npm ci` which is a slightly better way to install dependencies in workflows).

1. In your workflow file, add a new **job** called `build` that runs on `ubuntu-latest`
1. In the first **step**, use the external workflow `actions/checkout@v4` to check out the repository:

   ```yaml
   - name: Checkout repository
     # To reference external workflows, we use the `uses` keyword.
     # The thing after the `@` is the version of the workflow, and
     # references a Git tag.
     uses: actions/checkout@v4
   ```

1. Add a new step that installs the dependencies:

   ```yaml
   - name: Install dependencies
     run: npm ci
   ```

1. Add the last step which runs the build command:

   ```yaml
   - name: Build
     run: npm run build
   ```

1. Use the previous PR or create a new one to run the workflow

`npm run build` will return a non-zero exit code if the build fails.
The workflow picks that up and will fail the job.

## 2.2 Add a PR rule to keep anyone from merging if the build fails

We now have a workflow that tries to build our code, but it's not very useful if we can still merge broken code.
GitHub has a feature called "branch protection rules"/"rulesets" that can be used to prevent merging code that doesn't pass the checks.
Let's add a rule that prevents merging if the build fails.

1. Go to the repository settings on <https://github.com/[your-username]/gh-actions-workshop/settings>
1. Click on "Branches" in the sidebar
1. Click on "Add classic branch protection rule"
1. Under "Branch name pattern", enter `main`. If you have a different default branch, use that instead.
1. Check the "Require status checks to pass before merging" checkbox and see that the box opens up
1. Search for the workflow you created (`build`) and select it to make it required
1. Click "Create" to create the rule
1. Open the PR again and see that we can't merge it 😻

> [!NOTE]
> GitHub might display a message saying that the new branch protection rule isn't active because the repository is private.
> Either make the repository public or ignore the message and go on.
> You won't be stopped by the branch protection rule if the build is failing, but you will be able to do the rest of the tasks.

Now the PR can't be merged until the build passes 🎉
Other settings I usually add to my branch protection rules are:

- Require branches to be up to date before merging
- Require conversation resolution before merging
- Require deployments to succeed before merging (if we use GitHub deployments)

## 2.3 Fix the error in the code

Go to the [`src/index.tsx`](../00../src/index.tsx) file and fix the error.
There might be a line at the top that looks suspiciously wrongful.
Commit the change and see that the workflow now runs successfully 🤩

Ok nice, now the project builds! Let's move on to [task 3](../003/README.md) to run our tests.