---
description: Generate a developer-ready technical implementation plan from an existing GitHub issue.
agent: agent
tools:
  - execute
  - web/githubRepo
  - read
  - search
  - stitch
argument-hint: <issue number, issue URL, or paste issue content>
---

# Plan Feature from GitHub Issue

## Input

The GitHub issue to plan: `${input:issue:Provide an issue number (e.g. 42), a URL, or paste the issue content}`

---

## Steps

Follow every step in order. Do not skip any step.

### Step 1 — Read the issue

The GitHub issue is the **primary source of requirements**. Retrieve its full content.

- If the input is an **issue number** (e.g. `42`), run:
  ```bash
  gh issue view 42 --json title,body,labels,assignees,milestone
  ```
- If the input is an **issue URL**, extract the number from the URL and run the same command.
- If the input is **pasted issue content**, use it directly.

Extract the following from the issue:

- **Title**
- **Description / background**
- **User story** (if present)
- **Functional requirements** (if present)
- **Acceptance criteria** (if present)
- **Notes / technical hints** (if present)

---

### Step 1a — Detect feature type

Analyze the issue content extracted in Step 1 and classify the feature as one of:

| Type | Label |
| --- | --- |
| Frontend only | `Frontend` |
| Backend only | `Backend` |
| Frontend + Backend | `Full-Stack` |

**Frontend indicators:** UI screens, pages, components, forms, navigation, user interactions, state management, styling, layout, client-side validation.

**Backend indicators:** API endpoints, database changes, authentication logic, authorization rules, background jobs, WebSocket gateways, service modules, data migrations.

**Classification rules:**
- If **only** frontend indicators are present → `Frontend`
- If **only** backend indicators are present → `Backend`
- If **both** are present, or if the issue explicitly mentions integration between layers → `Full-Stack`

Store the result as **Feature Type** and use it throughout the rest of the steps to decide which plan sections to include.


### Step 1b — Retrieve UI reference (Stitch MCP)

Determine whether the issue involves a UI screen or visual interaction.

**Skip this step entirely if:**
- The issue is backend-only (no pages, components, forms, or user-facing states mentioned)
- There is no relevant screen in Stitch

**If the issue involves a UI screen:**

Search Stitch MCP for the relevant screen or design using keywords from the issue title or description.

Extract the following from the design:

- **Screen purpose** — what the screen does and who uses it
- **Layout structure** — overall page layout (sidebar, header, main content area, etc.)
- **Component hierarchy** — the visual nesting of elements on screen
- **Form inputs / UI controls** — all input fields, buttons, toggles, selects
- **Interaction flows** — user actions and resulting transitions (clicks, submits, navigation)
- **UI states** — which versions of the screen exist (loading, empty, error, success)

Store this information for use in section **4. UI Architecture** of the plan.

> If no matching screen is found in Stitch, skip this step and omit section 4 from the plan.

---
### Step 2 — Clarify technical gaps (if needed)

If the issue lacks information needed to produce a complete technical plan, ask clarifying questions before continuing.

Ask **at most 4 questions per round**. Use at most **2 rounds**. Stop once enough context exists.

**Round 1** — ask only what is missing:

1. Are there technical constraints such as performance requirements, security rules, or platform limitations?
2. Where does responsibility sit — is this backend-only, frontend-only, or full-stack?
3. Does this feature depend on other features, services, or third-party integrations?
4. Are there known edge cases or error scenarios the issue does not mention?

**Round 2** (only if still unclear after Round 1):

1. Are there UI/UX specifications or a design reference to follow?
2. What access-control or permission rules apply to this feature?
3. Are there data migration or backward-compatibility concerns?
4. Is there a target timeline or scope constraint that limits what can be built?

---

### Step 3 — Explore the codebase

Search the existing codebase to understand the relevant architecture before designing.

**If the feature is Frontend or Full-Stack, look for:**
- Existing pages, routes, and layouts
- Shared UI components and design system usage
- State management patterns (React Query, Zustand, Context, etc.)
- API client utilities or service layers
- Form handling and validation patterns
- Error and loading state patterns
- Existing hooks or reusable utilities

