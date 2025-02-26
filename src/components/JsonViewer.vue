<template>
  <div class="json-container" ref="container" tabindex="0" @keydown="handleKeyDown">
    <ul>
      <li v-for="(item, index) in visibleItems" :key="item.key" class="eleli"
        @click="selectItem(index, $event, item)"
        @mouseenter="showCopyButton($event, item)"
        @mouseleave="hideCopyButton($event, item)">
        <template v-if="item.isObjectOrArray">
          <div :class="{ 'selected': selectedKey === item.uuid }" >
            <span class="json-key">{{ item.key }}: </span>
            <span class="collapsible" :class="{ collapsed: item.isCollapsed }">
              {{ Array.isArray(item.value) ? '[' : '{' }}
            </span>
            <span class="summary" v-show="!item.isCollapsed">{{ item.summary }}</span>
            <button class="copy-button" v-show="item.showCopy"
              @click.stop="copyToClipboard(item.value, item.key)">{{ copyData }}</button>

          </div>
          <div v-show="item.isCollapsed" class="nested-container">
            <JsonViewer :json-data="item.value" ref="childViewer" />
          </div>
        </template>
        <template v-else>
          <div :class="{ 'selected': selectedKey === item.uuid }" >
            <span class="json-key">{{ item.key }}: </span>
            <span :class="item.valueClass" class="json-value-text" v-html="item.highlightedValue || JSON.stringify(item.value)"></span>
            <button class="copy-button" v-show="item.showCopy"
              @click.stop="copyToClipboard(item.value, item.key)">{{ copyData }}</button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineExpose, nextTick, watch } from 'vue';
import { JsonData } from '../types/JsonData';
import { FlattenedItem } from '../types/FlattenedItem';
import { generateUUID } from '../utils/UUIDUtils';
import { generateSummary } from '../utils/JsonUtils';

const props = defineProps<{
  jsonData: JsonData;
}>();

const container = ref<HTMLElement | null>(null);
const childViewer = ref<InstanceType<typeof JsonViewer>[]>([]);
const visibleItems = ref<any[]>([]);
const copyData = ref<string>("Copy");
const selectedIndex = ref<number>(-1); // 跟踪当前选中项的索引
const selectedKey = ref<string>(""); // 跟踪当前选中项的索引

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

// 扁平化数据（仅顶层）
const flattenData = (data: JsonData, parentKey = ''): FlattenedItem[] => {
  const result: FlattenedItem[] = [];
  for (const key in data) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    const value = data[key];
    const isObjectOrArray = typeof value === 'object' && value !== null;

    ensureState(fullKey);
    const uuid = generateUUID();

    const item: FlattenedItem = {
      key: fullKey,
      value,
      uuid,
      isObjectOrArray,
      isCollapsed: state[fullKey].collapsed,
      showCopy: state[fullKey].showCopy,
      summary: isObjectOrArray ? generateSummary(value) : '',
      valueClass: isObjectOrArray ? '' : getValueClass(value),
      highlightedValue: '',
    };

    if (!isObjectOrArray && currentSearchText) {
      const valueStr = JSON.stringify(value);
      item.highlightedValue = applyHighlight(valueStr, currentSearchText);
    }

    result.push(item);

    // 子节点由嵌套的 JsonViewer 处理，不在顶层展开
  }
  return result;
};

// 更新可见项（仅顶层）
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
}, { deep: true });

// 点击选择项并触发展开/收缩
const selectItem = (index: number, event: Event, item: any) => {
  selectedIndex.value = index;
  toggleCollapse(event, item);
};

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  event.preventDefault(); // 阻止默认行为（如页面滚动）

  switch (event.key) {
    case 'j': // 向下移动
      if (selectedIndex.value < visibleItems.value.length - 1) {
        selectedIndex.value++;
        selectedKey.value = visibleItems.value[selectedIndex.value].uuid;

        scrollToSelected();
      }
      break;
    case 'k': // 向上移动
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
        selectedKey.value = visibleItems.value[selectedIndex.value].uuid;
        scrollToSelected();
      }
      break;
    case 'h': // 收缩到父节点
      collapseToParent();
      break;
    case 'l': // 展开并进入子节点
      expandToChild();
      break;
    case 'y':
      const item = visibleItems.value[selectedIndex.value];
      item.showCopy = true;
      copyToClipboard(item.value, item.key);
      break;
  }
};

