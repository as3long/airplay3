mod commands;
mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            tray::create_tray(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::player::get_player_state,
            commands::window::set_window_region,
            commands::persistence::save_playlist,
            commands::persistence::load_playlist,
            commands::persistence::save_volume,
            commands::persistence::load_volume,
            commands::persistence::read_file_as_data_url,
            commands::persistence::save_eq,
            commands::persistence::load_eq,
            commands::persistence::save_player_state,
            commands::persistence::load_player_state,
            commands::lyrics::fetch_lyrics,
            commands::metadata::read_audio_metadata,
            commands::online::fetch_hot_songs,
            commands::online::download_song,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
