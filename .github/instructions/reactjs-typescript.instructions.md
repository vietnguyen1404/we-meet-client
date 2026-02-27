---
description: 'ReactJS development standards and best practices'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss'
---

# ReactJS Development Instructions

Instructions for building high-quality ReactJS applications with modern patterns, hooks, and best practices following the official React documentation at https://react.dev.

## Project Context
- Latest React version (React 19+)
- TypeScript for type safety (when applicable)
- Functional components with hooks as default
- Follow React's official style guide and best practices
- Use modern build tools (Vite, Create React App, or custom Webpack setup)
- Implement proper component composition and reusability patterns

## Development Standards

### Architecture
- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

### TypeScript Integration
- Use TypeScript interfaces for props, state, and component definitions
- Define proper types for event handlers and refs
- Implement generic components where appropriate
- Use strict mode in `tsconfig.json` for type safety
- Leverage React's built-in types (`React.FC`, `React.ComponentProps`, etc.)
- Create union types for component variants and states

### Component Design
- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions
- Implement proper prop validation with TypeScript or PropTypes
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)

### State Management
- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Leverage `useContext` for sharing state across component trees
- Consider external state management (Redux Toolkit, Zustand) for complex applications
- Implement proper state normalization and data structures
- Use React Query or SWR for server state management

### Hooks and Effects
- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic
- Follow the rules of hooks (only call at the top level)
- Use `useRef` for accessing DOM elements and storing mutable values

### Styling
- Use CSS Modules, Styled Components, or modern CSS-in-JS solutions
- Implement responsive design with mobile-first approach
- Follow BEM methodology or similar naming conventions for CSS classes
- Use CSS custom properties (variables) for theming
- Implement consistent spacing, typography, and color systems
- Ensure accessibility with proper ARIA attributes and semantic HTML

### Performance Optimization
- Use `React.memo` for component memoization when appropriate
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify performance bottlenecks

### Data Fetching
- Use modern data fetching libraries (React Query, SWR, Apollo Client)
- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better user experience
- Implement proper caching strategies
- Handle offline scenarios and network errors gracefully

### Error Handling
- Implement Error Boundaries for component-level error handling
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users

### Forms and Validation
- Use controlled components for form inputs
- Implement proper form validation with libraries like Formik, React Hook Form
- Handle form submission and error states appropriately
- Implement accessibility features for forms (labels, ARIA attributes)
- Use debounced validation for better user experience
- Handle file uploads and complex form scenarios

### Routing
- Use React Router for client-side routing
- Implement nested routes and route protection
- Handle route parameters and query strings properly
- Implement lazy loading for route-based code splitting
- Use proper navigation patterns and back button handling
- Implement breadcrumbs and navigation state management

### Testing
- Write unit tests for components using React Testing Library
- Test component behavior, not implementation details
- Use Jest for test runner and assertion library
- Implement integration tests for complex component interactions
- Mock external dependencies and API calls appropriately
- Test accessibility features and keyboard navigation

### Security
- Sanitize user inputs to prevent XSS attacks
- Validate and escape data before rendering
- Use HTTPS for all external API calls
- Implement proper authentication and authorization patterns
- Avoid storing sensitive data in localStorage or sessionStorage
- Use Content Security Policy (CSP) headers

### Accessibility
- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios
- Test with screen readers and accessibility tools

## Implementation Process
1. Plan component architecture and data flow
2. Set up project structure with proper folder organization
3. Define TypeScript interfaces and types
4. Implement core components with proper styling
5. Add state management and data fetching logic
6. Implement routing and navigation
7. Add form handling and validation
8. Implement error handling and loading states
9. Add testing coverage for components and functionality
10. Optimize performance and bundle size
11. Ensure accessibility compliance
12. Add documentation and code comments

## Additional Guidelines
- Follow React's naming conventions (PascalCase for components, camelCase for functions)
- Use meaningful commit messages and maintain clean git history
- Implement proper code splitting and lazy loading strategies
- Document complex components and custom hooks with JSDoc
- Use ESLint and Prettier for consistent code formatting
- Keep dependencies up to date and audit for security vulnerabilities
- Implement proper environment configuration for different deployment stages
- Use React Developer Tools for debugging and performance analysis

