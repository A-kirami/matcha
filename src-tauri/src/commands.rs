use std::{
    collections::HashMap,
    fs::{self, File},
    io::{Read, Seek, SeekFrom, Write},
    path::PathBuf,
};

use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

use crate::utils::{
    download_file, get_cache_file_path, get_file_contents, save_file_contents, validate_file,
};

#[tauri::command(async)]
pub fn read_file(
    path: String,
    offset: Option<usize,>,
    size: Option<usize,>,
) -> Result<Vec<u8,>, String,> {
    let mut file = File::open(path,).map_err(|err| err.to_string(),)?;
    let file_size = file.metadata().map_err(|err| err.to_string(),)?.len() as usize;

    let offset_val = offset.unwrap_or(0,);
    let size_val = size.unwrap_or(file_size,);
    let end_offset = std::cmp::min(offset_val + size_val, file_size,);

    let mut buffer = vec![0; size_val];

    file.seek(SeekFrom::Start(offset_val as u64,),)
        .map_err(|err| err.to_string(),)?;

    let mut bytes_read = 0;
    while bytes_read < size_val {
        let read_len = file
            .read(&mut buffer[bytes_read..end_offset],)
            .map_err(|err| err.to_string(),)?;
        if read_len == 0 {
            break;
        }
        bytes_read += read_len;
    }

    buffer.truncate(bytes_read,);
    Ok(buffer,)
}

#[derive(Serialize, Deserialize,)]
#[serde(rename_all = "camelCase")]
pub enum FileInput {
    Content(Vec<u8,>,),
    Path(String,),
}

#[derive(Serialize, Deserialize,)]
pub struct FileTypeInfo {
    #[serde(rename = "mimeType")]
    mime_type: String,
    extension: String,
}

#[tauri::command(async)]
pub fn get_file_type(file: FileInput,) -> Result<FileTypeInfo, String,> {
    let kind: infer::Type = match file {
        FileInput::Content(content,) => match infer::get(&content,) {
            Some(file_type,) => file_type,
            None => return Err("无法识别文件类型".into(),),
        },
        FileInput::Path(path,) => match infer::get_from_path(path,) {
            Ok(file_type,) => file_type.expect("无法识别文件类型",),
            Err(err,) => return Err(err.to_string(),),
        },
    };
    Ok(FileTypeInfo {
        mime_type: kind.mime_type().to_string(),
        extension: kind.extension().to_string(),
    },)
}

#[derive(Serialize, Deserialize,)]
#[serde(rename_all = "camelCase")]
pub enum OBFile {
    Str(String,),
    Binary(Vec<u8,>,),
}

#[derive(Serialize, Deserialize,)]
pub struct UploadFile {
    size: usize,
    sha256: String,
}

#[tauri::command]
pub async fn create_cache_file(
    app_handle: AppHandle,
    file_source: OBFile,
    validate_type: Option<String,>,
) -> Result<UploadFile, String,> {
    let contents = match file_source {
        OBFile::Str(s,) => get_file_contents(&s,)
            .await
            .map_err(|err| format!("获取文件失败: {}", err),)?,
        OBFile::Binary(b,) => b,
    };

    if let Err(err,) = validate_file(&contents, validate_type, None,) {
        return Err(format!("文件校验失败：{}", err),);
    }

    let cache_dir = get_cache_file_path(app_handle,);
    let size = contents.len();
    let sha256 = save_file_contents(contents, cache_dir, None,)
        .await
        .map_err(|err| format!("保存文件失败: {}", err),)?;
    Ok(UploadFile {
        size,
        sha256,
    },)
}

#[derive(Serialize, Deserialize,)]
#[serde(tag = "type", rename_all = "camelCase")]
enum FileType {
    Url(FileUrl,),
    Path(FilePath,),
    Data(FileData,),
}

#[derive(Serialize, Deserialize,)]
struct FileUrl {
    url: String,
    headers: Option<HashMap<String, String,>,>,
}

#[derive(Serialize, Deserialize,)]
struct FilePath {
    path: String,
}

#[derive(Serialize, Deserialize,)]
struct FileData {
    data: OBFile,
}

#[derive(Serialize, Deserialize,)]
pub struct FileInfo {
    #[serde(flatten)]
    info: FileType,
    name: String,
    sha256: Option<String,>,
}

#[tauri::command]
pub async fn upload_file(app_handle: AppHandle, file: FileInfo,) -> Result<UploadFile, String,> {
    let contents: Vec<u8,> = match file.info {
        FileType::Url(file_url,) => download_file(&file_url.url, file_url.headers,)
            .await
            .map_err(|err| format!("下载文件失败: {}", err),)?,
        FileType::Path(file_path,) => {
            fs::read(file_path.path,).map_err(|err| format!("读取文件失败: {}", err),)?
        }
        FileType::Data(file_data,) => match file_data.data {
            OBFile::Str(s,) => general_purpose::STANDARD.decode(&*s,).unwrap(),
            OBFile::Binary(b,) => b,
        },
    };

    if let Err(err,) = validate_file(&contents, None, file.sha256,) {
        return Err(format!("文件校验失败：{}", err),);
    }

    let cache_dir = get_cache_file_path(app_handle,);
    let size = contents.len();
    let sha256 = save_file_contents(contents, cache_dir, None,)
        .await
        .map_err(|err| format!("保存文件失败: {}", err),)?;
    Ok(UploadFile {
        size,
        sha256,
    },)
}

