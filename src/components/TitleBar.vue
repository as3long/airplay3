<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
import { usePlayerStore } from '@/stores/player'

const props = defineProps<{
  themeName: string
}>()

const emit = defineEmits<{
  toggleTheme: []
}>()

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
      <button class="theme-btn" @click="emit('toggleTheme')" :title="props.themeName === 'orange' ? 'Switch to Cyan' : 'Switch to Orange'">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.39-1-.01-.66.27-1.26.63-1.73.36-.47.58-1.05.58-1.67 0-.83-.67-1.5-1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/>
        </svg>
      </button>
      <button class="win-btn" @click="minimize" title="Minimize">
        <svg viewBox="0 0 12 12" width="10" height="10"><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
      <button class="win-btn" @click="toggleMaximize" title="Maximize">
        <svg viewBox="0 0 12 12" width="10" height="10"><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
      </button>
      <button class="win-btn close" @click="close" title="Close">
        <svg viewBox="0 0 12 12" width="10" height="10"><line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.2"/><line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  height: 36px;
  background: var(--bg-titlebar);
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
  color: var(--accent);
  margin-right: 12px;
}

.track-marquee {
  flex: 1;
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.controls {
  display: flex;
  gap: 2px;
  align-items: center;
}

.theme-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  transition: all 0.15s;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--accent);
}

.win-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.win-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.win-btn.close:hover {
  background: rgba(232, 106, 46, 0.8);
  color: #fff;
}
</style>
