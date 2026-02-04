# WeMeet Client - Architecture Documentation

**Generated:** February 4, 2026  
**Version:** 1.0  
**Status:** Draft

---

## Table of Contents

1. [Project Requirements & Overview](#1-project-requirements--overview)
2. [Architectural Overview](#2-architectural-overview)
3. [Architecture Visualization](#3-architecture-visualization)
4. [Core Architectural Components](#4-core-architectural-components)
5. [Architectural Layers and Dependencies](#5-architectural-layers-and-dependencies)
6. [Data Architecture](#6-data-architecture)
7. [Cross-Cutting Concerns](#7-cross-cutting-concerns)
8. [Service Communication Patterns](#8-service-communication-patterns)
9. [React-Specific Architectural Patterns](#9-react-specific-architectural-patterns)
10. [Implementation Patterns](#10-implementation-patterns)
11. [Testing Architecture](#11-testing-architecture)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Extension and Evolution Patterns](#13-extension-and-evolution-patterns)
14. [Architectural Pattern Examples](#14-architectural-pattern-examples)
15. [Architectural Decision Records](#15-architectural-decision-records)
16. [Architecture Governance](#16-architecture-governance)
17. [Blueprint for Development](#17-blueprint-for-development)

---

## 1. Project Requirements & Overview

### Project Overview

**Name:** WeMeet Client  
**Purpose:** Browser-based real-time video meeting application inspired by Google Meet  
**Target Users:** End users seeking browser-based video conferencing with premium features  
**Key Business Objectives:**

- Provide seamless real-time audio/video communication
- Support secure user authentication and authorization
- Enable subscription-based premium (VIP) features
- Deliver a high-performance, scalable single-page application

**Usage Patterns:**

- Users create and join meeting rooms
- Real-time audio/video communication via WebRTC
- Chat and collaboration features
- Premium features: recording, HD video, increased participant limits

**Scalability & Performance Expectations:**

- Support hundreds of concurrent users per meeting server
- Sub-second latency for signaling operations
- Optimized rendering for 60fps video display
- Efficient state management for real-time updates

### Technical Requirements

**Primary Technology Stack:**

- **Framework:** React 19 (latest stable with React Compiler support)
- **Language:** TypeScript 5.9+
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **State Management:** Zustand (global), React Context (localized)
- **Data Fetching:** TanStack Query (React Query)
- **Package Manager:** pnpm

**Database & Persistence:**

- No direct database access (client-side application)
- Backend APIs for user data, meeting metadata, recordings
- Local storage for user preferences and session state
- IndexedDB for offline capabilities (future enhancement)

**Integration Requirements:**

- **WebRTC:** Direct peer-to-peer or SFU-mediated media connections
- **WebSocket:** Real-time signaling server connection
- **REST APIs:** User authentication, profile, subscription management
- **Third-party Services:**
  - Payment processing (Stripe/similar)
  - Cloud storage for recordings (AWS S3/similar)
  - Analytics (PostHog/Mixpanel)

**Deployment Environment:**

- Static hosting (Vercel, Netlify, CloudFlare Pages, AWS S3 + CloudFront)
- CDN distribution for global performance
- Environment-based configuration (dev, staging, production)

### Architectural Preferences

**Pattern:** Feature-based Modular Architecture with Clean Architecture principles

**Rationale:**

- **Feature-based organization** enables team scalability and clear ownership boundaries
- **Clean Architecture layers** ensure testability and separation of concerns
- **Component composition** leverages React's strengths
- **Unidirectional data flow** simplifies state reasoning

**Layer Organization:**

- **Presentation Layer:** React components (pages, features, shared UI)
- **Application Layer:** Hooks, state management, business logic
- **Domain Layer:** Business entities, rules, and types
- **Infrastructure Layer:** API clients, WebSocket, WebRTC, storage adapters

**Separation of Concerns:**

- UI components remain pure and presentational
- Business logic encapsulated in custom hooks and services
- External dependencies abstracted behind interfaces
- State management isolated from rendering logic

**Dependency Management:**

- Strict dependency rules: outer layers depend on inner layers
- Dependency inversion for infrastructure concerns
- No circular dependencies between features
- Shared code limited to `shared/` module

### Non-Functional Requirements

**Security & Compliance:**

- HTTPS-only communication
- JWT-based authentication with refresh token rotation
- XSS and CSRF protection
- Secure WebRTC signaling (encrypted transports)
- Content Security Policy (CSP) headers
- No sensitive data in localStorage/sessionStorage
- GDPR-compliant data handling

**Performance & Scalability:**

- Initial load < 3 seconds on 3G
- Time to Interactive (TTI) < 5 seconds
- 60fps video rendering
- Optimized bundle size (code splitting, lazy loading)
- Efficient re-renders (React.memo, useMemo, useCallback)
- Virtual scrolling for large participant lists

**Availability & Reliability:**

- Graceful degradation when WebRTC unavailable
- Automatic reconnection for WebSocket disconnects
- Error boundaries for component failures
- Offline detection and user feedback
- Fallback UI for unsupported browsers

**Monitoring & Observability:**

- Error tracking (Sentry/similar)
- Performance monitoring (Web Vitals)
- User analytics (session tracking, feature usage)
- WebRTC diagnostics (connection quality, bandwidth)
- Console logging with structured format (dev environment)

### Team & Development Context

**Team Size:** Small to medium (2-8 developers)

**Team Expertise:**

- Strong React and TypeScript knowledge
- Familiarity with modern hooks-based patterns
- WebRTC experience (can be acquired)
- Testing best practices

**Development Workflow:**

- Feature branch workflow with pull requests
- CI/CD pipeline (lint, test, build, deploy)
- Code review requirements
- Automated testing on pull requests
- Staging environment for QA

**Testing Strategy:**

- Unit tests (Vitest) for business logic and hooks
- Integration tests (Testing Library) for components
- E2E tests (Playwright) for critical user flows
- Visual regression tests (Chromatic/Percy) for UI components
- Manual testing for WebRTC scenarios

**Documentation Standards:**

- Architecture documentation (this document)
- API documentation (OpenAPI/Swagger for backend)
- Component documentation (Storybook)
- Inline code comments for complex logic
- README files for each major feature

---

## 2. Architectural Overview

### Architectural Approach

WeMeet Client adopts a **Feature-based Modular Architecture** with **Clean Architecture** layering principles, specifically tailored for React single-page applications. This approach provides:

1. **Feature Isolation:** Each major feature (auth, meetings, user profile) is self-contained with its own components, state, and business logic
2. **Layered Separation:** Clear boundaries between presentation, application logic, domain rules, and infrastructure
3. **Composable UI:** React component composition for maximum reusability
4. **Testable Design:** Dependency inversion enables comprehensive testing

### Guiding Principles

1. **Separation of Concerns:** Each module has a single, well-defined responsibility
2. **Dependency Rule:** Dependencies point inward (UI → Application → Domain → Infrastructure interfaces)
3. **Explicit State Management:** State changes are predictable and traceable
4. **Progressive Enhancement:** Core functionality works, enhanced features layer on top
5. **Performance by Default:** Optimize for rendering efficiency and bundle size
6. **Type Safety:** Leverage TypeScript for compile-time safety
7. **Accessibility First:** WCAG 2.1 AA compliance for all interactive elements
8. **Testability:** All business logic is unit-testable without DOM

### Architectural Boundaries

**Feature Boundaries:**

- Each feature exports a public API (components, hooks, types)
- Features can depend on `shared/` but not on other features directly
- Cross-feature communication via shared state or events

**Layer Boundaries:**

- Components can only use application-layer hooks
- Hooks can call domain logic and infrastructure adapters
- Domain logic has no external dependencies
- Infrastructure implementations are swappable

**Boundary Enforcement:**

- ESLint rules for import restrictions
- TypeScript path mapping for explicit dependencies
- Code review checks for boundary violations
- Dependency graph visualization in CI

### Why Feature-based Clean Architecture?

**For WeMeet's Context:**

- Real-time video meetings require complex state management (Clean Architecture layers help)
- Multiple developers can work on different features without conflicts (feature isolation)
- WebRTC and WebSocket are infrastructure concerns (dependency inversion enables testing)
- UI components need frequent updates (separation enables safe changes)

**Specific Benefits:**

- **Scalability:** Add new features (e.g., screen sharing, chat) without modifying existing code
- **Testability:** Business logic tested without React rendering
- **Maintainability:** Clear boundaries make changes predictable
- **Team Velocity:** Parallel development on different features
- **Onboarding:** New developers understand scope quickly

---

## 3. Architecture Visualization

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         WeMeet Client (SPA)                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Presentation Layer                     │    │
│  │                                                           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│    │
│  │  │  Auth    │  │ Meetings │  │  Chat    │  │ Profile ││    │
│  │  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages  ││    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘│    │
│  │                                                           │    │
│  │  ┌───────────────────────────────────────────────────┐  │    │
│  │  │         Shared UI Components (shadcn/ui)          │  │    │
│  │  └───────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Application Layer                      │    │
│  │                                                           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│    │
│  │  │  Auth    │  │ Meeting  │  │  Chat    │  │  User   ││    │
│  │  │  Hooks   │  │  Hooks   │  │  Hooks   │  │  Hooks  ││    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘│    │
│  │                                                           │    │
│  │  ┌───────────────────────────────────────────────────┐  │    │
│  │  │      State Management (Zustand + React Query)     │  │    │
│  │  └───────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Domain Layer                         │    │
│  │                                                           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│    │
│  │  │  User    │  │  Meeting │  │  Message │  │  Media  ││    │
│  │  │  Entity  │  │  Entity  │  │  Entity  │  │  Entity ││    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘│    │
│  │                                                           │    │
│  │  ┌───────────────────────────────────────────────────┐  │    │
│  │  │         Business Rules & Validation Logic         │  │    │
│  │  └───────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Infrastructure Layer                    │    │
│  │                                                           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│    │
│  │  │   HTTP   │  │ WebSocket│  │  WebRTC  │  │ Storage ││    │
│  │  │  Client  │  │  Client  │  │  Client  │  │ Client  ││    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────┐
        │        External Services               │
        │  ┌─────────────┐  ┌─────────────┐    │
        │  │   Backend   │  │   WebRTC    │    │
        │  │   APIs      │  │   Signaling │    │
        │  └─────────────┘  └─────────────┘    │
        └───────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action (Click "Join Meeting")
        │
        ▼
┌────────────────────────────┐
│  MeetingPage Component     │  ← Presentation Layer
│  - Renders UI              │
│  - Handles user events     │
└────────────────────────────┘
        │
        │ calls
        ▼
┌────────────────────────────┐
│  useMeeting() Hook         │  ← Application Layer
│  - Manages meeting state   │
│  - Coordinates actions     │
└────────────────────────────┘
        │
        │ calls
        ▼
┌────────────────────────────┐
│  MeetingService            │  ← Domain Layer
│  - Business logic          │
│  - Validation rules        │
└────────────────────────────┘
        │
        │ uses
        ▼
┌────────────────────────────┐
│  WebSocketClient           │  ← Infrastructure Layer
│  - Send join message       │
│  - Handle server response  │
└────────────────────────────┘
        │
        ▼
   Backend Server
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Data Flow Overview                      │
└─────────────────────────────────────────────────────────────┘

1. Authentication Flow:
   User Input → AuthForm → useAuth() → authService.login()
      → HTTP Client → Backend API → JWT Token → Zustand Store
      → Update UI Components

2. Meeting Join Flow:
   User Action → MeetingPage → useMeeting() → WebSocket.send()
      → Signaling Server → Room State → Zustand Store
      → Trigger WebRTC → Peer Connections → Media Streams
      → Update Video Grid

3. Real-time Message Flow:
   WebSocket Event → EventBus → useChatMessages() → Zustand Store
      → React Query Cache → UI Re-render

4. State Persistence Flow:
   User Preferences → Zustand Middleware → localStorage
      → Page Reload → Rehydrate Zustand → Restore UI State
```

---

## 4. Core Architectural Components

### 4.1 Authentication Module (`/features/auth`)

**Purpose & Responsibility:**

- Manage user authentication and authorization
- Handle login, logout, registration, password reset
- Maintain authentication tokens (JWT)
- Protect routes and resources

**Internal Structure:**

```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ProtectedRoute.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useLogin.ts
│   └── useLogout.ts
├── services/
│   └── authService.ts
├── stores/
│   └── authStore.ts
├── types/
│   └── auth.types.ts
└── index.ts (public exports)
```

**Key Abstractions:**

- `AuthService`: Handles authentication business logic
- `useAuth()`: Provides authentication state and methods
- `ProtectedRoute`: HOC for route protection
- `AuthStore`: Global authentication state (Zustand)

**Interaction Patterns:**

- Components call `useAuth()` hook for state and actions
- Hook delegates to `authService` for business logic
- Service uses HTTP client (infrastructure) for API calls
- Store updates trigger UI re-renders via React subscriptions

**Extension Points:**

- Add OAuth providers (Google, GitHub) via `authService`
- Implement MFA by extending `loginFlow`
- Custom authorization rules via `ProtectedRoute` props
- Token refresh logic in middleware

---

### 4.2 Meeting Module (`/features/meeting`)

**Purpose & Responsibility:**

- Manage video meeting lifecycle (create, join, leave)
- Handle real-time participant state
- Coordinate WebRTC peer connections
- Control audio/video settings

**Internal Structure:**

```
features/meeting/
├── components/
│   ├── MeetingRoom.tsx
│   ├── VideoGrid.tsx
│   ├── ParticipantTile.tsx
│   ├── ControlBar.tsx
│   └── SettingsPanel.tsx
├── hooks/
│   ├── useMeeting.ts
│   ├── useParticipants.ts
│   ├── useMediaStream.ts
│   └── useWebRTC.ts
├── services/
│   ├── meetingService.ts
│   ├── webrtcService.ts
│   └── signalingService.ts
├── stores/
│   ├── meetingStore.ts
│   └── participantsStore.ts
├── types/
│   └── meeting.types.ts
└── index.ts
```

**Key Abstractions:**

- `MeetingService`: Meeting lifecycle and state management
- `WebRTCService`: Peer connection management
- `SignalingService`: WebSocket signaling abstraction
- `useMeeting()`: Main hook for meeting state
- `useWebRTC()`: WebRTC connection management

**Interaction Patterns:**

- Components use `useMeeting()` for meeting state
- `useMeeting()` coordinates `meetingService` and `webrtcService`
- WebRTC service subscribes to signaling events
- Media streams managed separately via `useMediaStream()`

**Extension Points:**

- Add screen sharing via `useScreenShare()` hook
- Implement recording via `recordingService`
- Add virtual backgrounds via media stream processing
- Custom layouts via `VideoGrid` composition

---

### 4.3 Chat Module (`/features/chat`)

**Purpose & Responsibility:**

- In-meeting text chat functionality
- Message history and persistence
- Real-time message delivery
- Typing indicators and read receipts

**Internal Structure:**

```
features/chat/
├── components/
│   ├── ChatPanel.tsx
│   ├── MessageList.tsx
│   ├── MessageInput.tsx
│   └── MessageBubble.tsx
├── hooks/
│   ├── useChatMessages.ts
│   └── useMessageInput.ts
├── services/
│   └── chatService.ts
├── stores/
│   └── chatStore.ts
├── types/
│   └── chat.types.ts
└── index.ts
```

**Key Abstractions:**

- `ChatService`: Message sending and formatting
- `useChatMessages()`: Message state and operations
- `ChatStore`: Message history (Zustand)

**Interaction Patterns:**

- WebSocket events push messages to store
- Components subscribe to store for reactivity
- Optimistic updates for sent messages
- React Query for message history pagination

---

### 4.4 User Profile Module (`/features/profile`)

**Purpose & Responsibility:**

- User profile management
- Settings and preferences
- Subscription status
- Avatar and display name

**Internal Structure:**

```
features/profile/
├── components/
│   ├── ProfilePage.tsx
│   ├── ProfileForm.tsx
│   ├── SubscriptionCard.tsx
│   └── AvatarUpload.tsx
├── hooks/
│   ├── useProfile.ts
│   └── useSubscription.ts
├── services/
│   ├── profileService.ts
│   └── subscriptionService.ts
├── types/
│   └── profile.types.ts
└── index.ts
```

**Extension Points:**

- Add billing history component
- Implement profile completion wizard
- Add social media linking

---

### 4.5 Shared Module (`/shared`)

**Purpose & Responsibility:**

- Reusable UI components (based on shadcn/ui)
- Common utilities and helpers
- Shared types and constants
- Cross-cutting hooks

**Internal Structure:**

```
shared/
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Toast.tsx
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── types/
│   └── common.types.ts
└── index.ts
```

---

## 5. Architectural Layers and Dependencies

### Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│               Presentation Layer (UI)                    │
│  - React Components (Pages, Features, Shared)            │
│  - Only renders, delegates logic to hooks                │
│  - No business logic or direct API calls                 │
└─────────────────────────────────────────────────────────┘
                        │
                        │ calls hooks
                        ▼
┌─────────────────────────────────────────────────────────┐
│            Application Layer (Hooks & State)             │
│  - Custom hooks (useAuth, useMeeting, etc.)              │
│  - State management (Zustand stores, React Query)        │
│  - Coordinates domain and infrastructure                 │
└─────────────────────────────────────────────────────────┘
                        │
                        │ uses
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Domain Layer (Business Logic)               │
│  - Services (authService, meetingService)                │
│  - Business entities and types                           │
│  - Validation rules                                      │
│  - Pure functions (no side effects)                      │
└─────────────────────────────────────────────────────────┘
                        │
                        │ depends on interfaces
                        ▼
┌─────────────────────────────────────────────────────────┐
│          Infrastructure Layer (External I/O)             │
│  - HTTP client (axios/fetch wrapper)                     │
│  - WebSocket client                                      │
│  - WebRTC peer connection manager                        │
│  - Local storage adapter                                 │
│  - Implements interfaces from domain                     │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rules

1. **Presentation depends on Application:**

   - Components import hooks from `hooks/`
   - No direct service or infrastructure imports
   - Example: `import { useAuth } from '@/features/auth/hooks'`

2. **Application depends on Domain and Infrastructure:**

   - Hooks call services (domain)
   - Hooks use clients (infrastructure)
   - Example: `authService.login(credentials)` and `httpClient.post('/auth/login')`

3. **Domain depends on nothing (pure business logic):**

   - Services are pure TypeScript functions
   - No React dependencies
   - No infrastructure imports
   - Example: `validateEmail(email: string): boolean`

4. **Infrastructure implements domain interfaces:**
   - Domain defines interfaces (e.g., `IAuthClient`)
   - Infrastructure provides implementations
   - Enables testing with mocks

### Abstraction Mechanisms

**TypeScript Interfaces:**

```typescript
// Domain defines interface
interface IWebSocketClient {
  connect(url: string): Promise<void>;
  send<T>(event: string, data: T): void;
  on<T>(event: string, handler: (data: T) => void): void;
  disconnect(): void;
}

// Infrastructure implements
class WebSocketClient implements IWebSocketClient {
  // Implementation details
}
```

**Dependency Injection via Hooks:**

```typescript
// Hook provides abstraction
export const useWebSocket = () => {
  const client = useMemo(() => new WebSocketClient(), []);
  return client;
};

// Component uses abstraction
const MyComponent = () => {
  const ws = useWebSocket();
  // Use ws.connect(), ws.send(), etc.
};
```

**Path Aliases:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/lib/*": ["src/lib/*"]
    }
  }
}
```

### Circular Dependency Prevention

**Rules:**

1. Features cannot import from other features
2. Shared module cannot import from features
3. All cross-feature communication via shared state or events
4. Use dependency graph checks in CI

**Tools:**

- ESLint `no-restricted-imports` rule
- `madge` for circular dependency detection
- Pre-commit hooks to prevent violations

---

## 6. Data Architecture

### Domain Model Structure

**Core Entities:**

```typescript
// User Entity
interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  subscription: SubscriptionType;
  createdAt: Date;
  updatedAt: Date;
}

// Meeting Entity
interface Meeting {
  id: string;
  title: string;
  hostId: string;
  participants: Participant[];
  status: MeetingStatus;
  startTime: Date;
  endTime?: Date;
  settings: MeetingSettings;
}

// Participant Entity
interface Participant {
  userId: string;
  displayName: string;
  avatar?: string;
  isHost: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  joinedAt: Date;
}

// Message Entity
interface Message {
  id: string;
  meetingId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: MessageType;
}
```

**Value Objects:**

```typescript
// Immutable value objects
type SubscriptionType = "free" | "premium" | "enterprise";
type MeetingStatus = "scheduled" | "active" | "ended";
type MessageType = "text" | "system" | "file";

interface MeetingSettings {
  maxParticipants: number;
  allowRecording: boolean;
  requirePassword: boolean;
  password?: string;
}
```

### Entity Relationships

```
User (1) ─────< (N) Meeting
  │                   │
  │                   │
  └───────< Participant >───┘
                      │
                      │
                      └───< Message
```

### Data Access Patterns

**Repository Pattern via React Query:**

```typescript
// API client abstraction
export const meetingApi = {
  getMeetings: (): Promise<Meeting[]> => httpClient.get("/meetings"),

  getMeeting: (id: string): Promise<Meeting> =>
    httpClient.get(`/meetings/${id}`),

  createMeeting: (data: CreateMeetingDto): Promise<Meeting> =>
    httpClient.post("/meetings", data),

  updateMeeting: (id: string, data: UpdateMeetingDto): Promise<Meeting> =>
    httpClient.patch(`/meetings/${id}`, data),
};

// React Query hook (repository pattern)
export const useMeetings = () => {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: meetingApi.getMeetings,
  });
};

export const useMeeting = (id: string) => {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => meetingApi.getMeeting(id),
  });
};
```

### Data Transformation

**DTO to Entity Mapping:**

```typescript
// Backend DTO (from API)
interface MeetingDto {
  id: string;
  title: string;
  host_id: string;
  created_at: string;
  // snake_case from backend
}

// Transform to domain entity
const mapMeetingDtoToEntity = (dto: MeetingDto): Meeting => ({
  id: dto.id,
  title: dto.title,
  hostId: dto.host_id,
  createdAt: new Date(dto.created_at),
  // camelCase for frontend
});
```

### Caching Strategy

**React Query Cache:**

- **Stale Time:** 5 minutes for user data
- **Cache Time:** 30 minutes for meetings
- **Invalidation:** On mutations (create, update, delete)

**Zustand Store:**

- **Current Meeting State:** Real-time updates via WebSocket
- **Authentication State:** Persisted to localStorage
- **User Preferences:** Persisted to localStorage

**IndexedDB (Future):**

- Offline message queue
- Meeting history
- Large file transfers

### Data Validation

**Client-side Validation:**

```typescript
// Using Zod for schema validation
import { z } from "zod";

const CreateMeetingSchema = z.object({
  title: z.string().min(1).max(100),
  startTime: z.date().min(new Date()),
  maxParticipants: z.number().min(2).max(100),
});

export const validateCreateMeeting = (data: unknown) => {
  return CreateMeetingSchema.parse(data);
};
```

**Where to Validate:**

- **Form inputs:** Immediate feedback (on blur)
- **Before API calls:** Prevent invalid requests
- **After API responses:** Ensure data integrity

---

## 7. Cross-Cutting Concerns

### 7.1 Authentication & Authorization

**Implementation Strategy:**

```typescript
// JWT Token Management
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Token storage (httpOnly cookies preferred, fallback to memory)
class TokenManager {
  private tokens: AuthTokens | null = null;

  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    // Store refresh token in httpOnly cookie (backend sets)
    // Access token in memory only
  }

  getAccessToken(): string | null {
    if (!this.tokens) return null;
    if (Date.now() >= this.tokens.expiresAt) {
      return null; // Expired
    }
    return this.tokens.accessToken;
  }

  async refreshAccessToken(): Promise<string> {
    // Call refresh endpoint
    const response = await httpClient.post("/auth/refresh");
    this.setTokens(response.data);
    return response.data.accessToken;
  }
}

// Axios interceptor for automatic token refresh
httpClient.interceptors.request.use(async (config) => {
  const token = tokenManager.getAccessToken();
  if (!token) {
    const newToken = await tokenManager.refreshAccessToken();
    config.headers.Authorization = `Bearer ${newToken}`;
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Permission Enforcement:**

```typescript
// Role-based access control
type Role = "user" | "premium" | "admin";

interface PermissionCheck {
  requiredRole: Role;
  allow: (userRole: Role) => boolean;
}

const permissions: Record<string, PermissionCheck> = {
  "meeting.record": {
    requiredRole: "premium",
    allow: (userRole) => ["premium", "admin"].includes(userRole),
  },
  "meeting.host": {
    requiredRole: "user",
    allow: () => true,
  },
};

// HOC for component protection
export const withPermission = (
  Component: React.ComponentType,
  permission: string
) => {
  return (props: any) => {
    const { user } = useAuth();
    const canAccess = permissions[permission]?.allow(user.role);

    if (!canAccess) {
      return <UpgradePrompt />;
    }

    return <Component {...props} />;
  };
};
```

---

### 7.2 Error Handling & Resilience

**Exception Handling Pattern:**

```typescript
// Custom error types
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

class NetworkError extends AppError {
  constructor(message: string) {
    super("NETWORK_ERROR", message, 0);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string) {
    super("AUTH_ERROR", message, 401);
  }
}

// Global error handler
export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) {
      return new AuthenticationError("Session expired");
    }
    if (status === 403) {
      return new AppError("FORBIDDEN", "Access denied", 403);
    }
    if (!error.response) {
      return new NetworkError("Network connection failed");
    }
  }

  // Unknown error
  return new AppError("UNKNOWN_ERROR", "An unexpected error occurred");
};
```

**React Error Boundaries:**

```typescript
// ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service (Sentry)
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Retry Logic:**

```typescript
// Exponential backoff retry
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
};

// Usage in API client
export const fetchWithRetry = <T>(url: string) => {
  return retryWithBackoff(() => httpClient.get<T>(url));
};
```

**Circuit Breaker Pattern:**

```typescript
// Prevent cascading failures
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(private threshold = 5, private timeout = 60000) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = "closed";
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = "open";
    }
  }
}
```

---

### 7.3 Logging & Monitoring

**Structured Logging:**

```typescript
// Logger implementation
interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

class Logger {
  log(entry: LogEntry) {
    const formatted = {
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    };

    if (import.meta.env.DEV) {
      console[entry.level](formatted);
    } else {
      // Send to logging service (e.g., Sentry, LogRocket)
      this.sendToService(formatted);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log({ level: "info", message, context, timestamp: new Date() });
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log({
      level: "error",
      message,
      context: { ...context, error: error?.stack },
      timestamp: new Date(),
    });
  }

  private sendToService(entry: LogEntry) {
    // Integration with external service
  }
}

export const logger = new Logger();
```

**Performance Monitoring:**

```typescript
// Web Vitals tracking
import { onCLS, onFID, onLCP, onFCP, onTTFB } from "web-vitals";

export const initPerformanceMonitoring = () => {
  onCLS((metric) => logger.info("CLS", { value: metric.value }));
  onFID((metric) => logger.info("FID", { value: metric.value }));
  onLCP((metric) => logger.info("LCP", { value: metric.value }));
  onFCP((metric) => logger.info("FCP", { value: metric.value }));
  onTTFB((metric) => logger.info("TTFB", { value: metric.value }));
};

// Custom performance marks
export const measureOperation = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.info(`Operation: ${name}`, { duration });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Operation failed: ${name}`, error as Error, { duration });
    throw error;
  }
};
```

---

### 7.4 Validation

**Form Validation Strategy:**

```typescript
// Using React Hook Form + Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    // Data is validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
};
```

**Business Rule Validation:**

```typescript
// Domain validation
export const meetingRules = {
  canStartMeeting: (user: User, meeting: Meeting): boolean => {
    return user.id === meeting.hostId || user.role === "admin";
  },

  canJoinMeeting: (user: User, meeting: Meeting): boolean => {
    if (meeting.settings.requirePassword && !user.hasPassword) {
      return false;
    }
    if (meeting.participants.length >= meeting.settings.maxParticipants) {
      return false;
    }
    return true;
  },

  canRecordMeeting: (user: User): boolean => {
    return ["premium", "enterprise"].includes(user.subscription);
  },
};
```

---

### 7.5 Configuration Management

**Environment Configuration:**

```typescript
// env.ts
const requiredEnvVars = [
  "VITE_API_URL",
  "VITE_WS_URL",
  "VITE_WEBRTC_STUN_URL",
] as const;

const optionalEnvVars = ["VITE_SENTRY_DSN", "VITE_ANALYTICS_ID"] as const;

type RequiredEnv = (typeof requiredEnvVars)[number];
type OptionalEnv = (typeof optionalEnvVars)[number];

export const env = {
  // Required
  apiUrl: import.meta.env.VITE_API_URL as string,
  wsUrl: import.meta.env.VITE_WS_URL as string,
  stunUrl: import.meta.env.VITE_WEBRTC_STUN_URL as string,

  // Optional
  sentryDsn: import.meta.env.VITE_SENTRY_DSN as string | undefined,
  analyticsId: import.meta.env.VITE_ANALYTICS_ID as string | undefined,

  // Derived
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

// Validate required env vars at startup
export const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};
```

**Feature Flags:**

```typescript
// Feature flag system
interface FeatureFlags {
  enableChat: boolean;
  enableRecording: boolean;
  enableScreenShare: boolean;
  enableVirtualBackground: boolean;
}

export const featureFlags: FeatureFlags = {
  enableChat: true,
  enableRecording: import.meta.env.VITE_ENABLE_RECORDING === "true",
  enableScreenShare: true,
  enableVirtualBackground: false, // Coming soon
};

// Hook for feature checking
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};
```

---

## 8. Service Communication Patterns

### HTTP REST API Communication

**Base HTTP Client:**

```typescript
// lib/httpClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          try {
            await tokenManager.refreshAccessToken();
            return this.client.request(error.config);
          } catch {
            // Redirect to login
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // ... put, patch, delete methods
}

export const httpClient = new HttpClient(env.apiUrl);
```

---

### WebSocket Real-time Communication

**WebSocket Client:**

```typescript
// lib/websocketClient.ts
type EventHandler<T = any> = (data: T) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        logger.info("WebSocket connected");
        resolve();
      };

      this.ws.onerror = (error) => {
        logger.error("WebSocket error", error as any);
        reject(error);
      };

      this.ws.onclose = () => {
        logger.info("WebSocket disconnected");
        this.attemptReconnect(url);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit(message.type, message.payload);
        } catch (error) {
          logger.error("Failed to parse WebSocket message", error as Error);
        }
      };
    });
  }

  send<T>(type: string, payload: T): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  private emit<T>(event: string, data: T): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    setTimeout(() => {
      logger.info(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect(url);
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketClient();
```

---

### WebRTC Peer Connection

**WebRTC Service:**

```typescript
// services/webrtcService.ts
interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

class WebRTCService {
  private peers = new Map<string, PeerConnection>();
  private localStream: MediaStream | null = null;
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: env.stunUrl },
    ],
  };

  async getLocalStream(
    constraints: MediaStreamConstraints
  ): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.localStream;
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(this.configuration);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.stream = event.streams[0];
        // Emit event for UI update
        this.emit("peer-stream", { peerId, stream: event.streams[0] });
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsClient.send("ice-candidate", {
          peerId,
          candidate: event.candidate,
        });
      }
    };

    this.peers.set(peerId, { peerId, connection: pc });
    return pc;
  }

  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const pc = await this.createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(
    peerId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    const pc = await this.createPeerConnection(peerId);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(
    peerId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      await peer.connection.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(
    peerId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      await peer.connection.addIceCandidate(candidate);
    }
  }

  closePeerConnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.connection.close();
      this.peers.delete(peerId);
    }
  }

  private emit(event: string, data: any): void {
    // Event emitter implementation
  }
}

