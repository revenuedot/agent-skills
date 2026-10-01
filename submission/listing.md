# Directory listing copy (ChatGPT app directory and Claude connector directory)

**Name:** RevenueDot
**Tagline (80 characters or fewer):** Manage in-app subscriptions, customers and webhooks
**Category:** Productivity (ChatGPT), Business (Claude)
**Website:** https://revenuedot.app
**Privacy policy:** https://revenuedot.app/legal/privacy
**Terms:** https://revenuedot.app/legal/terms
**Support:** support@revenuedot.app, https://revenuedot.app/docs
**MCP server:** https://mcp.revenuedot.app/mcp (Streamable HTTP, OAuth 2.1 with PKCE S256, client ID metadata documents and dynamic registration)
**Source:** https://github.com/revenuedot/mcp and https://github.com/revenuedot/agent-skills (MIT)

## Description
RevenueDot is an open-source backend for in-app purchases that works with the RevenueCat SDK. Connect your RevenueDot project to run your subscriptions from chat: set up products, entitlements and offerings; find a customer by email or app user id and see why they lost access; grant or extend access; cancel or refund with your confirmation; check that Apple and Google are connected; debug failed webhooks; and read MRR and revenue.

## What it can and cannot do
- Reads and changes one project that the user picks when connecting. Read only is an option.
- Cancelling, refunding and extending subscriptions need a separate "Money actions" approval.
- It never asks for, or shows, store keys, passwords or API keys. Those are entered in the RevenueDot dashboard.
- It cannot create API keys, invite members or delete projects.

## Tools (34)
15 read-only, 13 that add or change data, 6 that delete, cancel, refund, revoke or archive (marked destructive). The full list with the OAuth scope each needs is in https://github.com/revenuedot/mcp#tools.

## Data the app reads
The project's catalog (products, entitlements, offerings), customers' app user ids, optional email attributes, subscription and transaction history, webhook delivery logs and revenue metrics. It does not read store credentials. Nothing is sent to third parties; results go to the assistant the user connected.
