use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

fn t2s(text: &str) -> String {
    zhconv::zhconv(text, zhconv::Variant::ZhHans)
}

fn get_lyrics_cache_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let dir = home.join(".airplay3").join("lyrics");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn cache_key(artist: &str, title: &str) -> String {
    let raw = format!("{} - {}", artist.to_lowercase(), title.to_lowercase());
    let hash: u32 = raw.bytes().fold(0u32, |acc, b| acc.wrapping_mul(31).wrapping_add(b as u32));
    format!("{:08x}", hash)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LyricsResult {
    pub sync: bool,
    pub plain: String,
    pub synced: Option<String>,
}

#[tauri::command]
pub async fn fetch_lyrics(
    artist: String,
    title: String,
    duration: f64,
) -> Result<LyricsResult, String> {
    let key = cache_key(&artist, &title);
    let cache_dir = get_lyrics_cache_dir()?;
    let cache_file = cache_dir.join(format!("{}.json", key));

    if cache_file.exists() {
        if let Ok(json) = fs::read_to_string(&cache_file) {
            if let Ok(cached) = serde_json::from_str::<LyricsResult>(&json) {
                if cached.plain.len() > 0 || cached.synced.is_some() {
                    return Ok(cached);
                }
            }
        }
    }

    let mut result = fetch_from_api(&artist, &title, duration).await?;

    result.plain = t2s(&result.plain);
    if let Some(ref s) = result.synced {
        result.synced = Some(t2s(s));
    }

    if result.plain.len() > 0 || result.synced.is_some() {
        let json = serde_json::to_string_pretty(&result).map_err(|e| e.to_string())?;
        let _ = fs::write(&cache_file, json);
    }

    Ok(result)
}

async fn fetch_from_api(
    artist: &str,
    title: &str,
    duration: f64,
) -> Result<LyricsResult, String> {
    let client = reqwest::Client::new();
    let is_unknown = artist.eq_ignore_ascii_case("Unknown Artist");

    if !is_unknown {
        let resp = client
            .get("https://lrclib.net/api/get")
            .query(&[("artist_name", artist), ("track_name", title)])
            .header("User-Agent", "AirPlay3/0.1.0")
            .timeout(std::time::Duration::from_secs(8))
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if resp.status().is_success() {
            let data: LrclibResult = resp
                .json()
                .await
                .map_err(|e| format!("Parse error: {}", e))?;
            return Ok(LyricsResult {
                sync: data.synced_lyrics.is_some(),
                plain: data.plain_lyrics.unwrap_or_default(),
                synced: data.synced_lyrics,
            });
        }
    }

    let search_resp = client
        .get("https://lrclib.net/api/search")
        .query(&[("track_name", title)])
        .header("User-Agent", "AirPlay3/0.1.0")
        .timeout(std::time::Duration::from_secs(8))
        .send()
        .await
        .map_err(|e| format!("Search error: {}", e))?;

    if search_resp.status().is_success() {
        let results: Vec<LrclibSearchResult> = search_resp
            .json()
            .await
            .map_err(|e| format!("Parse error: {}", e))?;

        if let Some(best) = find_best_match(&results, title, duration) {
            return Ok(LyricsResult {
                sync: best.synced_lyrics.is_some(),
                plain: best.plain_lyrics.clone().unwrap_or_default(),
                synced: best.synced_lyrics.clone(),
            });
        }
    }

    Err("No lyrics found".to_string())
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LrclibResult {
    synced_lyrics: Option<String>,
    plain_lyrics: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LrclibSearchResult {
    synced_lyrics: Option<String>,
    plain_lyrics: Option<String>,
    duration: Option<f64>,
    track_name: Option<String>,
}

fn find_best_match<'a>(
    results: &'a [LrclibSearchResult],
    title: &str,
    target_duration: f64,
) -> Option<&'a LrclibSearchResult> {
    let title_lower = title.to_lowercase();
    results
        .iter()
        .filter(|r| r.synced_lyrics.is_some() || r.plain_lyrics.is_some())
        .min_by_key(|r| {
            let has_sync = if r.synced_lyrics.is_some() { 0 } else { 1000 };
            let title_match = r
                .track_name
                .as_ref()
                .map(|t| if t.to_lowercase().contains(&title_lower) { 0 } else { 100 })
                .unwrap_or(50);
            let duration_diff = r
                .duration
                .map(|d| ((d - target_duration).abs() * 10.0) as i64)
                .unwrap_or(9999);
            has_sync + title_match + duration_diff
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lyrics_result_serialization() {
        let result = LyricsResult {
            sync: true,
            plain: "Line 1\nLine 2".to_string(),
            synced: Some("[00:01.00]Line 1\n[00:05.00]Line 2".to_string()),
        };
        let json = serde_json::to_string(&result).unwrap();
        let deserialized: LyricsResult = serde_json::from_str(&json).unwrap();
        assert!(deserialized.sync);
        assert_eq!(deserialized.plain, "Line 1\nLine 2");
    }

    #[test]
    fn test_find_best_match() {
        let results = vec![
            LrclibSearchResult {
                synced_lyrics: Some("[00:01.00]test".to_string()),
                plain_lyrics: None,
                duration: Some(200.0),
                track_name: Some("Test Song".to_string()),
            },
            LrclibSearchResult {
                synced_lyrics: None,
                plain_lyrics: Some("other".to_string()),
                duration: Some(180.0),
                track_name: Some("Other".to_string()),
            },
        ];
        let best = find_best_match(&results, "Test Song", 195.0);
        assert!(best.is_some());
        assert_eq!(best.unwrap().track_name.as_deref(), Some("Test Song"));
    }

    #[test]
    fn test_cache_key_consistency() {
        let k1 = cache_key("周传雄", "青花");
        let k2 = cache_key("周传雄", "青花");
        assert_eq!(k1, k2);
    }

    #[tokio::test]
    async fn test_fetch_lyrics_qinghua() {
        let result = fetch_lyrics("Unknown Artist".to_string(), "青花".to_string(), 297.0).await;
        assert!(result.is_ok(), "fetch failed: {:?}", result.err());
        let lyrics = result.unwrap();
        assert!(!lyrics.plain.is_empty(), "plain lyrics should not be empty");
        println!("=== 青花 歌词获取成功 ===");
        println!("sync: {}", lyrics.sync);
        let preview: Vec<&str> = lyrics.plain.lines().take(6).collect();
        for line in preview {
            println!("  {}", line);
        }
    }
}
