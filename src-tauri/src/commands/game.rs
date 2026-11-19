use crate::commands::accounts::get_account;
use crate::core::game;
use tauri::AppHandle;

#[tauri::command]
pub async fn list_versions() -> Result<Vec<String>, String> {
    game::list_release_versions().await.map_err(|e| format!("{e:#}"))
}

#[tauri::command]
pub async fn launch_game(
    app: AppHandle,
    account_id: String,
    version: String,
    loader: String,
    ram_mb: u32,
) -> Result<(), String> {
    if loader != "Vanilla" {
        return Err(format!("{loader} chưa được hỗ trợ ở bản này, hãy chọn Vanilla"));
    }
    let acc = get_account(&app, &account_id).ok_or("Không tìm thấy tài khoản")?;
    game::launch(&app, &acc, &version, ram_mb)
        .await
        .map_err(|e| format!("{e:#}"))
}
