<template >
  <div class="inputDiv">
    <div class="editor-container">
      <JsonEditorTitle :editor-view="props.editorView"/>

      <div ref="editorRef" style="height: calc(100% - 40px)"></div>
    </div>
  </div>
  <button @click="tete">tset</button>
</template>

<script setup lang="ts">
import { EditorView } from "@codemirror/view"
import { vim } from '@replit/codemirror-vim'; // 引入 Vim 模式
import JsonEditorTitle from './JsonEditorTitle.vue';


// 定义接收的属性
const props = defineProps<{
  editorView: EditorView;
}>();

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
