<template>
  <div class="controls">
    <textarea v-model="jsonInput" placeholder="Enter your JSON here..." class="json-input" @focus="logFocus"></textarea>
    <button @click="emitRenderJson">Render JSON</button>
    <button @click="emit('collapse-all')">Collapse All</button>
    <button @click="emit('toggle-dark-mode')">Toggle Dark Mode</button>
    <div class="search-wrapper">
      <input v-model="searchInput" ref="searchInputRef" type="text" placeholder="Search JSON..." @keydown.enter="handleEnter" @keydown.up="handleArrowUp" @keydown.down="handleArrowDown" @focus="logFocus" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

// 定义事件发射器并赋值给 emit
const emit = defineEmits<{
  (e: 'render-json', data: any): void;
  (e: 'search', searchText: string): void;
  (e: 'collapse-all'): void;
  (e: 'toggle-dark-mode'): void;
}>();

const jsonInput = ref('');
const searchInput = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchHistory = ref<string[]>([]);
const historyIndex = ref(-1);

const emitRenderJson = () => {
  const cleanedInput = jsonInput.value.trim();
  console.log('Cleaned input:', JSON.stringify(cleanedInput));
  try {
    const parsedJson = JSON.parse(cleanedInput);
    console.log('Parsed JSON:', parsedJson);
    emit('render-json', parsedJson); // 使用定义好的 emit
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

watch(jsonInput, (newValue) => {
  console.log('jsonInput updated:', newValue);
});

watch(searchInput, (newValue) => {
  console.log('searchInput updated:', newValue);
});

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === '/') {
    event.preventDefault(); // 防止默认行为，如在浏览器中触发查找功能
    if (searchInputRef.value) {
      searchInputRef.value.focus();
      searchInputRef.value.select(); // 全选搜索框内容
    }
  }
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

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center; /* 垂直居中对齐 */
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
  margin-left: auto; /* 将搜索框及其包装元素推到最右边 */
}
</style>
