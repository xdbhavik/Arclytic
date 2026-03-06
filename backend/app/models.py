"""
Pydantic models for the Episodic Intelligence Engine API.

All request/response schemas are defined here for a clean, typed API surface.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class AnalyseRequest(BaseModel):
    """Payload sent by the frontend to kick off analysis."""
    story_idea: str = Field(..., min_length=10, description="Short story idea (1-3 paragraphs)")
    target_episodes: int = Field(default=6, ge=5, le=8, description="Number of episodes (5-8)")
    genre_hint: Optional[str] = Field(default=None, description="Optional genre hint, e.g. 'thriller', 'romance'")


# ---------------------------------------------------------------------------
# Core structures
# ---------------------------------------------------------------------------

class Block(BaseModel):
    """A 15-second segment within an episode."""
    start_s: int
    end_s: int
    text: str


class Episode(BaseModel):
    """A single episode in the arc."""
    id: int
    title: str
    summary: str
    key_events: List[str]
    hook: str
    blocks: List[Block]


class EmotionalBlock(BaseModel):
    """Emotion classification for one 15-second block."""
    start_s: int
    end_s: int
    emotion: str
    intensity: float = Field(..., ge=0.0, le=1.0)


class EmotionalEpisode(BaseModel):
    """Emotional analysis for an entire episode."""
    episode_id: int
    blocks: List[EmotionalBlock]
    flat_zones: List[Dict[str, Any]]
    summary: str  # natural-language description of the arc


class CliffhangerScore(BaseModel):
    """Cliffhanger effectiveness score for one episode."""
    episode_id: int
    tension: float = Field(..., ge=0.0, le=10.0)
    stakes: float = Field(..., ge=0.0, le=10.0)
    surprise: float = Field(..., ge=0.0, le=10.0)
    curiosity: float = Field(..., ge=0.0, le=10.0)
    total: float = Field(..., ge=0.0, le=10.0)
    explanation: str


class RetentionBlock(BaseModel):
    """Drop-off risk for a single 15-second block."""
    start_s: int
    end_s: int
    risk: float = Field(..., ge=0.0, le=1.0)


class RetentionEpisode(BaseModel):
    """Retention risk prediction for an entire episode."""
    episode_id: int
    blocks: List[RetentionBlock]


class Suggestion(BaseModel):
    """Improvement suggestions for one episode."""
    episode_id: int
    suggestions: List[str]
    alternative_hook: Optional[str] = None


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------

class AnalyseResponse(BaseModel):
    """Top-level response returned by POST /analyse."""
    episodes: List[Episode]
    emotional_arc: List[EmotionalEpisode]
    cliffhangers: List[CliffhangerScore]
    retention_risk: List[RetentionEpisode]
    suggestions: List[Suggestion]