export const webrtcService = new WebRTCService();
```

---

## 9. React-Specific Architectural Patterns

### Component Composition Strategies

**Container-Presenter Pattern:**

```typescript
// Container (smart component)
export const MeetingRoomContainer = () => {
  const { meeting, participants } = useMeeting();
  const { localStream } = useMediaStream();

  return (
    <MeetingRoomPresenter
      meeting={meeting}
      participants={participants}
      localStream={localStream}
    />
  );
};

// Presenter (dumb component)
interface MeetingRoomPresenterProps {
  meeting: Meeting;
  participants: Participant[];
  localStream: MediaStream | null;
}

export const MeetingRoomPresenter = ({
  meeting,
  participants,
  localStream,
}: MeetingRoomPresenterProps) => {
  return (
    <div>
      <VideoGrid participants={participants} />
      <LocalVideo stream={localStream} />
      <ControlBar meeting={meeting} />
    </div>
  );
};
```

**Compound Component Pattern:**

```typescript
// Flexible, composable components
export const Meeting = ({ children }: { children: ReactNode }) => {
  const context = useMeeting();
  return (
    <MeetingContext.Provider value={context}>
      {children}
    </MeetingContext.Provider>
  );
};

Meeting.VideoGrid = function VideoGrid() {
  const { participants } = useMeetingContext();
  return <VideoGridComponent participants={participants} />;
};

