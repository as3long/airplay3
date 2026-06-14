import { ref, computed, readonly } from 'vue'

interface LyricLine {
  time: number
  text: string
}

function parseLRCTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+\.?\d*)/)
  if (!match) return 0
  const mins = parseInt(match[1], 10)
  const secs = parseFloat(match[2])
  return mins * 60 + secs
}

export function useLyricsEngine() {
  const lyrics = ref<LyricLine[]>([])
  const currentLineIndex = ref(-1)
  const offset = ref(0)
  const visible = ref(false)
  const clickThrough = ref(false)

  const currentLyric = computed(() => {
    if (currentLineIndex.value < 0 || currentLineIndex.value >= lyrics.value.length) {
      return ''
    }
    return lyrics.value[currentLineIndex.value].text
  })

  function parseLRC(lrc: string) {
    const lines = lrc.split('\n')
    const result: LyricLine[] = []

    for (const line of lines) {
      const match = line.match(/^\[(\d+:\d+\.?\d*)\](.*)$/)
      if (match) {
        const time = parseLRCTime(match[1])
        const text = match[2].trim()
        if (text) {
          result.push({ time, text })
        }
      }
    }

    lyrics.value = result.sort((a, b) => a.time - b.time)
    currentLineIndex.value = -1
  }

  function updateCurrentLine(currentTime: number) {
    const adjustedTime = currentTime + offset.value / 1000
    let index = -1
    for (let i = 0; i < lyrics.value.length; i++) {
      if (lyrics.value[i].time <= adjustedTime) {
        index = i
      } else {
        break
      }
    }
    currentLineIndex.value = index
  }

  function setOffset(ms: number) {
    offset.value = ms
  }

  function clear() {
    lyrics.value = []
    currentLineIndex.value = -1
  }

  function setLyrics(lines: LyricLine[]) {
    lyrics.value = [...lines].sort((a, b) => a.time - b.time)
    currentLineIndex.value = -1
  }

  function show() {
    visible.value = true
  }

  function hide() {
    visible.value = false
  }

  function toggle() {
    visible.value = !visible.value
  }

  function toggleClickThrough() {
    clickThrough.value = !clickThrough.value
  }

  return {
    lyrics: readonly(lyrics),
    currentLineIndex: readonly(currentLineIndex),
    offset: readonly(offset),
    visible: readonly(visible),
    clickThrough: readonly(clickThrough),
    currentLyric,
    parseLRC,
    setLyrics,
    updateCurrentLine,
    setOffset,
    clear,
    show,
    hide,
    toggle,
    toggleClickThrough,
  }
}
