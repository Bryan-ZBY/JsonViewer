<template>
  <div class="controls-wrapper">
    <div class="controls">
      <button class="search-wrapper" @click="showHelpModal = true">帮助</button>
      <button @click="emit('toggle-dark-mode')">主题</button>
      <textarea v-model="jsonInput" ref="jsonInputRef" :placeholder="textareaPlaceholder" class="json-input" @focus="logFocus"></textarea>
      <button @click="emitRenderJson">加载</button>
      <button @click="clearJsonInput">清空</button>
      <button @click="doFetch">请求数据</button>
      <button @click="emit('collapse-all')">收起</button>
      <div class="search-wrapper">
        <input v-model="searchInput" ref="searchInputRef" type="text" placeholder="/: Search JSON..." @keydown.enter="handleEnter" @keydown.up="handleArrowUp" @keydown.down="handleArrowDown" @focus="logFocus" />
      </div>
    </div>

<JsonEditor />
<!-- <JsonInput2 /> -->
    <!-- 使用新的快捷键帮助组件 -->
    <ShortcutHelpModal :visible="showHelpModal" @close="showHelpModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ShortcutHelpModal from './ShortcutHelpModal.vue';
import { scrollTo, scrollOver } from '../utils/ScrollUtils.ts';
import JsonEditor from './JsonEditor.vue';

const emit = defineEmits<{
  (e: 'render-json', data: any): void;
  (e: 'search', searchText: string): void;
  (e: 'collapse-all'): void;
  (e: 'toggle-dark-mode'): void;
}>();

const jsonInput = ref('');
const searchInput = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const jsonInputRef = ref<HTMLTextAreaElement | null>(null);
const searchHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const showHelpModal = ref(false);

const textareaPlaceholder = ref(`JSON: 输入完 Json 数据后, 点击下面的加载按钮
Fetch: // 示例代码 fetch('https://jsonplaceholder.typicode.com/posts');
`);

const emitRenderJson = () => {
  const cleanedInput = jsonInput.value.trim();
  try {
    const parsedJson = JSON.parse(cleanedInput);
    console.log(parsedJson);
    emit('render-json', parsedJson);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    alert(`Invalid JSON! Error: ${error.message}`);
  }
};

const clearJsonInput = () => {
  jsonInput.value = '';
};

const doFetch = async () => {
  if(!jsonInput.value){
    jsonInput.value = `fetch('https://jsonplaceholder.typicode.com/posts');`;
  }

  let code = jsonInput.value.trim();
  console.log(code)

  if (code.endsWith(';')) { code = code.slice(0, -1); }
  code = 'return ' + code + `.then(response => response.json());`;

  try {
    const func = new Function(code);
    const result = await func();
    if (result instanceof Promise) {
      const finalResult = await result;
      emit('render-json', finalResult);
    } else {
      emit('render-json', result);
    }
  } catch (error: any) {
    jsonInput.value = `执行出错: ${error.message}`;
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

const isTextareaFocused = () => {
  return document.activeElement === jsonInputRef.value;
};

const isInputFocused = () => {
  return document.activeElement === searchInputRef.value;
};

const isInput = () => {
  return isTextareaFocused() || isInputFocused()
}

// 配置快捷键
const handleKeyDown = (event: KeyboardEvent) => {
  // 清除所有输入框选中态
  if (event.key === 'Escape') {
    event.preventDefault(); // 防止默认行为，如在浏览器中触发查找功能
    if (searchInputRef.value) {
      searchInputRef.value.blur();
    }

    if (jsonInputRef.value) {
      jsonInputRef.value.blur();
    }

    showHelpModal.value = false; // 打开帮助模态框
  }

  if(isInput()){
    // 如果输入框或搜索框处于选中状态, 则不进行操作
    return;
  }

  if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
    event.preventDefault(); // 防止默认行为
    showHelpModal.value = true; // 打开帮助模态框
  }

  if (event.key === '/' || event.key === 'f') {
    event.preventDefault(); // 防止默认行为，如在浏览器中触发查找功能
    if (searchInputRef.value) {
      searchInputRef.value.focus();
      searchInputRef.value.select(); // 全选搜索框内容
    }
  }

  // 到顶
  if(event.key == 'g'){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 到底
  if(event.key == 'G'){
    window.scrollTo({ 
      top: document.documentElement.scrollHeight, 
      behavior: 'smooth' 
    });
  }

  // 向下滚动
  if(event.key == 'd'){
    scrollTo(false);
  }

  // 向上滚动
  if(event.key == 'u'){
    scrollTo(true);
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
.controls-wrapper {
  position: relative;
  z-index: 1; /* 确保控件在默认情况下低于弹窗 */
}

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
</style>
