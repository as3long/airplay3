<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { usePlayerStore } from './stores/player'
import { eventBus, EVENTS } from './utils/eventBus'
import { useEqualizer } from './composables/useEqualizer'
import type { Track } from './types/player'
import TitleBar from './components/TitleBar.vue'
import SongInfo from './components/SongInfo.vue'
import LyricsDisplay from './components/LyricsDisplay.vue'
import EqPanel from './components/EqPanel.vue'
import PlayerControls from './components/PlayerControls.vue'
import ProgressBar from './components/ProgressBar.vue'
import VolumeControl from './components/VolumeControl.vue'
import PlaylistPanel from './components/PlaylistPanel.vue'
import OnlineMusic from './components/OnlineMusic.vue'
import ContextMenu from './components/ContextMenu.vue'

const playerStore = usePlayerStore()
const eq = useEqualizer()
const isDragging = ref(false)
let currentAudio: HTMLAudioElement | null = null
const unlisteners: (() => void)[] = []
const SUPPORTED_EXTS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma', 'opus']

const initialized = !!(window as unknown as Record<string, unknown>).__airplay3_loaded

const eqBands = computed(() => eq.gains.value)
const eqEnabled = computed(() => eq.enabled.value)
const eqVisible = computed(() => eq.visible.value)
const showOnline = ref(false)
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  showContextMenu.value = true
}

function closeContextMenu() {
  showContextMenu.value = false
}

async function openAboutWindow() {
  showContextMenu.value = false
  const isDev = location.hostname === 'localhost'
  const url = isDev ? 'http://localhost:5173/about.html' : 'about.html'
  window.open(url, 'about', 'width=440,height=500,resizable=no,menubar=no,toolbar=no')
}

async function openFilePicker() {
  const selected = await open({
    multiple: true,
    filters: [{ name: 'Audio', extensions: SUPPORTED_EXTS }],
  })
  if (!selected) return
  const paths = Array.isArray(selected) ? selected : [selected]
  await loadFilesFromPaths(paths)
}

function isDuplicate(filePath: string): boolean {
  return playerStore.playlist.some(
    (t) => t.path.toLowerCase() === filePath.toLowerCase(),
  )
}

async function playTrack(track: Track) {
  if (!track) return
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.removeEventListener('timeupdate', onTimeUpdate)
    currentAudio.removeEventListener('ended', onEnded)
    currentAudio.removeEventListener('loadedmetadata', onMetadata)
  }

  let audioSrc = track.path
  if (!audioSrc.startsWith('data:') && !audioSrc.startsWith('blob:')) {
    audioSrc = await invoke<string>('read_file_as_data_url', { filePath: audioSrc })
  }

  const el = new Audio()
  el.src = audioSrc
  el.volume = playerStore.volume
  currentAudio = el

  eq.init(el)

  playerStore.play(track)
  savePlayerState()
  el.addEventListener('loadedmetadata', onMetadata)
  el.addEventListener('timeupdate', onTimeUpdate)
  el.addEventListener('ended', onEnded)
  el.play().catch(() => {})
}

function onMetadata() {
  if (!currentAudio || !playerStore.currentTrack) return
  playerStore.currentTrack.duration = currentAudio.duration
  playerStore.duration = currentAudio.duration
}

function onTimeUpdate() {
  if (currentAudio) playerStore.currentTime = currentAudio.currentTime
}

function onEnded() {
  playerStore.next()
  if (playerStore.currentTrack) playTrack(playerStore.currentTrack)
}

function handleRemoveTrack(trackId: number) {
  const wasPlaying = playerStore.currentTrack?.id === trackId
  playerStore.removeFromPlaylist(trackId)
  if (wasPlaying && playerStore.playlist.length > 0) {
    playTrack(playerStore.playlist[0])
  }
  persistPlaylist()
}

function onSongDownloaded(path: string) {
  loadFilesFromPaths([path])
}

async function persistPlaylist() {
  try {
    const tracks = playerStore.playlist.map((t) => ({
      title: t.title, artist: t.artist, album: t.album,
      duration: t.duration, path: t.path,
    }))
    await invoke('save_playlist', { tracks })
  } catch { /* silent */ }
}

