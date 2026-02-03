# Image Minimum + Dashboard Modernization + AI Prompt Improvement

## TL;DR

> **Quick Summary**: Fix image insertion to guarantee minimum 3 images per blog post, modernize the dashboard with a clean Notion-like UI using Tailwind v4 and lucide-react icons, and improve AI prompts to produce more natural, human-like content.
> 
> **Deliverables**:
> - Updated image insertion logic (3-5 images per post, paragraph fallback)
> - Modernized dashboard (6 pages/components with Clean Minimal design)
> - Improved AI prompts (natural writing style, no AI-isms)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 (image logic) | Task 3 → Tasks 4-8 (dashboard) | Task 9 (AI prompts - independent)

---

## Context

### Original Request
1. 블로그 글에 이미지가 1개뿐인데 최소 3개 포함되도록 수정
2. 현재 사이트가 구려서 최신 버전으로 변경
3. AI가 쓴 거 처럼 하는거 티안나게 매번 최신 버전으로 업데이트해

### Interview Summary
**Key Discussions**:
- Image minimum: Best effort approach - fetch 4-5 images, insert as many as structure allows, MUST ensure minimum 3
- Image insertion: Expand beyond h2 tags to paragraph-based fallback
- Dashboard style: Clean Minimal (Notion-like) - white/slate backgrounds, subtle borders
- Color scheme: Light mode only
- Icons: Add lucide-react for sidebar, buttons, status indicators
- AI prompts: Make content sound more natural, diverse sentence structures

**Research Findings**:
- `src/utils/images.ts:92`: `insertCount >= 2` limits to 2 Unsplash images
- `src/workers/ai-generator.ts:199`: fetches only 1 image per keyword
- Dashboard uses React 19 + Vite + Tailwind CSS v4
- No test infrastructure - manual verification with Playwright

### Metis Review
**Identified Gaps** (addressed):
- Image definition clarified: 1 YouTube thumbnail + minimum 2-3 Unsplash = 3+ total
- Keyword scaling: Will fetch 2 images per keyword instead of 1
- Edge case: Short content with few h2s → paragraph-based fallback insertion
- Edge case: Duplicate image prevention via Set tracking
- Guardrail: No dark mode implementation (light only as specified)
- Guardrail: Keep existing textarea for content editing (no rich text editor scope creep)

---

## Work Objectives

### Core Objective
Ensure blog posts have visually rich content (minimum 3 images), provide a modern user-friendly dashboard experience, and generate AI content that reads naturally without obvious AI characteristics.

### Concrete Deliverables
1. `src/utils/images.ts` - Updated insertion logic with paragraph fallback
2. `src/workers/ai-generator.ts` - Fetch 2 images per keyword, improved prompts
3. `dashboard/package.json` - lucide-react dependency
4. `dashboard/src/components/Layout.tsx` - Modern sidebar with icons
5. `dashboard/src/pages/Login.tsx` - Clean login form
6. `dashboard/src/pages/Dashboard.tsx` - Modern draft list
7. `dashboard/src/pages/DraftDetail.tsx` - Improved editing UI
8. `dashboard/src/pages/History.tsx` - Modern history table
9. `dashboard/src/pages/Settings.tsx` - Clean settings page

### Definition of Done
- [ ] Published blog posts contain minimum 3 images
- [ ] Dashboard loads with modern Clean Minimal styling
- [ ] All pages have consistent lucide-react icons
- [ ] AI-generated content reads naturally without AI-isms

### Must Have
- Minimum 3 images per blog post (1 YouTube thumbnail + 2+ Unsplash)
- Paragraph-based fallback when h2 tags are insufficient
- lucide-react icons on all interactive elements
- Slate/white color palette with subtle shadows
- Natural AI writing without "In conclusion", "Let's dive in", etc.

### Must NOT Have (Guardrails)
- NO dark mode variants or toggle
- NO rich text editor (keep textarea)
- NO new dashboard features beyond styling
- NO changes to API endpoints or database schema
- NO overly specific Unsplash keywords that return zero results
- NO duplicate images in the same post

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: Manual-only
- **Framework**: None

### Automated Verification (Agent-Executable)

