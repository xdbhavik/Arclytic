"""
NLP Client abstraction layer.

Provides emotion classification, text embedding, and narrative-status
labelling.  The default *DemoNLPClient* uses keyword heuristics
so the app runs without any ML model installation.
"""

from __future__ import annotations

import hashlib
import logging
import math
from abc import ABC, abstractmethod
from typing import Tuple

import numpy as np

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Base interface
# ---------------------------------------------------------------------------

class NLPClient(ABC):
    """Abstract base for NLP capabilities."""

    @abstractmethod
    def classify_emotion(self, text: str) -> Tuple[str, float]:
        """Return (emotion_label, intensity) where intensity ∈ [0, 1]."""
        ...

    @abstractmethod
    def embed(self, text: str) -> np.ndarray:
        """Return a dense vector embedding for the text."""
        ...

    @abstractmethod
    def label_narrative_status(self, block_text: str) -> str:
        """Classify block as one of: setup, conflict, reveal, resolution, cliffhanger_buildup."""
        ...


# ---------------------------------------------------------------------------
# Demo / keyword-heuristic implementation
# ---------------------------------------------------------------------------

# Keyword → (emotion, base_intensity) mapping
_EMOTION_KEYWORDS: dict[str, tuple[str, float]] = {
    # High-arousal emotions
    "explod": ("fear", 0.9),
    "scream": ("fear", 0.85),
    "attack": ("fear", 0.8),
    "gun": ("fear", 0.8),
    "dead": ("sadness", 0.85),
    "death": ("sadness", 0.85),
    "kill": ("fear", 0.9),
    "fight": ("anger", 0.8),
    "escape": ("fear", 0.75),
    "flee": ("fear", 0.7),
    "sprint": ("fear", 0.7),
    "chase": ("fear", 0.75),
    "danger": ("fear", 0.75),
    "threat": ("fear", 0.7),
    "fire": ("fear", 0.7),
    "crash": ("surprise", 0.8),
    "betray": ("anger", 0.85),
    "shocking": ("surprise", 0.85),
    "twist": ("surprise", 0.8),
    "reveal": ("surprise", 0.75),
    "discover": ("surprise", 0.7),
    "secret": ("surprise", 0.65),
    "mysterious": ("surprise", 0.6),
    "encrypted": ("surprise", 0.6),
    # Positive emotions
    "love": ("joy", 0.75),
    "laugh": ("joy", 0.7),
    "happy": ("joy", 0.7),
    "celebrat": ("joy", 0.75),
    "smile": ("joy", 0.6),
    "hope": ("joy", 0.55),
    "sunrise": ("joy", 0.5),
    "free": ("joy", 0.6),
    # Tension / anticipation
    "warn": ("anticipation", 0.7),
    "wait": ("anticipation", 0.5),
    "whisper": ("anticipation", 0.6),
    "plan": ("anticipation", 0.5),
    "prepar": ("anticipation", 0.55),
    "dark": ("fear", 0.5),
    "shadow": ("fear", 0.5),
    "silent": ("anticipation", 0.45),
    # Sadness
    "cry": ("sadness", 0.75),
    "tear": ("sadness", 0.7),
    "loss": ("sadness", 0.7),
    "alone": ("sadness", 0.6),
    "injur": ("sadness", 0.65),
    "wound": ("sadness", 0.65),
}

_NARRATIVE_KEYWORDS: dict[str, str] = {
    "open": "setup",
    "introduc": "setup",
    "begin": "setup",
    "morning": "setup",
    "arrive": "setup",
    "establish": "setup",
    "fight": "conflict",
    "chase": "conflict",
    "escape": "conflict",
    "confront": "conflict",
    "argue": "conflict",
    "tension": "conflict",
    "attack": "conflict",
    "flee": "conflict",
    "discover": "reveal",
    "reveal": "reveal",
    "realiz": "reveal",
    "truth": "reveal",
    "secret": "reveal",
    "uncover": "reveal",
    "resolv": "resolution",
    "peace": "resolution",
    "safe": "resolution",
    "end": "resolution",
    "aftermath": "resolution",
    "cliffhanger": "cliffhanger_buildup",
    "cut to black": "cliffhanger_buildup",
    "fade": "cliffhanger_buildup",
    "smash cut": "cliffhanger_buildup",
    "whisper": "cliffhanger_buildup",
    "coming soon": "cliffhanger_buildup",
}


