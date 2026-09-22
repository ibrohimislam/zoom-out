// omp (oh-my-pi) extension entry, declared through package.json#omp.extensions.
//
// omp does not read Claude Code's hooks/hooks.json, so the SessionStart reflex
// is delivered here instead: one custom message per session, queued for the
// next user prompt (deliverAs: "nextTurn") rather than triggering a turn.
//
// Message text is shared with the Claude Code hook via ./reflex.txt.
import { readFileSync } from "node:fs";

const REFLEX = readFileSync(new URL("./reflex.txt", import.meta.url), "utf8").trim();

export default function zoomOutReflex(pi) {
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
