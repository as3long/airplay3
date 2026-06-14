export interface ComponentPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface SkinComponents {
  titleBar?: ComponentPosition
  playerControls?: ComponentPosition
  progressBar?: ComponentPosition
  volumeControl?: ComponentPosition
  spectrum?: ComponentPosition
  [key: string]: ComponentPosition | undefined
}

export interface SkinConfig {
  name: string
  width: number
  height: number
  components: SkinComponents
}
