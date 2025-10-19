# Contributing to GitHub Actions Workshop

Thank you for your interest in contributing to this workshop!

## Markdown Style Guide

### One Sentence Per Line

All markdown files in this repository follow the **one sentence per line** convention.

#### Why?

- **Better Git Diffs**: Changes to one sentence don't affect other sentences in the same paragraph
- **Easier Reviews**: Reviewers can comment on specific sentences
- **Simpler Merging**: Reduces merge conflicts when multiple people edit the same paragraph
- **Clearer History**: Git blame shows changes at sentence granularity

#### Example

**Good** (one sentence per line):

```markdown
GitHub Actions is a CI/CD platform built directly into GitHub. It allows you to automate tasks in your software
development lifecycle. You can trigger workflows based on events like pushes, pull requests, or schedules.
```

**Bad** (multiple sentences per line):

```markdown
GitHub Actions is a CI/CD platform built directly into GitHub. It allows you to automate tasks in your software
development lifecycle. You can trigger workflows based on events like pushes, pull requests, or schedules.
```

#### Exceptions

The following do **not** need to be split:

- **Code blocks**: Keep code formatting as-is
- **Lists**: One item per line (sentences within list items can be together if short)
- **Tables**: Standard markdown table format
- **Headings**: Keep together even if long
- **Links**: Keep URL and text together on one line

#### How to Format

**Option 1: Automatic formatting (recommended)**

Run the formatting script:

```bash
npm run format:md
```

Or directly:

```bash
python3 scripts/format-markdown.py
```

**Option 2: Manual formatting**

When writing or editing:

1. Write normally
2. After completing a paragraph, place each sentence on its own line
3. Keep proper paragraph spacing (blank line between paragraphs)

Example formatting workflow:

```markdown
<!-- Before -->

This is sentence one. This is sentence two. This is sentence three.

<!-- After -->

This is sentence one. This is sentence two. This is sentence three.
```

## Other Style Guidelines

### Lesson Structure

Each lesson should follow this structure:

1. **Front Matter**: Title, estimated time, difficulty
2. **Problem Statement**: 2-3 paragraphs explaining the real-world problem
3. **Concepts Introduction**: 3-5 paragraphs explaining concepts
4. **Step-by-Step Instructions**: Numbered steps with code examples
5. **Common Pitfalls**: Troubleshooting section
6. **Exercise**: Hands-on practice
7. **Key Takeaways**: 3-5 bullet points
8. **Navigation Links**: Previous/Next lesson links
9. **Additional Resources**: External links

### Code Blocks

- Always specify the language for syntax highlighting
- Use `yaml` for workflow files
- Use `bash` or `sh` for shell commands
- Use `markdown` for markdown examples

### Tone

- Conversational and friendly
- Explain "why" not just "how"
- Use real-world examples
- Acknowledge that errors are learning opportunities

## Setting Up for Development

### Install Git Hooks (Optional but Recommended)

To automatically format markdown files on commit:

```bash
git config core.hooksPath .githooks
```

This sets up a pre-commit hook that formats markdown files automatically.

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improve-lesson-5`)
3. Make your changes following the style guide
4. Run `npm run format:md` to ensure proper formatting
5. Commit with clear messages (`git commit -m "Improve explanation of secrets"`)
6. Push to your fork (`git push origin feature/improve-lesson-5`)
7. Open a Pull Request

## Testing Your Changes

Before submitting:

- [ ] Read through the entire lesson
- [ ] Test any code examples in a real repository
- [ ] Check that all links work
- [ ] Verify markdown renders correctly
- [ ] Ensure one sentence per line format

## Questions?

Open an issue if you have questions about contributing!

---

Thank you for helping make this workshop better for everyone! 🎉
