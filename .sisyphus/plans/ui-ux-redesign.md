# Blogger Admin Dashboard UI/UX Redesign

## TL;DR

> **Quick Summary**: Transform the React/Tailwind CSS v4 dashboard from light-mode Slate palette to a modern 2025-2026 design with dark-mode Zinc baseline, glassmorphism effects, Periwinkle accent color, Geist Sans typography, and subtle CSS micro-interactions.
> 
> **Deliverables**:
> - Updated design system in `index.css` with `@theme` tokens
> - Glassmorphic Layout (sidebar, header, bottom nav)
> - 6 restyled page components with consistent dark/glass aesthetic
> - Geist Sans font integration
> - Custom scrollbar styling
> 
> **Estimated Effort**: Medium (8-12 hours)
> **Parallel Execution**: YES - 4 waves (Wave 3 has 6 parallel page updates)
> **Critical Path**: Font Install → index.css → Layout.tsx → Pages

---

## Context

### Original Request
Transform this dashboard's UI/UX to follow 2025-2026 global design trends:
- Apply modern "Liquid Glass" glassmorphism effects
- Switch to dark mode as baseline with warm neutral accents
- Use high-contrast layouts with visible grid structure
- Add modern typography (Geist font)
- Implement smooth micro-interactions and transitions
- Update color palette to warm neutrals with dopamine accent colors
- Maintain all existing functionality - this is purely a visual redesign

### Interview Summary
**Key Discussions**:
- User chose Periwinkle (#CCCCFF) over Saffron for a calming AI/creative aesthetic
- Zinc palette preferred for modern Vercel-style appearance
- CSS-only animations to keep bundle light
- Subtle 150-200ms transitions for professional feel

**Research Findings**:
- Tailwind CSS v4 uses `@theme` blocks for CSS custom properties (no tailwind.config.js)
- Glassmorphism pattern: `backdrop-blur-md bg-white/5 border-white/10`
- Dark default: Add `class="dark"` to `<html>` element
- Geist font: Install via `@fontsource/geist-sans`
- Premium easing: `cubic-bezier(0.16, 1, 0.3, 1)`

### Metis Review
**Identified Gaps** (addressed):
- **Accessibility**: Periwinkle on Zinc-950 needs WCAG contrast validation → Added contrast check in acceptance criteria
- **Glass Overuse**: Limit `backdrop-blur` to sidebar/header/modals only → Added guardrail
- **Scrollbars**: Dark themes break default scrollbars → Added Task 3 for custom scrollbar
- **Form Consistency**: Current inputs use inconsistent slate classes → Wave 3 includes form normalization
- **Mobile Performance**: `backdrop-blur` is GPU-intensive → Simplified glass on mobile via media query

---

## Work Objectives

### Core Objective
Visually transform the dashboard from light-mode Slate to dark-mode Zinc with glassmorphism, while preserving all existing functionality and React component structure.

### Concrete Deliverables
| File | Deliverable |
|------|-------------|
| `dashboard/package.json` | `@fontsource/geist-sans` dependency added |
| `dashboard/index.html` | `class="dark"` on `<html>`, updated title |
| `dashboard/src/index.css` | Complete `@theme` design system with glass tokens |
| `dashboard/src/main.tsx` | Geist font imports |
| `dashboard/src/components/Layout.tsx` | Glassmorphic sidebar, header, bottom nav |
| `dashboard/src/pages/Dashboard.tsx` | Dark glass cards with Periwinkle accents |
| `dashboard/src/pages/Login.tsx` | Centered hero glass card |
| `dashboard/src/pages/NewPost.tsx` | Glass tabs, form styling |
| `dashboard/src/pages/Settings.tsx` | Glass form container |
| `dashboard/src/pages/History.tsx` | Glass list items |
| `dashboard/src/pages/DraftDetail.tsx` | Glass editor container |
| `dashboard/src/App.css` | DELETED (unused boilerplate) |

### Definition of Done
- [ ] `bun run build` completes with zero errors
- [ ] Zero instances of `slate-*` classes in any `.tsx` file (search: `grep -r "slate-" src/`)
- [ ] Zero instances of `bg-white` without intentional glass context
- [ ] All interactive elements use 150-200ms transitions with premium easing
- [ ] Periwinkle accent passes WCAG 2.1 contrast ratio on Zinc backgrounds
- [ ] Dashboard renders correctly on mobile viewport (375px width)

### Must Have
- Dark Zinc baseline (Zinc-950 background)
- Periwinkle (#CCCCFF) as primary accent color
- Glassmorphism on sidebar, header, and modal surfaces
- Geist Sans typography
- Smooth 150-200ms transitions on all interactive elements
- Custom dark-themed scrollbars
- Mobile-optimized bottom navigation

### Must NOT Have (Guardrails)
- ❌ NO `tailwind.config.js` file - use `@theme` in CSS only
- ❌ NO external animation libraries (framer-motion, GSAP, etc.)
- ❌ NO `backdrop-blur` on scrolling list items (performance)
- ❌ NO business logic changes
- ❌ NO API modifications
- ❌ NO new components beyond styling
- ❌ NO complex SVG filters or mesh gradients for "liquid" effect
- ❌ NO icon library changes (keep lucide-react)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no test files found)
- **User wants tests**: Manual-only (visual redesign)
- **Framework**: N/A

### Automated Verification (Agent-Executable)

Each TODO includes verification procedures using:

| Type | Tool | Method |
|------|------|--------|
| **Build Check** | Bash | `bun run build` exits 0 |
| **Code Audit** | Bash/grep | Search for forbidden patterns |
| **Visual Check** | Playwright | Screenshot comparison |
| **Dev Server** | Bash | `bun run dev` starts successfully |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Start Immediately):
├── Task 1: Install Geist font + update main.tsx imports
├── Task 2: Update index.html (dark class, title, font-family)
└── Task 3: Rewrite index.css (@theme design system + scrollbar)

