<template>
  <div class="json-container" ref="container" tabindex="0" @keydown="handleKeyDown">
    <ul>
      <li v-for="(item, index) in visibleItems" :key="item.key" class="eleli"
        @click="selectItem(index, $event, item)"
        @mouseenter="showCopyButton($event, item)">
        <div :class="{ 'selected': globalDataStore.selectedKey === item.fullKey }" >
          <span v-show="globalDataStore.selectedKey === item.fullKey">
            <button class="copy-button2"
              @click.stop="copyKeyToClipboard(item.value, item.key)">{{ copyKeyData }}</button>
            <button class="copy-button"
              @click.stop="copyToClipboard(item.value, item.key)">{{ copyData }}</button>
          </span>

          <span class="json-key" v-html="item.highlightedKeyValue"></span>
          <template v-if="item.isObjectOrArray">
            <span class="collapsible" :class="{ collapsed: item.isCollapsed }">
              {{ Array.isArray(item.value) ? '[' : '{' }}
            </span>
            <span class="summary" v-show="!item.isCollapsed" v-html="item.highlightedSummaryValue"></span>
          </template>
          <template v-else>
            <span :class="item.valueClass" class="json-value-text" v-html="item.highlightedValue || JSON.stringify(item.value)"></span>
          </template>
        </div>

          <div v-if="item.isObjectOrArray" v-show="item.isCollapsed" class="nested-container">
            <JsonViewer :json-data="item.value" :parent-key="item.fullKey" ref="childViewer" />
          </div>
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
import { useDataStore } from '../store/GlobalData';

const props = defineProps<{
  jsonData: JsonData;
  parentKey: '';
}>();

// 通过 useGlobalDataStore 函数获取 globalData 这个 store 的实例
const globalDataStore = useDataStore();

const container = ref<HTMLElement | null>(null);
const childViewer = ref<InstanceType<typeof JsonViewer>[]>([]);
const visibleItems = ref<any[]>([]);
const copyData = ref<string>("Copy");
const copyKeyData = ref<string>("Key");
const selectedIndex = ref<number>(-1);
const selectedKey = ref<string>("");
const childCopyActive = ref<boolean>(false); // New reactive property to track child copy button state

let state: Record<string, { collapsed: boolean; }> = {};
let flatData: any[] = [];
let scrollTop = 0;
const ITEM_HEIGHT = 21;
const BUFFER_SIZE = 10;
let currentSearchText = '';

const ensureState = (key: string) => {
  if (!state[key]) {
    state[key] = { collapsed: false };
  }
};

const flattenData = (data: JsonData): FlattenedItem[] => {
  const result: FlattenedItem[] = [];
  for (const key in data) {
    const fullKey:string = props.parentKey ? `${props.parentKey}.${key}` : key;
    const value = data[key];
    const isObjectOrArray = typeof value === 'object' && value !== null;
    const summary = isObjectOrArray ? generateSummary(value) : '';

    ensureState(key);
    const uuid = generateUUID();

    const item: FlattenedItem = {
      key,
      fullKey,
      value,
      uuid,
      isObjectOrArray,
      isCollapsed: state[key].collapsed,
      summary,
      valueClass: isObjectOrArray ? '' : getValueClass(value),
      highlightedValue: '',
      highlightedKeyValue: key + ": ",
      highlightedSummaryValue: summary,
    };

    if (!isObjectOrArray && currentSearchText) {
      const valueStr = JSON.stringify(value);
      item.highlightedValue = applyHighlight(valueStr, currentSearchText);

      const keyValueStr = key;
      item.highlightedKeyValue = applyHighlight(keyValueStr, currentSearchText) + ": ";
    }else if(currentSearchText){
      const summaryValueStr = summary.slice(0,200);
      item.highlightedSummaryValue = applyHighlight(summaryValueStr, currentSearchText);
    }

    result.push(item);
  }
  return result;
};

const updateVisibleItems = () => {
  if (!container.value) return;
  visibleItems.value = flatData.filter(e => !e.key.includes('.'));
};

const initData = () => {
  flatData = flattenData(props.jsonData);
  updateVisibleItems();
};

