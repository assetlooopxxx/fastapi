"""Mitaka Work & Life Cycle Ecosystem — landing page server."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="ミタカ・ワーク＆ライフ循環エコシステム")

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
async def index() -> str:
    """Serve the landing page."""
    return (BASE_DIR / "templates" / "index.html").read_text(encoding="utf-8")
