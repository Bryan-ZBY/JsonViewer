<template >
  <div class="inputDiv">
    <div class="editor-container">
      <JsonEditorTitle :editor-view="editorView"/>

      <div ref="editorRef" style="height: calc(100% - 40px)"></div>
    </div>
  </div>
  <button @click="tete">tset</button>
</template>

<script setup>
import { GenerateEditorState } from '../utils/EditorState';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view"
import { lintKeymap } from "@codemirror/lint"
import { vim } from '@replit/codemirror-vim'; // 引入 Vim 模式
import JsonEditorTitle from './JsonEditorTitle.vue';

// 定义编辑器实例
const editorView = ref(null);
const editorRef = ref(null);

// 初始化 CodeMirror
onMounted(() => {
  const state = GenerateEditorState();

  editorView.value = new EditorView({
    state,
    parent: editorRef.value, // 将编辑器挂载到 DOM
  });
});

// 清理编辑器实例
onBeforeUnmount(() => {
  if (editorView.value) {
    editorView.value.destroy();
  }
});

// 复制代码到剪贴板
const copyCode = () => {
  if (editorView.value) {
    const code = editorView.value.state.doc.toString();
    navigator.clipboard.writeText(code).then(() => {
      console.log('代码已复制到剪贴板');
    }).catch((error) => {
      console.error('复制代码时出错:', error);
    });
  }
};
</script>

<style scoped>
.editor-container {
  width: 100%; /* 初始宽度 */
  height: 300px; /* 初始高度 */
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: auto; /* 确保内容超出时可以滚动 */
  resize: both; /* 允许水平和垂直拖动调整大小 */
  max-width: 100%; /* 最大宽度 */
  max-height: 800px;
  min-width: 200px; /* 最小宽度，防止拖得太小 */
  min-height: 100px; /* 最小高度，防止拖得太小 */
}

/* 确保 CodeMirror 的内容区域适应容器大小 */
:deep(.cm-editor) {
  height: 100%;
  width: 100%;
}

.inputDiv {
  width: 100%;
  display: flex
    ;
  flex-direction: row;
  justify-content: center;
}

.semi-icon:hover {
  background: #000;
}
</style>
