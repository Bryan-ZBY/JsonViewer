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
      // const defaultJson = { /* 保持原有 defaultJson 内容不变 */ };
      var defaultJson ={
  "json_viewer": {
    "description": "一个基于网页的JSON查看器，允许用户输入、渲染并与JSON数据进行交互。",
    "features": [
      {
        "name": "渲染JSON",
        "description": "以可折叠的树形结构渲染JSON数据，并对不同数据类型进行语法高亮显示。"
      },
      {
        "name": "搜索",
        "description": "允许用户在JSON数据中搜索特定的键或值，突出显示匹配项并展开相关节点。"
      },
      {
        "name": "折叠/展开",
        "description": "用户可以折叠或展开JSON树中的所有节点，以便更轻松地导航。"
      },
      {
        "name": "深色模式",
        "description": "在亮色和深色主题之间切换，以在不同光照条件下获得更好的可读性。"
      },
      {
        "name": "复制到剪贴板",
        "description": "允许用户通过单击将JSON数据或特定值复制到剪贴板。"
      },
      {
        "name": "返回顶部",
        "description": "提供一个按钮，可快速滚动回页面顶部。"
      }
    ]
  },
  "data_types": {
    "description": "支持各种JSON数据类型，包括对象、数组、字符串、数字、布尔值和空值。",
    "examples": [
      {
        "type": "对象",
        "example": {
          "name": "John",
          "age": 30,
          "isStudent": false,
          "address": {
            "street": "123 Main St",
            "city": "Anytown",
            "state": "CA"
          }
        }
      },
      {
        "type": "数组",
        "example": [
          {
            "type": "home",
            "number": "123-456-7890"
          },
          {
            "type": "work",
            "number": "987-654-3210"
          }
        ]
      },
      {
        "type": "字符串",
        "example": "这是一个字符串"
      },
      {
        "type": "数字",
        "example": 42
      },
      {
        "type": "布尔值",
        "example": true
      },
      {
        "type": "空值",
        "example": null
      }
    ]
  },
  "extensibility": {
    "description": "JSON查看器可以通过添加其他功能来增强其功能性。",
    "potential_features": [
      {
        "name": "JSON验证",
        "description": "添加实时JSON验证，以确保在渲染之前输入的是有效的JSON。"
      },
      {
        "name": "导出到文件",
        "description": "允许用户将渲染后的JSON数据导出到文件（例如，JSON、CSV）。"
      },
      {
        "name": "自定义主题",
        "description": "提供更多主题选项或允许用户自定义配色方案。"
      },
      {
        "name": "拖放",
        "description": "允许用户将JSON文件直接拖放到查看器中进行渲染。"
      },
      {
        "name": "历史记录",
        "description": "保留以前查看的JSON数据的历史记录，以便快速访问。"
      },
      {
        "name": "API集成",
        "description": "与API集成，直接从外部源获取并显示JSON数据。"
      },
      {
        "name": "高级搜索",
        "description": "实现高级搜索选项，如正则表达式搜索或按数据类型过滤。"
      },
      {
        "name": "撤销/重做",
        "description": "为对JSON数据所做的更改添加撤销/重做功能。"
      }
    ]
  }
} ;
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

        if (document.body.classList.contains('dark-mode')) {
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.add('dark-mode');
    }  
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