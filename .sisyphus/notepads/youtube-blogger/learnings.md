## Project Initialization
- Used Bun for project setup.
- Cloudflare Wrangler installed as dev dependency.
- D1 database placeholder used in wrangler.toml due to lack of API token in agent environment.
- Standard Worker structure created with src/index.ts.

## Cloudflare D1 Local Development (2026-02-01)
- Always use the `--local` flag when executing D1 commands if remote authentication is not configured.
- Wrangler stores local D1 state in `.wrangler/state/v3/d1`.
- SQL migrations can be applied using `npx wrangler d1 execute <db-name> --local --file <path-to-sql>`.
