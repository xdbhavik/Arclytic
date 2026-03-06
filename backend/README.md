# Episodic Intelligence Engine — Backend

Python / FastAPI backend that analyses short story ideas and decomposes them into structured vertical-video episode arcs.

## Quick Start

```bash
# 1. Create & activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
# Copy the example `.env` and fill in your details:
cp .env.example .env

# 4. Run the dev server
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.

## Endpoints

| Method | Path       | Description                        |
|--------|------------|------------------------------------|
| GET    | `/health`  | Health check                       |
| POST   | `/analyse` | Run full analysis pipeline         |
| GET    | `/demo`    | Return hardcoded demo response     |

### POST /analyse

```json
{
  "story_idea": "A former spy discovers an encrypted signal…",
  "target_episodes": 6,
  "genre_hint": "thriller"
}
```

## Swapping in Real Models

The app uses **DemoLLMClient** and **DemoNLPClient** by default (no API keys needed, zero setup).

To use real models, start the backend with the appropriate environment variables. It communicates via the standard OpenAI `/chat/completions` API format, which means you can point it to **OpenAI**, **Ollama**, **vLLM**, etc.

### Using Ollama (Local LLM)

1. Make sure [Ollama](https://ollama.com) is installed and running.
2. Pull a model: `ollama run llama3.1`
3. Start the backend with:
   ```bash
   LLM_BASE_URL="http://localhost:11434/v1" LLM_MODEL="llama3.1" uvicorn app.main:app --reload --port 0
   ```

### Using OpenAI

```bash
LLM_BASE_URL="https://api.openai.com/v1" LLM_MODEL="gpt-4o-mini" LLM_API_KEY="sk-..." uvicorn app.main:app --reload --port 0
```

### Using Google Gemini (Free Tier Available)

Google provides an OpenAI-compatible endpoint that works out-of-the-box. Add this to your `.env` file:

```env
LLM_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
LLM_MODEL="gemini-3.1-flash-lite-preview"
LLM_API_KEY="AIza..."
```
Then run: `uvicorn app.main:app --reload --port 0`

### Using Real NLP Models

By default, emotion classification and embedding use lightweight keyword heuristics (DemoNLPClient).
To use real local ML models (via Hugging Face Transformers):

1. Install the optional dependencies:
   ```bash
   pip install transformers torch sentence-transformers
   ```
2. Start the backend with `USE_REAL_NLP=true`:
   ```bash
   USE_REAL_NLP=true uvicorn app.main:app --reload --port 0
   ```
   *Note: Models (~2GB) will automatically download and load into memory on the first request.*