Wave 2 (Layout - After Wave 1):
└── Task 4: Layout.tsx (glassmorphic sidebar, header, bottom nav)

Wave 3 (Pages - After Wave 2, ALL PARALLEL):
├── Task 5: Dashboard.tsx
├── Task 6: Login.tsx
├── Task 7: NewPost.tsx
├── Task 8: Settings.tsx
├── Task 9: History.tsx
└── Task 10: DraftDetail.tsx

Wave 4 (Cleanup - After Wave 3):
└── Task 11: Delete App.css + final audit

Critical Path: Task 1,2,3 → Task 4 → Task 5-10 → Task 11
Parallel Speedup: ~45% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4 | 2, 3 |
| 2 | None | 4 | 1, 3 |
| 3 | None | 4 | 1, 2 |
| 4 | 1, 2, 3 | 5-10 | None |
| 5 | 4 | 11 | 6, 7, 8, 9, 10 |
| 6 | 4 | 11 | 5, 7, 8, 9, 10 |
| 7 | 4 | 11 | 5, 6, 8, 9, 10 |
| 8 | 4 | 11 | 5, 6, 7, 9, 10 |
| 9 | 4 | 11 | 5, 6, 7, 8, 10 |
| 10 | 4 | 11 | 5, 6, 7, 8, 9 |
| 11 | 5-10 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 2, 3 | 3 parallel agents (quick category) |
| 2 | 4 | 1 agent (visual-engineering) |
| 3 | 5-10 | 6 parallel agents (quick category) |
| 4 | 11 | 1 agent (quick category) |

---

## TODOs

### Wave 1: Foundation (Parallel)

