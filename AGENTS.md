# AGENTS.md

Agent skills for RevenueDot, installable with `npx skills add revenuedot/agent-skills`. Each skill is `skills/<name>/SKILL.md` with YAML frontmatter: `name` (equal to the folder name), `description` (one or two sentences starting "Use this skill when ..."), and `license: MIT`. List every skill in `README.md`.

Every command, flag, environment variable, URL path and code line in a skill must match the current code in `revenuedot/revenuedot` (server, importer), `revenuedot/examples` and `revenuedot/mcp`. Check it against the source or a running server before merging, and remove anything that does not exist. Record decisions in files and commit them. Private material goes to `revenuedot/company`, never here.
