use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Region {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[tauri::command]
pub fn set_window_region(region: Region) -> Result<String, String> {
    if region.width == 0 || region.height == 0 {
        return Err("Invalid region: width and height must be > 0".to_string());
    }
    Ok(serde_json::to_string(&region).unwrap_or_default())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_region() {
        let region = Region {
            x: 0,
            y: 0,
            width: 800,
            height: 600,
        };
        let result = set_window_region(region);
        assert!(result.is_ok());
    }

    #[test]
    fn test_invalid_region_zero_width() {
        let region = Region {
            x: 0,
            y: 0,
            width: 0,
            height: 600,
        };
        let result = set_window_region(region);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_region_zero_height() {
        let region = Region {
            x: 0,
            y: 0,
            width: 800,
            height: 0,
        };
        let result = set_window_region(region);
        assert!(result.is_err());
    }

    #[test]
    fn test_negative_position() {
        let region = Region {
            x: -10,
            y: -20,
            width: 800,
            height: 600,
        };
        let result = set_window_region(region);
        assert!(result.is_ok());
    }
}
