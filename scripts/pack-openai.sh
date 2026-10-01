#!/usr/bin/env bash
# Builds the ZIP that is uploaded at https://platform.openai.com/plugins from the plugin folder, plugins/revenuedot:
# plugin.json, mcp.json, README.md, the images and the skills, all at the ZIP root.
#   scripts/pack-openai.sh          writes dist/revenuedot-plugin.zip
#   scripts/pack-openai.sh --list   prints the files that would go in
set -euo pipefail
repo="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo/plugins/revenuedot"
# The two terminal skills (migration and self-hosting) have the developer run npm packages, which OpenAI's review
# flags as code outside the package; ChatGPT cannot run them anyway, and Codex gets them from this repository.
# evals/ is the claude plugin eval suite and stays out. Images are listed by folder, not by name.
files=$(printf '%s\n' plugin.json mcp.json README.md; find assets -type f | sort; find skills -name SKILL.md | grep -v -e '/migrate-from-revenuecat/' -e '/self-host/' | sort)
if [[ "${1:-}" == "--list" ]]; then echo "$files"; exit 0; fi
mkdir -p "$repo/dist"
rm -f "$repo/dist/revenuedot-plugin.zip"
# shellcheck disable=SC2086
zip -q "$repo/dist/revenuedot-plugin.zip" $files
unzip -l "$repo/dist/revenuedot-plugin.zip"
echo "dist/revenuedot-plugin.zip"
