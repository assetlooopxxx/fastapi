"""A small demo app that exercises the FastAPI framework from local source.

Run with:  uvicorn demo_app:app --host 0.0.0.0 --port 3000 --reload
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="FastAPI Demo",
    description="A small demo app running the FastAPI framework from local source.",
    version="0.1.0",
)


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


# In-memory store so the demo has some state without a database.
items: dict[str, Item] = {}


@app.get("/")
async def root():
    return {
        "message": "Hello World — FastAPI is running from local source!",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/items/{item_id}")
async def read_item(item_id: str, q: str | None = None):
    if item_id in items:
        result = {"item": items[item_id]}
        if q:
            result["q"] = q
        return result
    return {"error": "Item not found", "item_id": item_id}


@app.post("/items/")
async def create_item(item: Item):
    items[item.name] = item
    return item


@app.get("/items/")
async def list_items():
    return list(items.values())
