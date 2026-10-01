// Run with: node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const json = (p) => JSON.parse(read(p));
// The Claude plugin points at the same URL as the Claude directory connector, so people with both see one set of tools.
const MCP_URL = "https://mcp.revenuedot.app/claude/mcp";

test("ChatGPT and Codex manifest has the listing fields and existing assets", () => {
  const m = json("plugin.json");
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
  // ChatGPT gets the profile without refunds; Claude gets all tools.
  assert.equal(json("mcp.json").mcpServers.revenuedot.url, "https://mcp.revenuedot.app/chatgpt/mcp");
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
  assert.ok(real.size >= 38);
  const toolLike = /`((?:list|get|create|attach|grant|revoke|set|delete|extend|cancel|refund|archive|retry|send|verify|update)-[a-z-]+)`/g;
  for (const s of skills) {
    for (const m of read(`skills/${s}/SKILL.md`).matchAll(toolLike)) assert.ok(real.has(m[1]), `${s} names ${m[1]}, which is not a tool`);
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

test("no skill reads, exports or sends a secret key: RevenueDot steps go through the MCP tools", () => {
  const credVar = /\b[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PASSWORD|SIGNING_KEY|PRIVATE_KEY)\b/;
  for (const s of skills) {
    const lines = read(`skills/${s}/SKILL.md`).split("\n");
    lines.forEach((line, i) => {
      const where = `${s}/SKILL.md:${i + 1}`;
      assert.doesNotMatch(line, /Authorization: Bearer|-H ["']Authorization/i, `${where} sends a key in a header`);
      assert.doesNotMatch(line, /\$\{?[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PASSWORD)\b/, `${where} expands a secret variable`);
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
  const images = readdirSync(resolve(root, "assets")).map((f) => `assets/${f}`);
  for (const f of ["plugin.json", "mcp.json", "README.md", ...images, "skills/support-playbook/SKILL.md"]) assert.ok(out.includes(f), f);
  assert.ok(!out.some((f) => /\.app\.json|hooks|bin\//.test(f)));
});
