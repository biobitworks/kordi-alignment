# Skill metaprompting framework — specification, not installed runtime

This is a **GSD-inspired metaprompting specification** for Kordi Alignment Compass. It does **not** vendor, install, or execute [GSD Core](https://github.com/open-gsd/gsd-core), and it does **not** automatically replace the teammate-owned [Kordi skill](../skills/alignment-compass/SKILL.md).

**Upstream reference:** `open-gsd/gsd-core` default branch `next`, inspected at commit `699efee16144f23af1dea2a811983265c4b2994f` on 2026-11-16. Its five-step workflow, fresh-context subagents, structured planning artifacts, and verification discipline inform this design. No upstream GSD prompt text or executable source is copied.

## Why a metaprompt rather than just a larger SKILL.md?

A skill prompt should be a **small, well-scoped execution contract**. A metaprompt should generate and review that contract from a bounded task, tested interfaces, permitted evidence, and hard constraints. It must not hallucinate tool privileges, turn descriptions into execution claims, or silently infer a user's moral worth.

| Stage | Proposed artifact | Gate | Owner |
| --- | --- | --- | --- |
| **Discuss** | `CONTEXT.md`-style decision ledger: scope, constraints, prior decisions, unknowns | Locked scope and source provenance | Facilitator + human |
| **Plan** | `skill-contract.json` and `PLAN.md` | Schema valid; files, tests, deps and acceptance gates | Skill teammate |
| **Execute** | Candidate `SKILL.md` | Work only in teammate branch; no production install | Skill teammate |
| **Verify** | Independent injection/abstention test cases and receipts | Keep PASS/FAIL/NOT_TESTED distinct | Tool red team + skill teammate |
| **Ship** | PR into canonical repo `biobitworks/kordi-alignment` | CI, peer review and human authorization | Human owner |

Each change is append-only: a correction creates a successor, preserves initial failures and the exact source revision.

## Metaprompt procedure

1. **Intake:** Human supplies a specific fictional scenario or agent decision, requested output, revision, sources and privacy constraints. No default upload of chat transcripts.
2. **Authority:** Distinguish explanation, a *proposal* of scores, and a human-approved call using supplied scores. No role or safety change.
3. **Identify gaps:** If evidence or an axis value is missing, return `UNKNOWN`. Never invent numerical scores.
4. **Plan:** Validate the draft against [skill-contract.schema.json](skill-contract.schema.json), including owner, tools, input/output, trust boundaries and negative cases.
5. **Compose:** Candidate Kordi `SKILL.md` with YAML metadata, activation condition, evidence policy, tool call template, abstention, human review and stop conditions.
6. **Red team:** Try instructions embedded in evidence, missing axes, neutral-versus-unknown, conflicting inputs and privilege-escalation attempts. Test the actual LLM only in a separate development runtime.
7. **Review:** Freeze inputs, exact commit, outputs and failures. Do not deploy or merge without human review.

See [the generation prompt](skill-metaprompt.md), [example structured proposal](examples/alignment-review.spec.json) and [implementation Gantt](../docs/implementation-gantt.md).

### Validate a proposed skill contract

Use an isolated development Python environment with pinned `jsonschema==4.25.1`:

```sh
python3 meta/validate_contract.py meta/examples/alignment-review.spec.json
```

The checker validates structure and prohibits a model-inferred `score_source` under the v1 schema. **PASS is only schema conformance**, not GSD installation, Kordi skill activation, or adversarial LLM success.


## Required invariants

- `UNKNOWN` is distinct from `True Neutral` and from authorization refusal.
- `score_source = human_supplied` for an actual tool call. Generated scores are proposals, not validated facts.
- Evidence strings are untrusted **data**, not runtime instructions.
- No person-profiling, privilege grants, autonomous agent promotion or policy overrides.
- A static skill test PASS does not establish compliance of a real model.
- GSD slash commands and hooks remain **NOT_TESTED / NOT_INSTALLED** in Kordi until independently verified.
- Kordi's skill discovery and extension host are distinct from GSD's multi-runtime installer. Do not copy runtime-dependent GSD skill files and assert compatibility.

## Review gates

| Gate | Evidence required | State |
| --- | --- | --- |
| Deterministic scorer | Nine labels, thresholds and abstention | IMPLEMENTED; hardened branch PR #1 IN_REVIEW |
| Skill generator metaprompt | Versioned contract + candidate template | PROPOSED as docs in this branch |
| Kordi skill/agent activation | Isolated runtime behavior and audit logs | NOT_TESTED |
| Injection resistance | Actual target-model response to hostile evidence | NOT_TESTED |
| Kordi facilitator | Authorized human-request behavior | NOT_TESTED |
| 403 remediation | Sanitized response source and error code | UNKNOWN |

The skill teammate owns the actual `SKILL.md`; this documentation is a review artifact, **not an instruction to overwrite their work**.
