# WeMeet Client - Technology Stack Documentation

**Generated:** February 4, 2026  
**Version:** 1.0  
**Type:** Implementation-Ready Technology Blueprint

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Core Technologies](#2-core-technologies)
3. [Frontend Framework Stack](#3-frontend-framework-stack)
4. [State Management](#4-state-management)
5. [Styling & UI Components](#5-styling--ui-components)
6. [Build Tools & Development](#6-build-tools--development)
7. [Code Quality & Testing](#7-code-quality--testing)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [External APIs & Services](#9-external-apis--services)
10. [Technology Relationship Diagrams](#10-technology-relationship-diagrams)
11. [Implementation Patterns](#11-implementation-patterns)
12. [Technology Decision Rationale](#12-technology-decision-rationale)
13. [Upgrade & Migration Path](#13-upgrade--migration-path)

---

## 1. Stack Overview

### Technology Category Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    WeMeet Tech Stack                         │
├─────────────────────────────────────────────────────────────┤
│  Language:           TypeScript 5.9+                         │
│  Framework:          React 19.2                              │
│  Build Tool:         Vite 7.2                                │
│  Package Manager:    pnpm 8+                                 │
│  Styling:            Tailwind CSS 4 + shadcn/ui              │
│  State Management:   Zustand + TanStack Query                │
│  Real-time:          WebSocket + WebRTC                      │
│  Deployment:         Static Hosting (Vercel/Netlify)         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack by Layer

| Layer              | Technologies                        | Purpose                                          |
| ------------------ | ----------------------------------- | ------------------------------------------------ |
| **Language**       | TypeScript 5.9                      | Type safety, improved developer experience       |
| **UI Framework**   | React 19.2                          | Component-based UI, React Compiler optimizations |
| **Build & Dev**    | Vite 7.2                            | Fast HMR, optimized bundling                     |
| **Styling**        | Tailwind CSS 4, shadcn/ui           | Utility-first CSS, accessible components         |
| **State - Global** | Zustand                             | Lightweight global state                         |
| **State - Server** | TanStack Query (React Query)        | Server state caching and synchronization         |
| **Routing**        | React Router 6+                     | Client-side routing                              |
| **Forms**          | React Hook Form + Zod               | Form state management, validation                |
| **Real-time**      | WebSocket, WebRTC                   | Live meeting communication                       |
| **HTTP Client**    | Axios                               | API communication                                |
| **Testing**        | Vitest, Testing Library, Playwright | Unit, integration, E2E testing                   |
| **Code Quality**   | ESLint, TypeScript                  | Linting, type checking                           |
| **Deployment**     | Vercel/Netlify                      | Static site hosting, CDN                         |

---

## 2. Core Technologies

### 2.1 TypeScript 5.9+

**Version:** `~5.9.3`  
**License:** Apache-2.0  
**Purpose:** Primary programming language

**Configuration:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Key Features Used:**

- Strict mode for maximum type safety
- Path aliases for clean imports
- ES2022 target for modern JavaScript features
- React JSX transform

**Usage Patterns:**

```typescript
// Strict typing for all functions
function createMeeting(data: CreateMeetingDto): Promise<Meeting> {
  // Implementation
}

// Interface-driven development
interface MeetingService {
  createMeeting(data: CreateMeetingDto): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting>;
}

// Generic types for reusable components
function DataList<T>({ items, renderItem }: DataListProps<T>) {
  // Implementation
}
```

---

### 2.2 React 19.2

**Version:** `^19.2.0`  
**License:** MIT  
**Purpose:** UI framework

**Key Features:**

- **React Compiler:** Automatic memoization and optimization
- **Hooks-based architecture:** Function components only
- **Concurrent features:** Improved rendering performance
- **Server Components ready:** Future enhancement path

**React Compiler Configuration:**

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});
```

**Architecture Patterns:**

- Function components with hooks
- Custom hooks for business logic
- Context API for localized state
- Error boundaries for error handling

---

### 2.3 Node.js & pnpm

**Node Version:** `20.x LTS`  
**pnpm Version:** `8.x`

**Why pnpm:**

- Faster installation (symlinks, hard links)
- Strict dependency resolution (no phantom dependencies)
- Disk space efficiency
- Monorepo-ready (future scaling)

**Package Management:**

```bash
# Install dependencies
pnpm install

# Add dependency
pnpm add <package>

# Add dev dependency
pnpm add -D <package>

# Update dependencies
pnpm update
```

---

## 3. Frontend Framework Stack

### 3.1 React 19 Implementation Details

**Component Structure:**

```typescript
// Presentation component (pure)
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

// Container component (with logic)
export const MeetingCardContainer = ({ meetingId }: { meetingId: string }) => {
  const { data: meeting } = useMeeting(meetingId);
  const { mutate: joinMeeting } = useJoinMeeting();

  if (!meeting) return <Skeleton />;

  return <MeetingCard meeting={meeting} onJoin={joinMeeting} />;
};
```

**Hook Patterns:**

```typescript
// Custom hook for meeting logic
export const useMeeting = (meetingId: string) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { data: meeting } = useMeetingQuery(meetingId);
  const { isConnected } = useWebSocket(meetingId);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = wsClient.on("participant-joined", (participant) => {
      setParticipants((prev) => [...prev, participant]);
    });

    return unsubscribe;
  }, [isConnected]);

  return { meeting, participants, isConnected };
};
```

**Error Boundary Usage:**

```typescript
// App-level error boundary
<ErrorBoundary fallback={<ErrorPage />}>
  <RouterProvider router={router} />
</ErrorBoundary>

// Feature-level error boundary
<ErrorBoundary fallback={<MeetingError />}>
  <MeetingRoom meetingId={id} />
</ErrorBoundary>
```

---

### 3.2 React Router 6+

**Version:** `^6.x`  
**License:** MIT  
**Purpose:** Client-side routing

**Route Configuration:**

```typescript
// Router setup with data loading
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "meetings",
        element: (
          <ProtectedRoute>
            <MeetingsLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <MeetingListPage />,
          },
          {
            path: ":meetingId",
            element: <MeetingRoomPage />,
            loader: async ({ params }) => {
              // Prefetch meeting data
              return queryClient.fetchQuery({
                queryKey: ["meeting", params.meetingId],
                queryFn: () => meetingApi.getMeeting(params.meetingId!),
              });
            },
          },
        ],
      },
    ],
  },
]);
```

**Protected Route Pattern:**

```typescript
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

