"""
Episodic Intelligence Engine — FastAPI application.

Run with:
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.models import AnalyseRequest, AnalyseResponse
from app.services import (
    cliffhanger,
    emotional_arc,
    optimiser,
    retention,
    story_decomposer,
)
from app.services.demo_data import get_demo_response
from app.services.llm_client import DemoLLMClient, OpenAICompatibleLLMClient
from app.services.nlp_client import DemoNLPClient, TransformersNLPClient

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Episodic Intelligence Engine",
    description="Analyse short story ideas and decompose them into engaging vertical-video episode arcs.",
    version="1.0.0",
)

# CORS — allow the Vite dev server's default origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Clients  (auto-select based on environment)
# ---------------------------------------------------------------------------

LLM_BASE_URL = os.getenv("LLM_BASE_URL")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.1")
LLM_API_KEY = os.getenv("LLM_API_KEY")

if LLM_BASE_URL:
    logger.info("Using real LLM: %s at %s", LLM_MODEL, LLM_BASE_URL)
    print(f"\n✅ SUCCESS: LLM_BASE_URL detected ({LLM_BASE_URL}). Real models WILL be used.")
    llm = OpenAICompatibleLLMClient(
        base_url=LLM_BASE_URL,
        model=LLM_MODEL,
        api_key=LLM_API_KEY,
    )
else:
    logger.info("No LLM_BASE_URL provided. Using DemoLLMClient.")
    print("\n⚠️ WARNING: LLM_BASE_URL is NOT set. The app will fall back to DEMO DATA.")
    print("   To use real models, stop the server and run it like this:")
    print("   LLM_BASE_URL=\"http://localhost:11434/v1\" python -m uvicorn app.main:app --port 0\n")
    llm = DemoLLMClient()

USE_REAL_NLP = os.getenv("USE_REAL_NLP", "").lower() in ("true", "1", "yes")

if USE_REAL_NLP:
    logger.info("Using real NLP models (TransformersNLPClient). Models will download/load on first request.")
    nlp = TransformersNLPClient()
else:
    logger.info("USE_REAL_NLP not set. Using DemoNLPClient.")
    nlp = DemoNLPClient()

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    """Simple health-check endpoint."""
    return {"status": "ok", "engine": "episodic-intelligence", "version": "1.0.0"}


@app.post("/analyse", response_model=AnalyseResponse)
async def analyse_story(req: AnalyseRequest):
    """
    Main analysis endpoint.

    Orchestrates story decomposition → emotional arc → cliffhanger scoring
    → retention risk → optimisation suggestions.

    Falls back to demo data if any critical step fails.
    """
    logger.info("Received analysis request (%d target episodes)", req.target_episodes)

    try:
        # 1. Decompose story into episodes
        episodes = story_decomposer.decompose(
            req.story_idea, req.target_episodes, req.genre_hint, llm,
        )

        # If decomposition returned nothing, fall back to demo
        if not episodes:
            if LLM_BASE_URL:
                raise HTTPException(status_code=500, detail="LLM failed to produce valid episodes. Was the JSON malformed?")
            logger.info("Decomposition returned no episodes — serving demo response.")
            return get_demo_response()

        # 2. Emotional analysis
        emo_arc = emotional_arc.analyse(episodes, nlp)

        # 3. Cliffhanger scoring
        cliffs = cliffhanger.score(episodes, llm)

        # 4. Retention risk
        ret_risk = retention.predict(episodes, emo_arc, nlp)

        # 5. Optimisation suggestions
        suggestions = optimiser.suggest(episodes, emo_arc, cliffs, ret_risk, llm)

        return AnalyseResponse(
            episodes=episodes,
            emotional_arc=emo_arc,
            cliffhangers=cliffs,
            retention_risk=ret_risk,
            suggestions=suggestions,
        )

    except Exception as exc:
        logger.exception("Analysis pipeline failed.")
        if LLM_BASE_URL:
            # Surface real errors to the frontend if we are using real models
            raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(exc)}")
        
        logger.info("Falling back to demo data.")
        return get_demo_response()


@app.get("/demo", response_model=AnalyseResponse)
async def demo():
    """Return hardcoded demo data (useful for frontend development)."""
    return get_demo_response()
