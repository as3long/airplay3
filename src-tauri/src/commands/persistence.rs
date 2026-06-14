use base64::Engine;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

fn get_config_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let config_dir = home.join(".airplay3");
    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    Ok(config_dir)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedTrack {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: f64,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistData {
    pub tracks: Vec<SavedTrack>,
}

#[tauri::command]
pub fn save_playlist(tracks: Vec<SavedTrack>) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let data = PlaylistData { tracks };
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(config_dir.join("playlist.json"), json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_playlist() -> Result<Vec<SavedTrack>, String> {
    let config_dir = get_config_dir()?;
    let path = config_dir.join("playlist.json");
    if !path.exists() {
        return Ok(vec![]);
    }
    let json = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let data: PlaylistData = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(data.tracks)
}

#[tauri::command]
pub fn save_volume(volume: f64) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    fs::write(config_dir.join("volume.txt"), volume.to_string()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_volume() -> Result<f64, String> {
    let config_dir = get_config_dir()?;
    let path = config_dir.join("volume.txt");
    if !path.exists() {
        return Ok(1.0);
    }
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let volume: f64 = content
        .trim()
        .parse()
        .map_err(|e: std::num::ParseFloatError| e.to_string())?;
    Ok(volume.clamp(0.0, 1.0))
}

#[tauri::command]
pub fn read_file_as_data_url(file_path: String) -> Result<String, String> {
    let path = std::path::Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("mp3")
        .to_lowercase();

    let mime = match ext.as_str() {
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "flac" => "audio/flac",
        "ogg" => "audio/ogg",
        "aac" => "audio/aac",
        "m4a" => "audio/mp4",
        "wma" => "audio/x-ms-wma",
        "opus" => "audio/opus",
        _ => "audio/mpeg",
    };

    let bytes = fs::read(path).map_err(|e| format!("Read error: {}", e))?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", mime, b64))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EqState {
    pub bands: Vec<f64>,
    pub enabled: bool,
}

#[tauri::command]
pub fn save_eq(bands: Vec<f64>, enabled: bool) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let state = EqState { bands, enabled };
    let json = serde_json::to_string_pretty(&state).map_err(|e| e.to_string())?;
    fs::write(config_dir.join("eq.json"), json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_eq() -> Result<EqState, String> {
    let config_dir = get_config_dir()?;
    let path = config_dir.join("eq.json");
    if !path.exists() {
        return Ok(EqState {
            bands: vec![0.0; 10],
            enabled: true,
        });
    }
    let json = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let state: EqState = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(state)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerState {
    pub current_track_id: Option<f64>,
    pub current_track_title: Option<String>,
    pub current_track_artist: Option<String>,
    pub current_track_path: Option<String>,
    pub shuffle: bool,
    pub volume: f64,
    pub current_time: f64,
}

#[tauri::command]
pub fn save_player_state(
    current_track_id: Option<f64>,
    current_track_title: Option<String>,
    current_track_artist: Option<String>,
    current_track_path: Option<String>,
    shuffle: bool,
    volume: f64,
    current_time: f64,
) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let state = PlayerState {
        current_track_id,
        current_track_title,
        current_track_artist,
        current_track_path,
        shuffle,
        volume,
        current_time,
    };
    let json = serde_json::to_string_pretty(&state).map_err(|e| e.to_string())?;
    fs::write(config_dir.join("state.json"), json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_player_state() -> Result<PlayerState, String> {
    let config_dir = get_config_dir()?;
    let path = config_dir.join("state.json");
    if !path.exists() {
        return Ok(PlayerState {
            current_track_id: None,
            current_track_title: None,
            current_track_artist: None,
            current_track_path: None,
            shuffle: false,
            volume: 1.0,
            current_time: 0.0,
        });
    }
    let json = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let state: PlayerState = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(state)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_saved_track_serialization() {
        let track = SavedTrack {
            title: "Test".to_string(),
            artist: "Artist".to_string(),
            album: "Album".to_string(),
            duration: 180.0,
            path: "/test.mp3".to_string(),
        };
        let json = serde_json::to_string(&track).unwrap();
        let deserialized: SavedTrack = serde_json::from_str(&json).unwrap();
        assert_eq!(track.title, deserialized.title);
    }

    #[test]
    fn test_playlist_data_serialization() {
        let data = PlaylistData {
            tracks: vec![SavedTrack {
                title: "Song".to_string(),
                artist: "A".to_string(),
                album: "B".to_string(),
                duration: 100.0,
                path: "/s.mp3".to_string(),
            }],
        };
        let json = serde_json::to_string(&data).unwrap();
        let deserialized: PlaylistData = serde_json::from_str(&json).unwrap();
        assert_eq!(data.tracks.len(), deserialized.tracks.len());
    }
}
