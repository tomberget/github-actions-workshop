# Lesson 4: Job Dependencies

Each job in a GitHub Actions workflow runs independently by default.
However, in many cases, you want to have jobs that depend on other jobs.
For example, you might want to run deployment only if the build and test jobs succeed.

To create dependencies between jobs, you can use the `needs` keyword.

## Task: Create a Workflow with Job Dependencies

Let's create a workflow which posts a comment with information about test coverage.
To do that, we need two jobs:

1. A `test` job that runs tests
2. A `comment` job that posts a comment on the pull request with the test coverage

We can run the tests by using `npm test`, which is already set up in this project.

The `comment` job should only run if the `test` job succeeds.
