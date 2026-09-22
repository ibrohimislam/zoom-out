// Shared extension entry for pi (@earendil-works/pi-coding-agent) and omp
// (oh-my-pi), declared through package.json#pi.extensions and
// package.json#omp.extensions.
//
// Both harnesses do not read Claude Code's hooks/hooks.json, so the
// SessionStart reflex is delivered here instead: one custom message per
// session, queued for the next user prompt (deliverAs: "nextTurn") rather than
// triggering a turn.
//
// No host package is imported: the two harnesses publish the same ExtensionAPI
// shape under different package names (@earendil-works/pi-coding-agent vs
// @oh-my-pi/pi-coding-agent), and a harness-specific import would break the
// other one. ReflexHost below is the minimal structural contract this entry
// actually uses.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type ReflexHost = {
  on(event: "session_start", handler: () => Promise<void>): void;
  sendMessage(
    message: {
      customType: string;
      content: string;
      display: boolean;
      attribution: string;
    },
    options: { deliverAs: "nextTurn" }
  ): void;
};

// Module directory in both module systems: omp loads this as ESM via Bun,
// pi loads it through jiti, which may present it as CommonJS (__dirname).
const moduleDir =
  typeof __dirname === "string" ? __dirname : dirname(fileURLToPath(import.meta.url));

// Single source of truth, shared with the Claude Code hook.
const REFLEX = readFileSync(join(moduleDir, "reflex.txt"), "utf8").trim();

export default function zoomOutReflex(pi: ReflexHost): void {
  pi.on("session_start", async () => {
    pi.sendMessage(
      {
        customType: "zoom-out-reflex",
        content: REFLEX,
        display: false,
        attribution: "agent",
      },
      { deliverAs: "nextTurn" }
    );
  });
}