// 滚动到选中的项
const scrollToSelected = () => {
  const containerEl = container.value;
  if (!containerEl) return;
  const selectedEl = containerEl.querySelectorAll('.eleli')[selectedIndex.value];
  if (selectedEl) {
    selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// 收缩到父节点
const collapseToParent = () => {
  const currentItem = visibleItems.value[selectedIndex.value];
  if (!currentItem) return;

  if (state[currentItem.key].collapsed) {
    state[currentItem.key].collapsed = false; // 展开当前节点
    flatData = flattenData(props.jsonData);
    updateVisibleItems();
    scrollToSelected();
  }

  // const keyParts = currentItem.key.split('.');
  // if (keyParts.length > 1) {
  //   const parentKey = keyParts.slice(0, -1).join('.');
  //   const parentIndex = visibleItems.value.findIndex(item => item.key === parentKey);
  //   if (parentIndex !== -1) {
  //     state[parentKey].collapsed = false; // 收缩父节点
  //     flatData = flattenData(props.jsonData);
  //     updateVisibleItems();
  //     selectedIndex.value = parentIndex;
  //     selectedKey.value = visibleItems.value[selectedIndex.value].uuid;
  //     scrollToSelected();
  //   }
  // }
};

// 展开并进入子节点（仅切换展开状态）
const expandToChild = () => {
  const currentItem = visibleItems.value[selectedIndex.value];
  if (!currentItem || !currentItem.isObjectOrArray) return;

  state[currentItem.key].collapsed = !state[currentItem.key].collapsed; // 展开当前节点
  flatData = flattenData(props.jsonData);
  updateVisibleItems();
  scrollToSelected();
};

// 工具函数
const getValueClass = (value: any): string => {
  switch (typeof value) {
    case 'string': return 'json-string';
    case 'number': return 'json-number';
    case 'boolean': return 'json-boolean';
    default: return value === null ? 'json-null' : 'json-value';
  }
};

// 点击展开/收缩
const toggleCollapse = (event: Event, item: any) => {
  event.stopPropagation();
  const key = item.key;
  ensureState(key);
  item.showCopy = true;
  state[key].collapsed = !state[key].collapsed;
  flatData = flattenData(props.jsonData);
  updateVisibleItems();
};

// 移入显示复制按钮
const showCopyButton = (event: Event, item: any) => {
  event.stopPropagation();
  const key = item.key;
  state[key].showCopy = true;
  item.showCopy = true;
  copyData.value = "Copy";
  ensureState(key);
  updateVisibleItems();
};

// 移出隐藏复制按钮
const hideCopyButton = (event: Event, item: any) => {
  event.stopPropagation();
  const key = item.key;
  state[key].showCopy = false;
  item.showCopy = false;
  copyData.value = "Copy";
  ensureState(key);
  updateVisibleItems();
};

// 复制功能
const copyToClipboard = (value: any, key: string) => {
  const text = JSON.stringify(value, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    copyData.value = 'Copy succeeded!';
    setTimeout(() => (copyData.value = 'Copy'), 1500);
  });
};

// 高亮辅助函数
const applyHighlight = (text: string, searchText: string) => {
  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

// 搜索函数
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

onMounted(() => {
  initData();
  container.value?.focus(); // 确保容器可聚焦以接收键盘事件
});

defineExpose({ performSearch, collapseAll });
</script>

<style scoped>
.json-container {
  font-family: monospace;
  white-space: pre;
  overflow-y: auto;
  outline: none; /* 移除默认聚焦边框 */
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
  max-width: calc(100% - 10px);
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 20px;
  margin: 0;
  padding: 0;
}

.nested-container {
  margin-left: 20px;
  padding: 0;
}

.summary {
  color: #666;
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

.selected {
  background-color: #e0e0e0; /* 浅灰色高亮 */
}

.dark-mode .selected {
  background-color: #444; /* 深色模式下的高亮 */
}
</style>