class DemoNLPClient(NLPClient):
    """
    Keyword-heuristic NLP client.  No ML models required.

    * classify_emotion  – scans for keywords and returns the highest-intensity match.
    * embed             – produces a deterministic 64-dim vector from a hash of the text.
    * label_narrative_status – keyword matching against narrative stage vocabulary.
    """

    def classify_emotion(self, text: str) -> Tuple[str, float]:
        text_lower = text.lower()
        best_emotion = "neutral"
        best_intensity = 0.25  # baseline for neutral text

        for keyword, (emotion, intensity) in _EMOTION_KEYWORDS.items():
            if keyword in text_lower:
                if intensity > best_intensity:
                    best_emotion = emotion
                    best_intensity = intensity

        # Add slight randomness based on text length for variety
        length_factor = min(len(text) / 200.0, 1.0) * 0.1
        best_intensity = min(best_intensity + length_factor, 1.0)

        return best_emotion, round(best_intensity, 3)

    def embed(self, text: str) -> np.ndarray:
        """Deterministic embedding: SHA-256 hash → 64-dim float vector."""
        h = hashlib.sha256(text.encode("utf-8")).digest()
        # Use the 32 bytes to seed a reproducible vector
        arr = np.frombuffer(h, dtype=np.uint8).astype(np.float64)
        # Expand to 64 dims by repeating
        arr = np.tile(arr, 2)[:64]
        # Normalise to unit length
        norm = np.linalg.norm(arr)
        if norm > 0:
            arr = arr / norm
        return arr

    def label_narrative_status(self, block_text: str) -> str:
        text_lower = block_text.lower()
        for keyword, label in _NARRATIVE_KEYWORDS.items():
            if keyword in text_lower:
                return label
        return "setup"


# ---------------------------------------------------------------------------
# Transformers-based implementation
# ---------------------------------------------------------------------------

class TransformersNLPClient(NLPClient):
    """
    NLP Client using local Hugging Face Transformers models.
    Models are loaded lazily on first use to avoid slow startup.
    """
    def __init__(self):
        self._emotion_pipeline = None
        self._embedder = None
        self._zs_pipeline = None

    def _get_emotion_pipeline(self):
        if self._emotion_pipeline is None:
            from transformers import pipeline
            logger.info("Loading emotion classification model...")
            self._emotion_pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=1,
            )
        return self._emotion_pipeline

    def _get_embedder(self):
        if self._embedder is None:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading sentence embedding model...")
            self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
        return self._embedder

    def _get_zs_pipeline(self):
        if self._zs_pipeline is None:
            from transformers import pipeline
            logger.info("Loading zero-shot classification model...")
            self._zs_pipeline = pipeline(
                "zero-shot-classification", 
                model="facebook/bart-large-mnli"
            )
        return self._zs_pipeline

    def classify_emotion(self, text: str) -> Tuple[str, float]:
        pipe = self._get_emotion_pipeline()
        # Truncate to avoid exceeding max sequence length
        result = pipe(text[:512])[0][0]  # top_k=1 returns a list of lists
        return result["label"], round(result["score"], 3)

    def embed(self, text: str) -> np.ndarray:
        embedder = self._get_embedder()
        return embedder.encode(text, normalize_embeddings=True)

    def label_narrative_status(self, block_text: str) -> str:
        pipe = self._get_zs_pipeline()
        labels = ["setup", "conflict", "reveal", "resolution", "cliffhanger_buildup"]
        result = pipe(block_text, candidate_labels=labels)
        return result["labels"][0]
