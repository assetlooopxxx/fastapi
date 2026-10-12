# AGENTS.md — Mitaka Work & Life Landing Page

## Project Overview
This repository is the **FastAPI framework** source. A standalone landing page app
for the "Mitaka Work & Life Cycle Ecosystem" (ミタカ・ワーク＆ライフ循環エコシステム)
lives under `landing/` and is served by a minimal FastAPI app.

## Landing Page App (`landing/`)
- **Entry point:** `landing/main.py` — FastAPI app serving `landing/templates/index.html`
  at `/` and mounting `landing/static/` for CSS/JS.
- **Design system:** "Kinetic Hearth Architecture" — see `landing/static/css/style.css`
  for the full token set (colors, fonts, spacing).
  - Colors: Oxide Red `#A3432F`, Deep Harbor `#1E2A39`, Cyber Lime `#DFFF00`, Stone Paper `#F5F2ED`
  - Fonts: Zen Old Mincho (headlines), Inter (body), JetBrains Mono (metadata) — via Google Fonts
- **Interactions:** `landing/static/js/main.js` — hero decision slider, parallax,
  kinetic reveal (IntersectionObserver), FAQ accordion.
- **Key design elements:** L-Beam frames (2px corner borders), blueprint grid
  backgrounds on plan cards, "Check Eligibility" CTA buttons, 56px min touch targets,
  3px Cyber Lime focus outlines.

## Running the App
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Serves on **port 3000** via uvicorn with `--reload`.
- Installs the local FastAPI package (`pip install -e .`) plus uvicorn on first boot.
- Healthcheck: `GET /` returns 200.

## Content Notes
- LINE URLs (`https://line.me/R/ti/p/@your_line_id`) are placeholders — replace with
  the real LINE friend-add URL before going live.
- OG image URL (`https://example.com/ogp.jpg`) is a placeholder.
- Plan prices are tax-inclusive minimum monthly amounts.
