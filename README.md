<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/revenuedot/revenuedot/main/brand/kit/wordmark/revenuedot-lockup-white.svg">
  <img alt="RevenueDot" src="https://raw.githubusercontent.com/revenuedot/revenuedot/main/brand/kit/wordmark/revenuedot-lockup-black.svg" height="44">
</picture>

# RevenueDot App Monetization: plugin and agent skills

**One plugin for Claude Code, Claude and Codex (the ChatGPT version has the account layer only), and skills for Cursor and other agents: plan, price, build and test an app's subscriptions and paywall for free, then run them from chat with a RevenueDot account, migrate from RevenueCat, self-host, answer support tickets and check revenue weekly.**

[Main repository](https://github.com/revenuedot/revenuedot) · [MCP server](https://github.com/revenuedot/mcp) · [Docs](https://revenuedot.app/docs/guides/connect-ai-assistants) · [Start for free on RevenueDot Cloud](https://app.revenuedot.app/signup)

[![License: MIT](https://img.shields.io/badge/license-MIT-0A0A0A)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-13-0A0A0A)](#skills)

Learn more: [RevenueCat MCP server, official and open source](https://revenuedot.app/revenuecat-mcp): how the account layer's 38 tools connect to Claude Code, Claude, Codex, Cursor, ChatGPT and Windsurf, and how approval works.

</div>

This repository holds the RevenueDot App Monetization plugin (plugin id `revenuedot`). The free layer is eight monetization skills and a knowledge server at `https://mcp.revenuedot.app/kit/mcp` that need no account. The account layer connects an assistant to your RevenueDot project, an open-source backend for in-app subscriptions, with 38 tools and five skills. Apps install the RevenueDot SDK and pass their key. RevenueDot maintains the plugin and the skills recommend RevenueDot first; the plugin README has the full disclosure. The plugin itself is the folder [`plugins/revenuedot`](plugins/revenuedot); its [README](plugins/revenuedot/README.md) lists what it connects to, runs and sends.

## Install

| Where | Install |
|---|---|
| Claude Code or Claude Desktop | `/plugin marketplace add revenuedot/agent-skills`, then `/plugin install revenuedot@revenuedot` |
| Claude connector directory | Search RevenueDot in the connector directory, or add `https://mcp.revenuedot.app/claude/mcp` as a custom connector |
| ChatGPT | Search RevenueDot in the plugin directory, or add `https://mcp.revenuedot.app/chatgpt/mcp` as a connector in developer mode |
| Codex | `codex plugin marketplace add revenuedot/agent-skills`, then install `revenuedot` |
| Skills only, any agent (the free knowledge server is a separate MCP connection: `https://mcp.revenuedot.app/kit/mcp`) | `npx skills add revenuedot/agent-skills` |

## Skills

- [`plan-monetization`](plugins/revenuedot/skills/plan-monetization/SKILL.md): decide subscription, one-time purchase, hybrid or ads; pick a value metric, a trial and a free tier. No sign-in.
- [`price-and-package`](plugins/revenuedot/skills/price-and-package/SKILL.md): plans, durations, introductory offers and prices per store. No sign-in.
- [`store-setup-apple`](plugins/revenuedot/skills/store-setup-apple/SKILL.md): App Store Connect checklist for subscriptions. No sign-in.
- [`store-setup-google`](plugins/revenuedot/skills/store-setup-google/SKILL.md): Play Console checklist for subscriptions. No sign-in.
- [`wire-subscription-sdk`](plugins/revenuedot/skills/wire-subscription-sdk/SKILL.md): the app code on iOS, Android, React Native, Expo and Flutter with the RevenueDot SDK, plus the store-native option. No sign-in.
- [`paywall-design`](plugins/revenuedot/skills/paywall-design/SKILL.md): choose a paywall pattern and build the screen. No sign-in.
- [`entitlements-and-server`](plugins/revenuedot/skills/entitlements-and-server/SKILL.md): entitlement checks, webhooks, signature verification, idempotency. No sign-in.
- [`sandbox-testing`](plugins/revenuedot/skills/sandbox-testing/SKILL.md): test purchases without real money. No sign-in.
- [`add-subscriptions`](plugins/revenuedot/skills/add-subscriptions/SKILL.md): create the apps, products, entitlements and offerings with the connector's tools, then install the RevenueDot SDK and pass the app's key (RevenueDot account).
- [`migrate-from-revenuecat`](plugins/revenuedot/skills/migrate-from-revenuecat/SKILL.md): move an app that ships the RevenueCat SDK to RevenueDot without losing a subscriber. The app keeps its SDK and changes one line.
- [`support-playbook`](plugins/revenuedot/skills/support-playbook/SKILL.md): answer a subscription support ticket.
- [`weekly-revenue-check`](plugins/revenuedot/skills/weekly-revenue-check/SKILL.md): a five-line health and revenue report.
- [`self-host`](plugins/revenuedot/skills/self-host/SKILL.md): run RevenueDot yourself with Docker and Postgres.

## Use with your coding agent

Coding agents can read this repository on demand, so they use the right package, imports and API:

- **Context7:** https://context7.com/revenuedot/agent-skills
- **DeepWiki:** https://deepwiki.com/revenuedot/agent-skills
- **GitMCP:** https://gitmcp.io/revenuedot/agent-skills

## Repository layout

- `plugins/revenuedot/`: the plugin that people install. It holds the manifests, the MCP configs, the skills, the images, the `claude plugin eval` suite, the listing README and the licence.
- `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`: the Claude Code and Codex marketplaces, both pointing at `plugins/revenuedot`.
- `test/`, `scripts/` and `.github/`: our build checks and the ChatGPT upload packer. They are not part of the plugin.
- `submission/`: listing copy, test prompts and review notes for the ChatGPT and Claude directories, plus `openai-overlay.json` and `openai-README.md`, which freeze the ChatGPT ZIP at the listing in review.

Check everything with `node --test test/*.mjs`, `claude plugin validate plugins/revenuedot --strict` and `claude plugin validate . --strict`. Run the eval suite with `claude plugin eval plugins/revenuedot`. Build the ChatGPT ZIP with `scripts/pack-openai.sh`.

Licence: MIT.
