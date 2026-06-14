<script setup lang="ts">
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

const emit = defineEmits<{
  songDownloaded: [path: string]
}>()

interface Song {
  id: string
  title: string
  artist: string
  play_id: string
  play_url: string
  cached: boolean
}

const songs = ref<Song[]>([])
const loading = ref(false)
const downloading = ref<string | null>(null)
const error = ref('')
const loadProgress = ref('')

async function loadAll() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  songs.value = []
  for (let page = 1; page <= 10; page++) {
    loadProgress.value = `Loading page ${page} / 10...`
    try {
      const result = await invoke<Song[]>('fetch_hot_songs', { page })
      songs.value.push(...result)
      if (result.length === 0) break
    } catch (e) {
      error.value = String(e)
      break
    }
  }
  loadProgress.value = ''
  loading.value = false
}

async function downloadAndPlay(song: Song) {
  if (song.cached) {
    emit('songDownloaded', `/cached/${song.title}-${song.artist}.mp3`)
    return
  }
  downloading.value = song.id
  try {
    const path = await invoke<string>('download_song', {
      songId: song.id,
      title: song.title,
      artist: song.artist,
    })
    song.cached = true
    emit('songDownloaded', path)
  } catch (e) {
    error.value = String(e)
  } finally {
    downloading.value = null
  }
}
</script>

<template>
  <div class="online-panel panel">
    <div class="online-header">
      <span class="online-title">Hot Music</span>
      <button class="online-btn" @click="loadAll" :disabled="loading">
        {{ loading ? loadProgress || 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="error" class="online-error">{{ error }}</div>

    <div v-if="loading && songs.length === 0" class="online-progress">
      <div class="online-spinner"></div>
      <span>{{ loadProgress }}</span>
    </div>

    <div class="online-list" v-if="songs.length > 0">
      <div
        v-for="song in songs"
        :key="song.id"
        class="online-item"
        @click="downloadAndPlay(song)"
      >
        <div class="online-item-info">
          <span class="online-item-title">{{ song.title }}</span>
          <span class="online-item-artist" v-if="song.artist">{{ song.artist }}</span>
        </div>
        <button
          v-if="!song.cached"
          class="online-download-btn"
          :disabled="downloading === song.id"
        >
          {{ downloading === song.id ? '...' : '↓' }}
        </button>
        <span v-else class="online-cached">✓</span>
      </div>
    </div>

    <div v-else-if="!loading" class="online-empty">
      Click "Refresh" to load hot songs
    </div>
  </div>
</template>

<style scoped>
.online-panel {
  margin: 0 12px 12px;
  padding: 10px;
  max-height: 240px;
  display: flex;
  flex-direction: column;
}

.online-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.online-title {
  font-size: 12px;
  font-weight: 600;
  color: #888;
}

.online-btn {
  padding: 3px 10px;
  background: rgba(232, 106, 46, 0.15);
  border: 1px solid rgba(232, 106, 46, 0.3);
  border-radius: 4px;
  color: #e86a2e;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.online-btn:hover {
  background: rgba(232, 106, 46, 0.25);
}

.online-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.online-error {
  font-size: 10px;
  color: #e85555;
  margin-bottom: 8px;
}

.online-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 11px;
  color: #e86a2e;
}

.online-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(232, 106, 46, 0.2);
  border-top-color: #e86a2e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.online-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.online-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 6px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}

.online-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.online-item-info {
  flex: 1;
  min-width: 0;
}

.online-item-title {
  font-size: 11px;
  color: #ccc;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.online-item-artist {
  font-size: 9px;
  color: #666;
}

.online-download-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(232, 106, 46, 0.15);
  color: #e86a2e;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.online-download-btn:hover {
  background: rgba(232, 106, 46, 0.3);
}

.online-download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.online-cached {
  font-size: 12px;
  color: #4caf50;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.online-empty {
  font-size: 11px;
  color: #555;
  text-align: center;
  padding: 20px 0;
}
</style>
