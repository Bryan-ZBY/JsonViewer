<template>
  <div class="json-container">
    <ul v-if="jsonData">
      <li v-for="(value, key) in jsonData" :key="key" class="eleli" @click="toggleCollapse($event, key)" @mouseenter="showCopyButton($event, key)" @mouseleave="hideCopyButton($event, key)">
        <span class="json-key">{{ key }}: </span>
        <template v-if="isObjectOrArray(value)">
          <span class="collapsible" :class="{ collapsed: collapsed[key] }">{{ Array.isArray(value) ? '[' : '{' }}</span>
          <span class="summary" v-show="!collapsed[key]">{{ generateSummary(value) }}</span>
          <button class="copy-button" v-show="showCopy[key]" @click.stop="copyToClipboard(value, key)">Copy</button>
          <div v-show="collapsed[key]">
            <JsonViewer :json-data="value" />
          </div>
        </template>
        <template v-else>
          <span :class="getValueClass(value)">{{ JSON.stringify(value) }}</span>
          <button class="copy-button" v-show="showCopy[key]" @click.stop="copyToClipboard(value, key)">Copy</button>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { JsonData } from '../types/json';
import { generateSummary } from '../utils/jsonUtils';

// 定义 props，确保 jsonData 是必需的
const props = defineProps<{
  jsonData: JsonData; // JsonData 类型已定义
}>();

const collapsed = ref<Record<string, boolean>>({});
const showCopy = ref<Record<string, boolean>>({});

// 初始化每个键的折叠状态为 false（展开）
onMounted(() => {
  if (props.jsonData) { // 使用 props.jsonData，确保访问正确
    for (const key in props.jsonData) {
      collapsed.value[key] = false; // 默认展开
    }
  }
});

const isObjectOrArray = (value: any): boolean => {
  return typeof value === 'object' && value !== null;
};

const getValueClass = (value: any): string => {
  if (typeof value === 'string') return 'json-string';
  if (typeof value === 'number') return 'json-number';
  if (typeof value === 'boolean') return 'json-boolean';
  if (value === null) return 'json-null';
  return 'json-value';
};

const toggleCollapse = (event: Event, key: string) => {
  event.stopPropagation(); // 阻止事件冒泡到父节点
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
    button.textContent = 'Copy-Success';
    setTimeout(() => (button.textContent = 'Copy'), 1500);
  }).catch(err => alert('Copy failed: ' + err));
};

const performSearch = (searchText: string) => {
  // 搜索逻辑保持不变
};

const collapseAll = () => {
  if (props.jsonData) {
    for (const key in props.jsonData) {
      collapsed.value[key] = true; // 收起所有节点
    }
  }
};

defineExpose({ performSearch, collapseAll });
</script>

<style scoped>
/* 样式保持不变 */
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
}

.summary {
  color: #666;
  margin-left: 5px;
}

.dark-mode .summary {
  color: #aaa;
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