watch(() => props.jsonData, (newData) => {
  state = {};
  initData();
}, { deep: true });

const selectItem = (index: number, event: Event, item: any) => {
  selectedIndex.value = index;
  toggleCollapse(event, item);
};

// const handleKeyDown = (event: KeyboardEvent) => {
//   switch (event.key) {
//     case 'j':
//       event.preventDefault();
//       if (selectedIndex.value < visibleItems.value.length - 1) {
//         selectedIndex.value++;
//         selectedKey.value = visibleItems.value[selectedIndex.value].fullKey;
//         globalDataStore.updateSelectedKey(selectedKey.value);
//       }
//       break;
//     case 'k':
//       event.preventDefault();
//       if (selectedIndex.value > 0) {
//         selectedIndex.value--;
//         selectedKey.value = visibleItems.value[selectedIndex.value].fullKey;
//         globalDataStore.updateSelectedKey(selectedKey.value);
//       }
//       break;
//     case 'h':
//       event.preventDefault();
//       collapseToParent();
//       break;
//     case 'l':
//       event.preventDefault();
//       expandToChild();
//       break;
//     case 'y':
//       event.preventDefault();
//       const item = visibleItems.value[selectedIndex.value];
//       globalDataStore.updateCopyKey(item.fullKey);
//       copyToClipboard(item.value, item.key);
//       break;
//   }
// };

const collapseToParent = () => {
  const currentItem = visibleItems.value[selectedIndex.value];
  if (!currentItem) return;

  if (state[currentItem.key].collapsed) {
    state[currentItem.key].collapsed = false;
    flatData = flattenData(props.jsonData);
    updateVisibleItems();
  }
};

const expandToChild = () => {
  const currentItem = visibleItems.value[selectedIndex.value];
  if (!currentItem || !currentItem.isObjectOrArray) return;

  state[currentItem.key].collapsed = !state[currentItem.key].collapsed;
  flatData = flattenData(props.jsonData);
  updateVisibleItems();
};

const getValueClass = (value: any): string => {
  switch (typeof value) {
    case 'string': return 'json-string';
    case 'number': return 'json-number';
    case 'boolean': return 'json-boolean';
    default: return value === null ? 'json-null' : 'json-value';
  }
};

const toggleCollapse = (event: Event, item: any) => {
  event.stopPropagation();

  globalDataStore.updateSelectedKey(item.fullKey);
  const key = item.key;
  ensureState(key);

  globalDataStore.updateCopyKey(item.fullKey);
  state[key].collapsed = !state[key].collapsed;
  flatData = flattenData(props.jsonData);
  updateVisibleItems();
};

const showCopyButton = (event: Event, item: any) => {
  event.stopPropagation();
  const key = item.key;
  globalDataStore.updateCopyKey(item.fullKey);
  copyData.value = "Copy";
  ensureState(key);
  updateVisibleItems();
};

const copyKeyToClipboard = (value: any, key: string) => {
  const text = JSON.stringify(key);
  navigator.clipboard.writeText(text).then(() => {
    copyKeyData.value = 'OK!';
    setTimeout(() => (copyKeyData.value = 'Key'), 1500);
  });
};

const copyToClipboard = (value: any, key: string) => {
  const text = JSON.stringify(value, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    copyData.value = 'Copy succeeded!';
    setTimeout(() => (copyData.value = 'Copy'), 1500);
  });
};

const applyHighlight = (text: string, searchText: string) => {
  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

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
  container.value?.focus();
});

defineExpose({ performSearch, collapseAll });
</script>

<style scoped>
/* No changes needed in styles */
.json-container {
  font-family: monospace;
  white-space: pre;
  overflow-y: auto;
  outline: none;
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
  line-height: 20px;
  margin: 0;
  padding: 0;
}

.eleli div {
  max-width: calc(100% - 50px);
  overflow: hidden;
  text-overflow: ellipsis;
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
  position: absolute;
  right: 70px;
  padding: 2px 6px;
  background-color: #6285ab;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.copy-button2 {
  position: fixed;
  margin-left: -40px;
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
  background-color: #d8e0ff;
}

.dark-mode .selected {
  background-color: #3561b88f;
}
</style>
