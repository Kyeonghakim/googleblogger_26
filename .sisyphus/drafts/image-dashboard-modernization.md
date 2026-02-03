# Draft: Image Minimum + Dashboard Modernization

## Requirements (confirmed)
1. **Image Minimum**: Increase from current max 2 Unsplash to minimum 3 images per post
2. **Dashboard UI/UX**: Complete modernization of all dashboard pages

## Technical Findings

### Image Logic (Current State)
- `src/utils/images.ts:92`: `if (insertCount >= 2) break;` - limits to 2 Unsplash
- `src/workers/ai-generator.ts:199`: fetches only 1 image per keyword
- YouTube thumbnail always included (1 image guaranteed)
- Images only insert before `<h2>` tags - structural constraint

### Dashboard Structure
- **Stack**: React 19 + Vite + Tailwind CSS v4 + react-router-dom v7
- **Pages to modernize**:
  1. `dashboard/src/pages/Dashboard.tsx` - Main draft list
  2. `dashboard/src/pages/DraftDetail.tsx` - Draft editing
  3. `dashboard/src/pages/Login.tsx` - Authentication
  4. `dashboard/src/pages/History.tsx` - Published history
  5. `dashboard/src/pages/Settings.tsx` - Settings
  6. `dashboard/src/components/Layout.tsx` - Sidebar layout
- **No icon library** currently installed

### Test Infrastructure
- **NONE** - No test files, no jest/vitest config
- Main project uses Bun
- Dashboard uses Vite (standard React)

## Decisions Made (User Confirmed)
1. **Image minimum**: Best effort - fetch 4-5 images, insert as many as structure allows
2. **Image insertion**: Expand insertion - add images at end of sections/after paragraphs if h2 tags insufficient. MUST ensure minimum 3 images.
3. **Color scheme**: Light mode only
4. **Design direction**: Clean Minimal (Notion-like) - white/slate backgrounds, subtle borders, minimal shadows
5. **Icons**: YES - add lucide-react for sidebar icons, action buttons, status indicators
6. **Test strategy**: Manual verification with Playwright browser automation

## NEW REQUIREMENT (Added)
7. **AI Prompt Improvement**: Update SYSTEM_PROMPT and INFORMATIONAL_TEMPLATE in ai-generator.ts to make AI-generated content sound more natural and human-like. Diverse sentence structures, natural expressions.

## Scope Boundaries
- INCLUDE: 
  - Image logic changes in src/utils/images.ts and src/workers/ai-generator.ts
  - All 6 dashboard pages/components modernization
- EXCLUDE: 
  - Backend API changes
  - Database schema changes
  - New features beyond styling
