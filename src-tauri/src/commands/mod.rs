pub mod lyrics;
pub mod metadata;
pub mod online;
pub mod persistence;
pub mod player;
pub mod window;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to AirPlay3.", name)
}