Meeting.Controls = function Controls() {
  const { toggleAudio, toggleVideo } = useMeetingContext();
  return <ControlBar onToggleAudio={toggleAudio} onToggleVideo={toggleVideo} />;
};

// Usage
<Meeting>
  <Meeting.VideoGrid />
  <Meeting.Controls />
</Meeting>;
```

---

### State Management Architecture

**Zustand for Global State:**

```typescript
// stores/authStore.ts
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
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
);
```

**React Context for Feature-local State:**

```typescript
// features/meeting/context/MeetingContext.tsx
interface MeetingContextValue {
  meeting: Meeting | null;
  participants: Participant[];
  localStream: MediaStream | null;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

const MeetingContext = createContext<MeetingContextValue | null>(null);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { stream: localStream, toggleAudio, toggleVideo } = useMediaStream();

  const value = {
    meeting,
    participants,
    localStream,
    toggleAudio,
    toggleVideo,
  };

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
};

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeetingContext must be used within MeetingProvider");
  }
  return context;
};
```

---

### Side Effect Handling

**Custom Hooks for Side Effects:**

```typescript
// hooks/useWebSocketConnection.ts
export const useWebSocketConnection = (meetingId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!meetingId) return;

    const connect = async () => {
      try {
        await wsClient.connect(`${env.wsUrl}/meeting/${meetingId}`);
        setIsConnected(true);
      } catch (error) {
        logger.error("Failed to connect to WebSocket", error as Error);
      }
    };

    connect();

    return () => {
      wsClient.disconnect();
      setIsConnected(false);
    };
  }, [meetingId]);

  return { isConnected };
};
```

**Effect Dependency Management:**

```typescript
// Stable function references
const MeetingRoom = () => {
  const handleParticipantJoined = useCallback((participant: Participant) => {
    // Handle participant joined
  }, []); // No dependencies = stable reference

  useEffect(() => {
    const unsubscribe = wsClient.on(
      "participant-joined",
      handleParticipantJoined
    );
    return unsubscribe;
  }, [handleParticipantJoined]);
};
```

---

### Data Fetching & Caching (React Query)

**Query Hooks:**

```typescript
// hooks/useMeetingQuery.ts
export const useMeetingQuery = (meetingId: string) => {
  return useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => meetingApi.getMeeting(meetingId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });
};
```

**Mutation Hooks:**

```typescript
// hooks/useCreateMeeting.ts
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingDto) => meetingApi.createMeeting(data),
    onSuccess: (newMeeting) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      // Optimistically update
      queryClient.setQueryData(["meeting", newMeeting.id], newMeeting);
    },
    onError: (error) => {
      logger.error("Failed to create meeting", error as Error);
    },
  });
};
```

**Optimistic Updates:**

```typescript
export const useToggleAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => meetingApi.toggleAudio(enabled),
    onMutate: async (enabled) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["meeting"] });

      // Snapshot previous value
      const previousMeeting = queryClient.getQueryData(["meeting"]);

      // Optimistically update
      queryClient.setQueryData(["meeting"], (old: Meeting) => ({
        ...old,
        localParticipant: { ...old.localParticipant, audioEnabled: enabled },
      }));

      return { previousMeeting };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMeeting) {
        queryClient.setQueryData(["meeting"], context.previousMeeting);
      }
    },
  });
};
```

---

### Rendering Optimization

**React.memo for Expensive Components:**

```typescript
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
    // Custom equality check
    return (
      prevProps.participant.id === nextProps.participant.id &&
      prevProps.participant.audioEnabled ===
        nextProps.participant.audioEnabled &&
      prevProps.participant.videoEnabled === nextProps.participant.videoEnabled
    );
  }
);
```

**useMemo for Expensive Calculations:**

```typescript
const VideoGrid = ({ participants }: { participants: Participant[] }) => {
  const gridLayout = useMemo(() => {
    return calculateOptimalGridLayout(participants.length);
  }, [participants.length]);

  return (
    <div style={gridLayout}>
      {participants.map((p) => (
        <ParticipantTile key={p.id} participant={p} />
      ))}
    </div>
  );
};
```

**useCallback for Stable Callbacks:**

```typescript
const ControlBar = () => {
  const [audioEnabled, setAudioEnabled] = useState(true);

  const handleToggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
    webrtcService.toggleAudio();
  }, []); // Stable reference

  return <Button onClick={handleToggleAudio}>Toggle Audio</Button>;
};
```

**Virtual Scrolling for Large Lists:**

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

const ParticipantList = ({ participants }: { participants: Participant[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: participants.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  return (
    <div ref={parentRef} style={{ height: "400px", overflow: "auto" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ParticipantTile participant={participants[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### Form Handling & Validation

**React Hook Form Integration:**

```typescript
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createMeetingSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100),
    startTime: z.date().min(new Date(), "Start time must be in the future"),
    maxParticipants: z.number().min(2).max(100),
    requirePassword: z.boolean(),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.requirePassword && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: "Password is required when password protection is enabled",
      path: ["password"],
    }
  );

