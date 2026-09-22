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
system with 5 Whys under evidence gates, and an information-gain rule that keeps speculation
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

The skill defines a protocol, not a report. Its core: evidence comes from
instances, but conclusions and deliverables claim a scope, and the claimed
scope must never silently differ from the verified one. Scope goes wrong in
two directions (too narrow: stopping at the instance; too wide: "maybe it's
systemic" with no mechanism), and both have one fix: name the recurrence
signature, then enumerate. A budget rule keeps the two apart: economize on the
investigation, never on scope, because a dropped probe can be rerun but a
dropped member fails silently.

Four primitives:

- **Scope** — the set of members a claim explains or a deliverable covers,
  named explicitly.
- **Recurrence signature** — the mechanism that makes members alike (same
  template, shared utility, schema, data path, process gap, missing
  guardrail...). In a deliverable it becomes a role: the stable identifier that
  picks out the same thing in every member.
- **Enumeration** — list the members and check each one; re-read earlier
  output first, since the list is often already there.
- **Hypothesis Ledger** — H1-H3 with mechanism, expected evidence, cheapest
  test, and assumption load; every later step references a hypothesis ID and
  updates its status (proposed / tested / strengthened / weakened / eliminated
  / inconclusive / survived).

Five moments where it applies:

1. **Before concluding** — generate hypotheses before the answer, climb
   Instance -> Class -> System with evidence at each step (5 Whys, systems
   lens), and write the ledger. One hypothesis is always the zoom-out one,
   stating the larger class, recurrence signature, where recurrence would
   appear, and the cheapest check. "Maybe this is systemic" is rejected.
2. **Each probe** — state the targeted hypothesis and the strengthening,
   weakening, and ambiguous outcomes before running it; search only where the
   mechanism predicts recurrence; eliminate only on a discriminating test.
3. **Converging** — if the zoom-out hypothesis survives, its scope is the
   deliverable: category fix, guardrail fix, systemic recommendation, or an
   explicit scoped exception. A coverage check confirms the fix reaches every
   member, meaning the same role inside it, not just a selector match.
4. **Building** — every value carried from the evidence into a config, query,
   alert, test, or script claims to hold everywhere the deliverable covers.
   Enumerate it before shipping; if it varies, select by role. These gaps
   produce no symptom.
5. **Challenged** — "why only X" is answered with the enumeration, not with
   arguments.

**Proportionality** — one line per hypothesis is enough for a real fix; skip
the full ledger for genuinely single-instance work, but still check for a
recurrence signature. Skipping the ledger never skips the check in moment 4.

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
