import { ref, readonly } from 'vue'

export interface AudioEngine {
  readonly currentTime: ReturnType<typeof ref<number>>
  readonly duration: ReturnType<typeof ref<number>>
  load: (url: string) => void
  play: () => Promise<void>
  pause: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  syncState: () => void
  onTimeUpdate: (callback: () => void) => void
  onEnded: (callback: () => void) => void
  onLoadedMetadata: (callback: () => void) => void
  destroy: () => void
}

export function useAudioEngine(): AudioEngine {
  const audio = new Audio()
  const currentTime = ref(0)
  const duration = ref(0)

  const listeners: Array<{ event: string; handler: EventListener }> = []

  function registerListener(event: string, handler: EventListener) {
    audio.addEventListener(event, handler)
    listeners.push({ event, handler })
  }

  function load(url: string) {
    audio.src = url
    audio.load()
  }

  async function play(): Promise<void> {
    if (!audio.src) return
    try {
      await audio.play()
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'AbortError')) {
        return
      }
      throw err
    }
  }

  function pause() {
    audio.pause()
  }

  function seek(time: number) {
    const dur = audio.duration
    if (dur === 0 || isNaN(dur)) {
      audio.currentTime = 0
      return
    }
    audio.currentTime = Math.max(0, Math.min(time, dur))
  }

  function setVolume(vol: number) {
    audio.volume = Math.max(0, Math.min(vol, 1))
  }

  function syncState() {
    currentTime.value = audio.currentTime
    duration.value = audio.duration
  }

  function onTimeUpdate(callback: () => void) {
    registerListener('timeupdate', () => {
      syncState()
      callback()
    })
  }

  function onEnded(callback: () => void) {
    registerListener('ended', callback)
  }

  function onLoadedMetadata(callback: () => void) {
    registerListener('loadedmetadata', () => {
      syncState()
      callback()
    })
  }

  function destroy() {
    for (const { event, handler } of listeners) {
      audio.removeEventListener(event, handler)
    }
    listeners.length = 0
    audio.pause()
    audio.src = ''
  }

  return {
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    load,
    play,
    pause,
    seek,
    setVolume,
    syncState,
    onTimeUpdate,
    onEnded,
    onLoadedMetadata,
    destroy,
  }
}
