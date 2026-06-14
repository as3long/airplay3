import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDragDrop } from '@/composables/useDragDrop'

describe('useDragDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create an instance', () => {
    const dd = useDragDrop()
    expect(dd).toBeDefined()
  })

  it('should initialize with dragging false', () => {
    const dd = useDragDrop()
    expect(dd.isDragging.value).toBe(false)
  })

  it('should accept audio file types', () => {
    const dd = useDragDrop()
    expect(dd.acceptedTypes).toContain('audio/mpeg')
    expect(dd.acceptedTypes).toContain('audio/mp3')
    expect(dd.acceptedTypes).toContain('audio/wav')
    expect(dd.acceptedTypes).toContain('audio/flac')
    expect(dd.acceptedTypes).toContain('audio/ogg')
    expect(dd.acceptedTypes).toContain('audio/aac')
    expect(dd.acceptedTypes).toContain('audio/mp4')
  })

  it('should filter valid audio files from drop', () => {
    const dd = useDragDrop()
    const files = [
      { name: 'song.mp3', type: 'audio/mpeg', size: 1000 },
      { name: 'image.png', type: 'image/png', size: 5000 },
      { name: 'track.flac', type: 'audio/flac', size: 2000 },
      { name: 'doc.pdf', type: 'application/pdf', size: 3000 },
    ] as File[]
    const result = dd.filterAudioFiles(files)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('song.mp3')
    expect(result[1].name).toBe('track.flac')
  })

  it('should filter files by extension when type is empty', () => {
    const dd = useDragDrop()
    const files = [
      { name: 'song.mp3', type: '', size: 1000 },
      { name: 'track.wav', type: '', size: 2000 },
      { name: 'image.png', type: '', size: 5000 },
    ] as File[]
    const result = dd.filterAudioFiles(files)
    expect(result).toHaveLength(2)
  })

  it('should handle drag enter', () => {
    const dd = useDragDrop()
    dd.onDragEnter()
    expect(dd.isDragging.value).toBe(true)
  })

  it('should handle drag leave', () => {
    const dd = useDragDrop()
    dd.onDragEnter()
    dd.onDragLeave()
    expect(dd.isDragging.value).toBe(false)
  })

  it('should reset drag state on drop', () => {
    const dd = useDragDrop()
    dd.onDragEnter()
    const files = [{ name: 'song.mp3', type: 'audio/mpeg', size: 1000 }] as File[]
    const result = dd.onDrop(files)
    expect(dd.isDragging.value).toBe(false)
    expect(result).toHaveLength(1)
  })

  it('should emit callback with valid files', () => {
    const dd = useDragDrop()
    const callback = vi.fn()
    dd.onFilesAdded(callback)
    const files = [{ name: 'song.mp3', type: 'audio/mpeg', size: 1000 }] as File[]
    dd.onDrop(files)
    expect(callback).toHaveBeenCalledWith([files[0]])
  })

  it('should not emit callback when no valid files', () => {
    const dd = useDragDrop()
    const callback = vi.fn()
    dd.onFilesAdded(callback)
    const files = [{ name: 'image.png', type: 'image/png', size: 5000 }] as File[]
    dd.onDrop(files)
    expect(callback).not.toHaveBeenCalled()
  })

  it('should handle empty file list', () => {
    const dd = useDragDrop()
    const callback = vi.fn()
    dd.onFilesAdded(callback)
    dd.onDrop([])
    expect(callback).not.toHaveBeenCalled()
  })

  it('should support multiple callbacks', () => {
    const dd = useDragDrop()
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    dd.onFilesAdded(cb1)
    dd.onFilesAdded(cb2)
    const files = [{ name: 'song.mp3', type: 'audio/mpeg', size: 1000 }] as File[]
    dd.onDrop(files)
    expect(cb1).toHaveBeenCalled()
    expect(cb2).toHaveBeenCalled()
  })

  it('should remove callback listener', () => {
    const dd = useDragDrop()
    const cb = vi.fn()
    dd.onFilesAdded(cb)
    dd.offFilesAdded(cb)
    const files = [{ name: 'song.mp3', type: 'audio/mpeg', size: 1000 }] as File[]
    dd.onDrop(files)
    expect(cb).not.toHaveBeenCalled()
  })

  it('should generate object URL for file', () => {
    const dd = useDragDrop()
    const blob = new Blob(['test'], { type: 'audio/mpeg' })
    const file = new File([blob], 'song.mp3', { type: 'audio/mpeg' })
    const url = dd.createObjectURL(file)
    expect(url).toBeTruthy()
    expect(url.startsWith('blob:')).toBe(true)
  })

  it('should extract file name without extension', () => {
    const dd = useDragDrop()
    expect(dd.getFileNameWithoutExt('song.mp3')).toBe('song')
    expect(dd.getFileNameWithoutExt('my.track.flac')).toBe('my.track')
    expect(dd.getFileNameWithoutExt('noext')).toBe('noext')
  })
})
