---
description: 'ReactJS + TypeScript development standards and best practices'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss'
---

# React + TypeScript Development Instructions

Standards for building scalable, maintainable React applications using TypeScript, modern hooks, and consistent architectural patterns.

---

## 1. Architecture

- Functional components with hooks as the **only** pattern — no class components
- Feature/domain-based folder organization
- Separate presentational and container components
- Custom hooks for all reusable stateful logic
- Composition over inheritance — always

### Folder Structure

```
src/
  assets/
    icons/          # SVG icons only (imported as React components)
  components/
    layout/         # Header, Footer, Sidebar, PageLayout
    ui/             # Button, Input, Modal, Card, Tooltip
      Typography/   # Heading, Text
  features/         # Domain-specific feature modules
  hooks/            # Shared custom hooks
  constants/        # Enums, flags, role maps
  styles/
    _variables.scss
    _mixins.scss
    global.scss
  pages/            # Route-level page components
```

---

## 2. TypeScript

- `strict: true` in `tsconfig.json` — non-negotiable
- Interfaces for props, state, and API shapes
- No `any` — use `unknown` and narrow explicitly
- Use React built-in types: `React.ReactNode`, `React.ComponentProps`, `React.RefObject`
- Union types for variants and states

```ts
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
}
```

---

## 3. Component Design

### Rules
- One component per file, exported via `index.ts`
- PascalCase for components, camelCase for functions/hooks
- No raw `h1–h6`, `p`, or `span` in pages — use the Typography system
- No page-specific logic inside shared/UI components
- No hardcoded UI text — all strings go through i18n

### Component Categories

#### A. Layout Components
Structure only — no business logic, no API calls.

```tsx
export function PageLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex flex-col">{children}</div>;
}
```

#### B. UI Components
Reusable building blocks, styled with Tailwind, variant-driven.

```tsx
export function Button({ variant = 'primary', children }: ButtonProps) {
  const styles: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white',
    secondary: 'bg-muted text-foreground',
    ghost: 'bg-transparent hover:bg-muted',
  };
  return (
    <button className={`px-4 py-2 rounded ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

#### C. Typography System
Centralized — never bypass it.

```tsx
// Heading.tsx
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function Heading({ level = 1, children }: { level?: HeadingLevel; children: React.ReactNode }) {
  const Tag = `h${level}` as const;
  const styles: Record<HeadingLevel, string> = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-semibold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-medium',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
  };
  return <Tag className={styles[level]}>{children}</Tag>;
}

// Text.tsx
type TextVariant = 'body' | 'caption' | 'muted';

export function Text({ variant = 'body', children }: { variant?: TextVariant; children: React.ReactNode }) {
  const styles: Record<TextVariant, string> = {
    body: 'text-base text-foreground',
    caption: 'text-sm text-muted-foreground',
    muted: 'text-sm text-muted-foreground/80',
  };
  return <p className={styles[variant]}>{children}</p>;
}
```

#### D. Page Components
Compose layout + UI only — no inline logic, no raw HTML tags.

```tsx
export default function HomePage() {
  return (
    <PageLayout>
      <Header />
      <main className="p-6">
        <Heading level={1}>{t('home.title')}</Heading>
        <Text>{t('home.description')}</Text>
        <Button variant="primary">{t('home.cta')}</Button>
      </main>
    </PageLayout>
  );
}
```

---

## 4. Constants & Enums

Never hardcode string comparisons. Centralize all enums and derived state flags.

```ts
// constants/meeting.ts
export enum MeetingPhase {
  PRE_JOIN = 'PRE_JOIN',
  JOINING  = 'JOINING',
  IN_CALL  = 'IN_CALL',
}

export const MeetingPhaseFlags = {
  isPreJoin: (p: MeetingPhase) => p === MeetingPhase.PRE_JOIN,
  isJoining: (p: MeetingPhase) => p === MeetingPhase.JOINING,
  isInCall:  (p: MeetingPhase) => p === MeetingPhase.IN_CALL,
};

export const MEETING_ROLE = {
  HOST:        'HOST',
  PARTICIPANT: 'PARTICIPANT',
} as const;

export type MeetingRole = typeof MEETING_ROLE[keyof typeof MEETING_ROLE];
```

