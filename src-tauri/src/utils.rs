use base64::{engine::general_purpose, Engine as _};
use regex::Regex;
use std::error::Error;
use std::fs;
use std::path::PathBuf;
use std::str;

const HTTP_URL_REGEX: &str = r#"^(https?://)[^\s]+"#;
const FILE_URL_REGEX: &str = r#"^file:///?$"#;
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

pub async fn get_file_contents(file: &str) -> Result<Vec<u8>, Box<dyn Error>> {
    let file_type = FileType::new();

    if file_type.http_url.is_match(file) {
        let response = reqwest::get(file).await?.bytes().await?.to_vec();
        Ok(response)
    } else if file_type.file_url.is_match(file) {
        let path = file.replacen("file://", "", 1);
        let contents = tokio::fs::read(path).await?;
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

pub async fn save_file_contents(
    mut save_dir: PathBuf,
    file_type: String,
    contents: Vec<u8>,
    validate: bool,
) -> Result<String, Box<dyn Error>> {
    if validate {
        let kind = infer::get(&contents).ok_or_else(|| "File type is unknown".to_string())?;
        if !kind.mime_type().starts_with(&file_type) {
            return Err("File type is unsupported".into());
        }
    }
    let digest = md5::compute(&contents);
    let file_name = format!("{:x}", digest);
    save_dir.push(file_type);
    fs::create_dir_all(&save_dir).unwrap();
    save_dir.push(&file_name);
    if !save_dir.exists() {
        tokio::fs::write(save_dir, contents).await?;
    }
    Ok(file_name)
}
