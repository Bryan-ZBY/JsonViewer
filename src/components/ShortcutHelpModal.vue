<template>
  <transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>列举部分常用快捷键</h2>
          <span class="close-button" @click="$emit('close')">×</span>
        </div>
        <ul class="shortcut-list">
          <li v-for="(shortcut, index) in shortcuts" :key="index">
            <span class="shortcut-key">{{ shortcut.key }}</span>
            <span class="shortcut-description">{{ shortcut.description }}</span>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { shortcuts } from '../utils/JsonUtils';

defineProps<{
  visible: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

</script>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(1.5);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #202124;
  color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 1000px;
  width: 90%;
  font-family: Arial, sans-serif;
  font-size: 12px;
  position: relative;
  z-index: 1001;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #ffffff;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #cccccc;
}

.shortcut-list {
  list-style: none;
  padding: 0;
  margin: 0;
  column-count: 2;
  column-gap: 200px;
}

.shortcut-list li {
  padding: 10px 0;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  break-inside: avoid;
}

.shortcut-list li:last-child {
  border-bottom: none;
}

.shortcut-key {
  font-weight: bold;
  background: #111;
  padding: 2px 10px;
  border-radius: 3px;
  font-family: monospace;
}

.shortcut-description {
  color: #ffffff;
}
</style>
