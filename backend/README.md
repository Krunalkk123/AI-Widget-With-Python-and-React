# Backend (FastAPI)

## Setup
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

(Optional) Create a `.env` file and set `OPENAI_API_KEY=...` to use real LLM. Without it, a simulator is used.

## Run
```bash
uvicorn main:app --reload --port 8000
```

## Endpoints
- `POST /generate-item-details`
  ```json
  {
    "itemName": "Paneer Tikka Pizza",
    "gptVersion": "gpt-4"
  }
  ```

- `GET /health` -> `{"status":"ok"}`

## Security
- Input validation and sanitization
- Simple in-memory rate limiting (60 req / 5 min per IP by default) via env vars:
  - `RATE_LIMIT`, `RATE_WINDOW_SEC`
