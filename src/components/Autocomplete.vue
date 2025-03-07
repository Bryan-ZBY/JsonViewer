<template>
  <div class="autocomplete">
    <input
      type="text"
      v-model="inputText"
      @input="handleInput"
      @keydown="handleKeydown"
      :placeholder="placeholder"
      :class="inputClass"
      ref="inputRef"
    />
    <ul v-if="showSuggestions" v-show="filteredData.length" class="suggestions-list">
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
import { ref, computed, onMounted, defineEmits, watch } from 'vue';
import { useDataStore } from '../store/GlobalData';
import { defaultJson, getUniqueKeys, getArrayMethods, extractKeys } from '../utils/JsonUtils';

const emit = defineEmits<{
  (e: 'filter-json', searchText: string): void;
}>();

  Object.defineProperty(Object.prototype, 'Keys', {
    configurable: true,
    writable: true,
    value: function Keys() { return Object.keys(this); }
  })
  Object.defineProperty(Object.prototype, 'Values', {
    configurable: true,
    writable: true,
    value: function Values() { return Object.values(this); }
  })

  Object.defineProperty(Object.prototype, 'ToSet', {
    configurable: true,
    writable: true,
    value: function ToSet() { return [...new Set(this)]; }
  })

  Object.defineProperty(Object.prototype, 'ToJson', {
    configurable: true,
    writable: true,
    value: function ToSet() { return JSON.stringify(this); }
  })


  Object.defineProperty(Array.prototype, 'ToVector2', {
    configurable: true,
    writable: true,
    value: function Keys() {
      return (function factorial(param) {
        let data = JSON.parse(JSON.stringify(param).toUpperCase());
        if (Array.isArray(data)) {
          for (let index = 0; index < data.length; index++) {
            data[index] = factorial(data[index])
          }
        } else if (data.Z != undefined) {
          data = { X: data.X, Y: data.Z }
        }
        return data;
      })(this)
    }
  })


// 状态定义
const inputText = ref('');
const currentFocus = ref(-1);
const showSuggestions = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const inputClass = ref<string>('input-box');
const placeholder = ref<string>('已知当前 JSON 为 item, 请用 item.func... 执行过滤函数');

const globalDataStore = useDataStore();
const allKeys = ref<string[]>([]);
const allRealKeys = ref<string[]>([]);

// 提取括号之前的数据
function getPartBeforeBracket(str: string): string {
  const bracketIndex = str.search(/[)}]/);
  return bracketIndex === -1 ? str : str.slice(0, bracketIndex);
}

// 计算过滤后的建议项
const filteredData = computed(() => {
  if (!inputText.value) return [];
  if (!inputText.value.includes('.')) {
    return [
      'item'
    ];
  }

  const parts = inputText.value.split('.');
  const lastPart = parts.pop() || ''; // 当前正在输入的部分
  const prefix = parts.length ? `${parts.join('.')}.` : 'item.'; // 当前路径前缀

  // 检查是否可能是数组路径
  const arrayMethods = getArrayMethods(JSON.parse(globalDataStore.jsonValue || JSON.stringify(defaultJson)), parts.join('.')) || [];

  // 普通键补全
  let keySuggestions = allKeys.value.filter((key) => key.startsWith(prefix));
  keySuggestions = [...new Set(keySuggestions)];

  keySuggestions = keySuggestions.map((key) => key.slice(prefix.length).split('.')[0]);
  keySuggestions = [...new Set(keySuggestions)];

  // 第三步：筛选以 lastPart 开头的键，并去重
  keySuggestions = keySuggestions.filter((key) => key.toLowerCase().startsWith(lastPart.toLowerCase()));
  keySuggestions = [...new Set(keySuggestions)];

  keySuggestions = keySuggestions.filter((v, i, self) => self.indexOf(v) === i);

  // let keySuggestions = allKeys.value.filter((key) => key.startsWith(prefix));
  // keySuggestions = keySuggestions.map((key) => key.slice(prefix.length).split('.')[0]);
  // keySuggestions = keySuggestions.filter((key) => key.toLowerCase().startsWith(lastPart.toLowerCase()));
  // keySuggestions = keySuggestions.filter((v, i, self) => self.indexOf(v) === i);

  // 如果是数组路径，且 lastPart 为空或匹配数组方法，则添加数组方法
  if (arrayMethods.length > 0) {
    const methodSuggestions = arrayMethods.filter((method) =>
      method.toLowerCase().startsWith(lastPart.toLowerCase())
    );
    return [...methodSuggestions].filter(
      (v, i, self) => self.indexOf(v) === i
    ); // 合并并去重
  }

  if (keySuggestions.length) {
    return keySuggestions;
  }

  return allRealKeys.value
    .filter((key: string) => {
      const processedLastPart = getPartBeforeBracket(lastPart).toLowerCase();
      return key.toLowerCase().startsWith(processedLastPart);
    });
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
    if (currentFocus.value >= 0) {
      applySuggestion(filteredData.value[currentFocus.value]);
      showSuggestions.value = false;
      currentFocus.value = -1;
      return;
    }
    showSuggestions.value = false;
    emit('filter-json', inputText.value);
  } else if (event.key === 'Tab'){
    event.preventDefault();
    if(filteredData.value.length > 0) {
      if (currentFocus.value >= 0) {
        applySuggestion(filteredData.value[currentFocus.value]);
        currentFocus.value = -1;
        return;
      }
      applySuggestion(filteredData.value[0]);
    }
  } else if (event.key === 'ArrowDown' || (event.key === 'j' && event.ctrlKey) || (event.key === 'n' && event.ctrlKey)) {
    event.preventDefault();
    currentFocus.value = (currentFocus.value + 1) % filteredData.value.length;
  } else if (event.key === 'ArrowUp' || (event.key === 'k' && event.ctrlKey)) {
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
  let last = parts.pop(); // 移除当前输入的最后一个部分
  const prefix = parts.length ? `${parts.join('.')}.` : '';
  inputText.value = prefix + suggestion;

  function extractPartAfterBracket(str: string): string {
    const match = str.match(/[)}].*/);
    return match? match[0] : '';
  }

  const length = inputText.value.length;

  // 设置光标位置到补全内容末尾
  requestAnimationFrame(() => {
    inputRef.value?.focus();
    inputRef.value?.setSelectionRange(length, length);
  });

  inputText.value += extractPartAfterBracket(last || '');
  showSuggestions.value = false;
};