Each TODO includes executable Playwright browser automation steps for UI verification and curl/bun commands for backend verification.

**Evidence Requirements:**
- Screenshots saved to `.sisyphus/evidence/` for UI changes
- Terminal output captured for command verification
- Generated blog post HTML inspected for image count

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Image insertion logic update (images.ts)
├── Task 3: Install lucide-react + Layout modernization
└── Task 9: AI prompt improvement (ai-generator.ts prompts)

Wave 2 (After Wave 1):
├── Task 2: Image fetching update (ai-generator.ts fetch logic) [depends: 1]
├── Task 4: Login page modernization [depends: 3]
├── Task 5: Dashboard page modernization [depends: 3]
└── Task 6: DraftDetail page modernization [depends: 3]

Wave 3 (After Wave 2):
├── Task 7: History page modernization [depends: 3]
├── Task 8: Settings page modernization [depends: 3]
└── Task 10: End-to-end verification [depends: 2, 6, 9]
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | 3, 9 |
| 2 | 1 | 10 | 4, 5, 6 |
| 3 | None | 4, 5, 6, 7, 8 | 1, 9 |
| 4 | 3 | None | 2, 5, 6 |
| 5 | 3 | None | 2, 4, 6 |
| 6 | 3 | 10 | 2, 4, 5 |
| 7 | 3 | None | 8 |
| 8 | 3 | None | 7 |
| 9 | None | 10 | 1, 3 |
| 10 | 2, 6, 9 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 3, 9 | 3 parallel agents |
| 2 | 2, 4, 5, 6 | 4 parallel agents |
| 3 | 7, 8, 10 | 3 parallel agents |

---

## TODOs

---

### Wave 1: Foundation (Start Immediately)

---

- [ ] 1. Update image insertion logic for minimum 3 images

  **What to do**:
  - Modify `insertImagesIntoContent` function to:
    - Increase `insertCount` limit from 2 to 5
    - Add paragraph-based fallback insertion when h2 tags are insufficient
    - Track inserted image URLs in a Set to prevent duplicates
    - Insert images after every 3rd paragraph if h2 count < 3
  - Ensure the function returns content with at least 3 images total (including hero)

  **Must NOT do**:
  - Do not change the hero image (YouTube thumbnail) logic
  - Do not add complex content analysis for "smart" placement
  - Do not modify the figure/img HTML structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file modification with clear logic changes
  - **Skills**: [`git-master`]
    - `git-master`: For atomic commit after changes
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not a UI task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3, 9)
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/utils/images.ts:85-105` - Current `insertImagesIntoContent` function with h2-based insertion loop
  - `src/utils/images.ts:92` - The `if (insertCount >= 2) break;` line to modify

  **Type References**:
  - `src/types.ts` - Check for any image-related type definitions

  **Why Each Reference Matters**:
  - Line 85-105 shows the exact loop structure that needs modification
  - Line 92 is the specific limit that caps insertion at 2 images

  **Acceptance Criteria**:

  ```bash
  # Agent runs to verify syntax:
  cd /Users/anna/dev/260201_googleblogger && bun build src/utils/images.ts --no-bundle
  # Assert: No TypeScript errors
  
  # Agent runs to verify logic change:
  grep -n "insertCount >= " src/utils/images.ts
  # Assert: Output shows limit >= 4 or >= 5 (not 2)
  
  # Agent runs to verify paragraph fallback exists:
  grep -n "<p>" src/utils/images.ts
  # Assert: Output shows paragraph-based insertion logic
  ```

  **Commit**: YES
  - Message: `fix(images): increase minimum image insertion to 3-5 with paragraph fallback`
  - Files: `src/utils/images.ts`
  - Pre-commit: `bun build src/utils/images.ts --no-bundle`

---

- [ ] 3. Install lucide-react and modernize Layout component

  **What to do**:
  - Add `lucide-react` to dashboard dependencies: `bun add lucide-react`
  - Modernize `Layout.tsx` with:
    - Collapsible sidebar with icon-only collapsed state
    - Icons for each nav item: Home, FileText, History, Settings, LogOut
    - Tailwind v4 styling: `bg-slate-50`, `bg-white`, rounded corners, subtle shadows
    - Smooth transitions on hover (`transition-colors duration-150`)
    - Active nav item indicator (left border or background highlight)

  **Must NOT do**:
  - No dark mode variants
  - No complex animations beyond simple transitions
  - No changes to routing logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with visual styling requirements
  - **Skills**: [`frontend-ui-ux`, `git-master`]
    - `frontend-ui-ux`: Clean Minimal design patterns, Tailwind v4 usage
    - `git-master`: Atomic commit
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for implementation, only verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 9)
  - **Blocks**: Tasks 4, 5, 6, 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `dashboard/src/components/Layout.tsx` - Current layout structure to modernize
  - `dashboard/src/App.tsx` - How Layout wraps routes

  **External References**:
  - Lucide React docs: https://lucide.dev/guide/packages/lucide-react

  **Icon Mapping**:
  | Nav Item | Lucide Icon |
  |----------|-------------|
  | Dashboard | `Home` |
  | Draft Detail | `FileText` |
  | History | `History` |
  | Settings | `Settings` |
  | Logout | `LogOut` |

  **Why Each Reference Matters**:
  - Layout.tsx is the main file to modify, shows current nav structure
  - App.tsx shows how Layout wraps all authenticated routes

  **Acceptance Criteria**:

  ```bash
  # Agent runs to verify dependency installed:
  cd /Users/anna/dev/260201_googleblogger/dashboard && grep "lucide-react" package.json
  # Assert: Output shows lucide-react in dependencies
  
  # Agent runs to verify build:
  cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
  # Assert: Build succeeds with no errors
  ```

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/ (after bun run dev)
  2. Login with password: khkh4546
  3. Wait for: Dashboard to load
  4. Assert: Sidebar visible with icons (Home, FileText, etc.)
  5. Assert: Background is slate-50 or white (not gray-50)
  6. Hover: Over nav items
  7. Assert: Smooth transition effect visible
  8. Screenshot: .sisyphus/evidence/task-3-layout-modern.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add lucide-react and modernize Layout with Clean Minimal design`
  - Files: `dashboard/package.json`, `dashboard/src/components/Layout.tsx`
  - Pre-commit: `cd dashboard && bun run build`

