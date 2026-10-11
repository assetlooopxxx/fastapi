# Base44 Development Environment

## What this repo is

This is the **FastAPI framework** source repository (the library itself), not a standalone web application. There is no built-in runnable app or frontend.

## How it runs in the sandbox

A small demo app (`demo_app.py` at repo root) imports the `fastapi` package from local source and is served by `uvicorn` on port 3000 with `--reload` (live reload on file changes).

- **Compose**: `docker-compose.base44.yml` — single `python:3.11-slim` service, source bind-mounted at `/app`.
- **Dependency install**: `uv sync --extra standard --no-dev` installs the `fastapi` package (editable) plus the `standard` extras (uvicorn, httpx, jinja2, etc.) from `uv.lock`.
- **Run command**: `uv run uvicorn demo_app:app --host 0.0.0.0 --port 3000 --reload`
- **Healthcheck**: `python -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/')"` — probes the root endpoint.

## Key endpoints

- `GET /` — JSON welcome message
- `GET /docs` — Swagger UI (interactive API docs)
- `GET /redoc` — ReDoc API docs
- `POST /items/` — create an item (Pydantic model body)
- `GET /items/{item_id}` — read an item by name
- `GET /items/` — list all items

## Package manager

The project uses **uv** (`uv.lock`, `.python-version` → 3.11). Dependencies are managed via `pyproject.toml` with PDM as the build backend.

## No external secrets required

The demo app has no external service dependencies. No credentials are needed to run it.