- [ ] 1. Install Geist Font + Update main.tsx

  **What to do**:
  - Run `bun add @fontsource/geist-sans` in dashboard directory
  - Add font imports to `src/main.tsx`:
    ```typescript
    import "@fontsource/geist-sans/400.css";
    import "@fontsource/geist-sans/500.css";
    import "@fontsource/geist-sans/600.css";
    import "@fontsource/geist-sans/700.css";
    ```
  - Verify import appears before `./index.css` import

  **Must NOT do**:
  - Do not add Geist Mono (only Sans needed)
  - Do not install from CDN
  - Do not modify any other files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple dependency install and import addition
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed for simple import task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `dashboard/src/main.tsx` - Entry point for font imports
  - `dashboard/package.json:12-16` - Dependencies section structure
  - https://www.npmjs.com/package/@fontsource/geist-sans - Official package docs

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cd /Users/anna/dev/260201_googleblogger/dashboard && cat package.json | grep -q "geist-sans"
  # Assert: Exit code 0 (dependency exists)
  
  grep -q "@fontsource/geist-sans" src/main.tsx
  # Assert: Exit code 0 (import exists)
  ```

  **Commit**: YES
  - Message: `style(dashboard): add Geist Sans font dependency`
  - Files: `dashboard/package.json`, `dashboard/src/main.tsx`
  - Pre-commit: `cd dashboard && bun install && bun run build`

---

- [ ] 2. Update index.html (Dark Mode + Meta)

  **What to do**:
  - Add `class="dark"` to `<html>` element
  - Update `<title>` to "Blogger Admin"
  - Add `<meta name="theme-color" content="#09090b">` for mobile browser chrome
  - Set `lang="ko"` (Korean UI)

  **Must NOT do**:
  - Do not add external font CDN links
  - Do not add additional scripts
  - Do not modify `<div id="root">`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple HTML attribute changes
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `dashboard/index.html:1-14` - Current HTML structure
  - Tailwind v4 dark mode docs: Dark class on html element

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -q 'class="dark"' /Users/anna/dev/260201_googleblogger/dashboard/index.html
  # Assert: Exit code 0
  
  grep -q 'theme-color.*#09090b' /Users/anna/dev/260201_googleblogger/dashboard/index.html
  # Assert: Exit code 0
  ```

  **Commit**: NO (groups with Task 3)

---

