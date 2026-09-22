// Installer contract tests.
//
// The failure mode this guards is drift: the surface table is data, and a
// surface that stops being written (or starts clobbering user files) fails
// silently in a repo nobody runs. Assertions are derived from the registry the
// installer ships, so adding an agent automatically extends the test.
"use strict";

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { AGENTS, STANDARD } from "../scripts/install.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INSTALLER = join(REPO, "scripts", "install.mjs");
const SKILL_MD = readFileSync(join(REPO, "skills", "zoom-out", "SKILL.md"), "utf8");

function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), "zoom-out-test-"));
  return { home: join(dir, "home"), root: join(dir, "project"), dir };
}

function globFiles(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name))
    .sort();
}

function run(home, root, ...args) {
  return execFileSync(process.execPath, [INSTALLER, "--home", home, "--root", root, ...args], {
    encoding: "utf8",
  });
}

function surfaces(agent) {
  const out = [];
  for (const scope of ["user", "project"]) {
    for (const raw of agent.skills?.[scope] ?? []) out.push({ kind: "skill", scope, raw });
    for (const rule of (agent.rules ?? []).filter((r) => r.scope === scope)) {
      out.push({ kind: "rule", scope, raw: rule.path, rule });
    }
  }
  return out;
}

function expand(raw, { home, root, scope }) {
  return raw.startsWith("~/") ? join(home, raw.slice(2)) : join(root, raw);
}

test("every registry entry declares at least one surface or a shipped injection", () => {
  for (const agent of [...AGENTS, STANDARD]) {
    const hasSurface = surfaces(agent).length > 0;
    assert.ok(hasSurface || agent.injection, `${agent.id} declares nothing to install`);
    assert.ok(agent.sources?.length, `${agent.id} cites no source`);
  }
});

test("install writes every declared surface, with the real skill content", () => {
  const { home, root, dir } = sandbox();
  try {
    run(home, root, "--agents", "all", "--scope", "all");
    for (const agent of [...AGENTS, STANDARD]) {
      for (const surface of surfaces(agent)) {
        const dest = join(expand(surface.raw, { home, root, scope: surface.scope }), ...(surface.kind === "skill" ? ["zoom-out", "SKILL.md"] : []));
        assert.ok(existsSync(dest), `${agent.id}: ${surface.kind} not written at ${dest}`);
        if (surface.kind === "skill") {
          assert.equal(readFileSync(dest, "utf8"), SKILL_MD, `${agent.id}: skill content differs`);
        } else {
          assert.match(readFileSync(dest, "utf8"), /Zoom-out reflex/, `${agent.id}: rule has no reflex`);
        }
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("installing twice changes nothing", () => {
  const { home, root, dir } = sandbox();
  try {
    run(home, root, "--agents", "all");
    const before = readFileSync(join(root, "AGENTS.md"), "utf8");
    const beforeRule = readFileSync(join(root, ".cursor/rules/zoom-out.mdc"), "utf8");
    run(home, root, "--agents", "all");
    assert.equal(readFileSync(join(root, "AGENTS.md"), "utf8"), before);
    assert.equal(readFileSync(join(root, ".cursor/rules/zoom-out.mdc"), "utf8"), beforeRule);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("existing AGENTS.md content survives, and uninstall restores it", () => {
  const { home, root, dir } = sandbox();
  try {
    mkdirSync(root, { recursive: true });
    const original = "# House rules\n\n- Run `pnpm test` before committing.\n";
    writeFileSync(join(root, "AGENTS.md"), original);

    run(home, root, "--agents", "all");
    const installed = readFileSync(join(root, "AGENTS.md"), "utf8");
    assert.ok(installed.includes("Run `pnpm test` before committing."), "user content lost");
    assert.match(installed, /zoom-out:begin/);

    run(home, root, "--agents", "all", "--uninstall");
    assert.equal(readFileSync(join(root, "AGENTS.md"), "utf8").trim(), original.trim());
    assert.ok(!existsSync(join(root, ".agents/skills/zoom-out")), "skill dir left behind");
    assert.ok(!existsSync(join(root, ".cursor/rules/zoom-out.mdc")), "generated rule left behind");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a hand-written rule file is never clobbered", () => {
  const { home, root, dir } = sandbox();
  try {
    const target = join(root, ".cursor/rules/zoom-out.mdc");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, "---\ndescription: mine\nalwaysApply: true\n---\n\nMine.\n");

    const output = run(home, root, "--agents", "cursor");
    assert.match(output, /SKIP/, "installer should report the skip");
    assert.equal(readFileSync(target, "utf8"), "---\ndescription: mine\nalwaysApply: true\n---\n\nMine.\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the portable plugin manifest satisfies the Agent Plugins schema", () => {
  // Codex and Cursor both read this file; an unknown key or a bad name makes
  // the package invalid, and the failure surfaces only at install time.
  const manifest = JSON.parse(readFileSync(join(REPO, "plugin.json"), "utf8"));
  assert.equal(
    manifest.$schema,
    "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
  );
  assert.match(manifest.name, /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/);
  assert.ok(manifest.name.length <= 64);

  const allowed = new Set([
    "$schema",
    "name",
    "version",
    "description",
    "author",
    "homepage",
    "repository",
    "license",
    "keywords",
    "extensions",
  ]);
  for (const key of Object.keys(manifest)) {
    assert.ok(allowed.has(key), `${key} is not in the Agent Plugins schema`);
  }
  for (const key of Object.keys(manifest.author ?? {})) {
    assert.ok(["name", "email", "url"].includes(key), `author.${key} is not in the schema`);
  }

  // The portable format discovers skills from the root skills/ directory, and
  // the version must not drift from the other manifests.
  assert.ok(existsSync(join(REPO, "skills", "zoom-out", "SKILL.md")));
  const pkg = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8"));
  const claude = JSON.parse(readFileSync(join(REPO, ".claude-plugin", "plugin.json"), "utf8"));
  assert.equal(manifest.version, pkg.version);
  assert.equal(claude.version, pkg.version);
});

test("the compatibility doc matrix matches the registry", () => {
  // The table is the maintainer-facing inventory of the same data the installer
  // acts on; letting them drift is how docs start lying.
  const doc = readFileSync(join(REPO, "docs", "compatibility.md"), "utf8");
  const block = /<!-- matrix:begin[^>]*-->\n([\s\S]*?)\n<!-- matrix:end -->/.exec(doc);
  assert.ok(block, "docs/compatibility.md must carry the generated matrix block");
  const expected = execFileSync(process.execPath, [INSTALLER, "--matrix"], {
    encoding: "utf8",
  }).trim();
  assert.equal(block[1].trim(), expected);
});

test("uninstalling everything leaves no files behind", () => {
  const { home, root, dir } = sandbox();
  try {
    run(home, root, "--agents", "all", "--scope", "all");
    run(home, root, "--agents", "all", "--scope", "all", "--uninstall");
    assert.deepEqual(globFiles(dir), [], "installer left files in the sandbox");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the skill is written only where the selected agents read it", () => {
  const { home, root, dir } = sandbox();
  try {
    run(home, root, "--agents", "cursor", "--scope", "user");
    assert.ok(existsSync(join(home, ".cursor/skills/zoom-out/SKILL.md")));
    assert.ok(!existsSync(join(home, ".claude/skills/zoom-out")), "unselected agent written");
    assert.ok(!existsSync(join(root, "AGENTS.md")), "project scope written for a user-scope run");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