---

- [ ] 9. Improve AI prompts for natural, human-like writing

  **What to do**:
  - Update `SYSTEM_PROMPT` in `ai-generator.ts` to:
    - Emphasize varied sentence lengths (mix short and long)
    - Avoid AI-isms: "In conclusion", "Let's dive in", "It's important to note"
    - Use active voice primarily
    - Include natural transitions without being formulaic
    - Add personality without being informal
  - Update `INFORMATIONAL_TEMPLATE` to:
    - Remove any templated phrases that sound robotic
    - Encourage storytelling elements
    - Request specific examples and anecdotes
    - Avoid bullet point overuse

  **Must NOT do**:
  - Do not change the API call logic
  - Do not modify temperature or other model parameters
  - Do not change the Korean language requirement

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Prompt engineering for natural language generation
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not a UI task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 10
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/workers/ai-generator.ts:20-80` - SYSTEM_PROMPT constant
  - `src/workers/ai-generator.ts:82-150` - INFORMATIONAL_TEMPLATE constant

  **AI-isms to Avoid** (add to prompts):
  - "In conclusion" / "To summarize"
  - "Let's dive in" / "Let's explore"
  - "It's important to note that"
  - "First and foremost"
  - "Without further ado"
  - "At the end of the day"
  - Starting every section with "So,"

  **Natural Writing Guidelines** (add to prompts):
  - Vary sentence length: 5-25 words
  - Use contractions naturally (it's, don't, can't)
  - Include rhetorical questions occasionally
  - Add personal observations where appropriate
  - Use specific numbers and examples over generalizations

  **Why Each Reference Matters**:
  - Lines 20-80 contain the system prompt that shapes all AI output
  - Lines 82-150 contain the template that structures each post

  **Acceptance Criteria**:

  ```bash
  # Agent runs to verify syntax:
  cd /Users/anna/dev/260201_googleblogger && bun build src/workers/ai-generator.ts --no-bundle
  # Assert: No TypeScript errors
  
  # Agent runs to verify AI-isms are blocked:
  grep -i "In conclusion\|Let's dive in\|important to note" src/workers/ai-generator.ts
  # Assert: These phrases appear in "DO NOT USE" context, not as instructions
  
  # Agent runs to verify natural writing guidelines added:
  grep -i "sentence length\|active voice\|contractions" src/workers/ai-generator.ts
  # Assert: Output shows natural writing instructions
  ```

  **Commit**: YES
  - Message: `improve(ai): update prompts for natural, human-like writing style`
  - Files: `src/workers/ai-generator.ts`
  - Pre-commit: `bun build src/workers/ai-generator.ts --no-bundle`

---

### Wave 2: Image Fetching + Core Pages (After Wave 1)

---

- [ ] 2. Update image fetching to retrieve 2 images per keyword

  **What to do**:
  - Modify `searchUnsplashImages` call in ai-generator.ts to fetch 2 images per keyword
  - Update the image aggregation logic to collect all fetched images
  - Ensure at least 4-5 images are passed to `insertImagesIntoContent`

  **Must NOT do**:
  - Do not change Unsplash API key handling
  - Do not add new keywords (keep existing 3 keyword generation)
  - Do not modify the image URL structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small modification to existing function call
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Backend task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Task 10
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/workers/ai-generator.ts:199` - Current `searchUnsplashImages(keyword, env.UNSPLASH_ACCESS_KEY, 1)` call
  - `src/utils/images.ts:1-30` - `searchUnsplashImages` function signature

  **Why Each Reference Matters**:
  - Line 199 is the exact call to modify from count=1 to count=2
  - images.ts shows the function accepts a count parameter

  **Acceptance Criteria**:

  ```bash
  # Agent runs to verify change:
  grep -n "searchUnsplashImages" src/workers/ai-generator.ts
  # Assert: Shows count parameter as 2 (not 1)
  
  # Agent runs to verify syntax:
  cd /Users/anna/dev/260201_googleblogger && bun build src/workers/ai-generator.ts --no-bundle
  # Assert: No TypeScript errors
  ```

  **Commit**: YES (group with Task 9 if same file)
  - Message: `fix(images): fetch 2 images per keyword for better coverage`
  - Files: `src/workers/ai-generator.ts`
  - Pre-commit: `bun build src/workers/ai-generator.ts --no-bundle`

