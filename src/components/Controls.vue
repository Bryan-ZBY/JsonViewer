<template>
  <div class="controls">
    <textarea v-model="jsonInput" placeholder="Enter your JSON here..." class="json-input" @focus="logFocus"></textarea>
    <button @click="emitRenderJson">Render JSON</button>
    <input v-model="searchInput" type="text" placeholder="Search JSON..." @keypress.enter="emitSearch" @focus="logFocus" />
    <button @click="emitSearch">Search</button>
    <button @click="emit('collapse-all')">Collapse All</button>
    <button @click="emit('toggle-dark-mode')">Toggle Dark Mode</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// 定义事件发射器并赋值给 emit
const emit = defineEmits<{
  (e: 'render-json', data: any): void;
  (e: 'search', searchText: string): void;
  (e: 'collapse-all'): void;
  (e: 'toggle-dark-mode'): void;
}>();

const jsonInput = ref('');
const searchInput = ref('');

const emitRenderJson = () => {
  const cleanedInput = jsonInput.value.trim();
  console.log('Cleaned input:', JSON.stringify(cleanedInput));
  try {
    const parsedJson = JSON.parse(cleanedInput);
    console.log('Parsed JSON:', parsedJson);
    emit('render-json', parsedJson); // 使用定义好的 emit
  } catch (error) {
    console.error('JSON Parse Error:', error);
    alert(`Invalid JSON! Error: ${error.message}`);
  }
};

const emitSearch = () => {
  emit('search', searchInput.value.trim());
};

const logFocus = (event: FocusEvent) => {
  console.log('Input focused:', event.target);
};

watch(jsonInput, (newValue) => {
  console.log('jsonInput updated:', newValue);
});

watch(searchInput, (newValue) => {
  console.log('searchInput updated:', newValue);
});
</script>

<style scoped>
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
  pointer-events: auto;
  z-index: 10;
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
</style>
