# Project identity and public metadata

**Canonical repository:** https://github.com/biobitworks/kordi-alignment

**Short description (for GitHub repo settings):**
Opt-in nine-alignment decision tool, GSD-inspired skill metaprompting, Kordi plugin and reviewer agent, with reproducible red-team gates.

**README title:** Kordi Alignment Compass

**Scope:** advisory classification of **specific fictional scenarios or agent decisions** based on human-supplied scores and evidence; UNKNOWN abstention if incomplete. Not moral person profiling, user surveillance, or an access control mechanism.

**Architecture:** one pure deterministic tool (JavaScript/CJS), Kordi-native JS extension adapter and slash command, Markdown skill, optional reviewer instructions, facilitator coordination prompt and independent local test tooling.

**Core technology:** Node.js for the tool/plugin; Python with pinned pytest, Hypothesis and jsonschema packages only for independent red-teaming on the tool PR. Native Kordi skill discovery and host RPC are separate from GSD Core's multi-runtime installer.

**Metaprompting inspiration:** [GSD Core](https://github.com/open-gsd/gsd-core) MIT repository, next branch at commit 699efee16144f23af1dea2a811983265c4b2994f; design principles only, not a code import.

**Historical inspiration:** an earlier privately held terminal Mind Game showed per-move 3x3 alignment, an overall alignment, trails and evolving character state. We reference the **conceptual** interaction patterns only. No private file paths, execution transcripts, licensed franchise prose, wiki content or artwork are republished here.

**Original Kordi upstream contribution:** https://github.com/Kordi-AI/Kordi/pull/2596 (predecessor, not merged). Canonical repo tool PR: https://github.com/biobitworks/kordi-alignment/pull/1 (under review). Teammates independently own skill, plugin, and agent improvements; their future PRs are not inferred from existing prototype files.

**State as of 2026-11-16:** existing framework IMPLEMENTED; tool red-team EXECUTED with cross-machine receipts on PR branch; skill metaprompting **specification only**, actual skill model UAT NOT_TESTED; live Kordi cloud/agent and 403 resolution UNKNOWN.

**License:** MIT for this repo. Independent alignment taxonomy concept; no copied third-party text or prompts. Review the [roadmap and Gantt](implementation-gantt.md) before setting release dates.