- [ ] 3. Rewrite index.css with @theme Design System

  **What to do**:
  - Complete rewrite of `src/index.css` with:
    - `@import "tailwindcss";`
    - `@theme` block with all design tokens
    - Custom scrollbar styles
    - Glass utility classes
    - Premium animation timing
  
  **Design Token Specification**:
  ```css
  @import "tailwindcss";

  @theme {
    /* Typography */
    --font-sans: "Geist Sans", ui-sans-serif, system-ui, sans-serif;
    
    /* Accent - Periwinkle */
    --color-accent: #CCCCFF;
    --color-accent-hover: #B8B8F0;
    --color-accent-muted: rgba(204, 204, 255, 0.15);
    
    /* Premium Animation */
    --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
    --duration-fast: 150ms;
    --duration-normal: 200ms;
  }

  /* Dark baseline */
  :root {
    color-scheme: dark;
  }

  body {
    @apply bg-zinc-950 text-zinc-50 font-sans antialiased;
  }

  /* Glass utilities */
  .glass {
    @apply bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl;
  }

  .glass-subtle {
    @apply bg-zinc-900/40 backdrop-blur-md border border-white/[0.05];
  }

  /* Mobile: reduce blur for performance */
  @media (max-width: 768px) {
    .glass, .glass-subtle {
      @apply backdrop-blur-sm;
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-zinc-900;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-zinc-700 rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-zinc-600;
  }

  /* Focus ring */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:ring-offset-2 focus:ring-offset-zinc-950;
  }

  /* Transitions */
  .transition-premium {
    transition-timing-function: var(--ease-premium);
    transition-duration: var(--duration-normal);
  }
  ```

  **Must NOT do**:
  - Do not create tailwind.config.js
  - Do not use `@apply` with slate-* colors
  - Do not add keyframe animations beyond simple transitions

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: CSS file rewrite with clear specification
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `dashboard/src/index.css:1-12` - Current minimal CSS
  - Tailwind v4 @theme docs: CSS-first configuration approach
  - Research finding: Glass pattern `backdrop-blur-md bg-white/5 border-white/10`

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -q "@theme" /Users/anna/dev/260201_googleblogger/dashboard/src/index.css
  # Assert: Exit code 0 (@theme block exists)
  
  grep -q "Geist Sans" /Users/anna/dev/260201_googleblogger/dashboard/src/index.css
  # Assert: Exit code 0 (font configured)
  
  grep -q "CCCCFF\|ccccff" /Users/anna/dev/260201_googleblogger/dashboard/src/index.css
  # Assert: Exit code 0 (Periwinkle accent defined)
  
  grep -q "webkit-scrollbar" /Users/anna/dev/260201_googleblogger/dashboard/src/index.css
  # Assert: Exit code 0 (custom scrollbar exists)
  ```

  **Commit**: YES
  - Message: `style(dashboard): implement dark glass design system with Periwinkle accent`
  - Files: `dashboard/index.html`, `dashboard/src/index.css`
  - Pre-commit: `cd dashboard && bun run build`

---

### Wave 2: Layout (Sequential)

- [ ] 4. Update Layout.tsx with Glassmorphic Navigation

  **What to do**:
  - Replace all `slate-*` classes with Zinc equivalents
  - Apply `glass` class to sidebar and header
  - Update navigation item styling:
    - Inactive: `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50`
    - Active: `text-[--color-accent] bg-zinc-800/80 font-medium`
  - Update mobile bottom nav with glass effect
  - Add `transition-premium` class to all interactive elements
  - Update logout button: `hover:bg-red-500/10 hover:text-red-400`

  **Color Mapping**:
  | Old | New |
  |-----|-----|
  | `bg-slate-50` | `bg-zinc-950` |
  | `bg-white` | `glass` (sidebar/header) or `bg-zinc-900` |
  | `border-slate-200` | `border-zinc-800` or `border-white/[0.08]` |
  | `text-slate-900` | `text-zinc-50` |
  | `text-slate-600` | `text-zinc-400` |
  | `text-slate-400` | `text-zinc-500` |
  | `hover:bg-slate-100` | `hover:bg-zinc-800/50` |

  **Must NOT do**:
  - Do not change component structure or routing logic
  - Do not add new navigation items
  - Do not use backdrop-blur on mobile bottom nav (use solid bg-zinc-900)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI component with responsive behavior
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Glass effects and responsive design expertise

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Tasks 5, 6, 7, 8, 9, 10
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  - `dashboard/src/components/Layout.tsx:1-101` - Full component to update
  - `dashboard/src/index.css` - Glass utility classes defined in Task 3
  - Pattern: Desktop sidebar (lines 24-60), Mobile bottom nav (lines 78-97)

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -c "slate-" /Users/anna/dev/260201_googleblogger/dashboard/src/components/Layout.tsx
  # Assert: Output is "0" (no slate classes remain)
  
  grep -q "glass" /Users/anna/dev/260201_googleblogger/dashboard/src/components/Layout.tsx
  # Assert: Exit code 0 (glass class applied)
  
  grep -q "zinc-" /Users/anna/dev/260201_googleblogger/dashboard/src/components/Layout.tsx
  # Assert: Exit code 0 (zinc palette used)
  ```

  **For Visual Verification** (using playwright skill):
  ```
  1. Start dev server: bun run dev (in dashboard directory)
  2. Navigate to: http://localhost:5173/
  3. Screenshot: .sisyphus/evidence/task-4-layout-desktop.png
  4. Resize viewport to 375x812 (mobile)
  5. Screenshot: .sisyphus/evidence/task-4-layout-mobile.png
  6. Assert: Sidebar has glass blur effect (visible in screenshot)
  7. Assert: Bottom nav visible on mobile
  ```

  **Commit**: YES
  - Message: `style(dashboard): apply glassmorphic navigation with Zinc palette`
  - Files: `dashboard/src/components/Layout.tsx`
  - Pre-commit: `cd dashboard && bun run build`

---

### Wave 3: Pages (All Parallel)

