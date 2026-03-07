# Episodic Intelligence Engine — Frontend

React + Vite frontend for the Episodic Intelligence Engine.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

## Backend Connection

The Vite dev server proxies API requests to `http://localhost:8000`.  
Make sure the FastAPI backend is running before using the frontend:

```bash
# In a separate terminal:
cd ../backend
uvicorn app.main:app --reload --port 8000
```

### Error Handling
The UI elegantly captures and displays backend errors. For example, if the LLM API token is invalid, the backend will return a `401 Unauthorized` exception. The frontend parses this JSON error and presents a clean "Authentication failed. Please check your API key" alert to the user instead of generic error traces.

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

For production, update `API_BASE` in `src/App.jsx` to point to your deployed backend URL.
