# WeMeet Client - GitHub Copilot Instructions

**Project:** WeMeet Client  
**Technology Stack:** React 19 + TypeScript + Vite  
**Generated:** February 4, 2026

---

## Project Overview

WeMeet is a browser-based real-time video meeting application inspired by Google Meet. This client application is built as a modern Single Page Application (SPA) with:

- **Frontend Framework:** React 19 with React Compiler
- **Language:** TypeScript 5.9+ (strict mode)
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State Management:** Zustand (global) + TanStack Query (server state)
- **Real-time:** WebSocket + WebRTC
- **Package Manager:** pnpm

---

## Architecture Principles

### Feature-Based Modular Architecture

The project follows a feature-based structure with clear separation of concerns:

```
src/
├── features/          # Self-contained feature modules
│   ├── auth/         # Authentication
│   ├── meeting/      # Video meetings
│   ├── chat/         # In-meeting chat
│   └── profile/      # User profile
├── shared/           # Reusable UI components and utilities
├── lib/              # Infrastructure (HTTP, WebSocket, WebRTC)
└── config/           # Application configuration
```

**Key Rules:**

- Features are self-contained and isolated
- Features cannot import from other features
- Features can use `shared/` and `lib/`
- All cross-feature communication via shared state or events
- Each feature exports a public API through `index.ts`

---

## TypeScript Guidelines

### Strict Type Safety

- **Always use explicit types** for function parameters and return values
- **Avoid `any` type** - use `unknown` for truly unknown types
- **Use interfaces for object shapes** - use types for unions/intersections
- **Enable strict mode** - all strictness checks enabled in tsconfig.json

**Examples:**

```typescript
// ✅ Good: Explicit types
function createMeeting(data: CreateMeetingDto): Promise<Meeting> {
  // Implementation
}

// ❌ Bad: Implicit types
function createMeeting(data) {
  // Implementation
}

// ✅ Good: Interface for object
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good: Type for unions
type UserRole = "admin" | "user" | "guest";
```

### Naming Conventions

- **Interfaces:** PascalCase (e.g., `User`, `MeetingSettings`)
- **Types:** PascalCase (e.g., `UserRole`, `ApiResponse`)
- **Functions:** camelCase with verb (e.g., `createMeeting`, `getUserById`)
- **Variables:** camelCase (e.g., `userName`, `meetingId`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_PARTICIPANTS`, `API_URL`)
- **Components:** PascalCase (e.g., `MeetingRoom`, `LoginForm`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth`, `useMeeting`)
- **Files (components):** PascalCase (e.g., `MeetingRoom.tsx`)
- **Files (utils):** camelCase (e.g., `formatters.ts`)

---

## React Guidelines

### Component Structure

**Use function components only** (no class components):

```typescript
interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (id: string) => void;
}

export const MeetingCard = ({ meeting, onJoin }: MeetingCardProps) => {
  return (
    <div className="meeting-card">
      <h3>{meeting.title}</h3>
      <button onClick={() => onJoin(meeting.id)}>Join</button>
    </div>
  );
};
```

### Hooks Rules

- **Call hooks at the top level** (not in conditions or loops)
- **Custom hooks start with `use`**
- **Complete dependency arrays** in useEffect/useCallback/useMemo
- **Cleanup functions** in useEffect when needed

### State Management

- **Zustand for global client state** (auth, settings, current meeting)
- **TanStack Query for server state** (API data, caching, mutations)
- **useState for local component state**
- **Context API for feature-scoped state** (when needed)

**Do not:**

- Put server data in Zustand (use React Query)
- Put local UI state in global stores
- Create circular dependencies between stores

---

## Styling Guidelines

### Tailwind CSS

- **Use utility classes** for styling
- **Use `cn()` utility** for conditional classes
- **Responsive design** with mobile-first approach
- **Custom components** in `@layer components` for reusable patterns

```typescript
import { cn } from "@/shared/utils/cn";

<button
  className={cn(
    "px-4 py-2 rounded-lg transition-colors",
    isPrimary ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>;
```

### shadcn/ui Components

- Components are copied into `src/shared/components/ui/`
- **Fully customizable** with Tailwind
- **Accessibility-first** (built on Radix UI)
- Import from `@/shared/components/ui/[component]`

---

## Code Organization

### Import Order

1. External dependencies (React, third-party libraries)
2. Internal absolute imports (`@/features`, `@/shared`, `@/lib`)
3. Relative imports (`./`, `../`)
4. Styles (if any)

```typescript
// 1. External
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal absolute
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";

// 3. Relative
import { useMeeting } from "./hooks/useMeeting";
import type { Meeting } from "./types/meeting.types";
```

### File Structure

- **One component per file**
- **Colocate related files** (components, hooks, services, types)
- **Export public API** via `index.ts` in each feature
- **Tests in `__tests__/` directories**

---

## API & Data Fetching

### Service Layer Pattern

```typescript
// services/meetingApi.ts
export const meetingApi = {
  getMeetings: () => httpClient.get<Meeting[]>("/meetings"),
  getMeeting: (id: string) => httpClient.get<Meeting>(`/meetings/${id}`),
  createMeeting: (data: CreateMeetingDto) =>
    httpClient.post<Meeting>("/meetings", data),
};

// hooks/useMeetings.ts
export const useMeetings = () => {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: meetingApi.getMeetings,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: meetingApi.createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
};
```

