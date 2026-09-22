---
name: zoom-out
description: >
  Before declaring any bug fix, root-cause diagnosis, or plan complete, force
  a Hypothesis Ledger that includes a mandatory zoom-out (non-local)
  hypothesis: is the thing you just handled one instance of something bigger?
  Use 5 Whys, systems thinking, and action-level SNR gates to separate real
  recurrence from noise. Use whenever you're about to say a fix/plan/diagnosis
  is done, whenever an explanation you found "fits" the symptom, or when the
  user says "zoom out", "think bigger", "is that the whole picture",
  "why only X", or otherwise pushes back on a narrow fix/plan.
---

Default is correction and rigor, not agreement or speed. A clean explanation
that fits the symptom is not a verified explanation of the full scope.

## Anti-rationalization rule

Generate hypotheses before reaching a conclusion, never after. If hypotheses
only show up wrapped around an answer already picked, discard the frame and
restart from decomposition.

## Zoom-out sequence

Move through three levels before declaring completion:

1. Instance:
   What exact defect was observed?

2. Class:
   Is this one member of a larger class of defects?
   What recurrence signature would identify that class?

3. System:
   What structure, process, constraint, incentive, missing guardrail, or
   feedback loop produces or permits that class?

Do not jump to system-level abstraction without a concrete class-level
recurrence signature.

## Causal depth: 5 Whys with evidence gates

Before declaring a fix, diagnosis, or plan complete, climb the causal ladder
unless evidence clearly shows the issue is truly local.

Use at least these levels:

L0 — Symptom:
What was observed?

L1 — Proximate cause:
What directly produced the symptom?

L2 — Enabling condition:
What allowed the proximate cause to exist or go unnoticed?

L3 — Structural/process cause:
What code structure, workflow, missing test, missing contract, ownership gap,
or environment condition made L2 possible?

L4 — Systemic cause:
What incentive, assumption, feedback loop, policy, abstraction boundary, or
missing guardrail makes L3 recur?

For each transition, ask:

- Why did the previous level occur?
- What evidence links this level to the previous one?
- What cheapest test or observation could confirm or weaken this link?
- Does fixing this level prevent recurrence, or merely move the symptom?

Do not mechanically ask “why” five times.
Stop when the next level has no discriminating evidence, is out of scope, or
has low expected information gain. Record where you stopped and why.

## Systems lens

Treat the defect as a possible output of a system, not just a mistake in one
place.

Ask:

- What system constraints, interfaces, or assumptions made this defect possible?
- What shared code, schema, config, generator, template, policy, contract,
  dependency, or data path could carry the same mechanism elsewhere?
- What feedback loop hides the problem until it becomes visible as a defect?
- What missing guardrail would have caught this earlier?
- What incentive or workflow encourages this class of defect?
- If only the local instance is fixed, does the system remain capable of
  producing the same defect again?

If the answer is yes, the narrow fix is not the full deliverable unless scope
is explicitly reduced.

## SNR control for hypothesis actions

Signal = evidence that can change hypothesis ranking or the next action.
Noise = vague hypotheses, duplicate hypotheses, broad searches, uncontrolled
tests, flaky observations, stock categories, and plausible speculation.

### Hypothesis generation gates

Admit a hypothesis only if it has all of these:

- a concrete mechanism,
- a locus or layer where the mechanism operates,
- an observable trace or artifact,
- a cheapest discriminating probe.

The zoom-out hypothesis must also name a recurrence signature, such as:

- same generated source,
- same template,
- same shared utility,
- same schema or contract,
- same data path,
- same abstraction layer,
- same process gap,
- same missing guardrail.

Reject generic zoom-outs like:

- “maybe this is systemic,”
- “maybe there are other cases,”
- “maybe the architecture is wrong,”

unless they are translated into mechanism, locus, observable trace, and
recurrence signature.

Hypotheses must be mechanistically distinct.
If two hypotheses differ only in wording, merge them.
Cap active hypotheses at three unless a fourth has unusually high expected
information gain.

### Falsification gates

Before running any test, search, inspection, or probe, state:

- which hypothesis it targets,
- what result would strengthen it,
- what result would weaken or eliminate it,
- what the verdict will be if the result is ambiguous.

Do not run a probe if its result would not change hypothesis ranking or the
next action.

Where possible:

- establish a baseline before intervention,
- change one variable at a time,
- use a known-good and known-bad case,
- list obvious confounders,
- require reproducibility before treating a signal as strong.

Flaky, irreproducible, or confounded evidence is noise.
Stabilize the reproduction or mark the hypothesis inconclusive.
Do not build systemic conclusions from one unstable signal.

### Search bounds

Search only where the current mechanism implies recurrence.

Useful recurrence signatures include:

- same generated source,
- same template,
- same shared utility,
- same schema or contract,
- same data path,
- same abstraction layer,
- same process gap,
- same missing guardrail.

Do not broad-search for vibes.
Do not expand scope unless the proposed mechanism predicts where similar
instances should appear.

Stop expanding when additional search has low expected information gain.

## Hypothesis Ledger

Before converging on a fix, plan, or diagnosis, write at least three
hypotheses — H1, H2, H3 — each with:

- mechanism,
- expected evidence,
- cheapest test,
- assumption load.

One hypothesis is always reserved for zoom-out: the instance in front of you
is one member of something bigger. What that “bigger” is isn’t fixed in
advance — figure it out fresh each time from what’s actually there. Do not
reach for a stock category.

The zoom-out hypothesis must state concretely:

- the larger class,
- the recurrence signature,
- where recurrence would appear,
- the cheapest way to check.

“Maybe there’s more to this” doesn’t count.

Example shape:

Fix the cause at the one spot reported, confirm it explains the report, stop.
Only later does it surface that the same thing was repeated elsewhere too.
The zoom-out hypothesis asks, before you stop: is this the whole thing, or one
expression of it?

Often the evidence for “elsewhere” was already returned earlier in the
session — by ripwire’s orientation output, a grep, a design doc — just not
acted on because it didn’t look relevant to the one spot you were chasing.
Re-read what you already have before reaching for a new search.

Every later step must reference a hypothesis ID and update its status:

proposed / tested / strengthened / weakened / eliminated / inconclusive /
survived.

A step that does none of these is noise — cut it.

## Evidence rules

- Eliminate a hypothesis only on a discriminating test or explicit
  contradiction, never on vibes or plausibility alone.
- A hypothesis “explaining what was reported” is not evidence it covers the
  full scope — that’s exactly the failure mode this skill exists to block.
- Weak, flaky, or confounded evidence increases uncertainty; rank instead of
  prune unless the contradiction is explicit.
- Rank survivors by Occam’s Razor: fewer assumptions, shorter causal chain,
  greater testability. But evidence beats simplicity: a hypothesis that
  explains more and survives a check beats a simpler one that doesn’t.

## Convergence and scope escalation

Converge only once a hypothesis survives an attempted falsification.

If the zoom-out hypothesis survives — the pattern really does recur elsewhere —
its scope becomes the deliverable, not the original narrow instance.

The deliverable is then one of:

1. Category fix:
   Fix or diagnose the whole class of instances.

2. Guardrail fix:
   Add the missing test, constraint, lint, review gate, contract, schema rule,
   or observability that prevents recurrence.

3. Systemic recommendation:
   Change the process, ownership, interface, incentive, or architecture that
   produces the class.

4. Explicit scoped exception:
   Deliberately fix less than the discovered category, but state exactly what
   is being excluded and why before calling it done.

Never silently downgrade a systemic finding back into a local fix.

If the zoom-out hypothesis is eliminated, state what recurrence checks were
performed and why stopping at the local instance is justified.

State residual uncertainty rather than forcing closure.

## Proportionality

This is a discipline, not a report.

For a real bug fix, root-cause claim, or plan, the ledger can be one line per
hypothesis — no five-section essay.

Skip the full ledger only for genuinely single-instance, non-recurring work:
a typo, a one-off script with no siblings, a content-only change, or an
isolated manual operation.

Even then, the zoom-out check should answer “nothing bigger here” fast by
checking for a recurrence signature, not by manufacturing ceremony or noise.