---

### 3.3 Vite 7.2

**Version:** `^7.2.4`  
**License:** MIT  
**Purpose:** Build tool and dev server

**Key Features:**

- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ES modules in development
- Plugin ecosystem

**Configuration:**

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
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
```

**Build Optimization:**

- Code splitting by route
- Vendor chunking for better caching
- Tree-shaking for minimal bundle size
- Source maps for debugging

---

## 4. State Management

### 4.1 Zustand

**Version:** Latest  
**License:** MIT  
**Purpose:** Global client state management

**Why Zustand:**

- Minimal boilerplate (no providers, no reducers)
- Excellent TypeScript support
- Built-in middleware (persist, devtools)
- Small bundle size (~1KB)
- No re-render issues

**Store Implementation:**

```typescript
// stores/authStore.ts
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        login: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user }),
      }
    )
  )
);
```

**Usage Pattern:**

```typescript
// Component usage
const MyComponent = () => {
  const { user, login, logout } = useAuthStore();

  // Can also select specific fields for optimization
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={() => login(mockUser)}>Login</button>
      )}
    </div>
  );
};
```

**Store Organization:**

```
stores/
├── authStore.ts       # Authentication state
├── meetingStore.ts    # Active meeting state
├── participantStore.ts # Participant list
├── chatStore.ts       # Chat messages
└── settingsStore.ts   # User preferences
```

---

### 4.2 TanStack Query (React Query)

**Version:** `^5.x`  
**License:** MIT  
**Purpose:** Server state management, caching, synchronization

**Why React Query:**

- Automatic caching and background refetching
- Optimistic updates
- Request deduplication
- Pagination and infinite scroll
- Excellent DevTools

**Configuration:**

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// App.tsx
import { QueryClientProvider } from "@tanstack/react-query";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

**Query Pattern:**

```typescript
// hooks/useMeetings.ts
export const useMeetings = () => {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await httpClient.get<Meeting[]>("/meetings");
      return response.data;
    },
  });
};

