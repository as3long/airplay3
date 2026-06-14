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
  background: #2a2a3a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
  min-width: 160px;
  z-index: 10001;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.menu-item {
  padding: 8px 14px;
  font-size: 13px;
  color: #ccc;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.1s;
}

.menu-item:hover {
  background: rgba(232, 106, 46, 0.15);
  color: #fff;
}
</style>
