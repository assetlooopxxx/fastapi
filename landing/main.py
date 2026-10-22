"""Mitaka Work & Life Circular Ecosystem — landing page app.

Run with:  uvicorn landing.main:app --host 0.0.0.0 --port 3000 --reload --reload-dir landing
"""

from pathlib import Path

from fastapi import FastAPI

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="ミタカ・ワーク＆ライフ循環エコシステム")

# Serves index.html at "/" plus the assets under static/ (css, js, img).
app.frontend("/", directory=STATIC_DIR)
