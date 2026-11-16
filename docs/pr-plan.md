# Four-component PR strategy

**Canonical source first:** `biobitworks/kordi-alignment`. Do not open new Kordi upstream PRs until the owner reviews the four component contracts and the independently tested canonical revision.

Existing combined upstream PR: [Kordi-AI/Kordi#2596](https://github.com/Kordi-AI/Kordi/pull/2596). Existing upstream split issues: [tool #2598](https://github.com/Kordi-AI/Kordi/issues/2598), [plugin #2599](https://github.com/Kordi-AI/Kordi/issues/2599), [skill #2600](https://github.com/Kordi-AI/Kordi/issues/2600), [agent #2602](https://github.com/Kordi-AI/Kordi/issues/2602). Treat these as predecessor records, not as evidence of merged features.

## Export gates

| Order | PR component | Source files | Gates | Depends on |
| --- | --- | --- | --- | --- |
| 1 | `tools/alignment-compass` | `src/core.cjs`, unit and stress tests, tool docs | Pure unit + stress tests | None |
| 2 | `plugins/alignment-compass` | `extensions/alignment-compass.cjs`, `package.json`, integration tests, README | Real Kordi plugin-host RPC and discovery | Tool PR |
| 3 | `skills/alignment-compass` | `skills/alignment-compass/SKILL.md` | Frontmatter parse and instruction review | Plugin for live tool invocation |
| 4 | `agents/alignment-reviewer` | `agents/`, `prompts/` | Explicit opt-in, scope guards, no unintended tool calls | Skill and plugin for live score retrieval |

Each downstream PR must link to its issue, list the exact upstream base commit, source commit from this canonical repo, tests executed and results, and distinguish IMPLEMENTED from NOT_TESTED. Keep each independently reviewable against upstream `main`. If a plugin depends on tool source, use explicit dependency links and test against a combined local checkout without smuggling dependent code into the plugin PR.

**Promotion:** After maintainer review, resolve the overlap with the original combined PR #2596 by marking it superseded or closing it only if authorized. Do not merge overlapping combined and split branches without review. The earlier fork split branches are preserved as evidence, but must be reconciled to this canonical source before proposed upstream PRs.

No PR should be auto-merged. GitHub CI results, maintainer approvals, and production behavior must not be inferred from source tests.
