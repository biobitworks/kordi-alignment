#!/usr/bin/env python3
"""Validate one proposed Kordi skill metaprompt contract.

Development-only: requires jsonschema. This program never contacts Kordi,
executes a skill, assigns scores, or changes production configuration.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

try:
    from jsonschema import Draft202012Validator
except ImportError as exc:
    raise SystemExit(
        "jsonschema is a development-only dependency; use an isolated Python "
        "environment and install jsonschema==4.25.1 before validating."
    ) from exc


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "proposal", nargs="?", default="meta/examples/alignment-review.spec.json",
        help="Path to proposed skill contract (not an installed Kordi skill)."
    )
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    schema = json.loads((root / "meta/skill-contract.schema.json").read_text("utf-8"))
    proposal = json.loads(Path(args.proposal).read_text("utf-8"))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(proposal), key=lambda err: str(err.path))
    if errors:
        for error in errors:
            print("FAIL at " + ".".join(str(p) for p in error.path) + ": " + error.message, file=sys.stderr)
        return 1
    print("PASS: proposed skill contract shape. Not a runtime skill test.")
    print("skill_id=", proposal["skill_id"], "status=", proposal["status"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
