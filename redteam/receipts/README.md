# Append-only red-team execution receipts

These are execution observations of synthetic local fixtures. They do not establish safety of any LLM, moral validity, production correctness, or a fix for HTTP 403.

- Initial 4 FAIL / 30 PASS baseline against the original main tool was observed before the input and Unicode parity changes; see redteam/README.md.
- A temporary incorrectly escaped edit failed to parse locally; corrected in the next source revision (recorded in redteam/README.md).
- magicpro-run-1.json: predecessor passing run with still-malformed gitignore (fingerprint ee43da7c7f5451c1d736313f9a4fc8b83f6bdac51f1417d00f2b8dc5e216e967); this run preceded the gitignore follow-up commit.
- magicpro-run-2.json and magicstudio-run-1.json: independent same-source tests against commit 85707837af7b18f98b2d7d33891c5b95b9d42c34; SHA-256 manifest dd4f53cfbedfed822b1b0c051bfab0dd06199bd88364d8c64886be013a7ac23d. Both observed all four lanes PASS. Plugin host was local, while skill and agent checks were static.

Manifest SHA-256 uses the exact declared list, length-prefixed UTF-8 paths and file bytes in redteam/run_lanes.py. Hashes identify bytes; they are neither a Merkle root nor evidence that downstream LLM outputs are correct.

Receipts preserve predecessor outcomes; create a new filename for each successor run. Do not overwrite or alter prior receipts.