type CreateMeetingFormData = z.infer<typeof createMeetingSchema>;

export const CreateMeetingForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMeetingFormData>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      maxParticipants: 10,
      requirePassword: false,
    },
  });

  const createMeetingMutation = useCreateMeeting();

  const onSubmit = (data: CreateMeetingFormData) => {
    createMeetingMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="Meeting Title" />
      {errors.title && <span>{errors.title.message}</span>}

      <Controller
        name="startTime"
        control={control}
        render={({ field }) => (
          <DatePicker selected={field.value} onChange={field.onChange} />
        )}
      />

      <button type="submit">Create Meeting</button>
    </form>
  );
};
```

---

## 10. Implementation Patterns

### Interface Design Patterns

**Service Interface:**

```typescript
// Domain interface
export interface IMeetingService {
  createMeeting(data: CreateMeetingDto): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting>;
  updateMeeting(id: string, data: UpdateMeetingDto): Promise<Meeting>;
  deleteMeeting(id: string): Promise<void>;
  joinMeeting(meetingId: string): Promise<void>;
  leaveMeeting(meetingId: string): Promise<void>;
}

// Implementation
export class MeetingService implements IMeetingService {
  constructor(
    private httpClient: HttpClient,
    private wsClient: WebSocketClient
  ) {}

