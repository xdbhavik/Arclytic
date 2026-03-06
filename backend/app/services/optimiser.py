"""
Optimisation Suggestion Engine.

Collects issues (flat zones, high risk blocks, weak cliffhangers) and
generates actionable improvement suggestions per episode via the LLM.
"""

from __future__ import annotations

import logging
from typing import List

from app.models import (
    CliffhangerScore,
    EmotionalEpisode,
    Episode,
    RetentionEpisode,
    Suggestion,
)
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """\
You are a vertical-video story optimisation consultant.
Given a list of episodes with their summaries, hooks, and detected issues,
provide 3–5 concrete, actionable suggestions for EACH episode to improve viewer engagement.
Optionally suggest an improved hook line for each episode.

Constraints:
- Keep each episode within 90 seconds.
- Preserve core story beats and continuity.

Respond ONLY with valid JSON in this exact schema:
{
  "results": [
    {
      "episode_id": <int>,
      "suggestions": ["<string>", ...],
      "alternative_hook": "<string or null>"
    },
    ...
  ]
}
"""

_HIGH_RISK_THRESHOLD = 0.7
_WEAK_CLIFFHANGER_THRESHOLD = 6.0


def suggest(
    episodes: List[Episode],
    emotional_arc: List[EmotionalEpisode],
    cliffhangers: List[CliffhangerScore],
    retention_risk: List[RetentionEpisode],
    llm: LLMClient,
) -> List[Suggestion]:
    """Generate improvement suggestions for every episode."""
    emo_map = {e.episode_id: e for e in emotional_arc}
    cliff_map = {c.episode_id: c for c in cliffhangers}
    ret_map = {r.episode_id: r for r in retention_risk}

    results: List[Suggestion] = []

    if not episodes:
        return []

    user_prompt = "Please provide suggestions for the following episodes:\n\n"

    for ep in episodes:
        issues: List[str] = []

        # Flat zones
        emo = emo_map.get(ep.id)
        if emo and emo.flat_zones:
            for fz in emo.flat_zones:
                issues.append(
                    f"Flat emotional zone at {fz['start_s']}–{fz['end_s']}s "
                    f"({fz['duration_s']}s of low intensity)."
                )

        # High-risk blocks
        ret = ret_map.get(ep.id)
        if ret:
            for rb in ret.blocks:
                if rb.risk > _HIGH_RISK_THRESHOLD:
                    issues.append(
                        f"High retention risk ({rb.risk:.0%}) at {rb.start_s}–{rb.end_s}s."
                    )

        # Weak cliffhanger
        cliff = cliff_map.get(ep.id)
        if cliff and cliff.total < _WEAK_CLIFFHANGER_THRESHOLD:
            issues.append(
                f"Weak cliffhanger (score {cliff.total}/10). "
                f"Dimensions: tension={cliff.tension}, stakes={cliff.stakes}, "
                f"surprise={cliff.surprise}, curiosity={cliff.curiosity}."
            )

        user_prompt += (
            f"--- EPISODE {ep.id} ---\n"
            f"Title: \"{ep.title}\"\n"
            f"Summary: {ep.summary}\n"
            f"Current hook: \"{ep.hook}\"\n"
            f"Detected issues:\n"
        )
        if issues:
            user_prompt += "\n".join(f"- {iss}" for iss in issues) + "\n\n"
        else:
            user_prompt += "- No major issues detected; suggest polish-level improvements.\n\n"

    try:
        raw = llm.generate_json(
            system_prompt=_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )
        results_list = raw.get("results", [])
    except Exception as exc:
        logger.warning("Batched suggestion generation failed: %s", exc)
        results_list = []

    result_map = {item.get("episode_id"): item for item in results_list}

    for ep in episodes:
        item = result_map.get(ep.id, {})
        suggestions_list = item.get("suggestions", [
            "Consider varying the emotional intensity across blocks.",
            "Strengthen the hook with a more visceral image or question.",
            "Add a ticking-clock element to build urgency.",
        ])
        alt_hook = item.get("alternative_hook", None)

        results.append(Suggestion(
            episode_id=ep.id,
            suggestions=suggestions_list,
            alternative_hook=alt_hook,
        ))

    return results
