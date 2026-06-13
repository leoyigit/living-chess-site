use askama::Template;
use askama_axum::IntoResponse;

#[derive(Template)]
#[template(path = "techlab.html")]
pub struct TechLabTemplate {}

pub async fn page() -> impl IntoResponse {
    TechLabTemplate {}
}
