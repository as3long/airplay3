use lofty::file::{AudioFile, TaggedFileExt};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMetadata {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub duration: f64,
}

fn parse_filename(name: &str) -> (Option<String>, Option<String>) {
    let stem = name.rsplitn(2, '.').last().unwrap_or(name);
    if let Some((left, right)) = stem.rsplit_once('-') {
        let title = left.trim().to_string();
        let artist = right.trim().to_string();
        if !title.is_empty() && !artist.is_empty() {
            return (Some(title), Some(artist));
        }
    }
    let title = stem.trim().to_string();
    if !title.is_empty() {
        return (Some(title), None);
    }
    (None, None)
}

#[tauri::command]
pub fn read_audio_metadata(file_path: String) -> Result<AudioMetadata, String> {
    let path = std::path::Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let file_name = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("");
    let (file_title, file_artist) = parse_filename(file_name);

    let tagged_file = lofty::read_from_path(path).ok();

    let (title, artist, album, duration) = if let Some(tagged_file) = tagged_file {
        let duration = tagged_file.properties().duration().as_secs_f64();
        let tag = tagged_file
            .primary_tag()
            .or_else(|| tagged_file.first_tag());
        let (t, a, al) = match tag {
            Some(tag) => {
                let t = tag
                    .get_string(lofty::tag::ItemKey::TrackTitle)
                    .map(|s| s.to_string());
                let a = tag
                    .get_string(lofty::tag::ItemKey::TrackArtist)
                    .map(|s| s.to_string());
                let al = tag
                    .get_string(lofty::tag::ItemKey::AlbumTitle)
                    .map(|s| s.to_string());
                (t, a, al)
            }
            None => (None, None, None),
        };
        (t, a, al, duration)
    } else {
        (None, None, None, 0.0)
    };

    let title = title.or(file_title);
    let artist = artist.or(file_artist);

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

    #[test]
    fn test_parse_filename() {
        let (title, artist) = parse_filename("青花-周传雄");
        assert_eq!(title, Some("青花".to_string()));
        assert_eq!(artist, Some("周传雄".to_string()));
    }

    #[test]
    fn test_parse_filename_with_extension() {
        let (title, artist) = parse_filename("青花-周传雄.mp3");
        assert_eq!(title, Some("青花".to_string()));
        assert_eq!(artist, Some("周传雄".to_string()));
    }

    #[test]
    fn test_parse_filename_no_dash() {
        let (title, artist) = parse_filename("青花");
        assert_eq!(title, Some("青花".to_string()));
        assert_eq!(artist, None);
    }

    #[test]
    fn test_read_metadata_from_cache_file() {
        let path = dirs::home_dir()
            .unwrap()
            .join(".airplay3")
            .join("cache")
            .join("我怀念的-孙燕姿.mp3");
        if path.exists() {
            let result = read_audio_metadata(path.to_string_lossy().to_string());
            println!("result: {:?}", result);
            assert!(result.is_ok(), "Error: {:?}", result.err());
            let meta = result.unwrap();
            println!("title: {:?}", meta.title);
            println!("artist: {:?}", meta.artist);
            println!("duration: {}", meta.duration);
        } else {
            println!("File not found: {:?}", path);
        }
    }
}
