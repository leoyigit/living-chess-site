use axum::response::{IntoResponse, Response};
use axum::http::{header, StatusCode};

const BASE_URL: &str = "https://www.livingchess.net";

pub async fn robots() -> Response {
    let body = format!(
        "User-agent: *\nAllow: /\nSitemap: {BASE_URL}/sitemap.xml\n"
    );
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        body,
    )
        .into_response()
}

pub async fn llms_txt() -> Response {
    let body = format!(
r#"# Living Chess

> Living Chess is a social experiment and performative research format in which every participant controls exactly one chess piece on a shared board. No single player controls the game — every move is decided collectively through a structured three-stage decision cycle. It operates at the intersection of game design, social science, theatre, and collective intelligence research.

## What Is Living Chess

Living Chess transforms the chess board into a social laboratory. Each of the 20 seats in a session corresponds to one chess piece. Participants do not play against each other — they must negotiate, propose, and vote to produce a single move for their piece on every turn. The game explores how groups form opinions, how hierarchy and democratic process interact, and how collective identity emerges under constraint.

The project is simultaneously:
- A live game format (sessions run weekly, online and in-person)
- A sociological observation instrument (MBTI types mapped to chess roles)
- A performative format for theatre and media adaptation
- A research platform for distributed decision-making and collective intelligence

## The Decision Cycle

Every move in Living Chess passes through four phases:

1. **Suggestion** — Any participant may propose a move for their piece. All proposals are visible to the group. This phase is open and democratic.
2. **Curation** — The King reviews all suggestions and selects exactly 3 to advance. The King never votes and never makes a move on the board. Curation is the King's sole power.
3. **Weighted Vote** — All participants except the King vote on the 3 curated proposals. Votes are weighted by piece rank.
4. **The Move** — The highest-weighted proposal is executed on the board.

## Piece Weights and Roles

Each piece carries a vote weight reflecting its classical chess value:

| Piece  | Vote Weight | Special Rule |
|--------|-------------|--------------|
| Pawn   | 1.0         | Standard voter |
| Knight | 3.0         | Standard voter |
| Bishop | 3.5         | Standard voter |
| Rook   | 5.0         | Standard voter |
| Queen  | 9.0         | Standard voter |
| King   | —           | Curates only, never votes, never moves by choice |

The King's restriction is absolute: the King role has a hard rule of never voting and never initiating a move. The King's power is purely curatorial — shaping which options the group can choose from.

## Sessions

- Schedule: Sundays at 18:00 CET
- Capacity: 20 participants per session
- Format: Online (live game platform at game.livingchess.net) and in-person events
- Registration: {BASE_URL}/#testplays

## Team

- **Azad Heydarov** — CEO & Co-Founder. Drives the project's vision, creates the concept, guides the research agenda and scripting, and coordinates teams so everything develops into a coherent whole.
- **Firangiz Aslanova** — CTO & Co-Founder. Leads technical strategy and decisions, transforming conceptual needs into working systems so the tech always supports creative and research goals.
- **Leo Yiğit Ekiz** — Creative Director & System Architect. Designs the visual identity and overall aesthetic concept — guiding the creative vision and structural framework of the website, digital products, and platforms.
- **Jamal Aslanov** — System Engineer. Maintains the stability of the machinery — managing infrastructure and internal systems so the team can move quickly without coordination friction.
- **Asmar Khalilli** — Unity Programmer & XR Developer. Creates the interactive, spatial components of Living Chess — prototyping immersive experiences and bringing the game into 3D and XR.
- **Orkhan Imanov** — Research & Development Lead. Provides intellectual guidance — developing theoretical frameworks, overseeing academic validation, and connecting practice with interdisciplinary research.
- **Emre Can Alptekin** — Media & Adaptation Director. Translates gameplay into film and narrative form — developing the adaptation strategy and guiding how gameplay becomes story across media platforms.
- **Elshan Poladli** — CFO. Ensures financial stability — overseeing budgeting, resource planning, and developing sustainable pathways for digital products and media adaptations.

## Research Context

Living Chess has been presented at multiple academic and innovation venues:

- **Arqus International Innovators Award 2024** — Selected as finalist, representing the University of Wrocław under the title "Intertwining Chess with Theatre".
- **7th KISMIF Conference, Porto 2024** — Azad Heydarov presented "Exploring Collective Decision-Making Through the Living Chessboard" at the DIY Cultures, Democracy and Creative Participation conference.
- **Falling Walls Lab Wrocław 2024** — First public presentation of the project's logic and role-based structure.
- **25th International Conference Communication & Culture 2025** — Firangiz Aslanova presented Living Chess as a performative format enabling collaborative, embodied interaction and social-science observation.
- **24th International Conference Communication & Culture 2024** — Shabnam Mammadova presented Living Chess as a conceptual proposal, mapping MBTI types with chess piece roles to frame a sociological observation instrument.
- **CreateCulture Lab Sprint, Vilnius 2024** — First accelerator sprint; team formation and structural design phase.

## Technology

- Backend: Rust with Axum 0.7 (async HTTP server)
- Templates: Askama 0.12 (compile-time Jinja2-style templates)
- Blog/News: Runtime Markdown rendering via pulldown-cmark, 60-second disk cache
- Hosting: Railway (Docker-based deployment, auto-deploy on git push)
- Live game platform: game.livingchess.net (separate system)

## Pages

- [Home]({BASE_URL}/): Hero, four-phase decision cycle animation, interactive walkthrough, experiments timeline, testplay registration, team, news, newsletter
- [Blog]({BASE_URL}/blog): In-depth research articles and long-form writing from the team
- [News]({BASE_URL}/news): Conference appearances, awards, sprint reports, and project milestones
- [TechLab]({BASE_URL}/techlab): Technology research, system architecture, and XR development updates
- [Sitemap]({BASE_URL}/sitemap.xml): Full list of all pages and posts

## Contact and Links

- Website: {BASE_URL}
- Live game: https://game.livingchess.net/auth
- Facebook: https://www.facebook.com/livingchessofficial/
- Instagram: https://www.instagram.com/livingchessofficial/
- LinkedIn: https://www.linkedin.com/company/livingchess/
"#
    );
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        body,
    )
        .into_response()
}

