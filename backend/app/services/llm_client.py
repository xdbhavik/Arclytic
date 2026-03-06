"""
LLM Client abstraction layer.

Provides a clean interface for text generation that can be swapped
between providers (Hugging Face, Ollama, OpenAI, etc.).

The default *DemoLLMClient* returns plausible hard-coded / heuristic
output so the app works without any API key.
"""

from __future__ import annotations

import json
import logging
import re
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Base interface
# ---------------------------------------------------------------------------

class LLMClient(ABC):
    """Abstract base for any LLM backend."""

    @abstractmethod
    def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema_description: str = "",
    ) -> Dict[str, Any]:
        """Generate structured JSON from the model."""
        ...

    @abstractmethod
    def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """Generate free-form text from the model."""
        ...


# ---------------------------------------------------------------------------
# Demo / fallback implementation  (no API key required)
# ---------------------------------------------------------------------------

class DemoLLMClient(LLMClient):
    """
    Returns deterministic, heuristic-driven output so the full pipeline
    works end-to-end without any real LLM.

    The logic inspects the prompt to decide what kind of response is
    expected (story decomposition, cliffhanger scoring, suggestions, etc.)
    and generates a plausible JSON or text result.
    """

    def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema_description: str = "",
    ) -> Dict[str, Any]:
        # Detect what the pipeline is asking for
        prompt_lower = (system_prompt + " " + user_prompt).lower()

        # Order matters: check more specific patterns first.
        # "suggest"/"improv" must be checked before "episode" since
        # suggestion prompts also contain the word "episode".
        if "suggest" in prompt_lower or "improv" in prompt_lower:
            return self._suggestions(user_prompt)
        if "cliffhanger" in prompt_lower or ("tension" in prompt_lower and "score" in prompt_lower):
            return self._cliffhanger_scores(user_prompt)
        if "narrative" in prompt_lower or "status" in prompt_lower:
            return self._narrative_labels()
        if "decompos" in prompt_lower or "episode" in prompt_lower:
            return self._story_decomposition(user_prompt)

        # Generic fallback
        return {"result": "Demo output – swap in a real LLM for production."}

    def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        return "This is a demo text response. Wire a real LLM provider for richer output."

    # -- private helpers ---------------------------------------------------

    @staticmethod
    def _make_blocks(episode_idx: int, word_bank: list[str]) -> list[dict]:
        """Create 6 × 15-second blocks for one episode."""
        blocks = []
        for i in range(6):
            start = i * 15
            end = start + 15
            text = word_bank[i % len(word_bank)]
            blocks.append({"start_s": start, "end_s": end, "text": text})
        return blocks

    def _story_decomposition(self, user_prompt: str) -> Dict[str, Any]:
        # Try to extract target_episodes from the prompt
        target = 6
        m = re.search(r"target_episodes\D*(\d)", user_prompt)
        if m:
            target = int(m.group(1))

        sample_texts = [
            [
                "We open on a rain-soaked city skyline at dusk. A lone figure crosses a bridge.",
                "Inside a dimly lit apartment, ALEX discovers an encrypted message on their laptop.",
                "A flashback reveals Alex once worked for a shadowy government agency.",
                "Alex decides to decode the message, triggering a silent alarm somewhere.",
                "A mysterious stranger appears at the door, claiming to be an old ally.",
                "The stranger whispers a warning: 'They already know you're awake.' Cut to black.",
            ],
            [
                "Morning light. Alex and the stranger, MAYA, plan their next move over coffee.",
                "Maya reveals a hidden USB drive containing classified surveillance footage.",
                "They watch the footage: a high-ranking official meeting with known criminals.",
                "Alex recognises one face — their former mentor, DIRECTOR HALE.",
                "A phone rings. Unknown caller. Heavy breathing. Then: 'Stop digging.'",
                "Alex and Maya flee the apartment moments before a black SUV pulls up outside.",
            ],
            [
                "On the run, Alex and Maya take refuge in an abandoned warehouse.",
                "Maya teaches Alex basic counter-surveillance techniques.",
                "They discover the USB also contains coordinates to a hidden server farm.",
                "A news broadcast reports Alex as a 'person of interest' in a security breach.",
                "Tension rises as Maya admits she's been tracking Alex for months.",
                "A drone buzzes overhead — they've been found. They sprint into the night.",
            ],
            [
                "Alex and Maya reach the server farm hidden beneath a derelict factory.",
                "Inside, rows of servers hum. Maya begins extracting data.",
                "Alex stands guard and spots armed figures approaching through thermal goggles.",
                "A firefight erupts. Maya completes the download just in time.",
                "They escape through underground tunnels, but Maya is injured.",
                "At the tunnel's exit, Director Hale stands waiting, flanked by agents.",
            ],
            [
                "Hale offers Alex a deal: return the data and 'all is forgiven.'",
                "Alex stalls while Maya secretly broadcasts the data to journalists worldwide.",
                "Hale realises what's happening and orders agents to seize them.",
                "In the chaos, Alex triggers an EMP device, plunging the area into darkness.",
                "Alex and Maya slip away. Sirens wail in the distance.",
                "A final shot: Alex looks at the sunrise, free but forever changed.",
            ],
            [
                "Epilogue: news channels air the leaked footage. Public outrage erupts.",
                "Director Hale resigns. Congressional hearings are announced.",
                "Alex, under a new identity, watches from a café overseas.",
                "Maya sends a coded message: 'There's another layer. Deeper.'",
                "Alex hesitates, then opens the message. New coordinates appear.",
                "Smash cut to black. Title card: 'Season 2 — Coming Soon.'",
            ],
        ]

        episodes = []
        for i in range(target):
            idx = i % len(sample_texts)
            blocks = []
            for b in range(6):
                blocks.append({
                    "start_s": b * 15,
                    "end_s": (b + 1) * 15,
                    "text": sample_texts[idx][b],
                })
            episodes.append({
                "id": i + 1,
                "title": f"Episode {i + 1}: {'The Signal,The Contact,The Chase,The Breach,The Reveal,The Aftermath'.split(',')[idx]}",
                "summary": f"In episode {i + 1}, the story {'introduces the protagonist and the mystery,deepens alliances and raises stakes,puts heroes on the run,reaches a critical confrontation,delivers the climactic revelation,explores consequences and sets up the future'.split(',')[idx]}.",
                "key_events": [
                    blocks[1]["text"][:60] + "…",
                    blocks[3]["text"][:60] + "…",
                    blocks[5]["text"][:60] + "…",
                ],
                "hook": blocks[5]["text"],
                "blocks": blocks,
            })

        return {"episodes": episodes}

    def _cliffhanger_scores(self, user_prompt: str) -> Dict[str, Any]:
        import random
        import hashlib
        # Seed from user_prompt so each episode gets different but deterministic scores
        seed = int(hashlib.md5(user_prompt.encode()).hexdigest()[:8], 16)
        random.seed(seed)

        tension = round(random.uniform(5, 9.5), 1)
        stakes = round(random.uniform(4, 9), 1)
        surprise = round(random.uniform(3, 8.5), 1)
        curiosity = round(random.uniform(5, 9.5), 1)

        explanations = [
            "The episode ends on an unresolved moment that raises questions about the protagonist's next move.",
            "High personal stakes and a sudden reveal create a compelling reason to continue watching.",
            "An unexpected twist paired with rising tension makes dropping off here feel unthinkable.",
            "The curiosity gap is strong — a key question is posed but deliberately left unanswered.",
            "The combination of danger and emotional vulnerability pulls the viewer forward.",
            "A quiet, ominous beat replaces loud action — the calm-before-the-storm effect is powerful.",
        ]
        explanation = explanations[seed % len(explanations)]

        return {
            "tension": tension,
            "stakes": stakes,
            "surprise": surprise,
            "curiosity": curiosity,
            "explanation": explanation,
        }

    def _suggestions(self, user_prompt: str) -> Dict[str, Any]:
        return {
            "suggestions": [
                "Add a ticking-clock element to increase urgency in the first 30 seconds.",
                "Introduce a secondary character reaction to heighten emotional stakes.",
                "Move the reveal earlier to avoid a flat mid-section.",
                "End on a more visceral image to strengthen the cliffhanger.",
            ],
            "alternative_hook": "As the screen fades, a second encrypted message appears — this time addressed to someone else entirely.",
        }

    def _narrative_labels(self) -> Dict[str, Any]:
        return {
            "labels": [
                "setup", "setup", "conflict",
                "conflict", "reveal", "cliffhanger_buildup",
            ]
        }


