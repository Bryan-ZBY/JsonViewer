<template>
  <div class="controls-wrapper">
    <div class="controls">

      <div class="inputDiv">
        <div class="editor-container" :style="{ width: boxWidth, height: boxHeight }">
          <JsonEditorTitle :editor-view="editorView"
            @show-help-modal="showHelpModal = true"
            @to-small="toSmall"
            @to-big="toBig"
          />
          <div ref="editorRef" style="height: calc(100% - 40px)"></div>
        </div>
      </div>
      <div class="inputDiv">
        <Autocomplete style="width: 100%"/>
        <!-- <input -->
        <!--   v-model="searchInput" -->
        <!--   ref="searchInputRef" -->
        <!--   type="text" -->
        <!--   style="width: 100%;" -->
        <!--   placeholder="已知当前 JSON 为 item, 请用 item.func... 执行过滤函数" -->
        <!--   @keydown.enter="handleEnter" -->
        <!--   @keydown.up="handleArrowUp" -->
        <!--   @keydown.down="handleArrowDown" -->
        <!--   @focus="logFocus" -->
        <!-- /> -->
      </div>
    <div style="height: 1px; background-color: #ccc; margin: 20px 0;"></div>
      <button @click="emitRenderJson">加载</button>
      <button @click="clearEditor">清空</button>
      <!-- <button @click="doFetch">请求数据</button> -->
      <button @click="zipData">压缩</button>
      <button @click="beautifyData">美化</button>
      <div class="search-wrapper">
        <input
          v-model="searchInput"
          ref="searchInputRef"
          type="text"
          style="margin-right: 10px;"
          placeholder="Search JSON..."
          @keydown.enter="handleEnter"
          @keydown.up="handleArrowUp"
          @keydown.down="handleArrowDown"
          @focus="logFocus"
        />
        <button @click="emit('collapse-all')">收起</button>
      </div>
    </div>

    <!-- 使用新的快捷键帮助组件 -->
    <ShortcutHelpModal :visible="showHelpModal" @close="showHelpModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
import { vim, Vim } from '@replit/codemirror-vim'; // 引入 Vim 模式
import ShortcutHelpModal from './ShortcutHelpModal.vue';
import JsonEditorTitle from './JsonEditorTitle.vue';
import Autocomplete from './Autocomplete.vue';
import { scrollTo } from '../utils/ScrollUtils';
import JsonEditor from './JsonEditor.vue';
import { useDataStore } from '../store/GlobalData';
import { defaultJson } from '../utils/JsonUtils';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { GenerateEditorState } from '../utils/EditorState';
import { foldCode, unfoldCode } from '@codemirror/language';

const emit = defineEmits<{
  (e: 'render-json', data: any): void;
  (e: 'search', searchText: string): void;
  (e: 'collapse-all'): void;
  (e: 'toggle-dark-mode'): void;
}>();

const searchInput = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const showHelpModal = ref(false);

const boxHeight = ref("300px");
const boxWidth = ref("60vw");

const toSmall = () => {
  if(boxHeight.value != "100px"){
    boxHeight.value = "100px";
    boxWidth.value = "300px";
  }else{
    boxHeight.value = "300px";
    boxWidth.value = "60vw";
  }
}

const toBig = () => {
  if(boxHeight.value != "80vh"){
    boxHeight.value = "80vh";
    boxWidth.value = "100%";
  }else{
    boxHeight.value = "300px";
    boxWidth.value = "60vw";
  }
}


const globalDataStore = useDataStore();

// 定义编辑器实例
const editorView = ref<EditorView | null>(null);
const editorRef = ref<HTMLElement | null>(null);