// Component usage
const MeetingList = () => {
  const { data: meetings, isLoading, error } = useMeetings();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
};
```

**Mutation Pattern:**

```typescript
// hooks/useCreateMeeting.ts
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMeetingDto) => {
      const response = await httpClient.post<Meeting>("/meetings", data);
      return response.data;
    },
    onSuccess: (newMeeting) => {
      // Invalidate and refetch meetings list
      queryClient.invalidateQueries({ queryKey: ["meetings"] });

      // Optimistically add to cache
      queryClient.setQueryData(["meeting", newMeeting.id], newMeeting);
    },
  });
};
```

---

### 4.3 React Context (Localized State)

**Purpose:** Feature-scoped state that doesn't need global access

**Usage Pattern:**

```typescript
// features/meeting/context/MeetingContext.tsx
interface MeetingContextValue {
  localStream: MediaStream | null;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

const MeetingContext = createContext<MeetingContextValue | null>(null);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
    }
  }, [localStream]);

  return (
    <MeetingContext.Provider value={{ localStream, toggleAudio, toggleVideo }}>
      {children}
    </MeetingContext.Provider>
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

## 5. Styling & UI Components

### 5.1 Tailwind CSS 4

**Version:** `^4.x`  
**License:** MIT  
**Purpose:** Utility-first CSS framework

**Configuration:**

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

**Usage Patterns:**

```tsx
// Utility classes for rapid development
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
  Join Meeting
</button>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>

// Dark mode support (future)
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  {/* Content */}
</div>
```

**Custom Utilities:**

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

---

### 5.2 shadcn/ui

**Version:** Latest (components copied to project)  
**License:** MIT  
**Purpose:** Accessible, unstyled component primitives

**Why shadcn/ui:**

- Copy components directly to your project (full control)
- Built on Radix UI (accessibility-first)
- Fully customizable with Tailwind
- TypeScript support
- No runtime dependency

**Component Structure:**

```
src/shared/components/ui/
├── button.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── select.tsx
├── toast.tsx
└── ...
```

**Usage Example:**

```tsx
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/shared/components/ui/dialog";

export const CreateMeetingDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Meeting</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
        </DialogHeader>
        <CreateMeetingForm />
      </DialogContent>
    </Dialog>
  );
};
```

**Customization:**

```tsx
// Extend base components
import { Button as BaseButton } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

export const PrimaryButton = ({ className, ...props }: ButtonProps) => {
  return (
    <BaseButton
      className={cn("bg-primary-500 hover:bg-primary-600", className)}
      {...props}
    />
  );
};
```

---

### 5.3 Additional UI Libraries

**Radix UI Primitives:**

- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-select` - Select components
- `@radix-ui/react-tooltip` - Tooltips

**Icons:**

- `lucide-react` or `react-icons` for icon library

**Animation:**

- `framer-motion` for complex animations (optional)
- CSS transitions for simple animations

---

## 6. Build Tools & Development

### 6.1 Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "babel-plugin-react-compiler": "^1.0.0",
    "typescript": "~5.9.3",
    "vite": "^7.2.4"
  }
}
```

### 6.2 Environment Variables

**Structure:**

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_WEBRTC_STUN_URL=stun:stun.l.google.com:19302
VITE_SENTRY_DSN=
VITE_ANALYTICS_ID=

# .env.production
VITE_API_URL=https://api.wemeet.com/api
VITE_WS_URL=wss://ws.wemeet.com
VITE_WEBRTC_STUN_URL=stun:stun.wemeet.com:3478
VITE_SENTRY_DSN=https://...
VITE_ANALYTICS_ID=...
```

**Type-safe Environment Variables:**

```typescript
// env.ts
interface ImportMetaEnv {
  VITE_API_URL: string;
  VITE_WS_URL: string;
  VITE_WEBRTC_STUN_URL: string;
  VITE_SENTRY_DSN?: string;
  VITE_ANALYTICS_ID?: string;
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
  stunUrl: import.meta.env.VITE_WEBRTC_STUN_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
```

---

## 7. Code Quality & Testing

### 7.1 ESLint

**Version:** `^9.39.1`  
**License:** MIT  
**Purpose:** JavaScript/TypeScript linting

**Configuration:**

```javascript
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  }
);
```

---

### 7.2 Testing Stack

**Unit & Integration Testing:**

- **Vitest** `^1.x` - Fast unit test runner (Vite-native)
- **@testing-library/react** `^14.x` - React component testing
- **@testing-library/user-event** `^14.x` - User interaction simulation

**E2E Testing:**

- **Playwright** `^1.x` - Cross-browser E2E testing

**Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

**Testing Patterns:**

```typescript
// Component test
import { render, screen, fireEvent } from "@testing-library/react";
import { MeetingCard } from "./MeetingCard";

