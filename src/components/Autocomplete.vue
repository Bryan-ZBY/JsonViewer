<template>
  <div class="autocomplete">
    <input
      type="text"
      v-model="inputText"
      @input="handleInput"
      @keydown="handleKeydown"
      placeholder="已知当前 JSON 为 item, 请用 item.func... 执行过滤函数"
      class="input-box"
      ref="inputRef"
    />
    <ul v-if="showSuggestions" class="suggestions-list">
      <li
        v-for="(item, index) in filteredData"
        :key="index"
        @click="selectItem(item)"
        :class="{ active: index === currentFocus }"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineEmits } from 'vue';
import { useDataStore } from '../store/GlobalData';
import { defaultJson, getUniqueKeys, getArrayMethods } from '../utils/JsonUtils';

const emit = defineEmits<{
  (e: 'filter-json', searchText: string): void;
}>();

// 状态定义
const inputText = ref('');
const currentFocus = ref(-1);
const showSuggestions = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const globalDataStore = useDataStore();
const cleanedInput = (globalDataStore.jsonValue || JSON.stringify(defaultJson)).trim();
const jsonData = JSON.parse(cleanedInput);
const allKeys = ref(getUniqueKeys(jsonData));

// 计算过滤后的建议项
const filteredData = computed(() => {
  if (!inputText.value) return [];

  const parts = inputText.value.split('.');
  const lastPart = parts.pop() || ''; // 当前正在输入的部分
  const prefix = parts.length ? `${parts.join('.')}.` : 'item.'; // 当前路径前缀

  // 检查是否可能是数组路径
  const arrayMethods = getArrayMethods(jsonData, parts.join('.')) || [];

  // 普通键补全
  const keySuggestions = allKeys.value
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length).split('.')[0])
    .filter((key) => key.toLowerCase().startsWith(lastPart.toLowerCase()))
    .filter((v, i, self) => self.indexOf(v) === i);

  // 如果是数组路径，且 lastPart 为空或匹配数组方法，则添加数组方法
  if (arrayMethods.length > 0) {
    const methodSuggestions = arrayMethods.filter((method) =>
      method.toLowerCase().startsWith(lastPart.toLowerCase())
    );
    return [...methodSuggestions, ...keySuggestions].filter(
      (v, i, self) => self.indexOf(v) === i
    ); // 合并并去重
  }

  return keySuggestions;
});

// 输入事件处理
const handleInput = () => {
  showSuggestions.value = inputText.value.length > 0;
  currentFocus.value = -1;
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    emit('filter-json', inputText.value);
    return;
  }

  if (event.key === 'Tab' && filteredData.value.length > 0) {
    event.preventDefault();
    applySuggestion(filteredData.value[0]);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    currentFocus.value = (currentFocus.value + 1) % filteredData.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    currentFocus.value =
      (currentFocus.value - 1 + filteredData.value.length) % filteredData.value.length;
  } else if (event.key === '.') {
    showSuggestions.value = true;
  }
};

// 应用补全建议并设置光标位置
const applySuggestion = (suggestion: string) => {
  const parts = inputText.value.split('.');
  parts.pop(); // 移除当前输入的最后一个部分
  const prefix = parts.length ? `${parts.join('.')}.` : 'item.';
  inputText.value = prefix + suggestion;

  // 设置光标位置到补全内容末尾
  requestAnimationFrame(() => {
    inputRef.value?.focus();
    inputRef.value?.setSelectionRange(inputText.value.length, inputText.value.length);
  });

  showSuggestions.value = false;
};

// 选择建议项
const selectItem = (item: string) => {
  applySuggestion(item);
};
</script>

<style scoped>
/* 容器样式 */
.autocomplete {
  position: relative;
  width: 300px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 输入框样式 */
.input-box {
  width: 80%;
  padding: 10px;
  background: black;
  color: cornsilk;
  font-size: 14px;
  border: 2px solid #8191e1;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
}

.input-box:focus {
  border-color: #3b82f6;
}

/* 建议列表样式 */
.suggestions-list {
  position: absolute;
  top: 100%; /* 确保列表从输入框底部开始 */
  left: 10%; /* 与输入框对齐 */
  width: 80%; /* 与输入框宽度一致 */
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  padding: 8px 0;
  list-style: none;
  background: #1a1a1a; /* 深色背景 */
  border: 1px solid #3b82f6;
  border-radius: 8px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px);
  animation: slideIn 0.2s ease-out forwards;
}

/* 动画效果 */
@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 建议项样式 */
.suggestions-list li {
  padding: 8px 16px;
  color: #e5e7eb; /* 浅灰色文字 */
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #2d3748;
}

.suggestions-list li:last-child {
  border-bottom: none;
}

.suggestions-list li:hover {
  background-color: #2d3748; /* 悬停时深灰色背景 */
  color: #fff;
}

.suggestions-list li.active {
  background-color: #3b82f6;
  color: #fff;
  font-weight: 500;
}

/* 自定义滚动条样式 */
.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #2d3748;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #8191e1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #3b82f6;
}
</style>
