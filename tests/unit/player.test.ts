import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import type { Track } from '@/types/player'

const mockTrack: Track = {
  id: 1,
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: 180,
  path: '/test/song.mp3',
}

const mockTrack2: Track = {
  id: 2,
  title: 'Test Song 2',
  artist: 'Test Artist 2',
  album: 'Test Album 2',
  duration: 200,
  path: '/test/song2.mp3',
}

describe('PlayerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const store = usePlayerStore()
    expect(store.currentTrack).toBeNull()
    expect(store.playing).toBe(false)
    expect(store.currentTime).toBe(0)
    expect(store.duration).toBe(0)
    expect(store.volume).toBe(1)
    expect(store.playlist).toEqual([])
  })

  it('should play a track', () => {
    const store = usePlayerStore()
    store.play(mockTrack)
    expect(store.currentTrack).toEqual(mockTrack)
    expect(store.playing).toBe(true)
    expect(store.duration).toBe(180)
    expect(store.currentTime).toBe(0)
  })

  it('should play without track (resume)', () => {
    const store = usePlayerStore()
    store.playing = false
    store.play()
    expect(store.playing).toBe(true)
  })

  it('should pause playback', () => {
    const store = usePlayerStore()
    store.playing = true
    store.pause()
    expect(store.playing).toBe(false)
  })

  it('should toggle playback', () => {
    const store = usePlayerStore()
    expect(store.playing).toBe(false)
    store.toggle()
    expect(store.playing).toBe(true)
    store.toggle()
    expect(store.playing).toBe(false)
  })

  it('should go to next track', () => {
    const store = usePlayerStore()
    store.setPlaylist([mockTrack, mockTrack2])
    store.play(mockTrack)
    store.next()
    expect(store.currentTrack).toEqual(mockTrack2)
    expect(store.playing).toBe(true)
  })

  it('should wrap to first track when next at end', () => {
    const store = usePlayerStore()
    store.setPlaylist([mockTrack, mockTrack2])
    store.play(mockTrack2)
    store.next()
    expect(store.currentTrack).toEqual(mockTrack)
  })

  it('should go to previous track', () => {
    const store = usePlayerStore()
    store.setPlaylist([mockTrack, mockTrack2])
    store.play(mockTrack2)
    store.previous()
    expect(store.currentTrack).toEqual(mockTrack)
    expect(store.playing).toBe(true)
  })

  it('should wrap to last track when previous at start', () => {
    const store = usePlayerStore()
    store.setPlaylist([mockTrack, mockTrack2])
    store.play(mockTrack)
    store.previous()
    expect(store.currentTrack).toEqual(mockTrack2)
  })

  it('should do nothing on next with empty playlist', () => {
    const store = usePlayerStore()
    store.next()
    expect(store.currentTrack).toBeNull()
    expect(store.playing).toBe(false)
  })

  it('should do nothing on previous with empty playlist', () => {
    const store = usePlayerStore()
    store.previous()
    expect(store.currentTrack).toBeNull()
    expect(store.playing).toBe(false)
  })

  it('should seek to position', () => {
    const store = usePlayerStore()
    store.duration = 180
    store.seek(90)
    expect(store.currentTime).toBe(90)
  })

  it('should clamp seek to 0', () => {
    const store = usePlayerStore()
    store.duration = 180
    store.seek(-10)
    expect(store.currentTime).toBe(0)
  })

  it('should clamp seek to duration', () => {
    const store = usePlayerStore()
    store.duration = 180
    store.seek(200)
    expect(store.currentTime).toBe(180)
  })

  it('should set volume', () => {
    const store = usePlayerStore()
    store.setVolume(0.5)
    expect(store.volume).toBe(0.5)
  })

  it('should clamp volume to 0', () => {
    const store = usePlayerStore()
    store.setVolume(-0.5)
    expect(store.volume).toBe(0)
  })

  it('should clamp volume to 1', () => {
    const store = usePlayerStore()
    store.setVolume(1.5)
    expect(store.volume).toBe(1)
  })

  it('should compute progress', () => {
    const store = usePlayerStore()
    store.duration = 180
    store.currentTime = 90
    expect(store.progress).toBe(0.5)
  })

  it('should compute progress as 0 when duration is 0', () => {
    const store = usePlayerStore()
    store.duration = 0
    store.currentTime = 0
    expect(store.progress).toBe(0)
  })

  it('should set playlist', () => {
    const store = usePlayerStore()
    store.setPlaylist([mockTrack, mockTrack2])
    expect(store.playlist).toHaveLength(2)
  })

  it('should add to playlist', () => {
    const store = usePlayerStore()
    store.addToPlaylist(mockTrack)
    store.addToPlaylist(mockTrack2)
    expect(store.playlist).toHaveLength(2)
  })

  it('should remove from playlist', () => {
    const store = usePlayerStore()
    store.setPlaylist([mockTrack, mockTrack2])
    store.removeFromPlaylist(1)
    expect(store.playlist).toHaveLength(1)
    expect(store.playlist[0].id).toBe(2)
  })
})
