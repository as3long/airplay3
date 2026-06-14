import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSpectrumAnalyzer } from '@/composables/useSpectrum'

describe('useSpectrumAnalyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create an instance', () => {
    const analyzer = useSpectrumAnalyzer()
    expect(analyzer).toBeDefined()
  })

  it('should initialize with empty FFT data', () => {
    const analyzer = useSpectrumAnalyzer()
    expect(analyzer.fftData.value).toEqual([])
  })

  it('should not be playing initially', () => {
    const analyzer = useSpectrumAnalyzer()
    expect(analyzer.isPlaying.value).toBe(false)
  })

  it('should update FFT data', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.updateFFTData(new Array(128).fill(0))
    expect(analyzer.fftData.value.length).toBe(128)
  })

  it('should handle empty FFT data', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.updateFFTData([])
    expect(analyzer.fftData.value).toEqual([])
  })

  it('should handle FFT length change', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.updateFFTData(new Array(64).fill(0))
    expect(analyzer.fftData.value.length).toBe(64)
    analyzer.updateFFTData(new Array(256).fill(0))
    expect(analyzer.fftData.value.length).toBe(256)
  })

  it('should start animation', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.start()
    expect(analyzer.isPlaying.value).toBe(true)
  })

  it('should stop animation', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.start()
    analyzer.stop()
    expect(analyzer.isPlaying.value).toBe(false)
  })

  it('should resume animation after stop', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.start()
    analyzer.stop()
    analyzer.start()
    expect(analyzer.isPlaying.value).toBe(true)
  })

  it('should not double-start', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.start()
    analyzer.start()
    expect(analyzer.isPlaying.value).toBe(true)
  })

  it('should not fail on stop when not playing', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.stop()
    expect(analyzer.isPlaying.value).toBe(false)
  })

  it('should set canvas element', () => {
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
      }),
      width: 800,
      height: 600,
    } as unknown as HTMLCanvasElement
    const analyzer = useSpectrumAnalyzer()
    analyzer.setCanvas(mockCanvas)
    expect(analyzer.canvas.value).toStrictEqual(mockCanvas)
  })

  it('should clear canvas on destroy', () => {
    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
    }
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockCtx),
      width: 800,
      height: 600,
    } as unknown as HTMLCanvasElement
    const analyzer = useSpectrumAnalyzer()
    analyzer.setCanvas(mockCanvas)
    analyzer.destroy()
    expect(mockCtx.clearRect).toHaveBeenCalled()
  })

  it('should stop animation on destroy', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.start()
    analyzer.destroy()
    expect(analyzer.isPlaying.value).toBe(false)
  })

  it('should set bar count', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.setBarCount(32)
    expect(analyzer.barCount.value).toBe(32)
  })

  it('should set bar gap', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.setBarGap(2)
    expect(analyzer.barGap.value).toBe(2)
  })

  it('should set color', () => {
    const analyzer = useSpectrumAnalyzer()
    analyzer.setColor('#ff0000')
    expect(analyzer.color.value).toBe('#ff0000')
  })
})
