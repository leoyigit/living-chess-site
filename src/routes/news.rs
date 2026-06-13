use askama::Template;
use askama_axum::IntoResponse;
use axum::{extract::Path, http::StatusCode, response::Response};

use crate::news::{self, NewsPost};

#[derive(Template)]
#[template(path = "news_list.html")]
struct NewsListTemplate {
    posts:        Vec<NewsPost>,
    filter_label: Option<String>,
}

#[derive(Template)]
#[template(path = "news_post.html")]
struct NewsPostTemplate {
    post:      NewsPost,
    by_author: Vec<NewsPost>,
}

pub async fn list() -> impl IntoResponse {
    NewsListTemplate { posts: news::all_posts(), filter_label: None }
}

pub async fn by_author(Path(author_slug): Path<String>) -> Response {
    use axum::response::IntoResponse as _;
    let posts = news::posts_by_author(&author_slug);
    let filter_label = posts.first().map(|p| p.author.clone());
    NewsListTemplate { posts, filter_label }.into_response()
}

pub async fn post(Path(slug): Path<String>) -> Response {
    use axum::response::IntoResponse as _;
    match news::find_post(&slug) {
        Some(post) => {
            let author_slug = post.author_slug.clone();
            let by_author = news::posts_by_author(&author_slug)
                .into_iter()
                .filter(|p| p.slug != slug)
                .take(3)
                .collect();
            NewsPostTemplate { post, by_author }.into_response()
        }
        None => (StatusCode::NOT_FOUND, "Post not found").into_response(),
    }
}