// 初始化 CodeMirror
onMounted(() => {
  const state = GenerateEditorState();

  editorView.value = new EditorView({
    state,
    parent: editorRef.value, // 将编辑器挂载到 DOM
  });

  Vim.defineAction('fold', () => {
    const view = editorView.value;
    if (!view) return;
    const pos = view.state.selection.main.head;
    foldCode(view, pos);
  });

  Vim.defineAction('unfold', () => {
    const view = editorView.value;
    if (!view) return;
    const pos = view.state.selection.main.head;
    unfoldCode(view, pos);
  });

  Vim.mapCommand('zc', 'action', 'fold', {}, 'normal');
  Vim.mapCommand('zo', 'action', 'unfold', {}, 'normal');

  // 定义粘贴动作
  Vim.defineAction('pasteFromClipboard', async () => {
    const view = editorView.value;
    if (!view) return;

    try {
      // 读取剪贴板内容
      const text = await navigator.clipboard.readText();
      const selection = view.state.selection.main;
      const docLength = view.state.doc.length;

      // 如果文档为空，强制从位置 0 开始
      if (docLength === 0) {
        view.dispatch({
          changes: { from: 0, to: 0, insert: text },
          selection: { anchor: text.length },
        });
        return;
      }

      // 验证选择范围是否有效
      const from = Math.max(0, Math.min(selection.from, docLength));
      const to = Math.max(from, Math.min(selection.to, docLength));

      console.log('Before dispatch:', { from, to, docLength, text });

      if (from !== to || (from === 0 && to === docLength)) {
        // 有选中文本，或全选的情况，覆盖选中区域
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
      } else {
        // 无选中文本，插入到光标位置
        const pos = Math.max(0, Math.min(selection.head, docLength));
        view.dispatch({
          changes: { from: pos, insert: text },
          selection: { anchor: pos + text.length },
        });
      }
    } catch (err) {
      console.error('Failed to paste from clipboard:', err);
    }
  });

  // 将 Ctrl-v 映射到粘贴动作
  Vim.mapCommand('<C-v>', 'action', 'pasteFromClipboard', {}, 'normal');

  // 添加快捷键支持全屏（可选）
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
      e.preventDefault();
      toBig();
    }
  });
});

// 清理编辑器实例
onBeforeUnmount(() => {
  if (editorView.value) {
    editorView.value.destroy();
  }
});

const emitRenderJson = () => {
  const cleanedInput = (globalDataStore.jsonValue || JSON.stringify(defaultJson)).trim();
  try {
    const parsedJson = JSON.parse(cleanedInput);
    console.log(parsedJson);
    emit('render-json', parsedJson);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    alert(`Invalid JSON! Error: ${error.message}`);
  }
};

// 压缩
const zipData = () => {
  let cleanedInput = (globalDataStore.jsonValue || JSON.stringify(defaultJson)).trim();
  cleanedInput = JSON.stringify(JSON.parse(cleanedInput));
  if (editorView.value) {
    editorView.value.dispatch({
      changes: {
        from: 0,
        to: editorView.value.state.doc.length,
        insert: cleanedInput,
      },
    });
    globalDataStore.updateGlobalValue('');
  }
};

// 美化
const beautifyData = () => {
  let cleanedInput = (globalDataStore.jsonValue || JSON.stringify(defaultJson)).trim();
  cleanedInput = JSON.stringify(JSON.parse(cleanedInput), null, 2);
  if (editorView.value) {
    editorView.value.dispatch({
      changes: {
        from: 0,
        to: editorView.value.state.doc.length,
        insert: cleanedInput,
      },
    });
    globalDataStore.updateGlobalValue('');
  }
};

// 清空编辑器内容的方法
const clearEditor = () => {
  if (editorView.value) {
    editorView.value.dispatch({
      changes: {
        from: 0,
        to: editorView.value.state.doc.length,
        insert: '',
      },
    });
    globalDataStore.updateGlobalValue('');
  }
};

