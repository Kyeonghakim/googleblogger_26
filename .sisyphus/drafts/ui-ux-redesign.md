# Draft: Blogger Admin Dashboard UI/UX Redesign

## Requirements (confirmed)

### Current State Analysis
- **Framework**: React 19 + Tailwind CSS v4 (via @tailwindcss/vite)
- **Current Design**: Light mode, Slate color palette, card-based layouts
- **CSS Config**: No tailwind.config.js - uses CSS-first `@theme` approach
- **Current Patterns**:
  - Cards: `bg-white rounded-xl shadow-sm border border-slate-100`
  - Buttons: `bg-slate-900 hover:bg-slate-800`
  - Forms: `border-slate-200 focus:ring-slate-900`
- **Animations**: Minimal (`transition-colors`, `animate-spin` only)
- **Icons**: lucide-react (keeping)
- **Animation Libraries**: None installed

### Design Trends to Apply
1. **Liquid Glass Aesthetic**: `backdrop-blur` with glass panels
2. **Warm Neutrals**: Replace cool Slate with Zinc/Stone
3. **High-Contrast Grids**: Visible 1px borders with `border-white/10`
4. **Dark Mode as Baseline**: Primary design (not opt-in)
5. **Containerized Views**: Rounded containers with viewport padding
6. **Dopamine Accent Colors**: Saffron (#F4C430), Periwinkle (#CCCCFF)
7. **Typography**: Geist Sans font family
8. **Micro-interactions**: CSS transitions, smooth hover states
9. **Bottom-Heavy Mobile**: Existing bottom nav (keeping, enhancing)
10. **Bento Grids 2.0**: Dashboard card layout improvements

## Technical Decisions

### Tailwind CSS v4 Patterns (from research)
- **Glass Effect**: `backdrop-blur-md bg-white/5 border-white/10`
- **Dark Default**: Add `class="dark"` to `<html>` + Zinc palette
- **Font Integration**: `@fontsource/geist-sans` (npm install + import)
- **Premium Timing**: `cubic-bezier(0.16, 1, 0.3, 1)` for animations
- **Staggered Animations**: `[animation-delay:150ms]` arbitrary values

### @theme Configuration (Tailwind v4)
```css
@theme {
  /* Typography */
  --font-sans: "Geist Sans", ui-sans-serif, system-ui;
  
  /* Glass Effects */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 12px;
  
  /* Premium Animation */
  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Warm Neutrals + Accents - TBD based on user choice */
}
```

## Files to Update (10 total)

| File | Lines | Changes |
|------|-------|---------|
| `index.html` | 14 | Add `dark` class, update title |
| `src/index.css` | 12 | Complete rewrite with @theme design tokens |
| `src/App.css` | 43 | Delete (unused legacy Vite boilerplate) |
| `src/components/Layout.tsx` | 101 | Glassmorphic sidebar, header, bottom nav |
| `src/pages/Dashboard.tsx` | 123 | Glass cards, accent colors, improved grid |
| `src/pages/Login.tsx` | 62 | Centered glass card with blur background |
| `src/pages/NewPost.tsx` | 235 | Glass tabs, form styling, accent buttons |
| `src/pages/Settings.tsx` | 103 | Glass containers, warm form styling |
| `src/pages/History.tsx` | 77 | Glass list items with hover effects |
| `src/pages/DraftDetail.tsx` | 138 | Glass editor container, action buttons |

## Scope Boundaries

### INCLUDE
- All visual styling changes
- Dark mode implementation
- Glassmorphism effects
- Typography update (Geist font)
- Color palette transformation
- Micro-interaction animations
- Mobile bottom nav enhancement

### EXCLUDE
- Business logic changes
- API modifications
- Route structure changes
- Component functionality changes
- New features or components

## Design Decisions (CONFIRMED by user)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary Accent** | Periwinkle (#CCCCFF) | Soft purple-blue, AI/creative feel |
| **Neutral Palette** | Zinc | Balanced dark gray, Vercel-style |
| **Animation Approach** | CSS-only | Tailwind v4 built-in, lighter bundle |
| **Animation Intensity** | Subtle | Professional, 150-200ms transitions |

### Derived Color System
```css
/* Primary - Periwinkle */
--color-accent: #CCCCFF;
--color-accent-hover: #B8B8F0;
--color-accent-muted: rgba(204, 204, 255, 0.2);

/* Backgrounds - Zinc Dark */
--color-background: var(--color-zinc-950); /* #09090b */
--color-surface: var(--color-zinc-900);     /* #18181b */
--color-elevated: var(--color-zinc-800);    /* #27272a */

/* Text */
--color-text-primary: var(--color-zinc-50);  /* #fafafa */
--color-text-secondary: var(--color-zinc-400); /* #a1a1aa */
--color-text-muted: var(--color-zinc-500);   /* #71717a */

/* Borders & Glass */
--glass-border: rgba(255, 255, 255, 0.08);
--glass-bg: rgba(255, 255, 255, 0.03);
```

## Parallel Execution Strategy (Draft)

```
Wave 1 (Foundation - Start Immediately):
├── Install @fontsource/geist-sans dependency
├── Update index.html (dark class, title)
└── Rewrite index.css (@theme design system)

Wave 2 (Layout - After Wave 1):
└── Layout.tsx (sidebar, header, bottom nav)

Wave 3 (Pages - After Wave 2, ALL PARALLEL):
├── Dashboard.tsx
├── Login.tsx
├── NewPost.tsx
├── Settings.tsx
├── History.tsx
└── DraftDetail.tsx

Wave 4 (Cleanup):
└── Delete App.css
```

**Estimated Speedup**: ~45% faster than sequential (6 pages in parallel)
