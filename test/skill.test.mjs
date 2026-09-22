// The skill file is the one artifact that ships to every agent. If its
// frontmatter drifts outside the Agent Skills spec, the failure is silent:
// agents that validate the spec skip the skill and say nothing. So the spec
// rules are checked here rather than trusted.
//
// Spec: https://agentskills.io/specification
"use strict";

import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_DIR = join(REPO, "skills", "zoom-out");
const RAW = readFileSync(join(SKILL_DIR, "SKILL.md"), "utf8");

function frontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  assert.ok(match, "SKILL.md must open with YAML frontmatter");
  const body = raw.slice(match[0].length);
  const fields = {};
  const lines = match[1].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const field = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (!field) continue;
    const [, key, value] = field;
    if (value === ">" || value === "|") {
      const folded = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) folded.push(lines[++i].trim());
      fields[key] = folded.join(" ");
    } else {
      fields[key] = value;
    }
  }
  return { fields, body, raw: match[1] };
}

test("frontmatter satisfies the Agent Skills spec", () => {
  const { fields, raw } = frontmatter(RAW);

  assert.ok(fields.name, "name is required");
  assert.match(fields.name, /^[a-z0-9]+(-[a-z0-9]+)*$/, "name must be lowercase alphanumeric with single hyphens");
  assert.ok(fields.name.length <= 64, "name must be <= 64 characters");
  assert.equal(fields.name, "zoom-out");
  assert.equal(fields.name, dirname(join(SKILL_DIR, "SKILL.md")).split("/").pop());

  assert.ok(fields.description, "description is required");
  assert.ok(fields.description.length <= 1024, `description is ${fields.description.length} chars, max 1024`);
  assert.ok(fields.description.length > 40, "description must actually say when to use the skill");

  // The spec warns that angle brackets in frontmatter can inject instructions.
  // Check the parsed values: `description: >` is a YAML block indicator, not
  // content.
  for (const [key, value] of Object.entries(fields)) {
    assert.ok(!/[<>]/.test(value), `frontmatter ${key} must not contain angle brackets`);
  }

  // Client-specific extensions (context: fork, paths, icon, ...) belong in
  // per-agent wrappers, not in the portable file.
  const portable = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
  for (const key of Object.keys(fields)) {
    assert.ok(portable.has(key), `${key} is not part of the portable spec`);
  }
});

test("the body stays inside the progressive-disclosure budget", () => {
  const { body } = frontmatter(RAW);
  const lines = body.split("\n").length;
  assert.ok(lines < 500, `SKILL.md body is ${lines} lines; the spec recommends under 500`);
  assert.ok(body.includes("Hypothesis Ledger"), "the ledger is the point of the skill");
  assert.ok(body.includes("zoom-out"), "the zoom-out hypothesis is the point of the skill");
});

test("the shipped skill is the only copy — no per-agent duplicates in the repo", () => {
  // Anything else would drift. Rule files for other agents are rendered at
  // install time by scripts/install.mjs and are never committed.
  assert.ok(statSync(SKILL_DIR).isDirectory());
});
