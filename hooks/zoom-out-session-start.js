#!/usr/bin/env node
// SessionStart hook: injects the zoom-out reflex once per session, so the
// discipline does not depend on description-based skill triggering alone
// (measured ~30-50% reliable by itself).
//
// Contract: read the hook JSON on stdin, write one JSON object to stdout with
// `hookSpecificOutput.additionalContext`, exit 0. A per-session marker file in
// tmpdir keeps it to a single injection per session.
//
// The message text lives in ./reflex.txt (shared with the omp extension entry).
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function sessionId(raw) {
  try {
    const id = JSON.parse(raw)?.session_id;
    if (typeof id === "string" && id) return id;
  } catch {
    /* not JSON, fall through */
  }
  return `ppid${process.ppid}`;
}

const MESSAGE = fs.readFileSync(path.join(__dirname, "reflex.txt"), "utf8").trim();

// Keep the marker name filesystem-safe; session ids come from hook input.
const id = sessionId(readStdin()).replace(/[^A-Za-z0-9_-]/g, "_");
const marker = path.join(os.tmpdir(), `zoom-out-nudge.${id}.session-start`);

try {
  if (fs.existsSync(marker)) process.exit(0);
  fs.writeFileSync(marker, "");
} catch {
  // Unwritable tmpdir: nudge twice rather than never.
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: MESSAGE },
  }) + "\n"
);
