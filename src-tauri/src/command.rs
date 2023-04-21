use crate::utils::{get_cache_file_path, get_file_contents, save_file_contents, validate_file};
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use tauri::{AppHandle, Window};

#[tauri::command(async)]
pub fn read_file(
    path: String,
    offset: Option<usize>,
    size: Option<usize>,
) -> Result<Vec<u8>, String> {
    let mut file = File::open(path).map_err(|err| err.to_string())?;
    let file_size = file.metadata().map_err(|err| err.to_string())?.len() as usize;

    let offset_val = offset.unwrap_or(0);
    let size_val = size.unwrap_or(file_size);
    let end_offset = std::cmp::min(offset_val + size_val, file_size);

    let mut buffer = vec![0; size_val];

    file.seek(SeekFrom::Start(offset_val as u64))
        .map_err(|err| err.to_string())?;

    let mut bytes_read = 0;
    while bytes_read < size_val {
        let read_len = file
            .read(&mut buffer[bytes_read..end_offset])
            .map_err(|err| err.to_string())?;
        if read_len == 0 {
            break;
        }
        bytes_read += read_len;
    }

    buffer.truncate(bytes_read);
    Ok(buffer)
}

#[tauri::command(async)]
pub fn get_file_type(file: Vec<u8>) -> Result<String, String> {
    infer::get(&file)
        .map(|file_type| file_type.to_string())
        .ok_or_else(|| "未知的文件类型".into())
}

#[tauri::command]
pub fn open_devtools(window: Window) {
    window.open_devtools();
}

#[derive(Debug, Serialize, Deserialize)]
pub enum OBFile {
    Str(String),
    Binary(Vec<u8>),
}

#[derive(Serialize, Deserialize)]
pub struct UploadFile {
    size: usize,
    sha256: String,
}

#[tauri::command]
pub async fn create_cache_file(
    app_handle: AppHandle,
    file_source: OBFile,
    validate_type: Option<String>,
) -> Result<UploadFile, String> {
    let contents = match file_source {
        OBFile::Str(s) => get_file_contents(&s)
            .await
            .map_err(|err| format!("获取文件失败: {}", err))?,
        OBFile::Binary(b) => b,
    };

    if let Err(err) = validate_file(&contents, validate_type, None) {
        return Err(format!("文件校验失败：{}", err));
    }

    let cache_dir = get_cache_file_path(app_handle);
    let size = contents.len();
    let sha256 = save_file_contents(contents, cache_dir, None)
        .await
        .map_err(|err| format!("保存文件失败: {}", err))?;
    Ok(UploadFile { size, sha256 })
}
