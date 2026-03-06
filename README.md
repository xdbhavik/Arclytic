# Episodic Intelligence Engine

Analyse short story ideas and decompose them into structured **vertical-video episode arcs** with emotional tracking, cliffhanger scoring, retention prediction, and improvement suggestions.

## Architecture

```
episodic-engine/
├── backend/          # Python / FastAPI
│   ├── app/
│   │   ├── main.py           # FastAPI app & routing
│   │   ├── models.py         # Pydantic models
│   │   └── services/
│   │       ├── llm_client.py       # LLM abstraction
│   │       ├── nlp_client.py       # NLP abstraction
│   │       ├── story_decomposer.py # Story → episode arc
│   │       ├── emotional_arc.py    # Emotion per block
│   │       ├── cliffhanger.py      # Ending scores
│   │       ├── retention.py        # Drop-off risk
│   │       ├── optimiser.py        # Suggestions
│   │       └── demo_data.py        # Fallback sample data
│   ├── requirements.txt
│   └── README.md
│
└── frontend/         # React / Vite
    ├── src/
    │   ├── App.jsx
    │   ├── index.css
    │   └── components/
    │       ├── InputForm.jsx
    │       ├── EpisodesPanel.jsx
    │       ├── EmotionalArcPanel.jsx
    │       ├── CliffhangerPanel.jsx
    │       ├── RetentionPanel.jsx
    │       └── SuggestionsPanel.jsx
    ├── package.json
    └── README.md
```

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Edit .env with your LLM API Key
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:XXXX** and enter a story idea.

## Demo Mode

The app ships with a built-in demo mode. If the LLM/NLP clients are unavailable, the backend automatically falls back to a hardcoded spy-thriller sample response. You can also hit `GET /demo` directly.

## Swapping in Real Models

See `backend/README.md` for instructions on replacing the demo clients with real Hugging Face or OpenAI-compatible providers.