- [ ] 5. Update Dashboard.tsx

  **What to do**:
  - Replace header section styling:
    - Title: `text-2xl font-semibold text-zinc-50`
    - "새 글 작성" button: `bg-[--color-accent] text-zinc-900 hover:bg-[--color-accent-hover]` (dark text on light accent for contrast)
  - Empty state card: Apply `glass-subtle` class with Periwinkle icon tint
  - Draft cards:
    - Container: `glass-subtle rounded-xl` with `hover:border-zinc-700` transition
    - Title: `text-zinc-50 group-hover:text-[--color-accent]`
    - Status badges: Keep semantic colors but on dark backgrounds
      - pending: `bg-amber-500/20 text-amber-400`
      - approved: `bg-green-500/20 text-green-400`
      - published: `bg-zinc-700 text-zinc-300`
    - Date: `text-zinc-500`
    - Delete button: `text-zinc-500 hover:text-red-400 hover:bg-red-500/10`
  - Loading spinner: `border-[--color-accent]`
  - Add `transition-premium` to all interactive elements

  **Must NOT do**:
  - Do not change data fetching logic
  - Do not modify Draft interface
  - Do not use `bg-white` anywhere

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward class replacement
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 8, 9, 10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 4

  **References**:
  - `dashboard/src/pages/Dashboard.tsx:1-123` - Full component
  - `dashboard/src/index.css` - Glass utility classes (from Task 3)
  - Lines 34-43: `getStatusColor` function needs update
  - Lines 75-79: Empty state pattern
  - Lines 82-117: Card pattern

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -c "slate-\|bg-white" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/Dashboard.tsx
  # Assert: Output is "0"
  
  grep -q "color-accent" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/Dashboard.tsx
  # Assert: Exit code 0 (accent color used)
  
  grep -q "glass" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/Dashboard.tsx
  # Assert: Exit code 0 (glass classes used)
  ```

  **Commit**: NO (groups with other pages in Task 11)

---

- [ ] 6. Update Login.tsx

  **What to do**:
  - Background: `min-h-screen bg-zinc-950` with optional subtle gradient
  - Login card: `glass rounded-2xl p-8` (larger radius for hero card)
  - Icon circle: `bg-zinc-800 border border-zinc-700`
  - Title: `text-2xl font-semibold text-zinc-50`
  - Input: `bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:border-[--color-accent] focus:ring-[--color-accent]`
  - Error text: `text-red-400`
  - Submit button: `bg-[--color-accent] text-zinc-900 hover:bg-[--color-accent-hover] font-medium`
  - Add `transition-premium` to button and input focus

  **Must NOT do**:
  - Do not change form submission logic
  - Do not add password visibility toggle
  - Do not add decorative background elements

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-page form styling
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 7, 8, 9, 10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 4

  **References**:
  - `dashboard/src/pages/Login.tsx:1-62` - Full component
  - Lines 32-59: JSX to update
  - Form input pattern: Lines 42-48

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -c "slate-\|bg-white" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/Login.tsx
  # Assert: Output is "0"
  
  grep -q "glass" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/Login.tsx
  # Assert: Exit code 0
  ```

  **Commit**: NO (groups with other pages)

---

