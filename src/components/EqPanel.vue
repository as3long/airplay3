<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  eqBands: readonly number[]
  eqEnabled: boolean
}>()

const emit = defineEmits<{
  bandChange: [index: number, gain: number]
  toggle: [enabled: boolean]
  reset: []
  preset: [name: string]
}>()

const showPresets = ref(false)

const presets = [
  { label: 'Flat', value: 'flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { label: 'Rock', value: 'rock', gains: [5, 4, 3, 1, -1, 1, 3, 4, 5, 5] },
  { label: 'Pop', value: 'pop', gains: [-1, 2, 4, 5, 4, 1, -1, -1, 2, 3] },
  { label: 'Jazz', value: 'jazz', gains: [3, 2, 1, 2, -1, -1, 0, 1, 3, 4] },
  { label: 'Classical', value: 'classical', gains: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4] },
  { label: 'Bass Boost', value: 'bass', gains: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0] },
  { label: 'Treble Boost', value: 'treble', gains: [0, 0, 0, 0, 0, 1, 3, 5, 7, 9] },
  { label: 'Vocal', value: 'vocal', gains: [-2, -1, 0, 3, 5, 5, 3, 1, 0, -1] },
]

const bandLabels = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K']

function onSliderInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  emit('bandChange', index, Number(target.value))
}

function toggleEnabled() {
  emit('toggle', !props.eqEnabled)
}

function resetBands() {
  emit('reset')
}

function selectPreset(p: typeof presets[0]) {
  showPresets.value = false
  p.gains.forEach((g, i) => emit('bandChange', i, g))
}
</script>

<template>
  <div class="eq-panel panel">
    <div class="eq-header">
      <span class="eq-title">Equalizer</span>
      <button class="eq-toggle" :class="{ active: eqEnabled }" @click="toggleEnabled">
        {{ eqEnabled ? 'ON' : 'OFF' }}
      </button>
    </div>

    <div class="eq-bands">
      <div class="eq-band-item" v-for="(label, index) in bandLabels" :key="label">
        <span class="band-value">{{ eqBands[index] > 0 ? '+' : '' }}{{ eqBands[index] }}</span>
        <div class="band-slider-wrap">
          <input
            type="range"
            class="eq-slider"
            orient="vertical"
            min="-12"
            max="12"
            step="1"
            :value="eqBands[index]"
            @input="onSliderInput(index, $event)"
          />
        </div>
        <span class="band-label">{{ label }}</span>
        <span class="band-unit">Hz</span>
      </div>
    </div>

    <div class="eq-scale-bar">
      <span>+12dB</span>
      <span>0dB</span>
      <span>-12dB</span>
    </div>

    <div class="eq-buttons">
      <button class="eq-btn" @click="resetBands">Reset</button>
      <div class="preset-wrap">
        <button class="eq-btn" @click="showPresets = !showPresets">Presets ▾</button>
        <div v-if="showPresets" class="preset-dropdown">
          <button
            v-for="p in presets"
            :key="p.value"
            @click="selectPreset(p)"
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eq-panel {
  margin: 0 12px 12px;
  padding: 12px;
  position: relative;
  overflow: visible;
}

.eq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.eq-title {
  font-size: 12px;
  font-weight: 600;
  color: #888;
}

.eq-toggle {
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #666;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.eq-toggle.active {
  background: rgba(232, 106, 46, 0.15);
  border-color: rgba(232, 106, 46, 0.3);
  color: #e86a2e;
}

.eq-bands {
  display: flex;
  justify-content: space-between;
  gap: 0;
  padding: 0 8px;
}

.eq-band-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 36px;
}

.band-value {
  font-size: 9px;
  color: #e86a2e;
  font-variant-numeric: tabular-nums;
  min-height: 14px;
}

.band-slider-wrap {
  display: flex;
  justify-content: center;
}

.eq-slider {
  -webkit-appearance: slider-vertical;
  appearance: slider-vertical;
  width: 4px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
}

.eq-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #e86a2e;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 4px rgba(232, 106, 46, 0.4);
}

.eq-slider::-webkit-slider-thumb:hover {
  background: #ff7a3d;
}

.band-label {
  font-size: 9px;
  color: #888;
  font-weight: 500;
}

.band-unit {
  font-size: 7px;
  color: #555;
  margin-top: -2px;
}

.eq-scale-bar {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px 0;
  font-size: 8px;
  color: #555;
}

.eq-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: center;
}

.eq-btn {
  height: 24px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #888;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.eq-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.preset-wrap {
  position: relative;
  height: 24px;
  display: flex;
  align-items: center;
}

.preset-dropdown {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 4px;
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 4px;
  min-width: 110px;
  z-index: 1000;
}

.preset-dropdown button {
  display: block;
  width: 100%;
  padding: 5px 10px;
  background: none;
  border: none;
  color: #aaa;
  font-size: 10px;
  text-align: left;
  cursor: pointer;
  border-radius: 3px;
}

.preset-dropdown button:hover {
  background: rgba(232, 106, 46, 0.15);
  color: #e86a2e;
}
</style>
