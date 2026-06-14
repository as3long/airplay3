use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::Emitter;
use tauri::Manager;

pub fn create_tray(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let play_item = MenuItemBuilder::with_id("play", "Play/Pause").build(app)?;
    let next_item = MenuItemBuilder::with_id("next", "Next").build(app)?;
    let prev_item = MenuItemBuilder::with_id("prev", "Previous").build(app)?;
    let quit_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&play_item, &next_item, &prev_item, &quit_item])
        .build()?;

    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "quit" => {
                app.exit(0);
            }
            "play" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("tray-event", "play");
                }
            }
            "next" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("tray-event", "next");
                }
            }
            "prev" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("tray-event", "prev");
                }
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_tray_module_compiles() {
        assert!(true);
    }
}