- [ ] 7. Update NewPost.tsx

  **What to do**:
  - Container card: `glass rounded-xl`
  - Tab bar:
    - Inactive tab: `bg-zinc-900 text-zinc-400 hover:text-zinc-200`
    - Active "직접 작성" tab: `bg-zinc-800 text-zinc-50 border-b-2 border-zinc-50`
    - Active "AI" tab: `bg-zinc-800 text-[--color-accent] border-b-2 border-[--color-accent]`
  - AI info box: `bg-[--color-accent-muted] border-[--color-accent]/20 text-zinc-200`
  - Form labels: `text-sm font-medium text-zinc-300`
  - Inputs/textareas: Same pattern as Login.tsx
  - Radio buttons: `accent-[--color-accent]` (CSS accent-color)
  - Error alert: `bg-red-500/10 border-red-500/20 text-red-400`
  - Submit buttons:
    - "작성 완료": `bg-zinc-50 text-zinc-900 hover:bg-zinc-200`
    - "글 생성 시작": `bg-[--color-accent] text-zinc-900 hover:bg-[--color-accent-hover]`

  **Must NOT do**:
  - Do not change tab switching logic
  - Do not modify form state management
  - Do not change API calls

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Form-heavy but straightforward class updates
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 8, 9, 10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 4

  **References**:
  - `dashboard/src/pages/NewPost.tsx:1-235` - Full component
  - Lines 66-89: Tab bar pattern
  - Lines 100-169: Direct form
  - Lines 171-228: AI form

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -c "slate-\|bg-white" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/NewPost.tsx
  # Assert: Output is "0"
  
  grep -q "color-accent" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/NewPost.tsx
  # Assert: Exit code 0
  ```

  **Commit**: NO (groups with other pages)

---

- [ ] 8. Update Settings.tsx

  **What to do**:
  - Header: Icon `text-zinc-400`, title `text-zinc-50`
  - Settings card: `glass-subtle rounded-xl p-6`
  - Success message: `bg-green-500/10 text-green-400 rounded-lg`
  - Form labels: `text-sm font-medium text-zinc-300`
  - Inputs: Same pattern as Login.tsx
  - Save button: `bg-[--color-accent] text-zinc-900 hover:bg-[--color-accent-hover]`
  - Border separator: `border-zinc-800`
  - Loading text: `text-zinc-500`

  **Must NOT do**:
  - Do not change settings state management
  - Do not modify API interaction

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple settings form styling
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 7, 9, 10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 4

  **References**:
  - `dashboard/src/pages/Settings.tsx:1-103` - Full component
  - Lines 49-100: JSX to update

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -c "slate-\|bg-white" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/Settings.tsx
  # Assert: Output is "0"
  ```

  **Commit**: NO (groups with other pages)

---

- [ ] 9. Update History.tsx

  **What to do**:
  - Header: Icon `text-zinc-400`, title `text-zinc-50`
  - Empty state: `text-zinc-500` with `text-zinc-600` icon
  - History cards: `glass-subtle rounded-xl p-6 hover:border-zinc-700 transition-premium`
  - Title: `text-zinc-50`
  - Date: `text-zinc-500`
  - External link icon: `text-zinc-500 hover:text-[--color-accent] hover:bg-zinc-800`
  - Disabled link: `text-zinc-700 cursor-not-allowed`
  - Loading text: `text-zinc-500`

  **Must NOT do**:
  - Do not change date formatting logic
  - Do not modify history data structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple list component styling
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 7, 8, 10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 4

  **References**:
  - `dashboard/src/pages/History.tsx:1-77` - Full component
  - Lines 39-73: JSX to update

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -c "slate-\|bg-white" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/History.tsx
  # Assert: Output is "0"
  ```

  **Commit**: NO (groups with other pages)

---

- [ ] 10. Update DraftDetail.tsx

  **What to do**:
  - Back button: `text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50`
  - Title: `text-2xl font-semibold text-zinc-50`
  - Editor card: `glass rounded-xl p-6`
  - Form labels: `text-sm font-medium text-zinc-300`
  - Title input: Same pattern as Login.tsx
  - Content textarea: `bg-zinc-900 border-zinc-700 text-zinc-50 font-mono`
  - Border separator: `border-zinc-800`
  - Delete button: `text-red-400 hover:bg-red-500/10`
  - Save button: `border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50`
  - Publish button: `bg-[--color-accent] text-zinc-900 hover:bg-[--color-accent-hover]`
  - Loading text: `text-zinc-500` (note: line 71 uses `text-gray-500` - needs fixing too)

  **Must NOT do**:
  - Do not change CRUD logic
  - Do not modify navigation behavior
  - Do not add rich text editor

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Form-based editor styling
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 7, 8, 9)
  - **Blocks**: Task 11
  - **Blocked By**: Task 4

  **References**:
  - `dashboard/src/pages/DraftDetail.tsx:1-138` - Full component
  - Line 71-72: Uses `text-gray-500` (outlier - also needs conversion)
  - Lines 74-134: Main JSX to update

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -c "slate-\|bg-white\|gray-" /Users/anna/dev/260201_googleblogger/dashboard/src/pages/DraftDetail.tsx
  # Assert: Output is "0" (note: includes gray- which exists in current code)
  ```

  **Commit**: NO (groups with other pages)

