---
description: Perform an AI code review for a feature branch before creating a pull request. Checks correctness, typing, validation, error handling, security, and consistency with the codebase.
agent: agent
tools:
  - execute
  - read
  - search
argument-hint: <issue number>
---

# Review Code

## Input

The GitHub issue to review: `${input:issue:Provide the issue number (e.g. 42)}`

---

## Steps

Follow every step in order. Do not skip any step.

### Step 1 — Read the issue

Retrieve the full issue content:

```bash
gh issue view ${input:issue} --json title,body,labels,assignees,milestone
```

Extract and retain:

- **Functional requirements**
- **Acceptance criteria**
- **Notes / technical hints**

These are the ground truth for the review. Every requirement and acceptance criterion must be verified.

---

### Step 2 — Identify modified files

Find all files changed relative to the base branch:

```bash
git diff develop...HEAD --name-only
```

Group the changed files by type:

- Source files (components, hooks, services, pages, layouts)
- Type definitions
- Styles
- Tests
- Configuration and documentation

---

### Step 3 — Read the changed files

Read every modified source file in full. Do not skip any file from Step 2.

Also read the following for context:

- Related existing files the changed code depends on (e.g. shared components, hooks, API services)
- Existing test files for the same feature to compare style and coverage
- i18n locale files if user-facing strings were added or changed

---

### Step 4 — Verify requirements and acceptance criteria

For each functional requirement and acceptance criterion extracted in Step 1, determine whether the implementation satisfies it.

Mark each item as one of:

- **Satisfied** — the code clearly implements the requirement
- **Partial** — the code partially addresses it but something is missing
- **Missing** — the requirement is not implemented
- **Not verifiable** — cannot be determined from static analysis alone

---

### Step 5 — Review code quality

Evaluate the changed files across the following dimensions. For each issue found, note the file name, a brief description of the problem, and a suggested fix.

#### Correctness

- Does the logic implement the intended behavior?
- Are there off-by-one errors, wrong conditions, or incorrect data transformations?
- Are async operations awaited correctly?

#### TypeScript typing

- Are types explicit and accurate? Avoid `any`.
- Are return types declared on functions, hooks, and service methods?
- Are component props typed with explicit interfaces? Avoid `any`.
- Are hook return types declared explicitly?
- Are API response shapes typed correctly in service files?

#### Validation

- Are form inputs validated before submission (required fields, format, length)?
- Are edge case inputs (empty strings, null, unexpected values) handled gracefully?
- Are validation error messages clear and user-friendly?

#### Error handling

- Are API errors caught and surfaced as user-facing error states?
- Are loading and error states handled for every async operation?
- Are there uncaught promise rejections or missing `.catch` / `try/catch` blocks?

#### Duplication

- Is any logic duplicated across components, hooks, or service files that should be extracted into a shared utility?

#### Security

- Are protected routes guarded by the existing `ProtectedRoute` component?
- Is no sensitive data (tokens, passwords, secrets) logged to the console?
- Are user inputs sanitized before being rendered to prevent XSS?

#### Edge cases

- Are edge cases from the issue notes handled?
- Are concurrent operation scenarios considered (e.g. duplicate resource creation)?
- Are missing or deleted related records handled gracefully?

#### Architecture consistency

- Do new files follow the same naming and structural conventions as existing files?
- Are new components placed in the correct directory (`components/ui/`, `features/*/components/`, etc.)?
- Are new features exported through the feature `index.ts`?
- Are new i18n keys added to `src/lib/i18n/locales/en.json`?

---

### Step 6 — Produce the review report

Output the review report using **exactly** the following structure:

---

## Review Report

### Requirements Coverage

List each requirement and acceptance criterion from the issue with its status:

| #   | Requirement | Status                                         |
| --- | ----------- | ---------------------------------------------- |
| 1   | …           | Satisfied / Partial / Missing / Not verifiable |
| 2   | …           | …                                              |

---

### Issues Found

List all problems detected. If no issues were found, write `No issues found.`

For each issue, include:

- **File**: the file where the issue occurs
- **Severity**: `high` / `medium` / `low`
- **Description**: what is wrong
- **Suggestion**: how to fix it

---

### Suggested Improvements

List recommended non-blocking improvements (code quality, naming, minor design suggestions). If none, write `No suggestions.`

---

### Final Verdict

```
Ready for PR
```

or

```
Needs changes before PR
```

Use `Ready for PR` only if:

- All acceptance criteria are satisfied
- No `high` severity issues remain
- No `medium` severity issues remain

Use `Needs changes before PR` otherwise. State the reason briefly below the verdict.

---

## Constraints

- Do not modify any files during the review.
- Do not create commits, push branches, or open pull requests.
- Base all findings on the actual code — do not invent issues.
- Every issue listed must include a concrete suggestion.
- The Final Verdict must be either `Ready for PR` or `Needs changes before PR` — no other values.
- Do not approve a PR if any acceptance criterion from the issue is missing or partial.
