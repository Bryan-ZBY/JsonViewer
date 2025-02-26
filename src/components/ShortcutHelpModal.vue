<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>帮助</h2>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  visible: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

// 定义快捷键数据
const shortcuts = ref([
  { key: '?', description: '帮助' },
  { key: '/', description: '聚焦搜索框' },
  { key: 'Esc', description: '取消搜索框和输入框聚焦' },
  { key: 'y', description: '复制' },
  { key: 'j', description: '高亮行下移' },
  { key: 'k', description: '高亮行上移' },
  { key: 'h', description: '收起到父节点' },
  { key: 'l', description: '展开子节点' },
  { key: 'd', description: '屏幕下移半页' },
  { key: 'u', description: '屏幕上移半页' },
  { key: 'g', description: '到顶部' },
  { key: 'G', description: '到底部' },
])
</script>

<style scoped>
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
  max-width: 500px;
  width: 90%;
  font-family: Arial, sans-serif;
  font-size: 14px;
  position: relative;
  z-index: 1001;
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
}

.shortcut-list li {
  padding: 10px 0;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
