#!/usr/bin/env python3
"""Parallel, offline, independent lane red team. No cloud/model-provider calls."""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_FILES = [
    ".gitignore", "AGENTS.md", "src/core.cjs", "extensions/alignment-compass.cjs",
    "skills/alignment-compass/SKILL.md", "agents/alignment-reviewer.md",
    "prompts/alignment-reviewer.md", "test/core.test.cjs", "test/adapter.test.cjs",
    "test/host.test.cjs", "test/stress.test.cjs", "redteam/requirements.in",
    "redteam/requirements.lock", "redteam/reference.py", "redteam/js_bridge.cjs",
    "redteam/fixtures/assess.schema.json", "redteam/tests/conftest.py",
    "redteam/tests/test_tool_differential.py",
    "redteam/tests/test_teammate_contracts.py", "redteam/run_lanes.py",
]
REDACT = re.compile(r"(?:gh[opus]_[A-Za-z0-9]{25,}|sk-[A-Za-z0-9]{24,})")


def fingerprint() -> str:
    """Canonical manifest SHA-256, not a Merkle root.

    Sorted UTF-8 paths: 4-byte BE path length, path, 8-byte BE content length,
    content bytes; preceded by the literal domain separator below.
    """
    h = hashlib.sha256(b"kordi-alignment:redteam-manifest:v1\0")
    for name in sorted(MANIFEST_FILES):
        raw = name.encode("utf-8")
        data = (ROOT / name).read_bytes()
        h.update(len(raw).to_bytes(4, "big"))
        h.update(raw)
        h.update(len(data).to_bytes(8, "big"))
        h.update(data)
    return h.hexdigest()


def run_step(name: str, cmd: list[str], environment: dict[str, str]) -> dict:
    start = time.monotonic()
    try:
        finished = subprocess.run(
            cmd, cwd=ROOT, env=environment, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            timeout=180, check=False,
        )
        output = REDACT.sub("[REDACTED]", finished.stdout or "")
        output = output.replace(str(ROOT), "<REPO>").replace(str(Path.home()), "<HOME>")
        safe_argv = ["python" if arg == sys.executable else arg.replace(str(ROOT), ".")
                     for arg in cmd]
        return {
            "name": name,
            "argv": safe_argv if not name.startswith("plugin-host") else ["npm", "run", "test:integration"],
            "status": "PASS" if finished.returncode == 0 else "FAIL",
            "exit_code": finished.returncode,
            "elapsed_ms": round((time.monotonic() - start) * 1000),
            "output_tail": output[-1800:],
        }
    except subprocess.TimeoutExpired:
        return {
            "name": name, "argv": ["python" if arg == sys.executable else arg for arg in cmd], "status": "FAIL",
            "error": "execution_timeout",
            "elapsed_ms": round((time.monotonic() - start) * 1000),
        }


def run_lane(lane: str, environment: dict[str, str], host: str | None) -> dict:
    py = sys.executable
    steps = {
        "tool": [
            ("node-core", ["node", "--test", "test/core.test.cjs", "test/stress.test.cjs"]),
            ("python-differential", [py, "-m", "pytest", "-q", "redteam/tests/test_tool_differential.py"]),
        ],
        "plugin": [
            ("node-adapter", ["node", "--test", "test/adapter.test.cjs"]),
            ("python-plugin-contract", [py, "-m", "pytest", "-q",
                                         "redteam/tests/test_teammate_contracts.py", "-k", "plugin"]),
        ],
        "skill": [
            ("python-skill-contract", [py, "-m", "pytest", "-q",
                                        "redteam/tests/test_teammate_contracts.py", "-k", "skill"]),
        ],
        "agent": [
            ("python-agent-contract", [py, "-m", "pytest", "-q",
                                        "redteam/tests/test_teammate_contracts.py", "-k", "agent"]),
        ],
    }
    results = [run_step(name, command, environment) for name, command in steps[lane]]
    if lane == "plugin":
        if host and Path(host).is_file():
            results.append(run_step("plugin-host-json-rpc", ["npm", "run", "test:integration"], environment))
        else:
            results.append({
                "name": "plugin-host-json-rpc", "status": "NOT_TESTED",
                "reason": "KORDI_PLUGIN_HOST not provided or absent",
            })
    statuses = [step["status"] for step in results]
    overall = "FAIL" if "FAIL" in statuses else "PASS" if all(s == "PASS" for s in statuses) else "PARTIAL"
    return {"lane": lane, "status": overall, "checks": results}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--label", required=True, choices=["magicPRO", "magicSTUDIO", "CI"])
    parser.add_argument("--output", required=True, help="Unique JSON receipt file location")
    args = parser.parse_args()
    host = os.environ.get("KORDI_PLUGIN_HOST")
    if host and not Path(host).is_file():
        print("KORDI_PLUGIN_HOST is not a file; integration marked NOT_TESTED.", file=sys.stderr)
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["PYTEST_DISABLE_PLUGIN_AUTOLOAD"] = "1"
    start = time.monotonic()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {
            name: pool.submit(run_lane, name, env, host)
            for name in ("tool", "plugin", "skill", "agent")
        }
        lanes = {name: future.result() for name, future in futures.items()}
    status = "FAIL" if any(x["status"] == "FAIL" for x in lanes.values()) else (
        "PASS" if all(x["status"] == "PASS" for x in lanes.values()) else "PARTIAL"
    )
    git_head = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=ROOT,
        check=True, text=True, capture_output=True,
    ).stdout.strip()
    report = {
        "schema": "kordi-alignment.redteam-receipt.v1",
        "execution": "EXECUTED",
        "label": args.label,
        "git_working_head": git_head,
        "manifest_algorithm": "SHA-256 of canonical sorted path/byte manifest, not Merkle",
        "manifest_sha256": fingerprint(),
        "duration_ms": round((time.monotonic() - start) * 1000),
        "overall": status,
        "lanes": lanes,
        "scope": "offline synthetic scoring, adapter, and static instruction checks",
        "not_tested": [
            "Kordi cloud and signed-in production app",
            "LLM response to malicious evidence",
            "ChatGPT-to-Kordi connector",
            "Actual teammate skill/agent activation",
            "403 root-cause remediation",
        ],
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        raise SystemExit("Refusing to overwrite an existing receipt: " + str(output))
    output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    print(json.dumps({
        "receipt": str(output), "overall": status,
        "manifest_sha256": report["manifest_sha256"],
        "lanes": {key: value["status"] for key, value in lanes.items()},
        "checks": {
            key: [(step["name"], step["status"]) for step in value["checks"]]
            for key, value in lanes.items()
        },
    }, indent=2))
    return 1 if status == "FAIL" else 0


if __name__ == "__main__":
    raise SystemExit(main())
