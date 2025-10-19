# Markdown Style Guide

## One Sentence Per Line

All markdown files in this repository follow the **one sentence per line** convention.

### Why?

This convention provides several benefits:

1. **Better Git Diffs**
   - Changes to one sentence don't affect other sentences
   - Reviewers see exactly which sentences changed
   - Cleaner, more focused diffs

2. **Easier Code Reviews**
   - Reviewers can comment on specific sentences
   - Change suggestions are more precise
   - Discussion threads are more focused

3. **Reduced Merge Conflicts**
   - Multiple people can edit the same paragraph
   - Conflicts only occur when the same sentence is edited
   - Easier to resolve conflicts when they do occur

4. **Clearer Git History**
   - `git blame` shows changes at sentence granularity
   - Track evolution of specific ideas over time
   - Better understanding of why content changed

### Example

**Good** ✅

```markdown
GitHub Actions is a CI/CD platform. It integrates directly into GitHub repositories. You can automate workflows based on
events.
```

**Bad** ❌

```markdown
GitHub Actions is a CI/CD platform. It integrates directly into GitHub repositories. You can automate workflows based on
events.
```

### When to Apply

Apply this convention to:

- ✅ Regular paragraph text
- ✅ Problem statements
- ✅ Concept explanations
- ✅ Instructional content

Do **not** apply to:

- ❌ Code blocks (keep code formatting intact)
- ❌ Headings (keep on one line)
- ❌ Short list items (can stay together)
- ❌ Tables (use standard table format)
- ❌ URLs and links (keep together)
- ❌ YAML frontmatter

### How to Use

**Automatic Formatting:**

```bash
# Format all markdown files
npm run format:md

# Or use the script directly
python3 scripts/format-markdown.py
```

**Set up automatic formatting on commit:**

```bash
git config core.hooksPath .githooks
```

**Manual Formatting:**

1. Write your content naturally
2. After finishing a paragraph, split sentences
3. Each sentence gets its own line
4. Keep blank lines between paragraphs

### Tools

- **Script**: `scripts/format-markdown.py`
- **Pre-commit hook**: `.githooks/pre-commit`
- **npm script**: `npm run format:md`
- **Editor config**: `.editorconfig`

### Examples from the Workshop

**Before:**

```markdown
You've just joined a development team, and every time someone pushes code to the repository, another developer has to
manually verify that the code runs without errors. This is time-consuming, prone to human error, and delays feedback.
Sometimes bugs slip through because someone forgot to run the checks before merging.
```

**After:**

```markdown
You've just joined a development team, and every time someone pushes code to the repository, another developer has to
manually verify that the code runs without errors. This is time-consuming, prone to human error, and delays feedback.
Sometimes bugs slip through because someone forgot to run the checks before merging.
```

### Tips

- Don't worry about line length
- Focus on semantic breaks (sentence boundaries)
- Use your editor's word wrap for comfortable reading
- The rendering is identical—this is just source formatting

## Questions?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for more details or open an issue!
