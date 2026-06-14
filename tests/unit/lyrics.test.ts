import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLyricsEngine } from '@/composables/useLyrics'

interface LyricLine {
  time: number
  text: string
}

describe('useLyricsEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create an instance', () => {
    const engine = useLyricsEngine()
    expect(engine).toBeDefined()
  })

  it('should initialize with empty lyrics', () => {
    const engine = useLyricsEngine()
    expect(engine.lyrics.value).toEqual([])
    expect(engine.currentLineIndex.value).toBe(-1)
  })

  it('should parse LRC format lyrics', () => {
    const engine = useLyricsEngine()
    const lrc = `[00:00.00]Title
[00:05.00]Line 1
[00:10.00]Line 2
[00:15.00]Line 3`
    engine.parseLRC(lrc)
    expect(engine.lyrics.value).toHaveLength(4)
    expect(engine.lyrics.value[0].text).toBe('Title')
    expect(engine.lyrics.value[1].time).toBe(5)
  })

  it('should parse LRC with offset', () => {
    const engine = useLyricsEngine()
    const lrc = `[00:00.00]Title
[00:05.00]Line 1`
    engine.parseLRC(lrc)
    engine.setOffset(1000)
    engine.updateCurrentLine(6)
    expect(engine.currentLineIndex.value).toBe(1)
  })

  it('should update current line based on time', () => {
    const engine = useLyricsEngine()
    const lrc = `[00:00.00]Title
[00:05.00]Line 1
[00:10.00]Line 2
[00:15.00]Line 3`
    engine.parseLRC(lrc)
    engine.updateCurrentLine(7)
    expect(engine.currentLineIndex.value).toBe(1)
    engine.updateCurrentLine(12)
    expect(engine.currentLineIndex.value).toBe(2)
  })

  it('should handle time before first lyric', () => {
    const engine = useLyricsEngine()
    const lrc = `[00:05.00]Line 1`
    engine.parseLRC(lrc)
    engine.updateCurrentLine(0)
    expect(engine.currentLineIndex.value).toBe(-1)
  })

  it('should handle time after last lyric', () => {
    const engine = useLyricsEngine()
    const lrc = `[00:05.00]Line 1
[00:10.00]Line 2`
    engine.parseLRC(lrc)
    engine.updateCurrentLine(20)
    expect(engine.currentLineIndex.value).toBe(1)
  })

  it('should clear lyrics', () => {
    const engine = useLyricsEngine()
    engine.parseLRC('[00:05.00]Line 1')
    engine.clear()
    expect(engine.lyrics.value).toEqual([])
    expect(engine.currentLineIndex.value).toBe(-1)
  })

  it('should set offset', () => {
    const engine = useLyricsEngine()
    engine.setOffset(500)
    expect(engine.offset.value).toBe(500)
  })

  it('should handle empty LRC string', () => {
    const engine = useLyricsEngine()
    engine.parseLRC('')
    expect(engine.lyrics.value).toEqual([])
  })

  it('should handle malformed LRC lines', () => {
    const engine = useLyricsEngine()
    engine.parseLRC('not a lyric line\n[00:05.00]Valid line')
    expect(engine.lyrics.value).toHaveLength(1)
  })

  it('should get current lyric text', () => {
    const engine = useLyricsEngine()
    engine.parseLRC('[00:05.00]Line 1\n[00:10.00]Line 2')
    engine.updateCurrentLine(7)
    expect(engine.currentLyric.value).toBe('Line 1')
  })

  it('should return empty string when no current line', () => {
    const engine = useLyricsEngine()
    engine.parseLRC('[00:05.00]Line 1')
    engine.updateCurrentLine(0)
    expect(engine.currentLyric.value).toBe('')
  })

  it('should support showing/hiding lyrics window', () => {
    const engine = useLyricsEngine()
    expect(engine.visible.value).toBe(false)
    engine.show()
    expect(engine.visible.value).toBe(true)
    engine.hide()
    expect(engine.visible.value).toBe(false)
    engine.toggle()
    expect(engine.visible.value).toBe(true)
  })

  it('should toggle click-through state', () => {
    const engine = useLyricsEngine()
    expect(engine.clickThrough.value).toBe(false)
    engine.toggleClickThrough()
    expect(engine.clickThrough.value).toBe(true)
    engine.toggleClickThrough()
    expect(engine.clickThrough.value).toBe(false)
  })
})
