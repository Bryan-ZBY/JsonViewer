<template>
  <div class="controls">
    <!-- 其他按钮和输入框 -->
    <button class="search-wrapper" @click="emit('toggle-dark-mode')">主题</button>
    <textarea v-model="jsonInput" ref="jsonInputRef" placeholder="输入完 Json 数据后, 点击下面的加载按钮" class="json-input" @focus="logFocus"></textarea>
    <button @click="emitRenderJson">加载</button>
    <button @click="emit('collapse-all')">收起</button>
    <div class="search-wrapper">
      <input v-model="searchInput" ref="searchInputRef" type="text" placeholder="/: Search JSON..." @keydown.enter="handleEnter" @keydown.up="handleArrowUp" @keydown.down="handleArrowDown" @focus="logFocus" />
    </div>

    <!-- 快捷键帮助按钮 -->
    <button class="help-button" @click="showHelpModal = true">快捷键帮助</button>

    <!-- 快捷键帮助弹窗 -->
    <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>快捷键列表</h2>
          <button class="close-button" @click="showHelpModal = false">&times;</button>
        </div>
        <ul class="shortcut-list">
          <li>
            <span class="shortcut-key">Ctrl + S</span>
            <span class="shortcut-description">保存</span>
          </li>
          <li>
            <span class="shortcut-key">Ctrl + C</span>
            <span class="shortcut-description">复制</span>
          </li>
          <li>
            <span class="shortcut-key">Ctrl + V</span>
            <span class="shortcut-description">粘贴</span>
          </li>
          <li>
            <span class="shortcut-key">Ctrl + Z</span>
            <span class="shortcut-description">撤销</span>
          </li>
          <li>
            <span class="shortcut-key">Ctrl + Y</span>
            <span class="shortcut-description">重做</span>
          </li>
          <li>
            <span class="shortcut-key">/</span>
            <span class="shortcut-description">聚焦搜索框</span>
          </li>
          <li>
            <span class="shortcut-key">Esc</span>
            <span class="shortcut-description">取消聚焦</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 定义事件发射器
const emit = defineEmits<{
  (e: 'render-json', data: any): void;
  (e: 'search', searchText: string): void;
  (e: 'collapse-all'): void;
  (e: 'toggle-dark-mode'): void;
}>();

// 数据绑定
const jsonInput = ref('');
const searchInput = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const jsonInputRef = ref<any | null>(null);
const searchHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const showHelpModal = ref(false); // 控制快捷键帮助弹窗的显示

// 方法
const emitRenderJson = () => {
  const cleanedInput = jsonInput.value.trim();
  try {
    const parsedJson = JSON.parse(cleanedInput);
    emit('render-json', parsedJson);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    alert(`Invalid JSON! Error: ${error.message}`);
  }
};

const emitSearch = () => {
  const trimmedInput = searchInput.value.trim();
  if (trimmedInput) {
    if (!searchHistory.value.includes(trimmedInput)) {
      searchHistory.value.push(trimmedInput);
    }
    historyIndex.value = -1;
    emit('search', trimmedInput);
  }
};

const logFocus = (event: FocusEvent) => {
  console.log('Input focused:', event.target);
};

const handleEnter = () => {
  emitSearch();
  if (searchInputRef.value) {
    searchInputRef.value.blur();
  }
};

const handleArrowUp = () => {
  if (searchHistory.value.length > 0) {
    if (historyIndex.value < searchHistory.value.length - 1) {
      historyIndex.value++;
      searchInput.value = searchHistory.value[searchHistory.value.length - 1 - historyIndex.value];
    }
  }
};

const handleArrowDown = () => {
  if (searchHistory.value.length > 0) {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      searchInput.value = searchHistory.value[searchHistory.value.length - 1 - historyIndex.value];
    } else if (historyIndex.value === 0) {
      historyIndex.value = -1;
      searchInput.value = '';
    }
  }
};
</script>

<style scoped>
.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.controls input,
.controls textarea,
.controls button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.3s, border-color 0.3s;
  pointer-events: auto;
  z-index: 10;
}

.controls input:focus,
.controls textarea:focus,
.controls button:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.controls button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.controls button:hover {
  background-color: #0056b3;
}

.controls textarea {
  width: 100%;
  height: 100px;
  font-family: monospace;
}

.search-wrapper {
  margin-left: auto;
}

/* 快捷键帮助弹窗样式 */
.help-button {
  background-color: #28a745;
}

.help-button:hover {
  background-color: #218838;
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
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #333;
}

.shortcut-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shortcut-list li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shortcut-list li:last-child {
  border-bottom: none;
}

.shortcut-key {
  font-weight: bold;
  color: #007bff;
}

.shortcut-description {
  color: #666;
}
</style>
