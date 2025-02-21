<template>
  <div class="json-container">
    <ul v-if="jsonData">
      <li v-for="(value, key) in jsonData" :key="key" class="eleli" 
          @click="toggleCollapse($event, key)"
          @mouseenter="showCopyButton($event, key)" 
          @mouseleave="hideCopyButton($event, key)">
        <span class="json-key">{{ key }}: </span>
        <template v-if="isObjectOrArray(value)">
          <span class="collapsible" :class="{ collapsed: collapsed[key] }">
            {{ Array.isArray(value) ? '[' : '{' }}
          </span>
          <span class="summary" v-show="!collapsed[key]">{{ generateSummary(value) }}</span>
          <button class="copy-button" v-show="showCopy[key]" 
                  @click.stop="copyToClipboard(value, key)">Copy</button>
          <div v-show="collapsed[key]" class="nested-container">
            <JsonViewer :json-data="value" ref="childViewer" />
          </div>
        </template>
        <template v-else>
          <span :class="getValueClass(value)" class="json-value-text">
            {{ JSON.stringify(value) }}
          </span>
          <button class="copy-button" v-show="showCopy[key]" 
                  @click.stop="copyToClipboard(value, key)">Copy</button>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, defineExpose, nextTick } from 'vue';
import { JsonData } from '../types/json';
import { generateSummary } from '../utils/jsonUtils';

const props = defineProps<{
  jsonData: JsonData;
}>();

const collapsed = ref<Record<string, boolean>>({});
const showCopy = ref<Record<string, boolean>>({});
const childViewer = ref<InstanceType<typeof JsonViewer>[]>([]);

// 初始化折叠状态
onMounted(() => {
  if (props.jsonData) {
    Object.keys(props.jsonData).forEach(key => {
      collapsed.value[key] = false;
    });
  }
});

const isObjectOrArray = (value: any): boolean => {
  return typeof value === 'object' && value !== null;
};

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
  collapsed.value[key] = !collapsed.value[key];
};

const showCopyButton = (event: Event, key: string) => {
  event.stopPropagation();
  showCopy.value[key] = true;
};

const hideCopyButton = (event: Event, key: string) => {
  event.stopPropagation();
  showCopy.value[key] = false;
};

const copyToClipboard = (value: any, key: string) => {
  const text = JSON.stringify(value, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    const button = document.querySelector(`li:nth-child(${Object.keys(props.jsonData).indexOf(key) + 1}) .copy-button`) as HTMLButtonElement;
    button.textContent = 'Copied!';
    setTimeout(() => button.textContent = 'Copy', 1500);
  });
};

const collapseAll = () => {
  if (props.jsonData) {
    Object.keys(props.jsonData).forEach(key => {
      collapsed.value[key] = false;
    });
    childViewer.value.forEach(child => child.collapseAll());
  }
};

// 优化后的搜索函数
const performSearch = async (searchText: string) => {
  if (!searchText || !props.jsonData) return;

  const searchLower = searchText.toLowerCase();
  const matchedPaths: string[][] = [];

  // 高效搜索并收集匹配路径
  const searchInData = (data: JsonData, path: string[] = []) => {
    for (const key in data) {
      const currentPath = [...path, key];
      const value = data[key];
      const keyLower = key.toLowerCase();
      const valueStr = JSON.stringify(value).toLowerCase();

      if (keyLower.includes(searchLower) || valueStr.includes(searchLower)) {
        matchedPaths.push(currentPath);
      }

      if (isObjectOrArray(value)) {
        searchInData(value, currentPath);
      }
    }
  };

  // 立即展开所有匹配路径
  const expandPaths = () => {
    matchedPaths.forEach(path => {
      let currentLevel = collapsed.value;
      path.forEach(key => {
        currentLevel[key] = true;
      });
    });
  };

  // 高亮匹配内容
  const highlightMatches = (element: Element, text: string) => {
    const regex = new RegExp(`(${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      { acceptNode: node => node.parentElement?.className.includes('copy-button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT }
    );

    const nodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      nodes.push(node as Text);
    }

    nodes.forEach(textNode => {
      const text = textNode.textContent || '';
      if (text.toLowerCase().includes(searchLower)) {
        const fragment = document.createDocumentFragment();
        const span = document.createElement('span');
        span.innerHTML = text.replace(regex, '<span class="highlight">$1</span>');
        fragment.appendChild(span);
        textNode.parentNode?.replaceChild(fragment, textNode);
      }
    });
  };

  // 执行搜索
  searchInData(props.jsonData);
  expandPaths();
  
  await nextTick();
  clearHighlights();
  const container = document.querySelector('.json-container');
  if (container) {
    highlightMatches(container, searchText);
    childViewer.value.forEach(child => child.performSearch(searchText));
  }
};

// 清空高亮
const clearHighlights = () => {
  document.querySelectorAll('.highlight').forEach(highlight => {
    const parent = highlight.parentNode;
    parent?.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
  });
};

defineExpose({ performSearch, collapseAll });
</script>

<style scoped>
.json-container {
  font-family: monospace;
  white-space: pre;
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
  display: inline; /* 确保文本直接显示，无额外间距 */
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
  line-height: 21px; /* 保持与原始一致 */
  margin: 0; /* 移除默认外边距 */
  padding: 0; /* 移除默认内边距 */
}

.nested-container {
  margin-left: 20px; /* 嵌套内容的缩进，与原始一致 */
  padding: 0; /* 移除多余内边距 */
}

.summary {
  color: #666;
  margin-left: 5px;
}

.dark-mode .summary {
  color: #aaa;
}

.highlight {
  background-color: #ffff00; /* 黄色背景，与原始一致 */
  color: #000000; /* 黑色文字，与原始一致 */
}

.dark-mode .highlight {
  background-color: #ffeb3b; /* 深色模式下的高亮 */
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

ul {
  list-style: none; /* 移除列表默认样式 */
  padding: 0; /* 移除默认内边距 */
  margin: 0; /* 移除默认外边距 */
}
</style>
