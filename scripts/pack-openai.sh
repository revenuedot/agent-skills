#!/usr/bin/env bash
# Builds the ZIP that is uploaded at https://platform.openai.com/plugins: plugin.json, mcp.json, skills/, README.md and icons only.
#   scripts/pack-openai.sh          writes dist/revenuedot-plugin.zip
#   scripts/pack-openai.sh --list   prints the files that would go in
set -euo pipefail
cd "$(dirname "$0")/.."
files=$(printf '%s\n' plugin.json mcp.json README.md assets/icon.png assets/logo.png; find skills -name SKILL.md | sort)
if [[ "${1:-}" == "--list" ]]; then echo "$files"; exit 0; fi
mkdir -p dist
rm -f dist/revenuedot-plugin.zip
# shellcheck disable=SC2086
zip -q dist/revenuedot-plugin.zip $files
unzip -l dist/revenuedot-plugin.zip
echo "dist/revenuedot-plugin.zip"
