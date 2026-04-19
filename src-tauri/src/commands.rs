use crate::config::{load_config, save_config, AppConfig};
use crate::parser::{parse_state, parse_task, StateSnapshot, Task};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct GitResult {
    pub ok: bool,
    pub message: String,
    pub head: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitCommit {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub dirty: bool,
    pub ahead: i32,
    pub behind: i32,
}

fn repo_path(app: tauri::AppHandle) -> PathBuf {
    let cfg = load_config(app.path().app_config_dir().unwrap());
    PathBuf::from(cfg.repo_path)
}

#[tauri::command]
pub fn list_tasks(app: tauri::AppHandle, estado: String, rol: String) -> Result<Vec<Task>, String> {
    let base = repo_path(app).join("tareas").join(&estado);
    if !base.exists() { return Ok(vec![]); }
    let mut tasks = Vec::new();
    for entry in std::fs::read_dir(&base).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("md") { continue; }
        let filename = path.file_name().unwrap().to_string_lossy().to_string();
        if filename == ".gitkeep" { continue; }
        if rol != "all" && !filename.starts_with(&format!("{}-", rol)) { continue; }
        let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        tasks.push(parse_task(&content, &filename, path.to_str().unwrap_or("")));
    }
    Ok(tasks)
}

#[tauri::command]
pub fn read_state(app: tauri::AppHandle) -> Result<StateSnapshot, String> {
    let path = repo_path(app).join("STATE.md");
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(parse_state(&content))
}

#[tauri::command]
pub fn read_task(app: tauri::AppHandle, archivo: String) -> Result<Task, String> {
    let repo = repo_path(app);
    for estado in &["pendiente", "en-curso", "completado"] {
        let path = repo.join("tareas").join(estado).join(&archivo);
        if path.exists() {
            let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
            return Ok(parse_task(&content, &archivo, path.to_str().unwrap_or("")));
        }
    }
    Err(format!("Tarea no encontrada: {}", archivo))
}

#[tauri::command]
pub fn git_pull(app: tauri::AppHandle) -> Result<GitResult, String> {
    let repo = repo_path(app);
    let output = Command::new("git")
        .args(["pull", "--rebase"])
        .current_dir(&repo)
        .output()
        .map_err(|e| e.to_string())?;

    let ok = output.status.success();
    let message = if ok {
        String::from_utf8_lossy(&output.stdout).trim().to_string()
    } else {
        String::from_utf8_lossy(&output.stderr).trim().to_string()
    };

    let head = Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .current_dir(&repo)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default();

    Ok(GitResult { ok, message, head })
}

#[tauri::command]
pub fn git_log(app: tauri::AppHandle, limit: usize) -> Result<Vec<GitCommit>, String> {
    let repo = repo_path(app);
    let format = "%H|%s|%an|%ai";
    let output = Command::new("git")
        .args(["log", &format!("-{}", limit), &format!("--pretty=format:{}", format)])
        .current_dir(&repo)
        .output()
        .map_err(|e| e.to_string())?;

    let text = String::from_utf8_lossy(&output.stdout);
    let commits = text.lines()
        .filter(|l| !l.is_empty())
        .map(|l| {
            let parts: Vec<&str> = l.splitn(4, '|').collect();
            GitCommit {
                hash: parts.first().map(|s| s[..7.min(s.len())].to_string()).unwrap_or_default(),
                message: parts.get(1).map(|s| s.to_string()).unwrap_or_default(),
                author: parts.get(2).map(|s| s.to_string()).unwrap_or_default(),
                date: parts.get(3).map(|s| s.to_string()).unwrap_or_default(),
            }
        })
        .collect();

    Ok(commits)
}

#[tauri::command]
pub fn git_status(app: tauri::AppHandle) -> Result<GitStatus, String> {
    let repo = repo_path(app);
    let branch = Command::new("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .current_dir(&repo)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "unknown".into());

    let status = Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(&repo)
        .output()
        .map_err(|e| e.to_string())?;
    let dirty = !status.stdout.is_empty();

    Ok(GitStatus { branch, dirty, ahead: 0, behind: 0 })
}

#[tauri::command]
pub fn get_config(app: tauri::AppHandle) -> Result<AppConfig, String> {
    Ok(load_config(app.path().app_config_dir().unwrap()))
}

#[tauri::command]
pub fn set_config(app: tauri::AppHandle, cfg: AppConfig) -> Result<(), String> {
    save_config(app.path().app_config_dir().unwrap(), &cfg)
}
