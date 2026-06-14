import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAudioEngine } from '@/composables/useAudioEngine'

const mockPlay = vi.fn().mockResolvedValue(undefined)
const mockPause = vi.fn()
const mockLoad = vi.fn()
let mockCurrentTime = 0
let mockDuration = 180
let mockVolume = 1
let mockSrc = ''
const eventListeners: Record<string, Function[]> = {}

const mockAudio = {
  get src() { return mockSrc },
  set src(val: string) { mockSrc = val },
  play: mockPlay,
  pause: mockPause,
  load: mockLoad,
  get currentTime() { return mockCurrentTime },
  set currentTime(val: number) { mockCurrentTime = val },
  get duration() { return mockDuration },
  set duration(val: number) { mockDuration = val },
  get volume() { return mockVolume },
  set volume(val: number) { mockVolume = Math.max(0, Math.min(val, 1)) },
  addEventListener: vi.fn((event: string, cb: Function) => {
    if (!eventListeners[event]) eventListeners[event] = []
    eventListeners[event].push(cb)
  }),
  removeEventListener: vi.fn((event: string, cb: Function) => {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter(fn => fn !== cb)
    }
  }),
}

describe('useAudioEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(eventListeners).forEach(k => delete eventListeners[k])
    mockCurrentTime = 0
    mockDuration = 180
    mockVolume = 1
    mockSrc = ''
    vi.stubGlobal('Audio', vi.fn(() => mockAudio))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should create an audio instance', () => {
    const engine = useAudioEngine()
    expect(engine).toBeDefined()
  })

  it('should load a track URL', () => {
    const engine = useAudioEngine()
    engine.load('/test.mp3')
    expect(mockSrc).toContain('/test.mp3')
    expect(mockLoad).toHaveBeenCalled()
  })

  it('should play audio', async () => {
    const engine = useAudioEngine()
    engine.load('/test.mp3')
    await engine.play()
    expect(mockPlay).toHaveBeenCalled()
  })

  it('should handle play when no track loaded', async () => {
    const engine = useAudioEngine()
    mockSrc = ''
    await engine.play()
    expect(mockPlay).not.toHaveBeenCalled()
  })

  it('should handle play rejection gracefully', async () => {
    mockPlay.mockRejectedValueOnce(new Error('AbortError'))
    const engine = useAudioEngine()
    engine.load('/test.mp3')
    await expect(engine.play()).resolves.not.toThrow()
  })

  it('should pause audio', () => {
    const engine = useAudioEngine()
    engine.pause()
    expect(mockPause).toHaveBeenCalled()
  })

  it('should seek to position', () => {
    const engine = useAudioEngine()
    mockDuration = 180
    engine.seek(90)
    expect(mockCurrentTime).toBe(90)
  })

  it('should clamp seek to 0', () => {
    const engine = useAudioEngine()
    mockDuration = 180
    engine.seek(-10)
    expect(mockCurrentTime).toBe(0)
  })

  it('should clamp seek to duration', () => {
    const engine = useAudioEngine()
    mockDuration = 180
    engine.seek(200)
    expect(mockCurrentTime).toBe(180)
  })

  it('should handle seek when duration is 0', () => {
    const engine = useAudioEngine()
    mockDuration = 0
    engine.seek(10)
    expect(mockCurrentTime).toBe(0)
  })

  it('should set volume', () => {
    const engine = useAudioEngine()
    engine.setVolume(0.5)
    expect(mockVolume).toBe(0.5)
  })

  it('should clamp volume to 0', () => {
    const engine = useAudioEngine()
    engine.setVolume(-0.5)
    expect(mockVolume).toBe(0)
  })

  it('should clamp volume to 1', () => {
    const engine = useAudioEngine()
    engine.setVolume(1.5)
    expect(mockVolume).toBe(1)
  })

  it('should register timeupdate listener', () => {
    const engine = useAudioEngine()
    engine.onTimeUpdate(() => {})
    expect(mockAudio.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function))
  })

  it('should register ended listener', () => {
    const engine = useAudioEngine()
    engine.onEnded(() => {})
    expect(mockAudio.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function))
  })

  it('should register loadedmetadata listener', () => {
    const engine = useAudioEngine()
    engine.onLoadedMetadata(() => {})
    expect(mockAudio.addEventListener).toHaveBeenCalledWith('loadedmetadata', expect.any(Function))
  })

  it('should cleanup listeners on destroy', () => {
    const engine = useAudioEngine()
    const callback = vi.fn()
    engine.onTimeUpdate(callback)
    engine.destroy()
    expect(mockAudio.removeEventListener).toHaveBeenCalled()
  })

  it('should expose current state', () => {
    const engine = useAudioEngine()
    expect(engine.currentTime.value).toBe(0)
    expect(engine.duration.value).toBe(0)
  })

  it('should sync state from audio element', () => {
    mockCurrentTime = 60
    mockDuration = 180
    const engine = useAudioEngine()
    engine.syncState()
    expect(engine.currentTime.value).toBe(60)
    expect(engine.duration.value).toBe(180)
  })
})
