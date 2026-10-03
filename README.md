<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/revenuedot/revenuedot/main/brand/kit/wordmark/revenuedot-lockup-white.svg">
  <img alt="RevenueDot" src="https://raw.githubusercontent.com/revenuedot/revenuedot/main/brand/kit/wordmark/revenuedot-lockup-black.svg" height="44">
</picture>

# RevenueDot plugin and agent skills

**The RevenueDot plugin for Claude, ChatGPT and Codex, and skills for Claude Code, Codex and Cursor: add subscriptions and a paywall to an app, migrate from RevenueCat without losing a subscriber, self-host, answer support tickets, and a weekly revenue check.**

[Main repository](https://github.com/revenuedot/revenuedot) · [MCP server](https://github.com/revenuedot/mcp) · [Docs](https://revenuedot.app/docs/guides/connect-ai-assistants) · [Start free on RevenueDot Cloud](https://app.revenuedot.app/signup)

[![License: MIT](https://img.shields.io/badge/license-MIT-0A0A0A)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-5-0A0A0A)](#skills)

</div>

This repository holds the RevenueDot plugin for Claude, ChatGPT and Codex. It connects an assistant to your RevenueDot project, an open-source backend for in-app subscriptions, and teaches it five workflows. The plugin itself is the folder [`plugins/revenuedot`](plugins/revenuedot); its [README](plugins/revenuedot/README.md) lists what it connects to, runs and sends.

## Install

| Where | Install |
|---|---|
| Claude Code or Claude Desktop | `/plugin marketplace add revenuedot/agent-skills`, then `/plugin install revenuedot@revenuedot` |
| Claude connector directory | Search RevenueDot in the connector directory, or add `https://mcp.revenuedot.app/claude/mcp` as a custom connector |
| ChatGPT | Search RevenueDot in the plugin directory, or add `https://mcp.revenuedot.app/chatgpt/mcp` as a connector in developer mode |
| Codex | `codex plugin marketplace add revenuedot/agent-skills`, then install `revenuedot` |
| Skills only, any agent | `npx skills add revenuedot/agent-skills` |

## Skills

- [`add-subscriptions`](plugins/revenuedot/skills/add-subscriptions/SKILL.md): add subscriptions and a paywall to an iOS, Android, React Native or Flutter app.
- [`migrate-from-revenuecat`](plugins/revenuedot/skills/migrate-from-revenuecat/SKILL.md): move an app from RevenueCat to RevenueDot without losing a subscriber.
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
- `submission/`: listing copy, test prompts and review notes for the ChatGPT and Claude directories.

Check everything with `node --test test/*.mjs`, `claude plugin validate plugins/revenuedot --strict` and `claude plugin validate . --strict`. Run the eval suite with `claude plugin eval plugins/revenuedot`. Build the ChatGPT ZIP with `scripts/pack-openai.sh`.

Licence: MIT.
