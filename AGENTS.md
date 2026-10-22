# Base44 Development Environment

## What this repo is

This is the **FastAPI framework** source repository (the library itself), not a web
application. It ships no runnable app, no frontend, and no built-in entry point, so a
branch taken straight from `master` has nothing for a preview to start.

Two things give the sandbox something to serve:

- `landing/` — the **Mitaka Work & Life Circular Ecosystem** landing page (`landing/static/`),
  served by a minimal FastAPI app. **This is what the preview on port 3000 shows.**
- `demo_app.py` at the repo root — a small FastAPI demo app kept from an earlier setup.
  It is still runnable by hand (`uv run uvicorn demo_app:app --port 3000`) but compose no
  longer starts it.

## The landing page (`landing/`)

- **App**: `landing/main.py` — one `app.frontend("/", directory=landing/static)` call.
  That serves `landing/static/index.html` at `/` and every asset under `landing/static/`
  (`/css/style.css`, `/js/main.js`, `/img/*.jpg`) as low-priority routes.
- **No template engine, no build step**: plain HTML/CSS/JS, so an edit to any file is
  visible on the next request (uvicorn `--reload` only matters for `landing/main.py`).
- **Design system** ("Regenerative Minimalism" / The Mitaka Pulse) — tokens live at the
  top of `landing/static/css/style.css`:
  - Basalt Ink `#1A1C1E`, Morning Mist `#F2F4F3`, Moss Kinetic `#2D5A27`, Ochre Sun `#C88B44`
  - Plus Jakarta Sans (headings, 800), Noto Sans JP (body), JetBrains Mono (prices/labels)
  - Sections are numbered `01 — BARRIERS & SHIFT` … `04 — START`; the 1px "Circularity
    Line" SVG plus the grain overlay in `--grain` carry the visual motif.
- **Interactions** (`landing/static/js/main.js`): floating glass menu, staggered-lift
  reveal on scroll, the horizontally scrolling barrier timeline (the centred card shifts
  from grey to Moss), the plan toggle that re-orders the cards with a FLIP animation, and
  a light hero parallax. Everything is skipped under `prefers-reduced-motion: reduce`.
- **Images**: `landing/static/img/*.jpg` are Unsplash placeholders (free licence, no
  attribution required) downloaded at build-free time — hero and mobility card
  `photo-1558981806-ec527fa84c39`, van card `photo-1543465077-db45d34b88a5`, housing card
  `photo-1554118811-1e0d58224f24`, life band `photo-1523217582562-09d0def993a6`. Replace
  them with real Mitaka photography before launch; the page already labels them
  "写真はイメージです".
- **Member registration form** (`#contact`): customers enter their name and LINE ID (or the
  phone number registered with LINE). `landing/static/js/main.js` POSTs it to
  `POST /api/register` (`landing/main.py`), which appends a JSON line to
  `landing/data/registrations.jsonl` (git-ignored runtime data). There is no LINE friend-add
  URL any more; all CTAs scroll to `#contact`.

## How it runs in the sandbox

- **Compose**: `docker-compose.base44.yml` — one `python:3.11-slim` service, source
  bind-mounted at `/app`, labels describe it as the previewable `web` project on port 3000.
- **Dependencies**: `uv` (pinned by `.python-version` → 3.11, lockfile `uv.lock`),
  installed on container start with `uv sync --locked --extra standard --no-dev`.
  `fastapi` itself is installed editable from `/app`, so edits to `fastapi/` are picked
  up by the running server.
- **The virtualenv lives outside the checkout** at `/opt/venv`
  (`UV_PROJECT_ENVIRONMENT=/opt/venv`, backed by the `app-deps` named volume). `.venv`
  is not in `.gitignore`, so letting `uv` create it at the repo root would leave ~54 MB
  of untracked files in the working tree.
- **Run command**: `uv run uvicorn landing.main:app --host 0.0.0.0 --port 3000 --reload --reload-dir landing`
  (uvicorn binds `0.0.0.0` and does not check the `Host` header, so the preview proxy
  host works as-is).
- **Healthcheck**: a stdlib-only `python -c` that fetches `/` and `/css/style.css` and
  asserts both return a non-empty body — so a page that loads while its stylesheet 404s
  still counts as unhealthy. The system `python` on `python:3.11-slim` has only the
  stdlib, so the check must not import `fastapi`; use `uv run python` for that.

## How to verify the app works

```bash
docker compose -f docker-compose.base44.yml up -d
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/                   # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/css/style.css      # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/js/main.js         # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/img/hero-mobility.jpg  # 200
curl -s http://localhost:3000/ | grep -q 'だれにでも' && echo 'landing page served'
docker compose -f docker-compose.base44.yml logs --tail=20                        # expect uvicorn reload lines
```

In the browser, check that the centred barrier card turns green as you scroll the
timeline horizontally, and that the "モビリティ中心 / 住まい中心" switch re-orders the plan
cards. No database, migrations, seeds or external secrets are involved.

## Notes for changes in this repo

- **The framework is the product**: a change here usually belongs in `fastapi/`, with
  tests in `tests/`. Run only the tests covering the change, e.g.
  `uv run --no-sync pytest tests/test_telemetry/test_runtime.py -q`.
- **Landing page changes belong in `landing/static/`** and need no test suite; verify them
  by curling the files above and loading the page.
- **Telemetry defaults changed in 0.143.0**: automatic OTLP exporter setup is opt-in
  (`FASTAPI_OTEL_AUTO_CONFIGURE=true` or `FastAPI(telemetry={"auto_configure": True})`).
  With the default (unset) the exporter setup is skipped entirely, and when it does run
  its failures are logged as warnings by the lifespan wrapper — telemetry never blocks
  app startup.
- **Docs**: `uv run ./scripts/docs.py build-lang en` builds the English docs site
  (zensical) and is a good smoke check for documentation changes.
