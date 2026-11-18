# Licensing and searchable provenance

**Verified declaration on the audit predecessor:** This repository's `LICENSE` and `package.json` declare **MIT** for its software and associated documentation, with `Copyright (c) 2026 BioBitWorks contributors`. The license grant is unchanged by this audit.

The independent project is developed against Kordi interfaces. The upstream [Kordi-AI/Kordi](https://github.com/Kordi-AI/Kordi) source and the [biobitworks/Kordi](https://github.com/biobitworks/Kordi) fork carry **their own MIT LICENSE and 2025–2026 Kordi Contributors copyright notice**. Keep that notice when distributing their source. This document does not claim that the Kordi Alignment repository is a complete fork of upstream Kordi or that all third-party rights were reviewed.

## Scope; original content versus software

The general Biobitworks/Cellico default for separately owned original research, media and other content is **CC BY-NC-ND 4.0**, except where an explicit alternate license applies. **It does not replace this repository's explicit MIT license.** A future subset of independently owned non-software assets could receive its own separately scoped CC notice after authorship, component and third-party clearance. No blanket CC assignment, restrictive relicensing, or retroactive removal of MIT rights is performed here.

The Dungeons & Dragons alignment reference is a conceptual taxonomy; this package does not claim ownership of outside trademarks, publications, historical excerpts or third-party components. Assets imported from elsewhere require asset-by-asset review before distribution. The audit has not tested nested dependencies, participant contributions, historical files or every license in the broader portfolio.

## Search and recompute

- **Human-readable grant:** [LICENSE](LICENSE)
- **Machine-readable public evidence:** [LICENSE-PROVENANCE.json](LICENSE-PROVENANCE.json)
- **Lookup key:** find the exact `license_search_key` in that JSON. It contains the repository path and SHA-256 of the observed LICENSE bytes.
- **Merkle evidence:** `source_records[].sha256`, `source_records[].leaf_sha256`, `source_records[].inclusion_proof`, and `license_root_sha256`. These are computed on exact bytes of `LICENSE` and `package.json` using the documented domain-separated preimages.
- **Reproducible gate:** `node scripts/license-proof.cjs --verify` compares the committed proof to newly recomputed bytes. `--write` is for a reviewed successor if the source declarations change.

```sh
node scripts/license-proof.cjs --verify
npm run test:license
```

The `predecessor_main_commit_sha` identifies the preceding main state. It is **not** represented as the revision containing the new `package.json` bytes. The generated proof records the exact source bytes in this successor worktree and intentionally excludes its own future commit from the hash input, avoiding a self-referential digest. Its source hashes can be verified on subsequent commits while the audited source bytes remain unchanged.

**Key semantics:** The lookup key is a search identifier, **not a public-key fingerprint or digital signature**. `signing_public_key_id=NOT_COMPUTED` and `signature_verified=NOT_TESTED` are intentionally retained. Hashes and Merkle inclusion prove record integrity under these rules, not ownership or legal permission.

## Portfolio separation

The portfolio audit for all accessible `biobitworks` repositories, including private ones, is stored on the authorized local workstation, not in this public repository. This repo's public license proof does **not** leak its inventory or claim portfolio-wide clearance. Absence of a root LICENSE does not establish a lack of licensing terms: nested licenses, history, contributor agreements and code origins may still govern reuse.