const doFetch = async () => {
  let jsonInput = editorView.value?.state.doc.toString() || '';
  if (!jsonInput) {
    jsonInput = `fetch('https://jsonplaceholder.typicode.com/posts');`;
  }

  let code = jsonInput.trim();
  console.log(code);

  if (code.endsWith(';')) {
    code = code.slice(0, -1);
  }
  code = code.replace(/fetch\(/, 'return fetch(') + `.then(response => response.json());`;

  try {
    const func = new Function(code);
    const result = await func();
    if (result instanceof Promise) {
      const finalResult = await result;
      editorView.value?.dispatch({
        changes: {
          from: 0,
          to: editorView.value.state.doc.length,
          insert: JSON.stringify(finalResult, null, 2),
        },
      });
      globalDataStore.updateGlobalValue(JSON.stringify(finalResult));
    } else {
      editorView.value?.dispatch({
        changes: {
          from: 0,
          to: editorView.value.state.doc.length,
          insert: JSON.stringify(result, null, 2),
        },
      });
      globalDataStore.updateGlobalValue(JSON.stringify(result));
    }
  } catch (error: any) {
    globalDataStore.updateGlobalValue(`执行出错: ${error.message}`);
  }
};

const emitSearch = () => {
  const trimmedInput = searchInput.value.trim();
  if (trimmedInput) {
    if (!searchHistory.value.includes(trimmedInput)) {
      searchHistory.value.push(trimmedInput);
    }
    historyIndex.value = -1;
    emit('search', trimmedInput);
  }
};

const logFocus = (event: FocusEvent) => {
  console.log('Input focused:', event.target);
};

const isTextareaFocused = () => {
  return document.activeElement?.classList.contains('cm-content');
};

const isInputFocused = () => {
  return document.activeElement === searchInputRef.value;
};

const isInput = () => {
  return isTextareaFocused() || isInputFocused();
};

// 配置快捷键
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    if (searchInputRef.value) {
      searchInputRef.value.blur();
    }
    showHelpModal.value = false;
  }

  if (isInput()) {
    return;
  }

  if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
    event.preventDefault();
    showHelpModal.value = true;
  }

  if (event.key === 'g') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (event.key === 'G') {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  }

  if (event.key === 'd') {
    scrollTo(false);
  }

  if (event.key === 'u') {
    scrollTo(true);
  }
};

const handleEnter = () => {
  emitSearch();
  if (searchInputRef.value) {
    searchInputRef.value.blur();
  }
};

const handleArrowUp = () => {
  if (searchHistory.value.length > 0) {
    if (historyIndex.value < searchHistory.value.length - 1) {
      historyIndex.value++;
      searchInput.value = searchHistory.value[searchHistory.value.length - 1 - historyIndex.value];
    }
  }
};

const handleArrowDown = () => {
  if (searchHistory.value.length > 0) {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      searchInput.value = searchHistory.value[searchHistory.value.length - 1 - historyIndex.value];
    } else if (historyIndex.value === 0) {
      historyIndex.value = -1;
      searchInput.value = '';
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.controls-wrapper {
  position: relative;
  z-index: 1; /* 确保控件在默认情况下低于弹窗 */
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
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
}

.controls input:focus,
.controls textarea:focus,
.controls button:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.controls button {
  background-color: #2b3b4c;
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

.search-wrapper {
  margin-left: auto;
}

.editor-container {
  width: 800px; /* 初始宽度 */
  height: 300px; /* 初始高度 */
  border: 1px solid #657efd;
  border-radius: 10px;
  overflow: auto; /* 确保内容超出时可以滚动 */
  resize: both; /* 允许水平和垂直拖动调整大小 */
  max-width: 100%; /* 最大宽度 */
  max-height: 80vh;
  min-width: 600px; /* 最小宽度，防止拖得太小 */
  min-height: 100px; /* 最小高度，防止拖得太小 */
  /* transition: all 0.3s ease;  */
}

/* 确保 CodeMirror 的内容区域适应容器大小 */
:deep(.cm-editor) {
  height: 100%;
  width: 100%;
}

.inputDiv {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.semi-icon:hover {
  background: #000;
}
</style>
