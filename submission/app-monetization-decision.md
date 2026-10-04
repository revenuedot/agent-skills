# Decision: one plugin, RevenueDot App Monetization (2026-10-03)

- **What:** the plugin `revenuedot` (folder `plugins/revenuedot`, repo `revenuedot/agent-skills`) now bundles the free layer and the account layer. Display name: RevenueDot App Monetization. Version 0.2.0.
- **Free layer:** eight skills (plan-monetization, price-and-package, store-setup-apple, store-setup-google, wire-subscription-sdk, paywall-design, entitlements-and-server, sandbox-testing) and the no-auth knowledge server at https://mcp.revenuedot.app/kit/mcp, a second server in `.mcp.json` next to the account server.
- **Account layer:** unchanged: five skills and the 38-tool OAuth server at /claude/mcp.
- **Renamed skill:** the kit's `add-subscriptions` is `wire-subscription-sdk` in the plugin, because the account layer already has an `add-subscriptions` skill (it creates the catalog with the connector's tools). The two cross-reference each other.
- **ChatGPT and Claude connector listings:** unchanged. The ChatGPT ZIP is frozen (old name, five account skills, /chatgpt/mcp only, README of the listing in review); `scripts/pack-openai.sh` builds it from `openai-overlay.json` and `openai-README.md`.
- **Maintainer disclosure:** every skill's first paragraph and description, every knowledge-server result, the README and the server instructions say RevenueDot maintains it.
- **Open for Kai:** whether the knowledge data in `mcp/src/kit/data/` becomes the source of truth (it is a copy of `monetization-kit/data/`; the two can drift until monetization-kit is retired or reads from mcp).
