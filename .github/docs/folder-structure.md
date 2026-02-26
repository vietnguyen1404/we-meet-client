# WeMeet Client - Folder Structure Documentation

**Generated:** February 4, 2026  
**Version:** 1.0  
**Project Type:** React 19 + TypeScript SPA

---

## Table of Contents

1. [Overview](#1-overview)
2. [Root Directory Structure](#2-root-directory-structure)
3. [Source Directory (`/src`)](#3-source-directory-src)
4. [Feature Modules (`/src/features`)](#4-feature-modules-srcfeatures)
5. [Shared Code (`/src/shared`)](#5-shared-code-srcshared)
6. [Library Code (`/src/lib`)](#6-library-code-srclib)
7. [Configuration Files](#7-configuration-files)
8. [Documentation (`/docs`)](#8-documentation-docs)
9. [Testing Structure](#9-testing-structure)
10. [File Naming Conventions](#10-file-naming-conventions)
11. [Adding New Features](#11-adding-new-features)
12. [Best Practices](#12-best-practices)

---

## 1. Overview

### Organizational Strategy

WeMeet Client follows a **feature-based modular architecture** with clear separation of concerns:

- **Features** (`/src/features/`) - Self-contained business domains
- **Shared** (`/src/shared/`) - Reusable UI components and utilities
- **Lib** (`/src/lib/`) - Infrastructure and external service integrations
- **Config** (`/src/config/`) - Application configuration

### Key Principles

1. **Feature Isolation:** Each feature is self-contained with its own components, hooks, services, and types
2. **Dependency Direction:** Features can use shared/lib, but not other features
3. **Public APIs:** Each feature exports only what's needed via `index.ts`
4. **Colocation:** Related files stay close together
5. **Flat Hierarchy:** Avoid deep nesting (max 3-4 levels)

---

## 2. Root Directory Structure

```
we-meet-client/
├── .github/                  # GitHub-specific configurations
│   ├── workflows/            # CI/CD workflows
│   ├── copilot-instructions.md # Copilot workspace instructions
│   ├── instructions/         # Context-specific Copilot instructions
│   └── prompts/              # Reusable Copilot prompts
├── .setup/                   # Setup automation and prompts
│   ├── agents/               # Setup agent configurations
│   ├── prompts/              # Setup prompt templates
│   └── workflows/            # Setup workflows
├── docs/                     # Project documentation
│   ├── architecture.md       # Architecture documentation
│   ├── tech-stack.md         # Technology stack documentation
│   ├── folder-structure.md   # This file
│   └── coding-standards.md   # Coding standards and conventions
├── public/                   # Static assets
│   ├── favicon.ico
│   └── images/               # Static images
├── src/                      # Source code (detailed below)
│   ├── features/             # Feature modules
│   ├── shared/               # Shared/reusable code
│   ├── lib/                  # Infrastructure code
│   ├── config/               # Configuration
│   ├── App.tsx               # Main App component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── .env.example              # Environment variables template
├── .env.development          # Development environment variables
├── .env.production           # Production environment variables
├── .gitignore                # Git ignore patterns
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── pnpm-lock.yaml            # Lock file for pnpm
├── postcss.config.js         # PostCSS configuration
├── README.md                 # Project README
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript base config
├── tsconfig.app.json         # TypeScript app config
├── tsconfig.node.json        # TypeScript Node config
└── vite.config.ts            # Vite build configuration
```

### Directory Purposes

| Directory  | Purpose                                     | Content Types                            |
| ---------- | ------------------------------------------- | ---------------------------------------- |
| `.github/` | GitHub configurations, CI/CD, Copilot setup | Workflows, actions, Copilot instructions |
| `.setup/`  | Project setup automation                    | Setup agents, prompts, workflows         |
| `docs/`    | Project documentation                       | Architecture, guides, standards          |
| `public/`  | Static assets served as-is                  | Images, fonts, favicon                   |
| `src/`     | Application source code                     | Components, hooks, services, types       |

---

## 3. Source Directory (`/src`)

```
src/
├── features/                 # Feature modules (business domains)
│   ├── auth/                 # Authentication feature
│   ├── meeting/              # Meeting feature
│   ├── chat/                 # Chat feature
│   ├── profile/              # User profile feature
│   └── [feature-name]/       # Additional features
├── shared/                   # Shared/reusable code
│   ├── components/           # Shared UI components
│   ├── hooks/                # Shared custom hooks
│   ├── utils/                # Utility functions
│   ├── types/                # Shared TypeScript types
│   └── constants/            # Application constants
├── lib/                      # Infrastructure & external integrations
│   ├── httpClient.ts         # HTTP client (Axios wrapper)
│   ├── websocketClient.ts    # WebSocket client
│   ├── webrtcClient.ts       # WebRTC client
│   ├── queryClient.ts        # React Query client
│   └── logger.ts             # Logging utility
├── config/                   # Application configuration
│   ├── env.ts                # Environment variables
│   ├── routes.tsx            # Route configuration
│   └── theme.ts              # Theme configuration
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
├── index.css                 # Global styles (Tailwind imports)
└── vite-env.d.ts             # Vite type declarations
```

### Key Files

- **`main.tsx`** - Application entry point, renders `<App />`
- **`App.tsx`** - Root component with providers, router, error boundaries
- **`index.css`** - Global CSS with Tailwind directives
- **`vite-env.d.ts`** - TypeScript declarations for Vite

---

## 4. Feature Modules (`/src/features`)

Each feature follows this standard structure:

```
features/
└── [feature-name]/
    ├── components/           # Feature-specific UI components
    │   ├── [Feature]Page.tsx
    │   ├── [Feature]Form.tsx
    │   ├── [Feature]Card.tsx
    │   └── ...
    ├── hooks/                # Feature-specific custom hooks
    │   ├── use[Feature].ts
    │   ├── use[Feature]Query.ts
    │   ├── use[Feature]Mutation.ts
    │   └── ...
    ├── services/             # Business logic services
    │   ├── [feature]Service.ts
    │   └── [feature]Api.ts
    ├── stores/               # Feature state (Zustand) - if needed
    │   └── [feature]Store.ts
    ├── types/                # Feature-specific TypeScript types
    │   └── [feature].types.ts
    ├── utils/                # Feature-specific utilities - if needed
    │   └── [feature]Utils.ts
    ├── __tests__/            # Feature tests
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    └── index.ts              # Public API exports
```

### Example: Authentication Feature

```
features/auth/
├── components/
│   ├── LoginPage.tsx         # Login page component
│   ├── RegisterPage.tsx      # Registration page component
│   ├── LoginForm.tsx         # Login form component
│   ├── RegisterForm.tsx      # Registration form component
│   └── ProtectedRoute.tsx    # Route protection HOC
├── hooks/
│   ├── useAuth.ts            # Main auth hook
│   ├── useLogin.ts           # Login mutation hook
│   ├── useRegister.ts        # Register mutation hook
│   └── useLogout.ts          # Logout mutation hook
├── services/
│   ├── authService.ts        # Auth business logic
│   └── authApi.ts            # Auth API calls
├── stores/
│   └── authStore.ts          # Auth global state (Zustand)
├── types/
│   └── auth.types.ts         # Auth-related types
└── index.ts                  # Public exports
```

**`index.ts` Example:**

```typescript
// Public API - only export what other modules need
export { LoginPage, RegisterPage, ProtectedRoute } from "./components";
export { useAuth } from "./hooks";
export type { User, LoginCredentials, RegisterData } from "./types/auth.types";
```

---

### Example: Meeting Feature

```
features/meeting/
├── components/
│   ├── MeetingRoomPage.tsx   # Main meeting room page
│   ├── MeetingListPage.tsx   # List of meetings
│   ├── CreateMeetingPage.tsx # Create meeting page
│   ├── MeetingRoom.tsx       # Meeting room container
│   ├── VideoGrid.tsx         # Video grid layout
│   ├── ParticipantTile.tsx   # Single participant video
│   ├── ControlBar.tsx        # Meeting controls
│   ├── SettingsPanel.tsx     # Meeting settings
│   └── LocalVideo.tsx        # Local user video
├── hooks/
│   ├── useMeeting.ts         # Main meeting hook
│   ├── useMeetingQuery.ts    # Fetch meeting data
│   ├── useCreateMeeting.ts   # Create meeting mutation
│   ├── useJoinMeeting.ts     # Join meeting logic
│   ├── useParticipants.ts    # Participant management
│   ├── useMediaStream.ts     # Local media stream
│   └── useWebRTC.ts          # WebRTC connections
├── services/
│   ├── meetingService.ts     # Meeting business logic
│   ├── meetingApi.ts         # Meeting API calls
│   ├── webrtcService.ts      # WebRTC service
│   └── signalingService.ts   # Signaling service
├── stores/
│   ├── meetingStore.ts       # Current meeting state
│   └── participantsStore.ts  # Participants state
├── types/
│   └── meeting.types.ts      # Meeting-related types
└── index.ts
```

---

### Example: Chat Feature

```
features/chat/
├── components/
│   ├── ChatPanel.tsx         # Chat panel container
│   ├── MessageList.tsx       # Message list
│   ├── MessageInput.tsx      # Message input field
│   └── MessageBubble.tsx     # Single message bubble
├── hooks/
│   ├── useChatMessages.ts    # Chat messages hook
│   └── useMessageInput.ts    # Message input hook
├── services/
│   └── chatService.ts        # Chat business logic
├── stores/
│   └── chatStore.ts          # Chat messages state
├── types/
│   └── chat.types.ts         # Chat-related types
└── index.ts
```

---

### Example: Profile Feature

```
features/profile/
├── components/
│   ├── ProfilePage.tsx       # Profile page
│   ├── ProfileForm.tsx       # Profile edit form
│   ├── AvatarUpload.tsx      # Avatar upload component
│   └── SubscriptionCard.tsx  # Subscription status card
├── hooks/
│   ├── useProfile.ts         # Profile hook
│   ├── useUpdateProfile.ts   # Update profile mutation
│   └── useSubscription.ts    # Subscription hook
├── services/
│   ├── profileService.ts     # Profile business logic
│   └── subscriptionService.ts # Subscription logic
├── types/
│   └── profile.types.ts      # Profile-related types
└── index.ts
```

---

## 5. Shared Code (`/src/shared`)

```
shared/
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── layout/               # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── common/               # Common components
│   │   ├── Spinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Avatar.tsx
│   │   └── Badge.tsx
│   └── feedback/             # Feedback components
│       ├── Toast.tsx
│       ├── Modal.tsx
│       └── ConfirmDialog.tsx
├── hooks/
│   ├── useDebounce.ts        # Debounce hook
│   ├── useLocalStorage.ts    # Local storage hook
│   ├── useMediaQuery.ts      # Media query hook
│   ├── useClickOutside.ts    # Click outside hook
│   └── useToggle.ts          # Toggle hook
├── utils/
│   ├── formatters.ts         # Formatting utilities
│   ├── validators.ts         # Validation utilities
│   ├── date.ts               # Date utilities
│   ├── string.ts             # String utilities
│   └── cn.ts                 # className utility (clsx + tailwind-merge)
├── types/
│   ├── common.types.ts       # Common types
│   ├── api.types.ts          # API-related types
│   └── index.ts              # Type exports
├── constants/
│   ├── routes.ts             # Route constants
│   ├── apiEndpoints.ts       # API endpoint constants
│   └── appConfig.ts          # App configuration constants
└── index.ts                  # Public exports
```

### Shared Components Guidelines

**UI Components (`/ui`):**

- Base components from shadcn/ui
- Low-level, generic, highly reusable
- No business logic
- Fully customizable via props

**Layout Components (`/layout`):**

- App-level layout structure
- Navigation components
- Page wrappers

**Common Components (`/common`):**

- Application-specific reusable components
- May contain minimal business logic
- Used across multiple features

**Feedback Components (`/feedback`):**

- User feedback mechanisms
- Toasts, modals, dialogs
- Confirmation prompts

---

## 6. Library Code (`/src/lib`)

```
lib/
├── httpClient.ts             # Axios HTTP client with interceptors
├── websocketClient.ts        # WebSocket client wrapper
├── webrtcClient.ts           # WebRTC client wrapper
├── queryClient.ts            # React Query client configuration
├── logger.ts                 # Logging utility
├── storage.ts                # Storage abstraction (localStorage/sessionStorage)
├── eventBus.ts               # Event bus for cross-feature communication
└── analytics.ts              # Analytics integration
```

### Purpose

Infrastructure code that abstracts external dependencies:

- **HTTP Client:** Axios wrapper with auth interceptors
- **WebSocket Client:** Real-time communication abstraction
- **WebRTC Client:** Peer connection management
- **Query Client:** React Query configuration
- **Logger:** Structured logging
- **Storage:** LocalStorage/SessionStorage abstraction
- **Event Bus:** Cross-feature event system
- **Analytics:** Analytics tracking

---

## 7. Configuration Files

```
config/
├── env.ts                    # Environment variables (type-safe)
├── routes.tsx                # Route configuration
├── theme.ts                  # Theme configuration
└── constants.ts              # App-wide constants
```

**env.ts Example:**

```typescript
export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
```

**routes.tsx Example:**

```typescript
export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Route definitions
    ],
  },
]);
```

---

## 8. Documentation (`/docs`)

```
docs/
├── architecture.md           # System architecture
├── tech-stack.md             # Technology stack
├── folder-structure.md       # This file
├── coding-standards.md       # Coding standards
├── api/                      # API documentation
│   └── endpoints.md
└── guides/                   # Development guides
    ├── getting-started.md
    ├── webrtc-setup.md
    └── deployment.md
```

---

## 9. Testing Structure

Tests are colocated with the code they test using `__tests__` directories:

```
features/auth/
├── components/
├── hooks/
├── services/
└── __tests__/
    ├── components/
    │   ├── LoginForm.test.tsx
    │   └── RegisterForm.test.tsx
    ├── hooks/
    │   └── useAuth.test.ts
    └── services/
        └── authService.test.ts
```

**E2E Tests:**

```
e2e/
├── auth.spec.ts              # Auth flow tests
├── meeting.spec.ts           # Meeting flow tests
└── chat.spec.ts              # Chat flow tests
```

---

## 10. File Naming Conventions

### React Components

- **PascalCase** for component files: `MeetingRoom.tsx`, `LoginForm.tsx`
- Component name matches file name: `MeetingRoom.tsx` exports `MeetingRoom`
- Page components end with `Page`: `MeetingRoomPage.tsx`

### Hooks

- **camelCase** with `use` prefix: `useAuth.ts`, `useMeeting.ts`
- Hook name matches file name: `useAuth.ts` exports `useAuth`

### Services

- **camelCase** with `Service` suffix: `authService.ts`, `meetingService.ts`
- Export as object or class

### Types

- **camelCase** with `.types.ts` suffix: `auth.types.ts`, `meeting.types.ts`
- Export interfaces and types

### Utilities

- **camelCase**: `formatters.ts`, `validators.ts`, `date.ts`

### Constants

- **camelCase**: `routes.ts`, `apiEndpoints.ts`, `appConfig.ts`
- Export as const objects

### Stores (Zustand)

- **camelCase** with `Store` suffix: `authStore.ts`, `meetingStore.ts`
- Hook pattern: `useAuthStore`, `useMeetingStore`

---

## 11. Adding New Features

### Step-by-Step Checklist

1. **Create feature directory:**

   ```bash
   mkdir -p src/features/[feature-name]/{components,hooks,services,types}
   ```

2. **Add types first:**

   ```typescript
   // src/features/[feature]/types/[feature].types.ts
   export interface Feature {
     id: string;
     // ...
   }
   ```

3. **Implement services:**

   ```typescript
   // src/features/[feature]/services/[feature]Service.ts
   export const featureService = {
     // Business logic
   };
   ```

4. **Create custom hooks:**

   ```typescript
   // src/features/[feature]/hooks/use[Feature].ts
   export const useFeature = () => {
     // Hook logic
   };
   ```

5. **Build components:**

   ```typescript
   // src/features/[feature]/components/[Feature]Page.tsx
   export const FeaturePage = () => {
     // Component
   };
   ```

6. **Export public API:**

   ```typescript
   // src/features/[feature]/index.ts
   export { FeaturePage } from "./components";
   export { useFeature } from "./hooks";
   export type { Feature } from "./types/[feature].types";
   ```

7. **Add routes (if needed):**

   ```typescript
   // src/config/routes.tsx
   {
     path: '/feature',
     element: <FeaturePage />,
   }
   ```

8. **Write tests:**
   ```bash
   mkdir -p src/features/[feature]/__tests__/{components,hooks,services}
   ```

---

## 12. Best Practices

### Feature Organization

✅ **DO:**

- Keep features self-contained
- Export only necessary items via `index.ts`
- Colocate related files
- Use clear, descriptive names

❌ **DON'T:**

- Import from other features directly
- Create circular dependencies
- Mix business logic in components
- Deeply nest directories (max 3-4 levels)

---

### Shared Code

✅ **DO:**

- Make shared components generic and reusable
- Document shared utilities
- Keep shared code stable

❌ **DON'T:**

- Put feature-specific logic in shared
- Over-abstract prematurely
- Create god utilities

---

### Import Organization

**Order:**

1. External dependencies (React, third-party)
2. Internal absolute imports (`@/features`, `@/shared`)
3. Relative imports (`./`, `../`)

**Example:**

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

---

### TypeScript Path Aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/config/*": ["./src/config/*"]
    }
  }
}
```

**Usage:**

```typescript
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { httpClient } from "@/lib/httpClient";
import { env } from "@/config/env";
```

---

## Quick Reference

### Feature Template

```
features/[feature]/
├── components/
├── hooks/
├── services/
├── stores/ (optional)
├── types/
├── __tests__/
└── index.ts
```

### Shared Component Template

```
shared/components/
├── ui/ (shadcn/ui)
├── layout/
├── common/
└── feedback/
```

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services: `camelCaseService.ts`
- Types: `camelCase.types.ts`
- Utils: `camelCase.ts`

---

**Generated:** February 4, 2026  
**Last Updated:** February 4, 2026  
**Version:** 1.0
