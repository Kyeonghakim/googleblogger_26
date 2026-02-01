# Environment Configuration Decisions

## 2026-02-01: API Keys and Environment Variables
- Created `.dev.vars.example` as a template for environment variables.
- Created `.dev.vars` for local development.
- Confirmed `.dev.vars` is ignored in `.gitignore`.
- Required keys identified:
    - `YOUTUBE_API_KEY`: For fetching YouTube video data.
    - `GEMINI_API_KEY`: For video content analysis and summary generation.
    - `BLOGGER_CLIENT_ID`: Google OAuth client ID for Blogger API.
    - `BLOGGER_CLIENT_SECRET`: Google OAuth client secret for Blogger API.
    - `BLOGGER_REFRESH_TOKEN`: OAuth refresh token for persistent Blogger API access.
    - `DASHBOARD_PASSWORD`: Password for protecting the admin dashboard.

## D1 Database Schema Design (2026-02-01)
- **drafts table**: Used for storing blog post drafts generated from YouTube videos.
  - `source_video_id` is UNIQUE to prevent duplicate drafts for the same video.
  - `created_at` and `updated_at` use INTEGER for Unix timestamps, which is SQLite-friendly.
- **settings table**: Key-value pair storage for application configuration.
- **publish_history table**: Tracks which drafts were published to Blogger, linking to Blogger's internal post ID.
- **Indexes**: Added indexes on `drafts.status` and `publish_history.draft_id` for performance in common query patterns.