---

## Testing Standards

### Testing Stack

- **Vitest** for unit and integration tests
- **Testing Library** for React component tests
- **Playwright** for E2E tests

### Test Structure

```typescript
describe("MeetingCard", () => {
  it("should call onJoin when button is clicked", () => {
    const onJoin = vi.fn();
    const meeting = { id: "1", title: "Test" };

    render(<MeetingCard meeting={meeting} onJoin={onJoin} />);

    const button = screen.getByRole("button", { name: /join/i });
    fireEvent.click(button);

    expect(onJoin).toHaveBeenCalledWith("1");
  });
});
```

### Test Coverage

- **Unit tests** for business logic and custom hooks
- **Integration tests** for component interactions
- **E2E tests** for critical user flows

---

## Error Handling

### Custom Error Classes

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super("AUTH_ERROR", message, 401);
  }
}
```

### Error Boundaries

- Use React Error Boundaries for component errors
- Log errors to monitoring service (Sentry)
- Provide user-friendly error messages

---

## Performance Best Practices

### React Optimization

- **React.memo** for expensive components
- **useMemo** for expensive calculations
- **useCallback** for stable function references
- **Code splitting** with React.lazy for routes
- **Virtual scrolling** for large lists

### Bundle Optimization

- **Tree shaking** enabled by Vite
- **Code splitting** by route
- **Vendor chunking** for better caching
- **Dynamic imports** for heavy features

---

## Security Guidelines

### Input Validation

- **Validate all user inputs** with Zod schemas
- **Sanitize HTML** before rendering (use DOMPurify if needed)
- **Never trust client data** - validate on backend too

### Authentication

- **Access tokens** in memory only (not localStorage)
- **Refresh tokens** in httpOnly cookies (backend sets)
- **HTTPS only** for all communication
- **JWT with expiration** for authentication

### XSS Prevention

- React escapes by default (safe)
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Sanitize any user-generated HTML content

---

## Documentation Standards

### Code Comments

- **Use JSDoc** for public functions and complex logic
- **Explain why, not what** - code should be self-explanatory
- **TODO comments** with assignee and date
- **Update comments** when code changes

### Component Documentation

- **Props interface** with descriptive types
- **Usage examples** in comments or Storybook
- **Edge cases** documented

---

## Git & Version Control

### Commit Messages

Format: `<type>(<scope>): <subject>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

```
feat(auth): add Google OAuth login
fix(meeting): resolve video freeze on network change
docs(readme): update setup instructions
refactor(chat): extract message logic to hook
```

### Branch Naming

Format: `<type>/<short-description>`

Examples:

```
feat/google-oauth-login
fix/video-freeze-issue
refactor/meeting-hooks
```

---

## Common Patterns

### Adding a New Feature

1. Create feature directory: `src/features/[feature-name]`
2. Define types in `types/[feature].types.ts`
3. Implement services in `services/[feature]Service.ts`
4. Create hooks in `hooks/use[Feature].ts`
5. Build components in `components/`
6. Export public API via `index.ts`
7. Add tests in `__tests__/`
8. Update documentation

### API Integration

1. Define types (request/response DTOs)
2. Create API service functions
3. Create React Query hooks
4. Use hooks in components
5. Handle loading and error states
6. Add tests

---

## Anti-Patterns to Avoid

❌ **Don't:**

- Import from other features directly
- Put business logic in components
- Mutate state directly
- Use `any` type
- Skip dependency arrays in hooks
- Forget cleanup in useEffect
- Inline functions in JSX (creates new functions each render)
- Store sensitive data in localStorage
- Skip error handling
- Duplicate code

✅ **Do:**

- Follow feature isolation
- Separate concerns (presentation, logic, data)
- Use immutable updates
- Use specific types
- Complete dependency arrays
- Clean up side effects
- Use useCallback for stable references
- Store tokens securely
- Handle errors gracefully
- Extract reusable code

---

## Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the client:

```bash
VITE_API_URL=https://api.wemeet.com
VITE_WS_URL=wss://ws.wemeet.com
VITE_WEBRTC_STUN_URL=stun:stun.wemeet.com:3478
```

Access via `import.meta.env.VITE_*`

---

## Build & Deployment

### Development

```bash
pnpm dev          # Start dev server
pnpm lint         # Run ESLint
pnpm typecheck    # Type checking
pnpm test         # Run tests
```

### Production

```bash
pnpm build        # Build for production
pnpm preview      # Preview production build
```

Deployment: Vercel, Netlify, or CloudFlare Pages

---

## Resources

- [Architecture Documentation](/docs/architecture.md)
- [Tech Stack Documentation](/docs/tech-stack.md)
- [Folder Structure Documentation](/docs/folder-structure.md)
- [Coding Standards](/docs/coding-standards.md)
- [React 19 Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

## Getting Help

When working with GitHub Copilot on this project:

1. **Reference these instructions** for project-specific guidance
2. **Check documentation** in `/docs` folder for detailed information
3. **Follow established patterns** in existing code
4. **Ask for clarification** if uncertain about architectural decisions
5. **Suggest improvements** when you see opportunities

---

**Remember:** Consistency is key. When in doubt, follow existing patterns in the codebase and refer to the documentation.

---

**Generated:** February 4, 2026  
**Last Updated:** February 4, 2026  
**Version:** 1.0
