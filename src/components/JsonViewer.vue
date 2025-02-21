<template>
  <div class="json-container">
    <ul>
      <JsonNode
        v-for="(val, key) in data"
        :key="key"
        :key-name="key"
        :value="val"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import JsonNode from './JsonNode.vue'
import { JsonData } from '../utils/jsonUtils'

export default defineComponent({
  name: 'JsonViewer',
  components: {
    JsonNode
  },
  props: {
    data: {
      type: Object as PropType<JsonData>,
      required: true
    }
  },
  methods: {
    search(searchText: string) {
      console.log('Searching for:', searchText)
      // 这里可以实现完整的搜索功能，需要时请告诉我
    },
    collapseAll() {
      this.$children.forEach(child => {
        if (child.$options.name === 'JsonNode' && (child as any).isObject && (child as any).isCollapsed) {
          (child as any).toggle()
        }
      })
    }
  }
})
</script>

<style scoped>
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
    .json-container div {
      overflow: hidden;
      transition: max-height 0.1s ease-in-out, opacity 0.1s ease-in-out;
      max-height: 0; /* 初始状态 */
      opacity: 0;
    }

    .json-container div.expanded {
      opacity: 1;
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
