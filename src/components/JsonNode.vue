<template>
    <ul>
      <li v-for="(value, key) in node" :key="key" class="eleli">
        <span class="json-key">{{ key }}: </span>
        
        <template v-if="isObject(value)">
          <span
            class="collapsible"
            :class="{ collapsed: !isCollapsed(path) }"
            @click="toggle(path)"
          >
            {{ isArray(value) ? '[' : '{' }}
          </span>
          
          <span v-if="isCollapsed(path)" class="summary">
            {{ generateSummary(value) }}
            <button class="copy-button" @click.stop="copy(value)">Copy</button>
          </span>
  
          <div v-if="!isCollapsed(path)">
            <json-node
              :node="value"
              :depth="depth + 1"
              :search-text="searchText"
              :collapsed-nodes="collapsedNodes"
              :path="path + '.' + key"
              @toggle-collapse="(p) => $emit('toggle-collapse', p)"
            />
          </div>
        </template>
  
        <template v-else>
          <span :class="valueClass(value)">
            {{ formatValue(value) }}
          </span>
          <button class="copy-button" @click.stop="copy(value)">Copy</button>
        </template>
      </li>
    </ul>
  </template>
  
  <script>
  import { computed } from 'vue';
  
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
      // 方法
      const isObject = (val) => typeof val === 'object' && val !== null;
      const isArray = (val) => Array.isArray(val);
      
      const valueClass = (val) => {
        if (val === null) return 'json-null';
        const type = typeof val;
        return `json-${type}`;
      };
  
      const formatValue = (val) => {
        if (val === null) return 'null';
        if (typeof val === 'string') return `"${val}"`;
        return val.toString();
      };
  
      const generateSummary = (val) => {
        // 保持原有 generateSummary 逻辑
      };
  
      const copy = (value) => {
        navigator.clipboard.writeText(JSON.stringify(value));
      };
  
      const isCollapsed = (path) => props.collapsedNodes.has(path);
      const toggle = (path) => emit('toggle-collapse', path);
  
      return {
        isObject,
        isArray,
        valueClass,
        formatValue,
        generateSummary,
        copy,
        isCollapsed,
        toggle
      };
    }
  };
  </script>