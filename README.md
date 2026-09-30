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

The skills work best with the RevenueDot MCP server connected (`npx -y @revenuedot/mcp`, see [revenuedot/mcp](https://github.com/revenuedot/mcp)).

RevenueDot is pre-alpha. Each skill names the known gaps it depends on.

RevenueDot is not affiliated with RevenueCat, Inc.
