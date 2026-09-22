---
name: zoom-out
description: >
  Before declaring any bug fix, root-cause diagnosis, or plan complete, force
  a Hypothesis Ledger that includes a mandatory zoom-out (non-local)
  hypothesis: is the thing you just handled one instance of something bigger?
  Use whenever you're about to say a fix/plan/diagnosis is done, whenever an
  explanation you found "fits" the symptom, or when the user says "zoom out",
  "think bigger", "is that the whole picture", "why only X", or otherwise
  pushes back on a narrow fix/plan.
---

Default is correction and rigor, not agreement or speed. A clean explanation
that fits the symptom is not a verified explanation of the full scope.

## Anti-rationalization rule

Generate hypotheses before reaching a conclusion, never after. If hypotheses
only show up wrapped around an answer already picked, discard the frame and
restart from decomposition.

## Hypothesis Ledger (mandatory before converging on a fix/plan/diagnosis)

Write at least three hypotheses — H1, H2, H3 — each with: mechanism,
expected evidence, cheapest test, assumption load.

**One hypothesis is always reserved for zoom-out**: the instance in front of
you is one member of something bigger. What that "bigger" is isn't fixed in
advance — figure it out fresh each time from what's actually there, don't
reach for a stock category. State it concretely (name what you found), not as
an abstract possibility — "maybe there's more to this" doesn't count.

Example shape (illustrative, not a checklist): fix the cause at the one spot
reported, confirm it explains the report, stop. Only later does it surface
that the same thing was repeated elsewhere too. The zoom-out hypothesis asks,
before you stop: is this the whole thing, or one expression of it?

Often the evidence for "elsewhere" was already returned earlier in the
session — by ripwire's orientation output, a grep, a design doc — just not
acted on because it didn't look relevant to the one spot you were chasing.
Re-read what you already have before reaching for a new search.

Every later step must reference a hypothesis ID and update its status:
proposed / tested / strengthened / weakened / eliminated / inconclusive /
survived. A step that does none of these is noise — cut it.

## Evidence rules

- Eliminate a hypothesis only on a discriminating test or explicit
  contradiction, never on vibes or plausibility alone.
- A hypothesis "explaining what was reported" is not evidence it covers the
  full scope — that's exactly the failure mode this skill exists to block.
- Rank survivors by Occam's Razor (fewer assumptions, shorter chain), but
  evidence beats simplicity: a hypothesis that explains more and survives a
  check beats a simpler one that doesn't.

## Convergence

Converge only once a hypothesis survives an attempted falsification. If the
zoom-out hypothesis survives — the pattern really does recur elsewhere — its
scope *is* the deliverable, not the original narrow instance: implement or
diagnose across the whole category. If you deliberately cover less than the
zoom-out hypothesis found, say so explicitly and why, before calling it done.
State residual uncertainty rather than forcing closure.

## Proportionality

This is a discipline, not a report. For a real bug fix, root-cause claim, or
plan, the ledger can be one line per hypothesis — no five-section essay. Skip
the ledger entirely for genuinely single-instance, non-recurring work (a typo,
a one-off script with no siblings) — the zoom-out check itself should answer
"nothing bigger here" fast, not manufacture ceremony.
