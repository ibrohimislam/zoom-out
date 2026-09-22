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
node scripts/install.mjs --agents all     # every agent in the compatibility table
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

## Compatibility

Coverage target: every coding agent measured at meaningful at-work adoption, plus
the two open standards everything else conforms to. Regenerate the table with
`node scripts/install.mjs --matrix`.

<!-- matrix:begin (generated by scripts/install.mjs --matrix) -->
| Agent | At-work share | Skill discovery root | Always-on surface |
| --- | --- | --- | --- |
| Claude Code | 39% | ~/.claude/skills/zoom-out/, .claude/skills/zoom-out/ | SessionStart hook (hooks/hooks.json) — shipped, installed with the plugin |
| Codex (OpenAI) | 16% | ~/.agents/skills/zoom-out/, ~/.codex/skills/zoom-out/, .agents/skills/zoom-out/, .codex/skills/zoom-out/ | ~/.codex/AGENTS.md, AGENTS.md |
| GitHub Copilot (VS Code, CLI, cloud agent) | 21% | ~/.agents/skills/zoom-out/, ~/.copilot/skills/zoom-out/, .agents/skills/zoom-out/, .github/skills/zoom-out/ | .github/instructions/zoom-out.instructions.md, .github/copilot-instructions.md |
| Cursor | 12% | ~/.agents/skills/zoom-out/, ~/.cursor/skills/zoom-out/, .agents/skills/zoom-out/, .cursor/skills/zoom-out/ | .cursor/rules/zoom-out.mdc |
| Gemini CLI | 6% | ~/.agents/skills/zoom-out/, ~/.gemini/skills/zoom-out/, .agents/skills/zoom-out/, .gemini/skills/zoom-out/ | ~/.gemini/GEMINI.md, GEMINI.md |
| Google Antigravity (2.0 / CLI / IDE) | 6% | ~/.gemini/config/skills/zoom-out/, ~/.gemini/antigravity-cli/skills/zoom-out/, .agents/skills/zoom-out/ | ~/.gemini/GEMINI.md, AGENTS.md, .agents/rules/zoom-out.md |
| OpenCode | 7% | ~/.agents/skills/zoom-out/, ~/.config/opencode/skills/zoom-out/, .agents/skills/zoom-out/, .opencode/skills/zoom-out/ | ~/.config/opencode/AGENTS.md, AGENTS.md |
| JetBrains Junie | 9% | ~/.agents/skills/zoom-out/, ~/.junie/skills/zoom-out/, .agents/skills/zoom-out/, .junie/skills/zoom-out/ | ~/.junie/AGENTS.md |
| AWS Kiro | — | ~/.kiro/skills/zoom-out/, .kiro/skills/zoom-out/ | ~/.kiro/steering/zoom-out.md, .kiro/steering/zoom-out.md |
| Cline | — | ~/.cline/skills/zoom-out/, .cline/skills/zoom-out/, .claude/skills/zoom-out/ | ~/.agents/AGENTS.md, .clinerules/zoom-out.md |
| Roo Code | — | ~/.agents/skills/zoom-out/, ~/.roo/skills/zoom-out/, .agents/skills/zoom-out/, .roo/skills/zoom-out/ | ~/.roo/rules/zoom-out.md, .roo/rules/zoom-out.md |
| Devin Desktop / Windsurf, Devin CLI | — | ~/.config/devin/skills/zoom-out/, ~/.codeium/windsurf/skills/zoom-out/, .devin/skills/zoom-out/, .windsurf/skills/zoom-out/ | ~/.codeium/windsurf/memories/global_rules.md, .devin/rules/zoom-out.md |
| Zed | — | ~/.agents/skills/zoom-out/, .agents/skills/zoom-out/ | ~/.config/zed/AGENTS.md |
| Amp | — | ~/.agents/skills/zoom-out/, ~/.config/amp/skills/zoom-out/, .agents/skills/zoom-out/ | ~/.config/amp/AGENTS.md |
| Goose | — | ~/.agents/skills/zoom-out/, .agents/skills/zoom-out/ | ~/.config/goose/.goosehints |
| Ona | — | .agents/skills/zoom-out/, .ona/skills/zoom-out/ | AGENTS.md |
| pi | — | — | hooks/zoom-out-reflex.ts (before_agent_start) — shipped |
| omp / oh-my-pi | — | ~/.omp/agent/skills/zoom-out/ | hooks/zoom-out-reflex.ts (before_agent_start) — shipped |
| Agent Skills / AGENTS.md standard | — | ~/.agents/skills/zoom-out/, .agents/skills/zoom-out/ | AGENTS.md |
<!-- matrix:end -->

