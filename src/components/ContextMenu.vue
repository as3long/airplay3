<script setup lang="ts">
defineEmits<{
  about: []
}>()

defineProps<{
  visible: boolean
  x: number
  y: number
}>()
</script>

<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <div class="menu-item" @click="$emit('about')">About AirPlay3</div>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  min-width: 160px;
  z-index: 10001;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.menu-item {
  padding: 8px 14px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.1s;
}

.menu-item:hover {
  background: var(--accent-bg);
  color: var(--text-primary);
}
</style>
