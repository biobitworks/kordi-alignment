# Team-level red-team handoff (primary repository only)

Canonical parent main commit: 4bde9731e0e32a68d7174590e78bbdb6cc906099.
Tool branch and source: redteam/tool-hypothesis-contract-20261116.
The tool lane is independently maintained; teammate skill, plugin, and agent files are **READ-ONLY** here.

## Reviewed original four-component plan

Original planning document: docs/pr-plan.md. Keep the source repository biobitworks/kordi-alignment canonical. Upstream Kordi-AI/Kordi #2596 and earlier export branches are predecessor records only, not destinations for this tool red team. No upstream merge was performed in this lane.

| Owner lane | Current interface checked | Independent gate | Correct interpretation |
| --- | --- | --- | --- |
| Tool (this branch) | src/core.cjs, scoring return contract | Node + Hypothesis vs independent Python, JSON Schema, evidence/axis LOMO, 20k synthetic cases | Observed tool behavior on synthetic inputs |
| Plugin (teammate) | extensions/alignment-compass.cjs + package.json | Direct adapter registration/schema; actual local Kordi host JSON-RPC with synthetic input | Offline integration tested, NOT live Kordi app |
| Skill (teammate) | skills/alignment-compass/SKILL.md | Frontmatter, UNKNOWN, scope, permission language | Static contract only, agent following instructions NOT_TESTED |
| Agent (teammate) | agents/ and prompts/ | Opt-in, no always-on execution, review/authorization language | Static contract only, real agent runtime NOT_TESTED |

## Red-team findings / remediations in tool lane

1. Reject unknown top-level properties, matching the Kordi adapter's JSON schema contract.
2. Reject unknown decision properties rather than silently ignoring them.
3. Use Unicode scalar count for evidence strings so JavaScript and JSON Schema agree for non-BMP characters.
4. Keep duplicate IDs as explicit JS/Python rule: standard JSON Schema alone cannot express uniqueness of a property among array objects.
5. Preserve separate FAIL states from the initial property fuzz, then execute successor tests; do not rewrite earlier outcomes.

## Teammate requests (PROPOSED, not implemented in their lanes)

- Plugin: verify the option-to-call boundary inside an isolated Kordi development agent, with hard permission checks and 403 fail-closed behavior; never use production sessions. Confirm no network call or auth change is performed by this plugin.
- Skill: test prompt-injection and ambiguous-evidence examples with the intended permitted LLM and actual runtime, verifying abstention and nondeterministic output variance. Static Markdown checks do not prove prompt compliance.
- Agent: test opt-in invocation, user-approval handoffs, no background automation, and role-scoped memory in an isolated test user/profile; confirm tool outputs are advisory, not an authorization gate.
- Coordinator: freeze a common explicit score/evidence fixture corpus and scoring contract before comparing implementations; log tested commit, environment, and verdict independently for each PR.

## Gates to review

- Completed offline source parity is not permission to deploy.
- No LLM behavior, live Kordi client, facilitator message, ChatGPT Kordi connector, or actual Kordi 403 root cause has been tested here.
- Review open tool PR in the PRIMARY repo; merge only after teammate review, and use that admitted source commit as the base for any later Kordi-AI/Kordi export.
- Report failing or unavailable gates explicitly as FAIL, NULL, DEFERRED, UNKNOWN, or NOT_TESTED.
