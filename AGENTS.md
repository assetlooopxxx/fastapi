# AGENTS.md

Notes for automated agents working in this repository (Base44 setup lives in
`docker-compose.base44.yml` and `.base44/environment.json`).

## What runs here

This repository is the FastAPI framework/library itself, so there is no
application entrypoint to boot. The runnable artifact is the **documentation
site**, which is what the Base44 preview shows on port 3000.

## Setup

```bash
docker compose -f docker-compose.base44.yml up -d
```

- Service `docs` uses the official `uv` image and runs, from the bind-mounted
  checkout:

  ```bash
  uv sync --locked --no-dev --group docs
  cd docs/en && zensical serve --config-file mkdocs.yml --dev-addr 0.0.0.0:8000
  ```

  This is the same live server as `uv run ./scripts/docs.py live` (which binds
  `127.0.0.1:8008` instead). It listens on 8000 inside the compose network only.
- Service `web` (`nginx:alpine`, config in `.base44/nginx.conf`) is the public
  entry point on host port 3000 and proxies to `docs:8000`.
- The virtualenv lives in the named volume `docs-venv` (`UV_PROJECT_ENVIRONMENT=/opt/venv`)
  so `uv sync` never writes `.venv/` into the repo checkout. The `uv-cache`
  volume keeps downloads between container recreations.
- No external credentials are needed: everything is local and offline apart
  from PyPI downloads during `uv sync`.
- `zensical serve` writes its build output to the git-ignored `docs/en/site/`.

## Non-obvious things worth knowing

- The docs only build correctly with **`docs/en` as the working directory**.
  Markdown includes are written as `{* ../../docs_src/... *}` and `mdx_include`
  resolves them relative to the current directory, so `/repo/docs/en` + `../..`
  is what points at the repo-root `docs_src/`. Serving the repo root instead
  silently renders pages with missing code blocks.
- The English build needs the `docs` dependency group (`mkdocstrings[python]`,
  `zensical`, `mdin` plugins). The reference pages import `fastapi`, `starlette`
  and `httpx` through mkdocstrings, so `uv sync` must install the project itself
  plus that group — not just the runtime dependencies.
- Translated languages are staged and built by `scripts/docs.py build-lang <lang>`
  from a copy in `site_zensical_src/`; only English is served live here.
- **Why the nginx service exists:** `zensical serve` appends a live-reload client
  to every HTML response that connects to a hardcoded `ws://` URL. The preview is
  served over HTTPS, so browsers block that socket (Mixed Content /
  `SecurityError: Failed to construct 'WebSocket'`). `.base44/nginx.conf` rewrites
  just that injected URL to `wss://` and proxies the upgraded connection back to
  `docs:8000`, so live reload works over the preview's TLS termination. The
  rewrite targets the injected `new WebSocket(\`ws://…` call only — `ws://` URLs
  shown inside documentation samples are left alone. If a future zensical version
  changes that injected snippet, the rewrite stops matching and the Mixed Content
  error returns; the fix is to update the `sub_filter` pattern.

## How to verify

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/            # 200
curl -s http://localhost:3000/tutorial/first-steps/ | grep -c 'from fastapi import FastAPI'   # 1 (include resolved)
curl -s http://localhost:3000/reference/fastapi/ | wc -c                   # large (mkdocstrings rendered)
docker compose -f docker-compose.base44.yml ps                             # status: healthy
```

Hot reload: editing a file under `docs/en/docs/` rebuilds the served page within
a few seconds (verified through the bind mount and through the proxy), so no
rebuild or restart is needed after documentation edits. Restart the service
(`docker compose -f docker-compose.base44.yml restart docs`) after changing
dependencies or files outside the watched docs directory.

## Tests and checks

Run only what is relevant to your change — these are the repository's own
commands, none of which are needed for the preview:

```bash
bash scripts/test.sh          # pytest (fastapi + docs_src)
bash scripts/lint.sh          # mypy + ruff
bash scripts/format.sh        # ruff check --fix + ruff format
uv run ./scripts/docs.py live # docs dev server on 127.0.0.1:8008
```

`pre-commit` also enforces `check-yaml`, trailing whitespace and end-of-file
fixers on changed files.
