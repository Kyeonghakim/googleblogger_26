# Pending Actions

## 2026-02-01: API Key Input Required
The following keys must be provided in `.dev.vars` to enable full functionality:
- `YOUTUBE_API_KEY`
- `GEMINI_API_KEY`
- `BLOGGER_CLIENT_ID`
- `BLOGGER_CLIENT_SECRET`
- `BLOGGER_REFRESH_TOKEN`
- `DASHBOARD_PASSWORD`
## Cloudflare Authentication
- Creating D1 database remotely fails without CLAUDE_API_TOKEN or interactive login.
- Recommended user action: Run 'bunx wrangler d1 create youtube-blogger-db' and update wrangler.toml.
## Cloudflare Auth Required
The 'wrangler' commands failed to connect to Cloudflare because of missing authentication.
**Action Required**:
1. Run `npx wrangler login` on your machine.
2. Run `npx wrangler d1 create youtube-blogger-db`.
3. Update `wrangler.toml` with the new `database_id`.
4. Proceed with deployment.

Currently running in LOCAL mode with a dummy database ID.
