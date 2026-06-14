use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Track {
    pub id: u32,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: f64,
    pub path: String,
}

#[tauri::command]
pub fn get_player_state() -> String {
    serde_json::to_string(&serde_json::json!({
        "currentTrack": null,
        "playing": false,
        "currentTime": 0.0,
        "duration": 0.0,
        "volume": 1.0,
        "playlist": []
    }))
    .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_player_state_returns_valid_json() {
        let state = get_player_state();
        let parsed: serde_json::Value = serde_json::from_str(&state).unwrap();
        assert!(parsed.is_object());
        assert_eq!(parsed["playing"], false);
        assert_eq!(parsed["volume"], 1.0);
    }

    #[test]
    fn test_track_serialization() {
        let track = Track {
            id: 1,
            title: "Test Song".to_string(),
            artist: "Test Artist".to_string(),
            album: "Test Album".to_string(),
            duration: 180.0,
            path: "/test/song.mp3".to_string(),
        };
        let json = serde_json::to_string(&track).unwrap();
        let deserialized: Track = serde_json::from_str(&json).unwrap();
        assert_eq!(track.id, deserialized.id);
        assert_eq!(track.title, deserialized.title);
    }
}
