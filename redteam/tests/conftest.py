from pathlib import Path
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "redteam"))
CORE_BRIDGE = ROOT / "redteam" / "js_bridge.cjs"
SCHEMA = json.loads((ROOT / "redteam" / "fixtures" / "assess.schema.json").read_text())


def run_cases(payloads):
    """Send multiple JSON requests to one fresh local Node child process."""
    input_text = "".join(json.dumps(case, ensure_ascii=False, allow_nan=False) + "\n" for case in payloads)
    completed = subprocess.run(
        ["node", str(CORE_BRIDGE)],
        input=input_text,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=15,
        check=True,
        cwd=ROOT,
    )
    assert not completed.stderr, completed.stderr
    results = [json.loads(line) for line in completed.stdout.splitlines()]
    assert len(results) == len(payloads)
    return results
