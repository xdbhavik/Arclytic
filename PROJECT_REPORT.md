# Episodic Intelligence Engine - Project Report

## What This Tool Does
The Episodic Intelligence Engine is a comprehensive full-stack application designed to analyze narrative concepts (like short story ideas) and systematically decompose them into optimized, vertical-video episode arcs perfectly tailored for platforms like TikTok, YouTube Shorts, or Instagram Reels.

It goes beyond simple text generation by providing a multi-layered analysis:
1. **Decomposition**: Breaking down the core narrative into specific episodes with visual blocking.
2. **Emotional Tracking**: Mapping the emotional intensity and sentiment shifts across each moment.
3. **Cliffhanger Scoring**: Evaluating the tension and engagement value of each episode's ending.
4. **Retention Prediction**: Predicting audience drop-off risks based on narrative pacing.
5. **Improvement Suggestions**: Providing targeted feedback to enhance viewer retention and narrative impact.

## Tech Stack & Rationale

### Frontend: React + Vite + Vanilla CSS
- **React**: Enables a highly interactive, component-driven UI ensuring smooth state transitions between different analysis panels (Episodes, Emotional Arc, Cliffhangers, etc.).
- **Vite**: Chosen for its blazing-fast modern build tooling and instant Hot Module Replacement (HMR), ensuring rapid frontend iteration compared to older bundlers like Webpack.
- **Vanilla CSS (Custom Styling)**: To achieve a specific "premium, dynamic" aesthetic, raw CSS was favored over utility frameworks. It uses CSS variables, smooth gradients, glassmorphism (`backdrop-filter`), and distinct keyframe animations (like `scan` and `pulse-dot`) to make the interface feel alive and futuristic.

### Backend: Python + FastAPI
- **FastAPI**: Selected for its exceptional performance, async capabilities, and automatic Swagger/OpenAPI documentation generation (via Pydantic). It is currently the industry standard for lightweight, fast Python microservices.
- **Python**: The uncontested language of choice for AI/ML development. Keeping the backend in Python allows seamless integration with heavy NLP libraries (like Hugging Face Transformers) and LLM clients.

### AI & ML Layer
- **LLM Abstraction**: A standardized interface supports OpenAI-compatible endpoints, meaning it can hit local models (Ollama, vLLM), OpenAI (GPT-4), or Google Gemini.
- **NLP Client**: Implements local Hugging Face Transformers for zero-cost, private sentiment analysis and embedding-based similarity tasks, reducing reliance strictly on expensive LLM calls for simpler text-classification tasks.

## System Workflow Description

1. **User Input**: The user pastes their story premise into the React UI and triggers the analysis.
2. **API Request**: The frontend component makes an async POST request to the FastAPI `/analyse` endpoint, displaying a segmented loading animation.
3. **Backend Orchestration Pipeline**:
   - The app delegates the premise to the **Story Decomposer** which queries the LLM for a structured JSON episode breakdown.
   - The decomposed episodes are passed to the **Emotional Arc** analyzer, where NLP models tag the sentiment of every narrative block.
   - The **Cliffhanger** service uses the LLM to score the tension, stakes, and curiosity of the episode endings.
   - The **Retention** service predicts audience drop-off.
   - The **Optimiser** service synthesizes all previous data and asks the LLM for actionable improvements.
4. **Error Handling**: Every API call is wrapped in robust exception handling. If an integration issue occurs (e.g., HTTP 401 Unauthorized from an invalid API key), the backend cleanly catches it and relays a 401 Exception back to the client. The frontend intercepts this, parses the JSON detail, and visually presents a clear error banner.
5. **Presentation**: Upon success, the backend returns a comprehensive JSON payload. The React UI parses this payload and unlocks its interactive sidebar, allowing the user to deeply explore the generated insights across various graphical panels.
