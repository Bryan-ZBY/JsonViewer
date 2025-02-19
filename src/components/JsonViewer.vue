<template>
    <div :class="['container', { 'dark-mode': isDarkMode }]">
      <div class="controls">
        <textarea
          v-model="jsonInput"
          class="json-input"
          placeholder="Enter your JSON here..."
        ></textarea>
        <button @click="renderJson">Render JSON</button>
        <input
          v-model="searchText"
          type="text"
          placeholder="Search JSON..."
          @keyup.enter="performSearch"
        />
        <button @click="performSearch">Search</button>
        <button @click="collapseAll">Collapse All</button>
        <button @click="toggleDarkMode">Toggle Dark Mode</button>
      </div>
  
      <div class="json-container">
        <json-node
          :node="parsedData"
          :depth="0"
          :search-text="searchText"
          :collapsed-nodes="collapsedNodes"
          @toggle-collapse="toggleCollapse"
        />
      </div>
  
      <button class="fixed-button" @click="scrollToTop">Back to Top</button>
    </div>
  </template>
  
  <script>
  import { ref, reactive, computed } from 'vue';
  import JsonNode from './JsonNode.vue';
  
  export default {
    components: { JsonNode },
    setup() {
      // 默认 JSON 数据
      const defaultJson = { /* 保持原有 defaultJson 内容不变 */ };
      // 响应式数据
      const jsonInput = ref(JSON.stringify(defaultJson, null, 2));
      const searchText = ref('');
      const isDarkMode = ref(false);
      const collapsedNodes = reactive(new Set());
      const parsedData = ref(defaultJson);
  
      
  
      // 方法
      const renderJson = () => {
        try {
          parsedData.value = JSON.parse(jsonInput.value);
          collapsedNodes.clear();
        } catch (error) {
          alert('Invalid JSON!');
        }
      };
  
      const performSearch = () => {
        // 搜索逻辑需要在 JsonNode 组件中处理
      };
  
      const collapseAll = () => {
        collapsedNodes.clear();
        const collapseAllNodes = (node, path = '') => {
          if (typeof node === 'object' && node !== null) {
            collapsedNodes.add(path);
            Object.entries(node).forEach(([key, value]) => {
              collapseAllNodes(value, `${path}.${key}`);
            });
          }
        };
        collapseAllNodes(parsedData.value);
      };
  
      const toggleCollapse = (path) => {
        if (collapsedNodes.has(path)) {
          collapsedNodes.delete(path);
        } else {
          collapsedNodes.add(path);
        }
      };
  
      const toggleDarkMode = () => {
        isDarkMode.value = !isDarkMode.value;
      };
  
      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
  
      return {
        jsonInput,
        searchText,
        isDarkMode,
        parsedData,
        collapsedNodes,
        renderJson,
        performSearch,
        collapseAll,
        toggleCollapse,
        toggleDarkMode,
        scrollToTop
      };
    }
  };
  </script>
  
  <style scoped>
  /* 保持原有所有 CSS 样式不变 */
  /* 注意需要移除 :hover 等伪类中的 scoped 限制 */
  /* 可以添加 /deep/ 或 ::v-deep 来处理子组件样式 */




    /* 伪光标 */
    .cursor {
      position: fixed;
      top: -5px;
      left: -1px;
      background-color: yellow;
      color: black;
      padding: 2px 4px;
      border-radius: 3px;
      display: inline-block;
      transition: transform 0.15s ease-out;
      pointer-events: none; /* 避免光标干扰鼠标事件 */
    }
    .json-container {
      font-family: monospace;
      white-space: pre;
      margin-top: 20px;
    }

    .json-key {
      color: blue;
    }

    .dark-mode .json-key {
      color: #bb86fc;
    }

    .json-value {
      color: green;
    }

    .dark-mode .json-value {
      color: #03dac6;
    }

    .json-string {
      color: brown;
    }

    .dark-mode .json-string {
      color: #ffb74d;
    }

    .json-number {
      color: purple;
    }

    .dark-mode .json-number {
      color: #ff79c6;
    }

    .json-boolean {
      color: teal;
    }

    .dark-mode .json-boolean {
      color: #8be9fd;
    }

    .json-null {
      color: gray;
    }

    .dark-mode .json-null {
      color: #6272a4;
    }

    .collapsible {
      cursor: pointer;
    }

    .collapsible::before {
      content: "▶";
      display: inline-block;
      margin-right: 6px;
      transition: transform 0.2s;
    }

    .collapsible.collapsed::before {
      transform: rotate(90deg);
    }

    .eleli {
      cursor: pointer;
      user-select: none;
      max-width: calc(100% - 50px);
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 21px;
    }

    .summary {
      color: #666;
      margin-left: 5px;
    }

    .dark-mode .summary {
      color: #aaa;
    }

    .highlight {
      background-color: yellow;
      color: black;
    }

    .dark-mode .highlight {
      background-color: #ffeb3b;
      color: #000000;
    }

    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .controls input,
    .controls textarea,
    .controls button {
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      transition: background-color 0.3s, border-color 0.3s;
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

    .fixed-button {
      position: fixed;
      right: 20px;
      bottom: 20px;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .fixed-button:hover {
      background-color: #0056b3;
    }
    .copy-button {
      margin-left: 10px;
      padding: 2px 6px;
      background-color: #6285ab;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.3s;
    }

    .copy-button:hover {
      background-color: #0056b3;
    }
  </style>