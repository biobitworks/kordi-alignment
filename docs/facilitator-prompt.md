# Kordi facilitator request (paste into Kordi group chat)

@Facilitator Please facilitate a review of our **Kordi Alignment Compass** project. The source of truth is https://github.com/biobitworks/kordi-alignment .

We are building four separately reviewable additions: (1) pure deterministic nine-alignment decision-scoring tool, (2) Kordi JS plugin with tool + /alignment command, (3) opt-in SKILL.md, and (4) opt-in reviewer agent instructions/prompt. The labels are a Dungeons & Dragons-inspired *fictional/agent decision* taxonomy, not moral judgments of real people. Missing supplied scores/evidence must yield UNKNOWN, not True Neutral; labels cannot alter Kordi authorization or agent permissions.

Please ask the group to review the four interfaces, indicate which components need changes, and propose a **decision poll (not a meeting schedule)** on review order and ownership if multiple options remain. Do not claim the code is deployed. The canonical repository should be verified and tested on magicPRO and magicSTUDIO before we send further Kordi upstream PRs. Existing combined upstream PR https://github.com/Kordi-AI/Kordi/pull/2596 is predecessor evidence, not our new source of truth.

We have observed 403 errors from some Kordi agent requests. Treat this separately: request a **sanitized error code, endpoint category, and provider/auth route**; no session tokens, request bodies, or credentials. Never retry denied requests repeatedly or bypass authorization.

Please output a concise summary of: decisions reached, unresolved questions, responsible humans, next review gate, and whether your observations are IMPLEMENTED, EXECUTED, OBSERVED, or still NOT_TESTED. Do not merge, deploy, or access production infrastructure without explicit human permission.
