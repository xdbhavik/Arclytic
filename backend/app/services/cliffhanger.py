"""
Cliffhanger Strength Scorer service.

Scores each episode ending on four dimensions:
tension, stakes, surprise, and curiosity.
"""

from __future__ import annotations

import logging
from typing import List

from app.models import CliffhangerScore, Episode
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """\
You are a screenwriting analyst evaluating cliffhanger effectiveness
at the end of short-form vertical video episodes (~90 seconds each).

For each episode provided, score the following dimensions from 0 to 10:
  • tension   – how much unresolved tension remains
  • stakes    – how high the personal/narrative stakes feel
  • surprise  – how unexpected or twisty the ending is
  • curiosity – how strong the "what happens next?" gap is

Also provide a 2–3 sentence explanation for each score.

Respond ONLY with valid JSON in this exact schema:
{
  "scores": [
    {
      "episode_id": <int>,
      "tension": <float>,
      "stakes": <float>,
      "surprise": <float>,
      "curiosity": <float>,
      "explanation": "<string>"
    },
    ...
  ]
}
"""

# Weighted-sum coefficients
_W_TENSION = 0.3
_W_STAKES = 0.3
_W_SURPRISE = 0.2
_W_CURIOSITY = 0.2


def score(
    episodes: List[Episode],
    llm: LLMClient,
) -> List[CliffhangerScore]:
    """Score cliffhanger strength for every episode."""
    results: List[CliffhangerScore] = []

    if not episodes:
        return []

    user_prompt = "Please evaluate the following cliffhangers:\n\n"
    for ep in episodes:
        user_prompt += (
            f"--- EPISODE {ep.id} ---\n"
            f"Title: {ep.title}\n"
            f"Summary: {ep.summary}\n"
            f"Hook / final line: \"{ep.hook}\"\n\n"
        )

    try:
        raw = llm.generate_json(
            system_prompt=_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )
        scores_list = raw.get("scores", [])
    except Exception as exc:
        logger.warning("Batched cliffhanger scoring failed: %s", exc)
        scores_list = []

    # Map the returned scores by episode_id
    score_map = {item.get("episode_id"): item for item in scores_list}

    for ep in episodes:
        item = score_map.get(ep.id, {})
        tension = _clamp(float(item.get("tension", 5)), 0, 10)
        stakes = _clamp(float(item.get("stakes", 5)), 0, 10)
        surprise = _clamp(float(item.get("surprise", 5)), 0, 10)
        curiosity = _clamp(float(item.get("curiosity", 5)), 0, 10)
        explanation = item.get("explanation", "No explanation provided.")

        total = round(
            _W_TENSION * tension
            + _W_STAKES * stakes
            + _W_SURPRISE * surprise
            + _W_CURIOSITY * curiosity,
            2,
        )

        results.append(CliffhangerScore(
            episode_id=ep.id,
            tension=round(tension, 1),
            stakes=round(stakes, 1),
            surprise=round(surprise, 1),
            curiosity=round(curiosity, 1),
            total=round(total, 1),
            explanation=explanation,
        ))

    return results


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))
