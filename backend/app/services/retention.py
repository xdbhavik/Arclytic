"""
Retention Risk Predictor service.

Estimates viewer drop-off risk at each 15-second block within a
90-second episode using emotion intensity, novelty (embedding similarity),
and narrative status.
"""

from __future__ import annotations

import logging
from typing import List

import numpy as np

from app.models import (
    EmotionalEpisode,
    Episode,
    RetentionBlock,
    RetentionEpisode,
)
from app.services.nlp_client import NLPClient

logger = logging.getLogger(__name__)

# Emotions considered "high-arousal" → lower drop-off risk
_HIGH_AROUSAL = {"fear", "surprise", "anger", "excitement", "anticipation"}


def predict(
    episodes: List[Episode],
    emotional_arc: List[EmotionalEpisode],
    nlp: NLPClient,
) -> List[RetentionEpisode]:
    """Predict retention risk for every block of every episode."""
    # Index emotional data by episode_id for quick lookup
    emo_map = {e.episode_id: e for e in emotional_arc}

    results: List[RetentionEpisode] = []

    for ep in episodes:
        emo_ep = emo_map.get(ep.id)
        blocks_out: List[RetentionBlock] = []

        # Pre-compute embeddings for novelty scoring
        embeddings = [nlp.embed(block.text) for block in ep.blocks]

        # Label narrative status per block
        statuses = [nlp.label_narrative_status(block.text) for block in ep.blocks]

        # Check for early resolution (resolution before 60s = block index < 4)
        early_resolution = any(
            statuses[i] == "resolution" and ep.blocks[i].start_s < 60
            for i in range(len(statuses))
        )

        consecutive_low = 0  # track consecutive low-intensity

        for i, block in enumerate(ep.blocks):
            risk = 0.5  # base risk

            # --- Emotion intensity adjustment ---
            if emo_ep and i < len(emo_ep.blocks):
                intensity = emo_ep.blocks[i].intensity
                emotion = emo_ep.blocks[i].emotion

                if intensity < 0.3 and emotion not in _HIGH_AROUSAL:
                    risk += 0.2
                    consecutive_low += 1
                else:
                    consecutive_low = 0

                if emotion in _HIGH_AROUSAL and intensity >= 0.5:
                    risk -= 0.1
            else:
                consecutive_low += 1

            # --- Consecutive low-intensity penalty ---
            if consecutive_low >= 2:
                risk += 0.1

            # --- Novelty adjustment (embedding similarity) ---
            novelty = _compute_novelty(embeddings, i)
            if novelty < 0.3:
                risk += 0.15  # very similar to prior blocks
            elif novelty > 0.7:
                risk -= 0.1  # fresh content

            # --- Narrative status adjustment ---
            status = statuses[i]
            if status in ("reveal", "cliffhanger_buildup"):
                risk -= 0.2
            elif status == "conflict":
                risk -= 0.05

            # --- Early resolution penalty ---
            if early_resolution and block.start_s >= 60:
                risk += 0.2

            # Clamp to [0, 1]
            risk = max(0.0, min(1.0, round(risk, 3)))

            blocks_out.append(RetentionBlock(
                start_s=block.start_s,
                end_s=block.end_s,
                risk=risk,
            ))

        results.append(RetentionEpisode(
            episode_id=ep.id,
            blocks=blocks_out,
        ))

    return results


def _compute_novelty(embeddings: List[np.ndarray], current_idx: int) -> float:
    """
    Novelty = 1 − max(cosine_similarity with any earlier block).
    First block always gets novelty = 1.0.
    """
    if current_idx == 0 or not embeddings:
        return 1.0

    current = embeddings[current_idx]
    max_sim = 0.0

    for j in range(current_idx):
        prev = embeddings[j]
        dot = float(np.dot(current, prev))
        norm_product = float(np.linalg.norm(current) * np.linalg.norm(prev))
        if norm_product > 0:
            sim = dot / norm_product
            max_sim = max(max_sim, sim)

    return round(1.0 - max_sim, 3)
