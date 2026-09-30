# RevenueDot agent skills

**Skills that teach coding agents (Claude Code, Codex, Cursor) to set up RevenueDot and migrate an app from RevenueCat.**

Install them into your agent:

```bash
npx skills add revenuedot/agent-skills
```

## Skills

| Skill | Use it when |
|---|---|
| [`migrate-from-revenuecat`](skills/migrate-from-revenuecat/SKILL.md) | You ship the RevenueCat SDK and want to move to RevenueDot: import the project, run both side by side with store notifications forwarded, set the proxy URL, verify, then cut over |
| [`add-subscriptions`](skills/add-subscriptions/SKILL.md) | You want subscriptions and a paywall in an iOS, Android, React Native or Flutter app: create the catalog, configure the SDK, gate on an entitlement, test with the Test Store |
| [`self-host`](skills/self-host/SKILL.md) | You want to run RevenueDot yourself with Docker and Postgres: first account, secret key, store notifications, backups and upgrades |

The skills work with RevenueDot Cloud (sign up at https://app.revenuedot.app; API `https://api.revenuedot.app`) or a self-hosted server. They work best with the RevenueDot MCP server connected: the hosted one at `https://mcp.revenuedot.app/mcp` (OAuth or a secret key), or a local one from [revenuedot/mcp](https://github.com/revenuedot/mcp). The local MCP server is on npm as [`@revenuedot/mcp`](https://www.npmjs.com/package/@revenuedot/mcp) and the importer CLI as [`revenuedot`](https://www.npmjs.com/package/revenuedot).

Each skill names the known gaps it depends on.

RevenueDot is not affiliated with RevenueCat, Inc.
