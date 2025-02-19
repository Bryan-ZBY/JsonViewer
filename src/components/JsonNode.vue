<template>
    <ul>
        <li v-for="(value, key) in node" :key="key" class="eleli" 
        @mouseenter="handleMouseEnter(key)"
            @mouseleave="handleMouseLeave">
            <span class="json-key">{{ key }}: </span>

            <template v-if="isObject(value)">
                <span class="collapsible" :class="{ collapsed: !isCollapsed(path) }" @click="toggle(path)">
                    {{ isArray(value) ? '[' : '{' }}
                </span>

                <span v-if="isCollapsed(path)" class="summary">
                    {{ generateSummary(value) }}
                </span>
                    <button class="copy-button" @click.stop="copy(value)"
                   :style="{ display: activeItem === key ? 'inline-block' : 'none' }" >{{ copyButtonText }}</button>

                <div v-if="!isCollapsed(path)">
                    <json-node :node="value" :depth="depth + 1" :search-text="searchText" :collapsed-nodes="collapsedNodes"
                        :path="path + '.' + key" @toggle-collapse="(p) => $emit('toggle-collapse', p)" />
                </div>
            </template>

            <template v-else>
                <span :class="valueClass(value)">
                    {{ formatValue(value) }}
                </span>
                <button class="copy-button" @click.stop="copy(value)"
                    :style="{ display: activeItem === key ? 'inline-block' : 'none' }">{{ copyButtonText }}</button>
            </template>
        </li>
    </ul>
</template>
  
<script>
import { computed, ref } from 'vue';

export default {
    name: 'JsonNode',
    props: {
        node: [Object, Array],
        depth: Number,
        searchText: String,
        collapsedNodes: Set,
        path: {
            type: String,
            default: ''
        }
    },
    emits: ['toggle-collapse'],
    setup(props, { emit }) {
        // 使用 ref 来声明 Copy 按钮的文本
        const copyButtonText = ref('Copy');

        // 判断是否是对象或数组
        const isObject = (val) => typeof val === 'object' && val !== null;
        const isArray = (val) => Array.isArray(val);

        // 更新样式类
        const valueClass = (val) => {
            if (val === null) return 'json-null';
            const type = typeof val;
            return `json-${type}`;
        };

        // 格式化值
        const formatValue = (val) => {
            if (val === null) return 'null';
            if (typeof val === 'string') return `"${val}"`;
            return val.toString();
        };

        // 生成摘要
        const generateSummary = (data) => {
            if (Array.isArray(data)) {
                return `[${data.map(item => JSON.stringify(item)).join(', ')}]`;
            } else if (typeof data === 'object' && data !== null) {
                const entries = Object.entries(data).map(([key, value]) => {
                    if (typeof value === 'object' && value !== null) {
                        return `${key}: {…}`;
                    }
                    return `${key}: ${JSON.stringify(value)}`;
                });
                return `{${entries.join(', ')}}`;
            }
            return JSON.stringify(data);
        };

        // 复制功能
        const copy = (value) => {
            navigator.clipboard.writeText(JSON.stringify(value)).then(() => {
                copyButtonText.value = 'Copy-Success';  // 更新按钮文本为 "Copy-Success"
                setTimeout(() => {
                    copyButtonText.value = 'Copy';  // 3秒后恢复按钮文本
                }, 1500);
            }).catch(err => alert('复制失败: ' + err));
        };

        // 判断是否已折叠
        const isCollapsed = (path) => props.collapsedNodes.has(path);

        // 切换折叠状态
        const toggle = (path) => emit('toggle-collapse', path);

        // 记录当前鼠标悬停的元素的 key
        const activeItem = ref(null);

        // 鼠标进入事件处理
        const handleMouseEnter = (key) => {
            activeItem.value = key;  // 显示当前项
        };

        // 鼠标离开事件处理
        const handleMouseLeave = () => {
            activeItem.value = null;  // 隐藏当前项
        };
        return {
            isObject,
            isArray,
            valueClass,
            formatValue,
            generateSummary,
            copy,
            isCollapsed,
            toggle,
                  activeItem,
      handleMouseEnter,
      handleMouseLeave,
            copyButtonText  // 返回响应式的 Copy 按钮文本
        };
    }
};
</script>
  
<style scoped>
/* 样式保持不变 */
body {
    font-family: Arial, sans-serif;
    margin: 20px;
    background-color: #ffffff;
    color: #000000;
    transition: background-color 0.3s, color 0.3s;
}

body.dark-mode {
    background-color: #121212;
    color: #ffffff;
}


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
    pointer-events: none;
    /* 避免光标干扰鼠标事件 */
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
  