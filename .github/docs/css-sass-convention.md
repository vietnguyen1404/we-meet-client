# CSS & SASS Conventions

**Version:** 2.0-beta.1
**Last Updated:** February 12, 2026
**Status:** Active

---

## Table of Contents

1. [General Principles](#general-principles)
2. [File Organization (7-1 Pattern)](#file-organization-7-1-pattern)
3. [SASS Conventions](#sass-conventions)
4. [Modern CSS Features](#modern-css-features)
5. [BEM Methodology (Hyphen-Separated Format)](#bem-methodology-hyphen-separated-format)
6. [Responsive Design](#responsive-design)
7. [Performance Guidelines](#performance-guidelines)
8. [Accessibility in CSS](#accessibility-in-css)
9. [Code Formatting](#code-formatting)

---

## General Principles

### Core Values
- **Mobile-First**: Design for mobile, enhance for desktop
- **Component-Based**: Reusable, modular styles
- **Performance-Aware**: Optimize for render performance
- **Maintainable**: Clear naming, consistent patterns
- **Accessible**: Support keyboard, screen readers, color contrast

### Methodology
- **Primary**: BEM (Block Element Modifier) with namespaces
- **Fallback**: OOCSS principles for shared utilities
- **Architecture**: 7-1 Pattern for file organization

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Progressive enhancement for older browsers
- Autoprefixer for vendor prefixes

---

## File Organization

### Hybrid Directory Structure

```
src/
├── index.css                    # Tailwind imports + global base styles
├── styles/                      # SCSS only (when needed)
│   ├── base/
│   │   ├── _reset.scss         # Minimal resets not in Tailwind
│   │   └── _typography.scss    # Custom font configurations
│   ├── components/             # Complex components only
│   │   ├── _data-table.scss    # Complex table states
│   │   ├── _rich-editor.scss   # Third-party editor overrides
│   │   └── _date-picker.scss   # Third-party library styling
│   ├── utilities/              # SCSS utilities Tailwind doesn't cover
│   │   ├── _animations.scss    # Complex keyframe animations
│   │   └── _print.scss         # Print-specific styles
│   ├── vendors/                # Third-party overrides
│   │   ├── _react-select.scss
│   │   └── _tippy.scss
│   └── main.scss               # Import all SCSS partials
└── components/                  # React components (use Tailwind in JSX)
    ├── Button.tsx              # <button className="px-4 py-2...">
    └── Card.tsx                # <div className="rounded-lg...">
```

### ⚠️ Critical Rules

1. **Default to Tailwind in JSX**: Most components use only Tailwind classes
2. **SCSS for Exceptions**: Only create SCSS files when Tailwind is insufficient
3. **No Style Duplication**: Don't recreate `p-4` or `bg-blue-500` in SCSS
4. **Tailwind @apply Sparingly**: Avoid `@apply` in SCSS; use utilities in markup instead

---

## Tailwind Integration

### Entry Point (index.css)

```css
/* src/index.css */
@import 'tailwindcss';

/* Import SCSS when needed */
@import './styles/main.scss';

@layer base {
  /* Global base styles that extend Tailwind */
  button,
  [type='button'],
  [type='submit'] {
    cursor: pointer;
  }
  
  /* Custom focus styles */
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-blue-500;
  }
}

@layer components {
  /* ONLY if you must use @apply (prefer SCSS or pure Tailwind) */
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6764f2',
        secondary: '#6c757d',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
};
```

---

## When to Use SCSS

### ✅ Valid SCSS Use Cases

#### 1. Third-Party Library Overrides

```scss
// styles/vendors/_react-select.scss
.react-select {
  &__control {
    border-radius: 0.5rem;
    border-color: theme('colors.gray.300');
    
    &--is-focused {
      border-color: theme('colors.blue.500');
      box-shadow: 0 0 0 1px theme('colors.blue.500');
    }
  }
  
  &__menu {
    border-radius: 0.5rem;
    box-shadow: theme('boxShadow.lg');
  }
}
```

#### 2. Complex State Machines

```scss
// styles/components/_data-table.scss
.data-table {
  // Use Tailwind for base styles in markup, SCSS for complex states
  
  &-row {
    &-selected {
      background-color: theme('colors.blue.50');
      
      &:hover {
        background-color: theme('colors.blue.100');
      }
    }
    
    &-editing {
      outline: 2px solid theme('colors.blue.500');
      outline-offset: -2px;
      
      .data-table-cell {
        padding: 0;
      }
    }
  }
}
```

#### 3. Complex Animations

```scss
// styles/utilities/_animations.scss
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in-right {
  animation: slideInFromRight 0.3s ease-out forwards;
}

// Prefer this over inline Tailwind when animation has many steps
```

#### 4. Print Styles

```scss
// styles/utilities/_print.scss
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    font-size: 12pt;
    color: black;
    background: white;
  }
  
  a[href]::after {
    content: " (" attr(href) ")";
  }
}
```

### ❌ Invalid SCSS Use Cases

#### Don't Recreate Tailwind Utilities

```scss
// ❌ BAD: Recreating Tailwind utilities
.my-spacing {
  padding: 1rem;  // Use p-4 instead
  margin: 0.5rem; // Use m-2 instead
}

// ❌ BAD: Recreating Tailwind colors
.primary-button {
  background-color: #6764f2;  // Use bg-primary instead
  color: white;               // Use text-white instead
}

// ❌ BAD: Recreating responsive classes
.responsive-grid {
  display: block;
  
  @media (min-width: 768px) {
    display: grid;  // Use md:grid instead
  }
}
```

#### Don't Use @apply Excessively

```scss
// ❌ BAD: Overusing @apply defeats Tailwind's purpose
.card {
  @apply rounded-lg shadow-lg p-6 bg-white;
  @apply border border-gray-200;
  @apply hover:shadow-xl transition-shadow;
}

// ✅ GOOD: Use Tailwind directly in JSX
// <div className="rounded-lg shadow-lg p-6 bg-white border border-gray-200 hover:shadow-xl transition-shadow">
```

---

## SCSS Conventions

### Use Tailwind theme() Function

Access Tailwind's design tokens in SCSS:

```scss
// ✅ GOOD: Reference Tailwind theme
.custom-component {
  background-color: theme('colors.blue.500');
  padding: theme('spacing.4');
  border-radius: theme('borderRadius.lg');
  
  @media (min-width: theme('screens.md')) {
    padding: theme('spacing.6');
  }
}

// ❌ BAD: Hardcoding values that exist in Tailwind
.custom-component {
  background-color: #3b82f6;  // Use theme('colors.blue.500')
  padding: 1rem;              // Use theme('spacing.4')
}
```

### Variables (Minimal Usage)

Only create SCSS variables for values NOT in Tailwind config:

```scss
// styles/base/_variables.scss

// ✅ GOOD: Values not in Tailwind
$animation-duration-slow: 0.5s;
$animation-duration-fast: 0.15s;
$z-index-modal: 9999;
$z-index-tooltip: 10000;

// ❌ BAD: Duplicating Tailwind theme
$color-primary: #6764f2;  // Already in tailwind.config.js
$spacing-md: 1rem;        // Already in Tailwind's spacing scale
```

### Nesting (Keep Shallow)

```scss
// ✅ GOOD: Shallow nesting (2-3 levels max)
.data-table {
  width: 100%;
  
  &-header {
    background-color: theme('colors.gray.50');
  }
  
  &-cell {
    padding: theme('spacing.3');
    
    &-sortable:hover {
      background-color: theme('colors.gray.100');
    }
  }
}

// ❌ BAD: Deep nesting
.navigation {
  .menu {
    .item {
      .link {
        .icon {  // Too deep!
          color: red;
        }
      }
    }
  }
}
```

### Mixins (Rare Usage)

Most layout/styling is handled by Tailwind. Only create mixins for complex patterns.

```scss
// ✅ GOOD: Complex truncation with custom lines
@mixin line-clamp($lines) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  @include line-clamp(3);
}

// ❌ BAD: Simple utilities (use Tailwind instead)
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  // Use: className="flex justify-center items-center"
}
```

---

## Practical Examples

### Example 1: Simple Card (Tailwind Only)

```tsx
// ✅ GOOD: No SCSS needed
function ProductCard({ product }) {
  return (
    <div className="rounded-lg shadow-lg p-6 bg-white border border-gray-200 hover:shadow-xl transition-shadow">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-xl font-bold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
        Add to Cart
      </button>
    </div>
  );
}
```

### Example 2: Complex Data Table (Tailwind + SCSS)

```tsx
// Component with complex states
function DataTable({ data, sortColumn, onSort }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="data-table w-full">
        <thead className="data-table-header">
          <tr className="data-table-row">
            {columns.map(col => (
              <th 
                key={col.id}
                className={cn(
                  "data-table-cell",
                  col.sortable && "data-table-cell-sortable",
                  sortColumn === col.id && "data-table-cell-sortable-active"
                )}
                onClick={() => col.sortable && onSort(col.id)}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr 
              key={row.id}
              className={cn(
                "data-table-row",
                row.selected && "data-table-row-selected",
                row.editing && "data-table-row-editing"
              )}
            >
              {/* cells */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```scss
// styles/components/_data-table.scss
.data-table {
  border-collapse: collapse;
  
  &-header {
    background-color: theme('colors.gray.50');
    font-weight: theme('fontWeight.semibold');
    border-bottom: 2px solid theme('colors.gray.200');
  }
  
  &-row {
    border-bottom: 1px solid theme('colors.gray.100');
    transition: background-color 0.15s ease;
    
    &:hover {
      background-color: theme('colors.gray.50');
    }
    
    &-selected {
      background-color: theme('colors.blue.50');
      
      &:hover {
        background-color: theme('colors.blue.100');
      }
      
      .data-table-cell {
        font-weight: theme('fontWeight.medium');
      }
    }
    
    &-editing {
      outline: 2px solid theme('colors.blue.500');
      outline-offset: -2px;
      
      &:hover {
        background-color: white;
      }
    }
  }
  
  &-cell {
    padding: theme('spacing.3') theme('spacing.4');
    text-align: left;
    
    &-sortable {
      cursor: pointer;
      user-select: none;
      position: relative;
      
      &::after {
        content: '↕';
        margin-left: theme('spacing.2');
        opacity: 0.3;
        transition: opacity 0.15s ease;
      }
      
      &:hover::after {
        opacity: 0.6;
      }
      
      &-active {
        color: theme('colors.blue.600');
        
        &::after {
          opacity: 1;
        }
      }
    }
  }
}
```

### Example 3: Third-Party Library Override

```tsx
// Component using React Select
import Select from 'react-select';

function UserSelect() {
  return (
    <div className="w-full">
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        options={users}
      />
    </div>
  );
}
```

```scss
// styles/vendors/_react-select.scss
.react-select {
  &-container {
    // Base styles use Tailwind theme
  }
  
  &__control {
    border-color: theme('colors.gray.300');
    border-radius: theme('borderRadius.lg');
    min-height: 42px;
    transition: all 0.15s ease;
    
    &:hover {
      border-color: theme('colors.gray.400');
    }
    
    &--is-focused {
      border-color: theme('colors.blue.500');
      box-shadow: 0 0 0 1px theme('colors.blue.500');
      
      &:hover {
        border-color: theme('colors.blue.500');
      }
    }
    
    &--is-disabled {
      background-color: theme('colors.gray.50');
      cursor: not-allowed;
    }
  }
  
  &__menu {
    border-radius: theme('borderRadius.lg');
    box-shadow: theme('boxShadow.lg');
    border: 1px solid theme('colors.gray.200');
    margin-top: theme('spacing.1');
  }
  
  &__option {
    padding: theme('spacing.2') theme('spacing.3');
    cursor: pointer;
    
    &--is-focused {
      background-color: theme('colors.gray.100');
    }
    
    &--is-selected {
      background-color: theme('colors.blue.500');
      color: white;
      
      &:hover {
        background-color: theme('colors.blue.600');
      }
    }
  }
}
```

---

## Performance Guidelines

### Keep SCSS Output Minimal

```scss
// ✅ GOOD: Only add what Tailwind doesn't cover
.rich-editor {
  // Complex states only
  &-placeholder {
    &::before {
      content: attr(data-placeholder);
      color: theme('colors.gray.400');
      pointer-events: none;
    }
  }
}

// ❌ BAD: Recreating Tailwind utilities increases bundle size
.my-component {
  display: flex;           // Use flex
  padding: 1rem;           // Use p-4
  margin-bottom: 0.5rem;   // Use mb-2
  background: white;       // Use bg-white
}
```

### Animation Performance

```scss
// ✅ GOOD: Only animate transform and opacity
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 0.3s ease-out forwards;
}

// ❌ BAD: Animating layout properties
@keyframes badSlide {
  from {
    left: -100%;  // Triggers layout recalculation!
    width: 0;     // Triggers layout recalculation!
  }
}
```

### CSS Containment

```scss
// For performance on large lists
.data-table-row {
  contain: layout style paint;
}

.card-list-item {
  contain: layout;
}
```

---

## Accessibility

### Focus Indicators

```css
/* src/index.css */
@layer base {
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-blue-500;
  }
  
  button:focus-visible {
    @apply outline-2 outline-offset-2 outline-blue-500;
  }
}
```

```scss
// For custom interactive elements in SCSS
.data-table-cell-sortable {
  &:focus-visible {
    outline: 2px solid theme('colors.blue.500');
    outline-offset: 2px;
  }
}
```

### Color Contrast

Use Tailwind's built-in color system which follows WCAG guidelines:

```tsx
// ✅ GOOD: High contrast
<p className="text-gray-900 bg-white">
  Readable text (16:1 contrast)
</p>

// ⚠️ WARNING: Low contrast
<p className="text-gray-400 bg-white">
  May fail WCAG AA (3:1 contrast)
</p>
```

### Reduced Motion

```css
/* src/index.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Code Formatting

### Property Order (SCSS Only)

```scss
.element {
  // 1. Positioning
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  
  // 2. Box Model
  display: flex;
  width: 100%;
  padding: theme('spacing.4');
  
  // 3. Typography
  font-size: theme('fontSize.lg');
  font-weight: theme('fontWeight.bold');
  color: theme('colors.gray.900');
  
  // 4. Visual
  background-color: white;
  border-radius: theme('borderRadius.lg');
  box-shadow: theme('boxShadow.md');
  
  // 5. Animation
  transition: all 0.3s ease;
  
  // 6. Nested selectors
  &-child {
    // ...
  }
  
  &:hover {
    // ...
  }
}
```

### Comments

```scss
/**
 * Component: Data Table
 * Description: Complex table with sortable columns and row selection
 * Used in: Dashboard, Reports
 */
.data-table {
  // Sortable indicator logic
  &-cell-sortable {
    position: relative;
    
    // TODO: Add keyboard navigation
    // FIXME: Icon alignment on Safari
  }
}
```

---

## Migration Guide

### Converting Existing Components

#### Step 1: Identify What to Keep in SCSS

Ask these questions:
1. Does this have complex state logic? → Keep in SCSS
2. Is it a third-party override? → Keep in SCSS
3. Is it simple layout/spacing/colors? → Move to Tailwind
4. Does it have complex animations? → Keep in SCSS

#### Step 2: Example Migration

**Before (Pure SCSS):**

```scss
// styles/components/_card.scss
.card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  &-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  &-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
  }
  
  &-featured {
    border: 2px solid #3b82f6;
  }
}
```

```tsx
// Component
<div className="card card-featured">
  <div className="card-header">
    <h3 className="card-title">Title</h3>
  </div>
</div>
```

**After (Tailwind + SCSS):**

```tsx
// Component - Move simple styles to Tailwind
<div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-500">
  <div className="mb-4 pb-4 border-b border-gray-200">
    <h3 className="text-xl font-bold text-gray-900">Title</h3>
  </div>
</div>
```

**Result:** No SCSS needed! All styles moved to Tailwind.

#### Step 3: When SCSS is Necessary

**Before:**

```scss
.product-card {
  padding: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  &-on-sale::before {
    content: 'SALE';
    position: absolute;
    top: 10px;
    right: 10px;
    background: red;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
  }
}
```

**After (Tailwind + SCSS Hybrid):**

```tsx
// Move simple styles to Tailwind, keep complex ::before in SCSS
<div className="p-4 bg-white cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl">
  {onSale && <div className="product-card-sale-badge" />}
</div>
```

```scss
// styles/components/_product-card.scss
.product-card {
  &-sale-badge {
    position: absolute;
    top: theme('spacing.2');
    right: theme('spacing.2');
    background-color: theme('colors.red.500');
    color: white;
    padding: theme('spacing.1') theme('spacing.2');
    border-radius: theme('borderRadius.DEFAULT');
    font-size: theme('fontSize.xs');
    font-weight: theme('fontWeight.bold');
    
    &::before {
      content: 'SALE';
    }
  }
}
```

---

## Quick Reference

### Decision Flowchart

```
Need to add styles?
│
├─ Simple layout, spacing, colors?
│  └─ ✅ Use Tailwind utilities in className
│
├─ Responsive design?
│  └─ ✅ Use Tailwind breakpoints (md:, lg:)
│
├─ Hover/focus states?
│  └─ ✅ Use Tailwind (hover:, focus:)
│
├─ Complex component with many states?
│  └─ ✅ Use SCSS with BEM + theme() function
│
├─ Third-party library styling?
│  └─ ✅ Use SCSS in styles/vendors/
│
├─ Complex animations (multi-step)?
│  └─ ✅ Use SCSS @keyframes
│
└─ Pseudo-elements (::before, ::after)?
   └─ ✅ Use SCSS if complex, otherwise Tailwind
```

### Common Patterns

| Pattern | Solution |
|---------|----------|
| Button | Tailwind: `className="px-4 py-2 bg-blue-500..."` |
| Card | Tailwind: `className="rounded-lg shadow-lg p-6..."` |
| Grid Layout | Tailwind: `className="grid grid-cols-3 gap-4..."` |
| Responsive | Tailwind: `className="text-sm md:text-base lg:text-lg"` |
| Hover Effect | Tailwind: `className="hover:bg-blue-600"` |
| Complex Table States | SCSS: `.data-table-row-selected { ... }` |
| Third-party Override | SCSS: `.react-select__control { ... }` |
| Multi-step Animation | SCSS: `@keyframes slideIn { ... }` |
| Pseudo-element Content | SCSS: `&::before { content: '...'; }` |

---

## Tooling

### Required Tools

1. **Tailwind CSS** - Primary styling system
2. **PostCSS** - Process Tailwind and SCSS
3. **Sass** - SCSS compiler (Dart Sass recommended)
4. **Autoprefixer** - Vendor prefixes

### Configuration

```javascript
// postcss.config.js
export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
  },
};
```

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6764f2',
      },
    },
  },
};
```

### Linting

```json
// .stylelintrc.json
{
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-tailwindcss"
  ],
  "rules": {
    "max-nesting-depth": 3,
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "scss/at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": ["tailwind", "apply", "layer"]
      }
    ]
  }
}
```

### VS Code Extensions

- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **Stylelint** - SCSS linting
- **SCSS IntelliSense** - SCSS autocomplete
- **Headwind** - Sort Tailwind classes

---

## Summary

### Core Principles

1. **Tailwind First** - Default to utility classes for 80% of needs
2. **SCSS When Needed** - Use for complex states, third-party overrides, advanced animations
3. **No Duplication** - Don't recreate Tailwind utilities in SCSS
4. **Use theme()** - Reference Tailwind tokens in SCSS
5. **BEM for SCSS** - Only use BEM naming for SCSS component classes
6. **Keep Minimal** - Less custom CSS = smaller bundle + easier maintenance

### File Structure Recap

```
src/
├── index.css              # Tailwind + global base styles
├── styles/                # SCSS (minimal usage)
│   ├── components/       # Complex components only
│   ├── vendors/          # Third-party overrides
│   ├── utilities/        # Custom animations, print styles
│   └── main.scss         # Imports all partials
└── components/            # React components (mostly Tailwind)
```

---

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [Sass Documentation](https://sass-lang.com/documentation)
- [BEM Methodology](https://en.bem.info/methodology/)
- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

**Version History:**
- **3.0** (Feb 2026): Hybrid Tailwind + SCSS approach, practical examples, migration guide
- **2.0** (Feb 2026): Modern CSS features, container queries, performance guidelines
- **1.0** (Initial): Pure SCSS/BEM conventions
│   └── _base.scss
├── components/         # Buttons, cards, forms
│   ├── _button.scss
│   ├── _card.scss
│   ├── _form.scss
│   ├── _modal.scss
│   └── _table.scss
├── layout/             # Header, footer, grid
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _navigation.scss
│   ├── _sidebar.scss
│   └── _grid.scss
├── pages/              # Page-specific styles
│   ├── _home.scss
│   ├── _about.scss
│   └── _contact.scss
├── themes/             # Theme variations
│   ├── _default.scss
│   └── _dark.scss
├── vendors/            # 3rd party CSS
│   ├── _normalize.scss
│   └── _datepicker.scss
└── main.scss           # Main file importing all partials
```

### main.scss Structure

```scss
// 1. Configuration and helpers (No output)
@use 'sass:meta';
@use 'abstracts/variables';
@use 'abstracts/functions';
@use 'abstracts/mixins';
@use 'abstracts/placeholders';

// 2. Define Cascade Layers Order
// Ensures utilities always win over components, regardless of load order.
@layer reset, base, components, themes, utilities;

// 3. Vendors & Reset (Layer: reset)
// Usage: meta.load-css allows us to wrap imports in layers dynamically
@layer reset {
  @include meta.load-css('vendors/normalize');
  @include meta.load-css('base/reset');
}

// 4. Base Attributes (Layer: base)
@layer base {
  @include meta.load-css('base/typography');
  @include meta.load-css('base/base');
}

// 5. Layout & Components (Layer: components)
@layer components {
  @include meta.load-css('layout/header');
  @include meta.load-css('layout/grid');
  @include meta.load-css('components/button');
  @include meta.load-css('components/card');
}

// 6. Page-specific styles (Layer: components or separate layer)
@use 'pages/home';
@use 'pages/about';

// 7. Themes (Layer: themes)
@layer themes {
  @include meta.load-css('themes/default');
}
```

---

## SASS Conventions

### Variables

#### Naming Convention
- Use `$` prefix
- Use kebab-case
- Group by category
- Use semantic names over descriptive names

```scss
// ⚠️ STRATEGY: Use SASS maps to generate CSS Custom Properties.
// CSS Variables are the Source of Truth for the browser/DOM.
// SASS Variables are only for loop generation or complex math.

// 1. Tier 1: Primitive Tokens (The Palette)
// Raw values describing "what it looks like"
$palette-blue: (
  '500': #007bff,
  '100': #cce5ff,
);

$palette-gray: (
  '900': #212529,
  '500': #6c757d,
  '200': #dee2e6,
);

$palette-system: (
  'success': #28a745,
  'danger': #dc3545,
  'warning': #ffc107,
  'info': #17a2b8,
  'white': #ffffff,
);

// 2. Tier 2: Semantic Tokens (The Usage)
// Aliases describing "what it does". Points to primitives.
$tokens-colors: (
  'primary': map-get($palette-blue, '500'),
  'secondary': map-get($palette-gray, '500'),
  'success': map-get($palette-system, 'success'),
  'danger': map-get($palette-system, 'danger'),
  'warning': map-get($palette-system, 'warning'),
  'info': map-get($palette-system, 'info'),
  'text': map-get($palette-gray, '900'),
  'text-light': map-get($palette-gray, '500'),
  'background': map-get($palette-system, 'white'),
  'border': map-get($palette-gray, '200')
);

$tokens-spacing: (
  'sm': 8px,
  'md': 16px,
  'lg': 24px
);

// 2. Generate CSS Variables (in _base.scss)
:root {
  @each $name, $value in $tokens-colors {
    --color-#{$name}: #{$value};
  }
  
  @each $name, $value in $tokens-spacing {
    --spacing-#{$name}: #{$value};
  }
}

// 3. Usage rules
// ✅ GOOD: Use CSS Variable in components
.card {
  background-color: var(--color-background);
  padding: var(--spacing-md);
}

// ❌ BAD: Using raw SASS values in properties
.card {
  color: map-get($tokens-colors, 'text'); // Avoid unless necessary for SASS functions
}

// Typography
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-family-heading: 'Poppins', $font-family-base;
$font-family-mono: 'Fira Code', 'Courier New', monospace;

$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;
$font-size-xl: 20px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

$line-height-base: 1.5;
$line-height-heading: 1.2;

// Breakpoints
$breakpoint-xs: 0;
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;

// Z-index Management

// Strategy 1: Global Map for App-Level Layers (Modals, Tooltips)
$z-layers: (
  'base': 0,
  'dropdown': 1000,
  'sticky': 1020,
  'fixed': 1030,
  'modal-backdrop': 1040,
  'modal': 1050,
  'popover': 1060,
  'tooltip': 1070
);

// Function to access z-index layers
@function z($layer) {
  @if not map-has-key($z-layers, $layer) {
    @warn "No z-index found in $z-layers map for `#{$layer}`. Property omitted.";
  }
  @return map-get($z-layers, $layer);
}

// Usage Example:
// .modal {
//   z-index: z('modal');
// }

// Strategy 2: Component Isolation (Preferred)
// Use isolation: isolate to create a new stacking context for self-contained components.
// This prevents internal z-indexes from leaking out or fighting with global layers.
.card-complex {
  isolation: isolate; // Creates new context. z-index: 999 inside here implies 999 *within* this card.
}

// ❌ BAD: Non-semantic names
$blue: #007bff;
$dark-gray: #333;
```

#### Maps for Related Values

```scss
// ✅ GOOD: Use maps for grouped values
$colors: (
  'primary': #007bff,
  'secondary': #6c757d,
  'success': #28a745,
  'danger': #dc3545
);

$breakpoints: (
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px,
  'xxl': 1400px
);

$spacings: (
  'xs': 4px,
  'sm': 8px,
  'md': 16px,
  'lg': 24px,
  'xl': 32px
);

// Access map values
.button-primary {
  background-color: map-get($colors, 'primary');
}

// Or use @each to generate classes
@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
}
```

### Mixins

#### Naming & Usage

```scss
// ⚠️ RULE: Do NOT create mixins for standard CSS properties ensuring vendor prefixes.
// Rely on PostCSS/Autoprefixer.

// ❌ BAD: Vendor prefix mixins (Obsolete)
// @mixin border-radius($radius) { ... }

// ✅ GOOD: Use standard property
.card {
  border-radius: 4px; // Autoprefixer handles the rest
}

// ✅ GOOD: Verb-based naming
@mixin center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Usage
@use 'abstracts/variables' as v;
@use 'abstracts/mixins' as m;

.card {
  // ✅ GOOD: Use standard properties (handled by PostCSS/Autoprefixer)
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  // ✅ GOOD: Use directional mixins from abstracts
  @include m.respond-above(v.$breakpoint-md) {
    padding: v.$spacing-lg;
  }
}
```

#### Common Utility Classes (Preferred over Mixins)

Prefer **Utility Classes** over mixins for layout, spacing, and common visual patterns to reduce CSS bundle size.

```scss
// Clearfix
.u-clearfix::after {
  content: "";
  display: table;
  clear: both;
}

// Visually hidden (accessible)
.u-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Text Truncation
.u-truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Aspect Ratio (Modern CSS)
.u-aspect-video {
  aspect-ratio: 16 / 9;
}

.u-aspect-square {
  aspect-ratio: 1;
}

// Fluid Typography (Example of when to use Mixin/CSS Variable logic)
// Prefer CSS Clamp() for modern fluid type
:root {
  --font-size-fluid: clamp(1rem, 2.5vw, 1.5rem);
}
```

### Functions

```scss
@use 'sass:math';
@use 'sass:color';

// Strip units
@function strip-unit($number) {
  @if type-of($number) == 'number' and not unitless($number) {
    @return math.div($number, ($number * 0 + 1));
  }
  @return $number;
}

// Convert px to rem
@function rem($pixels, $context: 16px) {
  @return #{math.div(strip-unit($pixels), strip-unit($context))}rem;
}

// Tint (lighten) color
@function tint($base-color, $percentage) {
  @return color.mix(white, $base-color, $percentage);
}

// Shade (darken) color
@function shade($base-color, $percentage) {
  @return color.mix(black, $base-color, $percentage);
}

// Usage
@use 'abstracts/variables' as v;

.heading {
  font-size: rem(24px);  // 1.5rem
  color: shade(v.$color-primary, 20%);
}
```

### Nesting Rules

**Maximum 3 levels deep**

```scss
// ✅ GOOD: Reasonable nesting (2-3 levels)
@use 'abstracts/variables' as v;

.card {
  padding: v.$spacing-md;
  
  &-header {
    border-bottom: 1px solid v.$color-border;
  }
  
  &-title {
    font-size: v.$font-size-xl;
    
    &:hover {
      color: v.$color-primary;
    }
  }
  
  &-featured {
    border: 2px solid v.$color-primary;
  }
}

// ❌ BAD: Too deep nesting (5 levels)
.navigation {
  .menu {
    .item {
      .link {
        .icon {
          color: red;  // Too deep!
        }
      }
    }
  }
}
```

### Partials

```scss
// All partials start with _ underscore
// _button.scss
// _card.scss
// _variables.scss

// Use 'use' to load module with namespace (default is filename)
@use 'variables';
// Usage: variables.$color-primary

// Use 'forward' to make members available when this file is used
@forward 'mixins';

@use 'components/button';
```

### Best Practices

```scss
@use 'sass:math';
@use 'abstracts/variables' as v;

// ✅ GOOD: Use !default for library variables
$color-primary: #007bff !default;

// ✅ GOOD: Use SASS math functions from math module
$column-width: math.div(100%, 12);  // 8.333%

// ✅ GOOD: Placeholder selectors for repeated styles
%button-base {
  display: inline-block;
  padding: v.$spacing-sm v.$spacing-md;
  border: none;
  cursor: pointer;
}

.button-primary {
  @extend %button-base;
  background-color: v.$color-primary;
}

// ⚠️ AVOID: @extend with classes (creates complex selectors)
.button-secondary {
  @extend .button;  // Avoid if possible
}

// ✅ BETTER: Use mixins instead
@mixin button-base {
  display: inline-block;
  padding: v.$spacing-sm v.$spacing-md;
  border: none;
  cursor: pointer;
}

.button-primary {
  @include button-base;
  background-color: v.$color-primary;
}
```

---

## Modern CSS Features

### CSS Custom Properties (Variables)

**Use for dynamic theming**

```scss
:root {
  // Colors
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-text: #212529;
  --color-background: #ffffff;
  
  // Spacing
  --spacing-unit: 8px;
  --spacing-sm: calc(var(--spacing-unit) * 1);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 3);
  
  // Typography
  --font-size-base: 16px;
  --line-height-base: 1.5;
}

// Dark theme
[data-theme="dark"] {
  --color-primary: #4dabf7;
  --color-text: #f8f9fa;
  --color-background: #212529;
}

// Usage
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  color: var(--color-text);
}

// With fallback
.element {
  color: var(--color-primary, #007bff);
}
```

### CSS Grid

```scss
// ✅ GOOD: Grid for 2D layouts
.layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

// Complex grid
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  gap: var(--spacing-md);
  min-height: 100vh;
}

.sidebar { grid-area: sidebar; }
.header { grid-area: header; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

### Flexbox

```scss
// ✅ GOOD: Flexbox for 1D layouts
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

// Flex utilities
.u-flex {
  display: flex;
}

.u-flex-column {
  flex-direction: column;
}

.u-flex-center {
  justify-content: center;
  align-items: center;
}

.u-flex-between {
  justify-content: space-between;
}

.u-flex-wrap {
  flex-wrap: wrap;
}
```

### Logical Properties

**For internationalization (LTR/RTL support)**

```scss
// ✅ GOOD: Logical properties
.card {
  margin-inline: var(--spacing-md);      // replaces margin-left + margin-right
  padding-block: var(--spacing-lg);      // replaces padding-top + padding-bottom
  border-inline-start: 1px solid;        // replaces border-left (RTL-aware)
}

// ❌ OLD: Physical properties
.card {
  margin-left: var(--spacing-md);
  margin-right: var(--spacing-md);
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-left: 1px solid;
}
```

### Container Queries

**Component-based responsive design**

```scss
// ✅ GOOD: Container queries for components
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
  
  .card-image {
    width: 200px;
  }
}

@container card (min-width: 600px) {
  .card-title {
    font-size: 1.5rem;
  }
}
```

### Modern Selectors

```scss
// :is() - matches any selector in list
:is(h1, h2, h3, h4, h5, h6) {
  line-height: var(--line-height-heading);
}

// :where() - same as :is() but 0 specificity
:where(ul, ol) {
  padding-left: var(--spacing-lg);
}

// :has() - parent selector
.card:has(.card-badge) {
  padding-top: var(--spacing-lg);
}

// :not() - exclusion
button:not(.button-ghost) {
  background-color: var(--color-primary);
}
```

---

## BEM Methodology (Hyphen-Separated Format)

### When to Use BEM

**Only use BEM for SCSS component classes.** For most components styled with Tailwind, you don't need BEM.

```tsx
// ✅ GOOD: Tailwind-only component (no BEM needed)
<div className="rounded-lg shadow-lg p-6 bg-white">
  <h2 className="text-xl font-bold mb-4">Title</h2>
  <p className="text-gray-600">Content</p>
</div>

// ✅ GOOD: Complex component with SCSS (use BEM)
<div className="data-table">
  <div className="data-table-header">
    <div className="data-table-cell data-table-cell-sortable">Name</div>
  </div>
</div>
```

### Modified BEM Format: Hyphen-Separated

Using hyphens throughout for consistency with Tailwind:

| ❌ Traditional BEM | ✅ Our Format |
|-------------------|---------------|
| `.block__element--modifier` | `.block-element-modifier` |
| `.card__header--primary` | `.card-header-primary` |
| `.user__avatar--large` | `.user-avatar-large` |
| `.nav__item--active` | `.nav-item-active` |

**Rationale:**
- Consistent with Tailwind's naming (`hover:bg-blue-500`)
- Easier to type and remember
- Better readability
- No cognitive switching between formats

### BEM Structure

#### Block (Component Root)

The root element representing a standalone component.

**Naming:** Descriptive, lowercase, hyphen-separated

**Examples:** `.data-table`, `.rich-editor`, `.date-picker`

```scss
// styles/components/_data-table.scss
.data-table {
  width: 100%;
  border-collapse: collapse;
}
```

#### Element (Component Part)

A part of the block with no standalone meaning.

**Naming:** `.block-element`

**Examples:** `.data-table-header`, `.data-table-row`, `.data-table-cell`

```scss
.data-table {
  &-header {
    background-color: theme('colors.gray.50');
    font-weight: theme('fontWeight.semibold');
  }
  
  &-row {
    border-bottom: 1px solid theme('colors.gray.200');
  }
  
  &-cell {
    padding: theme('spacing.3');
  }
}
```

#### Modifier (Variant/State)

A flag that changes appearance or state.

**Naming:** `.block-modifier` or `.block-element-modifier`

```scss
.data-table {
  &-row {
    &-selected {
      background-color: theme('colors.blue.50');
    }
    
    &-editing {
      outline: 2px solid theme('colors.blue.500');
    }
  }
  
  &-cell {
    &-sortable {
      cursor: pointer;
      user-select: none;
      
      &:hover {
        background-color: theme('colors.gray.100');
      }
    }
  }
}
```

### Hybrid Example: Tailwind + BEM

```tsx
// Component using both Tailwind and BEM
function DataTable() {
  return (
    // Tailwind for layout
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      {/* BEM for complex component states */}
      <table className="data-table">
        <thead className="data-table-header">
          <tr className="data-table-row">
            <th className="data-table-cell data-table-cell-sortable">
              Name
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="data-table-row data-table-row-selected">
            <td className="data-table-cell">John Doe</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

```scss
// styles/components/_data-table.scss
// Only define complex states that Tailwind can't handle cleanly
.data-table {
  &-row {
    &-selected {
      background-color: theme('colors.blue.50');
      
      &:hover {
        background-color: theme('colors.blue.100');
      }
      
      .data-table-cell {
        font-weight: theme('fontWeight.medium');
      }
    }
  }
  
  &-cell {
    &-sortable {
      position: relative;
      cursor: pointer;
      user-select: none;
      
      &::after {
        content: '↕';
        opacity: 0.3;
        margin-left: theme('spacing.2');
      }
      
      &:hover::after {
        opacity: 1;
      }
      
      &-asc::after {
        content: '↑';
        opacity: 1;
      }
      
      &-desc::after {
        content: '↓';
        opacity: 1;
      }
    }
  }
}
```

---

## Responsive Design

### Default: Use Tailwind Responsive Utilities

```tsx
// ✅ GOOD: Tailwind responsive utilities (mobile-first)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 md:p-6 lg:p-8">Content</div>
</div>

// ✅ GOOD: Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>

// ✅ GOOD: Show/hide responsively
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

### SCSS Media Queries (When Needed)

Only use SCSS media queries for complex component states not easily expressed with Tailwind.

```scss
// ✅ GOOD: Complex component responsive logic
.rich-editor {
  &-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: theme('spacing.2');
    
    @media (min-width: theme('screens.md')) {
      flex-wrap: nowrap;
      gap: theme('spacing.4');
      
      .rich-editor-toolbar-group {
        &:not(:last-child)::after {
          content: '';
          width: 1px;
          background: theme('colors.gray.300');
          margin: 0 theme('spacing.4');
        }
      }
    }
  }
}

// ❌ BAD: Recreating Tailwind responsive utilities
.my-grid {
  display: grid;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);  // Use md:grid-cols-2 instead
  }
}
```

### Container Queries (Preferred for Components)

Use container queries in SCSS for component-level responsiveness:

```scss
// ✅ GOOD: Component adapts to its container size
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: block;
  
  @container card (min-width: 400px) {
    display: flex;
    gap: theme('spacing.4');
  }
  
  &-image {
    width: 100%;
    
    @container card (min-width: 400px) {
      width: 200px;
      flex-shrink: 0;
    }
  }
}
```

### Responsive Typography

```tsx
// ✅ GOOD: Tailwind fluid typography
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>

// ✅ GOOD: Or use CSS clamp in SCSS (for complex calculations)
```

```scss
// SCSS: Advanced fluid typography
.hero-title {
  font-size: clamp(1.75rem, 5vw, 3rem);
  line-height: 1.2;
}
```
  }
}

@mixin respond-between($min, $max) {
  @media (min-width: $min) and (max-width: $max - 1px) {
    @content;
  }
}

// Usage
@use 'abstracts/variables' as v;

.sidebar {
  display: none;
  
  @include respond-above(v.$breakpoint-md) {
    display: block;
    width: 250px;
  }
}
```

### Responsive Typography

```scss
// Fluid typography (Modern CSS)
h1 {
  font-size: clamp(1.75rem, 5vw, 3rem);
}

// Or breakpoint-based (SASS)
@use 'abstracts/variables' as v;

h2 {
  font-size: 20px;
  
  @include respond-above(v.$breakpoint-md) {
    font-size: 24px;
  }
  
  @include respond-above(v.$breakpoint-lg) {
    font-size: 28px;
  }
}
```

---

## Performance Guidelines

### Critical CSS

```scss
// Inline critical above-fold CSS (<14KB)
// Extract manually or use tools like Critical, Critters

// critical.scss - Above fold only
body {
  margin: 0;
  font-family: var(--font-family-base);
}

.l-header {
  height: 60px;
  background: white;
}

.hero {
  height: 400px;
  background: $color-primary;
}
```

### CSS Containment

```scss
// Use contain property for performance
.card {
  contain: layout style paint;
}

.article-list {
  contain: layout;
}
```

### Animation Performance

```scss
// ✅ GOOD: Only animate transform and opacity
.modal {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-in {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  
  &.is-active {
    transform: translateX(0);
  }
}

// Use will-change sparingly
.animated-element {
  will-change: transform;
  
  &.animation-done {
    will-change: auto;
  }
}

// ❌ BAD: Animating layout properties
.bad-animation {
  transition: width 0.3s, height 0.3s, left 0.3s;  // Triggers layout!
}
```

### Selector Performance

```scss
// ✅ GOOD: Efficient selectors
.button { }
.card-title { }

// ⚠️ AVOID: Universal selector
* {
  box-sizing: border-box;  // OK for reset, avoid elsewhere
}

// ❌ BAD: Over-qualified selectors
div.card { }  // Unnecessary tag
ul li a { }   // Too generic
#id .class { }  // ID + class overkill
```

### Unused CSS Removal

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.html', './src/**/*.js', './src/**/*.vue'],
      safelist: ['is-active', 'is-open']  // Don't remove dynamic classes
    })
  ]
}
```

---

## Accessibility in CSS

### Focus Indicators

```scss
// ✅ GOOD: Visible focus indicator
:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

// Custom focus styles
.button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

// Remove focus for mouse users, keep for keyboard
.button:focus:not(:focus-visible) {
  outline: none;
}
```

### Color Contrast

```scss
// ✅ GOOD: WCAG AA compliant (4.5:1 for normal text)
.text {
  color: #212529;
  background-color: #ffffff;  // 16.1:1 contrast
}

// ❌ BAD: Low contrast (2.1:1)
.text-bad {
  color: #999999;
  background-color: #ffffff;
}

// Use tools: WebAIM Contrast Checker, Chrome DevTools
```

### Visually Hidden

```scss
// Accessible hiding (for screen readers)
.u-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Hide from everyone
.u-hidden {
  display: none;
}
```

### Reduced Motion

```scss
// Respect user preference
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Code Formatting

### General Rules

- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Max 120 characters
- **Quotes**: Single quotes for strings
- **Semicolons**: Always end declarations with semicolon
- **Trailing Commas**: Use in multi-line lists

### Property Order

```scss
.element {
  // 1. Positioning
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: z('dropdown'); // or 100 if local stacking
  
  // 2. Box Model
  display: block;
  width: 100px;
  height: 100px;
  padding: 10px;
  margin: 10px;
  border: 1px solid #ccc;
  
  // 3. Typography
  font-family: sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #333;
  text-align: center;
  
  // 4. Visual
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 1;
  
  // 5. Animation
  transition: all 0.3s ease;
  transform: translateX(0);
  
  // 6. Misc
  cursor: pointer;
  user-select: none;
}
```

### Comments

```scss
// Section comment
// ============================================================================

/**
 * Component: Button
 * Description: Reusable button component with variants
 */
.c-button {
  // Single line comment
  padding: var(--spacing-sm);
  
  /* Multi-line comment preserved in compiled CSS */
  background-color: var(--color-primary);
}

// TODO: Add dark theme variant
// FIXME: Focus style not visible on dark backgrounds
// NOTE: This requires JavaScript initialization
```

---

## Tooling

### Required Tools

**Sass Compiler**
- Dart Sass (recommended)
- Node Sass (deprecated)

**PostCSS Plugins**
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true
      }
    }),
    require('cssnano')({
      preset: 'default'
    })
  ]
}
```

**Linting**
```json
// .stylelintrc.json
{
  "extends": "stylelint-config-standard-scss",
  "rules": {
    "indentation": 2,
    "max-nesting-depth": 3,
    "selector-max-id": 0,
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$"
  }
}
```

**VS Code Extensions**
- Stylelint
- SCSS IntelliSense
- Color Highlight

---

## References

- [SASS Documentation](https://sass-lang.com/documentation)
- [BEM Methodology](https://en.bem.info/methodology/)
- [CSS Guidelines by Harry Roberts](https://cssguidelin.es/)
- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)
- [Web.dev CSS](https://web.dev/learn/css/)

---

**Version History:**
- 2.0 (Feb 2026): Added modern CSS features, logical properties, container queries, performance guidelines
- 1.0 (Initial): Basic BEM and OOCSS conventions