<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { eventBus, EVENTS } from '@/utils/eventBus'

const playerStore = usePlayerStore()

function prev() {
  playerStore.previous()
  if (playerStore.currentTrack) eventBus.emit(EVENTS.PLAY_TRACK, playerStore.currentTrack)
}

function toggle() {
  playerStore.toggle()
  eventBus.emit(EVENTS.TOGGLE_PLAY)
}

function next() {
  playerStore.next()
  if (playerStore.currentTrack) eventBus.emit(EVENTS.PLAY_TRACK, playerStore.currentTrack)
}

function toggleShuffle() {
  playerStore.toggleShuffle()
}
</script>

<template>
  <div class="player-controls">
    <button class="ctrl-btn" :class="{ active: playerStore.shuffle }" @click="toggleShuffle" :title="playerStore.shuffle ? 'Shuffle On' : 'Shuffle Off'">
      <svg v-if="playerStore.shuffle" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.16-3.13z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
      </svg>
    </button>
    <button class="ctrl-btn" @click="prev" title="Previous">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
      </svg>
    </button>
    <button class="ctrl-btn play-btn" @click="toggle" :title="playerStore.playing ? 'Pause' : 'Play'">
      <svg v-if="!playerStore.playing" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>
    <button class="ctrl-btn" @click="next" title="Next">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ctrl-btn {
  width: 32px; height: 32px; border: none; background: transparent;
  color: var(--text-secondary); border-radius: 50%; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all 0.15s;
}
.ctrl-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); }
.ctrl-btn.active { color: var(--accent); }
.play-btn {
  width: 44px; height: 44px;
  background: var(--accent-bg); color: var(--accent);
}
.play-btn:hover { background: var(--accent-bg); filter: brightness(1.2); }
</style>