---

- [ ] 4. Modernize Login page

  **What to do**:
  - Apply Clean Minimal styling to Login.tsx:
    - Centered card with `bg-white rounded-xl shadow-sm`
    - `bg-slate-50` page background
    - Modern input styling: `border-slate-200 focus:ring-2 focus:ring-slate-900`
    - Button: `bg-slate-900 hover:bg-slate-800 text-white rounded-lg`
    - Add Lock icon from lucide-react
    - Subtle logo or title at top

  **Must NOT do**:
  - No dark mode
  - No changes to authentication logic
  - No password visibility toggle (keep simple)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI styling task
  - **Skills**: [`frontend-ui-ux`, `git-master`]
    - `frontend-ui-ux`: Clean Minimal design implementation
    - `git-master`: Atomic commit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 5, 6)
  - **Blocks**: None
  - **Blocked By**: Task 3 (needs lucide-react)

  **References**:

  **Pattern References**:
  - `dashboard/src/pages/Login.tsx` - Current login form structure
  - `dashboard/src/components/Layout.tsx` - Reference modernized styling from Task 3

  **Tailwind Classes to Use**:
  - Page: `min-h-screen bg-slate-50 flex items-center justify-center`
  - Card: `bg-white rounded-xl shadow-sm p-8 w-full max-w-md`
  - Input: `w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900`
  - Button: `w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors`

  **Why Each Reference Matters**:
  - Login.tsx shows current structure to preserve while restyling
  - Layout.tsx provides design consistency reference

  **Acceptance Criteria**:

  ```bash
  # Agent runs build:
  cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
  # Assert: Build succeeds
  ```

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/login
  2. Assert: Page background is slate-50 (light grayish)
  3. Assert: Login card has rounded corners and subtle shadow
  4. Assert: Lock icon visible
  5. Screenshot: .sisyphus/evidence/task-4-login-modern.png
  ```

  **Commit**: YES
  - Message: `style(dashboard): modernize Login page with Clean Minimal design`
  - Files: `dashboard/src/pages/Login.tsx`
  - Pre-commit: `cd dashboard && bun run build`

---

- [ ] 5. Modernize Dashboard (draft list) page

  **What to do**:
  - Apply Clean Minimal styling to Dashboard.tsx:
    - Page header with title and refresh button (RefreshCw icon)
    - Draft cards with `bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow`
    - Status badges: Pill-shaped with appropriate colors
    - Empty state with illustration or icon
    - Consistent spacing: `space-y-4` or `gap-6`

  **Must NOT do**:
  - No new features (sorting, filtering beyond existing)
  - No dark mode
  - No grid layout changes if list is preferred

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI styling with card components
  - **Skills**: [`frontend-ui-ux`, `git-master`]
    - `frontend-ui-ux`: Card design, status badges
    - `git-master`: Atomic commit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4, 6)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `dashboard/src/pages/Dashboard.tsx` - Current draft list structure
  - `dashboard/src/api.ts` - API types for draft data

  **Status Badge Colors**:
  | Status | Tailwind Classes |
  |--------|------------------|
  | Draft | `bg-amber-100 text-amber-800` |
  | Ready | `bg-green-100 text-green-800` |
  | Published | `bg-slate-100 text-slate-800` |
  | Error | `bg-red-100 text-red-800` |

  **Lucide Icons to Use**:
  - Refresh: `RefreshCw`
  - Edit draft: `Pencil`
  - Delete: `Trash2`
  - Empty state: `FileText` or `Inbox`

  **Why Each Reference Matters**:
  - Dashboard.tsx shows current card/list structure
  - api.ts shows draft data shape for status handling

  **Acceptance Criteria**:

  ```bash
  # Agent runs build:
  cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
  # Assert: Build succeeds
  ```

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/
  2. Login with: khkh4546
  3. Wait for: Draft list to load
  4. Assert: Cards have rounded corners and subtle shadows
  5. Assert: Status badges are pill-shaped
  6. Assert: Icons visible (RefreshCw, Pencil, etc.)
  7. Hover: Over a draft card
  8. Assert: Shadow increases on hover
  9. Screenshot: .sisyphus/evidence/task-5-dashboard-modern.png
  ```

  **Commit**: YES
  - Message: `style(dashboard): modernize Dashboard page with card-based draft list`
  - Files: `dashboard/src/pages/Dashboard.tsx`
  - Pre-commit: `cd dashboard && bun run build`

