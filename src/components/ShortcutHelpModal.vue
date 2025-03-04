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
  { key: 'iI | aA', description: '进入插入模式' },
  { key: 'Esc | jk', description: '退出插入模式' },
  { key: 'yy', description: '复制整行(文档内)' },
  { key: 'p', description: '粘贴(仅作了文档内)' },
  { key: 'dd', description: '删除整行' },
  { key: 'A-k', description: '上移整行' },
  { key: 'A-j', description: '下移整行' },
  { key: 't', description: '向上滚动' },
  { key: 'f', description: '向下滚动' },
  { key: 'zc', description: '收起到父节点（折叠当前代码块）' },
  { key: 'zo', description: '展开子节点（展开当前代码块）' },
  { key: 'zz', description: '当前行居中' },
  { key: 'gg', description: '到顶部' },
  { key: 'G', description: '到底部' },
  { key: '/', description: '启动正向搜索' },
  { key: 'n', description: '下一个匹配项（搜索结果）' },
  { key: 'N', description: '上一个匹配项（搜索结果）' },
  { key: '%', description: '跳转到匹配的括号/符号' },
  { key: 'u', description: '撤销' },
  { key: 'Ctrl-r', description: '恢复' },
  { key: 'V', description: '选一行' },
  { key: '*', description: '搜索光标下的单词（正向）' },
  { key: '#', description: '搜索光标下的单词（反向）' },
  { key: ':s/old/new', description: '替换当前行的 old 为 new' },
  { key: ':%s/old/new/g', description: '全局替换 old 为 new' },
]);
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
  font-size: 14px;
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
