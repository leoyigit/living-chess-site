# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

Port the HTML/JS prototype at `/Users/leo/Downloads/LivingChess_HTML_Prototype/` into a full Rust web project. The live site is at `www.livingchess.net`.

Living Chess is a social experiment where each participant controls one chess piece. Moves go through three stages: open **Suggestion** → King **Curation** (picks 3) → **Weighted vote** (piece rank = vote weight) → **The move**. The King curates but never votes.

## Prototype Structure

The prototype is a single-page site with these JS modules:

- `assets/hero.js` — animated SVG board in the hero section showing the 4-phase decision cycle in a loop
- `assets/walkthrough.js` — interactive "How it works" demo: user can propose moves, watch King curate, cast a weighted vote, see result
- `assets/site.js` — nav scroll behavior, team cards, Saturday 18:00 CET countdown timer, date picker (next 5 Saturdays, 12 seats cap), registration and newsletter form wire-up, and a "Tweaks" panel (accent color, font, hero animation mode, film grain)

Page sections (in order): Hero → How it works → Experiments → Testplays (registration) → Get involved → Team → News → Newsletter → Footer

## Theming System

The `__TWEAKS` block in the HTML drives runtime theming:
- **Accent palettes**: `duo` (gold + blue), `gold`, `amber`, `amber + teal`, `rose`
- **Headline fonts**: `serif` (Spectral), `didone`, `grotesk` (Hanken Grotesk)
- **Hero animation**: `flow`, `calm`, `off`
- **Film grain**: `on` / `off`

CSS custom properties (`--gold`, `--gold-soft`, `--gold-deep`, `--blue`, `--blue-soft`) are swapped at runtime based on the active palette.

## Stack

- **Axum 0.7** — HTTP server + routing
- **Askama 0.12** — compile-time Jinja2-style templates (`templates/index.html`)
- **tower-http** — gzip/br compression, static file serving (`/static/*`), tracing
- **chrono** — server-side Saturday session date computation

## Commands

```bash
cargo run          # dev server on http://localhost:3000
cargo build        # debug build
cargo build -r     # release (LTO, stripped)
cargo check        # fast type-check without linking
cargo clippy       # lint
cargo test         # tests

PORT=8080 cargo run           # custom port
RUST_LOG=debug cargo run      # verbose logging
```

## Architecture

```
src/
  main.rs         — router, middleware stack (compression + tracing), server bind
  config.rs       — Tweaks, TeamMember, NewsItem, SessionDate; all static site data
  routes/
    pages.rs      — GET /  →  IndexTemplate (Askama)
    api.rs        — POST /api/register, POST /api/newsletter (JSON in/out)
templates/
  index.html      — single Askama template; all 8 page sections
static/assets/
  living-chess.css — full design system (served verbatim)
  hero.js          — animated SVG board (4-phase decision cycle)
  walkthrough.js   — interactive "How it works" demo
  site.js          — nav, countdown, date picker, form fetch calls, tweaks panel
```

Dynamic data rendered server-side: session dates (next 5 Saturdays, `config::next_session_dates()`), team members, news items, tweaks defaults (`window.__TWEAKS` JSON block).

Client-side JS is kept for: countdown timer (ticks every second), walkthrough interactivity, hero SVG animation, tweaks panel state.

Askama does not have a built-in `enumerate` filter — use index/is_first fields on structs instead of trying to enumerate in templates.

## Railway Deployment

The app is deployed via Docker (see `Dockerfile`). Railway builds the image and runs `./living_chess`.

**Port binding:** The app reads the `PORT` env var (Railway injects this automatically). Default fallback is `3000` for local dev. Railway currently assigns `PORT=8080` — the Networking target port in Railway Settings must match (currently set to 8080).

**Static files & content:** `static/` and `content/` are copied into the Docker image at build time. The Nixpacks default only copies the binary, so a custom `Dockerfile` is required.

**Manual deploy via CLI (when auto-deploy from GitHub doesn't trigger):**
```bash
npx @railway/cli@latest login   # opens browser auth
npx @railway/cli@latest link    # select the living-chess-site project
npx @railway/cli@latest up      # deploy current branch
```
Run these from the project root. `railway` is not installed globally — always use `npx @railway/cli@latest`.

**Common 502 causes:**
- Target port in Railway Settings → Networking doesn't match `PORT` — fix by editing the domain entry and setting the correct port
- `[[deploy.environmentVariables]]` in `railway.toml` is not a supported field — never use it to inject env vars; set them in the Railway dashboard Variables tab instead
- Dependency requires a newer Rust version than the Dockerfile specifies — check the error and bump `FROM rust:X.XX-slim-bookworm`

## Key Design Constraints

- Sessions run every Saturday at 18:00 CET; the countdown and date picker logic must stay accurate across timezones
- Seat capacity is 12 per session; piece weights are fixed: Pawn 1.0, Knight 3.0, Bishop 3.5, Rook 5.0, Queen 9.0, King curates only
- The King role has a hard rule: never votes, only curates 3 proposals from the full list