# ---------------------------------------------------------------------------
# Example: Hugging Face / Transformers implementation (commented out)
# ---------------------------------------------------------------------------
#
# from transformers import pipeline
#
# class HuggingFaceLLMClient(LLMClient):
#     def __init__(self, model_name: str = "mistralai/Mistral-7B-Instruct-v0.1"):
#         self._pipe = pipeline("text-generation", model=model_name, max_new_tokens=2048)
#
#     def generate_json(self, system_prompt, user_prompt, schema_description=""):
#         prompt = f"[INST] {system_prompt}\n\n{user_prompt}\n\nRespond ONLY with valid JSON. [/INST]"
#         result = self._pipe(prompt)[0]["generated_text"]
#         # Extract JSON from model output
#         json_match = re.search(r'\{.*\}', result, re.DOTALL)
#         if json_match:
#             return json.loads(json_match.group())
#         raise ValueError("Model did not return valid JSON")
#
#     def generate_text(self, system_prompt, user_prompt):
#         prompt = f"[INST] {system_prompt}\n\n{user_prompt} [/INST]"
#         return self._pipe(prompt)[0]["generated_text"]
#
# ---------------------------------------------------------------------------
# OpenAI-compatible API (Ollama, vLLM, etc.)
# ---------------------------------------------------------------------------

