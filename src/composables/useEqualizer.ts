import { ref, readonly } from 'vue'
import { invoke } from '@tauri-apps/api/core'

const DEFAULT_GAINS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

export function useEqualizer() {
  const audioContext = ref<AudioContext | null>(null)
  const sourceNode = ref<MediaElementAudioSourceNode | null>(null)
  const filters = ref<BiquadFilterNode[]>([])
  const enabled = ref(true)
  const gains = ref<number[]>([...DEFAULT_GAINS])
  const visible = ref(false)

  const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
  const types: BiquadFilterType[] = [
    'lowshelf', 'peaking', 'peaking', 'peaking', 'peaking',
    'peaking', 'peaking', 'peaking', 'peaking', 'highshelf',
  ]

  function init(audioElement: HTMLAudioElement) {
    if (audioContext.value) return

    const ctx = new AudioContext()
    const source = ctx.createMediaElementSource(audioElement)

    let prevNode: AudioNode = source
    const filterNodes: BiquadFilterNode[] = []

    for (let i = 0; i < frequencies.length; i++) {
      const filter = ctx.createBiquadFilter()
      filter.type = types[i]
      filter.frequency.value = frequencies[i]
      filter.gain.value = enabled.value ? gains.value[i] : 0
      filter.Q.value = 1.4
      prevNode.connect(filter)
      prevNode = filter
      filterNodes.push(filter)
    }

    prevNode.connect(ctx.destination)

    audioContext.value = ctx
    sourceNode.value = source
    filters.value = filterNodes
  }

  function setBandGain(index: number, gain: number) {
    const clamped = Math.max(-12, Math.min(12, gain))
    gains.value[index] = clamped
    if (filters.value[index] && enabled.value) {
      filters.value[index].gain.value = clamped
    }
    saveEq()
  }

  function setEnabled(on: boolean) {
    enabled.value = on
    filters.value.forEach((filter, i) => {
      filter.gain.value = on ? gains.value[i] : 0
    })
    saveEq()
  }

  function reset() {
    gains.value = [...DEFAULT_GAINS]
    filters.value.forEach((filter) => {
      filter.gain.value = 0
    })
    saveEq()
  }

  function setPreset(name: string) {
    const presets: Record<string, number[]> = {
      flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      rock: [5, 4, 3, 1, -1, 1, 3, 4, 5, 5],
      pop: [-1, 2, 4, 5, 4, 1, -1, -1, 2, 3],
      jazz: [3, 2, 1, 2, -1, -1, 0, 1, 3, 4],
      classical: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4],
      bass: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
      treble: [0, 0, 0, 0, 0, 1, 3, 5, 7, 9],
      vocal: [-2, -1, 0, 3, 5, 5, 3, 1, 0, -1],
    }
    const values = presets[name] ?? presets.flat!
    values.forEach((g, i) => setBandGain(i, g))
  }

  function toggleVisible() {
    visible.value = !visible.value
  }

  async function saveEq() {
    try {
      await invoke('save_eq', { bands: gains.value, enabled: enabled.value })
    } catch { /* silent */ }
  }

  async function loadEq() {
    try {
      const state = (await invoke('load_eq')) as { bands: number[]; enabled: boolean }
      if (state.bands && state.bands.length === 10) {
        gains.value = [...state.bands]
        enabled.value = state.enabled
        filters.value.forEach((filter, i) => {
          filter.gain.value = state.enabled ? state.bands[i] : 0
        })
      }
    } catch { /* silent */ }
  }

  function destroy() {
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
      sourceNode.value = null
      filters.value = []
    }
  }

  return {
    gains: readonly(gains),
    enabled: readonly(enabled),
    visible: readonly(visible),
    init,
    setBandGain,
    setEnabled,
    reset,
    setPreset,
    toggleVisible,
    loadEq,
    destroy,
  }
}
