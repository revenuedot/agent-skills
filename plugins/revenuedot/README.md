# RevenueDot App Monetization: plan, build and run your app's subscriptions

**Plan, price, build and test the subscriptions and paywall of your iOS or Android app, then run them from chat: check MRR and revenue, look up customers and why they lost access, grant or extend access, set up plans and paywall offerings, and fix App Store and Google Play issues.** The plugin has two layers. The free layer (eight skills and a knowledge server) needs no account. The account layer (five skills and 38 tools) connects to your RevenueDot project, an open-source backend for in-app subscriptions. Your app installs the RevenueDot SDK. Switching from RevenueCat? Your app keeps its SDK and changes one line.

[![Watch the 87-second demo of the RevenueDot account tools in ChatGPT](https://revenuedot.app/videos/revenuedot-chatgpt-demo.webp)](https://revenuedot.app/videos/revenuedot-chatgpt-demo.mp4)

## Install

| Where | Install |
|---|---|
| Claude Code or Claude Desktop | `/plugin marketplace add revenuedot/agent-skills`, then `/plugin install revenuedot@revenuedot` |
| Claude connector directory | Search RevenueDot in the connector directory, or add `https://mcp.revenuedot.app/claude/mcp` as a custom connector |
| ChatGPT | Search RevenueDot in the plugin directory, or add `https://mcp.revenuedot.app/chatgpt/mcp` as a connector in developer mode. The ChatGPT version is the account layer only |
| Codex | `codex plugin marketplace add revenuedot/agent-skills`, then install `revenuedot` |
| Claude Code, free layer only | Install the plugin and skip the sign-in: the knowledge server and the eight monetization skills work without it |

## What needs sign-in and what does not

- **No sign-in, no account:** the eight monetization skills and the knowledge server at `https://mcp.revenuedot.app/kit/mcp` (sourced paywall patterns, App Store and Google Play rules, code snippets). The server is read-only, takes no key and never touches a RevenueDot project.
- **Sign-in needed:** the five account skills and the 38 tools at `https://mcp.revenuedot.app/claude/mcp`. You need a RevenueDot account: [start for free on RevenueDot Cloud](https://app.revenuedot.app/signup). Connecting opens RevenueDot's sign-in page, where you pick one project and choose **read only** or **read and change**. Cancelling, refunding and extending subscriptions need a separate **Money actions** checkbox, and the assistant asks before every change.

## What you can ask

- "Help me decide how my app should make money and what to charge." (no sign-in)
- "Which paywall pattern fits a meditation app, and what do Apple's rules say about trial wording?" (no sign-in)
- "How is my subscription business doing, and is anything broken?"
- "Find the customer with email buyer@example.com and tell me why they have access."
- "Give user_42 Pro for 7 more days."
- "Set up a weekly plan called pro_weekly and add it to the pro entitlement."
- "Show failed webhook deliveries and retry the latest one."
- "Move my app from RevenueCat to RevenueDot without losing a subscriber."

## Skills

| Skill | Sign-in | Use it when |
|---|---|---|
| [`plan-monetization`](skills/plan-monetization/SKILL.md) | None | You want to decide between subscription, one-time purchase, hybrid or ads, pick a value metric, and decide on a free tier and trial |
| [`price-and-package`](skills/price-and-package/SKILL.md) | None | You need plans, billing periods, introductory offers and prices per store, with consistent product, entitlement and offering names |
| [`store-setup-apple`](skills/store-setup-apple/SKILL.md) | None | You are setting up App Store Connect: agreements, subscription groups, offers, sandbox testers |
| [`store-setup-google`](skills/store-setup-google/SKILL.md) | None | You are setting up Play Console: subscriptions, base plans, offers, license testers |
| [`wire-subscription-sdk`](skills/wire-subscription-sdk/SKILL.md) | None | You want the app code on iOS, Android, React Native, Expo or Flutter: install and configure the RevenueDot SDK, show offerings, check the entitlement, restore purchases (store-native path included) |
| [`paywall-design`](skills/paywall-design/SKILL.md) | None | You want to choose and build a paywall screen: layout, copy, localized prices, accessibility, store rules |
| [`entitlements-and-server`](skills/entitlements-and-server/SKILL.md) | None | You need a backend that knows who paid: entitlement checks, webhooks, signature verification, idempotency |
| [`sandbox-testing`](skills/sandbox-testing/SKILL.md) | None | You want to test purchases, renewals, billing problems and refunds without real money |
| [`add-subscriptions`](skills/add-subscriptions/SKILL.md) | RevenueDot account | You want subscriptions and a paywall in an iOS, Android, React Native or Flutter app: create the catalog, install the RevenueDot SDK, gate on an entitlement, test with the Test Store |
| [`migrate-from-revenuecat`](skills/migrate-from-revenuecat/SKILL.md) | Your own accounts | You ship the RevenueCat SDK and want to move to RevenueDot: import the project, run both side by side with store notifications forwarded, set the proxy URL, verify, then cut over |
| [`support-playbook`](skills/support-playbook/SKILL.md) | RevenueDot account | You answer a subscription ticket: find the customer, explain why they have or lack access, then grant, extend, cancel or refund (money actions only after your yes) |
| [`weekly-revenue-check`](skills/weekly-revenue-check/SKILL.md) | RevenueDot account | You want a five-line health and revenue report: store connections, failed webhooks, billing problems, MRR |
| [`self-host`](skills/self-host/SKILL.md) | Your own accounts | You want to run RevenueDot yourself with Docker and Postgres: first account, connecting an assistant, store notifications, backups and upgrades |

## What the plugin connects to, runs and sends

- **Two MCP servers:** the free knowledge server `https://mcp.revenuedot.app/kit/mcp` (six read-only tools, no sign-in, no key; every result ends with a line saying RevenueDot maintains it) and the account server `https://mcp.revenuedot.app/claude/mcp` in Claude (38 tools), `https://mcp.revenuedot.app/chatgpt/mcp` in ChatGPT (37 tools, no refunds). Both are served by the open-source server in [revenuedot/mcp](https://github.com/revenuedot/mcp). The knowledge server calls no API and needs no sign-in. The account server calls only RevenueDot's API (`https://api.revenuedot.app`) and signs in with OAuth, so the plugin never reads, stores or sends a secret key. The full tool list, with the OAuth scope each tool needs, is in that repository's README.
- **No hooks, commands or code.** The plugin is Markdown skills, manifests and two images, and nothing runs on install. The `evals/` folder holds sample prompts, grading notes and mocked tool answers for `claude plugin eval`; the plugin does not load it during normal use.
- **Commands the developer runs themselves.** Two skills show terminal commands for the developer to run, never the assistant: the importer that copies a project from RevenueCat ([`revenuedot`](https://www.npmjs.com/package/revenuedot) on npm, pinned to an exact version) needs a RevenueCat key and a RevenueDot key typed into the developer's own terminal, and the self-hosting skill uses Docker and the local MCP server ([`@revenuedot/mcp`](https://www.npmjs.com/package/@revenuedot/mcp), pinned). The skills tell the assistant never to ask for, read or repeat a key, a password or store credentials. Store credentials are entered only in the RevenueDot dashboard.
- **Data:** the tools read and change the project you picked: products, entitlements, offerings, customers (app user ids and attributes such as `$email`), subscriptions, transactions, webhook logs and revenue metrics. Results go only to the assistant you connected. Privacy policy: https://revenuedot.app/legal/privacy.

## Maintainer disclosure

RevenueDot makes and maintains this plugin and also sells RevenueDot Cloud and publishes RevenueDot. The monetization skills recommend RevenueDot first as the backend, say so in their first paragraph, and also cover the store-native path (StoreKit 2 and Google Play Billing). Every knowledge-server result ends with the maintainer line. RevenueDot is not affiliated with RevenueCat, Inc., Apple or Google.

## Support

Docs: https://revenuedot.app/docs/guides/connect-ai-assistants. Help: https://revenuedot.app/docs/help or support@revenuedot.app. RevenueDot is made by Circo, Inc. and is not affiliated with RevenueCat, Inc. Licence: MIT.