---

- [ ] 6. Modernize DraftDetail page

  **What to do**:
  - Apply Clean Minimal styling to DraftDetail.tsx:
    - Header with back button (ArrowLeft icon) and title
    - Form sections with clear labels
    - Textarea styling: `border-slate-200 focus:ring-2 focus:ring-slate-900 rounded-lg`
    - Action buttons: Primary (slate-900), Secondary (outline)
    - Preview section with proper typography
    - Save/Publish buttons with appropriate icons (Save, Send)

  **Must NOT do**:
  - No rich text editor (keep textarea)
  - No dark mode
  - No changes to save/publish logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex form UI with multiple sections
  - **Skills**: [`frontend-ui-ux`, `git-master`]
    - `frontend-ui-ux`: Form design, button hierarchy
    - `git-master`: Atomic commit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4, 5)
  - **Blocks**: Task 10
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `dashboard/src/pages/DraftDetail.tsx` - Current editing interface
  - `dashboard/src/api.ts` - Draft data structure

  **Lucide Icons to Use**:
  - Back: `ArrowLeft`
  - Save: `Save`
  - Publish: `Send`
  - Delete: `Trash2`
  - Preview: `Eye`

  **Button Hierarchy**:
  | Action | Style |
  |--------|-------|
  | Publish (primary) | `bg-slate-900 text-white` |
  | Save (secondary) | `border border-slate-300 text-slate-700` |
  | Delete (danger) | `text-red-600 hover:bg-red-50` |

  **Why Each Reference Matters**:
  - DraftDetail.tsx is the primary editing interface
  - api.ts shows the draft object structure for form fields

  **Acceptance Criteria**:

  ```bash
  # Agent runs build:
  cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
  # Assert: Build succeeds
  ```

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/
  2. Login with: khkh4546
  3. Click: On first draft in list
  4. Wait for: Draft detail page to load
  5. Assert: Back arrow visible in header
  6. Assert: Form inputs have rounded corners
  7. Assert: Save and Publish buttons visible with icons
  8. Assert: Button hierarchy clear (Publish more prominent)
  9. Screenshot: .sisyphus/evidence/task-6-draftdetail-modern.png
  ```

  **Commit**: YES
  - Message: `style(dashboard): modernize DraftDetail page with clean form design`
  - Files: `dashboard/src/pages/DraftDetail.tsx`
  - Pre-commit: `cd dashboard && bun run build`

---

### Wave 3: Remaining Pages + Verification (After Wave 2)

---

- [ ] 7. Modernize History page

  **What to do**:
  - Apply Clean Minimal styling to History.tsx:
    - Page header with History icon
    - Table or card list for published posts
    - Date formatting with relative time ("2 hours ago")
    - Link to published post with ExternalLink icon
    - Empty state if no history

  **Must NOT do**:
  - No pagination (unless already exists)
  - No dark mode
  - No new data fetching logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Table/list UI styling
  - **Skills**: [`frontend-ui-ux`, `git-master`]
    - `frontend-ui-ux`: Table design, data presentation
    - `git-master`: Atomic commit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `dashboard/src/pages/History.tsx` - Current history display
  - `dashboard/src/pages/Dashboard.tsx` - Reference card styling from Task 5

  **Lucide Icons to Use**:
  - Page header: `History`
  - External link: `ExternalLink`
  - Empty state: `Archive`

  **Why Each Reference Matters**:
  - History.tsx shows current structure and data shape
  - Dashboard.tsx provides consistent card styling reference

  **Acceptance Criteria**:

  ```bash
  # Agent runs build:
  cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
  # Assert: Build succeeds
  ```

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/history (after login)
  2. Assert: Page has History icon in header
  3. Assert: Posts listed with dates and external links
  4. Assert: Consistent styling with Dashboard
  5. Screenshot: .sisyphus/evidence/task-7-history-modern.png
  ```

  **Commit**: YES
  - Message: `style(dashboard): modernize History page`
  - Files: `dashboard/src/pages/History.tsx`
  - Pre-commit: `cd dashboard && bun run build`

