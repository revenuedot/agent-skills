# RevenueDot plugin and agent skills

**The RevenueDot plugin for ChatGPT, Codex and Claude: the hosted connector (34 tools) plus skills that teach agents to set up RevenueDot, migrate from RevenueCat and handle support tickets.**

[![Watch the 87-second demo of RevenueDot in ChatGPT](https://revenuedot.app/videos/revenuedot-chatgpt-demo.webp)](https://revenuedot.app/videos/revenuedot-chatgpt-demo.mp4)

| Where | Install |
|---|---|
| Claude Code or Claude Desktop | `/plugin marketplace add revenuedot/agent-skills`, then `/plugin install revenuedot@revenuedot` |
| Codex | `codex plugin marketplace add revenuedot/agent-skills`, then install `revenuedot` |
| ChatGPT | Search RevenueDot in the plugin directory (after approval), or add `https://mcp.revenuedot.app/mcp` as a connector in developer mode |
| Claude connector directory | Search RevenueDot in the connector directory (after approval), or add `https://mcp.revenuedot.app/claude/mcp` as a custom connector |
| Skills only, any agent | `npx skills add revenuedot/agent-skills` |

Connecting asks you to sign in to RevenueDot, pick one project and choose read only or read and change. Cancelling and refunding are a separate checkbox.

## Skills

| Skill | Use it when |
|---|---|
| [`migrate-from-revenuecat`](skills/migrate-from-revenuecat/SKILL.md) | You ship the RevenueCat SDK and want to move to RevenueDot: import the project, run both side by side with store notifications forwarded, set the proxy URL, verify, then cut over |
| [`add-subscriptions`](skills/add-subscriptions/SKILL.md) | You want subscriptions and a paywall in an iOS, Android, React Native or Flutter app: create the catalog, configure the SDK, gate on an entitlement, test with the Test Store |
| [`support-playbook`](skills/support-playbook/SKILL.md) | You answer a subscription ticket: find the customer, explain why they have or lack access, then grant, extend, cancel or refund (money actions only after your yes) |
| [`weekly-revenue-check`](skills/weekly-revenue-check/SKILL.md) | You want a five-line health and revenue report: store connections, failed webhooks, billing problems, MRR |
| [`self-host`](skills/self-host/SKILL.md) | You want to run RevenueDot yourself with Docker and Postgres: first account, secret key, store notifications, backups and upgrades |

The skills work with RevenueDot Cloud (sign up at https://app.revenuedot.app; API `https://api.revenuedot.app`) or a self-hosted server. They work best with the RevenueDot MCP server connected: the hosted one at `https://mcp.revenuedot.app/mcp` (OAuth or a secret key), or a local one from [revenuedot/mcp](https://github.com/revenuedot/mcp). The local MCP server is on npm as [`@revenuedot/mcp`](https://www.npmjs.com/package/@revenuedot/mcp) and the importer CLI as [`revenuedot`](https://www.npmjs.com/package/revenuedot).

Each skill names the known gaps it depends on.

RevenueDot is not affiliated with RevenueCat, Inc.

## Files

- `plugin.json` (ChatGPT and Codex, with `extensions.com.openai`), `.codex-plugin/plugin.json` (older Codex path, kept equal), `.claude-plugin/plugin.json` (Claude), `mcp.json` and `.mcp.json` (the hosted server), `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`, `assets/`, `skills/`.
- `submission/`: the listing copy, test prompts and review notes for the ChatGPT and Claude directories.
- Check everything with `node --test test/plugin.test.mjs` and `claude plugin validate . --strict`.
