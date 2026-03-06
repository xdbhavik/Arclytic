"""
Emotional Arc Analyser service.

Classifies emotions per 15-second block and detects flat engagement zones.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from app.models import EmotionalBlock, EmotionalEpisode, Episode
from app.services.nlp_client import NLPClient

logger = logging.getLogger(__name__)


def analyse(
    episodes: List[Episode],
    nlp: NLPClient,
) -> List[EmotionalEpisode]:
    """Run emotion classification on every block of every episode."""
    results: List[EmotionalEpisode] = []

    for ep in episodes:
        blocks: List[EmotionalBlock] = []
        for block in ep.blocks:
            emotion, intensity = nlp.classify_emotion(block.text)
            blocks.append(EmotionalBlock(
                start_s=block.start_s,
                end_s=block.end_s,
                emotion=emotion,
                intensity=round(intensity, 3),
            ))

        flat_zones = _detect_flat_zones(blocks)
        summary = _generate_summary(ep.id, blocks, flat_zones)

        results.append(EmotionalEpisode(
            episode_id=ep.id,
            blocks=blocks,
            flat_zones=flat_zones,
            summary=summary,
        ))

    return results


def _detect_flat_zones(blocks: List[EmotionalBlock]) -> List[Dict[str, Any]]:
    """
    A flat zone is 2+ consecutive blocks with intensity < 0.3
    (i.e. ≥ 30 seconds of low engagement).
    """
    zones: List[Dict[str, Any]] = []
    streak_start: int | None = None
    streak_count = 0

    for i, b in enumerate(blocks):
        if b.intensity < 0.3:
            if streak_start is None:
                streak_start = i
            streak_count += 1
        else:
            if streak_count >= 2 and streak_start is not None:
                zones.append({
                    "start_s": blocks[streak_start].start_s,
                    "end_s": blocks[streak_start + streak_count - 1].end_s,
                    "duration_s": streak_count * 15,
                    "block_indices": list(range(streak_start, streak_start + streak_count)),
                })
            streak_start = None
            streak_count = 0

    # Check trailing streak
    if streak_count >= 2 and streak_start is not None:
        zones.append({
            "start_s": blocks[streak_start].start_s,
            "end_s": blocks[streak_start + streak_count - 1].end_s,
            "duration_s": streak_count * 15,
            "block_indices": list(range(streak_start, streak_start + streak_count)),
        })

    return zones


def _generate_summary(
    episode_id: int,
    blocks: List[EmotionalBlock],
    flat_zones: List[Dict[str, Any]],
) -> str:
    """Produce a short natural-language summary of the emotional arc."""
    if not blocks:
        return f"Episode {episode_id}: no emotional data available."

    intensities = [b.intensity for b in blocks]
    avg = sum(intensities) / len(intensities)
    peak = max(intensities)
    peak_idx = intensities.index(peak)
    peak_emotion = blocks[peak_idx].emotion

    parts = [
        f"Episode {episode_id} has an average emotional intensity of {avg:.2f}.",
        f"The emotional peak ({peak:.2f}, {peak_emotion}) occurs at {blocks[peak_idx].start_s}–{blocks[peak_idx].end_s}s.",
    ]

    if flat_zones:
        zone_strs = [f"{z['start_s']}–{z['end_s']}s" for z in flat_zones]
        parts.append(
            f"⚠️ Flat zone(s) detected: {', '.join(zone_strs)}. "
            "Consider adding a dramatic beat to sustain viewer attention."
        )
    else:
        parts.append("No significant flat zones detected — engagement should remain steady.")

    # Describe trajectory
    first_half = sum(intensities[:3]) / 3
    second_half = sum(intensities[3:]) / max(len(intensities[3:]), 1)
    if second_half > first_half + 0.1:
        parts.append("The arc trends upward, building toward the episode's end.")
    elif first_half > second_half + 0.1:
        parts.append("The arc trends downward — consider a stronger finish.")
    else:
        parts.append("The arc is relatively flat — vary the pacing for more dynamism.")

    return " ".join(parts)
