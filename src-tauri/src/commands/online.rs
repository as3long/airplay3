use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

fn get_cache_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let dir = home.join(".airplay3").join("cache");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn get_hot_songs_cache_path(page: u32) -> Result<PathBuf, String> {
    let cache_dir = get_cache_dir()?;
    Ok(cache_dir.join(format!("hot_songs_{}.json", page)))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CachedHotSongs {
    timestamp: u64,
    songs: Vec<HotSong>,
}

fn is_cache_valid(path: &PathBuf) -> bool {
    if !path.exists() {
        return false;
    }
    if let Ok(json) = fs::read_to_string(path) {
        if let Ok(cached) = serde_json::from_str::<CachedHotSongs>(&json) {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();
            return now - cached.timestamp < 86400;
        }
    }
    false
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotSong {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub play_id: String,
    pub play_url: String,
    pub cached: bool,
}

#[tauri::command]
pub async fn fetch_hot_songs(page: u32) -> Result<Vec<HotSong>, String> {
    let cache_path = get_hot_songs_cache_path(page)?;
    if is_cache_valid(&cache_path) {
        if let Ok(json) = fs::read_to_string(&cache_path) {
            if let Ok(cached) = serde_json::from_str::<CachedHotSongs>(&json) {
                return Ok(cached.songs);
            }
        }
    }

    let client = reqwest::Client::new();
    let url = if page <= 1 {
        "https://www.gequhai.com/hot-music/".to_string()
    } else {
        format!("https://www.gequhai.com/hot-music/{}", page)
    };

    let resp = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let html = resp.text().await.map_err(|e| format!("Read error: {}", e))?;

    let mut songs = Vec::new();
    let re_play = regex::Regex::new(r#"href="/play/(\d+)"[^>]*>\s*([^<]*)"#).unwrap();
    for cap in re_play.captures_iter(&html) {
        let id = cap[1].to_string();
        let title = cap[2].trim().to_string();
        if !title.is_empty() {
            songs.push(HotSong {
                id: id.clone(),
                title: title.clone(),
                artist: String::new(),
                play_id: String::new(),
                play_url: format!("https://www.gequhai.com/play/{}", id),
                cached: false,
            });
        }
    }

    for song in &mut songs {
        if let Ok(info) = fetch_song_info(&song.id).await {
            song.artist = info.0;
            song.title = if song.title.is_empty() { info.1 } else { song.title.clone() };
            song.play_id = info.2;
        }
        if let Ok(cache_dir) = get_cache_dir() {
            let safe_name = format!("{}-{}", song.title, song.artist)
                .replace(|c: char| !c.is_alphanumeric() && c != ' ' && c != '-' && c != '_', "_");
            song.cached = cache_dir.join(format!("{}.mp3", safe_name)).exists();
        }
    }

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let cached = CachedHotSongs {
        timestamp: now,
        songs: songs.clone(),
    };
    if let Ok(json) = serde_json::to_string_pretty(&cached) {
        let _ = fs::write(&cache_path, json);
    }

    Ok(songs)
}

async fn fetch_song_info(id: &str) -> Result<(String, String, String), String> {
    let client = reqwest::Client::new();
    let resp = client
        .get(format!("https://www.gequhai.com/play/{}", id))
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let html = resp.text().await.map_err(|e| format!("Read error: {}", e))?;

    let re = regex::Regex::new(r#"window\.appData\s*=\s*\{[^}]*"mp3_title":"([^"]*)"[^}]*"mp3_author":"([^"]*)""#).unwrap();
    let (artist, title) = if let Some(cap) = re.captures(&html) {
        (cap[2].to_string(), cap[1].to_string())
    } else {
        (String::new(), String::new())
    };

    let re_play = regex::Regex::new(r#"play_id\s*=\s*'([^']+)'"#).unwrap();
    let play_id = re_play
        .captures(&html)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .unwrap_or_default();

    Ok((artist, title, play_id))
}

#[tauri::command]
pub async fn download_song(song_id: String, title: String, artist: String) -> Result<String, String> {
    let cache_dir = get_cache_dir()?;
    let safe_name = format!("{}-{}", title, artist)
        .replace(|c: char| !c.is_alphanumeric() && c != ' ' && c != '-' && c != '_', "_");
    let file_path = cache_dir.join(format!("{}.mp3", safe_name));

    if file_path.exists() {
        return Ok(file_path.to_string_lossy().to_string());
    }

    let client = reqwest::Client::new();

    let page_resp = client
        .get(format!("https://www.gequhai.com/play/{}", song_id))
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Page error: {}", e))?;

    let html = page_resp.text().await.map_err(|e| format!("Read error: {}", e))?;

    let re = regex::Regex::new(r#"play_id\s*=\s*'([^']+)'"#).unwrap();
    let play_id = re
        .captures(&html)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str())
        .ok_or("play_id not found")?;

    let api_resp = client
        .post("https://www.gequhai.com/api/music")
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .header("X-Requested-With", "XMLHttpRequest")
        .header("X-Custom-Header", "SecretKey")
        .header("Referer", format!("https://www.gequhai.com/play/{}", song_id))
        .header("Origin", "https://www.gequhai.com")
        .form(&[("id", play_id), ("type", "0")])
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .await
        .map_err(|e| format!("API error: {}", e))?;

    let json: serde_json::Value = api_resp.json().await.map_err(|e| format!("Parse error: {}", e))?;

    let audio_url = json
        .get("data")
        .and_then(|d| d.get("url"))
        .and_then(|u| u.as_str())
        .filter(|u| !u.is_empty())
        .ok_or_else(|| {
            let msg = json.get("msg").and_then(|m| m.as_str()).unwrap_or("No audio URL");
            format!("API returned: {}", msg)
        })?;

    let audio_resp = client
        .get(audio_url)
        .header("User-Agent", "Mozilla/5.0")
        .timeout(std::time::Duration::from_secs(60))
        .send()
        .await
        .map_err(|e| format!("Download error: {}", e))?;

    let bytes = audio_resp.bytes().await.map_err(|e| format!("Read error: {}", e))?;
    fs::write(&file_path, &bytes).map_err(|e| format!("Write error: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hot_song_serialization() {
        let song = HotSong {
            id: "123".to_string(),
            title: "Test".to_string(),
            artist: "Artist".to_string(),
            play_id: "abc".to_string(),
            play_url: "https://example.com".to_string(),
            cached: false,
        };
        let json = serde_json::to_string(&song).unwrap();
        let deserialized: HotSong = serde_json::from_str(&json).unwrap();
        assert_eq!(song.title, deserialized.title);
    }
}
