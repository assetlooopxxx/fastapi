"""Mitaka Work & Life Circular Ecosystem — landing page app.

Run with:  uvicorn landing.main:app --host 0.0.0.0 --port 3000 --reload --reload-dir landing
"""

import json
import time
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
REGISTRATIONS_FILE = DATA_DIR / "registrations.jsonl"

app = FastAPI(title="ミタカ・ワーク＆ライフ循環エコシステム")

# Serves index.html at "/" plus the assets under static/ (css, js, img).
app.frontend("/", directory=STATIC_DIR)


class MemberRegistration(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    line_or_phone: str = Field(min_length=1, max_length=100)


@app.post("/api/register")
def register_member(payload: MemberRegistration) -> dict:
    DATA_DIR.mkdir(exist_ok=True)
    record = {
        "name": payload.name,
        "line_or_phone": payload.line_or_phone,
        "received_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    }
    with REGISTRATIONS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
    return {"ok": True}
