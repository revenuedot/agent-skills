// Run with: node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
// The plugin people install is this folder; everything else in the repository (tests, scripts, submission notes) is ours.
const PLUGIN = "plugins/revenuedot";
const pluginDir = resolve(root, PLUGIN);
const read = (p) => readFileSync(resolve(root, p), "utf8");
const json = (p) => JSON.parse(read(p));
const pread = (p) => read(`${PLUGIN}/${p}`);
const pjson = (p) => json(`${PLUGIN}/${p}`);
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = resolve(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pluginFiles = walk(pluginDir).map((f) => relative(pluginDir, f));
const IMAGE = /\.(png|jpe?g|gif|webp|svg|ico|bmp|avif|ttf|otf|woff2?)\b/i;
// The Claude plugin points at the same URL as the Claude directory connector, so people with both see one set of tools.
const MCP_URL = "https://mcp.revenuedot.app/claude/mcp";

test("ChatGPT and Codex manifest has the listing fields and existing assets", () => {
  const m = pjson("plugin.json");
  assert.match(m.name, /^[a-z0-9-]+$/);
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  for (const k of ["description", "author", "homepage", "repository", "license", "keywords"]) assert.ok(m[k], k);
  const ui = m.extensions["com.openai"].interface;
  for (const k of ["displayName", "shortDescription", "longDescription", "developerName", "category", "websiteURL", "privacyPolicyURL", "termsOfServiceURL", "supportURL", "defaultPrompt", "brandColor", "composerIcon", "logo"]) assert.ok(ui[k], k);
  // OpenAI: display name and subtitle at most 30 characters; no pricing, free, trial, discount or comparison words in listing copy.
  assert.ok(ui.displayName.length <= 30 && ui.shortDescription.length <= 30, "name and subtitle at most 30 characters");
  const copy = [m.description, ui.displayName, ui.shortDescription, ui.longDescription, ...ui.defaultPrompt].join(" ");
  assert.doesNotMatch(copy, /\b(free|trial|pricing|price|discount|cheaper|better than|alternative|revenuecat|vs\.?)\b/i);
  assert.equal(ui.defaultPrompt.length, 3);
  // OpenAI rejects a brand colour with less than 2:1 contrast against white.
  const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  assert.ok(1.05 / (lum(ui.brandColor) + 0.05) >= 2, `brand colour ${ui.brandColor} needs 2:1 contrast on white`);
  for (const k of ["composerIcon", "logo"]) assert.ok(existsSync(resolve(pluginDir, ui[k])), `${k} exists`);
  assert.match(ui.privacyPolicyURL, /^https:\/\/revenuedot\.app\/legal\/privacy$/);
});

test("the legacy .codex-plugin copy equals the plugin's plugin.json", () => {
  assert.deepEqual(pjson(".codex-plugin/plugin.json"), pjson("plugin.json"));
});

test("the Claude manifest agrees with the plugin's plugin.json", () => {
  const a = pjson(".claude-plugin/plugin.json"), b = pjson("plugin.json");
  for (const k of ["name", "version", "homepage", "repository", "license", "keywords"]) assert.deepEqual(a[k], b[k], k);
});

test("both MCP configs point at the hosted server over HTTPS", () => {
  assert.equal(pjson(".mcp.json").mcpServers.revenuedot.url, MCP_URL);
  // ChatGPT gets the profile without refunds; Claude gets all tools.
  assert.equal(pjson("mcp.json").mcpServers.revenuedot.url, "https://mcp.revenuedot.app/chatgpt/mcp");
  assert.equal(pjson(".mcp.json").mcpServers.revenuedot.type, "http");
  assert.equal(pjson("mcp.json").mcpServers.revenuedot.type, "streamable-http");
});

test("marketplaces list the plugin in plugins/revenuedot", () => {
  const c = json(".claude-plugin/marketplace.json");
  assert.equal(c.plugins[0].name, "revenuedot");
  assert.equal(c.plugins[0].source, `./${PLUGIN}`);
  const o = json(".agents/plugins/marketplace.json");
  assert.equal(o.plugins[0].name, "revenuedot");
  assert.deepEqual(o.plugins[0].source, { source: "local", path: `./${PLUGIN}` });
  assert.ok(existsSync(resolve(pluginDir, ".claude-plugin/plugin.json")));
  // The repository root is a marketplace, not a plugin: a second manifest there would make two plugins.
  for (const f of [".claude-plugin/plugin.json", ".codex-plugin/plugin.json", "plugin.json", ".mcp.json", "mcp.json", "skills"]) assert.ok(!existsSync(resolve(root, f)), `${f} at the repo root`);
});

test("the plugin folder holds only plugin files: no tests, scripts or code", () => {
  for (const f of pluginFiles) {
    assert.doesNotMatch(f, /(^|\/)(test|tests|scripts|bin|hooks|node_modules)\//, f);
    assert.doesNotMatch(f, /\.(sh|bash|zsh|mjs|cjs|js|ts|py|rb|exe|zip)$|\.test\./, f);
    assert.doesNotMatch(f, /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini|package\.json|package-lock\.json|\.npmrc)$/, f);
  }
  assert.ok(pluginFiles.length <= 512, "512 files or fewer");
  for (const f of ["README.md", "LICENSE", ".claude-plugin/plugin.json"]) assert.ok(pluginFiles.includes(f), f);
});

test("nothing in the plugin names an image file except the README's Markdown images and the manifests' icon fields", () => {
  for (const f of pluginFiles.filter((f) => !IMAGE.test(f))) {
    read(`${PLUGIN}/${f}`).split("\n").forEach((line, i) => {
      let rest = line;
      if (f === "README.md") rest = rest.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
      if (/^(\.codex-plugin\/)?plugin\.json$/.test(f)) rest = rest.replace(/^\s*"(composerIcon|logo)": "\.\/assets\/[a-z]+\.png",?$/, "");
      assert.doesNotMatch(rest, IMAGE, `${f}:${i + 1} names an image file`);
    });
  }
});

test("the plugin README is the listing: at least 40 words outside code blocks, and it discloses the server, the commands and the data", () => {
  const readme = pread("README.md");
  const words = readme.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean);
  assert.ok(words.length >= 40, `${words.length} words`);
  for (const s of ["https://mcp.revenuedot.app/claude/mcp", "https://api.revenuedot.app", "OAuth", "pinned", "Privacy policy"]) assert.ok(readme.includes(s), s);
  assert.doesNotMatch(readme, /`(scripts|test)\/`/, "the plugin README describes the repository");
});

