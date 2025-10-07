# GitHub Actions Workshop - Instructor Guide

## Workshop Overview

This comprehensive GitHub Actions workshop takes students from complete beginners to confidently building production-grade CI/CD pipelines. The workshop is structured as a hands-on, self-paced learning experience where students fork this repository and complete exercises directly in their own GitHub accounts.

## Workshop Structure

### Duration

- **Total Time**: 12-15 hours
- **Format**: Self-paced with 12 progressive lessons
- **Prerequisites**: Basic Git, command line, and programming knowledge

### Pedagogical Approach

**Lessons 1-3: Scaffolding (Beginner)**

- Heavy guidance with copy-paste friendly examples
- Detailed explanations of every concept
- Step-by-step instructions
- Focus on building confidence

**Lessons 4-6: Guided Practice (Intermediate)**

- Moderate independence
- References to previous lessons
- Introduction of problems to solve
- Students begin filling in blanks

**Lessons 7-12: Problem-Based Learning (Advanced)**

- Minimal hand-holding
- Complex real-world scenarios
- Students apply accumulated knowledge
- Emphasis on best practices and optimization

## Lesson Summary

### Lesson 1: Getting Started with GitHub Actions (30 min)

- First workflow creation
- Understanding YAML basics
- Viewing workflow runs
- **Key Concept**: Workflows automate tasks based on events

### Lesson 2: Understanding Workflow Anatomy (30 min)

- Workflow structure: events, jobs, steps
- Runners and execution environments
- Context expressions
- **Key Concept**: Hierarchical structure from workflow to steps

### Lesson 3: Events and Triggers (45 min)

- Event types and filtering
- Scheduled workflows (cron)
- Manual triggers with inputs
- Path-based filtering
- **Key Concept**: Precise control over when workflows run

### Lesson 4: Working with Actions from Marketplace (45 min)

- Finding and evaluating actions
- Action inputs and outputs
- Versioning strategies
- Conditional execution
- **Key Concept**: Reuse community solutions instead of building from scratch

### Lesson 5: Secrets and Environment Variables (45 min)

- Secure secret management
- Environment-specific configuration
- Using GITHUB_TOKEN
- Deployment environments
- **Key Concept**: Security and configuration management

### Lesson 6: Debugging Workflows (60 min)

- Intentional bug introduction (learning trap!)
- Debug logging
- Workflow commands
- Continue-on-error
- **Key Concept**: Systematic troubleshooting techniques

### Lesson 7: Running Tests Automatically (60 min)

- Continuous Integration principles
- Test coverage reporting
- Branch protection
- Fast vs comprehensive testing
- **Key Concept**: Automated testing prevents broken code from merging

### Lesson 8: Building and Deploying Applications (75 min)

- Build artifacts
- Multi-environment deployments
- Manual approval gates
- Rollback strategies
- **Key Concept**: Continuous Delivery and Deployment

### Lesson 9: Matrix Builds and Caching (60 min)

- Matrix strategy for parallel testing
- Dependency caching
- Fail-fast vs comprehensive
- **Key Concept**: Optimization through parallelization and caching

### Lesson 10: Multi-Job Workflows and Dependencies (60 min)

- Job dependencies with `needs:`
- Sharing data between jobs
- Complex dependency graphs
- **Key Concept**: Orchestrating complex pipelines

### Lesson 11: Creating Custom Actions (90 min)

- Composite actions
- JavaScript actions (optional)
- Action metadata
- **Key Concept**: Encapsulate reusable logic

### Lesson 12: Workflow Reusability and Best Practices (75 min)

- Reusable workflows
- Security best practices
- Performance optimization
- Maintainability patterns
- **Key Concept**: Production-ready workflows that scale

## Sample Application

The workshop includes a simple Node.js task manager application:

### Structure

