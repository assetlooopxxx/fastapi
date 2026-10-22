"""A small demo app that exercises the FastAPI framework from local source.

Run with:  uvicorn demo_app:app --host 0.0.0.0 --port 3000 --reload
"""

import fastapi
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
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


@app.get("/", response_class=HTMLResponse)
async def root() -> str:
    item_rows = (
        "".join(
            f"<tr><td>{item.name}</td><td>{item.description or '—'}</td>"
            f"<td>{item.price}</td></tr>"
            for item in items.values()
        )
        or '<tr><td colspan="3" class="empty">No items yet — POST one to /items/</td></tr>'
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FastAPI Demo</title>
<style>
  :root {{ color-scheme: light; }}
  body {{ margin: 0; padding: 2.5rem 1.25rem; background: #f7f7f8; color: #1b1f24;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.55; }}
  main {{ max-width: 44rem; margin: 0 auto; }}
  h1 {{ margin: 0 0 .35rem; font-size: 1.6rem; }}
  .sub {{ margin: 0 0 1.75rem; color: #5b6570; }}
  code {{ background: #eceef1; border-radius: 4px; padding: .1rem .35rem; font-size: .9em; }}
  .links {{ display: flex; flex-wrap: wrap; gap: .6rem; margin: 0 0 2rem; padding: 0; list-style: none; }}
  .links a {{ display: inline-block; padding: .5rem .9rem; border: 1px solid #cfd4da; border-radius: 6px;
              background: #fff; color: #1b1f24; text-decoration: none; font-size: .92rem; }}
  .links a:hover {{ border-color: #8b959f; }}
  table {{ width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #d9dee3; border-radius: 6px; }}
  th, td {{ padding: .55rem .75rem; text-align: left; border-bottom: 1px solid #eceef1; font-size: .92rem; }}
  th {{ background: #f2f4f6; font-weight: 600; }}
  tr:last-child td {{ border-bottom: 0; }}
  td.empty {{ color: #6b737c; }}
</style>
</head>
<body>
<main>
  <h1>FastAPI is running from local source</h1>
  <p class="sub">Version <code>{fastapi.__version__}</code>, imported from the checkout in this workspace.</p>
  <ul class="links">
    <li><a href="/docs">Swagger UI</a></li>
    <li><a href="/redoc">ReDoc</a></li>
    <li><a href="/openapi.json">OpenAPI schema</a></li>
  </ul>
  <h2>Items in memory</h2>
  <table>
    <thead><tr><th>Name</th><th>Description</th><th>Price</th></tr></thead>
    <tbody>{item_rows}</tbody>
  </table>
</main>
</body>
</html>"""


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
