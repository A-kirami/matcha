use crate::utils;
use std::fs;

#[tauri::command(async)]
pub fn read_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(path).map_err(|err| format!("Failed to read file: {}", err))
}

#[tauri::command(async)]
pub fn get_file_type(file: Vec<u8>) -> Result<String, String> {
    infer::get(&file)
        .map(|file_type| file_type.to_string())
        .ok_or_else(|| "File type is unknown".into())
}

#[tauri::command]
pub fn open_devtools(window: tauri::Window) {
    window.open_devtools();
}

#[tauri::command]
pub async fn create_file_cache(
    app_handle: tauri::AppHandle,
    file_type: String,
    file: Option<Vec<u8>>,
    file_origin: Option<String>,
    validate: bool,
) -> Result<String, String> {
    let cache_dir = app_handle.path_resolver().app_cache_dir().unwrap();
    let contents = match (file, file_origin) {
        (Some(file), None) => file,
        (None, Some(origin)) => utils::get_file_contents(&origin)
            .await
            .map_err(|err| format!("Failed to get file: {}", err))?,
        (Some(_), Some(_)) | (None, None) => {
            return Err("Either file or file_origin must be provided".into());
        }
    };
    utils::save_file_contents(cache_dir, file_type, contents, validate)
        .await
        .map_err(|err| format!("Failed to save file: {}", err))
}
