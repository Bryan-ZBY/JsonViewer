<template>
  <div ref="editorRef" class="editor-container"></div>
  <button @click="tete">tset</button>
</template>

<script setup>
import { GenerateEditorState } from '../utils/EditorState';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from "@codemirror/state";
import { EditorView, } from "@codemirror/view"
import { lintKeymap } from "@codemirror/lint"
import { vim } from '@replit/codemirror-vim'; // 引入 Vim 模式

// 定义编辑器实例
let editorView = null;
const editorRef = ref(null);

// 初始化 CodeMirror
onMounted(() => {
  const state = GenerateEditorState();

  editorView = new EditorView({
    state,
    parent: editorRef.value, // 将编辑器挂载到 DOM
  });
});

// 清理编辑器实例
onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy();
  }
});
</script>

<style scoped>
.editor-container {
  width: 100%; /* 初始宽度 */
  height: 300px; /* 初始高度 */
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: auto; /* 确保内容超出时可以滚动 */
  resize: both; /* 允许水平和垂直拖动调整大小 */
  min-width: 200px; /* 最小宽度，防止拖得太小 */
  min-height: 100px; /* 最小高度，防止拖得太小 */
}

/* 确保 CodeMirror 的内容区域适应容器大小 */
:deep(.cm-editor) {
  height: 100%;
  width: 100%;
}
</style>