// 选择建议项
const selectItem = (item: string) => {
  applySuggestion(item);
};

// 监听 globalDataStore.jsonValue 的变化
watch(() => globalDataStore.jsonValue, (newValue: string) => {
  let cleanedInput = newValue.trim();
  try{
    const jsonData = cleanedInput ? JSON.parse(cleanedInput) : defaultJson;
    allKeys.value = getUniqueKeys(jsonData);
    allRealKeys.value = extractKeys(jsonData);
    inputClass.value = 'input-box';
    placeholder.value = '已知当前 JSON 为 item, 请用 item.func... 执行过滤函数';
  }catch(e:any){
    inputClass.value = 'uneditable-input';
    placeholder.value = e.message;
  }
}, { immediate: true });
</script>

<style scoped>
/* 容器样式 */
.autocomplete {
  position: relative;
  width: 100%;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

 /* 现代浏览器 */
::placeholder {
  color: #d5f7ff;
  opacity: 0.8; /* Firefox 默认会降低透明度，这里设置为 1 */
}

/* 输入框样式 */
.uneditable-input {
  width: 40%;
  padding: 10px;
  background: #1a2632;
  color: #89aaf8;
  font-size: 12px;
  border-radius: 8px;
  outline: none;
  transition: width 0.5s ease-in-out, background 1.5s ease, opacity 1s ease;
  pointer-events: none;
  opacity: 0.8;
}

/* 输入框样式 */
.input-box {
  width: 80%;
  padding: 10px;
  background: black;
  color: aliceblue;
  font-size: 12px;
  border: 2px solid #41528e;
  border-radius: 8px;
  outline: none;
  transition: width 0.5s ease-in-out, background 1.5s ease, opacity 1s ease;
}

.input-box:focus {
  border-color: #3b82f6;
}

/* 建议列表样式 */
.suggestions-list {
  position: absolute;
  top: 100%; /* 确保列表从输入框底部开始 */
  left: 10%; /* 与输入框对齐 */
  width: 20%;
  min-width: 200px;
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
  /* 修改动画时间为 0.3s */
  animation: slideIn 0.3s ease-out forwards;
}

/* 动画效果 - 渐入 */
@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 建议项样式 */
.suggestions-list li {
  padding: 8px 16px;
  color: #e5e7eb;
  cursor: pointer;
  line-height: 12px;
  font-size: 12px;
  transition: all 0.2s ease;
  border-bottom: 1px solid #303846;
}

.suggestions-list li:last-child {
  border-bottom: none;
}

.suggestions-list li:hover {
  background-color: #2d3748; /* 悬停时深灰色背景 */
  color: #fff;
}

.suggestions-list li.active {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
  transform: translateY(-3px);
  box-shadow: rgb(0, 0, 0) 2px 2px 5px inset;
  background: rgb(30, 38, 62);
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
