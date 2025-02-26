<template>
  <div>
    <Controls @render-json="renderJson" @search="performSearch" @collapse-all="collapseAll" @toggle-dark-mode="toggleDarkMode" />
    <JsonViewer :json-data="jsonData" ref="jsonViewerRef" />
    <button id="back-to-top" class="fixed-button" @click="scrollToTop">回到顶部</button>
    <KeyPressDisplay />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Controls from './components/Controls.vue';
import JsonViewer from './components/JsonViewer.vue';
import KeyPressDisplay from './components/KeyPressDisplay.vue';
import { defaultJson } from './utils/JsonUtils';

const jsonData = ref<any>(defaultJson); // Initial JSON data
const jsonViewerRef = ref<InstanceType<typeof JsonViewer> | null>(null);

const renderJson = (data: any) => {
  jsonData.value = data;
};

const performSearch = (searchText: string) => {
  jsonViewerRef.value?.performSearch(searchText);
};

const collapseAll = () => {
  jsonViewerRef.value?.collapseAll();
};

const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<style scoped>
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
</style>
