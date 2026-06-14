import { ref, readonly } from 'vue'

const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma', 'opus']

const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/flac',
  'audio/ogg',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
  'audio/x-wav',
  'audio/x-flac',
  'audio/x-ms-wma',
  'audio/opus',
]

type FilesCallback = (files: File[]) => void

export function useDragDrop() {
  const isDragging = ref(false)
  const callbacks: FilesCallback[] = []

  const acceptedTypes = AUDIO_MIME_TYPES

  function filterAudioFiles(files: File[]): File[] {
    return files.filter((file) => {
      if (file.type && AUDIO_MIME_TYPES.includes(file.type)) {
        return true
      }
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      return AUDIO_EXTENSIONS.includes(ext)
    })
  }

  function onDragEnter() {
    isDragging.value = true
  }

  function onDragLeave() {
    isDragging.value = false
  }

  function onDrop(files: File[]): File[] {
    isDragging.value = false
    const audioFiles = filterAudioFiles(files)
    if (audioFiles.length > 0) {
      for (const cb of callbacks) {
        cb(audioFiles)
      }
    }
    return audioFiles
  }

  function onFilesAdded(callback: FilesCallback) {
    callbacks.push(callback)
  }

  function offFilesAdded(callback: FilesCallback) {
    const idx = callbacks.indexOf(callback)
    if (idx >= 0) callbacks.splice(idx, 1)
  }

  function createObjectURL(file: File): string {
    return URL.createObjectURL(file)
  }

  function revokeObjectURL(url: string) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  function getFileNameWithoutExt(name: string): string {
    const parts = name.split('.')
    if (parts.length > 1) {
      parts.pop()
    }
    return parts.join('.')
  }

  function getAudioType(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? ''
    const typeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      ogg: 'audio/ogg',
      aac: 'audio/aac',
      m4a: 'audio/mp4',
      wma: 'audio/x-ms-wma',
      opus: 'audio/opus',
    }
    return typeMap[ext] ?? 'audio/mpeg'
  }

  return {
    isDragging: readonly(isDragging),
    acceptedTypes,
    filterAudioFiles,
    onDragEnter,
    onDragLeave,
    onDrop,
    onFilesAdded,
    offFilesAdded,
    createObjectURL,
    revokeObjectURL,
    getFileNameWithoutExt,
    getAudioType,
  }
}
