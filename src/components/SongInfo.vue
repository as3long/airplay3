<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const formattedCurrentTime = computed(() => formatTime(playerStore.currentTime))

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="song-info panel">
    <div class="song-cover">
      <div class="cover-placeholder" v-if="playerStore.currentTrack">
        {{ playerStore.currentTrack.title[0] }}
      </div>
      <div class="cover-placeholder empty" v-else>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      </div>
    </div>
    <div class="song-text">
      <div class="song-title" v-if="playerStore.currentTrack">
        {{ playerStore.currentTrack.title }}
      </div>
      <div class="song-title empty" v-else>No Track Loaded</div>
      <div class="song-artist" v-if="playerStore.currentTrack">
        {{ playerStore.currentTrack.artist }}
      </div>
      <div class="song-artist empty" v-else>Drag & drop to play</div>
      <div class="song-time">{{ formattedCurrentTime }}</div>
    </div>
  </div>
</template>

<style scoped>
.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin: 8px 12px;
}

.song-cover {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(232, 106, 46, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.2);
}

.cover-placeholder.empty {
  background: rgba(255, 255, 255, 0.2);
}

.cover-placeholder.empty svg {
  width: 28px;
  height: 28px;
  opacity: 0.4;
}

.song-text {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-title.empty {
  opacity: 0.5;
}

.song-artist {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist.empty {
  opacity: 0.4;
}

.song-time {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
</style>
