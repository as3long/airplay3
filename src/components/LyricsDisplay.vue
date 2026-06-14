<script setup lang="ts">
import { watch, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLyricsEngine } from '@/composables/useLyrics'
import { fetchLyrics } from '@/services/lyrics'

const playerStore = usePlayerStore()
const lyricsEngine = useLyricsEngine()
const loading = ref(false)
const containerRef = ref<HTMLElement | null>(null)

watch(
  () => playerStore.currentTrack,
  async (track) => {
    lyricsEngine.clear()
    if (!track) return

    loading.value = true
    try {
      const result = await fetchLyrics(
        track.artist,
        track.title,
        track.duration,
      )
      if (result.synced.length > 0) {
        lyricsEngine.setLyrics(result.synced)
      } else if (result.plain) {
        lyricsEngine.parseLRC(result.plain)
      }
    } catch {
      // silent fail
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

watch(
  () => playerStore.currentTime,
  (time) => {
    lyricsEngine.updateCurrentLine(time)
    scrollToCurrent()
  },
)

function scrollToCurrent() {
  const container = containerRef.value
  if (!container) return
  const activeEl = container.querySelector('.lyric-line.active') as HTMLElement
  if (!activeEl) return
  const containerRect = container.getBoundingClientRect()
  const elRect = activeEl.getBoundingClientRect()
  const offset = elRect.top - containerRect.top - containerRect.height / 2 + elRect.height / 2
  container.scrollBy({ top: offset, behavior: 'smooth' })
}
</script>

<template>
  <div class="lyrics-panel panel">
    <div class="lyrics-container" ref="containerRef">
      <div v-if="loading" class="lyrics-loading">
        <div class="spinner"></div>
        <span>Fetching lyrics...</span>
      </div>
      <template v-else-if="lyricsEngine.lyrics.value.length > 0">
        <div
          v-for="(line, index) in lyricsEngine.lyrics.value"
          :key="index"
          class="lyric-line"
          :class="{
            active: index === lyricsEngine.currentLineIndex.value,
            past: index < lyricsEngine.currentLineIndex.value,
          }"
        >
          {{ line.text }}
        </div>
      </template>
      <div v-else class="lyrics-empty">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div class="empty-text">No lyrics available</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lyrics-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 12px 8px;
  overflow: hidden;
}

.lyrics-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.lyrics-container::-webkit-scrollbar {
  width: 4px;
}

.lyrics-container::-webkit-scrollbar-track {
  background: transparent;
}

.lyrics-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.lyric-line {
  padding: 8px 8px;
  font-size: 14px;
  color: var(--text-tertiary);
  transition: all 0.3s ease;
  line-height: 1.6;
  border-radius: 4px;
  text-align: center;
}

.lyric-line.past {
  color: var(--text-tertiary);
  opacity: 0.7;
}

.lyric-line.active {
  color: var(--accent);
  font-size: 18px;
  font-weight: 600;
  background: var(--accent-bg);
}

.lyrics-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.lyrics-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: 0.3;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  color: var(--text-tertiary);
}

.empty-text {
  font-size: 13px;
  color: var(--text-tertiary);
}
</style>
