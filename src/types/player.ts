export interface Track {
  id: number
  title: string
  artist: string
  album: string
  duration: number
  path: string
  coverUrl?: string
}

export interface PlayerState {
  currentTrack: Track | null
  playing: boolean
  currentTime: number
  duration: number
  volume: number
  playlist: Track[]
}