## Common Patterns
- Higher-Order Components (HOCs) for cross-cutting concerns
- Render props pattern for component composition
- Compound components for related functionality
- Provider pattern for context-based state sharing
- Container/Presentational component separation
- Custom hooks for reusable logic extraction

## 🌍 Internationalization & Constant Enforcement

All role values and user-facing strings must follow strict constant + i18n rules.

Never hardcode role comparisons like:

member.role === 'HOST'

Instead, define centralized constants or enums:

// constants/roles.ts
export const MEETING_ROLE = {
  HOST: 'HOST',
  PARTICIPANT: 'PARTICIPANT',
} as const;

export type MeetingRole =
  (typeof MEETING_ROLE)[keyof typeof MEETING_ROLE];

Usage:

member.role === MEETING_ROLE.HOST

Additionally, NEVER hardcode UI text such as:

<span>Host</span>

All user-facing text must use i18n translation keys.

Example:

import { useTranslation } from 'react-i18next';
import { MEETING_ROLE } from '@/constants/roles';

const { t } = useTranslation();

{member.role === MEETING_ROLE.HOST && (
  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
    {t('meeting.role.host')}
  </span>
)}

Translation file example:

{
  "meeting": {
    "role": {
      "host": "Host",
      "participant": "Participant"
    }
  }
}

Rules:
- No hardcoded role strings.
- No hardcoded UI text.
- Always use centralized constants.
- Always use i18n for display text.
- Translation keys must follow feature-based namespaces (e.g., meeting.role.host).

This is mandatory for scalability, localization readiness, and long-term maintainability.

## SVG Usage Rule (React + Vite)

All SVG icons must be imported as React components using the `?react` suffix.

Never use:
- `<img src="/icons/icon.svg" />`
- Raw SVG inline copy-paste
- Default SVG import without `?react`

Correct usage:

import EyeOffIcon from '@/assets/icons/eye-off.svg?react';

Then use it as a React component:

<EyeOffIcon className="w-4 h-4 text-muted-foreground" />

Rules:
- Always import SVG with `?react`
- Always treat SVG as a component
- Control size via Tailwind classes (w-*, h-*)
- Control color using `text-*` utilities (SVG must use currentColor)
- Do not hardcode width/height inside SVG file unless absolutely necessary
- Icons must live under `@/assets/icons`

This ensures consistency, tree-shaking optimization, and styling flexibility.

## 🎨 Styling Convention (Global CSS & SCSS Rules)

To maintain scalability and clean architecture, follow these strict styling rules:

### 1️⃣ index.css Rules

The `index.css` file must ONLY contain:

- Tailwind directives (@tailwind base, components, utilities)
- Global CSS imports
- CSS variable imports (if needed)

DO NOT:
- Define custom CSS rules
- Add component-specific styles
- Write layout or utility classes
- Add overrides directly

Example (correct):

@tailwind base;
@tailwind components;
@tailwind utilities;

@import './styles/variables.scss';
@import './styles/global.scss';

---

### 2️⃣ Custom Styling Must Use SCSS

If custom styling is required:

- Use SCSS (.scss)
- Create a separate file under `/styles`
- Follow modular structure
- Never write large custom CSS inside components unless using Tailwind utilities

---

### 3️⃣ Folder Structure (Best Practice)

src/
  styles/
    _variables.scss
    _mixins.scss
    global.scss
    components/
      _meeting.scss
      _button.scss

Rules:
- Use partials with `_` prefix
- Group styles by domain or component
- Keep styles maintainable and scoped

---

### 4️⃣ Tailwind First Approach

- Prefer Tailwind utility classes
- Use SCSS only when:
  - Complex animations
  - Reusable style patterns
  - Theming
  - CSS variables
  - 3rd-party overrides

Avoid writing custom CSS for things Tailwind already solves.

