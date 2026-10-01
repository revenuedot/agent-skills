#!/usr/bin/env bash
# Builds the ZIP that is uploaded at https://platform.openai.com/plugins: plugin.json, mcp.json, skills/, README.md and icons only.
#   scripts/pack-openai.sh          writes dist/revenuedot-plugin.zip
#   scripts/pack-openai.sh --list   prints the files that would go in
set -euo pipefail
cd "$(dirname "$0")/.."
# Images are listed by folder, not by name: the Claude directory holds a plugin whose scripts name its image files.
files=$(printf '%s\n' plugin.json mcp.json README.md; find assets -type f | sort; find skills -name SKILL.md | sort)
if [[ "${1:-}" == "--list" ]]; then echo "$files"; exit 0; fi
mkdir -p dist
rm -f dist/revenuedot-plugin.zip
# shellcheck disable=SC2086
zip -q dist/revenuedot-plugin.zip $files
unzip -l dist/revenuedot-plugin.zip
echo "dist/revenuedot-plugin.zip"
