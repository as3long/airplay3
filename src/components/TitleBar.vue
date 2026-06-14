<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const appWindow = getCurrentWindow()

async function minimize() {
  await appWindow.minimize()
}

async function toggleMaximize() {
  await appWindow.toggleMaximize()
}

async function close() {
  await appWindow.close()
}
</script>

<template>
  <div class="title-bar" data-tauri-drag-region>
    <div class="title-text" data-tauri-drag-region>AirPlay3</div>
    <div class="track-marquee" v-if="playerStore.currentTrack" data-tauri-drag-region>
      {{ playerStore.currentTrack.title }} — {{ playerStore.currentTrack.artist }}
    </div>
    <div class="controls">
      <button class="win-btn" title="Minimize" @click="minimize">
        <svg viewBox="0 0 12 12" width="10" height="10"><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
      <button class="win-btn" title="Maximize" @click="toggleMaximize">
        <svg viewBox="0 0 12 12" width="10" height="10"><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
      </button>
      <button class="win-btn close" title="Close" @click="close">
        <svg viewBox="0 0 12 12" width="10" height="10"><line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.2"/><line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  height: 36px;
  background: rgba(15, 15, 22, 0.7);
  display: flex;
  align-items: center;
  padding: 0 12px;
  user-select: none;
  -webkit-user-select: none;
  flex-shrink: 0;
}

.title-text {
  font-weight: 600;
  font-size: 12px;
  color: #e86a2e;
  margin-right: 12px;
}

.track-marquee {
  flex: 1;
  font-size: 11px;
  color: #555;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.controls {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

.win-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.win-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #aaa;
}

.win-btn.close:hover {
  background: rgba(232, 106, 46, 0.8);
  color: #fff;
}
</style>
