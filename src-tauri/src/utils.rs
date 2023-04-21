use base64::{engine::general_purpose, Engine as _};
use regex::Regex;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::error::Error;
use std::fs;
use std::path::PathBuf;
use std::str;
use tauri::AppHandle;

const HTTP_URL_REGEX: &str = r#"^(https?://)[^\s]+"#;
const FILE_URL_REGEX: &str = r#"^file:///?"#;
const DATA_URL_REGEX: &str = r#"^data:[^,]+;base64,"#;
const BASE64_REGEX: &str = r#"^base64://"#;

struct FileType {
    http_url: Regex,
    file_url: Regex,
    data_url: Regex,
    base64: Regex,
}

impl FileType {
    fn new() -> Self {
        FileType {
            http_url: Regex::new(HTTP_URL_REGEX).unwrap(),
            file_url: Regex::new(FILE_URL_REGEX).unwrap(),
            data_url: Regex::new(DATA_URL_REGEX).unwrap(),
            base64: Regex::new(BASE64_REGEX).unwrap(),
        }
    }
}

pub fn get_cache_file_path(app_handle: AppHandle) -> PathBuf {
    let mut cache_dir = app_handle.path_resolver().app_cache_dir().unwrap();
    cache_dir.push("cache");
    fs::create_dir_all(&cache_dir).unwrap();
    cache_dir
}

pub async fn download_file(
    url: &str,
    headers: Option<HashMap<String, String>>,
) -> Result<Vec<u8>, Box<dyn Error>> {
    let headers = headers.unwrap_or_default();
    let header_map = HeaderMap::from_iter(headers.iter().map(|(k, v)| {
        (
            HeaderName::from_bytes(k.as_bytes()).unwrap(),
            HeaderValue::from_str(v).unwrap(),
        )
    }));
    let response = reqwest::Client::new()
        .get(url)
        .headers(header_map)
        .send()
        .await?;
    Ok(response.bytes().await?.to_vec())
}

pub async fn get_file_contents(file: &str) -> Result<Vec<u8>, Box<dyn Error>> {
    let file_type = FileType::new();

    if file_type.http_url.is_match(file) {
        let response = download_file(file, None).await?;
        Ok(response)
    } else if file_type.file_url.is_match(file) {
        let path = file_type.file_url.replace(file, "");
        let contents = tokio::fs::read(&*path).await?;
        Ok(contents)
    } else {
        let file_rex = if file_type.data_url.is_match(file) {
            &file_type.data_url
        } else {
            &file_type.base64
        };
        let base64_data = file_rex.replace(file, "");
        let contents = general_purpose::STANDARD.decode(&*base64_data).unwrap();
        Ok(contents)
    }
}

pub fn get_sha256(contents: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(contents);
    let result = hasher.finalize();
    format!("{:x}", result)
}

pub async fn save_file_contents(
    contents: Vec<u8>,
    mut save_dir: PathBuf,
    name: Option<String>,
) -> Result<String, Box<dyn Error>> {
    let file_name = name.unwrap_or_else(|| get_sha256(&contents));
    save_dir.push(&file_name);
    if !save_dir.exists() {
        tokio::fs::write(save_dir, contents).await?;
    }
    Ok(file_name)
}

pub fn validate_file(
    contents: &[u8],
    validate_type: Option<String>,
    expected_sha256: Option<String>,
) -> Result<(), Box<dyn Error>> {
    if let Some(file_type) = validate_type {
        let kind = infer::get(contents).ok_or_else(|| "未知的文件类型".to_string())?;
        if !kind.mime_type().starts_with(&file_type) {
            return Err("文件类型不支持".into());
        }
    }
    if let Some(expected_sha256) = expected_sha256 {
        let result_str = get_sha256(contents);
        if result_str != expected_sha256 {
            return Err("文件的 SHA256 不符合预期".into());
        }
    }
    Ok(())
}
