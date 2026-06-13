use askama::Template;
use askama_axum::IntoResponse;

use crate::config::{self, NewsItem, SessionDate, TeamMember, Tweaks};

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    pub tweaks:        Tweaks,
    pub tweaks_json:   String,
    pub session_dates: Vec<SessionDate>,
    pub team:          Vec<TeamMember>,
    pub news:          Vec<NewsItem>,
}

pub async fn index() -> impl IntoResponse {
    let tweaks = Tweaks::default();
    let tweaks_json = tweaks.to_json();
    IndexTemplate {
        tweaks,
        tweaks_json,
        session_dates: config::next_session_dates(),
        team:          config::team(),
        news:          config::news_items(),
    }
}
