use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind, TimezoneStrategy};

mod command;
mod server;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(dev)]
            app.get_webview_window("main").unwrap().open_devtools();

            let cache_path = app.handle().path().app_cache_dir().unwrap();
            let port: u16 = 8720;
            server::start_static_file_server(cache_path, port);

            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_websocket::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .timezone_strategy(TimezoneStrategy::UseLocal)
                .level(log::LevelFilter::Info)
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
            command::create_cache_file,
            command::upload_file,
            command::create_file_fragment,
            command::merge_file_fragment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
