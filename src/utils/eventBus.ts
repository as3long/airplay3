type EventCallback = (...args: unknown[]) => void

class EventBus {
  private listeners = new Map<string, EventCallback[]>()

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: EventCallback) {
    const list = this.listeners.get(event)
    if (!list) return
    const idx = list.indexOf(callback)
    if (idx >= 0) list.splice(idx, 1)
  }

  emit(event: string, ...args: unknown[]) {
    const list = this.listeners.get(event)
    if (list) {
      for (const cb of list) cb(...args)
    }
  }
}

export const eventBus = new EventBus()

export const EVENTS = {
  PLAY_TRACK: 'play-track',
  PLAY_NEXT: 'play-next',
  PLAY_PREV: 'play-prev',
  TOGGLE_PLAY: 'toggle-play',
  TRACK_ENDED: 'track-ended',
  EQ_BAND_CHANGE: 'eq-band-change',
  EQ_TOGGLE: 'eq-toggle',
  EQ_RESET: 'eq-reset',
  EQ_PRESET: 'eq-preset',
  EQ_INIT: 'eq-init',
  SHUFFLE_TOGGLE: 'shuffle-toggle',
  PLAY_RANDOM: 'play-random',
} as const
