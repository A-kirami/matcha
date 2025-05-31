use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
mod commands;
mod state;
mod utils;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default().setup(|app| {
        let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default(),)
            .title("Matcha",)
            .min_inner_size(620.0, 540.0,)
            .inner_size(1080.0, 720.0,)
            .center();

        #[cfg(not(target_os = "macos"))]
        let win_builder = win_builder.decorations(false,).transparent(true,);

        #[cfg(target_os = "macos")]
        let win_builder = win_builder
            .decorations(true,)
            .hidden_title(true,)
            .title_bar_style(tauri::TitleBarStyle::Overlay,);

        let _window = win_builder.build().unwrap();

        #[cfg(dev)]
        _window.open_devtools();

        app.manage(Mutex::new(state::AppState::default(),),);

        Ok((),)
    },);

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build(),)
    }

    builder
        .plugin(tauri_plugin_os::init(),)
        .plugin(tauri_plugin_fs::init(),)
        .plugin(tauri_plugin_websocket::init(),)
        .plugin(tauri_plugin_http::init(),)
        .plugin(tauri_plugin_dialog::init(),)
        .plugin(tauri_plugin_shell::init(),)
        .plugin(tauri_plugin_process::init(),)
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Webview,
                ),)
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal,)
                .level(log::LevelFilter::Debug,)
                .filter(|metadata| {
                    !metadata
                        .target()
                        .contains("tao::platform_impl::platform::event_loop::runner",)
                },)
                .build(),
        )
        .plugin(
            tauri_plugin_prevent_default::Builder::new()
                .with_flags(tauri_plugin_prevent_default::Flags::debug(),)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::read_file,
            commands::get_file_type,
            commands::create_cache_file,
            commands::upload_file,
            commands::create_file_fragment,
            commands::merge_file_fragment,
            commands::write_file,
            commands::copy_file,
            commands::start_assets_server,
        ],)
        .run(tauri::generate_context!(),)
        .expect("error while running tauri application",);
}
