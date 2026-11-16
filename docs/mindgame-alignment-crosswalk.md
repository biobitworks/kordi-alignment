# Mind Game terminal alignment → Kordi Alignment Compass crosswalk

**Purpose:** preserve the earlier terminal game's 3×3 alignment behavior while designing a **separate, evidence-aware and opt-in Kordi decision-review tool**. This document is a public-safe conceptual comparison; no private game source, transcripts, sprites, wiki text or assets have been copied.

**Source review:** an earlier internally maintained terminal game and its master plan were inspected read-only on 2026-11-16. Its historical master-plan snapshot is dated 2026-10-12; this is **not** a new local game execution.

## Original nine-cell grid

The terminal game placed columns from Lawful to Chaotic and rows from Good to Evil. A move entered one of nine categories; the game kept a recent trail and distinct overall alignment.

| Axis | Lawful | Neutral | Chaotic |
| --- | --- | --- | --- |
| Good | LG | NG | CG |
| Neutral | LN | TN | CN |
| Evil | LE | NE | CE |

**Terminal UI legend:** `●` was the last move; `◉` was the overall alignment; each cell displayed a count of accepted judged moves. An additional trail listed the last six per-move alignment abbreviations. A character sprite and traits could evolve with aggregate state. **We have not copied or executed that terminal UI in Kordi.** The Kordi scorer currently emits structured results only.

## Numerics: same conceptual axes, different conventions

| Property | Historical terminal Mind Game | Kordi Alignment Compass |
| --- | --- | --- |
| Law axis | `law` in `[0,4]`; `0=Lawful, 4=Chaotic` | `lawChaos` in `[-2,+2]`; `+2=Lawful, -2=Chaotic` |
| Care axis | `moral` in `[0,4]`; `0=Good, 4=Evil` | `goodEvil` in `[-2,+2]`; `+2=Good, -2=Evil` |
| Lawful/Good | raw score **strictly below** 1.5 | score **greater than or equal to** +0.5 |
| Chaotic/Evil | raw score **strictly above** 2.5 | score **less than or equal to** −0.5 |
| Neutral | closed original interval `[1.5,2.5]` | open new interval `(-0.5,+0.5)` |
| Score origin | historical action scoring via the game decision path | explicit caller/human-supplied scores, **never inferred** by tool |
| State | per-move history + recent-weighted running average | independent items in one call, with no persistent history |
| Missing information | historical score updates could be skipped | status `UNKNOWN` for any missing axis or evidence |
| Interpretive use | fictional game character and story arcs | fictional scenarios or **discrete agent decisions** only |

**Numerical orientation conversion** for an explicitly supplied historical vector is:

```text
compass_lawChaos = 2 - historical_law
compass_goodEvil = 2 - historical_moral
```

This conversion handles direction but **does not preserve exact threshold semantics at 1.5 and 2.5**. Examples, all illustrative rather than measured outcomes:

| Historical input (law,moral) | Historical label | Converted input (lawChaos,goodEvil) | New label |
| --- | --- | --- | --- |
| `(0,0)` | Lawful Good | `(+2,+2)` | Lawful Good |
| `(2,2)` | True Neutral | `(0,0)` | True Neutral *only if evidence supplied* |
| `(4,4)` | Chaotic Evil | `(-2,-2)` | Chaotic Evil |
| `(1.5,2)` | True Neutral | `(+0.5,0)` | **Lawful Neutral — boundary mismatch** |
| `(2.5,2)` | True Neutral | `(-0.5,0)` | **Chaotic Neutral — boundary mismatch** |

**Do not re-label historical results** using the new scorer and call them identical. For a replay/analysis adapter, preserve the historical raw scores, original label and original cutoff convention in the output; a new transformed label should be a separately marked derived view, never a replacement.

## Temporal semantics: per-turn, overall, and UNKNOWN

The terminal game recorded individual action pairs and updated a running alignment that began neutral. The historical update used a bounded, recently weighted mean (not a simple average of independent scores). Its `/grid` displayed both per-turn cell counts and the overall moving label; `/profile` and `/sprite` provided additional traits and time-dependent visualizations.

Kordi Alignment Compass currently returns per-decision `SCORED`/`UNKNOWN`, nine-cell labels and counts **within one request**. It does not have historical turn order, real-world player modeling, weighted session alignment, sprites, trajectory playback or save-game state. Any proposed terminal view should be a separate **read-only, opt-in chart renderer** consuming approved per-decision result receipts.

### Proposed view contract (NOT IMPLEMENTED)

A future pure visualization may accept `[{id, timestamp?, status, alignment, source_ref}]` plus an explicitly selected aggregation rule and display:

- 3×3 counts **for SCORED items only**, plus a separate UNKNOWN total;
- a last-decision marker and an optional sequential trail;
- an optional aggregate only if its weighting and source provenance are locked;
- a confidence/abstention warning, not a moral pronouncement;
- no animation, role changes or permission side effects.

The historical prototype noted a **neutral-drift problem** in offline numbered-choice games because choices often lacked score signals. That is an *older project's reported observation*, not an observed deficiency of Kordi, and it motivates the Kordi rule that missing scores must produce UNKNOWN rather than True Neutral.

## Security, licensing, and evidence

Treat private event game data and third-party franchise/wiki content as out-of-scope for export. This repo includes only a conceptual nine-cell taxonomy and independently authored documentation. Do not port historical player profiling, model-inferred moral scores or unauthorized user state to Kordi. If dynamic model scoring is researched later, label it `PROPOSED`, human-review it, and benchmark uncertainty separately from the deterministic tool.

**Verification:** Original terminal implementation was inspected by source, not re-executed for this change. Kordi tool tests and 403 triage remain separate evidence lanes.
