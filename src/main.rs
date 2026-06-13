use axum::{routing::{get, post}, Router};
use tower_http::{
    compression::CompressionLayer,
    services::ServeDir,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod blog;
mod config;
mod routes;

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "living_chess=debug,tower_http=info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let app = Router::new()
        // Pages
        .route("/",                    get(routes::pages::index))
        .route("/techlab",             get(routes::techlab::page))
        // Blog
        .route("/blog",                get(routes::blog::list))
        .route("/blog/:slug",          get(routes::blog::post))
        // API
        .route("/api/register",        post(routes::api::register))
        .route("/api/newsletter",      post(routes::api::newsletter))
        // Static
        .nest_service("/static",       ServeDir::new("static"))
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http());

    let addr = std::env::var("BIND")
        .unwrap_or_else(|_| "0.0.0.0:3000".into());

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Listening on http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
