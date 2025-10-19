# LLM Prompt for GitHub Actions Workshop Creation

You are an expert instructor creating a comprehensive GitHub Actions workshop for beginners to intermediate developers.
This workshop will be delivered as a template repository that students fork to complete exercises in their own
repositories.

## Workshop Structure Requirements

### Repository Organization

- Create lesson files in `/lessons/` directory, numbered sequentially (e.g., `001-getting-started.md`,
  `002-basic-workflows.md`)
- Include a main `README.md` with workshop overview, prerequisites, and lesson index
- DO NOT include any `.github/workflows/` files in the template repository (students create these themselves)
- Include any necessary starter code, configuration files, or sample applications students will need

### Lesson Format

Each lesson must follow this structure:

1. **Problem Statement** (2-3 paragraphs)
   - Real-world scenario or pain point
   - Why this matters in modern development
   - What students will accomplish

2. **Concepts Introduction** (3-5 paragraphs)
   - Explain the GitHub Actions concept(s) being introduced
   - Relevant terminology and definitions
   - How it fits into the larger CI/CD ecosystem

3. **Step-by-Step Instructions**
   - Clear, numbered steps with specific actions
   - Code snippets with explanations
   - Expected outputs or results to verify success
   - Common pitfalls and troubleshooting tips

4. **Exercise/Challenge** (for later lessons)
   - Hands-on task applying the concepts
   - Success criteria

5. **Key Takeaways** (3-5 bullet points)
   - Summary of what was learned

### Pedagogical Progression

- **Lessons 1-3**: Heavy scaffolding, very detailed instructions, copy-paste friendly
- **Lessons 4-6**: Moderate guidance, some blanks to fill in, references to earlier lessons
- **Lessons 7+**: Problem-based learning, minimal hand-holding, students apply previous knowledge

## Content Coverage

Create approximately 10-12 lessons covering:

1. **Fundamentals**
   - What are GitHub Actions and CI/CD
   - Workflow basics (triggers, jobs, steps)
   - First "Hello World" workflow

2. **Core Concepts**
   - Events and triggers (push, pull_request, schedule, manual)
   - Runners (GitHub-hosted vs self-hosted)
   - Actions from the Marketplace
   - Environment variables and secrets
   - Debugging (logs, step-by-step execution) (lure the student into a trap and then help them debugging it and solving
     it)

3. **Practical Applications**
   - Running tests automatically
   - Building and deploying applications
   - Multi-job workflows and dependencies
   - Matrix builds (multiple versions/platforms)
   - Caching dependencies

4. **Advanced Topics**
   - Creating custom actions
   - Workflow reusability (composite actions, reusable workflows)
   - Security best practices
   - Debugging workflows

## Target Audience

- Developers with basic Git/GitHub knowledge
- Familiar with command line and at least one programming language
- Little to no CI/CD experience
- Want practical, hands-on learning

## Additional Requirements

- Use a consistent sample application throughout (suggest: simple Node.js, Python, or Go app)
- Include links to official GitHub Actions documentation
- Provide estimated completion time for each lesson
- Add a glossary of terms in the README
- Include a "What's Next" section with additional resources
- Use https://github.com/boyum/gh-actions-workshop as inspiration but create original content

## Tone and Style

- Conversational and friendly but professional
- Encourage experimentation
- Acknowledge that errors are learning opportunities
- Use real-world examples and analogies
- Avoid jargon without explanation

Generate the complete workshop with all lesson files, README, and any necessary starter code.
