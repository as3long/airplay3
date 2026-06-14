<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const volumePercent = computed(() => Math.round(playerStore.volume * 100))

function handleVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement
  playerStore.setVolume(parseFloat(target.value) / 100)
}
</script>

<template>
  <div class="volume-control">
    <button class="vol-icon" @click="playerStore.setVolume(playerStore.volume > 0 ? 0 : 1)">
      <svg v-if="playerStore.volume === 0" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>
      <svg v-else-if="playerStore.volume < 0.5" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L7 9H5z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    </button>
    <input
      type="range"
      class="volume-slider"
      min="0"
      max="100"
      :value="volumePercent"
      @input="handleVolumeChange"
    />
    <span class="vol-text">{{ volumePercent }}%</span>
  </div>
</template>

<style scoped>
.volume-control {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
}

.vol-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
}

.vol-icon:hover {
  color: var(--text-primary);
}

.volume-slider {
  flex: 1;
  height: 3px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
}

.vol-text {
  font-size: 10px;
  color: var(--text-tertiary);
  min-width: 28px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
