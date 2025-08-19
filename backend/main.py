from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os, re, time
from typing import Dict, Tuple, Optional, List

app = FastAPI(title="Menu Intelligence Widget API", version="1.0.0")

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# MODELS
# ------------------------------
class MenuItemRequest(BaseModel):
    itemName: str = Field(..., description="Food item name")
    gptVersion: str = Field("gpt-3.5", description="Model toggle")

class MenuItemResponse(BaseModel):
    description: str
    upsell: str

class NewMenuItem(BaseModel):
    name: str

# ------------------------------
# MEMORY STORAGE
# ------------------------------
menu_items: List[str] = ["Paneer Tikka Pizza", "Cheese Burger", "Veg Biryani"]

# ------------------------------
# RATE LIMITER
# ------------------------------
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "60"))
WINDOW = int(os.getenv("RATE_WINDOW_SEC", "300"))
_visits: Dict[str, list] = {}

def is_rate_limited(ip: str) -> bool:
    now = time.time()
    bucket = _visits.setdefault(ip, [])
    while bucket and now - bucket[0] > WINDOW:
        bucket.pop(0)
    if len(bucket) >= RATE_LIMIT:
        return True
    bucket.append(now)
    return False

# ------------------------------
# VALIDATION
# ------------------------------
SAFE_NAME_REGEX = re.compile(r"^[a-zA-Z0-9\s\-\&\(\)\'\,\.\+\/]+$")

def validate_item_name(name: str) -> str:
    cleaned = name.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Item name cannot be empty.")
    if len(cleaned) > 80:
        raise HTTPException(status_code=400, detail="Item name is too long (max 80 chars).")
    if not SAFE_NAME_REGEX.match(cleaned):
        raise HTTPException(status_code=400, detail="Invalid characters in item name.")
    return cleaned

# ------------------------------
# SIMULATED LLM
# ------------------------------
def simulate_llm(item: str, model_hint: str) -> Tuple[str, str]:
    core = item.lower()
    style = "elegant" if "4" in model_hint else "lively"
    if "paneer" in core or "tikka" in core:
        desc = f"Smoky, spiced {item} with charred edges and creamy notes, crafted in a {style} style."
        upsell = "Pair it with a chilled Mango Lassi."
    elif "pizza" in core:
        desc = f"Hand-tossed {item} with bubbling cheese and vibrant toppings, baked for a perfect bite."
        upsell = "Pair it with garlic breadsticks."
    elif "burger" in core:
        desc = f"Juicy {item} stacked with crisp veggies and a soft bun, delivering bold, satisfying flavor."
        upsell = "Pair it with crispy fries."
    elif "biryani" in core:
        desc = f"Aromatic {item} with layered spices and tender grains, finished with fragrant herbs."
        upsell = "Pair it with raita."
    else:
        desc = f"Tasty {item} made with quality ingredients and balanced flavors, perfect for quick cravings."
        upsell = "Pair it with a refreshing iced tea."
    return desc, upsell

# ------------------------------
# API ROUTES
# ------------------------------
@app.get("/menu-items")
async def get_menu_items():
    return {"items": menu_items}

@app.post("/menu-items")
async def add_menu_item(body: NewMenuItem):
    name = validate_item_name(body.name)
    if any(i.lower() == name.lower() for i in menu_items):
        raise HTTPException(status_code=400, detail="Item already exists.")
    menu_items.append(name)
    return {"message": "Item added successfully", "items": menu_items}

@app.post("/generate-item-details", response_model=MenuItemResponse)
async def generate_item_details(request: Request, body: MenuItemRequest):
    ip = request.client.host if request.client else "unknown"
    if is_rate_limited(ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")
    name = validate_item_name(body.itemName)
    model_hint = body.gptVersion or "gpt-3.5"
    description, upsell = simulate_llm(name, model_hint)
    return MenuItemResponse(description=description, upsell=upsell)

@app.get("/health")
async def health():
    return {"status": "ok"}