describe("MeetingCard", () => {
  it("should call onJoin when join button is clicked", () => {
    const onJoin = vi.fn();
    const meeting = { id: "1", title: "Test Meeting" };

    render(<MeetingCard meeting={meeting} onJoin={onJoin} />);

    const joinButton = screen.getByRole("button", { name: /join/i });
    fireEvent.click(joinButton);

    expect(onJoin).toHaveBeenCalledWith("1");
  });
});
```

---

## 8. Infrastructure & Deployment

### 8.1 HTTP Client - Axios

**Version:** `^1.x`  
**License:** MIT  
**Purpose:** HTTP requests

**Configuration:**

```typescript
// lib/httpClient.ts
import axios from "axios";
import { env } from "@/config/env";

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (add auth token)
httpClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error);
  }
);
```

---

### 8.2 WebSocket Client

**Technology:** Native WebSocket API  
**Purpose:** Real-time bidirectional communication

**Implementation:**

```typescript
// lib/websocketClient.ts
class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();

  async connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => resolve();
      this.ws.onerror = (error) => reject(error);
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.emit(message.type, message.payload);
      };
    });
  }

  send<T>(type: string, payload: T): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  on<T>(event: string, handler: (data: T) => void): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => this.handlers.get(event)?.delete(handler);
  }
}

export const wsClient = new WebSocketClient();
```

---

### 8.3 WebRTC

**Technology:** Native WebRTC API  
**Purpose:** Peer-to-peer audio/video communication

**Libraries:**

- Native `RTCPeerConnection` API
- Optionally: `simple-peer` for simplified peer connections

**Implementation Pattern:**

```typescript
// services/webrtcService.ts
class WebRTCService {
  private peers = new Map<string, RTCPeerConnection>();
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: env.stunUrl },
    ],
  };

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(this.configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsClient.send("ice-candidate", {
          peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      // Handle remote stream
    };

    this.peers.set(peerId, pc);
    return pc;
  }
}

export const webrtcService = new WebRTCService();
```

---

### 8.4 Deployment

**Hosting Platform:** Vercel, Netlify, or CloudFlare Pages

**Deployment Configuration:**

```json
// vercel.json
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

**CI/CD Pipeline:**

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 9. External APIs & Services

### 9.1 Backend APIs

**Authentication API:**

- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- POST `/api/auth/refresh` - Refresh access token
- POST `/api/auth/logout` - User logout

**Meeting API:**

- GET `/api/meetings` - List user meetings
- POST `/api/meetings` - Create new meeting
- GET `/api/meetings/:id` - Get meeting details
- PATCH `/api/meetings/:id` - Update meeting
- DELETE `/api/meetings/:id` - Delete meeting

**User API:**

- GET `/api/users/me` - Get current user
- PATCH `/api/users/me` - Update user profile
- GET `/api/users/:id` - Get user by ID

---

### 9.2 Third-party Services

**Error Tracking:**

- **Sentry** - Error monitoring and performance tracking

**Analytics:**

- **PostHog** or **Mixpanel** - User analytics and event tracking

**Payment Processing:**

- **Stripe** - Subscription and payment management

**Cloud Storage:**

- **AWS S3** or **CloudFlare R2** - Meeting recordings storage

---

## 10. Technology Relationship Diagrams

### Stack Dependency Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Runtime                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐                                             │
│  │   React 19  │  ← Uses                                     │
│  └─────────────┘                                             │
│        ↓                                                      │
│  ┌─────────────┐    ┌────────────────┐    ┌──────────────┐ │
│  │  Components │ ←─→│  Custom Hooks  │ ←─→│  Services    │ │
│  └─────────────┘    └────────────────┘    └──────────────┘ │
│        ↓                   ↓                       ↓         │
│  ┌─────────────┐    ┌────────────────┐    ┌──────────────┐ │
│  │  Tailwind   │    │    Zustand     │    │  Axios       │ │
│  │  + shadcn   │    │  React Query   │    │  WebSocket   │ │
│  └─────────────┘    └────────────────┘    │  WebRTC      │ │
│                                            └──────────────┘ │
│                                                    ↓         │
│                                            ┌──────────────┐ │
│                                            │  Backend API │ │
│                                            │  Signaling   │ │
│                                            └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Interaction
      ↓
┌───────────────┐
│   Component   │
└───────────────┘
      ↓
┌───────────────┐
│  Custom Hook  │
└───────────────┘
      ↓
┌───────────────────────────┐
│  State Management         │
│  ┌─────────┐ ┌──────────┐│
│  │ Zustand │ │  React   ││
│  │         │ │  Query   ││
│  └─────────┘ └──────────┘│
└───────────────────────────┘
      ↓               ↓
