#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use log::LevelFilter;
use plugins::log::LogTarget;
use tauri::Manager;
use window_shadows::set_shadow;

mod command;
mod plugins;
mod server;
mod utils;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            #[cfg(any(windows, target_os = "macos"))]
            set_shadow(&main_window, true).unwrap();

            #[cfg(dev)]
            main_window.open_devtools();

            let cache_path = app.handle().path_resolver().app_cache_dir().unwrap();
            let port: u16 = 8720;
            server::start_static_file_server(cache_path, port);

            Ok(())
        })
        .plugin(plugins::websocket::init())
        .plugin(
            plugins::log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .level(LevelFilter::Info)
                .filter(|metadata| {
                    !metadata
                        .target()
                        .contains("tao::platform_impl::platform::event_loop::runner")
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            command::read_file,
            command::get_file_type,
            command::open_devtools,
            command::create_file_cache
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
