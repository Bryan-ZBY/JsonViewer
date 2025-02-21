<template>
  <li class="eleli" @mouseenter="showCopyButton = true" @mouseleave="showCopyButton = false">
    <span class="json-key">{{ keyName }}: </span>
    <template v-if="isObject">
      <span class="collapsible" :class="{ collapsed: isCollapsed }" @click.stop="toggle">
        {{ isArray ? '[' : '{' }}
      </span>
      <span class="summary" v-if="!isCollapsed">{{ summary }}</span>
      <button v-show="showCopyButton" class="copy-button" @click.stop="copyValue">
        {{ copyText }}
      </button>
      <div :class="{ expanded: isCollapsed }" ref="content">
        <ul v-if="isCollapsed">
          <JsonNode
            v-for="(val, key) in value"
            :key="key"
            :key-name="isArray ? undefined : key"
            :value="val"
          />
        </ul>
      </div>
    </template>
    <template v-else>
      <span :class="valueClass">{{ formattedValue }}</span>
      <button v-show="showCopyButton" class="copy-button" @click.stop="copyValue">
        {{ copyText }}
      </button>
    </template>
  </li>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { generateSummary, JsonData } from '../utils/jsonUtils'

export default defineComponent({
  name: 'JsonNode',
  props: {
    keyName: {
      type: String,
      default: ''
    },
    value: {
      type: [Object, Array, String, Number, Boolean, null] as PropType<JsonData>,
      required: true
    }
  },
  setup(props) {
    const isCollapsed = ref<boolean>(false)
    const showCopyButton = ref<boolean>(false)
    const copyText = ref<string>('Copy')
    const content = ref<HTMLElement | null>(null)

    const isObject = computed(() => typeof props.value === 'object' && props.value !== null)
    const isArray = computed(() => Array.isArray(props.value))
    const summary = computed(() => generateSummary(props.value))
    const valueClass = computed(() => {
      if (typeof props.value === 'string') return 'json-string'
      if (typeof props.value === 'number') return 'json-number'
      if (typeof props.value === 'boolean') return 'json-boolean'
      if (props.value === null) return 'json-null'
      return 'json-value'
    })
    const formattedValue = computed(() => JSON.stringify(props.value))

    const toggle = () => {
      if (!content.value) return
      if (!isCollapsed.value) {
        content.value.style.maxHeight = content.value.scrollHeight + 'px'
        setTimeout(() => {
          if (content.value) {
            content.value.style.maxHeight = '0'
            content.value.classList.remove('expanded')
          }
          isCollapsed.value = false
        }, 10)
      } else {
        content.value.classList.add('expanded')
        content.value.style.maxHeight = content.value.scrollHeight + 'px'
        isCollapsed.value = true
        content.value.addEventListener('transitionend', function handler() {
          if (this.style) {
            this.style.maxHeight = 'none'
            this.removeEventListener('transitionend', handler)
          }
        })
      }
    }

    const copyValue = () => {
      const text = JSON.stringify(props.value, null, 2)
      navigator.clipboard.writeText(text).then(() => {
        copyText.value = 'Copy-Success'
        setTimeout(() => {
          copyText.value = 'Copy'
        }, 1500)
      }).catch(err => alert('Copy failed: ' + err))
    }

    return {
      isCollapsed,
      showCopyButton,
      copyText,
      content,
      isObject,
      isArray,
      summary,
      valueClass,
      formattedValue,
      toggle,
      copyValue
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