**If the feature is Backend or Full-Stack, look for:**
- Existing API endpoints and routing conventions
- Service layer patterns and business logic organisation
- Authentication and authorisation patterns in use
- Database schema and query patterns
- Error handling and response format conventions
- Test structure for existing services and endpoints

Use this context to ground every technical decision in the plan.

---

### Step 4 — Produce the plan

Using the issue content and codebase findings, generate an implementation plan with **exactly** the following sections in this order. Do not add or remove sections.

---

### 1. Feature Summary

Explain briefly what the feature does (2–3 sentences).

---

### 2. Problem Statement

Explain the problem the feature solves and why it matters.

---

### 3. Feature Type

State the detected feature type from Step 1a:

**Feature Type:** `Frontend` / `Backend` / `Full-Stack` _(choose one)_

Briefly justify the classification in one sentence based on the issue content.


### 4. Technical Design

Describe the architecture and implementation approach grounded in the existing codebase patterns found in Step 3.

Include only the sub-sections relevant to the **Feature Type** detected in Step 1a.

#### Frontend _(include for Frontend and Full-Stack features)_

- Pages or routes to create or modify
- UI components to build or extend
- Component hierarchy and composition
- User interactions and UI state transitions
- Form handling and validation
- Loading, empty, and error states

#### Backend _(include for Backend and Full-Stack features)_

- Services to create or modify and their responsibilities
- API endpoints to expose (method, path, purpose)
- Authentication and authorisation requirements
- Validation rules and error handling approach

#### State Management _(if applicable)_

- How client-side state will be stored or managed
- Updates to existing state stores, hooks, or contexts
- Caching or data synchronization strategies

#### Performance Considerations _(if relevant)_

- Lazy loading and code splitting
- Memoization strategies
- Avoiding unnecessary re-renders

#### Realtime / External Services _(if applicable)_

- WebSocket events or third-party API integrations

---

### 5. UI Architecture

> Include this section only if a UI screen was retrieved in Step 1b. Omit it entirely for backend-only features.

Translate the Stitch design into a React component architecture grounded in the existing codebase.

**Rules:**
- The Stitch design is a **visual reference only** — never copy raw code generated by Stitch
- Translate the design into components using the repository's existing architecture and conventions
- Prefer existing shared components from `src/components/ui/` before creating new ones
- Follow the Tailwind CSS styling conventions used in the repo
- Follow the BEM + Tailwind conventions from the project's styling standards

**Screen:** `<screen name from Stitch>`

**Component Tree:**

```
<ScreenPage>
 ├─ <LayoutComponent>
 │   ├─ <HeaderComponent>
 │   └─ <MainContent>
 │       ├─ <ReusableComponent />
 │       └─ <ControlComponent />
 └─ <FooterOrActions>
```

**UI States:**

| State | Description | Component behaviour |
| --- | --- | --- |
| Loading | ... | Show spinner / skeleton |
| Empty | ... | Show empty state message |
| Error | ... | Show error card with retry |
| Success | ... | Show populated content |

**Interaction Flows:**

Describe each user interaction and the resulting UI transition (e.g. button click → modal open, form submit → loading → success/error state).

---

### 6. API Contract

> Include this section for Backend and Full-Stack features. Omit it for Frontend-only features.

Define the API interface between frontend and backend so both sides can be implemented independently.

**For REST endpoints**, use the following format for each endpoint:

```
<METHOD> <path>

Auth: <required / not required> — <guard or mechanism>

Request body:
{
  "<field>": "<type>  // <description>"
}

Response (200):
{
  "<field>": "<type>"
}

Error responses:
- 400 Bad Request — <when>
- 401 Unauthorized — <when>
- 404 Not Found — <when>
```

**For WebSocket events**, use the following format for each event:

```
Event: <event-name>
Direction: client → server | server → client | server → room

Payload:
{
  "<field>": "<type>"
}

Behaviour: <what triggers it and what happens>
```


