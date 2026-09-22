#!/usr/bin/env node
// SessionStart hook: injects the zoom-out reflex once per session, so the
// discipline does not depend on description-based skill triggering alone
// (measured ~30-50% reliable by itself).
//
// Contract: read the hook JSON on stdin, write one JSON object to stdout with
// `hookSpecificOutput.additionalContext`, exit 0. A per-session marker file in
// tmpdir keeps it to a single injection per session.
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

const MESSAGE =
  "Zoom-out reflex (see the zoom-out skill for the full protocol): before " +
  "calling a bug fix, root-cause diagnosis, or plan complete, ask once - is " +
  "what I just touched the whole thing, or one expression of something " +
  'bigger? Check what earlier tool output already said before searching ' +
  'again. If the answer is "something bigger", its scope is the deliverable, ' +
  "not the original narrow instance.";

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