pub async fn sitemap() -> Response {
    let blog_posts = crate::blog::all_posts();
    let news_posts = crate::news::all_posts();

    let mut urls = vec![
        url_entry(BASE_URL, "weekly", "1.0"),
        url_entry(&format!("{BASE_URL}/blog"),    "weekly", "0.8"),
        url_entry(&format!("{BASE_URL}/news"),    "weekly", "0.8"),
        url_entry(&format!("{BASE_URL}/techlab"), "monthly", "0.6"),
    ];

    for post in &blog_posts {
        urls.push(url_entry_dated(
            &format!("{BASE_URL}/blog/{}", post.slug),
            &post.date,
            "monthly",
            "0.7",
        ));
    }

    for post in &news_posts {
        urls.push(url_entry_dated(
            &format!("{BASE_URL}/news/{}", post.slug),
            &post.date,
            "monthly",
            "0.7",
        ));
    }

    let xml = format!(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
         <urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n\
         {}\
         </urlset>",
        urls.join("\n")
    );

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "application/xml; charset=utf-8")],
        xml,
    )
        .into_response()
}

fn url_entry(loc: &str, changefreq: &str, priority: &str) -> String {
    format!(
        "  <url>\n    <loc>{loc}</loc>\n    <changefreq>{changefreq}</changefreq>\n    <priority>{priority}</priority>\n  </url>"
    )
}

fn url_entry_dated(loc: &str, lastmod: &str, changefreq: &str, priority: &str) -> String {
    format!(
        "  <url>\n    <loc>{loc}</loc>\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>{changefreq}</changefreq>\n    <priority>{priority}</priority>\n  </url>"
    )
}
