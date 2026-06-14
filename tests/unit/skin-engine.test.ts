import { describe, it, expect } from 'vitest'
import { useSkinEngine } from '@/composables/useSkinEngine'
import type { SkinConfig } from '@/types/skin'

const validSkin: SkinConfig = {
  name: 'default',
  width: 800,
  height: 600,
  components: {
    titleBar: { x: 0, y: 0, width: 800, height: 40 },
    playerControls: { x: 100, y: 500, width: 200, height: 50 },
  },
}

describe('useSkinEngine', () => {
  it('should create an instance', () => {
    const engine = useSkinEngine()
    expect(engine).toBeDefined()
  })

  it('should load a valid skin config', async () => {
    const engine = useSkinEngine()
    await engine.loadSkin(validSkin)
    expect(engine.currentSkin.value).toEqual(validSkin)
  })

  it('should reject skin with missing name', async () => {
    const invalidSkin = { width: 800, height: 600, components: {} }
    const engine = useSkinEngine()
    await expect(engine.loadSkin(invalidSkin as unknown as SkinConfig)).rejects.toThrow('Invalid skin: missing name')
  })

  it('should reject skin with missing width', async () => {
    const invalidSkin = { name: 'test', height: 600, components: {} }
    const engine = useSkinEngine()
    await expect(engine.loadSkin(invalidSkin as unknown as SkinConfig)).rejects.toThrow('Invalid skin: missing width')
  })

  it('should reject skin with missing height', async () => {
    const invalidSkin = { name: 'test', width: 800, components: {} }
    const engine = useSkinEngine()
    await expect(engine.loadSkin(invalidSkin as unknown as SkinConfig)).rejects.toThrow('Invalid skin: missing height')
  })

  it('should reject skin with negative width', async () => {
    const invalidSkin = { name: 'test', width: -100, height: 600, components: {} }
    const engine = useSkinEngine()
    await expect(engine.loadSkin(invalidSkin as unknown as SkinConfig)).rejects.toThrow('Invalid skin: width must be positive')
  })

  it('should reject skin with negative height', async () => {
    const invalidSkin = { name: 'test', width: 800, height: -100, components: {} }
    const engine = useSkinEngine()
    await expect(engine.loadSkin(invalidSkin as unknown as SkinConfig)).rejects.toThrow('Invalid skin: height must be positive')
  })

  it('should reject skin with invalid component coordinates', async () => {
    const invalidSkin: SkinConfig = {
      name: 'test',
      width: 800,
      height: 600,
      components: {
        titleBar: { x: -1, y: 0, width: 800, height: 40 },
      },
    }
    const engine = useSkinEngine()
    await expect(engine.loadSkin(invalidSkin)).rejects.toThrow('Invalid component')
  })

  it('should reject skin with zero component width', async () => {
    const invalidSkin: SkinConfig = {
      name: 'test',
      width: 800,
      height: 600,
      components: {
        titleBar: { x: 0, y: 0, width: 0, height: 40 },
      },
    }
    const engine = useSkinEngine()
    await expect(engine.loadSkin(invalidSkin)).rejects.toThrow('Invalid component')
  })

  it('should reject corrupted JSON (null)', async () => {
    const engine = useSkinEngine()
    await expect(engine.loadSkin(null as unknown as SkinConfig)).rejects.toThrow('Invalid skin config')
  })

  it('should reject corrupted JSON (undefined)', async () => {
    const engine = useSkinEngine()
    await expect(engine.loadSkin(undefined as unknown as SkinConfig)).rejects.toThrow('Invalid skin config')
  })

  it('should fallback to default skin after catching loadSkin error', async () => {
    const engine = useSkinEngine()
    try {
      await engine.loadSkin(null as unknown as SkinConfig)
    } catch {
      // expected rejection
    }
    expect(engine.currentSkin.value.name).toBe('default')
  })

  it('should get component position', async () => {
    const engine = useSkinEngine()
    await engine.loadSkin(validSkin)
    const pos = engine.getComponentPosition('titleBar')
    expect(pos).toEqual({ x: 0, y: 0, width: 800, height: 40 })
  })

  it('should return null for non-existent component', async () => {
    const engine = useSkinEngine()
    await engine.loadSkin(validSkin)
    const pos = engine.getComponentPosition('nonExistent')
    expect(pos).toBeNull()
  })

  it('should support hot skin switching', async () => {
    const skin1: SkinConfig = { name: 'skin1', width: 800, height: 600, components: {} }
    const skin2: SkinConfig = { name: 'skin2', width: 1024, height: 768, components: {} }
    const engine = useSkinEngine()
    await engine.loadSkin(skin1)
    expect(engine.currentSkin.value.name).toBe('skin1')
    await engine.loadSkin(skin2)
    expect(engine.currentSkin.value.name).toBe('skin2')
  })

  it('should get default skin when none loaded', () => {
    const engine = useSkinEngine()
    expect(engine.currentSkin.value.name).toBe('default')
  })

  it('should list all component names', async () => {
    const engine = useSkinEngine()
    await engine.loadSkin(validSkin)
    const components = engine.getComponentNames()
    expect(components).toContain('titleBar')
    expect(components).toContain('playerControls')
  })
})
