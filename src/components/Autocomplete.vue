<!-- AutoComplete.vue -->
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
import { ref, computed, onMounted, onUnmounted, defineProps, defineExpose, nextTick, watch } from 'vue';
const emit = defineEmits<{
  (e: 'filter-json', searchText: string): void;
}>();



// 状态定义
const inputText = ref('')
const currentFocus = ref(-1)
const showSuggestions = ref(false)
const inputRef = ref(null) // 添加对 input 的引用

// 示例数据
const data = ref([
  "item",
  "concat", "copyWithin", "entries", "every", "fill", "filter",
  "find", "findIndex", "flat", "flatMap", "forEach", "includes",
  "indexOf", "join", "keys", "lastIndexOf", "map", "pop", "push",
  "reduce", "reduceRight", "reverse", "shift", "slice", "some",
  "sort", "splice", "toLocaleString", "toString", "unshift", "values",
  "Object.assign", "Object.create", "Object.defineProperties", "Object.defineProperty", "Object.entries",
  "Object.freeze", "Object.fromEntries", "Object.getOwnPropertyDescriptor", "Object.getOwnPropertyDescriptors", "Object.getOwnPropertyNames",
  "Object.getOwnPropertySymbols", "Object.getPrototypeOf", "Object.is", "Object.isExtensible", "Object.isFrozen",
  "Object.isSealed", "Object.keys", "Object.preventExtensions", "Object.seal", "Object.setPrototypeOf", "Object.values",
  "JSON.parse", "JSON.stringify",
  "function", "const", "var"
])

// 过滤后的建议项
const filteredData = computed(() => {
  const lastDotIndex = inputText.value.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return data.value.filter(item =>
      item.toLowerCase().startsWith(inputText.value.toLowerCase())
    )
  }

  let searchText = inputText.value.slice(lastDotIndex + 1)
  searchText = searchText.replace(/[)}\]]/g, '')
  return data.value.filter(item =>
    item.toLowerCase().startsWith(searchText.toLowerCase())
  )
})

// 输入事件处理
const handleInput = () => {
  showSuggestions.value = inputText.value.length > 0
  currentFocus.value = -1
}

// 键盘事件处理
const handleKeydown = (event) => {
if (event.key === 'Enter') {
    event.preventDefault()
    emit('filter-json', inputText);
    return;
  }

  if (event.key === 'Tab' && filteredData.value.length > 0) {
    event.preventDefault()
    applySuggestion(filteredData.value[0])
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    currentFocus.value = (currentFocus.value + 1) % filteredData.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    currentFocus.value =
      (currentFocus.value - 1 + filteredData.value.length) % filteredData.value.length
  }  else if (event.key === '.') {
    showSuggestions.value = true
  }
}

// 应用补全建议并设置光标位置
const applySuggestion = (suggestion) => {
  const lastDotIndex = inputText.value.lastIndexOf('.')
  let cursorPosition

  if (lastDotIndex !== -1) {
    const beforeDot = inputText.value.slice(0, lastDotIndex + 1)
    const afterDot = inputText.value.slice(lastDotIndex + 1)
    const remainingText = afterDot.replace(/^[^)}\]]*/, '') // 保留括号等符号
    inputText.value = beforeDot + suggestion + remainingText
    cursorPosition = (beforeDot + suggestion).length // 光标定位到补全内容后
  } else {
    inputText.value = suggestion
    cursorPosition = suggestion.length
  }

  // 设置光标位置
  requestAnimationFrame(() => {
    inputRef.value.focus()
    inputRef.value.setSelectionRange(cursorPosition, cursorPosition)
  })

  showSuggestions.value = false
}

// 选择建议项
const selectItem = (item) => {
  applySuggestion(item)
}
</script>

<style scoped>
/* 容器样式 */
.autocomplete {
  position: relative;
  width: 300px;
  margin: 50px auto;

  width: 100%;
  display: flex
    ;
  align-content: center;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
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
  top: 41px;
  width: 20%;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 5px;
  padding: 0;
  list-style: none;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 建议项样式 */
.suggestions-list li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestions-list li:hover {
  background-color: #f3f4f6;
}

.suggestions-list li.active {
  background-color: #3b82f6;
  color: #fff;
}

/* 自定义滚动条样式 */
.suggestions-list::-webkit-scrollbar {
  width: 8px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
