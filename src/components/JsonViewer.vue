<template>
  <div class="json-container" ref="container">
    <ul>
      <li v-for="(item, index) in visibleItems" :key="item.key" class="eleli"
          @click="toggleCollapse($event, item.key)"
          @mouseenter="showCopyButton($event, item.key)"
          @mouseleave="hideCopyButton($event, item.key)">
        <span class="json-key">{{ item.key }}: </span>
        <template v-if="item.isObjectOrArray">
          <span class="collapsible" :class="{ collapsed: item.isCollapsed }">
            {{ Array.isArray(item.value) ? '[' : '{' }}
          </span>
          <span class="summary" v-show="!item.isCollapsed">{{ item.summary }}</span>
          <button class="copy-button" v-show="item.showCopy"
                  @click.stop="copyToClipboard(item.value, item.key)">Copy</button>
          <div v-show="item.isCollapsed" class="nested-container">
            <JsonViewer :json-data="item.value" ref="childViewer" />
          </div>
        </template>
        <template v-else>
          <span :class="item.valueClass" class="json-value-text" v-html="item.highlightedValue || JSON.stringify(item.value)"></span>
          <button class="copy-button" v-show="item.showCopy"
                  @click.stop="copyToClipboard(item.value, item.key)">Copy</button>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineExpose, nextTick, watch } from 'vue';
import { JsonData } from '../types/json';
import { generateSummary } from '../utils/jsonUtils';

const props = defineProps<{
  jsonData: JsonData;
}>();

const container = ref<HTMLElement | null>(null);
const childViewer = ref<InstanceType<typeof JsonViewer>[]>([]);
const visibleItems = ref<any[]>([]);

let state: Record<string, { collapsed: boolean; showCopy: boolean }> = {};
let flatData: any[] = [];
let scrollTop = 0;
const ITEM_HEIGHT = 21;
const BUFFER_SIZE = 10;
let currentSearchText = '';

// 初始化state
const ensureState = (key: string) => {
  if (!state[key]) {
    state[key] = { collapsed: false, showCopy: false };
  }
};

// 扁平化数据
const flattenData = (data: JsonData, parentKey = '') => {
  const result = [];
  for (const key in data) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    const value = data[key];
    const isObjectOrArray = typeof value === 'object' && value !== null;

    ensureState(fullKey);

    const item = {
      key: fullKey,
      value,
      isObjectOrArray,
      isCollapsed: state[fullKey].collapsed,
      showCopy: state[fullKey].showCopy,
      summary: isObjectOrArray ? generateSummary(value) : '',
      valueClass: isObjectOrArray ? '' : getValueClass(value),
      highlightedValue: ''
    };

    if (!isObjectOrArray && currentSearchText) {
      const valueStr = JSON.stringify(value);
      item.highlightedValue = applyHighlight(valueStr, currentSearchText);
    }

    result.push(item);

    if (isObjectOrArray && state[fullKey].collapsed) {
      result.push(...flattenData(value, fullKey));
    }
  }
  return result;
};

// 更新可见项
const updateVisibleItems = () => {
  if (!container.value) return;
  visibleItems.value = flatData.filter(e => !e.key.includes('.'));
};

// 初始化数据
const initData = () => {
  flatData = flattenData(props.jsonData);
  updateVisibleItems();
};

// 监听 props.jsonData 的变化
watch(() => props.jsonData, (newData) => {
  state = {}; // 重置状态，避免旧数据干扰
  initData(); // 重新初始化数据
}, { deep: true }); // 使用 deep 选项监听对象内部变化

onMounted(() => {
  initData();
});

// 工具函数
const getValueClass = (value: any): string => {
  switch (typeof value) {
    case 'string': return 'json-string';
    case 'number': return 'json-number';
    case 'boolean': return 'json-boolean';
    default: return value === null ? 'json-null' : 'json-value';
  }
};

const toggleCollapse = (event: Event, key: string) => {
  event.stopPropagation();
  if ((event.target as HTMLElement).classList.contains('copy-button')) return;
  ensureState(key);
  state[key].collapsed = !state[key].collapsed;
  flatData = flattenData(props.jsonData);
  updateVisibleItems();
};

const showCopyButton = (event: Event, key: string) => {
  event.stopPropagation();
  ensureState(key);
  state[key].showCopy = true;
  updateVisibleItems();
};

const hideCopyButton = (event: Event, key: string) => {
  event.stopPropagation();
  ensureState(key);
  state[key].showCopy = false;
  updateVisibleItems();
};

const copyToClipboard = (value: any, key: string) => {
  const text = JSON.stringify(value, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    const button = document.querySelector(`li .copy-button`) as HTMLButtonElement;
    if (button) {
      button.textContent = 'Copied!';
      setTimeout(() => (button.textContent = 'Copy'), 1500);
    }
  });
};

// 高亮辅助函数
const applyHighlight = (text: string, searchText: string) => {
  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

// 优化后的搜索函数
const performSearch = (searchText: string) => {
  if (!searchText || !props.jsonData) {
    currentSearchText = '';
    flatData = flattenData(props.jsonData);
    updateVisibleItems();
    return;
  }

  currentSearchText = searchText;
  const searchLower = searchText.toLowerCase();
  const matchedPaths: Set<string> = new Set();

  const searchInData = (data: JsonData, path: string[] = []) => {
    for (const key in data) {
      const currentPath = [...path, key];
      const fullKey = currentPath.join('.');
      const value = data[key];
      const keyLower = key.toLowerCase();
      const valueStr = JSON.stringify(value).toLowerCase();

      if (keyLower.includes(searchLower) || valueStr.includes(searchLower)) {
        currentPath.forEach((_, i) => {
          matchedPaths.add(currentPath.slice(0, i + 1).join('.'));
        });
      }

      if (typeof value === 'object' && value !== null) {
        searchInData(value, currentPath);
      }
    }
  };

  const expandPaths = () => {
    matchedPaths.forEach(key => {
      ensureState(key);
      state[key].collapsed = true;
    });
    flatData = flattenData(props.jsonData);
    updateVisibleItems();
  };

  searchInData(props.jsonData);
  expandPaths();

  nextTick(() => {
    childViewer.value.forEach(child => child.performSearch(searchText));
  });
};

const collapseAll = () => {
  Object.keys(state).forEach(key => {
    state[key].collapsed = false;
  });
  flatData = flattenData(props.jsonData);
  updateVisibleItems();
  childViewer.value.forEach(child => child.collapseAll());
};

defineExpose({ performSearch, collapseAll });
</script>

<style scoped>
/* 样式保持不变 */
.json-container {
  font-family: monospace;
  white-space: pre;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
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

.json-value-text {
  display: inline;
}

.collapsible {
  cursor: pointer;
}

.collapsible::before {
  content: '▶';
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
  margin: 0;
  padding: 0;
}

.nested-container {
  margin-left: 20px;
  padding: 0;
}

.summary {
  color: #666;
  margin-left: 5px;
}

.dark-mode .summary {
  color: #aaa;
}

.highlight {
  background-color: #ffff00;
  color: #000000;
}

.dark-mode .highlight {
  background-color: #ffeb3b;
  color: #000000;
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