const skills = readdirSync(resolve(pluginDir, "skills"));
test("every skill has front matter whose name is its folder, a 'Use this skill when' description, a licence and a README row", () => {
  assert.ok(skills.length >= 5);
  const readme = pread("README.md");
  const rootReadme = read("README.md");
  for (const s of skills) {
    const text = pread(`skills/${s}/SKILL.md`);
    const fm = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
    assert.equal(/^name: (.+)$/m.exec(fm)?.[1], s, `${s} name`);
    assert.match(/^description: (.+)$/m.exec(fm)?.[1] ?? "", /^Use this skill when/, `${s} description`);
    assert.match(fm, /^license: MIT$/m, `${s} license`);
    // A colon followed by a space inside an unquoted value breaks YAML, and the skill then loads with no metadata.
    assert.ok(!/^description: .*: /m.test(fm), `${s} description contains ": "`);
    assert.ok(readme.includes(`(skills/${s}/SKILL.md)`), `${s} is in the plugin README`);
    assert.ok(rootReadme.includes(`(${PLUGIN}/skills/${s}/SKILL.md)`), `${s} is in the root README`);
  }
});

test("every MCP tool a skill names exists in revenuedot/mcp", () => {
  const src = resolve(root, "../mcp/src/tools.ts");
  if (!existsSync(src)) return; // the mcp repo is not checked out next to this one
  const real = new Set([...readFileSync(src, "utf8").matchAll(/name: "([a-z]+(?:-[a-z]+)+)"/g)].map((m) => m[1]));
  assert.ok(real.size >= 38);
  const toolLike = /`((?:list|get|create|attach|grant|revoke|set|delete|extend|cancel|refund|archive|retry|send|verify|update)-[a-z-]+)`/g;
  for (const s of skills) {
    for (const m of pread(`skills/${s}/SKILL.md`).matchAll(toolLike)) assert.ok(real.has(m[1]), `${s} names ${m[1]}, which is not a tool`);
  }
});

test("every tool has an annotation justification, and none is left over", () => {
  const src = resolve(root, "../mcp/src/tools.ts");
  if (!existsSync(src)) return;
  const real = [...readFileSync(src, "utf8").matchAll(/name: "([a-z]+(?:-[a-z]+)+)"/g)].map((m) => m[1]);
  const doc = read("submission/annotation-justifications.md");
  const documented = [...doc.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]);
  assert.deepEqual([...documented].sort(), [...real].sort());
});

test("no skill or other plugin text reads, exports or sends a secret key: RevenueDot steps go through the MCP tools", () => {
  const credVar = /\b[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PASSWORD|SIGNING_KEY|PRIVATE_KEY)\b/;
  for (const f of pluginFiles.filter((f) => /\.(md|json)$/.test(f))) {
    const lines = pread(f).split("\n");
    lines.forEach((line, i) => {
      const where = `${f}:${i + 1}`;
      assert.doesNotMatch(line, /Authorization: Bearer|-H ["']Authorization/i, `${where} sends a key in a header`);
      assert.doesNotMatch(line, /\$\{?[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PASSWORD|SIGNING_KEY|PRIVATE_KEY)\b/, `${where} expands a secret variable`);
      assert.doesNotMatch(line, /\bprintenv\b|\benv\s*\||export -p/, `${where} dumps the environment`);
      assert.doesNotMatch(line, /\bsk_[A-Za-z0-9]{6,}/, `${where} holds a secret key`);
      assert.doesNotMatch(line, /(export|-e)\s+[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PASSWORD)=/, `${where} puts a secret in a variable`);
      if (credVar.test(line)) assert.doesNotMatch(line, /https?:\/\//, `${where} puts a credential-named variable beside a URL`);
    });
  }
});

test("the upload ZIP holds only what OpenAI accepts", () => {
  const out = execFileSync("bash", [resolve(root, "scripts/pack-openai.sh"), "--list"], { encoding: "utf8" }).trim().split("\n");
  for (const f of out) assert.match(f, /^(plugin\.json|mcp\.json|README\.md|assets\/[^/]+\.png|skills\/[a-z-]+\/SKILL\.md)$/, f);
  // Images by folder, not by name (the Claude directory holds plugins whose code names image files).
  const images = readdirSync(resolve(pluginDir, "assets")).map((f) => `assets/${f}`);
  const kept = ["add-subscriptions", "support-playbook", "weekly-revenue-check"].map((s) => `skills/${s}/SKILL.md`);
  for (const f of ["plugin.json", "mcp.json", "README.md", ...images, ...kept]) assert.ok(out.includes(f), f);
  assert.ok(!out.some((f) => /\.app\.json|hooks|bin\/|^evals\/|\/migrate-from-revenuecat\/|\/self-host\//.test(f)), "terminal skills and evals stay out");
});
