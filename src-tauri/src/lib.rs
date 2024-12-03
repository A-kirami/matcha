use tauri::{Manager, TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

mod command;
mod server;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Matcha")
                .min_inner_size(620.0, 540.0)
                .inner_size(1080.0, 720.0)
                .center();

            #[cfg(target_os = "windows")]
            let win_builder = win_builder.decorations(false).transparent(true);

            #[cfg(target_os = "macos")]
            let win_builder = win_builder
                .decorations(true)
                .hidden_title(true)
                .title_bar_style(TitleBarStyle::Overlay);

            let _window = win_builder.build().unwrap();

            #[cfg(dev)]
            _window.open_devtools();

            let cache_path = app.handle().path().app_cache_dir().unwrap();
            let port: u16 = 8720;
            server::start_static_file_server(cache_path, port);

            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;

            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                .level(log::LevelFilter::Debug)
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
            command::write_file,
            command::copy_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