async function loadSavedPlaylist() {
  try {
    const tracks = (await invoke('load_playlist')) as Array<{
      title: string; artist: string; album: string; duration: number; path: string
    }>
    for (const t of tracks) {
      playerStore.addToPlaylist({
        id: Date.now() + Math.random(),
        title: t.title, artist: t.artist, album: t.album,
        duration: t.duration, path: t.path,
      })
    }
  } catch { /* silent */ }
}

async function loadSavedVolume() {
  try {
    const vol = (await invoke('load_volume')) as number
    playerStore.setVolume(vol)
  } catch { /* silent */ }
}

async function loadFilesFromPaths(paths: string[]) {
  let addedFirst = false
  for (const filePath of paths) {
    const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
    if (!SUPPORTED_EXTS.includes(ext)) continue
    const fileName = filePath.split(/[/\\]/).pop() ?? filePath
    const name = fileName.replace(/\.[^.]+$/, '')
    if (isDuplicate(filePath)) continue

    const metadata = await invoke<{
      title: string | null; artist: string | null; album: string | null; duration: number
    }>('read_audio_metadata', { filePath }).catch(() => null)

    const track: Track = {
      id: Date.now() + Math.random(),
      title: metadata?.title || name,
      artist: metadata?.artist || 'Unknown Artist',
      album: metadata?.album || 'Unknown Album',
      duration: metadata?.duration || 0,
      path: filePath,
    }
    playerStore.addToPlaylist(track)
    if (!playerStore.currentTrack && !addedFirst) {
      playTrack(track)
      addedFirst = true
    }
  }
  persistPlaylist()
}

async function setupDragDrop() {
  const unlisten = await getCurrentWindow().onDragDropEvent((event) => {
    if (event.payload.type === 'enter') {
      isDragging.value = true
    } else if (event.payload.type === 'over') {
      isDragging.value = true
    } else if (event.payload.type === 'drop') {
      isDragging.value = false
      const paths = event.payload.paths
      if (paths && paths.length > 0) loadFilesFromPaths(paths)
    } else if (event.payload.type === 'leave') {
      isDragging.value = false
    }
  })
  unlisteners.push(unlisten)
}

function onPlayTrack(track: unknown) {
  if (track && typeof track === 'object' && 'id' in track) {
    playTrack(track as Track)
  }
}

function onTogglePlay() {
  if (!currentAudio) return
  if (playerStore.playing) currentAudio.play().catch(() => {})
  else currentAudio.pause()
  savePlayerState()
}

watch(() => playerStore.volume, (vol) => {
  if (currentAudio) {
    currentAudio.volume = vol
    savePlayerState()
  }
})

watch(() => playerStore.shuffle, () => {
  if (currentAudio) savePlayerState()
})

async function savePlayerState() {
  try {
    await invoke('save_player_state', {
      currentTrackId: playerStore.currentTrack?.id ?? null,
      currentTrackTitle: playerStore.currentTrack?.title ?? null,
      currentTrackArtist: playerStore.currentTrack?.artist ?? null,
      currentTrackPath: playerStore.currentTrack?.path ?? null,
      shuffle: playerStore.shuffle,
      volume: playerStore.volume,
      currentTime: playerStore.currentTime,
    })
  } catch { /* silent */ }
}

async function loadPlayerState() {
  try {
    const state = await invoke<{
      current_track_id: number | null
      current_track_title: string | null
      current_track_artist: string | null
      current_track_path: string | null
      shuffle: boolean
      volume: number
      current_time: number
    }>('load_player_state')

    playerStore.shuffle = state.shuffle
    playerStore.setVolume(state.volume)

    if (state.current_track_path && state.current_track_title) {
      let track = playerStore.playlist.find(
        (t) => t.path === state.current_track_path,
      )
      if (!track) {
        track = {
          id: Date.now() + Math.random(),
          title: state.current_track_title,
          artist: state.current_track_artist || 'Unknown Artist',
          album: 'Unknown Album',
          duration: 0,
          path: state.current_track_path,
        }
        playerStore.addToPlaylist(track)
      }
      playerStore.play(track)
      await playTrack(track)
      if (state.current_time > 0 && currentAudio) {
        const seekOnce = () => {
          if (currentAudio && currentAudio.readyState >= 1) {
            currentAudio.currentTime = state.current_time
            playerStore.currentTime = state.current_time
          }
        }
        if (currentAudio.readyState >= 1) {
          seekOnce()
        } else {
          currentAudio.addEventListener('loadedmetadata', seekOnce, { once: true })
        }
      }
    }
  } catch { /* silent */ }
}

