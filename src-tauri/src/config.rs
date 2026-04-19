use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub repo_path: String,
    pub refresh_timeout_ms: u64,
    pub auto_refresh_on_focus: bool,
}

fn default_repo_path() -> String {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("agente-repo")
        .to_string_lossy()
        .into_owned()
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            repo_path: default_repo_path(),
            refresh_timeout_ms: 5000,
            auto_refresh_on_focus: false,
        }
    }
}

pub fn config_path(config_dir: PathBuf) -> PathBuf {
    config_dir.join("config.json")
}

pub fn ensure_config_dir(config_dir: PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    std::fs::create_dir_all(&config_dir)?;
    let path = config_path(config_dir.clone());
    if !path.exists() {
        let default = AppConfig::default();
        std::fs::write(&path, serde_json::to_string_pretty(&default)?)?;
    }
    Ok(())
}

pub fn load_config(config_dir: PathBuf) -> AppConfig {
    let path = config_path(config_dir);
    std::fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save_config(config_dir: PathBuf, cfg: &AppConfig) -> Result<(), String> {
    let path = config_path(config_dir);
    std::fs::write(&path, serde_json::to_string_pretty(cfg).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}
