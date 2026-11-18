# Kordi Alignment Compass

An independent, opt-in framework for **tool + plugin + skill + agent add-on** in Kordi. It uses the classic nine **Dungeons & Dragons-inspired** alignments as a transparent decision-discussion taxonomy, not as a safety policy, personality diagnosis, or moral judgment.

**Canonical development repository:** [biobitworks/kordi-alignment](https://github.com/biobitworks/kordi-alignment). This repository is the source of truth for this project; upstream Kordi contributions are downstream exports and require separate review.

## Architecture

| Component | Path | Interface | Current scope |
| --- | --- | --- | --- |
| Scoring tool | `src/core.cjs` | `assess({scope,items})` | Offline deterministic classification |
| Kordi plugin | `extensions/alignment-compass.cjs` | `alignment_compass` and `/alignment` | JS extension adapter; no network calls |
| Kordi skill | `skills/alignment-compass/SKILL.md` | Kordi-compatible YAML frontmatter | Prompt-driven, on-demand decision analysis |
| Agent add-on | `agents/alignment-reviewer.md`, `prompts/alignment-reviewer.md` | Optional reviewer instruction profile | Not a continuously running/deployed agent |
| Facilitator request | `docs/facilitator-prompt.md` | Paste into a Kordi group chat | Requests review; no automatic sends |

The package has no runtime dependencies or network calls. It needs Node.js 22+ for development tests. Kordi reads the `kordi` field in `package.json` to discover extension/skill/prompt directories after installation into a supported development agent runtime.

## How alignment is computed

The caller supplies evidence and two numeric scores between -2 and +2 for each *specific decision*:

- `lawChaos`: +2 favors ordered rules; -2 favors spontaneity and individual discretion.
- `goodEvil`: +2 emphasizes care and shared benefit; -2 emphasizes narrower self-interest or externalized harm.
- Scores of magnitude less than 0.5 are Neutral on that axis. Both Neutral yields **True Neutral**.
- **UNKNOWN** is the required result when either score or evidence is missing. It must not be confused with True Neutral.

The taxonomy is a narrative heuristic; score assignment is subjective and must remain attributable to the human caller. It is not used to control agent tool access, grade users, or evaluate protected characteristics.

## Example

```json
{
  "scope": "agent_decision",
  "items": [
    {
      "id": "approval-before-write",
      "lawChaos": 2,
      "goodEvil": 1,
      "evidence": ["The proposed file change required explicit human approval."]
    },
    { "id": "insufficient-evidence" }
  ]
}
```

```sh
node -e 'const {assess}=require("./src/core.cjs"); console.log(assess({scope:"fictional",items:[{id:"example",lawChaos:2,goodEvil:1,evidence:["Synthetic example"]}]}))'
```

Expected labels: **Lawful Good** and **UNKNOWN**.

## Development and tests

```sh
npm test                  # Offline unit, tool, adapter-contract, stress tests
npm run test:stress       # 20,000 seeded synthetic cases
npm run test:integration  # Requires the real Kordi plugin host (see below)
```

To test against the *real* Kordi plugin-host protocol in a separate local development checkout:

```sh
KORDI_PLUGIN_HOST="/path/to/Kordi/agent/crates/plugin-host/js/host.js" npm run test:integration
```

Check the test report for zero skips. Integration sends 150 concurrent synthetic calls to a local child process; it does not sign in or contact Kordi's production service.

## Install in an isolated Kordi environment

From a development project using a source-built Kordi CLI:

```sh
kordi install --local /path/to/kordi-alignment
kordi list --local
```

Or load only the extension with `kordi -e /path/to/kordi-alignment/extensions/alignment-compass.cjs`. The group/chat agent and product Kordi app are **not** automatically changed by this installation. Never use the signed-in production Kordi profile for testing; follow the upstream [development isolation instructions](https://github.com/Kordi-AI/Kordi/blob/main/docs/development-environments.md).

## Status and provenance

- **IMPLEMENTED:** Pure scoring tool, Kordi plugin adapter, skill, opt-in reviewer prompt, synthetic tests, documentation.
- **EXECUTED:** Test runs are recorded by each execution; a source commit alone is not evidence of test results.
- **NOT_TESTED:** Production Kordi agent use, team-wide facilitator integration, live cloud runner, ChatGPT-to-Kordi connector.
- **UNKNOWN:** Whether existing Kordi 403 responses arise from provider policy, account authorization, or cloud membership. No credentials are stored here.

Review the [four-component PR plan](docs/pr-plan.md) before exporting to upstream. Maintain separate origin, source commit, executed command, and observed result for any later promotion.

## Licensing and attribution

The repository's explicit MIT grant and its independently reproducible license evidence are documented in [LICENSING.md](LICENSING.md) and the searchable [LICENSE-PROVENANCE.json](LICENSE-PROVENANCE.json). A private portfolio-wide Merkle inventory remains local and is not included in this public repository.

MIT licensed. Independent implementation inspired by the [D&D alignment overview](https://en.wikipedia.org/wiki/Alignment_(Dungeons_%26_Dragons)) and [EasyDamus examples](https://easydamus.com/alignment.html); third-party text or images are not copied. Not affiliated with or endorsed by Wizards of the Coast.
