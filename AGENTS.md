# Base44 Development Environment

## What this repo is

This is the **FastAPI framework** source repository (the library itself), not a web
application. It ships no runnable app, no frontend, and no built-in entry point, so a
branch taken straight from `master` has nothing for a preview to start.

## How it runs in the sandbox

`demo_app.py` at the repo root is a small demo app that imports `fastapi` from this
checkout. `docker-compose.base44.yml` runs it on port 3000 with live reload.

- **Compose**: `docker-compose.base44.yml` — one `python:3.11-slim` service, source
  bind-mounted at `/app`, labels describe it as the previewable `web` project (`/docs`
  is the API docs path).
- **Dependencies**: `uv` (pinned by `.python-version` → 3.11, lockfile `uv.lock`),
  installed on container start with `uv sync --locked --extra standard --no-dev`.
  `fastapi` itself is installed editable from `/app`, so edits to `fastapi/` are picked
  up by the running server.
- **The virtualenv lives outside the checkout** at `/opt/venv`
  (`UV_PROJECT_ENVIRONMENT=/opt/venv`, backed by the `app-deps` named volume). `.venv`
  is not in `.gitignore`, so letting `uv` create it at the repo root would leave ~54 MB
  of untracked files in the working tree.
- **Run command**: `uv run uvicorn demo_app:app --host 0.0.0.0 --port 3000 --reload`
  (uvicorn binds `0.0.0.0` and does not check the `Host` header, so the preview proxy
  host works as-is).
- **Healthcheck**: `python -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/')"`
  — the system `python` on `python:3.11-slim` has only the stdlib, so the check must not
  import `fastapi`; use `uv run python` for that.

## How to verify the app works

```bash
docker compose -f docker-compose.base44.yml up -d
curl -s http://localhost:3000/          # JSON welcome message
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/docs   # 200, Swagger UI
docker compose -f docker-compose.base44.yml logs --tail=20          # expect live-reload lines
```

`demo_app.py` keeps items in memory (no database), so a container restart clears them.
No migrations or seeds are needed, and the app needs no external secrets.

## Notes for changes in this repo

- **The framework is the product**: a change here usually belongs in `fastapi/`, with
  tests in `tests/`. Run only the tests covering the change, e.g.
  `uv run --no-sync pytest tests/test_telemetry/test_runtime.py -q`.
- **Telemetry defaults changed in 0.143.0**: automatic OTLP exporter setup is opt-in
  (`FASTAPI_OTEL_AUTO_CONFIGURE=true` or `FastAPI(telemetry={"auto_configure": True})`).
  With the default (unset) the exporter setup is skipped entirely, and when it does run
  its failures are logged as warnings by the lifespan wrapper — telemetry never blocks
  app startup.
- **Docs**: `uv run ./scripts/docs.py build-lang en` builds the English docs site
  (zensical) and is a good smoke check for documentation changes.
