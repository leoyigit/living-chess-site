# Living Chess — Web

The official website for [livingchess.net](https://www.livingchess.net) — a live social experiment where each participant controls one chess piece, and every move is decided collectively through a three-stage process: open suggestion → King curation → weighted vote.

Built with Rust for performance, simplicity, and zero cold-start overhead.

**Live prototype:** [living-chess-site-production.up.railway.app](https://living-chess-site-production.up.railway.app)

---

## Stack

| Layer | Tech |
|---|---|
| Server | [Axum 0.7](https://github.com/tokio-rs/axum) + Tokio async runtime |
| Templates | [Askama 0.12](https://github.com/djc/askama) — compile-time Jinja2-style |
| Static files | tower-http `ServeDir` with gzip + brotli compression |
| Blog | Runtime Markdown via [pulldown-cmark](https://github.com/raphlinus/pulldown-cmark), 60s disk cache |
| Dates | [chrono](https://github.com/chronotope/chrono) — server-side session date computation |

---

## Project Structure

```
src/
  main.rs           router, middleware stack, server bind
  config.rs         team, news, session dates, theming defaults
  blog.rs           runtime Markdown loader with TTL cache
  routes/
    pages.rs        GET /
    blog.rs         GET /blog, GET /blog/:slug
    techlab.rs      GET /techlab
    api.rs          POST /api/register, POST /api/newsletter

templates/
  index.html        single-page Askama template (all sections)
  blog_list.html    blog listing page
  blog_post.html    individual post with rendered Markdown
  techlab.html      TechLab page

static/assets/
  living-chess.css      core design system
  living-chess-patch.css  hero image, mobile nav, component patches
  blog.css              blog + prose styles
  hero.js               animated SVG board (4-phase decision cycle)
  walkthrough.js        interactive "How it works" demo
  site.js               nav, countdown, forms, tweaks panel, mobile menu

content/blog/           Markdown posts — drop new .md files here, no rebuild needed
```

---

## Running Locally

```bash
cargo run
# → http://localhost:3000
```

```bash
PORT=8080 cargo run            # custom port
RUST_LOG=debug cargo run       # verbose logs
```

```bash
cargo build -r   # optimised release build (LTO, stripped)
```

---

## Adding a Blog Post

Create a `.md` file in `content/blog/` with YAML frontmatter:

```markdown
---
title: "Post Title"
date: "2025-06-13"
category: "Event"
excerpt: "One sentence shown on the listing page."
---

## Your content here

Full Markdown body — tables, strikethrough, smart quotes all supported.
```

The filename becomes the URL slug: `my-post-title.md` → `/blog/my-post-title`.

No rebuild required. The server picks up new posts within 60 seconds.

---

## How It Works

Living Chess runs on a three-stage decision cycle each session:

1. **Suggestion** — any participant proposes a move for their piece
2. **Curation** — the King selects 3 proposals from the full list (never votes)
3. **Weighted vote** — participants vote; piece rank = vote weight (Pawn 1 · Knight 3 · Bishop 3.5 · Rook 5 · Queen 9)

Sessions run on Sundays at 18:00 CET, 20 seats per game.

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, how it works, experiments, testplays, team, news |
| `/blog` | Post listing |
| `/blog/:slug` | Individual post |
| `/techlab` | Technology research page |
| `POST /api/register` | Session registration |
| `POST /api/newsletter` | Newsletter signup |

---

## Deployment

Deployed on [Railway](https://railway.app) via Docker — every push to `main` triggers an automatic redeploy.

**Live prototype:** [living-chess-site-production.up.railway.app](https://living-chess-site-production.up.railway.app)

Railway builds the `Dockerfile`, which produces a minimal Debian image containing the binary, `static/`, and `content/`. Railway injects `PORT` automatically — the app binds to `0.0.0.0:$PORT`.

**Railway networking:** The target port in Settings → Networking must match the `PORT` Railway injects (currently `8080`). If you see a 502, this is the first thing to check.

**Variables:** Never set `PORT` manually in Railway's Variables tab — Railway injects it automatically based on the networking target port. Do not use `[[deploy.environmentVariables]]` in `railway.toml`; it is not a supported field.

**Manual deploy via CLI** (when auto-deploy from GitHub doesn't trigger):

```bash
npx @railway/cli@latest login   # opens browser auth
npx @railway/cli@latest link    # select living-chess-site project
npx @railway/cli@latest up      # deploy current branch
```

> `railway` is not installed globally — always use `npx @railway/cli@latest`.

For a custom VPS:

```bash
cargo build -r
PORT=80 ./target/release/living_chess
```

Set `RUST_LOG=living_chess=info,tower_http=warn` for production log level.