onMounted(async () => {
  eventBus.on(EVENTS.PLAY_TRACK, onPlayTrack)
  eventBus.on(EVENTS.TOGGLE_PLAY, onTogglePlay)
  document.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('click', closeContextMenu)
  if (!initialized) {
    ;(window as unknown as Record<string, unknown>).__airplay3_loaded = true
    await loadSavedVolume()
    await loadSavedPlaylist()
    await eq.loadEq()
    await loadPlayerState()
  }
  await setupDragDrop()
})

onUnmounted(() => {
  eventBus.off(EVENTS.PLAY_TRACK, onPlayTrack)
  eventBus.off(EVENTS.TOGGLE_PLAY, onTogglePlay)
  document.removeEventListener('contextmenu', onContextMenu)
  document.removeEventListener('click', closeContextMenu)
  unlisteners.forEach((fn) => fn())
  eq.destroy()
  if (currentAudio) currentAudio.pause()
})
</script>

<template>
  <div class="app-container">
    <TitleBar />
    <div class="main-content">
      <div v-show="isDragging" class="drop-overlay">
        <div class="drop-text">Drop audio files here</div>
      </div>
      <div class="left-panel">
        <SongInfo :key="playerStore.currentTrack?.id ?? 'empty'" />
        <div class="controls-row"><PlayerControls /></div>
        <ProgressBar />
        <VolumeControl />
        <LyricsDisplay />
        <div class="eq-toggle-row">
          <button class="eq-show-btn" @click="eq.toggleVisible()">
            {{ eqVisible ? 'Hide EQ' : 'Show EQ' }}
          </button>
          <button class="eq-show-btn" @click="showOnline = !showOnline">
            {{ showOnline ? 'Hide Hot' : 'Show Hot' }}
          </button>
        </div>
        <EqPanel
          v-show="eqVisible"
          :eq-bands="eqBands"
          :eq-enabled="eqEnabled"
          @band-change="(i, g) => eq.setBandGain(i, g)"
          @toggle="(v) => eq.setEnabled(v)"
          @reset="() => eq.reset()"
          @preset="(n) => eq.setPreset(n)"
        />
        <OnlineMusic v-show="showOnline" @song-downloaded="onSongDownloaded" />
      </div>
      <div class="divider"></div>
      <PlaylistPanel @add-files="openFilePicker" @remove-track="handleRemoveTrack" />
    </div>
    <ContextMenu :visible="showContextMenu" :x="contextMenuX" :y="contextMenuY" @about="openAboutWindow" />
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: transparent; overflow: hidden; user-select: none;
}
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
.app-container {
  width: 100vw; height: 100vh;
  background: rgba(15, 15, 22, 0.9);
  display: flex; flex-direction: column; color: #ccc;
}
.main-content { flex: 1; display: flex; position: relative; overflow: hidden; }
.left-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: visible; }
.controls-row { display: flex; justify-content: center; padding: 4px 0; }
.divider { width: 1px; background: rgba(255,255,255,0.06); margin: 12px 0; }
.panel { background: rgba(255,255,255,0.04); border-radius: 8px; }
.drop-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(15,15,22,0.92);
  border: 2px dashed rgba(232,106,46,0.6);
  border-radius: 12px; margin: 12px; z-index: 100;
  pointer-events: none;
}
.drop-text { font-size: 1.3rem; color: #e86a2e; font-weight: 600; }

.eq-toggle-row {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 4px 0;
}

.eq-show-btn {
  padding: 4px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #888;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.eq-show-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
