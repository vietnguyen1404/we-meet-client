---
description: Implement a feature from an approved implementation plan. Reads the plan file as the primary source, explores the codebase, writes code following existing patterns, and runs lint and tests. Does not perform any Git operations.
agent: agent
tools:
  - execute
  - read
  - search
  - edit
argument-hint: <issue number>
---

# Implement Feature

## Backend API Source of Truth

The backend API contract is defined in the backend repository documentation.

**Location:** `../we-meet-server/docs/`

These documents define:

- REST endpoints (method, path, request/response shape)
- Request payloads and response payloads
- Authentication requirements per endpoint
- WebSocket events, event names, and payload shapes _(if applicable)_

The backend documentation is the **single source of truth** for all API contracts. The agent must never invent endpoints, payload fields, or response structures. If a document cannot be found, re-search `../we-meet-server/docs/` before making any assumption.

---

## API Layer Rule

All API calls must be implemented in the API service layer:

```
src/features/<feature>/services/<feature>.service.ts
```

Or, for shared/cross-feature calls:

```
src/api/
├── meetings.api.ts
├── auth.api.ts
└── ...
```

**Components must never call backend endpoints directly.** They must use functions exported from the service or API layer.

---

## Input

The GitHub issue to implement: `${input:issue:Provide the issue number (e.g. 42)}`

---

## Steps

Follow every step in order. Do not skip any step.

### Step 0 — Read backend API documentation

**Run this step before implementing any feature that interacts with the backend (REST API or WebSocket). Skip only if the plan is confirmed as frontend-only with zero backend API calls.**

1. Explore the backend docs folder:

   ```bash
   ls ../we-meet-server/docs/
   ```

2. Search for documentation files relevant to the feature (by resource name, route path, or event name from the issue title/description).

3. Read the relevant files and extract:
   - **HTTP method** and **endpoint path** for each endpoint
   - **Request payload** — field names, types, required vs optional
   - **Response payload** — shape, field names, types
   - **Authentication requirements** — Bearer token, roles, guards
   - **WebSocket events** — event names and payload shapes _(if applicable)_

4. Retain this information. It supersedes anything in the plan file's API Contract section if there is a conflict — the live backend docs are always authoritative.

> Never guess API contracts. If documentation is missing or unclear, note it explicitly in the Step 7 follow-up report.

---

### Step 1 — Read the issue

Retrieve the issue for context only:

```bash
gh issue view ${input:issue} --json title,body,labels,assignees,milestone
```

Extract and retain:

- **Title**
- **Functional requirements**
- **Acceptance criteria**
- **Notes / technical hints**

The issue provides **context only**. Implementation tasks must come from the plan file (Step 2), not directly from the issue.

---

### Step 2 — Read the implementation plan (primary source)

The plan file is the **primary source of implementation tasks**. Look for it in the following locations in order:

1. `.github/plans/WM-<issue-number>.md`
2. Any `.md` file inside `.github/plans/`

**If no plan file exists, stop immediately** and instruct the user to run the `plan-feature` prompt first before continuing.

Extract and retain all sections present in the plan:

- **Feature Type** — `Frontend`, `Backend`, or `Full-Stack`
- **Technical design** — affected modules, architecture decisions, API endpoints, component hierarchy
- **API Contract** — endpoint definitions, request/response shapes, WebSocket event names and payloads _(if present)_
- **UI Architecture** — screen name, component tree, UI states, interaction flows _(if present)_
- **Implementation order** — the exact sequence of steps to follow
- **Task checklist** — every item to implement, grouped by layer

Do not implement anything not present in the plan file. The plan is the contract.

---

### Step 3 — Explore the codebase

Before writing any code, read the relevant parts of the codebase. Do not skip this step.

Search for and read based on the **Feature Type** from the plan.

**For Frontend and Full-Stack features:**

- Existing pages, routes, and layouts related to the feature
- Shared UI components () and design system usage
- Shared layout components ()
- State management hooks (React Query, Zustand, Context)
- API client wrappers and service layers (`src/features/*/services/`, `src/api/`)
- Form handling and validation patterns
- Error and loading state patterns in existing pages
- Existing hooks and reusable utilities
- The existing API service pattern to understand how endpoints are called and how errors are handled

**For Backend and Full-Stack features:**

- Existing module structure and how modules are registered
- Existing controllers and service patterns
- DTO and validation patterns in use
- WebSocket gateway patterns (if the plan includes WebSocket events)
- Database repository or ORM usage patterns
- Authentication and authorisation patterns