---

- [ ] 8. Modernize Settings page

  **What to do**:
  - Apply Clean Minimal styling to Settings.tsx:
    - Page header with Settings icon
    - Form sections with clear labels
    - Toggle switches if applicable (simple styled checkboxes)
    - Save button with consistent styling
    - Success/error feedback messages

  **Must NOT do**:
  - No new settings options
  - No dark mode toggle
  - No account management features

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Settings form UI
  - **Skills**: [`frontend-ui-ux`, `git-master`]
    - `frontend-ui-ux`: Form design, settings patterns
    - `git-master`: Atomic commit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `dashboard/src/pages/Settings.tsx` - Current settings structure
  - `dashboard/src/pages/DraftDetail.tsx` - Reference form styling from Task 6

  **Lucide Icons to Use**:
  - Page header: `Settings`
  - Save: `Check`
  - Section headers: Contextual (e.g., `Bell` for notifications)

  **Why Each Reference Matters**:
  - Settings.tsx shows current form structure
  - DraftDetail.tsx provides form input styling reference

  **Acceptance Criteria**:

  ```bash
  # Agent runs build:
  cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
  # Assert: Build succeeds
  ```

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/settings (after login)
  2. Assert: Page has Settings icon in header
  3. Assert: Form inputs styled consistently
  4. Assert: Save button visible
  5. Screenshot: .sisyphus/evidence/task-8-settings-modern.png
  ```

  **Commit**: YES
  - Message: `style(dashboard): modernize Settings page`
  - Files: `dashboard/src/pages/Settings.tsx`
  - Pre-commit: `cd dashboard && bun run build`

---

- [ ] 10. End-to-end verification

  **What to do**:
  - Verify all three requirements work together:
    1. Generate a new blog post and verify minimum 3 images
    2. Navigate all dashboard pages and verify consistent styling
    3. Read generated content for natural writing quality
  - Create evidence screenshots and logs

  **Must NOT do**:
  - No code changes
  - No publishing to live blog (use preview only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, no code changes
  - **Skills**: [`playwright`, `git-master`]
    - `playwright`: Browser automation for full verification
    - `git-master`: Final commit if any fixes needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 6, 9

  **References**:

  **Verification Checklist**:
  - [ ] Image count: Minimum 3 visible in generated HTML
  - [ ] Dashboard pages: All 6 pages load with modern styling
  - [ ] AI content: No obvious AI-isms in generated text
  - [ ] Icons: lucide-react icons visible throughout

  **Acceptance Criteria**:

  ```bash
  # Agent runs to generate test post:
  curl -X POST http://localhost:8787/api/generate-post \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"videoId": "test123"}'
  # Assert: Response contains generated content
  
  # Agent verifies image count in generated HTML:
  # Parse response HTML and count <img> tags
  # Assert: Count >= 3
  ```

  ```
  # Agent executes via playwright browser automation:
  1. Navigate through: Login → Dashboard → DraftDetail → History → Settings
  2. Screenshot each page: .sisyphus/evidence/task-10-*.png
  3. Verify: Consistent slate/white color scheme
  4. Verify: All icons render correctly
  5. Open: Generated draft in DraftDetail
  6. Read: Content for natural language quality
  7. Count: Images in preview (minimum 3)
  ```

  **Evidence to Collect**:
  - `.sisyphus/evidence/task-10-full-flow.png` - Dashboard tour
  - `.sisyphus/evidence/task-10-image-count.png` - Draft with 3+ images
  - `.sisyphus/evidence/task-10-ai-content.txt` - Sample generated text

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(images): increase minimum image insertion to 3-5 with paragraph fallback` | src/utils/images.ts | bun build |
| 2 | `fix(images): fetch 2 images per keyword for better coverage` | src/workers/ai-generator.ts | bun build |
| 3 | `feat(dashboard): add lucide-react and modernize Layout` | dashboard/package.json, dashboard/src/components/Layout.tsx | bun run build |
| 4 | `style(dashboard): modernize Login page` | dashboard/src/pages/Login.tsx | bun run build |
| 5 | `style(dashboard): modernize Dashboard page` | dashboard/src/pages/Dashboard.tsx | bun run build |
| 6 | `style(dashboard): modernize DraftDetail page` | dashboard/src/pages/DraftDetail.tsx | bun run build |
| 7 | `style(dashboard): modernize History page` | dashboard/src/pages/History.tsx | bun run build |
| 8 | `style(dashboard): modernize Settings page` | dashboard/src/pages/Settings.tsx | bun run build |
| 9 | `improve(ai): update prompts for natural human-like writing` | src/workers/ai-generator.ts | bun build |

---

## Success Criteria

### Verification Commands
```bash
# Build backend
cd /Users/anna/dev/260201_googleblogger && bun build src/index.ts --no-bundle
# Expected: No errors

# Build dashboard
cd /Users/anna/dev/260201_googleblogger/dashboard && bun run build
# Expected: Build successful

# Verify image logic
grep -n "insertCount >=" src/utils/images.ts
# Expected: Shows >= 4 or >= 5

# Verify lucide-react installed
grep "lucide-react" dashboard/package.json
# Expected: Shows version in dependencies
```

### Final Checklist
- [ ] All "Must Have" present:
  - [x] Minimum 3 images per post
  - [x] Paragraph fallback insertion
  - [x] lucide-react icons
  - [x] Slate/white color palette
  - [x] Natural AI writing
- [ ] All "Must NOT Have" absent:
  - [x] No dark mode
  - [x] No rich text editor
  - [x] No new features
  - [x] No API changes
- [ ] All builds pass
- [ ] All Playwright verifications complete
