<template>
  <div :class="{ 'dark-mode': isDarkMode }">
    <div class="controls">
      <textarea v-model="jsonInput" placeholder="Enter your JSON here..." class="json-input" />
      <button @click="renderJson">Render JSON</button>
      <input v-model="searchText" placeholder="Search JSON..." @keypress.enter="search" />
      <button @click="search">Search</button>
      <button @click="collapseAll">Collapse All</button>
      <button @click="toggleDarkMode">Toggle Dark Mode</button>
    </div>
    <JsonViewer :data="jsonData" ref="jsonViewer" />
    <button class="fixed-button" @click="scrollToTop">Back to Top</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import JsonViewer from './components/JsonViewer.vue'
import { defaultJson, JsonData } from './utils/jsonUtils'

export default defineComponent({
  name: 'App',
  components: {
    JsonViewer
  },
  setup() {
    const jsonInput = ref<string>(JSON.stringify(defaultJson, null, 2))
    const jsonData = ref<JsonData>(defaultJson)
    const searchText = ref<string>('')
    const isDarkMode = ref<boolean>(false)
    const jsonViewer = ref<InstanceType<typeof JsonViewer> | null>(null)

    const renderJson = () => {
      try {
        jsonData.value = JSON.parse(jsonInput.value)
      } catch (error) {
        alert('Invalid JSON! Please check your input.')
      }
    }

    const search = () => {
      jsonViewer.value?.search(searchText.value)
    }

    const collapseAll = () => {
      jsonViewer.value?.collapseAll()
    }

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return {
      jsonInput,
      jsonData,
      searchText,
      isDarkMode,
      jsonViewer,
      renderJson,
      search,
      collapseAll,
      toggleDarkMode,
      scrollToTop
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
