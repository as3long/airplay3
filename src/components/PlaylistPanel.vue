<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { eventBus, EVENTS } from '@/utils/eventBus'

const emit = defineEmits<{
  addFiles: []
  removeTrack: [trackId: number]
}>()

const playerStore = usePlayerStore()

const totalDuration = computed(() => {
  const total = playerStore.playlist.reduce((sum, t) => sum + t.duration, 0)
  const hours = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = Math.floor(total % 60)
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function selectTrack(trackId: number) {
  const track = playerStore.playlist.find((t) => t.id === trackId)
  if (track) eventBus.emit(EVENTS.PLAY_TRACK, track)
}
</script>

<template>
  <div class="playlist-panel panel">
    <div class="playlist-header">
      <span class="playlist-title">Playlist</span>
      <button class="add-btn" @click="emit('addFiles')" title="Add files">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <div class="playlist-list">
      <div
        v-if="playerStore.playlist.length === 0"
        class="playlist-empty"
      >
        <div class="empty-hint">Drop audio files here</div>
        <button class="add-files-btn" @click="emit('addFiles')">+ Add Files</button>
      </div>
      <div
        v-for="track in playerStore.playlist"
        :key="track.id"
        class="playlist-item"
        :class="{ active: track.id === playerStore.currentTrack?.id }"
        @click="selectTrack(track.id)"
      >
        <div class="item-info">
          <span class="item-title">{{ track.title }}</span>
          <span class="item-sep"> - </span>
          <span class="item-artist">{{ track.artist }}</span>
        </div>
        <span class="item-duration">{{ formatDuration(track.duration) }}</span>
        <button class="remove-btn" @click.stop="emit('removeTrack', track.id)" title="Remove">
          <svg viewBox="0 0 12 12" width="10" height="10"><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.2"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.2"/></svg>
        </button>
      </div>
    </div>

    <div class="playlist-footer">
      <span class="footer-count">
        {{ playerStore.playlist.length }} tracks
      </span>
      <span class="footer-duration">{{ totalDuration }}</span>
    </div>
  </div>
</template>

<style scoped>
.playlist-panel {
  display: flex;
  flex-direction: column;
  margin: 8px 12px 12px 0;
  width: 260px;
  flex-shrink: 0;
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 8px;
  border-bottom: 1px solid var(--border);
}

.playlist-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.add-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--accent);
}

.playlist-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.playlist-list::-webkit-scrollbar {
  width: 4px;
}

.playlist-list::-webkit-scrollbar-track {
  background: transparent;
}

.playlist-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.playlist-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 12px;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

.add-files-btn {
  padding: 6px 14px;
  background: var(--accent-bg);
  border: 1px solid var(--accent);
  border-radius: 6px;
  color: var(--accent);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.add-files-btn:hover {
  background: var(--accent-bg);
  filter: brightness(1.2);
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 14px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 8px;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.playlist-item.active {
  background: var(--accent-bg);
}

.playlist-item.active .item-title {
  color: var(--accent);
}

.playlist-item.active .item-artist {
  color: var(--accent);
  opacity: 0.7;
}

.item-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.item-title {
  color: var(--text-primary);
}

.item-sep {
  color: var(--text-tertiary);
}

.item-artist {
  color: var(--text-secondary);
}

.item-duration {
  font-size: 11px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.remove-btn {
  opacity: 0;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.playlist-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: var(--accent);
  background: rgba(232, 106, 46, 0.15);
}

.playlist-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-tertiary);
}
</style>
