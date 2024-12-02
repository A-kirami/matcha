use tauri::Manager;
mod command;
mod state;
mod utils;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default().setup(|app| {
        #[cfg(dev)]
        app.get_webview_window("main",).unwrap().open_devtools();

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
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal,)
                .level(log::LevelFilter::Debug,)
                .filter(|metadata| {
                    !metadata
                        .target()
                        .contains("tao::platform_impl::platform::event_loop::runner",)
                },)
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
            command::start_assets_server,
        ],)
        .run(tauri::generate_context!(),)
        .expect("error while running tauri application",);
}
