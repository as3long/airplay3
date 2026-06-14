<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const progressPercent = computed(() => {
  return playerStore.progress * 100
})

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function handleSeek(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percent = x / rect.width
  playerStore.seek(percent * playerStore.duration)
}
</script>

<template>
  <div class="progress-container">
    <div class="progress-bar" @click="handleSeek">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>
    <div class="progress-times">
      <span>{{ formatTime(playerStore.currentTime) }}</span>
      <span>{{ formatTime(playerStore.duration) }}</span>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  padding: 4px 12px 8px;
}

.progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: height 0.15s;
}

.progress-bar:hover {
  height: 5px;
}

.progress-fill {
  height: 100%;
  background: #e86a2e;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-times {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #555;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
</style>
