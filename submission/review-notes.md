# Notes for the reviewer

- **Sign-in:** the connector uses OAuth. The consent page is on https://api.revenuedot.app and signs in with the RevenueDot dashboard account (https://app.revenuedot.app). Test account: see the credentials field of the submission form (never stored in this repo). The account is on the free plan and has one project, "Review demo", with the data listed in `test-prompts.md`.
- **Access levels:** the consent page offers "Read and change" or "Read only", and a separate "Money actions" checkbox (cancel, refund, extend, Test Store purchases). A first connection asks for read and change only; a tool that needs money actions returns `insufficient_scope` and the client asks again.
- **Revoking:** deleting the key named "OAuth: <app>" under API keys in the dashboard ends the connection at once.
- **Tool annotations:** every tool has `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint`. `verify-store-credentials` is the only open-world tool (it calls Apple or Google with the key already saved in the dashboard).
- **No secrets in tool calls:** no input is named or used for a key, password or token. Creating a webhook returns its signing secret once (the user's own secret, needed to verify deliveries).
- **Sandbox:** the demo project has only Test Store data; no real purchases or money are involved. Cancel and refund act only on Google Play subscriptions and answer with an error for the Test Store.
- **Domain verification (OpenAI):** `https://mcp.revenuedot.app/.well-known/openai-apps-challenge` returns the token from the developer dashboard.
- **Source and tests:** https://github.com/revenuedot/mcp (`pnpm test`: tool, OAuth and listing tests; `scripts/verify-live.mjs` checks the live server).
