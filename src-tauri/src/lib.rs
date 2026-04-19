mod commands;
mod config;
mod parser;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            config::ensure_config_dir(app.path().app_config_dir().unwrap())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_tasks,
            commands::read_state,
            commands::read_task,
            commands::git_pull,
            commands::git_log,
            commands::git_status,
            commands::get_config,
            commands::set_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
