# WeMeet Client - Coding Standards & Best Practices

**Generated:** February 4, 2026  
**Version:** 1.0  
**Technology:** React 19 + TypeScript

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Core Principles](#2-core-principles)
3. [TypeScript Conventions](#3-typescript-conventions)
4. [React Conventions](#4-react-conventions)
5. [State Management](#5-state-management)
6. [Styling Conventions](#6-styling-conventions)
7. [API & Data Fetching](#7-api--data-fetching)
8. [Testing Standards](#8-testing-standards)
9. [Error Handling](#9-error-handling)
10. [Code Organization](#10-code-organization)
11. [Performance Best Practices](#11-performance-best-practices)
12. [Security Guidelines](#12-security-guidelines)
13. [Code Examples](#13-code-examples)
14. [Anti-Patterns to Avoid](#14-anti-patterns-to-avoid)
15. [Git & Version Control](#15-git--version-control)
16. [Code Review Checklist](#16-code-review-checklist)

---

## 1. Introduction

### Purpose

This document establishes coding standards and best practices for the WeMeet Client project. Following these conventions ensures:

- **Consistency:** Code looks like it was written by one person
- **Maintainability:** Easy to understand and modify
- **Quality:** Fewer bugs and better performance
- **Collaboration:** Smooth teamwork and code reviews

### Scope

These standards apply to:

- All TypeScript and React code in the project
- Configuration files
- Tests
- Documentation

### Enforcement

- **Automated:** ESLint, TypeScript compiler, Prettier
- **Manual:** Code review process
- **Continuous:** Regular updates as the project evolves

---

## 2. Core Principles

### 2.1 SOLID Principles

**Single Responsibility:** Each module does one thing well

```typescript
// ✅ Good: Single responsibility
const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString();
};

// ❌ Bad: Multiple responsibilities
const formatDateTime = (date: Date, includeTime: boolean): string => {
  return includeTime
    ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    : date.toLocaleDateString();
};
```

**Open/Closed:** Open for extension, closed for modification

```typescript
// ✅ Good: Extensible via props
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

// ❌ Bad: Hardcoded, not extensible
const Button = () => <button className="btn-primary">Click</button>;
```

**Dependency Inversion:** Depend on abstractions, not concretions

```typescript
// ✅ Good: Depends on interface
interface IApiClient {
  get<T>(url: string): Promise<T>;
}

const useData = (client: IApiClient) => {
  // Can inject any client implementation
};

// ❌ Bad: Depends on concrete implementation
const useData = () => {
  const data = axios.get("/data"); // Tightly coupled to axios
};
```

---

### 2.2 DRY (Don't Repeat Yourself)

```typescript
// ✅ Good: Reusable function
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Usage
const isValid1 = validateEmail(email1);
const isValid2 = validateEmail(email2);

// ❌ Bad: Duplicated logic
const isValid1 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email1);
const isValid2 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email2);
```

---

### 2.3 KISS (Keep It Simple, Stupid)

```typescript
// ✅ Good: Simple and clear
const isAdult = (age: number): boolean => age >= 18;

// ❌ Bad: Over-engineered
const isAdult = (age: number): boolean => {
  const adultAge = 18;
  const result = age >= adultAge ? true : false;
  return result;
};
```

---

## 3. TypeScript Conventions

### 3.1 Type Definitions

**Always use explicit types for function parameters and return values:**

```typescript
// ✅ Good: Explicit types
function createUser(name: string, age: number): User {
  return { id: generateId(), name, age };
}

// ❌ Bad: Implicit types
function createUser(name, age) {
  return { id: generateId(), name, age };
}
```

**Prefer interfaces for object shapes:**

```typescript
// ✅ Good: Interface for object shape
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Also good: Type for unions/intersections
type UserRole = "admin" | "user" | "guest";
type AuthenticatedUser = User & { token: string };
```

---

### 3.2 Naming Conventions

| Element                | Convention                   | Example                        |
| ---------------------- | ---------------------------- | ------------------------------ |
| **Interfaces**         | PascalCase, descriptive noun | `User`, `MeetingSettings`      |
| **Types**              | PascalCase                   | `UserRole`, `ApiResponse`      |
| **Enums**              | PascalCase                   | `MeetingStatus`                |
| **Functions**          | camelCase, verb              | `createMeeting`, `getUserById` |
| **Variables**          | camelCase                    | `userName`, `meetingId`        |
| **Constants**          | UPPER_SNAKE_CASE             | `MAX_PARTICIPANTS`, `API_URL`  |
| **Components**         | PascalCase                   | `MeetingRoom`, `LoginForm`     |
| **Hooks**              | camelCase, `use` prefix      | `useAuth`, `useMeeting`        |
| **Files (components)** | PascalCase                   | `MeetingRoom.tsx`              |
| **Files (utils)**      | camelCase                    | `formatters.ts`                |

---

### 3.3 Avoid `any` Type

```typescript
// ✅ Good: Specific types
function processData<T>(data: T[]): T[] {
  return data.filter((item) => item !== null);
}

// ✅ Good: Unknown for truly unknown types
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ Bad: Using 'any'
function processData(data: any): any {
  return data.filter((item: any) => item !== null);
}
```

---

### 3.4 Type Guards

```typescript
// ✅ Good: Type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}

// Usage
if (isUser(data)) {
  console.log(data.name); // TypeScript knows this is safe
}
```

---

### 3.5 Utility Types

```typescript
// Use built-in utility types
type PartialUser = Partial<User>; // All properties optional
type RequiredUser = Required<User>; // All properties required
type UserKeys = Pick<User, "id" | "name">; // Only specified properties
type UserWithoutEmail = Omit<User, "email">; // Exclude properties
type ReadonlyUser = Readonly<User>; // All properties readonly
```

---

## 4. React Conventions

### 4.1 Component Structure

**Function components only (no class components):**

```typescript
// ✅ Good: Function component with TypeScript
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

// ❌ Bad: Class component
class MeetingCard extends React.Component<MeetingCardProps> {
  render() {
    return <div>...</div>;
  }
}
```

---

### 4.2 Props Interface

**Always define props interface:**

```typescript
// ✅ Good: Props interface
interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
}: ButtonProps) => {
  return <button className={`btn-${variant}-${size}`}>{children}</button>;
};
```

---

### 4.3 Component Organization

**Order within component file:**

1. Imports
2. Types/Interfaces
3. Component definition
4. Helper functions (if needed)
5. Export

```typescript
// 1. Imports
import { useState, useEffect } from "react";
import { useMeeting } from "@/features/meeting";
import { Button } from "@/shared/components/ui/button";

// 2. Types
interface MeetingRoomProps {
  meetingId: string;
}

// 3. Component
export const MeetingRoom = ({ meetingId }: MeetingRoomProps) => {
  const [isReady, setIsReady] = useState(false);
  const { meeting, participants } = useMeeting(meetingId);

  useEffect(() => {
    // Setup logic
  }, [meetingId]);

  return (
    <div>
      <h1>{meeting?.title}</h1>
      <VideoGrid participants={participants} />
      <ControlBar />
    </div>
  );
};

// 4. Helper functions (if not exported)
const formatParticipantCount = (count: number): string => {
  return `${count} participant${count !== 1 ? "s" : ""}`;
};
```

---

### 4.4 Hooks Usage

**Rules:**

- Call hooks at the top level (not in conditions, loops)
- Custom hooks start with `use`
- Dependencies array must be complete

```typescript
// ✅ Good: Hooks at top level
const MyComponent = () => {
  const [count, setCount] = useState(0);
  const user = useAuth();

  useEffect(() => {
    // Effect logic
  }, [count]); // Complete dependencies

  return <div>{count}</div>;
};

// ❌ Bad: Hook in condition
const MyComponent = () => {
  if (condition) {
    const [count, setCount] = useState(0); // ❌ Error!
  }
};
```

---

### 4.5 Custom Hooks

```typescript
// ✅ Good: Reusable custom hook
export const useMeeting = (meetingId: string) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { data: meeting } = useMeetingQuery(meetingId);

  useEffect(() => {
    // Subscribe to participant updates
    const unsubscribe = wsClient.on("participant-joined", (participant) => {
      setParticipants((prev) => [...prev, participant]);
    });

    return unsubscribe;
  }, [meetingId]);

  const addParticipant = useCallback((participant: Participant) => {
    setParticipants((prev) => [...prev, participant]);
  }, []);

  return { meeting, participants, addParticipant };
};
```

---

### 4.6 Conditional Rendering

```typescript
// ✅ Good: Early return
const MeetingCard = ({ meeting }: MeetingCardProps) => {
  if (!meeting) {
    return <EmptyState message="No meeting found" />;
  }

  return <div>{meeting.title}</div>;
};

// ✅ Good: Ternary for simple conditions
const Status = ({ isActive }: { isActive: boolean }) => (
  <span className={isActive ? "active" : "inactive"}>
    {isActive ? "Online" : "Offline"}
  </span>
);

// ❌ Bad: Nested ternaries
const Status = ({ status }: { status: string }) => (
  <span>
    {status === "active" ? "Online" : status === "away" ? "Away" : "Offline"}
  </span>
);
```

---

## 5. State Management

### 5.1 Zustand Global State

```typescript
// ✅ Good: Zustand store
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    }
  )
);

// Usage in component
const MyComponent = () => {
  const { user, login, logout } = useAuthStore();
  // Or select specific field
  const user = useAuthStore((state) => state.user);
};
```

---

### 5.2 React Query (Server State)

```typescript
// ✅ Good: Query hook
export const useMeetings = () => {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await httpClient.get<Meeting[]>("/meetings");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ✅ Good: Mutation hook
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMeetingDto) => {
      const response = await httpClient.post<Meeting>("/meetings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
};
```

---

### 5.3 Local State

```typescript
// ✅ Good: useState for local state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormData>({
  title: "",
  description: "",
});

// ✅ Good: useReducer for complex state
interface State {
  count: number;
  step: number;
}

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "setStep"; step: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "decrement":
      return { ...state, count: state.count - state.step };
    case "setStep":
      return { ...state, step: action.step };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
```

---

## 6. Styling Conventions

### 6.1 Tailwind CSS

```tsx
// ✅ Good: Utility classes
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Click me
</button>

// ✅ Good: Conditional classes with cn() utility
import { cn } from '@/shared/utils/cn';

<button
  className={cn(
    'px-4 py-2 rounded-lg',
    isPrimary ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Click me
</button>

// ✅ Good: Responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

---

### 6.2 Custom CSS Classes

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ Good: Component layer for reusable styles */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}

/* ✅ Good: Utilities for project-specific needs */
@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent;
  }
}
```

---

## 7. API & Data Fetching

### 7.1 Service Layer

```typescript
// ✅ Good: Separate service file
// services/meetingApi.ts
export const meetingApi = {
  getMeetings: async (): Promise<Meeting[]> => {
    const response = await httpClient.get<Meeting[]>("/meetings");
    return response.data;
  },

  getMeeting: async (id: string): Promise<Meeting> => {
    const response = await httpClient.get<Meeting>(`/meetings/${id}`);
    return response.data;
  },

  createMeeting: async (data: CreateMeetingDto): Promise<Meeting> => {
    const response = await httpClient.post<Meeting>("/meetings", data);
    return response.data;
  },

  updateMeeting: async (
    id: string,
    data: UpdateMeetingDto
  ): Promise<Meeting> => {
    const response = await httpClient.patch<Meeting>(`/meetings/${id}`, data);
    return response.data;
  },

  deleteMeeting: async (id: string): Promise<void> => {
    await httpClient.delete(`/meetings/${id}`);
  },
};
```

---

### 7.2 Error Handling

```typescript
// ✅ Good: Typed error handling
import { AxiosError } from "axios";

export const useMeetings = () => {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: meetingApi.getMeetings,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (
        error instanceof AxiosError &&
        error.response?.status &&
        error.response.status < 500
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Component usage
const MeetingList = () => {
  const { data, isLoading, error } = useMeetings();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
};
```

---

### 7.3 Loading States

```typescript
// ✅ Good: Explicit loading states
const MeetingRoom = ({ meetingId }: { meetingId: string }) => {
  const { data: meeting, isLoading, isError } = useMeeting(meetingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
        <span className="ml-2">Loading meeting...</span>
      </div>
    );
  }

  if (isError) {
    return <ErrorPage message="Failed to load meeting" />;
  }

  if (!meeting) {
    return <NotFound message="Meeting not found" />;
  }

  return <MeetingRoomContent meeting={meeting} />;
};
```

---

## 8. Testing Standards

### 8.1 Unit Tests

```typescript
// ✅ Good: Unit test
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  it("should return user when authenticated", () => {
    const mockUser = { id: "1", name: "John Doe" };
    const { result } = renderHook(() => useAuth());

    // Arrange
    act(() => {
      result.current.login(mockUser);
    });

    // Assert
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it("should clear user on logout", () => {
    const { result } = renderHook(() => useAuth());

    // Arrange
    act(() => {
      result.current.login({ id: "1", name: "John" });
    });

    // Act
    act(() => {
      result.current.logout();
    });

    // Assert
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

---

### 8.2 Component Tests

```typescript
// ✅ Good: Component test
import { render, screen, fireEvent } from "@testing-library/react";
import { MeetingCard } from "./MeetingCard";

describe("MeetingCard", () => {
  const mockMeeting = {
    id: "1",
    title: "Team Standup",
    startTime: new Date(),
  };

  it("should render meeting title", () => {
    render(<MeetingCard meeting={mockMeeting} onJoin={vi.fn()} />);
    expect(screen.getByText("Team Standup")).toBeInTheDocument();
  });

  it("should call onJoin when join button clicked", () => {
    const onJoin = vi.fn();
    render(<MeetingCard meeting={mockMeeting} onJoin={onJoin} />);

    const joinButton = screen.getByRole("button", { name: /join/i });
    fireEvent.click(joinButton);

    expect(onJoin).toHaveBeenCalledWith("1");
  });
});
```

---

### 8.3 Test Naming

```typescript
// ✅ Good: Descriptive test names
describe("useCreateMeeting", () => {
  it("should create meeting with valid data", async () => {});
  it("should return error when title is empty", async () => {});
  it("should invalidate meetings query on success", async () => {});
});

// ❌ Bad: Vague test names
describe("useCreateMeeting", () => {
  it("works", async () => {});
  it("test 1", async () => {});
});
```

---

## 9. Error Handling

### 9.1 Custom Errors

```typescript
// ✅ Good: Custom error classes
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

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super("VALIDATION_ERROR", message, 400);
  }
}
```

---

### 9.2 Error Boundaries

```typescript
// ✅ Good: Error boundary
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Error caught by boundary", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>;
```

---

### 9.3 Try-Catch

```typescript
// ✅ Good: Specific error handling
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await httpClient.get<User>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new AppError("USER_NOT_FOUND", "User not found", 404);
      }
      if (error.response?.status === 401) {
        throw new AuthenticationError();
      }
    }
    throw new AppError("UNKNOWN_ERROR", "An unexpected error occurred");
  }
};
```

---

## 10. Code Organization

### 10.1 Import Order

```typescript
// 1. External dependencies
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// 2. Internal absolute imports
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { httpClient } from "@/lib/httpClient";

// 3. Relative imports
import { useMeeting } from "./hooks/useMeeting";
import { MeetingCard } from "./components/MeetingCard";
import type { Meeting } from "./types/meeting.types";

// 4. Styles (if any)
import "./styles.css";
```

---

### 10.2 File Structure

```typescript
// ✅ Good: One component per file
// MeetingCard.tsx
export const MeetingCard = ({ meeting }: MeetingCardProps) => {
  return <div>...</div>;
};

// ❌ Bad: Multiple components in one file
// MeetingComponents.tsx
export const MeetingCard = () => {};
export const MeetingList = () => {};
export const MeetingDetails = () => {};
```

---

## 11. Performance Best Practices

### 11.1 React.memo

```typescript
// ✅ Good: Memoize expensive components
export const ParticipantTile = React.memo(
  ({ participant }: { participant: Participant }) => {
    return (
      <div className="participant-tile">
        <video autoPlay playsInline />
        <span>{participant.displayName}</span>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.participant.id === nextProps.participant.id &&
      prevProps.participant.videoEnabled === nextProps.participant.videoEnabled
    );
  }
);
```

---

### 11.2 useMemo & useCallback

```typescript
// ✅ Good: Memoize expensive calculations
const VideoGrid = ({ participants }: { participants: Participant[] }) => {
  const gridLayout = useMemo(() => {
    return calculateOptimalGridLayout(participants.length);
  }, [participants.length]);

  const handleParticipantClick = useCallback((id: string) => {
    // Handle click
  }, []);

  return <div style={gridLayout}>...</div>;
};

// ❌ Bad: Recalculating on every render
const VideoGrid = ({ participants }: { participants: Participant[] }) => {
  const gridLayout = calculateOptimalGridLayout(participants.length); // ❌

  const handleParticipantClick = (id: string) => {}; // ❌ New function every render

  return <div style={gridLayout}>...</div>;
};
```

---

### 11.3 Code Splitting

```typescript
// ✅ Good: Lazy load routes
import { lazy, Suspense } from "react";

const MeetingRoomPage = lazy(() => import("./pages/MeetingRoomPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const router = createBrowserRouter([
  {
    path: "/meeting/:id",
    element: (
      <Suspense fallback={<Spinner />}>
        <MeetingRoomPage />
      </Suspense>
    ),
  },
]);
```

---

## 12. Security Guidelines

### 12.1 Input Validation

```typescript
// ✅ Good: Validate input
import { z } from "zod";

const CreateMeetingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  startTime: z.date().min(new Date()),
});

const createMeeting = (data: unknown) => {
  const validated = CreateMeetingSchema.parse(data);
  // Proceed with validated data
};
```

---

### 12.2 XSS Prevention

```typescript
// ✅ Good: React escapes by default
<div>{userInput}</div>

// ⚠️ Dangerous: dangerouslySetInnerHTML (use sparingly)
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

// ✅ Good: Sanitize if needed
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userHtml);
```

---

### 12.3 Authentication

```typescript
// ✅ Good: Secure token storage
// Store access token in memory only
// Store refresh token in httpOnly cookie (backend sets)

// ❌ Bad: Store sensitive data in localStorage
localStorage.setItem("accessToken", token); // ❌ Vulnerable to XSS
```

---

## 13. Code Examples

### 13.1 Complete Feature Example

```typescript
// features/meeting/types/meeting.types.ts
export interface Meeting {
  id: string;
  title: string;
  hostId: string;
  startTime: Date;
  participants: Participant[];
}

export interface CreateMeetingDto {
  title: string;
  startTime: Date;
}

// features/meeting/services/meetingApi.ts
export const meetingApi = {
  getMeetings: () => httpClient.get<Meeting[]>("/meetings"),
  createMeeting: (data: CreateMeetingDto) =>
    httpClient.post<Meeting>("/meetings", data),
};

// features/meeting/hooks/useMeetings.ts
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

// features/meeting/components/MeetingList.tsx
export const MeetingList = () => {
  const { data: meetings, isLoading, error } = useMeetings();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {meetings?.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
};
```

---

## 14. Anti-Patterns to Avoid

### 14.1 Prop Drilling

```typescript
// ❌ Bad: Prop drilling through multiple levels
<GrandParent>
  <Parent user={user}>
    <Child user={user}>
      <GrandChild user={user} />
    </Child>
  </Parent>
</GrandParent>;

// ✅ Good: Use Context or global state
const UserContext = createContext<User | null>(null);

<UserContext.Provider value={user}>
  <GrandParent>
    <Parent>
      <Child>
        <GrandChild />
      </Child>
    </Parent>
  </GrandParent>
</UserContext.Provider>;
```

---

### 14.2 Directly Mutating State

```typescript
// ❌ Bad: Direct mutation
const addParticipant = (participant: Participant) => {
  participants.push(participant); // ❌ Mutating array
  setParticipants(participants);
};

// ✅ Good: Immutable update
const addParticipant = (participant: Participant) => {
  setParticipants((prev) => [...prev, participant]);
};
```

---

### 14.3 Missing Cleanup in useEffect

```typescript
// ❌ Bad: No cleanup
useEffect(() => {
  wsClient.on("message", handleMessage);
}, []);

// ✅ Good: Cleanup function
useEffect(() => {
  const unsubscribe = wsClient.on("message", handleMessage);
  return () => unsubscribe(); // Cleanup
}, []);
```

---

### 14.4 Inline Functions in JSX

```typescript
// ❌ Bad: Inline function (creates new function each render)
<button onClick={() => handleClick(item.id)}>Click</button>

// ✅ Good: useCallback for stable reference
const handleItemClick = useCallback((id: string) => {
  handleClick(id);
}, []);

<button onClick={() => handleItemClick(item.id)}>Click</button>

// ✅ Even better: If possible, pass directly
<button onClick={handleClick}>Click</button>
```

---

## 15. Git & Version Control

### 15.1 Commit Messages

**Format:** `<type>(<scope>): <subject>`

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**

```
feat(auth): add login with Google OAuth
fix(meeting): resolve video freeze on network change
docs(readme): update setup instructions
refactor(chat): extract message logic to hook
test(meeting): add tests for participant join flow
chore(deps): update React to 19.2
```

---

### 15.2 Branch Naming

**Format:** `<type>/<short-description>`

**Examples:**

```
feat/google-oauth-login
fix/video-freeze-issue
refactor/meeting-hooks
docs/api-documentation
```

---

### 15.3 Pull Request Guidelines

**PR Title:** Same as commit message format

**PR Description Template:**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist

- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

---

## 16. Code Review Checklist

### For Authors

- [ ] Code follows conventions in this document
- [ ] All tests pass (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] Self-reviewed changes
- [ ] Added/updated tests
- [ ] Updated documentation

---

### For Reviewers

**Functionality:**

- [ ] Code does what it's supposed to do
- [ ] Edge cases handled
- [ ] Error handling appropriate

**Code Quality:**

- [ ] Follows coding conventions
- [ ] No code duplication
- [ ] Functions are small and focused
- [ ] Naming is clear and descriptive

**Performance:**

- [ ] No unnecessary re-renders
- [ ] Appropriate use of memo/useMemo/useCallback
- [ ] No memory leaks (cleanup in useEffect)

**Security:**

- [ ] Input validation present
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization checks

**Testing:**

- [ ] Adequate test coverage
- [ ] Tests are meaningful
- [ ] Tests pass

---

## Conclusion

These coding standards are living documents that will evolve with the project. Team members are encouraged to:

- **Follow** these conventions in all code
- **Suggest** improvements through pull requests
- **Discuss** ambiguities in team meetings
- **Update** standards as we learn and grow

**Remember:** Consistency is more important than perfection. When in doubt, discuss with the team.

---

**Generated:** February 4, 2026  
**Last Updated:** February 4, 2026  
**Version:** 1.0