Every path above is taken from the vendor's own documentation, cited per agent in
`scripts/install.mjs` (the `sources` field of each registry entry). Where a vendor
documents a compatibility alias for another agent's directory — Cursor reading
`.claude/skills`, Gemini CLI treating `.agents/skills` as an alias — the alias is
written too, deliberately: mirrors are cheap, and Cursor has shipped releases
where an aliased skill appeared in the menu but never reached the prompt.

### What the share column means

The share column is at-work adoption among professional developers, from the
JetBrains [Developer Ecosystem Survey
2026](https://blog.jetbrains.com/research/2026/08/ai-coding-agent-adoption-2026/)
(n=15,509, fielded May–July 2026): Claude Code 39% (47% in the US), GitHub
Copilot 21%, Codex 16%, Cursor 12%, JetBrains AI/Junie 9%, OpenCode 7%, Google
Antigravity 6%. The same survey found 90% of professional developers using AI
coding agents at work at least weekly and 68% daily.

Read those numbers as *usage*, not exclusive share: developers stack tools (the
Pragmatic Engineer survey of 906 developers found 70% using two to four), so the
column sums past 100% and no published survey reports the union. That is why the
target here is stated as *cover every tool that clears the measured threshold,
plus the standard paths the rest conform to* rather than as one aggregate
percentage — and why the table carries the two standard rows, which cover the
long tail (Warp, Aider, Kilo Code, Factory, Augment, TRAE, and the ~40 other
clients on the [agentskills.io showcase](https://agentskills.io/clients))
without a row each.

Vendor-disclosed scale, on the same market (IdeaPlan's [September 2026 source
audit](https://www.ideaplan.io/blog/ai-coding-assistant-market-share-2026)):
GitHub Copilot 50M total users on 4.7M paid seats, Cursor ~$4B annualized, Claude
Code $2.5B+ run rate. Those three are measured on different denominators and
cannot be ranked against each other; the at-work column is the only one measured
the same way across tools.

### Known gaps, stated rather than implied

- **JetBrains AI Assistant** project rules (`.aiassistant/rules/*.md`) are not
  written. The rule *type* — including `Always` — is set in the IDE, not in the
  file, so a file-only drop-in cannot force it. Junie, which shares the JetBrains
  row in the survey, is covered.
- **Aider** does not auto-load `AGENTS.md`; it needs `read: AGENTS.md` in
  `.aider.conf.yml`. The installer does not edit your config files, so this is one
  line you add yourself.
- **Antigravity** per-rule activation frontmatter is undocumented, so
  `.agents/rules/zoom-out.md` is written without frontmatter and the always-on
  guarantee comes from `GEMINI.md` and root `AGENTS.md`, both of which Antigravity
  parses at startup.
- **Gemini CLI** does not read `AGENTS.md` by default (the filename list is
  configurable), which is why it gets a `GEMINI.md` block instead.
- **Zed** picks the first existing project instruction file from a fixed list in
  which `.rules` precedes `AGENTS.md`, so an existing `.rules` wins over the
  managed block.
- **Kiro** custom agents do not inherit steering or skills unless their paths are
  listed in the agent's `resources`.
- **Warp** is reached through the AGENTS.md standard row; it has no skill
  directory to install into.

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
skills/
  zoom-out/SKILL.md   # the skill itself
test/
  install.test.mjs    # installer contract: coverage, idempotency, no clobbering
  skill.test.mjs      # SKILL.md conformance to the Agent Skills spec
```

## License

MIT — see [LICENSE](LICENSE).
