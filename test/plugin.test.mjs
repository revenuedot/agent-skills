// Run with: node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const json = (p) => JSON.parse(read(p));
const MCP_URL = "https://mcp.revenuedot.app/mcp";

test("ChatGPT and Codex manifest has the listing fields and existing assets", () => {
  const m = json("plugin.json");
  assert.match(m.name, /^[a-z0-9-]+$/);
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  for (const k of ["description", "author", "homepage", "repository", "license", "keywords"]) assert.ok(m[k], k);
  const ui = m.extensions["com.openai"].interface;
  for (const k of ["displayName", "shortDescription", "longDescription", "developerName", "category", "websiteURL", "privacyPolicyURL", "termsOfServiceURL", "defaultPrompt", "brandColor", "composerIcon", "logo"]) assert.ok(ui[k], k);
  assert.ok(ui.shortDescription.length <= 80);
  assert.equal(ui.defaultPrompt.length, 3);
  for (const k of ["composerIcon", "logo"]) assert.ok(existsSync(resolve(root, ui[k])), `${k} exists`);
  assert.match(ui.privacyPolicyURL, /^https:\/\/revenuedot\.app\/legal\/privacy$/);
});

test("the legacy .codex-plugin copy equals the root manifest", () => {
  assert.deepEqual(json(".codex-plugin/plugin.json"), json("plugin.json"));
});

test("the Claude manifest agrees with the root manifest", () => {
  const a = json(".claude-plugin/plugin.json"), b = json("plugin.json");
  for (const k of ["name", "version", "homepage", "repository", "license", "keywords"]) assert.deepEqual(a[k], b[k], k);
});

test("both MCP configs point at the hosted server over HTTPS", () => {
  assert.equal(json(".mcp.json").mcpServers.revenuedot.url, MCP_URL);
  assert.equal(json("mcp.json").mcpServers.revenuedot.url, MCP_URL);
  assert.equal(json(".mcp.json").mcpServers.revenuedot.type, "http");
  assert.equal(json("mcp.json").mcpServers.revenuedot.type, "streamable-http");
});

test("marketplaces list the plugin at the repo root", () => {
  const c = json(".claude-plugin/marketplace.json");
  assert.equal(c.plugins[0].name, "revenuedot");
  assert.equal(c.plugins[0].source, "./");
  const o = json(".agents/plugins/marketplace.json");
  assert.equal(o.plugins[0].name, "revenuedot");
  assert.equal(o.plugins[0].source.path, "./");
});

const skills = readdirSync(resolve(root, "skills"));
test("every skill has front matter whose name is its folder, a 'Use this skill when' description, a licence and a README row", () => {
  assert.ok(skills.length >= 5);
  const readme = read("README.md");
  for (const s of skills) {
    const text = read(`skills/${s}/SKILL.md`);
    const fm = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
    assert.equal(/^name: (.+)$/m.exec(fm)?.[1], s, `${s} name`);
    assert.match(/^description: (.+)$/m.exec(fm)?.[1] ?? "", /^Use this skill when/, `${s} description`);
    assert.match(fm, /^license: MIT$/m, `${s} license`);
    // A colon followed by a space inside an unquoted value breaks YAML, and the skill then loads with no metadata.
    assert.ok(!/^description: .*: /m.test(fm), `${s} description contains ": "`);
    assert.ok(readme.includes(`skills/${s}/SKILL.md`), `${s} is in the README`);
  }
});

test("every MCP tool a skill names exists in revenuedot/mcp", () => {
  const src = resolve(root, "../mcp/src/tools.ts");
  if (!existsSync(src)) return; // the mcp repo is not checked out next to this one
  const real = new Set([...readFileSync(src, "utf8").matchAll(/name: "([a-z]+(?:-[a-z]+)+)"/g)].map((m) => m[1]));
  assert.ok(real.size >= 34);
  const toolLike = /`((?:list|get|create|attach|grant|revoke|set|delete|extend|cancel|refund|archive|retry|send|verify)-[a-z-]+)`/g;
  for (const s of skills) {
    for (const m of read(`skills/${s}/SKILL.md`).matchAll(toolLike)) assert.ok(real.has(m[1]), `${s} names ${m[1]}, which is not a tool`);
  }
});