  async createMeeting(data: CreateMeetingDto): Promise<Meeting> {
    return this.httpClient.post("/meetings", data);
  }

  async joinMeeting(meetingId: string): Promise<void> {
    this.wsClient.send("join-meeting", { meetingId });
  }

  // ... other methods
}
```

---

### Repository Pattern

**API Repository:**

```typescript
// Repository interface
export interface IMeetingRepository {
  findAll(): Promise<Meeting[]>;
  findById(id: string): Promise<Meeting | null>;
  create(data: CreateMeetingDto): Promise<Meeting>;
  update(id: string, data: UpdateMeetingDto): Promise<Meeting>;
  delete(id: string): Promise<void>;
}

// Implementation with React Query
export class MeetingRepository implements IMeetingRepository {
  constructor(private httpClient: HttpClient) {}

  async findAll(): Promise<Meeting[]> {
    return this.httpClient.get("/meetings");
  }

  async findById(id: string): Promise<Meeting | null> {
    try {
      return await this.httpClient.get(`/meetings/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateMeetingDto): Promise<Meeting> {
    return this.httpClient.post("/meetings", data);
  }

  // ... other methods
}
```

---

### Controller/API Pattern

**Route Handlers (React Router):**

```typescript
// routes/meetingRoutes.tsx
export const meetingRoutes = [
  {
    path: "/meetings",
    element: <MeetingsLayout />,
    children: [
      {
        index: true,
        element: <MeetingListPage />,
      },
      {
        path: "create",
        element: <CreateMeetingPage />,
      },
      {
        path: ":meetingId",
        element: <MeetingRoomPage />,
        loader: async ({ params }) => {
          // Prefetch meeting data
          return meetingApi.getMeeting(params.meetingId!);
        },
      },
    ],
  },
];
```

---

## 11. Testing Architecture

### Testing Strategy

**Test Pyramid:**

```
         E2E Tests (10%)
       ──────────────
      Integration Tests (30%)
    ──────────────────────
   Unit Tests (60%)
 ─────────────────────────────
```

### Unit Testing

**Testing Business Logic:**

```typescript
// services/meetingService.test.ts
import { describe, it, expect, vi } from "vitest";
import { MeetingService } from "./meetingService";

describe("MeetingService", () => {
  it("should create a meeting", async () => {
    const mockHttpClient = {
      post: vi.fn().mockResolvedValue({ id: "1", title: "Test Meeting" }),
    };

    const service = new MeetingService(mockHttpClient as any, {} as any);
    const result = await service.createMeeting({ title: "Test Meeting" });

    expect(result).toEqual({ id: "1", title: "Test Meeting" });
    expect(mockHttpClient.post).toHaveBeenCalledWith("/meetings", {
      title: "Test Meeting",
    });
  });
});
```

**Testing Custom Hooks:**

```typescript
// hooks/useMeeting.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useMeeting } from "./useMeeting";

describe("useMeeting", () => {
  it("should fetch meeting data", async () => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useMeeting("meeting-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "meeting-1", title: "Test" });
  });
});
```

---

### Integration Testing

**Testing Components:**

```typescript
// components/MeetingRoom.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MeetingRoom } from "./MeetingRoom";

describe("MeetingRoom", () => {
  it("should toggle audio when button is clicked", async () => {
    const mockToggleAudio = vi.fn();

    render(
      <MeetingRoom meeting={mockMeeting} onToggleAudio={mockToggleAudio} />
    );

    const audioButton = screen.getByRole("button", { name: /toggle audio/i });
    fireEvent.click(audioButton);

    expect(mockToggleAudio).toHaveBeenCalled();
  });
});
```

---

### E2E Testing

**Playwright Tests:**

```typescript
// e2e/meeting.spec.ts
import { test, expect } from "@playwright/test";

test("should join a meeting", async ({ page }) => {
  await page.goto("/meetings/test-meeting-id");

  // Wait for meeting to load
  await expect(page.locator('[data-testid="meeting-room"]')).toBeVisible();

  // Click join button
  await page.click('[data-testid="join-button"]');

  // Verify joined
  await expect(page.locator('[data-testid="local-video"]')).toBeVisible();
  await expect(page.locator('[data-testid="control-bar"]')).toBeVisible();
});
```

---

## 12. Deployment Architecture

### Build Configuration

**Vite Production Build:**

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "state-vendor": ["zustand", "@tanstack/react-query"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
          ],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
```

### Environment Configuration

**Environment Files:**

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_WEBRTC_STUN_URL=stun:stun.l.google.com:19302

# .env.production
VITE_API_URL=https://api.wemeet.com/api
VITE_WS_URL=wss://ws.wemeet.com
VITE_WEBRTC_STUN_URL=stun:stun.wemeet.com:3478
```

### Static Hosting (Vercel/Netlify)

**vercel.json:**

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_WS_URL: ${{ secrets.WS_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

---

## 13. Extension and Evolution Patterns

### Adding New Features

**Feature Addition Checklist:**

1. Create feature folder: `/src/features/[feature-name]`
2. Define types in `types/[feature].types.ts`
3. Implement domain logic in `services/[feature]Service.ts`
4. Create custom hooks in `hooks/use[Feature].ts`
5. Build UI components in `components/`
6. Export public API via `index.ts`
7. Add tests for all layers
8. Update documentation

**Example: Adding Screen Sharing**

```
features/screen-share/
├── components/
│   ├── ScreenShareButton.tsx
│   └── ScreenSharePreview.tsx
├── hooks/
│   └── useScreenShare.ts
├── services/
│   └── screenShareService.ts
├── types/
│   └── screenShare.types.ts
└── index.ts
```

---

### Modifying Existing Components

**Safe Modification Guidelines:**

1. Check existing tests before making changes
2. Add tests for new behavior
3. Use feature flags for risky changes
4. Update type definitions
5. Update documentation
6. Ensure backward compatibility

---

### Integration with External Systems

**Adapter Pattern for Third-party Services:**

```typescript
// Adapter interface
export interface IAnalyticsAdapter {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
}

// Mixpanel adapter
export class MixpanelAdapter implements IAnalyticsAdapter {
  track(event: string, properties?: Record<string, any>): void {
    mixpanel.track(event, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    mixpanel.identify(userId);
    if (traits) mixpanel.people.set(traits);
  }
}

// PostHog adapter
export class PostHogAdapter implements IAnalyticsAdapter {
  track(event: string, properties?: Record<string, any>): void {
    posthog.capture(event, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    posthog.identify(userId, traits);
  }
}
```

---

## 14. Architectural Pattern Examples

### Layer Separation Example

```typescript
// ❌ BAD: Component directly calls API
const BadMeetingRoom = () => {
  const [meeting, setMeeting] = useState(null);

  useEffect(() => {
    axios.get("/meetings/123").then((res) => setMeeting(res.data));
  }, []);

  return <div>{meeting?.title}</div>;
};

// ✅ GOOD: Proper layer separation
// 1. Infrastructure layer (API client)
const meetingApi = {
  getMeeting: (id: string) => httpClient.get(`/meetings/${id}`),
};

// 2. Domain layer (service)
const meetingService = {
  async getMeeting(id: string): Promise<Meeting> {
    const dto = await meetingApi.getMeeting(id);
    return mapMeetingDtoToEntity(dto);
  },
};

// 3. Application layer (hook)
const useMeeting = (id: string) => {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => meetingService.getMeeting(id),
  });
};

// 4. Presentation layer (component)
const GoodMeetingRoom = ({ meetingId }: { meetingId: string }) => {
  const { data: meeting, isLoading } = useMeeting(meetingId);

  if (isLoading) return <Spinner />;
  return <div>{meeting?.title}</div>;
};
```

---

### Component Communication Example

```typescript
// Event-driven communication between features
// 1. Define events
type AppEvent =
  | { type: "user:logged-in"; payload: { user: User } }
  | { type: "meeting:joined"; payload: { meetingId: string } }
  | { type: "participant:joined"; payload: { participant: Participant } };

// 2. Event bus implementation
class EventBus {
  private handlers = new Map<string, Set<(payload: any) => void>>();

  emit<T extends AppEvent>(event: T): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event.payload));
    }
  }

  on<T extends AppEvent["type"]>(
    type: T,
    handler: (payload: Extract<AppEvent, { type: T }>["payload"]) => void
  ): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }
}

export const eventBus = new EventBus();

// 3. Usage in features
// Feature A (auth) emits event
const handleLogin = (user: User) => {
  eventBus.emit({ type: "user:logged-in", payload: { user } });
};

// Feature B (analytics) listens to event
useEffect(() => {
  const unsubscribe = eventBus.on("user:logged-in", ({ user }) => {
    analytics.identify(user.id);
  });
  return unsubscribe;
}, []);
```

---

### Extension Point Example

```typescript
// Plugin system for extending meeting functionality
interface MeetingPlugin {
  name: string;
  onMeetingJoined?: (meeting: Meeting) => void;
  onParticipantJoined?: (participant: Participant) => void;
  onMeetingEnded?: (meeting: Meeting) => void;
}

class MeetingPluginManager {
  private plugins: MeetingPlugin[] = [];

  register(plugin: MeetingPlugin): void {
    this.plugins.push(plugin);
  }

  async onMeetingJoined(meeting: Meeting): Promise<void> {
    for (const plugin of this.plugins) {
      plugin.onMeetingJoined?.(meeting);
    }
  }

  async onParticipantJoined(participant: Participant): Promise<void> {
    for (const plugin of this.plugins) {
      plugin.onParticipantJoined?.(participant);
    }
  }
}

// Example plugin: Analytics
const analyticsPlugin: MeetingPlugin = {
  name: "analytics",
  onMeetingJoined: (meeting) => {
    analytics.track("Meeting Joined", { meetingId: meeting.id });
  },
  onParticipantJoined: (participant) => {
    analytics.track("Participant Joined", {
      participantId: participant.userId,
    });
  },
};

// Register plugin
meetingPluginManager.register(analyticsPlugin);
```

---

## 15. Architectural Decision Records

### ADR-001: Choice of React 19

**Status:** Accepted  
**Date:** February 4, 2026

**Context:**
WeMeet requires a modern, performant frontend framework for building a real-time video meeting application with complex state management and frequent UI updates.

**Decision:**
Use React 19 as the primary UI framework.

**Rationale:**

- React 19 includes the React Compiler for automatic optimization
- Excellent WebRTC ecosystem support
- Strong TypeScript integration
- Large community and extensive libraries
- Server Components (future consideration)

**Alternatives Considered:**

- **Vue 3:** Good performance, but smaller ecosystem for WebRTC
- **Svelte:** Excellent performance, but less mature WebRTC tooling
- **Angular:** Over-engineered for SPA use case

**Consequences:**

- **Positive:** Automatic optimizations via React Compiler, extensive library ecosystem
- **Negative:** Bundle size larger than Svelte/Vue
- **Risks:** Rapid React updates may require migration effort

---

### ADR-002: Feature-based Architecture

**Status:** Accepted  
**Date:** February 4, 2026

**Context:**
Need an organizational structure that supports team scalability, parallel development, and clear ownership boundaries.

**Decision:**
Adopt feature-based folder structure over traditional layer-based structure.

**Rationale:**

- Features are natural boundaries for team ownership
- Reduces merge conflicts (different teams work in different folders)
- Easier to locate code (everything related to auth is in `/features/auth`)
- Supports feature flags and gradual rollout
- Enables micro-frontend migration if needed

**Alternatives Considered:**

- **Layer-based (MVC):** Components/, Services/, Models/ - harder to find related code
- **Monorepo with packages:** Over-engineered for current team size

**Consequences:**

- **Positive:** Team scalability, clear boundaries, easier testing
- **Negative:** Shared code requires careful management
- **Risks:** Feature interdependencies must be managed via shared module

---

### ADR-003: Zustand for State Management

**Status:** Accepted  
**Date:** February 4, 2026

**Context:**
Need global state management for authentication, meeting state, and user preferences.

**Decision:**
Use Zustand for global state management, React Context for localized state.

**Rationale:**

- Minimal boilerplate compared to Redux
- Excellent TypeScript support
- Built-in persistence middleware
- No Provider wrapping needed
- Easy to test
- Small bundle size (~1KB)

**Alternatives Considered:**

- **Redux Toolkit:** More boilerplate, steeper learning curve
- **Jotai/Recoil:** Atom-based, more complex mental model
- **Context only:** Performance issues with frequent updates

**Consequences:**

- **Positive:** Less boilerplate, better DevEx, smaller bundle
- **Negative:** Less structured than Redux (requires discipline)
- **Risks:** May need Redux DevTools integration for debugging

---

### ADR-004: React Query for Server State

**Status:** Accepted  
**Date:** February 4, 2026

**Context:**
Need efficient data fetching, caching, and synchronization with backend APIs.

**Decision:**
Use TanStack Query (React Query) for all server state management.

**Rationale:**

- Automatic caching and invalidation
- Built-in loading and error states
- Optimistic updates
- Request deduplication
- Pagination and infinite scroll support
- Excellent DevTools

**Consequences:**

- **Positive:** Less boilerplate, automatic caching, better UX
- **Negative:** Learning curve for team
- **Risks:** Cache invalidation strategy must be well-defined

---

### ADR-005: Tailwind CSS + shadcn/ui

**Status:** Accepted  
**Date:** February 4, 2026

**Context:**
Need a scalable, maintainable styling solution with accessible components.

**Decision:**
Use Tailwind CSS for styling with shadcn/ui for component primitives.

**Rationale:**

- Utility-first approach reduces CSS bundle size
- shadcn/ui provides accessible, unstyled primitives
- Easy to customize and extend
- Excellent TypeScript support
- No runtime cost (build-time processing)

**Alternatives Considered:**

- **CSS Modules:** Verbose, more boilerplate
- **Styled Components:** Runtime cost, larger bundle
- **Chakra UI:** Less customizable, heavier

**Consequences:**

- **Positive:** Fast development, consistent design, smaller bundle
- **Negative:** Verbose className strings, learning curve
- **Risks:** May need custom design system later

---

## 16. Architecture Governance

### Architectural Consistency Maintenance

**Code Review Checklist:**

- [ ] Does this change respect layer boundaries?
- [ ] Are dependencies pointing in the correct direction?
- [ ] Is business logic in the domain layer (not UI)?
- [ ] Are infrastructure concerns abstracted behind interfaces?
- [ ] Do components use hooks instead of direct API calls?
- [ ] Is state management appropriate (global vs. local)?
- [ ] Are tests included for new functionality?
- [ ] Is documentation updated?

### Automated Architectural Checks

**ESLint Rules:**

```typescript
// eslint.config.js
export default [
  {
    files: ["src/features/**/*.tsx", "src/features/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../../*"],
              message: "Do not import from parent features. Use shared module.",
            },
            {
              group: ["**/infrastructure/**"],
              message: "UI components cannot import infrastructure directly.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.tsx", "src/shared/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/features/**"],
              message: "Shared module cannot depend on features.",
            },
          ],
        },
      ],
    },
  },
];
```

**Dependency Graph Validation:**

```json
// package.json
{
  "scripts": {
    "check:deps": "madge --circular --extensions ts,tsx src/",
    "check:boundaries": "eslint src/ --max-warnings=0"
  }
}
```

---

### Documentation Maintenance

**When to Update Architecture Docs:**

- Adding a new feature module
- Changing state management approach
- Introducing new infrastructure dependencies
- Making significant refactors
- Adding new architectural patterns
- Changing deployment strategy

**Documentation Review Cadence:**

- Quarterly architecture review meetings
- After major releases
- When onboarding new team members

---

## 17. Blueprint for Development

### Development Workflow

**Starting a New Feature:**

1. Create feature folder: `src/features/[feature-name]`
2. Define types: `types/[feature].types.ts`
3. Implement services: `services/[feature]Service.ts`
4. Create hooks: `hooks/use[Feature].ts`
5. Build components: `components/`
6. Export public API: `index.ts`
7. Write tests: `__tests__/`
8. Update documentation

---

### Component Creation Checklist

**For Every New Component:**

- [ ] Props interface defined with TypeScript
- [ ] Component is properly memoized (if needed)
- [ ] Accessibility attributes added (ARIA)
- [ ] Loading and error states handled
- [ ] Tests written (unit + integration)
- [ ] Storybook story created (if applicable)
- [ ] Documentation comments added

---

### Common Pitfalls to Avoid

**❌ Architecture Violations:**

1. **Direct API calls in components**

   ```typescript
   // BAD
   const MyComponent = () => {
     const [data, setData] = useState(null);
     useEffect(() => {
       fetch("/api/data")
         .then((r) => r.json())
         .then(setData);
     }, []);
   };

   // GOOD
   const MyComponent = () => {
     const { data } = useData(); // Custom hook
   };
   ```

2. **Business logic in components**

   ```typescript
   // BAD
   const handleSubmit = (formData) => {
     if (formData.email.includes("@")) {
       // validation logic in component
     }
   };

   // GOOD
   const handleSubmit = (formData) => {
     authService.validateAndSubmit(formData); // Logic in service
   };
   ```

3. **Feature interdependencies**

   ```typescript
   // BAD
   import { useAuth } from "@/features/auth";
   import { useMeeting } from "@/features/meeting";
   // Feature importing from another feature

   // GOOD
   // Use shared state or event bus for cross-feature communication
   ```

---

### Getting Started Guide

**Initial Setup:**

```bash
# 1. Clone repository
git clone <repo-url>
cd we-meet-client

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start development server
pnpm dev

# 5. Run tests
pnpm test

# 6. Open Storybook (for component development)
pnpm storybook
```

**First Components to Understand:**

1. `/src/App.tsx` - Application entry point and routing
2. `/src/features/auth/hooks/useAuth.ts` - Authentication pattern
3. `/src/features/meeting/components/MeetingRoom.tsx` - Complex component example
4. `/src/shared/components/ui/` - Reusable UI components

**Recommended Implementation Order:**

1. Authentication flow (login, logout, protected routes)
2. User profile management
3. Meeting creation and listing
4. Joining a meeting (WebSocket connection)
5. WebRTC peer connections
6. Audio/video controls
7. Chat functionality
8. Advanced features (recording, screen sharing)

---

### Verification Steps

**After Initial Setup:**

- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] TypeScript compiles (`pnpm typecheck`)
- [ ] Dev server starts (`pnpm dev`)
- [ ] Can navigate to login page
- [ ] Environment variables loaded correctly

---

## Conclusion

This architecture document provides a comprehensive blueprint for building the WeMeet Client application. It emphasizes:

- **Separation of Concerns:** Clear boundaries between layers
- **Testability:** All business logic is unit-testable
- **Scalability:** Feature-based structure supports team growth
- **Maintainability:** Consistent patterns and conventions
- **Performance:** Optimized rendering and bundle sizes
- **Type Safety:** Comprehensive TypeScript usage

**Next Steps:**

1. Review this document with the team
2. Set up the project structure
3. Implement core authentication feature
4. Establish CI/CD pipeline
5. Begin incremental feature development

**Document Status:** Draft - awaiting team review and approval

---

**Generated:** February 4, 2026  
**Last Updated:** February 4, 2026  
**Version:** 1.0