---

### 5️⃣ Maintain Clean Architecture

- No random CSS files scattered in feature folders
- No inline `<style>` tags
- No styling logic mixed with business logic
- No global pollution

Styling must be predictable, modular, and scalable.

This rule is mandatory for long-term maintainability.

## 🧩 Reusable Component Convention (Layout, UI, Typography)

To ensure consistency, scalability, and maintainability, the following component conventions are **mandatory**.

### 1️⃣ Component Categorization

All components must belong to **one of the following categories**:

#### A. Layout Components
Used for **global or page-level structure**.

Examples:
- Header
- Footer
- Sidebar
- Container
- PageLayout

Rules:
- ❌ No business logic
- ❌ No data fetching
- ❌ No direct API calls
- ✅ Accept `children` for composition
- ✅ Handle layout, spacing, and structure only

```tsx
type HeaderProps = {
  children?: React.ReactNode;
};

export function Header({ children }: HeaderProps) {
  return (
    <header className="border-b bg-background">
      {children}
    </header>
  );
}
```

### B. UI Components (Reusable Elements)

Small, reusable building blocks used across multiple features.

Examples:
- Button
- Input
- Select
- Modal
- Card
- Tooltip

Rules:
- ❌ No page-specific logic
- ❌ No hardcoded UI text
- ❌ No direct dependency on routes or feature state
- ✅ Accept `variant`, `size`, and `state` via props
- ✅ Styled primarily with Tailwind utilities
- ✅ Must be reusable across domains

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  variant?: ButtonVariant;
  children: React.ReactNode;
};

export function Button({
  variant = 'primary',
  children,
}: ButtonProps) {
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

---

### C. Typography System (Mandatory)

❗ Direct usage of raw HTML typography tags (`h1`, `p`, `span`) inside pages is NOT allowed.

All text must go through a centralized Typography system.

Components:
- Heading
- Text
- Label (optional)

Rules:
- ✅ Centralized typography control
- ✅ Consistent font size, weight, spacing
- ❌ No inline typography styling in pages
- ❌ No direct HTML text tags in pages

```tsx
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = {
  level?: HeadingLevel;
  children: React.ReactNode;
};

export function Heading({
  level = 1,
  children,
}: HeadingProps) {
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
```

```tsx
type TextVariant = 'body' | 'caption' | 'muted';

type TextProps = {
  variant?: TextVariant;
  children: React.ReactNode;
};

export function Text({
  variant = 'body',
  children,
}: TextProps) {
  const styles: Record<TextVariant, string> = {
    body: 'text-base text-foreground',
    caption: 'text-sm text-muted-foreground',
    muted: 'text-sm text-muted-foreground/80',
  };

  return <p className={styles[variant]}>{children}</p>;
}
```

---

### 2. Folder Structure Requirement

All reusable components must live under `src/components`.

```txt
src/components/
  layout/
    Header/
      Header.tsx
      index.ts
    Footer/
      Footer.tsx
      index.ts

  ui/
    Button/
      Button.tsx
      index.ts
    Typography/
      Heading.tsx
      Text.tsx
      index.ts
```

Rules:
- One component per file
- Public API via `index.ts`
- No deep relative imports (`../../../`)

---

### 3. Page Components Rule

Page components must only compose layout + UI components.

```tsx
export default function HomePage() {
  return (
    <>
      <Header />
      <main className="p-6">
        <Heading level={1}>Home</Heading>
        <Text>Welcome to the application</Text>
        <Button variant="primary">
          Get Started
        </Button>
      </main>
    </>
  );
}
```

---

### 4. Anti-Patterns (Strictly Forbidden)

- ❌ Copy-pasting Tailwind classes across pages
- ❌ Styling directly in page components
- ❌ Hardcoded text inside UI components
- ❌ Feature-specific logic inside shared components
- ❌ Mixing business logic with layout components

---

### 5. Design Philosophy

- Composition over configuration
- Small, predictable components
- Centralized design decisions
- Easy refactoring and theming
- Scales well for large teams