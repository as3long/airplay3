use lofty::file::{AudioFile, TaggedFileExt};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMetadata {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub duration: f64,
}

#[tauri::command]
pub fn read_audio_metadata(file_path: String) -> Result<AudioMetadata, String> {
    let path = std::path::Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let tagged_file = lofty::read_from_path(path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let duration = tagged_file.properties().duration().as_secs_f64();

    let tag = tagged_file
        .primary_tag()
        .or_else(|| tagged_file.first_tag());

    let (title, artist, album) = match tag {
        Some(tag) => {
            let title = tag
                .get_string(lofty::tag::ItemKey::TrackTitle)
                .map(|s| s.to_string());
            let artist = tag
                .get_string(lofty::tag::ItemKey::TrackArtist)
                .map(|s| s.to_string());
            let album = tag
                .get_string(lofty::tag::ItemKey::AlbumTitle)
                .map(|s| s.to_string());
            (title, artist, album)
        }
        None => (None, None, None),
    };

    Ok(AudioMetadata {
        title,
        artist,
        album,
        duration,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metadata_serialization() {
        let meta = AudioMetadata {
            title: Some("Test".to_string()),
            artist: Some("Artist".to_string()),
            album: Some("Album".to_string()),
            duration: 180.0,
        };
        let json = serde_json::to_string(&meta).unwrap();
        let deserialized: AudioMetadata = serde_json::from_str(&json).unwrap();
        assert_eq!(meta.title, deserialized.title);
        assert_eq!(meta.artist, deserialized.artist);
    }

    #[test]
    fn test_read_metadata_nonexistent_file() {
        let result = read_audio_metadata("/nonexistent/file.mp3".to_string());
        assert!(result.is_err());
    }
}