#[tauri::command]
pub async fn create_file_fragment(
    app_handle: AppHandle,
    file_id: String,
    offset: usize,
    data: OBFile,
) -> Result<(), String,> {
    let cache_dir = get_cache_file_path(app_handle,);
    let file_name = format!("{}.part.{}", file_id, offset);
    let mut file = File::create(cache_dir.join(file_name,),)
        .map_err(|err| format!("创建文件碎片时出错: {}", err),)?;
    let contents = match data {
        OBFile::Str(s,) => get_file_contents(&s,)
            .await
            .map_err(|err| format!("获取文件失败: {}", err),)?,
        OBFile::Binary(b,) => b,
    };
    file.write_all(&contents,)
        .map_err(|err| format!("写入文件碎片时出错: {}", err),)?;
    Ok((),)
}

#[tauri::command(async)]
pub fn merge_file_fragment(
    app_handle: AppHandle,
    file_id: String,
    total_size: usize,
    sha256: String,
) -> Result<(), String,> {
    let cache_dir = get_cache_file_path(app_handle,);
    let temp_file_path = cache_dir.join(format!("{}.tmp", file_id),);
    let mut temp_file =
        File::create(&temp_file_path,).map_err(|err| format!("创建合并文件时出错: {}", err),)?;

    let mut offset = 0;
    loop {
        let file_name = format!("{}.part.{}", file_id, offset);
        let file_path = cache_dir.join(&file_name,);
        if !file_path.exists() {
            break;
        }
        let mut file = File::open(&file_path,)
            .map_err(|err| format!("打开文件碎片 {} 时出错: {}", file_path.display(), err),)?;
        let file_len = file
            .metadata()
            .map(|m| m.len() as usize,)
            .map_err(|err| format!("获取文件大小时出错: {}", err),)?;
        let mut buffer = vec![0; file_len];
        let read_len = file
            .read(&mut buffer,)
            .map_err(|err| format!("读取文件碎片时出错: {}", err),)?;
        buffer.truncate(read_len,);
        temp_file
            .write_all(&buffer,)
            .map_err(|err| format!("写入合并文件时出错: {}", err),)?;
        offset += read_len;
        fs::remove_file(&file_path,)
            .map_err(|err| format!("删除文件碎片 {} 时出错: {}", file_path.display(), err),)?;
    }

    let temp_file_contents = std::fs::read(&temp_file_path,)
        .map_err(|err| format!("读取文件时出错 {}: {}", temp_file_path.display(), err),)?;
    let temp_file_size = temp_file_contents.len();
    if temp_file_size != total_size {
        return Err(format!(
            "合并的临时文件大小不等于总大小: {} != {}",
            temp_file_size, total_size
        ),);
    }
    let output_file_path = cache_dir.join(&sha256,);
    validate_file(&temp_file_contents, None, Some(sha256,),)
        .map_err(|err| format!("验证文件时出错: {}", err),)?;
    if !output_file_path.exists() {
        std::fs::rename(temp_file_path, &output_file_path,)
            .map_err(|err| format!("重命名文件时出错: {}", err),)?;
    } else {
        fs::remove_file(temp_file_path,).map_err(|err| format!("删除临时文件时出错: {}", err),)?;
    }
    Ok((),)
}

#[tauri::command]
pub async fn write_file(
    contents: Vec<u8,>, path: PathBuf, overwrite: bool,
) -> Result<(), String,> {
    if overwrite || !path.exists() {
        tokio::fs::write(path, contents,)
            .await
            .map_err(|err| format!("写入文件失败: {}", err),)?;
        Ok((),)
    } else {
        Err("文件已存在".into(),)
    }
}

#[tauri::command]
pub async fn copy_file(source: PathBuf, target: PathBuf,) -> Result<(), String,> {
    tokio::fs::copy(&source, &target,)
        .await
        .map_err(|err| format!("复制文件失败: {}", err),)?;
    Ok((),)
}

use tauri::State;
use tokio::{net::TcpListener, sync::Mutex};
use tokio_stream::wrappers::TcpListenerStream;
use warp::Filter;

use crate::state::AppState;

#[tauri::command]
pub async fn start_assets_server(
    app_handle: AppHandle,
    state: State<'_, Mutex<AppState,>,>,
    host: String,
    port: u16,
) -> Result<(), String,> {
    let cache_dir = get_cache_file_path(app_handle,);

    let cors = warp::cors().allow_any_origin().allow_methods(vec!["GET"],);

    let route = warp::path("matcha",)
        .and(warp::path("cache",),)
        .and(warp::fs::dir(cache_dir,),)
        .with(cors,);

    let mut state = state.lock().await;

    state.stop_server();

    let addr = format!("{}:{}", host, port);
    match TcpListener::bind(&addr,).await {
        Ok(listener,) => {
            let new_handle = tauri::async_runtime::spawn(async move {
                let stream = TcpListenerStream::new(listener,);
                warp::serve(route,).run_incoming(stream,).await;
            },);

            state.set_handle(new_handle,);
            Ok((),)
        }
        Err(e,) => Err(e.to_string(),),
    }
}
