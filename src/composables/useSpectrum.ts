import { ref, readonly } from 'vue'

export function useSpectrumAnalyzer() {
  const fftData = ref<number[]>([])
  const isPlaying = ref(false)
  const canvas = ref<HTMLCanvasElement | null>(null)
  const barCount = ref(32)
  const barGap = ref(1)
  const color = ref('#1db954')

  let animationId: number | null = null

  function updateFFTData(data: number[]) {
    fftData.value = [...data]
  }

  function start() {
    if (isPlaying.value) return
    isPlaying.value = true
  }

  function stop() {
    isPlaying.value = false
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function setCanvas(c: HTMLCanvasElement) {
    canvas.value = c
  }

  function setBarCount(count: number) {
    barCount.value = count
  }

  function setBarGap(gap: number) {
    barGap.value = gap
  }

  function setAnalyzerColor(c: string) {
    color.value = c
  }

  function destroy() {
    stop()
    if (canvas.value) {
      const ctx = canvas.value.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
      }
    }
    canvas.value = null
    fftData.value = []
  }

  return {
    fftData: readonly(fftData),
    isPlaying: readonly(isPlaying),
    canvas: readonly(canvas),
    barCount: readonly(barCount),
    barGap: readonly(barGap),
    color: readonly(color),
    updateFFTData,
    start,
    stop,
    setCanvas,
    setBarCount,
    setBarGap,
    setColor: setAnalyzerColor,
    destroy,
  }
}
