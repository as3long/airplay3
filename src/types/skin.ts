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

export interface SkinColors {
  accent: string
  accentHover: string
  accentBg: string
  bgMain: string
  bgTitlebar: string
  bgPanel: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  border: string
}

export interface SkinConfig {
  name: string
  width: number
  height: number
  components: SkinComponents
  colors?: SkinColors
}
