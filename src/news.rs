use std::{
    fs,
    path::Path,
    sync::OnceLock,
    time::{Duration, Instant},
};

use pulldown_cmark::{html, Options, Parser};

#[derive(Debug, Clone)]
pub struct NewsPost {
    pub slug:        String,
    pub title:       String,
    pub date:        String,
    pub category:    String,
    pub excerpt:     String,
    pub link:        Option<String>,
    pub author:      String,
    pub author_role: String,
    pub author_slug: String,
    pub read_time:   usize,
    pub html:        String,
}

const CACHE_TTL_SECS: u64 = 60;

struct Cache {
    posts:        Vec<NewsPost>,
    refreshed_at: Instant,
}

static CACHE: OnceLock<std::sync::Mutex<Option<Cache>>> = OnceLock::new();

fn cache() -> &'static std::sync::Mutex<Option<Cache>> {
    CACHE.get_or_init(|| std::sync::Mutex::new(None))
}

pub fn all_posts() -> Vec<NewsPost> {
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

pub fn find_post(slug: &str) -> Option<NewsPost> {
    all_posts().into_iter().find(|p| p.slug == slug)
}

pub fn posts_by_author(author_slug: &str) -> Vec<NewsPost> {
    all_posts().into_iter().filter(|p| p.author_slug == author_slug).collect()
}

fn load_from_disk() -> Vec<NewsPost> {
    let dir = Path::new("content/news");
    if !dir.exists() {
        return Vec::new();
    }
    let mut posts: Vec<NewsPost> = fs::read_dir(dir)
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
    posts.sort_by(|a, b| b.date.cmp(&a.date));
    posts
}

fn parse_post(path: &Path, raw: &str) -> Option<NewsPost> {
    let slug = path.file_stem()?.to_str()?.to_string();

    if raw.starts_with("---") {
        let rest = &raw[3..];
        let end = rest.find("\n---")?;
        let fm_str = &rest[..end];
        let body = rest.get(end + 4..).unwrap_or("").trim_start();

        let author = fm_value(fm_str, "author").unwrap_or_else(|| "Living Chess".to_string());
        let author_slug = to_slug(&author);

        return Some(NewsPost {
            slug,
            title:       fm_value(fm_str, "title").unwrap_or_else(|| slug_to_title(path)),
            date:        fm_value(fm_str, "date").unwrap_or_default(),
            category:    fm_value(fm_str, "category").unwrap_or_else(|| "News".into()),
            excerpt:     fm_value(fm_str, "excerpt").unwrap_or_default(),
            link:        fm_value(fm_str, "link"),
            author_role: fm_value(fm_str, "author_role").unwrap_or_default(),
            read_time:   estimate_read_time(body),
            html:        md_to_html(body),
            author_slug,
            author,
        });
    }

    let author = "Living Chess".to_string();
    let author_slug = to_slug(&author);
    Some(NewsPost {
        slug,
        title:       slug_to_title(path),
        date:        String::new(),
        category:    "News".into(),
        excerpt:     String::new(),
        link:        None,
        author_role: String::new(),
        read_time:   estimate_read_time(raw),
        html:        md_to_html(raw),
        author_slug,
        author,
    })
}

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

fn to_slug(s: &str) -> String {
    s.chars()
        .map(|c| if c.is_alphanumeric() { c.to_ascii_lowercase() } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

fn estimate_read_time(text: &str) -> usize {
    std::cmp::max(1, text.split_whitespace().count() / 200)
}

fn slug_to_title(path: &Path) -> String {
    path.file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Post")
        .replace('-', " ").replace('_', " ")
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
    let mut out = String::with_capacity(md.len() * 2);
    html::push_html(&mut out, parser);
    out
}
