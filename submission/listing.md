# Directory listing copy (ChatGPT app directory and Claude connector directory)

**Name:** RevenueDot (10 characters)
**Subtitle (OpenAI limit 30 characters):** Run subscriptions from chat (27)
**Claude one-liner (200 characters):** Manage your mobile app's subscriptions and in-app purchases: check MRR and revenue, look up customers, set up plans and paywall offerings, and fix App Store and Google Play issues.
**Category:** Productivity (ChatGPT); Development tools and Data & Analytics (Claude)
**Website:** https://revenuedot.app
**Privacy policy:** https://revenuedot.app/legal/privacy
**Terms:** https://revenuedot.app/legal/terms
**Support page:** https://revenuedot.app/docs/help (email: support@revenuedot.app)
**MCP server for ChatGPT:** https://mcp.revenuedot.app/chatgpt/mcp. **For the Claude directory:** https://mcp.revenuedot.app/claude/mcp. Both have 33 tools and no refunds, because both directories refuse listings that move money. The full set of 34 tools stays at https://mcp.revenuedot.app/mcp for custom connectors and Claude Code. Streamable HTTP, OAuth 2.1 with PKCE S256, client ID metadata documents and dynamic registration. The origin https://mcp.revenuedot.app never changes.
**Source:** https://github.com/revenuedot/mcp and https://github.com/revenuedot/agent-skills (MIT)

## Description
RevenueDot is an open-source backend for in-app purchases. Connect your RevenueDot project to run your subscriptions from chat: set up products, entitlements and offerings; find a customer by email or app user id and see why they lost access; grant or extend access; cancel with your confirmation; check that Apple and Google are connected; debug failed webhooks; and read MRR and revenue.

## Copy rules for the OpenAI listing
No pricing, free plans, trials, discounts or comparisons, and no RevenueCat name. Starter prompts are the three in `plugin.json`. RevenueDot sells nothing in the chat and has no checkout or upgrade link: it administers the owner's own app data.

## What it can and cannot do
- Reads and changes one project that the user picks when connecting. Read only is an option.
- Cancelling, refunding and extending subscriptions need a separate "Money actions" approval.
- It never asks for, or shows, store keys, passwords or API keys. Those are entered in the RevenueDot dashboard.
- It cannot create API keys, invite members or delete projects.

## Tools (33 in both directories)
15 read-only, 12 that add or change data, 6 that delete, cancel, revoke or archive (marked destructive). Refunds exist only at /mcp. Reasons for each annotation: `annotation-justifications.md`. The full list with the OAuth scope each needs is in https://github.com/revenuedot/mcp#tools.

## Data the app reads
The project's catalog (products, entitlements, offerings), customers' app user ids, optional email attributes, subscription and transaction history, webhook delivery logs and revenue metrics. It does not read store credentials. Nothing is sent to third parties; results go to the assistant the user connected.