### 7. Edge Cases

List potential edge cases the implementation must handle gracefully:

- Invalid or unexpected input
- Missing or null data
- Permission and role-based access issues
- Concurrency or race conditions
- Any additional edge cases derived from the issue or codebase context

---

### 8. Implementation Plan

Provide a high-level, sequenced technical implementation plan a developer can follow from start to finish. Each step should describe **what** to do, not show code.

---

### 9. Implementation Order

List the **exact order** developers should implement the steps. Use a numbered list derived from the feature type.

**Example — Backend feature:**

1. Define or update database schema
2. Implement service layer and business logic
3. Implement controller endpoints
4. Add validation, guards, and error handling
5. Write unit and integration tests

**Example — Frontend feature:**

1. Install dependencies or update configuration
2. Add shared UI components or design tokens
3. Create or update API service hooks
4. Build page-level components and wire up routes
5. Add state management hooks or store updates
6. Handle loading, empty, and error states
7. Write component tests

**Example — Full-Stack feature:**

1. Agree on the API contract (section 6 of this plan)
2. Implement backend service and endpoint
3. Add validation, guards, and tests for the backend
4. Implement frontend API service hook
5. Build UI components and page
6. Wire up state management and error handling
7. Write end-to-end or integration tests

---

### 10. Task Breakdown

A GitHub-style checklist derived from the implementation order. Group tasks by layer. Only include groups that apply to the feature type.

**Backend** _(Backend and Full-Stack features only)_

- [ ] …

**Frontend** _(Frontend and Full-Stack features only)_

- [ ] …

**Shared / Cross-cutting**

- [ ] …

**Testing**

- [ ] …

---

### Step 5 — Save the plan

Write the generated plan to the repository so it can be referenced by the `implement-feature` prompt.

1. Determine the **issue identifier** extracted in Step 1.
   - If the issue title or identifier contains a ticket ID (for example `WM-1`, `WM-2`, etc.), use that ID.
   - Otherwise fall back to the GitHub issue number.

2. Ensure the `.github/plans` directory exists:

```bash
mkdir -p .github/plans
```

3. Generate the filename using the issue identifier:

```
.github/plans/WM-<issue-id>.md
```

Examples:

```
.github/plans/WM-1.md
.github/plans/WM-2.md
```

4. Write the complete plan (all sections from Step 4, in order) to that file.

   **Conditional sections:**
   - Section 5 (UI Architecture): include only if a UI screen was retrieved in Step 1b
   - Section 6 (API Contract): include only for Backend and Full-Stack features

Overwrite the file if it already exists.

5. Confirm the file was written by printing its path.

---

## Constraints

- The **GitHub issue is the single source of truth** for requirements. Do not invent requirements not stated or implied by the issue.
- Do not contradict or reinterpret acceptance criteria from the issue.
- Ground all technical decisions in the existing codebase patterns found in Step 3.
- Follow existing architecture patterns in the repository.
- Ask at most 2 clarification rounds with at most 4 questions each.
- Do not write implementation code — produce a technical plan only.
- The **plan file is the single source of truth** for both technical implementation and UI architecture.
- The Stitch design is a visual reference only — never copy raw Stitch-generated code into the plan.
- Always translate Stitch designs into component architecture using the repository's existing conventions.
- Prefer existing shared components before proposing new ones.
- The output must use the sections defined in Step 4, in order.
- Section 5 (UI Architecture) must be included when a Stitch screen was retrieved, and omitted otherwise.
- Section 6 (API Contract) must be included for Backend and Full-Stack features, and omitted for Frontend-only features.
- The Feature Type detected in Step 1a must drive which sub-sections appear in Technical Design, Implementation Order, and Task Breakdown.
- Do not create or suggest creating a pull request.
- The only permitted repository mutation is writing the plan file to `.github/plans/WM-<number>.md`. No other mutations (PR creation, commits, pushes) are allowed.
- The plan must be specific enough that a developer can start implementation immediately without further clarification.