Use this context to ensure every new file and change is consistent with the existing architecture.

---

### Step 4 — Implement the feature

Implement tasks **strictly following the implementation order from the plan file**. Complete each task from the checklist sequentially before moving to the next.

**API implementation rules** _(apply to every API call, regardless of Feature Type)_:

- Always use the endpoint paths, request fields, response shapes, and WebSocket event names read from `../we-meet-server/docs/` in Step 0 — never guess or invent them
- Match request body field names and types **exactly** as documented
- Match response structure **exactly** — do not assume fields not present in the docs
- Place all API call implementations in `src/features/<feature>/services/` or `src/api/` — never inside components or hooks directly
- Components must consume API functions exported from the service layer; never call `fetch`/`axios` directly inside a component

**General rules:**

- Follow existing file naming conventions (e.g. `feature.service.ts`, `useFeature.ts`, `FeaturePage.tsx`)
- Reuse existing shared UI components, hooks, and utilities — do not reinvent them
- Follow the existing API service pattern in `src/features/*/services/`
- Follow the existing error and loading state patterns found in the codebase
- Follow the existing i18n pattern for all user-facing strings
- Follow existing folder structure conventions; do not introduce new architectural patterns unless the plan explicitly requires it
- Do not modify files unrelated to the feature
- Do not remove or alter existing functionality
- Do not implement anything not in the plan

---

### Step 5 — Add or update tests

Add tests as required by the plan, based on the Feature Type.

**Frontend and Full-Stack features:**

- Add component tests for new React components
- Add hook tests for new custom hooks
- Test loading, error, and success states for async components

**Backend and Full-Stack features:**

- Add unit tests for new service methods
- Add integration or e2e tests for new API endpoints if similar tests already exist
- Test validation rules and error responses defined in the API Contract

**All features:**

- Do not delete existing tests
- Do not suppress or skip failing tests

---

### Step 6 — Run lint and tests

Run the following commands and fix all errors before finishing:

```bash
pnpm lint
pnpm type-check
```

If lint errors are found, fix them and re-run until the output is clean.

If tests fail, investigate and fix the root cause. Do not suppress or skip failing tests.

Do not proceed to Step 7 until both commands exit without errors.

---

### Step 7 — Finish

When the implementation is complete and lint and tests pass, report the following:

- **Feature Type** — `Frontend`, `Backend`, or `Full-Stack` as detected from the plan
- **Plan sections used** — list which sections were present and used (API Contract, UI Architecture, Implementation Order, etc.)
- **Implementation order followed** — list the steps from the plan’s Implementation Order in the sequence they were executed
- **Files created** — list every new file added
- **Files modified** — list every existing file changed
- **Implementation summary** — a brief description of what was implemented
- **Deviations** — any deviations from the plan that were required by existing codebase constraints, with justification
- **Follow-up tasks** — any known gaps, deferred decisions, or next steps; explicitly note any API contracts that were missing or unclear in `../we-meet-server/docs/`

**Do NOT perform any Git operations:**

- Do not create a branch
- Do not stage files
- Do not commit
- Do not push
- Do not create a pull request

---

## Constraints

- The **plan file is the primary source of truth** for implementation tasks. Do not implement features based on assumptions or the issue alone.
- The **backend documentation** at `../we-meet-server/docs/` is the single source of truth for all API contracts. It supersedes the plan file if they conflict.
- **Always read `../we-meet-server/docs/` before writing any API call** — never invent endpoint paths, request fields, response shapes, or WebSocket event names.
- **All API calls must live in the service/API layer** (`src/features/*/services/` or `src/api/`). Components must not call backend endpoints directly.
- Do not implement anything not present in the plan file.
- The **Feature Type** from the plan determines which layers to implement — never implement backend code for a Frontend feature or vice versa.
- For Full-Stack features, always complete backend layers before starting frontend integration.
- When the plan includes an **API Contract**, cross-reference it against `../we-meet-server/docs/` and use the backend docs as the final authority.
- When the plan includes a **UI Architecture**, use the component tree as the basis for implementation — do not copy code from design tools.
- Do not introduce new architectural patterns unless the plan explicitly requires it.
- Do not modify files unrelated to the feature.
- Do not remove, suppress, or skip existing tests.
- Always explore the codebase before writing code.
- Always follow existing architecture patterns found in the repository.
- Always fix lint and type-check errors before finishing.
- Never create a branch, commit, push, or open a pull request.
