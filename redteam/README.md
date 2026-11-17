# Alignment Compass red-team lanes

Independent tests for the Kordi alignment framework, primarily for the pure scoring tool. The plugin, skill, and agent checks are read-only and do not modify teammate-owned files.

## Prebuilt Python packages

The dev/test-only packages are pinned as pytest 8.4.2, Hypothesis 6.170.15, and jsonschema 4.25.1. The generated requirements.lock also pins transitive dependencies and package hashes. No Python dependency is required by the JavaScript Kordi extension.

Use isolated Python 3.12 environments on each Mac:

    uv venv --python 3.12 .venv-redteam
    uv pip sync --python .venv-redteam/bin/python redteam/requirements.lock
    .venv-redteam/bin/python -m pytest redteam/tests -q
    npm test

The independent Python reference compares results against the JS scorer via a local JSONL stdin/stdout child process. Hypothesis generates 120 reproducible input vectors with 1–32 decisions, including abstention cases. The Node stress test runs 20,000 seeded synthetic cases. These are not Kordi cloud requests.

## Parallel local run

To also test the real local Kordi JSON-RPC host, set the KORDI_PLUGIN_HOST environment variable to an absolute local path to the Kordi source file agent/crates/plugin-host/js/host.js. It must point to a *file*, not a hosted service.

    KORDI_PLUGIN_HOST=/path/to/Kordi/agent/crates/plugin-host/js/host.js \
      .venv-redteam/bin/python redteam/run_lanes.py \
      --label magicPRO --output redteam/receipts/magicpro-run-1.json

Use magicSTUDIO and a unique output filename for the second Mac. The runner refuses to overwrite any prior receipt. In CI, if a real host is not provided, the host integration step is NOT_TESTED and overall status is PARTIAL rather than PASS.

The four lanes execute concurrently, each with its own subprocesses:

| Lane | Checks | Boundaries |
| --- | --- | --- |
| Tool | Node unit/stress + Python/JS differential + schema/LOMO | Actual morality cannot be computed |
| Plugin | Direct extension adapter; optional actual local Kordi RPC host | Not a signed-in app or hosted cloud test |
| Skill | Frontmatter, abstention, scope and permission language | Static check only, no LLM instruction-following |
| Agent | Opt-in, non-autonomous agent instructions and prompt language | Static check only, no autonomous worker instantiated |

## Predecessor failure record — retain

The FIRST red-team execution against the original canonical main commit 4bde9731e0e32a68d7174590e78bbdb6cc906099 produced **4 failed and 30 passed**:

- FAIL: unexpected top-level property was accepted by the JS scorer although plugin input schema rejects it.
- FAIL: unexpected decision-item property was accepted by the scorer although plugin input schema rejects it.
- FAIL: non-BMP Unicode evidence length used JavaScript UTF-16 code units, inconsistent with JSON Schema Unicode code-point length.
- FAIL (test-spec defect): standard JSON Schema cannot require distinct IDs across separate objects solely based on their ID property. The actual scorer did reject duplicate IDs; its uniqueness rule is now tested separately.

The first attempted successor patch inserted incorrectly escaped JS template literals and caused a local syntax failure (three Node test modules failed to load). This local implementation error was corrected, then tests rerun; it is not evidence of a Kordi product failure. These negative results are preserved rather than overwritten.

Successor changes reject unknown keys and use code-point counting for evidence, with JS regression tests for these boundaries. The duplicate-ID test is independent of JSON Schema.

## Red-team scenarios

- Leave-one-field-out (LOMO): individually remove evidence, law/chaos, or good/evil scoring and require UNKNOWN.
- Evidence injection: textual instructions to escalate privileges must not change deterministic classification. Whether an LLM obeys the malicious text is NOT_TESTED.
- Inputs: disallowed fields, malformed scopes, invalid IDs, duplicate IDs, oversized/nonfinite scores, non-string evidence.
- Differential reference: Python independently classifies the nine labels for explicit score vectors; JS results must agree.
- Teammate compatibility: check published tool and prompt contracts, never rewrite their files.

## Provenance and safety

The parallel runner records the executed Git working head, local checks, and a SHA-256 of a canonically declared set of source files and their exact bytes (domain separator, lexically sorted relative UTF-8 paths, big-endian byte lengths). This is a **manifest checksum**, not a Merkle root, proof of causation or live agent reliability.

Never upload tokens, production chat transcripts, raw provider errors, or private configuration. Do not hit kordi.ai, use the signed-in Kordi app, or attempt to bypass HTTP 403 authorization failures. Keep receipt files append-only and avoid reusing output names.
