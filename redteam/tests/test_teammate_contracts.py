"""Read-only teammate boundary checks; no runtime, deployment or behavioral claims."""
from pathlib import Path
import re

import pytest

from conftest import ROOT

COMPONENTS = {
    "plugin": ["extensions/alignment-compass.cjs", "package.json"],
    "skill": ["skills/alignment-compass/SKILL.md"],
    "agent": ["agents/alignment-reviewer.md", "prompts/alignment-reviewer.md"],
}


@pytest.mark.parametrize("lane", list(COMPONENTS))
def test_teammate_files_present_and_source_linked(lane):
    for file in COMPONENTS[lane]:
        assert (ROOT / file).is_file(), f"{lane}: missing {file}"


def test_plugin_schema_defers_missing_axes_to_unknown():
    plugin = (ROOT / "extensions/alignment-compass.cjs").read_text()
    assert "registerTool" in plugin
    assert "registerCommand" in plugin
    assert "alignment_compass" in plugin
    assert "required: ['id']" in plugin
    assert "assess(args)" in plugin


def test_skill_includes_abstention_and_non_enforcement_contract():
    skill = (ROOT / "skills/alignment-compass/SKILL.md").read_text()
    assert re.search(r"(?m)^name: alignment-compass$", skill)
    assert "UNKNOWN" in skill
    assert "permissions" in skill
    assert "person" in skill.lower()


def test_agent_addon_is_opt_in_not_autonomous():
    agent = (ROOT / "agents/alignment-reviewer.md").read_text().lower()
    prompt = (ROOT / "prompts/alignment-reviewer.md").read_text()
    assert "explicit user opt-in" in agent
    assert "does not install an autonomous background agent" in agent
    assert "UNKNOWN" in prompt
    assert "authorization" in prompt.lower()


def test_no_runtime_import_of_teammate_instructions_by_scoring_tool():
    core = (ROOT / "src/core.cjs").read_text()
    for term in ("require('..", "require(\"..", "fetch(", "exec(", "spawn(", "process.env"):
        assert term not in core, f"unexpected tool dependency: {term}"
