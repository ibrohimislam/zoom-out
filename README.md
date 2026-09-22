# zoom-out

A [Claude Code](https://claude.com/claude-code) skill that blocks narrow fixes.

A clean explanation that fits the symptom is not a verified explanation of the
full scope. `zoom-out` forces a **Hypothesis Ledger** before you declare any bug
fix, root-cause diagnosis, or plan complete — climbing from instance to class to
system with 5 Whys under evidence gates, and an SNR rule that keeps speculation
out of the ledger. One hypothesis is always reserved for the non-local question:

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

- **Zoom-out sequence** — move through Instance (what was observed) → Class (what
  larger class, identified by which recurrence signature) → System (what
  structure, process, constraint, incentive, missing guardrail, or feedback loop
  produces that class). No jump to system-level abstraction without a concrete
  class-level recurrence signature.
- **Causal depth: 5 Whys with evidence gates** — L0 symptom, L1 proximate cause,
  L2 enabling condition, L3 structural/process cause, L4 systemic cause. Every
  transition needs the evidence that links it and the cheapest test that would
  confirm or weaken it. Not mechanical — stop when the next level has no
  discriminating evidence, is out of scope, or has low expected information
  gain, and record where you stopped and why.
- **Systems lens** — shared code, schema, config, generator, template, policy,
  contract, dependency, or data path that could carry the same mechanism; the
  feedback loop that hid it; the guardrail that would have caught it. If the
  system can still produce the defect, the narrow fix is not the deliverable.
- **SNR control** — Signal is evidence that can change hypothesis ranking or the
  next action; everything else is noise. Generation gates admit a hypothesis only
  with a concrete mechanism, locus/layer, observable trace, and cheapest
  discriminating probe — the zoom-out hypothesis must also name a recurrence
  signature ("maybe this is systemic" is rejected). Falsification gates require
  stating the targeted hypothesis, the strengthening result, the weakening
  result, and the ambiguous verdict before probing; baseline first, one variable
  at a time, known-good and known-bad cases, confounders listed, reproducibility
  required. Search bounds confine searching to where the mechanism predicts
  recurrence.
- **Hypothesis Ledger** — at least three mechanistically distinct hypotheses
  (H1, H2, H3), each with mechanism, expected evidence, cheapest test, assumption
  load. One is always reserved for zoom-out, stated concretely rather than as an
  abstract "maybe there's more".
- **Anti-rationalization rule** — generate hypotheses before reaching a
  conclusion. Hypotheses that only wrap an answer already picked mean discard
  the frame and restart from decomposition.
- **Hypothesis tracking** — every later step must reference a hypothesis ID and
  update its status (proposed / tested / strengthened / weakened / eliminated /
  inconclusive / survived). A step that does none of these is noise.
- **Evidence rules** — eliminate only on a discriminating test or explicit
  contradiction, never on plausibility. Weak, flaky, or confounded evidence
  raises uncertainty rather than pruning. Rank survivors by Occam's Razor, but
  evidence beats simplicity.
- **Convergence and scope escalation** — converge only after an attempted
  falsification. If the zoom-out hypothesis survives, its scope becomes the
  deliverable: category fix, guardrail fix, systemic recommendation, or an
  explicit scoped exception that names what is excluded and why. Never silently
  downgrade a systemic finding back into a local fix.
- **Proportionality** — one line per hypothesis is enough for a real fix; skip
  the full ledger for genuinely single-instance work, but still answer "nothing
  bigger here" by checking for a recurrence signature.

## Layout

```
.claude-plugin/
  plugin.json         # plugin manifest (name, version, author)
  marketplace.json    # lets this repo be added as a marketplace
hooks/
  hooks.json          # SessionStart -> the reflex injection
  zoom-out-session-start.js
skills/
  zoom-out/SKILL.md   # the skill itself
```

## License

MIT — see [LICENSE](LICENSE).