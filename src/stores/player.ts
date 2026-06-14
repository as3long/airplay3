import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Track } from '@/types/player'

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref<Track | null>(null)
  const playing = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  const playlist = ref<Track[]>([])
  const shuffle = ref(false)

  const progress = computed(() => {
    if (duration.value === 0) return 0
    return currentTime.value / duration.value
  })

  function play(track?: Track) {
    if (track) {
      currentTrack.value = track
      duration.value = track.duration
      currentTime.value = 0
    }
    playing.value = true
  }

  function pause() {
    playing.value = false
  }

  function toggle() {
    playing.value = !playing.value
  }

  function next() {
    if (playlist.value.length === 0) return
    if (shuffle.value) {
      if (playlist.value.length === 1) {
        play(playlist.value[0])
      } else {
        let randomIndex
        do {
          randomIndex = Math.floor(Math.random() * playlist.value.length)
        } while (playlist.value[randomIndex].id === currentTrack.value?.id)
        play(playlist.value[randomIndex])
      }
    } else {
      const currentIndex = playlist.value.findIndex(
        (t) => t.id === currentTrack.value?.id,
      )
      const nextIndex =
        currentIndex < playlist.value.length - 1 ? currentIndex + 1 : 0
      play(playlist.value[nextIndex])
    }
  }

  function previous() {
    if (playlist.value.length === 0) return
    if (shuffle.value) {
      if (playlist.value.length === 1) {
        play(playlist.value[0])
      } else {
        let randomIndex
        do {
          randomIndex = Math.floor(Math.random() * playlist.value.length)
        } while (playlist.value[randomIndex].id === currentTrack.value?.id)
        play(playlist.value[randomIndex])
      }
    } else {
      const currentIndex = playlist.value.findIndex(
        (t) => t.id === currentTrack.value?.id,
      )
      const prevIndex =
        currentIndex > 0 ? currentIndex - 1 : playlist.value.length - 1
      play(playlist.value[prevIndex])
    }
  }

  function seek(time: number) {
    currentTime.value = Math.max(0, Math.min(time, duration.value))
  }

  function setVolume(vol: number) {
    volume.value = Math.max(0, Math.min(vol, 1))
  }

  function setPlaylist(tracks: Track[]) {
    playlist.value = tracks
  }

  function addToPlaylist(track: Track) {
    playlist.value.push(track)
  }

  function removeFromPlaylist(trackId: number) {
    playlist.value = playlist.value.filter((t) => t.id !== trackId)
  }

  function toggleShuffle() {
    shuffle.value = !shuffle.value
  }

  return {
    currentTrack,
    playing,
    currentTime,
    duration,
    volume,
    playlist,
    shuffle,
    progress,
    play,
    pause,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    setPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    toggleShuffle,
  }
})
