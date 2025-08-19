# AI-Powered Menu Intelligence Widget (Full-Stack)

This is a minimal **full-stack** implementation for the interview task.

## What it does
- Enter a food item name.
- Backend generates a short menu description (≤ 30 words) and a single upsell suggestion.
- Optional model toggle (GPT-3.5 vs GPT-4) – simulated unless `OPENAI_API_KEY` is set.

---

## Run Locally

### 1) Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
> Optional: create `backend/.env` with `OPENAI_API_KEY=...` to use a real LLM. Otherwise a built-in simulator runs.

### 2) Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

If your backend port differs, add `frontend/.env`:
```
VITE_API_BASE=http://localhost:8000
```

---

## API Contract
- **POST** `/generate-item-details`
  - Request JSON:
    ```json
    { "itemName": "Paneer Tikka Pizza", "gptVersion": "gpt-4" }
    ```
  - Response JSON:
    ```json
    { "description": "…", "upsell": "…" }
    ```

---

## Prompt Engineering
We use this structured prompt to enforce brevity, JSON output, and role context:

```
You are a menu description generator for a restaurant POS system.
Given a single food item name, produce two fields in JSON:
1) "description": an appealing menu description, strictly under 30 words, no emojis.
2) "upsell": a single pairing suggestion (drink or side). Keep concise.
Food item: {item}
Model hint: {model_hint}
Output only valid JSON with keys description, upsell.
```

**Why it works**
- Clear role and output format.
- Hard constraints (≤30 words, JSON keys) for deterministic parsing.
- Context (“restaurant POS system”) keeps tone concise and utility-focused.

---

## Security Notes
- **Input validation & sanitization**: length limit, allowed character whitelist.
- **Rate limiting**: in-memory window (defaults: 60 requests / 5 minutes per IP).
  - Configure via env: `RATE_LIMIT`, `RATE_WINDOW_SEC`.

---

## Grafterr POS Integration (Bonus Note)
- Embed this widget beside the “Add / Edit Item” form.
- On item title change, auto-suggest description & upsell with a “Use Suggestion” button.
- Persist the selected description directly into the item’s description field.
- Respect existing role permissions and audit logs by tagging AI-assisted edits.
```

