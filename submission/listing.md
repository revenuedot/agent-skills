# Directory listing copy (ChatGPT app directory and Claude connector directory)

**Name:** RevenueDot (10 characters)
**Subtitle (OpenAI limit 30 characters):** Run subscriptions from chat (27)
**Claude one-liner (200 characters):** Manage your mobile app's subscriptions and in-app purchases: check MRR and revenue, look up customers, set up plans and paywall offerings, and fix App Store and Google Play issues.
**Category:** Productivity (ChatGPT); Development tools and Data & Analytics (Claude)
**Website:** https://revenuedot.app
**Privacy policy:** https://revenuedot.app/legal/privacy
**Terms:** https://revenuedot.app/legal/terms
**Support page:** https://revenuedot.app/docs/help (email: support@revenuedot.app)
**MCP server for ChatGPT:** https://mcp.revenuedot.app/chatgpt/mcp (37 tools, no refunds: OpenAI refuses plugins that move money). **For the Claude directory and the Claude plugin:** https://mcp.revenuedot.app/claude/mcp (all 38 tools, including refunds behind the Money actions permission; Kai decided on 2026-10-01 that a refund of the developer's own customer is not a money transfer). https://mcp.revenuedot.app/mcp serves the same 38 tools for custom connectors. Streamable HTTP, OAuth 2.1 with PKCE S256, client ID metadata documents and dynamic registration. The origin https://mcp.revenuedot.app never changes.
**Source:** https://github.com/revenuedot/mcp and https://github.com/revenuedot/agent-skills (MIT)
**Plugin path (Claude plugin submission):** `plugins/revenuedot` in https://github.com/revenuedot/agent-skills, branch `main`. The directory reads and scans only that folder.

## Description
RevenueDot is an open-source backend for in-app purchases. Connect your RevenueDot project to run your subscriptions from chat: set up products, entitlements and offerings; find a customer by email or app user id and see why they lost access; grant or extend access; cancel with your confirmation (Claude also refunds); check that Apple and Google are connected; debug failed webhooks; and read MRR and revenue.

## Copy rules for the OpenAI listing
No pricing, free plans, trials, discounts or comparisons, and no RevenueCat name. Starter prompts are the three in `plugins/revenuedot/plugin.json`. RevenueDot sells nothing in the chat and has no checkout or upgrade link: it administers the owner's own app data.

## What it can and cannot do
- Reads and changes one project that the user picks when connecting. Read only is an option.
- Cancelling, refunding and extending subscriptions need a separate "Money actions" approval.
- It never asks for, or shows, store keys, passwords or API keys. Those are entered in the RevenueDot dashboard.
- It cannot create API keys, invite members or delete projects.

## Tools (37 in ChatGPT, 38 in Claude)
17 read-only, 13 that add or change data, 8 marked destructive: they delete, cancel, refund, revoke, archive, overwrite attributes or change where store notifications go (refund is Claude only). Reasons for each annotation: `annotation-justifications.md`. The full list with the OAuth scope each needs is in https://github.com/revenuedot/mcp#tools.

## Data the app reads
The project's catalog (products, entitlements, offerings), customers' app user ids, optional email attributes, subscription and transaction history, webhook delivery logs and revenue metrics. It does not read store credentials. Nothing is sent to third parties; results go to the assistant the user connected.
