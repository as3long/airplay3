import { ref, readonly } from 'vue'
import type { SkinColors } from '@/types/skin'

interface Theme {
  name: string
  colors: SkinColors
}

function cssVarName(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

const ORANGE_THEME: Theme = {
  name: 'orange',
  colors: {
    accent: '#e86a2e',
    accentHover: '#ff7a3d',
    accentBg: 'rgba(232, 106, 46, 0.15)',
    bgMain: 'rgba(15, 15, 22, 0.9)',
    bgTitlebar: 'rgba(15, 15, 22, 0.7)',
    bgPanel: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#ccc',
    textSecondary: '#888',
    textTertiary: '#555',
    border: 'rgba(255, 255, 255, 0.1)',
  },
}

const CYAN_THEME: Theme = {
  name: 'cyan',
  colors: {
    accent: '#00bcd4',
    accentHover: '#26c6da',
    accentBg: 'rgba(0, 188, 212, 0.15)',
    bgMain: 'rgba(12, 18, 28, 0.9)',
    bgTitlebar: 'rgba(12, 18, 28, 0.7)',
    bgPanel: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#e0e0e0',
    textSecondary: '#9e9e9e',
    textTertiary: '#616161',
    border: 'rgba(255, 255, 255, 0.08)',
  },
}

const GREEN_THEME: Theme = {
  name: 'green',
  colors: {
    accent: '#4caf50',
    accentHover: '#66bb6a',
    accentBg: 'rgba(76, 175, 80, 0.15)',
    bgMain: 'rgba(13, 20, 15, 0.93)',
    bgTitlebar: 'rgba(13, 20, 15, 0.7)',
    bgPanel: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#d0d0d0',
    textSecondary: '#9e9e9e',
    textTertiary: '#616161',
    border: 'rgba(255, 255, 255, 0.08)',
  },
}

const RED_THEME: Theme = {
  name: 'red',
  colors: {
    accent: '#e53935',
    accentHover: '#ef5350',
    accentBg: 'rgba(229, 57, 53, 0.15)',
    bgMain: 'rgba(22, 12, 12, 0.93)',
    bgTitlebar: 'rgba(22, 12, 12, 0.7)',
    bgPanel: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#d0d0d0',
    textSecondary: '#9e9e9e',
    textTertiary: '#616161',
    border: 'rgba(255, 255, 255, 0.08)',
  },
}

const THEMES: Record<string, Theme> = {
  orange: ORANGE_THEME,
  cyan: CYAN_THEME,
  green: GREEN_THEME,
  red: RED_THEME,
}

const STORAGE_KEY = 'airplay3-theme'

export function useTheme() {
  const currentThemeName = ref<string>(ORANGE_THEME.name)
  const currentTheme = ref<Theme>(ORANGE_THEME)
  const themeList = ref(Object.keys(THEMES))

  function applyTheme(theme: Theme) {
    currentTheme.value = theme
    currentThemeName.value = theme.name
    const root = document.documentElement
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--${cssVarName(key)}`, value)
    }
  }

  function switchTheme(name: string) {
    const theme = THEMES[name]
    if (!theme) return
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, name)
  }

  function toggleTheme() {
    const names = Object.keys(THEMES)
    const idx = names.indexOf(currentThemeName.value)
    const next = names[(idx + 1) % names.length]
    switchTheme(next)
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY)
    const theme = saved && THEMES[saved] ? THEMES[saved] : ORANGE_THEME
    applyTheme(theme)
  }

  initTheme()

  return {
    currentThemeName: readonly(currentThemeName),
    currentTheme: readonly(currentTheme),
    themeList: readonly(themeList),
    switchTheme,
    toggleTheme,
  }
}
