// Shared extension entry for pi (@earendil-works/pi-coding-agent) and omp
// (oh-my-pi), declared through package.json#pi.extensions and
// package.json#omp.extensions.
//
// Neither harness reads Claude Code's hooks/hooks.json, so the SessionStart
// reflex is delivered here instead: the reflex is returned from
// `before_agent_start`, which is synchronous with the prompt that triggers it
// and injects a persistent custom message for the LLM.
//
// Deliberately NOT `pi.sendMessage(..., { deliverAs: "nextTurn" })` from
// `session_start`: that queues the reflex for the *next* prompt, and in
// non-interactive runs (`pi -p "..."`) the first prompt is already submitted by
// the time the handler runs, so the reflex lands on a prompt that never comes.
// Measured flaky there; `before_agent_start` is not.
//
// No host package is imported: pi and omp publish the same ExtensionAPI shape
// under different package names (@earendil-works/pi-coding-agent vs
// @oh-my-pi/pi-coding-agent), and importing either one would break the other.
// The types below are the minimal structural contract this entry uses.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CUSTOM_TYPE = "zoom-out-reflex";

type ReflexContext = {
  sessionManager?: { getBranch?: () => Array<{ customType?: string }> };
};

type ReflexHost = {
  on(
    event: "before_agent_start",
    handler: (
      event: unknown,
      ctx: ReflexContext
    ) => Promise<
      | {
          message: {
            customType: string;
            content: string;
            display: boolean;
            attribution: string;
          };
        }
      | undefined
    >
  ): void;
};

// Module directory in both module systems: omp loads this as ESM via Bun,
// pi loads it through jiti, which may present it as CommonJS (__dirname).
const moduleDir =
  typeof __dirname === "string" ? __dirname : dirname(fileURLToPath(import.meta.url));

// Single source of truth, shared with the Claude Code hook.
const REFLEX = readFileSync(join(moduleDir, "reflex.txt"), "utf8").trim();

export default function zoomOutReflex(pi: ReflexHost): void {
  pi.on("before_agent_start", async (_event, ctx) => {
    // Once per session. The transcript is the state, so this survives handler
    // re-entry, session rebinding, and resumes without module-level bookkeeping.
    const branch = ctx?.sessionManager?.getBranch?.();
    if (Array.isArray(branch) && branch.some((entry) => entry?.customType === CUSTOM_TYPE)) {
      return undefined;
    }
    return {
      message: {
        customType: CUSTOM_TYPE,
        content: REFLEX,
        display: false,
        attribution: "agent",
      },
    };
  });
}