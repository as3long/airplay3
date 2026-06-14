import { invoke } from '@tauri-apps/api/core'

interface LrcLine {
  time: number
  text: string
}

function parseLRC(lrc: string): LrcLine[] {
  const normalized = lrc.replace(/\\n/g, '\n')
  const lines = normalized.split('\n')
  const result: LrcLine[] = []
  for (const line of lines) {
    const match = line.match(/^\[(\d+):(\d+\.?\d*)\]\s*(.*)$/)
    if (match) {
      const mins = parseInt(match[1], 10)
      const secs = parseFloat(match[2])
      const text = match[3].trim()
      if (text) {
        result.push({ time: mins * 60 + secs, text })
      }
    }
  }
  return result.sort((a, b) => a.time - b.time)
}

export async function fetchLyrics(
  artist: string,
  title: string,
  duration: number,
): Promise<{ synced: LrcLine[]; plain: string }> {
  try {
    const result = await invoke<{
      sync: boolean
      plain: string
      synced: string | null
    }>('fetch_lyrics', { artist, title, duration })

    if (result.synced) {
      const synced = parseLRC(result.synced)
      if (synced.length > 0) {
        return { synced, plain: result.plain }
      }
    }

    if (result.plain) {
      const normalized = result.plain.replace(/\\n/g, '\n')
      const plainLines = normalized.split('\n').filter((l) => l.trim())
      const synced: LrcLine[] = plainLines.map((text, i) => ({
        time: i * 4,
        text: text.trim(),
      }))
      return { synced, plain: result.plain }
    }

    return { synced: [], plain: '' }
  } catch {
    return { synced: [], plain: '' }
  }
}
