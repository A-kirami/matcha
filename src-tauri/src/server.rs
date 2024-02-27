use crate::utils::get_unused_port;
use std::net::TcpListener;
use std::path::PathBuf;
use warp::Filter;

pub fn start_static_file_server(cache_path: PathBuf, port: u16) {
    let port = match TcpListener::bind(("127.0.0.1", port)) {
        Ok(_) => port,
        Err(_) => get_unused_port(),
    };

    let static_route = warp::path("matcha")
        .and(warp::path("cache"))
        .and(warp::path::param::<String>())
        .and_then(move |file: String| {
            let file_path = cache_path.join("cache").join(file);
            async move {
                if file_path.exists() {
                    let content = std::fs::read(file_path).unwrap();
                    Ok(warp::http::Response::builder()
                        .header("Content-Type", "application/octet-stream")
                        .body(content)
                        .unwrap())
                } else {
                    Err(warp::reject::not_found())
                }
            }
        });

    let cors = warp::cors().allow_any_origin().allow_methods(vec!["GET"]);

    let routes = static_route.with(cors);

    tauri::async_runtime::spawn(async move {
        warp::serve(routes).run(([127, 0, 0, 1], port)).await;
    });
}