class OpenAICompatibleLLMClient(LLMClient):
    def __init__(
        self,
        base_url: str = "http://localhost:11434/v1",
        model: str = "llama3.1",
        api_key: Optional[str] = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.headers = {}
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"

    def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema_description: str = "",
        max_retries: int = 5,
    ) -> Dict[str, Any]:
        
        import time
        
        # Append an explicit JSON instruction
        sys_p = system_prompt + "\n\nRespond ONLY with valid JSON. Do not include markdown code blocks or any other commentary."
        
        for attempt in range(max_retries):
            try:
                resp = httpx.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": sys_p},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0.3,
                        # Some endpoints (like OpenAI) support response_format
                        # "response_format": { "type": "json_object" }
                    },
                    timeout=180.0
                )
                
                # Check for rate limit or transient errors explicitly
                if resp.status_code in (429, 502, 503):
                    retry_after = resp.headers.get("Retry-After")
                    sleep_time = int(retry_after) if retry_after and retry_after.isdigit() else (2 ** attempt)
                    logger.warning(f"Transient error ({resp.status_code}). Retrying in {sleep_time}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(sleep_time)
                    continue
                    
                resp.raise_for_status()
                text = resp.json()["choices"][0]["message"]["content"]
                
                # Robust JSON extraction
                # 1. Try parsing directly
                text = text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    # 2. Try regex extraction if there's surrounding text
                    json_match = re.search(r'\{.*\}', text, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group())
                    raise
                    
            except httpx.HTTPError as exc:
                if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code in (429, 502, 503):
                     sleep_time = 2 ** attempt
                     logger.warning(f"Transient error ({exc.response.status_code}) on raise. Retrying in {sleep_time}s (attempt {attempt + 1}/{max_retries})")
                     time.sleep(sleep_time)
                     continue
                # Also retry on generic timeouts
                if isinstance(exc, (httpx.ConnectTimeout, httpx.ReadTimeout)):
                     sleep_time = 2 ** attempt
                     logger.warning(f"Timeout error. Retrying in {sleep_time}s (attempt {attempt + 1}/{max_retries})")
                     time.sleep(sleep_time)
                     continue
                if isinstance(exc, httpx.HTTPStatusError):
                     logger.error("LLM JSON generation failed (HTTP %s): %s", exc.response.status_code, exc.response.text)
                     raise ValueError(f"Failed to generate JSON from model (HTTP {exc.response.status_code}): {exc}")
                raise ValueError(f"Failed to generate JSON from model: {exc}")
                
        raise ValueError(f"Failed to generate JSON after {max_retries} attempts due to rate limiting (429).")

    def generate_text(
        self, 
        system_prompt: str, 
        user_prompt: str,
        max_retries: int = 5,
    ) -> str:
        import time
        
        for attempt in range(max_retries):
            try:
                resp = httpx.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0.7,
                    },
                    timeout=180.0
                )
                
                if resp.status_code == 429:
                    retry_after = resp.headers.get("Retry-After")
                    sleep_time = int(retry_after) if retry_after and retry_after.isdigit() else (2 ** attempt)
                    logger.warning(f"Rate limited (429). Retrying in {sleep_time}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(sleep_time)
                    continue
                    
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"].strip()
                
            except httpx.HTTPError as exc:
                if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code in (429, 502, 503):
                     sleep_time = 2 ** attempt
                     logger.warning(f"Transient error ({exc.response.status_code}) on raise. Retrying in {sleep_time}s (attempt {attempt + 1}/{max_retries})")
                     time.sleep(sleep_time)
                     continue
                # Also retry on generic timeouts
                if isinstance(exc, (httpx.ConnectTimeout, httpx.ReadTimeout)):
                     sleep_time = 2 ** attempt
                     logger.warning(f"Timeout error. Retrying in {sleep_time}s (attempt {attempt + 1}/{max_retries})")
                     time.sleep(sleep_time)
                     continue
                if isinstance(exc, httpx.HTTPStatusError):
                     logger.error("LLM text generation failed (HTTP %s): %s", exc.response.status_code, exc.response.text)
                     raise ValueError(f"Failed to generate text from model (HTTP {exc.response.status_code}): {exc}")
                raise ValueError(f"Failed to generate text from model: {exc}")
                
        raise ValueError(f"Failed to generate text after {max_retries} attempts due to rate limiting (429).")
