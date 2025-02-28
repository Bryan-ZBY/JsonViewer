<template>
  <div class="autocomplete">
    <input
      type="text"
      v-model="inputText"
      @input="handleInput"
      @keydown="handleKeydown"
      placeholder="已知当前 JSON 为 item, 请用 item.func... 执行过滤函数"
      class="input-box"
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

<script>
import { ref, computed } from 'vue';

export default {
  name: 'Autocomplete',
  setup() {
    const inputText = ref('');
    const currentFocus = ref(-1);
    const showSuggestions = ref(false);

    // 示例数据
    const data = [
      "item",
      // 数组方法
      "concat", "copyWithin", "entries", "every", "fill", "filter",
      "find", "findIndex", "flat", "flatMap", "forEach", "includes",
      "indexOf", "join", "keys", "lastIndexOf", "map", "pop", "push",
      "reduce", "reduceRight", "reverse", "shift", "slice", "some",
      "sort", "splice", "toLocaleString", "toString", "unshift", "values",

      // 对象方法
      "Object.assign", "Object.create", "Object.defineProperties", "Object.defineProperty", "Object.entries",
      "Object.freeze", "Object.fromEntries", "Object.getOwnPropertyDescriptor", "Object.getOwnPropertyDescriptors", "Object.getOwnPropertyNames",
      "Object.getOwnPropertySymbols", "Object.getPrototypeOf", "Object.is", "Object.isExtensible", "Object.isFrozen",
      "Object.isSealed", "Object.keys", "Object.preventExtensions", "Object.seal", "Object.setPrototypeOf", "Object.values",

      // 其他常用方法
      "JSON.parse", "JSON.stringify",

      "function", "const", "var"
    ];

    // 过滤后的建议项
    const filteredData = computed(() => {
      const lastDotIndex = inputText.value.lastIndexOf('.');
      if (lastDotIndex === -1) {
        return data.filter((item) =>
          item.toLowerCase().startsWith(inputText.value.toLowerCase())
        );
      }

      // 获取 . 后面的内容，忽略 ) 或 } 等符号
      let searchText = inputText.value.slice(lastDotIndex + 1);
      searchText = searchText.replace(/[)}\]]/g, ''); // 忽略 ) } ] 等符号
      return data.filter((item) =>
        item.toLowerCase().startsWith(searchText.toLowerCase())
      );
    });

    // 输入事件处理
    const handleInput = () => {
      showSuggestions.value = inputText.value.length > 0;
      currentFocus.value = -1;
    };

    // 键盘事件处理
    const handleKeydown = (event) => {
      if (event.key === 'Tab' && filteredData.value.length > 0) {
        event.preventDefault();
        applySuggestion(filteredData.value[0]);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        currentFocus.value = (currentFocus.value + 1) % filteredData.value.length;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        currentFocus.value =
          (currentFocus.value - 1 + filteredData.value.length) %
          filteredData.value.length;
      } else if (event.key === 'Enter' && currentFocus.value > -1) {
        event.preventDefault();
        applySuggestion(filteredData.value[currentFocus.value]);
      } else if (event.key === '.') {
        showSuggestions.value = true;
      }
    };

    // 应用补全建议
    const applySuggestion = (suggestion) => {
      const lastDotIndex = inputText.value.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        // 获取 . 后面的内容（包括 ) 或 } 等符号）
        const afterDot = inputText.value.slice(lastDotIndex + 1);
        // 替换需要补全的部分，保留原有的字符
        const newText =
          inputText.value.slice(0, lastDotIndex + 1) + // 保留 . 之前的内容
          suggestion + // 补全建议
          afterDot.replace(/^[^)}\]]*/, ''); // 保留 ) 或 } 等符号
        inputText.value = newText;
      } else {
        inputText.value = suggestion;
      }
      showSuggestions.value = false;
    };

    // 选择建议项
    const selectItem = (item) => {
      applySuggestion(item);
    };

    return {
      inputText,
      currentFocus,
      showSuggestions,
      filteredData,
      handleInput,
      handleKeydown,
      selectItem,
    };
  },
};
</script>

<style scoped>
/* 容器样式 */
.autocomplete {
  position: relative;
  width: 300px;
  margin: 50px auto;
}

/* 输入框样式 */
.input-box {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
}

.input-box:focus {
  border-color: #3b82f6; /* 蓝色 */
}

/* 建议列表样式 */
.suggestions-list {
  position: absolute;
  width: 100%;
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
  background-color: #f3f4f6; /* 浅灰色 */
}

.suggestions-list li.active {
  background-color: #3b82f6; /* 蓝色 */
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
