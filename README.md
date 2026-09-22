# zoom-out

A skill and reflex for AI coding agents — [Claude Code](https://claude.com/claude-code),
[Codex](https://openai.com/codex/), [GitHub Copilot](https://github.com/features/copilot),
[Cursor](https://cursor.com/), [Gemini CLI](https://geminicli.com/),
[Antigravity](https://antigravity.google/), [OpenCode](https://opencode.ai/),
[Junie](https://junie.jetbrains.com/), [Kiro](https://kiro.dev/),
[Cline](https://cline.bot/), [Roo Code](https://roocode.com/),
[Devin Desktop / Windsurf](https://windsurf.com/), [Zed](https://zed.dev/),
[Amp](https://ampcode.com/), [Goose](https://block.github.io/goose/),
[Ona](https://ona.com/), [pi](https://github.com/badlogic/pi-mono), and
[omp / oh-my-pi](https://github.com/oh-my-pi) — that blocks narrow fixes.

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

Description-based skill triggering alone is unreliable for this. Hence every
agent gets an injection as well as the skill: a `SessionStart` hook for Claude
Code, a shared extension entry for pi and omp, and an always-on instruction file
(`AGENTS.md`, `.cursor/rules/*.mdc`, `.github/instructions/*.instructions.md`,
`GEMINI.md`, steering files) for everyone else.

## Install

### Any agent (portable installer)

```bash
node scripts/install.mjs                  # detected agents + the portable standard
node scripts/install.mjs --agents all     # every agent in the registry
node scripts/install.mjs --scope project  # commit the surfaces into this repo
node scripts/install.mjs --list           # what is selected, and where it lands
node scripts/install.mjs --dry-run        # print planned writes, touch nothing
node scripts/install.mjs --uninstall      # remove exactly what it installed
```

The installer renders one source — `hooks/reflex.txt` and `skills/zoom-out/` —
into each agent's documented discovery paths. It never hand-maintains a copy per
agent, so a surface cannot drift away from the skill.

Two kinds of surface are written, because agents differ in what they guarantee:

- **skill** — a `SKILL.md` directory the agent discovers and loads on relevance.
  Portable across the [Agent Skills](https://agentskills.io) standard, but
  trigger-dependent: the agent has to decide the skill is relevant.
- **rules** — an always-on instruction file the agent injects into every session
  regardless of triggering. This is where the reflex is guaranteed rather than
  hoped for, on agents with no hook API.

Safety properties, all covered by `npm test`:

- **Idempotent** — running it twice changes nothing.
- **Non-destructive** — shared files such as `AGENTS.md` get a marked managed
  block; everything around it is preserved, and uninstall restores the file.
- **Never clobbers** — an existing rule file that this installer did not generate
  is skipped, with `--force` to override deliberately.
- **Scoped** — `--agents cursor --scope user` writes only Cursor's user surfaces.

### Codex and Cursor (portable package)

Both read the [Agent Plugins](https://agent-plugins.org) format, so this repo is
installable straight from git with no marketplace step:

```bash
codex plugin marketplace add ibrohimislam/zoom-out
```

For Cursor, add the repository through a team marketplace, or point
`~/.cursor/plugins/local` at a clone. The package ships the skill; the always-on
rule for either agent comes from the installer's `--scope project` run.

### Claude Code (plugin — includes the hook)

```bash
claude plugin marketplace add ibrohimislam/zoom-out
claude plugin install zoom-out@zoom-out
```

Or from inside a session: `/plugin marketplace add ibrohimislam/zoom-out`, then
`/plugin install zoom-out@zoom-out`.

### omp / oh-my-pi (plugin — includes the reflex injection)

The same catalog works for omp, which reads `.claude-plugin/marketplace.json` as
its Claude-compatible fallback:

```bash
omp plugin marketplace add ibrohimislam/zoom-out
omp plugin install zoom-out@zoom-out
```

Or inside a session: `/marketplace add ibrohimislam/zoom-out`, then
`/marketplace install zoom-out@zoom-out`.

### pi (package — includes the reflex injection)

pi installs the repo as a package, reading `package.json#pi` for the skill and the
extension entry:

```bash
pi install git:github.com/ibrohimislam/zoom-out
```

Use `pi install -l git:...` for project settings (`.pi/settings.json`) instead of
global, and `pi list` to confirm. Reconciliation on update resets the clone, so
pin a ref (`git:github.com/ibrohimislam/zoom-out@v1.3.0`) if you want stability.

Neither pi nor omp reads Claude Code's `hooks/hooks.json`, so the reflex there
comes from `hooks/zoom-out-reflex.ts`, declared through
`package.json#omp.extensions` and `package.json#pi.extensions`. It returns one
hidden custom message from `before_agent_start` — once per session, checked
against the transcript — so the reflex is attached to the prompt that triggers
it rather than queued behind it.

### As a bare skill (no injection)

```bash
mkdir -p ~/.agents/skills
cp -r skills/zoom-out ~/.agents/skills/
```

`~/.agents/skills/` is the portable standard location, read natively by Codex,
Cursor, Copilot, Antigravity, OpenCode, Junie, Roo Code, Zed, Amp, Goose and
Devin, and as a documented alias by Gemini CLI. Claude Code and Kiro do not read
it — use `~/.claude/skills/` and `~/.kiro/skills/`, or just run the installer,
which writes the right roots for you.

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
  plugin.json         # Claude Code manifest (name, version, author)
  marketplace.json    # catalog; omp reads this as its Claude-compatible fallback
plugin.json           # Agent Plugins 1.0.0 manifest -> Codex + Cursor, from git
package.json          # omp.extensions + pi manifest -> the shared reflex injection
hooks/
  reflex.txt          # the reflex text (single source of truth)
  hooks.json          # Claude SessionStart -> the reflex injection
  zoom-out-session-start.js
  zoom-out-reflex.ts  # pi + omp extension entry: same reflex, queued per session
scripts/
  install.mjs         # surface registry + installer (skill roots and rule files)
docs/
  compatibility.md    # surface inventory, market-share evidence, known gaps
skills/
  zoom-out/SKILL.md   # the skill itself
test/
  install.test.mjs    # installer contract: coverage, idempotency, no clobbering
  skill.test.mjs      # SKILL.md conformance to the Agent Skills spec
```

## License

MIT — see [LICENSE](LICENSE).