```
src/
├── index.js          # Main application entry
└── taskManager.js    # Task management logic

tests/
└── taskManager.test.js   # Comprehensive test suite

build.js              # Build script
package.json          # Dependencies and scripts
```

### Features

- CRUD operations for tasks
- Priority levels
- Completion tracking
- Full test coverage
- Build process

### Purpose

- Realistic codebase for CI/CD exercises
- Working tests for automated testing lessons
- Build output for deployment lessons
- Students don't need to understand app logic—focus stays on GitHub Actions

## Teaching Tips

### For Instructors

1. **Encourage Experimentation**: Remind students they can't break anything—it's a forked repository.

2. **Emphasize Errors as Learning**: Lesson 6 intentionally introduces bugs. Frame this as normal and valuable.

3. **Link to Real World**: Ask students to think about their own projects and how they'd apply concepts.

4. **Progressive Disclosure**: Don't overwhelm beginners with advanced topics. The lesson structure naturally builds complexity.

5. **Practical Over Theoretical**: Every lesson includes hands-on exercises. Ensure students complete them.

### Common Student Challenges

**Challenge**: YAML syntax errors
**Solution**: Recommend yamllint.com for validation

**Challenge**: Workflows not triggering
**Solution**: Check file location (`.github/workflows/`), YAML syntax, and trigger conditions

**Challenge**: Secrets not working in forked repos
**Solution**: Explain GitHub's security model—secrets aren't available to forked PR workflows

**Challenge**: Tests pass locally but fail in CI
**Solution**: Discuss environment differences, missing dependencies, and reproducibility

## Workshop Customization

### Adapting for Different Languages

While the workshop uses Node.js, the concepts apply to any language:

**For Python**:

- Replace `actions/setup-node` with `actions/setup-python`
- Use `pip` instead of `npm`
- Adapt test commands for pytest

**For Go**:

- Use `actions/setup-go`
- Adjust build and test commands
- Emphasize cross-platform builds with matrix

**For Containers**:

- Add Docker build steps
- Use container registries
- Introduce Docker actions

### Time-Constrained Workshops

**Half-Day Workshop (4 hours)**: Lessons 1-6

- Fundamentals only
- Gets students productive quickly
- Perfect for bootcamps

**Full-Day Workshop (8 hours)**: Lessons 1-9

- Includes testing and deployment
- Comprehensive coverage
- Suitable for corporate training

**Two-Day Workshop (16 hours)**: All 12 lessons

- Complete curriculum
- Advanced topics included
- Best for intensive training programs

## Assessment and Completion

### Student Completion Criteria

Students have successfully completed the workshop when they can:

- Create workflows from scratch
- Debug failing workflows systematically
- Implement CI/CD pipelines with testing and deployment
- Use matrix builds and caching effectively
- Create custom actions for reusability
- Apply security and performance best practices

### Suggested Capstone Project

Have students create a complete CI/CD pipeline for their own project that includes:

1. Automated testing on PR
2. Build process
3. Deployment to staging (automatic)
4. Deployment to production (manual approval)
5. At least one custom action
6. Proper secrets management

## Resources for Students

After completing the workshop, direct students to:

- **Official Documentation**: [docs.github.com/actions](https://docs.github.com/en/actions)
- **Actions Marketplace**: [github.com/marketplace?type=actions](https://github.com/marketplace?type=actions)
- **Community**: GitHub Community Forum, Stack Overflow
- **Advanced Topics**: Self-hosted runners, GitHub Enterprise features
- **Security**: GHAS (GitHub Advanced Security) for additional security scanning

## License and Attribution

This workshop is provided as open educational content. Feel free to:

- Use it for teaching
- Adapt it for your needs
- Share it with others
- Contribute improvements

## Feedback and Contributions

We welcome feedback and contributions! If you find issues or have suggestions:

1. Open an issue in the repository
2. Submit a pull request with improvements
3. Share your experience teaching or taking the workshop

---

**Happy Learning!** 🚀