---

### Wave 4: Cleanup (Final)

- [ ] 11. Delete App.css + Final Audit + Commit All Pages

  **What to do**:
  - Delete `src/App.css` (unused Vite boilerplate)
  - Run final audit:
    - Search entire `src/` for any remaining `slate-` classes
    - Search for any `bg-white` without glass context
    - Search for any `gray-` classes (outliers)
  - Fix any issues found
  - Run `bun run build` to verify no errors
  - Commit all page changes together

  **Must NOT do**:
  - Do not delete any other files
  - Do not modify non-style code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File deletion and audit
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential - final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 5, 6, 7, 8, 9, 10

  **References**:
  - `dashboard/src/App.css:1-43` - File to delete
  - All page files from Tasks 5-10

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  test ! -f /Users/anna/dev/260201_googleblogger/dashboard/src/App.css
  # Assert: Exit code 0 (file deleted)
  
  grep -r "slate-" /Users/anna/dev/260201_googleblogger/dashboard/src/ --include="*.tsx" | wc -l
  # Assert: Output is "0"
  
  grep -r "bg-white[^/]" /Users/anna/dev/260201_googleblogger/dashboard/src/ --include="*.tsx" | wc -l
  # Assert: Output is "0" (bg-white/X for glass is OK)
  
  cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
  # Assert: Exit code 0
  ```

  **For Visual Verification** (using playwright skill):
  ```
  1. Start dev server: bun run dev (in dashboard directory)
  2. Navigate to: http://localhost:5173/login
  3. Screenshot: .sisyphus/evidence/task-11-login.png
  4. Login and navigate to dashboard
  5. Screenshot: .sisyphus/evidence/task-11-dashboard.png
  6. Navigate to /new
  7. Screenshot: .sisyphus/evidence/task-11-newpost.png
  8. Navigate to /settings
  9. Screenshot: .sisyphus/evidence/task-11-settings.png
  10. Navigate to /history
  11. Screenshot: .sisyphus/evidence/task-11-history.png
  12. Assert: All pages show dark Zinc background with Periwinkle accents
  ```

  **Commit**: YES
  - Message: `style(dashboard): complete UI/UX redesign with dark glass aesthetic`
  - Files: All modified page files, delete App.css
  - Pre-commit: `cd dashboard && bun run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `style(dashboard): add Geist Sans font dependency` | package.json, main.tsx | `bun install && bun run build` |
| 3 | `style(dashboard): implement dark glass design system with Periwinkle accent` | index.html, index.css | `bun run build` |
| 4 | `style(dashboard): apply glassmorphic navigation with Zinc palette` | Layout.tsx | `bun run build` |
| 11 | `style(dashboard): complete UI/UX redesign with dark glass aesthetic` | All pages, -App.css | `bun run build` |

---

## Success Criteria

### Verification Commands
```bash
# Build succeeds
cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
# Expected: Exit code 0, no errors

# No slate classes remain
grep -r "slate-" src/ --include="*.tsx" --include="*.css" | wc -l
# Expected: 0

# Periwinkle accent is defined
grep -q "CCCCFF" src/index.css
# Expected: Exit code 0

# Geist font is imported
grep -q "geist-sans" src/main.tsx
# Expected: Exit code 0

# Glass utilities exist
grep -q "\.glass" src/index.css
# Expected: Exit code 0
```

### Final Checklist
- [ ] All "Must Have" present (dark Zinc, Periwinkle accent, glassmorphism, Geist font, 150-200ms transitions, scrollbars, mobile nav)
- [ ] All "Must NOT Have" absent (no tailwind.config.js, no framer-motion, no backdrop-blur on list items, no logic changes)
- [ ] Build passes with zero errors
- [ ] All 6 pages render correctly on desktop and mobile viewports
- [ ] Custom scrollbars visible in dark theme
- [ ] Glass effects visible on sidebar and header
