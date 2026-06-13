use axum::{extract::Json, http::StatusCode, response::IntoResponse};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct RegisterPayload {
    pub name:       String,
    pub email:      String,
    pub piece_pref: Option<String>,
    pub date_idx:   Option<u32>,
}

#[derive(Deserialize)]
pub struct NewsletterPayload {
    pub email: String,
}

pub async fn register(Json(payload): Json<RegisterPayload>) -> impl IntoResponse {
    let name  = payload.name.trim().to_string();
    let email = payload.email.trim().to_string();
    let _     = (payload.piece_pref, payload.date_idx); // reserved for DB

    if name.len() < 2 || !email.contains('@') {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(serde_json::json!({ "ok": false, "error": "Invalid name or email." })),
        );
    }

    // TODO: persist to database / send confirmation email
    tracing::info!(name, email, "New registration");

    (
        StatusCode::OK,
        Json(serde_json::json!({ "ok": true, "message": "Seat reserved — see you Saturday!" })),
    )
}

pub async fn newsletter(Json(payload): Json<NewsletterPayload>) -> impl IntoResponse {
    let email = payload.email.trim().to_string();

    if !email.contains('@') || email.len() < 4 {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(serde_json::json!({ "ok": false, "error": "Invalid email address." })),
        );
    }

    // TODO: add to mailing list
    tracing::info!(email, "Newsletter subscription");

    (
        StatusCode::OK,
        Json(serde_json::json!({ "ok": true, "message": "Subscribed." })),
    )
}
