use askama::Template;
use askama_axum::IntoResponse;
use axum::{extract::Path, http::StatusCode, response::Response};

use crate::blog::{self, BlogPost};

// ── Blog listing ──────────────────────────────────────────────────────────────

#[derive(Template)]
#[template(path = "blog_list.html")]
pub struct BlogListTemplate {
    pub posts: Vec<BlogPost>,
}

pub async fn list() -> impl IntoResponse {
    BlogListTemplate { posts: blog::all_posts() }
}

// ── Single post ───────────────────────────────────────────────────────────────

#[derive(Template)]
#[template(path = "blog_post.html")]
pub struct BlogPostTemplate {
    pub post: BlogPost,
}

pub async fn post(Path(slug): Path<String>) -> Response {
    use axum::response::IntoResponse as _;
    match blog::find_post(&slug) {
        Some(post) => BlogPostTemplate { post }.into_response(),
        None       => (StatusCode::NOT_FOUND, "Post not found").into_response(),
    }
}
