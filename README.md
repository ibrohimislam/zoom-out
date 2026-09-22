# zoom-out

A [Claude Code](https://claude.com/claude-code) skill that blocks narrow fixes.

A clean explanation that fits the symptom is not a verified explanation of the
full scope. `zoom-out` forces a **Hypothesis Ledger** before you declare any bug
fix, root-cause diagnosis, or plan complete — and one of those hypotheses is
always reserved for the non-local question:

> Is what I just touched the whole thing, or one expression of something bigger?

If the zoom-out hypothesis survives, its scope *is* the deliverable — not the
original narrow instance.

## Why

The failure mode is specific and common: you chase the reported symptom, find an
explanation that fits it, fix that one spot, and ship. Later it turns out the same
cause was repeated elsewhere, or the "cause" was one instance of a broader
pattern. The evidence was often already in earlier tool output — a grep, an
orientation dump, a design doc — just not acted on because it didn't look
relevant to the one spot being chased.

Description-based skill triggering alone is unreliable for this. Hence the skill
ships with a `SessionStart` hook that injects the reflex once per session, so the
check happens even when the skill never gets invoked.

## Install

### As a plugin (recommended — includes the hook)

```bash
claude plugin marketplace add ibrohimislam/zoom-out
claude plugin install zoom-out@zoom-out
```

Or from inside a session: `/plugin marketplace add ibrohimislam/zoom-out`, then
`/plugin install zoom-out@zoom-out`.

### As a bare skill (no hook)

Copy the skill directory:

```bash
mkdir -p ~/.claude/skills
cp -r skills/zoom-out ~/.claude/skills/
```

Or, for a single project, copy it to `.claude/skills/zoom-out/` in that repo.

### Other agents

`skills/zoom-out/SKILL.md` is plain Markdown with YAML frontmatter (`name`,
`description`) and no tool dependencies. Any agent that reads Markdown
instructions can use it, including via a rules file such as `AGENTS.md`.

## How it works

The skill defines a protocol, not a report:

- **Hypothesis Ledger** — at least three hypotheses (H1, H2, H3), each with
  mechanism, expected evidence, cheapest test, assumption load. One is always
  reserved for zoom-out, stated concretely rather than as an abstract "maybe
  there's more".
- **Anti-rationalization rule** — generate hypotheses before reaching a
  conclusion. Hypotheses that only wrap an answer already picked mean discard
  the frame and restart from decomposition.
- **Hypothesis tracking** — every later step must reference a hypothesis ID and
  update its status (proposed / tested / strengthened / weakened / eliminated /
  inconclusive / survived). A step that does none of these is noise.
- **Evidence rules** — eliminate only on a discriminating test or explicit
  contradiction, never on plausibility. Rank survivors by Occam's Razor, but
  evidence beats simplicity.
- **Convergence** — converge only after an attempted falsification. Covering
  less than the zoom-out hypothesis found requires saying so explicitly and why.
- **Proportionality** — one line per hypothesis is enough for a real fix; skip
  the ledger entirely for genuinely single-instance work.

## Layout

```
.claude-plugin/
  plugin.json         # plugin manifest (name, version, hooks path)
  marketplace.json    # lets this repo be added as a marketplace
hooks/
  hooks.json          # SessionStart -> the reflex injection
  zoom-out-session-start.js
skills/
  zoom-out/SKILL.md   # the skill itself
```

## License

MIT — see [LICENSE](LICENSE).