┌──────────┐   ┌──────────────┐
│  Service │   │  API Client  │
└──────────┘   └──────────────┘
                     ↓
              ┌──────────────┐
              │  HTTP/WS     │
              │  WebRTC      │
              └──────────────┘
                     ↓
              Backend Services
```

---

## 11. Implementation Patterns

### 11.1 Feature Implementation Template

**File Structure:**

```
features/[feature-name]/
├── components/
│   ├── [Feature]Page.tsx
│   ├── [Feature]Form.tsx
│   └── [Feature]Card.tsx
├── hooks/
│   ├── use[Feature].ts
│   └── use[Feature]Query.ts
├── services/
│   └── [feature]Service.ts
├── stores/
│   └── [feature]Store.ts (if needed)
├── types/
│   └── [feature].types.ts
└── index.ts (public exports)
```

---

### 11.2 Component Template

```typescript
// features/[feature]/components/[Feature]Card.tsx
import { type FC } from "react";

interface FeatureCardProps {
  data: FeatureData;
  onAction: (id: string) => void;
}

export const FeatureCard: FC<FeatureCardProps> = ({ data, onAction }) => {
  return (
    <div className="card">
      <h3>{data.title}</h3>
      <button onClick={() => onAction(data.id)}>Action</button>
    </div>
  );
};
```

---

### 11.3 Custom Hook Template

```typescript
// features/[feature]/hooks/use[Feature].ts
export const useFeature = (id: string) => {
  const [state, setState] = useState<FeatureState>(initialState);
  const { data } = useFeatureQuery(id);

  useEffect(() => {
    // Side effects
  }, [id]);

  const handleAction = useCallback(() => {
    // Action logic
  }, []);

  return { state, data, handleAction };
};
```

---

### 11.4 Service Template

```typescript
// features/[feature]/services/featureService.ts
export const featureService = {
  async getFeature(id: string): Promise<Feature> {
    return httpClient.get(`/features/${id}`);
  },

  async createFeature(data: CreateFeatureDto): Promise<Feature> {
    return httpClient.post("/features", data);
  },

  async updateFeature(id: string, data: UpdateFeatureDto): Promise<Feature> {
    return httpClient.patch(`/features/${id}`, data);
  },

  async deleteFeature(id: string): Promise<void> {
    return httpClient.delete(`/features/${id}`);
  },
};
```

---

## 12. Technology Decision Rationale

### React 19 vs Alternatives

**Chosen:** React 19  
**Alternatives Considered:** Vue 3, Svelte, Angular

**Rationale:**

- React Compiler automatic optimizations
- Largest ecosystem for WebRTC
- Strong TypeScript support
- Team expertise
- Future-ready (Server Components)

---

### Zustand vs Redux

**Chosen:** Zustand  
**Alternatives Considered:** Redux Toolkit, Jotai, Recoil

**Rationale:**

- Minimal boilerplate
- Better developer experience
- Smaller bundle size
- Easier to test
- Sufficient for app complexity

---

### Vite vs Webpack

**Chosen:** Vite  
**Alternatives Considered:** Webpack, Parcel, esbuild

**Rationale:**

- Fastest HMR
- Native ES modules
- Simpler configuration
- Better DX
- Modern default

---

### Tailwind vs CSS-in-JS

**Chosen:** Tailwind CSS  
**Alternatives Considered:** Styled Components, Emotion, CSS Modules

**Rationale:**

- No runtime cost
- Smaller bundle size
- Faster development
- Consistent design system
- Excellent with shadcn/ui

---

## 13. Upgrade & Migration Path

### Short-term (3-6 months)

**Planned Additions:**

- React Router 7 (when stable)
- Storybook for component documentation
- MSW for API mocking in tests
- Sentry integration for error tracking

---

### Medium-term (6-12 months)

**Potential Upgrades:**

- React 20 (when released)
- Server Components (for marketing pages)
- Edge functions (API optimization)
- Advanced WebRTC features (SFU integration)

---

### Long-term (1+ years)

**Architectural Considerations:**

- Micro-frontend architecture (if team scales)
- Monorepo with pnpm workspaces
- Native mobile apps (React Native)
- Desktop app (Electron/Tauri)

---

## Version History

| Version | Date        | Changes                                |
| ------- | ----------- | -------------------------------------- |
| 1.0     | Feb 4, 2026 | Initial technology stack documentation |

---

**Generated:** February 4, 2026  
**Last Updated:** February 4, 2026  
**Maintainer:** Development Team
