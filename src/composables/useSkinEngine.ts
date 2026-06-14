import { ref, readonly } from 'vue'
import type { SkinConfig, ComponentPosition } from '@/types/skin'

const DEFAULT_SKIN: SkinConfig = {
  name: 'default',
  width: 800,
  height: 600,
  components: {},
}

function validateSkin(skin: SkinConfig): void {
  if (!skin || typeof skin !== 'object') {
    throw new Error('Invalid skin config')
  }
  if (!skin.name || typeof skin.name !== 'string') {
    throw new Error('Invalid skin: missing name')
  }
  if (skin.width === undefined || typeof skin.width !== 'number') {
    throw new Error('Invalid skin: missing width')
  }
  if (skin.height === undefined || typeof skin.height !== 'number') {
    throw new Error('Invalid skin: missing height')
  }
  if (skin.width <= 0) {
    throw new Error('Invalid skin: width must be positive')
  }
  if (skin.height <= 0) {
    throw new Error('Invalid skin: height must be positive')
  }
  if (skin.components) {
    for (const [key, comp] of Object.entries(skin.components)) {
      if (comp && typeof comp === 'object') {
        if (comp.x < 0 || comp.y < 0) {
          throw new Error(`Invalid component ${key}: coordinates must be non-negative`)
        }
        if (comp.width <= 0 || comp.height <= 0) {
          throw new Error(`Invalid component ${key}: width and height must be positive`)
        }
      }
    }
  }
}

export function useSkinEngine() {
  const currentSkin = ref<SkinConfig>({ ...DEFAULT_SKIN })

  async function loadSkin(skin: SkinConfig | null | undefined): Promise<void> {
    if (!skin) {
      throw new Error('Invalid skin config')
    }
    validateSkin(skin)
    currentSkin.value = { ...skin }
  }

  function getComponentPosition(name: string): ComponentPosition | null {
    return currentSkin.value.components?.[name] ?? null
  }

  function getComponentNames(): string[] {
    return Object.keys(currentSkin.value.components || {})
  }

  return {
    currentSkin: readonly(currentSkin),
    loadSkin,
    getComponentPosition,
    getComponentNames,
  }
}

export { DEFAULT_SKIN }
