"""Independent, offline Python reference oracle for explicitly supplied scores.

It is intentionally not an implementation of the Kordi adapter.
Only well-formed JSON-domain inputs are passed here; input validity is handled
independently by the JSON Schema and JavaScript core.
"""
from collections import Counter

LABELS = {
    "lawChaos": ("Chaotic", "Neutral", "Lawful"),
    "goodEvil": ("Evil", "Neutral", "Good"),
}


def axis(value: float, name: str) -> str:
    negative, neutral, positive = LABELS[name]
    if value <= -0.5:
        return negative
    if value >= 0.5:
        return positive
    return neutral


def classify(item: dict) -> str | None:
    if (
        "lawChaos" not in item
        or "goodEvil" not in item
        or not item.get("evidence")
    ):
        return None
    law = axis(item["lawChaos"], "lawChaos")
    ethic = axis(item["goodEvil"], "goodEvil")
    if (law, ethic) == ("Neutral", "Neutral"):
        return "True Neutral"
    return f"{law} {ethic}"


def assess(items: list[dict]) -> dict:
    labels = [classify(item) for item in items]
    summary = dict(Counter(label or "UNKNOWN" for label in labels))
    return {
        "alignments": labels,
        "total": len(labels),
        "scored": sum(label is not None for label in labels),
        "unknown": sum(label is None for label in labels),
        "countByAlignment": summary,
    }
