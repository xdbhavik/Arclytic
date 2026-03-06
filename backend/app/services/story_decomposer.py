"""
Story Decomposer service.

Turns a short story idea into a structured 5–8 episode arc,
each episode ~90 seconds split into 6 × 15-second blocks.
"""

from __future__ import annotations

import json
import logging
from typing import List, Optional

from app.models import Block, Episode
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """\
You are a vertical-video storytelling assistant.
Your job is to decompose a short story idea into a series of episodes suitable
for 90-second vertical video episodes.

Rules:
- Each episode must have exactly 6 blocks of 15 seconds each (0-15, 15-30, 30-45, 45-60, 60-75, 75-90).
- Each block's text should be 30-37 words (roughly 180-220 words per episode total).
- The arc should feel complete yet leave viewers wanting more at the end of each episode.
- The final block of each episode must serve as a hook / cliffhanger.

Respond ONLY with valid JSON matching this schema:
{
  "episodes": [
    {
      "id": <int>,
      "title": "<string>",
      "summary": "<string>",
      "key_events": ["<string>", ...],
      "hook": "<string – the final block text>",
      "blocks": [
        {"start_s": 0, "end_s": 15, "text": "..."},
        ...
      ]
    }
  ]
}
"""


def decompose(
    story_idea: str,
    target_episodes: int,
    genre_hint: Optional[str],
    llm: LLMClient,
) -> List[Episode]:
    """Decompose *story_idea* into *target_episodes* episodes."""

    user_prompt = (
        f"Story idea:\n{story_idea}\n\n"
        f"Number of episodes: {target_episodes}\n"
    )
    if genre_hint:
        user_prompt += f"Genre: {genre_hint}\n"

    raw = llm.generate_json(
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        schema_description="List of Episode objects",
    )

    episodes_data = raw.get("episodes", [])

    # Validate and parse through Pydantic
    episodes: List[Episode] = []
    for ep_raw in episodes_data:
        try:
            blocks = [Block(**b) for b in ep_raw.get("blocks", [])]
            ep = Episode(
                id=ep_raw["id"],
                title=ep_raw["title"],
                summary=ep_raw["summary"],
                key_events=ep_raw.get("key_events", []),
                hook=ep_raw.get("hook", blocks[-1].text if blocks else ""),
                blocks=blocks,
            )
            episodes.append(ep)
        except Exception as exc:
            logger.warning("Skipping malformed episode: %s", exc)

    # If we got nothing useful, the caller should fall back to demo data
    if not episodes:
        logger.info("No episodes produced; caller should use demo data.")

    return episodes
