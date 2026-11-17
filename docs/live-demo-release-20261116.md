# Research Alignment Quest public live-demo release

Status: IMPLEMENTED in the Studio fallback branch; deployed/promotion status requires separate Vercel receipt.

## Scope and provenance

- This release extends the canonical Kordi Alignment Compass web preview. It does not modify upstream Kordi-AI/Kordi or its services.
- Adds a separate 12-scenario Research Alignment Quest, deterministic scoring and synthetic comparison.
- Provides exact copyable skill and agent Markdown, a tool invocation payload, plugin extension source, installation instructions, and a Kordi room-host instruction prompt.
- Retains the original Compass browser scorer and its explicit UNKNOWN cases.
- Adds explicit consent for one-click sharing and comparison. A local SHA-256 card receipt contains no card body. No account, cloud persistence or analytics is provided.
- The Studio fallback Quest implementation is different from the user-uploaded latest (2) ZIP. That original delivery was staged, enhanced and browser-tested on magicPRObox earlier in this turn; its uncommitted Pro files are preserved separately while Pro's Tailscale connection is offline.

## Authority and limitations

- Tool/plugin/agent/skill prompts are examples and source instructions, not evidence that any are installed in a signed-in Kordi workspace.
- No real participant cards or messages are included in the public artifact.
- RAQ1 card checksums are not identity authentication or tamper-resistant signatures.
- This project cannot grant permission, infer stable personality traits, or classify actual people for hiring or exclusion.
- The local browser suite uses synthetic people only. Live native Kordi skill, plugin and cloud behavior remain NOT_TESTED.

## PR provenance

- #1 tool red-team: open at initial verification, pending review.
- #7 team-review docs: open at initial verification, pending review.
- #8 metaprompting design: open at initial verification, pending human owner review.
- #9 static Compass preview: merged.
- Release PR #10: https://github.com/biobitworks/kordi-alignment/pull/10 (created from commit 5cb00299ac93253b9923375c8dc3b77d49c434b5; merge state to be verified separately).

## Verification contract

Run:
- node scripts/build-web.cjs
- node scripts/build-room-web.cjs
- node --test test/*.test.cjs
- E2E_URL=http://127.0.0.1:4182/ node scripts/browser-quest-e2e.mjs

Browser suite requires macOS Chrome on the execution host. It does not connect to Kordi production. An HTTP response alone is not an end-to-end test.

## TURN_BREAKPOINT
ID: KORDI-DEMO-STUDIO-R004
PARENT: KORDI-MAGICPRO-LOCAL-R003
VERIFIED_NEW: local Chrome 12-scenario room Quest and four prompt kit after independent test
EXECUTED: local Node suite, local headless Chrome; see separately recorded receipts
OBSERVED: no external inference in static web preview; retained original Compass
DECISIONS: isolate Studio fallback instead of resetting uncommitted magicPRObox files
PROPOSED: full native Kordi installation and integration validation after consent
NOT_TESTED: signed-in Kordi and magicPRObox R002 deployment after Pro disconnect
FAILURES: Pro dropped remote connection during PR assertion investigation
UNRESOLVED: PR approval gates, public deployed build E2E, future host portability
NEXT_ACTION: commit, run CI, publish Vercel, independently test public URL

## Successor browser-copy verification

- A stricter headless macOS browser test attempted physical clipboard readback for all four copy buttons. Observed four FALSE comparisons; OS clipboard readback in headless automation is NEGATIVE, not proof that manual desktop copy fails. Retain this predecessor outcome.
- Successor E2E instruments the clipboard `writeText` API in the page and verifies the exact four source strings passed through click handlers. This tests payload/handler wiring, not actual OS clipboard paste.
- Page fallback now selects the text and attempts `document.execCommand('copy')`; when blocked the UI instructs manual Command+C/Ctrl+C. Manual physical paste from a real browser remains NOT_TESTED.