**Usage:**
```ts
// ✅
if (MeetingPhaseFlags.isJoining(phase)) { ... }
if (member.role === MEETING_ROLE.HOST) { ... }

// ❌
if (phase === 'JOINING') { ... }
const isJoining = phase === 'JOINING';
```

---

## 5. Internationalization (i18n)

All user-facing text must go through translation keys — no exceptions.

```ts
// ✅
const { t } = useTranslation();
<span>{t('meeting.role.host')}</span>

// ❌
<span>Host</span>
```

Translation keys follow feature-based namespaces:

```json
{
  "meeting": {
    "role": { "host": "Host", "participant": "Participant" }
  }
}
```

---

## 6. SVG Icons

All SVGs imported as React components via the `?react` suffix.

```ts
// ✅
import EyeOffIcon from '@/assets/icons/eye-off.svg?react';
<EyeOffIcon className="w-4 h-4 text-muted-foreground" />

// ❌
<img src="/icons/eye-off.svg" />
<svg>...</svg>  {/* inline */}
```

Rules:
- Icons live under `@/assets/icons`
- Size via Tailwind `w-*` / `h-*` or `size-*`
- Color via `text-*` (SVG must use `currentColor`)

---

## 7. Styling

### Priority Order
1. **Tailwind utilities** — default for everything
2. **SCSS** — only for complex animations, theming, 3rd-party overrides, reusable patterns

### `index.css` — Directives & imports only
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './styles/variables.scss';
@import './styles/global.scss';
```

### SCSS Structure
```
src/styles/
  _variables.scss
  _mixins.scss
  global.scss
  components/
    _meeting.scss
```

Rules:
- Partials prefixed with `_`
- No scattered CSS files in feature folders
- No inline `<style>` tags
- No styling mixed with business logic

---

## 8. State Management

| Scope | Tool |
|---|---|
| Local UI state | `useState` |
| Complex local logic | `useReducer` |
| Cross-tree sharing | `useContext` |
| Server/async state | React Query or SWR |
| Global app state | Redux Toolkit or Zustand |

---

## 9. Hooks & Effects

- Always provide dependency arrays in `useEffect`
- Always return cleanup functions where side effects exist
- `useMemo` / `useCallback` only when profiling confirms a need — avoid premature optimization
- Custom hooks for any logic used in 2+ components
- Hooks only at top level — never inside conditions or loops

---

## 10. Data Fetching

- React Query or SWR for all server state
- Always handle `loading`, `error`, and `success` states explicitly
- Cancel stale requests on unmount
- Use optimistic updates for mutations
- Gracefully handle offline/network failure scenarios

---

## 11. Error Handling

- Error Boundaries for component-level failures
- `try/catch` in all async effects and event handlers
- Meaningful, user-facing error messages — never raw error objects
- Log errors for observability (Sentry or equivalent)

---

## 12. Forms

- React Hook Form as the default
- Controlled inputs only
- Validation on blur with debounce where UX requires
- All inputs must have accessible labels and ARIA attributes

---

## 13. Performance

- `React.memo` only when re-render cost is confirmed
- `React.lazy` + `Suspense` for route-level code splitting
- Virtual scrolling for lists > 100 items
- Profile with React DevTools before optimizing

---

## 14. Accessibility

- Semantic HTML always (`button`, `nav`, `main`, `section`, etc.)
- ARIA attributes only when semantic HTML is insufficient
- All interactive elements keyboard-navigable
- Color contrast ratio ≥ 4.5:1 (WCAG AA)
- `alt` text on all images; descriptive labels on icon-only buttons

---

## 15. Testing

- React Testing Library for all component tests
- Test behavior, not implementation details
- Mock external dependencies and API calls
- Cover: render, interaction, loading/error states, accessibility

---

## Anti-Patterns (Strictly Forbidden)

| ❌ Pattern | ✅ Replacement |
|---|---|
| `phase === 'JOINING'` | `MeetingPhaseFlags.isJoining(phase)` |
| `<span>Host</span>` | `<span>{t('meeting.role.host')}</span>` |
| `<svg>...</svg>` inline | `import Icon from '...svg?react'` |
| Raw `<h1>`, `<p>` in pages | `<Heading>`, `<Text>` components |
| Inline style / `<style>` tag | Tailwind or SCSS module |
| Copy-pasted Tailwind classes | Shared UI component |
| `any` type | `unknown` + type narrowing |
| Logic in layout components | Move to feature/container layer |
