# Kordi Alignment Compass

**Evidence-aware decision review, nine-cell alignment visualization, and GSD-inspired skill metaprompting for Kordi.** An opt-in tool + plugin + skill + agent framework developed in the canonical [biobitworks/kordi-alignment](https://github.com/biobitworks/kordi-alignment) repository. **Advisory only:** it cannot grant permissions, classify the moral worth of real people, or change Kordi safety controls.

> **Project status — 16 November 2026:** A self-contained JavaScript scorer, Kordi extension adapter, first skill, and optional agent prompt exist on `main`. The [tool hardening/red-team PR #1](https://github.com/biobitworks/kordi-alignment/pull/1) is **open, not merged**. Teammates own the skill, plugin, and agent implementation lanes; the metaprompt framework and crosswalk documented here are specifications for their review, **not deployed skills**. See the [implementation Gantt](docs/implementation-gantt.md).

## What we are building

| Component | Current code | Responsibility | Evidence status |
| --- | --- | --- | --- |
| **Tool** | [src/core.cjs](src/core.cjs) | Validate explicit evidence/scores; return nine-cell classification or UNKNOWN | IMPLEMENTED; separate [PR #1](https://github.com/biobitworks/kordi-alignment/pull/1) adds red-team hardening |
| **Plugin** | [extensions/alignment-compass.cjs](extensions/alignment-compass.cjs) | Register Kordi `alignment_compass` and `/alignment`; no network calls | IMPLEMENTED; local adapter/host tests, production NOT_TESTED |
| **Skill** | [skills/alignment-compass/SKILL.md](skills/alignment-compass/SKILL.md) | Guide explicit opt-in reviews using supporting facts and abstention | IMPLEMENTED initial skill; [GSD-inspired metaprompt expansion](meta/README.md) PROPOSED |
| **Agent add-on** | [agents/alignment-reviewer.md](agents/alignment-reviewer.md) and [prompts/alignment-reviewer.md](prompts/alignment-reviewer.md) | Review alternatives and ask for human decisions | IMPLEMENTED as instructions, **not** a deployed autonomous agent |
| **Facilitator** | [docs/facilitator-prompt.md](docs/facilitator-prompt.md) | Ask Kordi's group facilitator to coordinate reviews | PROPOSED message, NOT_SENT |

### Team ownership and active review gates

The [team coordination PR #7](https://github.com/biobitworks/kordi-alignment/pull/7) and [owner-mapping issue #6](https://github.com/biobitworks/kordi-alignment/issues/6) record these open **issue assignments**, not verified human acceptance:

- **Tool contract:** [issue #2](https://github.com/biobitworks/kordi-alignment/issues/2), with implementation/red-team [PR #1](https://github.com/biobitworks/kordi-alignment/pull/1).
- **Plugin advertised schema:** [issue #3](https://github.com/biobitworks/kordi-alignment/issues/3), **OPEN**. Its field constraints currently differ from what the scorer rejects; do not claim end-to-end schema parity.
- **Skill adversarial/metaprompt UAT:** [issue #4](https://github.com/biobitworks/kordi-alignment/issues/4). This document PR supplies a proposed generation contract, not the teammate's model-tested skill implementation.
- **Agent opt-in and human approval:** [issue #5](https://github.com/biobitworks/kordi-alignment/issues/5). Autonomous activation remains NOT_TESTED.

No named teammate has been verified as accepting those tasks in GitHub; initial package files are not evidence of completed team PRs.

### Nine-cell alignment chart

This is an **interpretive 3×3 chart for fictional scenarios or particular agent decisions**, not a score of a human being. In the scorer, the caller explicitly supplies `lawChaos` and `goodEvil` in `[-2,+2]`: positive means Lawful or Good, negative means Chaotic or Evil; axis magnitude below 0.5 means Neutral.

|  | **Lawful** | **Neutral (order)** | **Chaotic** |
| --- | --- | --- | --- |
| **Good** | Lawful Good (LG) | Neutral Good (NG) | Chaotic Good (CG) |
| **Neutral (care)** | Lawful Neutral (LN) | **True Neutral (TN)** | Chaotic Neutral (CN) |
| **Evil** | Lawful Evil (LE) | Neutral Evil (NE) | Chaotic Evil (CE) |

**UNKNOWN is outside the grid**: either missing score or missing evidence makes the decision unscored. Neutral means the caller actually supplied sufficiently near-zero values *with evidence*. The fictional alignment labels do not constitute an ethical verdict.

### Relationship to the original Mind Game terminal alignment

The earlier terminal game explored a different representation: **0 → 4 from Lawful/Good to Chaotic/Evil**, per-move judgments, an overall running alignment, and a visible grid marking **last move**, **current alignment**, **cell counts**, and **recent trail**. Alignment Compass stores discrete scored decisions and does **not** implement that historical session/game engine. The numerical orientation can be converted with `compass_law = 2 - game_law` and `compass_good = 2 - game_moral`, but the two systems' exact boundary treatment and historical weighting are **not equivalent**. Preserve the original scoring rules when replaying old results. See the [technical chart comparison](docs/mindgame-alignment-crosswalk.md); no private game transcripts, franchise assets, or licensed wiki content were copied into this public repository.

## Skill metaprompting: GSD-inspired, Kordi-native

We use the workflow principles of [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) (MIT): **Discuss → Plan → Execute → Verify → Ship**. Each task records its scope, locked decisions, evidence, validation, and handoff before a later agent picks it up. Do not import GSD's full runtime or claim it is installed in Kordi; Kordi-native skill loading remains documented in [Kordi extensions and skills](https://github.com/Kordi-AI/Kordi/blob/main/agent/docs/extensions.md).

```text
DISCUSS (human task, constraints, provenance)
  → PLAN (bounded skill specification + non-goals + acceptance gates)
  → EXECUTE (teammate-owned skill / optional tool call)
  → VERIFY (red-team, UNKNOWN, mismatch, evidence receipt)
  → SHIP (reviewed PR to canonical repo; upstream export only later)
```

The [metaprompt generator contract](meta/README.md) defines inputs, prompt templates, expected files, safe handoff, and review gates. **A model may propose scores, but cannot silently assign, promote, or enforce them; a human-supplied score is required for tool execution.** Evidence strings are untrusted data, not instructions.

## Try the existing scorer locally

```json
{
  "scope": "agent_decision",
  "items": [
    {
      "id": "approval-before-write",
      "lawChaos": 2,
      "goodEvil": 1,
      "evidence": ["The proposed modification requires explicit approval."]
    },
    { "id": "insufficient-evidence" }
  ]
}
```

The expected classification is **Lawful Good** for the first input, **UNKNOWN** for the second. These are *illustrative supplied scores*, not objective findings.

```sh
node -e 'const {assess}=require("./src/core.cjs"); console.log(assess({scope:"fictional",items:[{id:"example",lawChaos:2,goodEvil:1,evidence:["Synthetic example"]}]}))'
npm test
npm run test:stress
```

For an isolated Kordi source checkout with its local plugin-host file:

```sh
KORDI_PLUGIN_HOST=/path/to/Kordi/agent/crates/plugin-host/js/host.js npm run test:integration
```

The integration test uses only synthetic JSON-RPC messages to a local child process. Confirm it did **not skip** the host test. To experiment with a source-built Kordi CLI in an isolated development profile, Kordi documents `kordi install --local /path/to/kordi-alignment` and `kordi list --local`. Never install into the active signed-in desktop app as part of these tests.

## Evidence and team progress

- **Observed**: The original canonical package passed 12 Node tests and 2 host-integration tests on both Macs. The tool PR branch subsequently passed 13 Node tests, 34 Python tests on magicPRO and four separate parallel local red-team lanes on each Mac. [Receipts](https://github.com/biobitworks/kordi-alignment/tree/redteam/tool-hypothesis-contract-20261116/redteam/receipts) retain the failures and successors. Do not transfer PR-branch results onto `main` before a merge.
- **In review**: [Tool PR #1](https://github.com/biobitworks/kordi-alignment/pull/1). The team lanes (skill / plugin / agent) are independent and cannot be asserted to have merged.
- **Not tested**: actual LLM alignment decisions, GSD installed in Kordi, Kordi group/facilitator messages, signed-in production agent, 403 root cause, ChatGPT-to-Kordi connector.
- **Next**: [Gantt and acceptance gates](docs/implementation-gantt.md), [PR dependency plan](docs/pr-plan.md), and [team red-team review](https://github.com/biobitworks/kordi-alignment/blob/redteam/tool-hypothesis-contract-20261116/redteam/TEAM_REVIEW.md).

## Project details and licensing

Canonical development here; later Kordi upstream contributions require owner review. Source package is zero-runtime-dependency JavaScript (Node 22+ for tests); Python is optional development-only red-team tooling on the PR branch. The software is MIT-licensed. This independent narrative taxonomy was inspired by D&D's nine alignments and the earlier terminal experiment, **without copying third-party game text, artwork, or GSD templates**. It is not endorsed by the D&D publisher or by Kordi maintainers.

**Security and privacy:** no production keys, model provider sessions, user chat transcripts, or full forbidden-response bodies belong in this repository. HTTP 403 means access was denied; it is not explained or fixed by Alignment Compass. See [403 triage boundaries](docs/403-runbook.md).
