//! Runtime markdown blog loader.
//!
//! Posts live in `content/blog/*.md` with YAML-style frontmatter:
//!
//! ```markdown
//! ---
//! title: My Post Title
//! date: 2024-11-15
//! category: Event
//! excerpt: One-line summary shown on the listing page.
//! ---
//!
//! Full markdown body here…
//! ```
//!
//! Adding a new `.md` file requires no Rust rebuild — just a server restart
//! (or the cache expires after CACHE_TTL_SECS seconds on a live reload build).

use std::{
    fs,
    path::Path,
    sync::OnceLock,
    time::{Duration, Instant},
};

use pulldown_cmark::{html, Options, Parser};

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct BlogPost {
    pub slug:     String,
    pub title:    String,
    pub date:     String,
    pub category: String,
    pub excerpt:  String,
    pub html:     String,   // rendered body
}

// ── Cache: reload posts from disk at most every 60 s ─────────────────────────

const CACHE_TTL_SECS: u64 = 60;

struct Cache {
    posts:       Vec<BlogPost>,
    refreshed_at: Instant,
}

static CACHE: OnceLock<std::sync::Mutex<Option<Cache>>> = OnceLock::new();

fn cache() -> &'static std::sync::Mutex<Option<Cache>> {
    CACHE.get_or_init(|| std::sync::Mutex::new(None))
}

/// Returns all posts sorted newest-first, refreshing from disk if the TTL expired.
pub fn all_posts() -> Vec<BlogPost> {
    let mut guard = cache().lock().unwrap();
    let expired = guard.as_ref().map_or(true, |c| {
        c.refreshed_at.elapsed() > Duration::from_secs(CACHE_TTL_SECS)
    });

    if expired {
        let posts = load_from_disk();
        *guard = Some(Cache { posts: posts.clone(), refreshed_at: Instant::now() });
        posts
    } else {
        guard.as_ref().unwrap().posts.clone()
    }
}

/// Find a single post by slug.
pub fn find_post(slug: &str) -> Option<BlogPost> {
    all_posts().into_iter().find(|p| p.slug == slug)
}

// ── Disk loader ───────────────────────────────────────────────────────────────

fn load_from_disk() -> Vec<BlogPost> {
    let dir = Path::new("content/blog");
    if !dir.exists() {
        return Vec::new();
    }

    let mut posts: Vec<BlogPost> = fs::read_dir(dir)
        .unwrap()
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if path.extension()?.to_str()? != "md" {
                return None;
            }
            let raw = fs::read_to_string(&path).ok()?;
            parse_post(&path, &raw)
        })
        .collect();

    // Newest date first
    posts.sort_by(|a, b| b.date.cmp(&a.date));
    posts
}

// ── Frontmatter + Markdown parser ─────────────────────────────────────────────

fn parse_post(path: &Path, raw: &str) -> Option<BlogPost> {
    // Slug comes from filename without extension
    let slug = path.file_stem()?.to_str()?.to_string();

    // Split frontmatter (between first two `---` lines)
    let body = if raw.starts_with("---") {
        let rest = &raw[3..];
        let end = rest.find("\n---")?;
        let fm_str = &rest[..end];
        let body_start = end + 4; // skip "\n---"
        let body = rest.get(body_start..).unwrap_or("").trim_start();

        let title    = fm_value(fm_str, "title");
        let date     = fm_value(fm_str, "date");
        let category = fm_value(fm_str, "category");
        let excerpt  = fm_value(fm_str, "excerpt");

        return Some(BlogPost {
            slug,
            title:    title.unwrap_or_else(|| slug_to_title(path)),
            date:     date.unwrap_or_default(),
            category: category.unwrap_or_else(|| "Post".into()),
            excerpt:  excerpt.unwrap_or_default(),
            html:     md_to_html(body),
        });
    } else {
        raw
    };

    // No frontmatter — use filename as title, render full body
    Some(BlogPost {
        slug,
        title:    slug_to_title(path),
        date:     String::new(),
        category: "Post".into(),
        excerpt:  String::new(),
        html:     md_to_html(body),
    })
}

/// Extract a `key: value` line from a frontmatter block (strips quotes).
fn fm_value(fm: &str, key: &str) -> Option<String> {
    let prefix = format!("{}:", key);
    fm.lines()
        .find(|l| l.trim_start().starts_with(&prefix))
        .map(|l| {
            l.trim_start()
                .trim_start_matches(&prefix)
                .trim()
                .trim_matches('"')
                .trim_matches('\'')
                .to_string()
        })
        .filter(|s| !s.is_empty())
}

fn slug_to_title(path: &Path) -> String {
    path.file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Post")
        .replace('-', " ")
        .replace('_', " ")
        .split_whitespace()
        .map(|w| {
            let mut c = w.chars();
            match c.next() {
                None => String::new(),
                Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn md_to_html(md: &str) -> String {
    let mut opts = Options::empty();
    opts.insert(Options::ENABLE_STRIKETHROUGH);
    opts.insert(Options::ENABLE_TABLES);
    opts.insert(Options::ENABLE_SMART_PUNCTUATION);

    let parser = Parser::new_ext(md, opts);
    let mut html_out = String::with_capacity(md.len() * 2);
    html::push_html(&mut html_out, parser);
    html_out
}
