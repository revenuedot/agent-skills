#!/usr/bin/env bash
# Builds the ZIP that is uploaded at https://platform.openai.com/plugins from the plugin folder, plugins/revenuedot:
# plugin.json, mcp.json, README.md, the images and the skills, all at the ZIP root.
#   scripts/pack-openai.sh          writes dist/revenuedot-plugin.zip
#   scripts/pack-openai.sh --list   prints the files that would go in
set -euo pipefail
repo="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo/plugins/revenuedot"
# Left out of the ZIP:
# - the two terminal skills (migration and self-hosting): they have the developer run npm packages, which OpenAI's review
#   flags as code outside the package; ChatGPT cannot run them anyway, and Codex gets them from this repository.
# - the eight monetization skills (plan-monetization ... wire-subscription-sdk): they compare plans and stores and talk about
#   prices, which OpenAI's listing rules ban. The ChatGPT listing in review has the five account skills only.
# evals/ is the claude plugin eval suite and stays out. Images are listed by folder, not by name.
# The ZIP's plugin.json is the plugin's, with the fields of submission/openai-overlay.json merged over it (see its _note).
# README.md is submission/openai-README.md, the README of the listing in review (the plugin's own README now describes the free layer too).
# mcp.json is submission/openai-mcp.json: ChatGPT keeps its one account server, https://mcp.revenuedot.app/chatgpt/mcp, with no second server (the plugin's own mcp.json, read by Codex, adds the free knowledge server).
SKIP='/(migrate-from-revenuecat|self-host|plan-monetization|price-and-package|store-setup-apple|store-setup-google|wire-subscription-sdk|paywall-design|entitlements-and-server|sandbox-testing)/'
files=$(printf '%s\n' plugin.json mcp.json README.md; find assets -type f | sort; find skills -name SKILL.md | grep -Ev "$SKIP" | sort)
if [[ "${1:-}" == "--list" ]]; then echo "$files"; exit 0; fi
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
# shellcheck disable=SC2086
tar cf - $files | tar xf - -C "$stage"
node -e '
const fs = require("fs");
const [manifest, overlay] = process.argv.slice(1).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const { _note, interface: ui, ...top } = overlay;
const out = { ...manifest, ...top };
out.extensions = { ...manifest.extensions, "com.openai": { ...manifest.extensions["com.openai"], interface: { ...manifest.extensions["com.openai"].interface, ...ui } } };
fs.writeFileSync(process.argv[1], JSON.stringify(out, null, 2) + "\n");
' "$stage/plugin.json" "$repo/submission/openai-overlay.json"
cp "$repo/submission/openai-README.md" "$stage/README.md"
cp "$repo/submission/openai-mcp.json" "$stage/mcp.json"
mkdir -p "$repo/dist"
rm -f "$repo/dist/revenuedot-plugin.zip"
(cd "$stage" && zip -q -X "$repo/dist/revenuedot-plugin.zip" $files)
unzip -l "$repo/dist/revenuedot-plugin.zip"
echo "dist/revenuedot-plugin.zip"
