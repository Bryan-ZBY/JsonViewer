<template>
  <div ref="editorRef" class="editor-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from "@codemirror/state";
import {
  EditorView, keymap, highlightSpecialChars, drawSelection,
  highlightActiveLine, dropCursor, rectangularSelection,
  crosshairCursor, lineNumbers, highlightActiveLineGutter
} from "@codemirror/view"
import {
  defaultHighlightStyle, syntaxHighlighting, indentOnInput,
  bracketMatching, foldGutter, foldKeymap
} from "@codemirror/language"
import {
  defaultKeymap, history, historyKeymap
} from "@codemirror/commands"
import {
  searchKeymap, highlightSelectionMatches
} from "@codemirror/search"
import {
  autocompletion, completionKeymap, closeBrackets,
  closeBracketsKeymap
} from "@codemirror/autocomplete"
import { lintKeymap } from "@codemirror/lint"
import { vim } from '@replit/codemirror-vim'; // 引入 Vim 模式

// 定义编辑器实例
let editorView = null;
const editorRef = ref(null);

// 编辑器的初始内容
const initialCode = ref(`function hello() {
  console.log("Hello, Vue 3 and CodeMirror with resize!");
}`);

// 初始化 CodeMirror
onMounted(() => {
  const state = EditorState.create({
    doc: initialCode.value, // 初始代码
    extensions: [
      // A line number gutter
      lineNumbers(),
      // 这行代码启用了编辑器的行号显示功能。在编辑器的左侧会显示每一行的行号，方便用户定位代码所在的行。

      // A gutter with code folding markers
      foldGutter(),
      // 这行代码添加了一个代码折叠的功能区域（gutter）。在这个区域中会显示一些标记，允许用户折叠和展开代码块，例如函数、循环等代码块。

      // Replace non-printable characters with placeholders
      highlightSpecialChars(),
      // 该扩展会将不可打印的字符（如制表符、换行符等）替换为占位符进行显示，这样可以让用户更清晰地看到这些特殊字符的位置。

      // The undo history
      history(),
      // 启用编辑器的撤销历史记录功能。用户可以使用快捷键（通常是 Ctrl+Z 或 Command+Z）来撤销之前的操作，也可以使用对应的重做快捷键（Ctrl+Y 或 Command+Y）。

      // Replace native cursor/selection with our own
      drawSelection(),
      // 这行代码会用 CodeMirror 自定义的光标和选中文本的样式来替换浏览器原生的样式，使选中效果更加美观和一致。

      // Show a drop cursor when dragging over the editor
      dropCursor(),
      // 当用户在编辑器内拖动文本时，会显示一个“拖放光标”，指示文本将被放置的位置。

      // Highlight syntax with a default style
      // syntaxHighlighting(defaultHighlightStyle),
      // 启用语法高亮功能，使用默认的高亮样式对代码进行语法着色。不同的编程语言元素（如关键字、注释、字符串等）会以不同的颜色显示，提高代码的可读性。

      // Highlight matching brackets near cursor
      bracketMatching(),
      // 当光标位于括号（如圆括号、方括号、花括号）附近时，会高亮显示与之匹配的另一个括号，方便用户查看代码的结构和匹配关系。

      // Automatically close brackets
      closeBrackets(),
      // 当用户输入一个左括号（如 `(`, `[`, `{`）时，编辑器会自动插入对应的右括号（如 `)`, `]`, `}`），并将光标定位在括号内部，提高输入效率。

      // Load the autocompletion system
      autocompletion(),
      // 启用代码自动补全功能。当用户输入代码时，编辑器会根据上下文和已知的代码信息提供可能的补全选项，用户可以通过快捷键（通常是 Tab 键）选择合适的补全项。

      // Allow alt-drag to select rectangular regions
      rectangularSelection(),
      // 允许用户通过按住 Alt 键并拖动鼠标来选择一个矩形区域的文本。这种选择方式在处理表格数据或多行代码的某一部分时非常有用。

      // Change the cursor to a crosshair when holding alt
      crosshairCursor(),
      // 当用户按住 Alt 键时，鼠标光标会变成十字线样式，这通常与矩形选择功能配合使用，提示用户可以进行矩形区域的选择。

      // Style the current line specially
      highlightActiveLine(),
      // 会将当前光标所在的行进行特殊样式的高亮显示，使用户更容易定位当前编辑的行。

      // Style the gutter for current line specially
      highlightActiveLineGutter(),
      // 对当前行对应的行号区域（gutter）进行特殊样式的高亮显示，与 `highlightActiveLine` 配合，进一步突出当前编辑的行。

      // Highlight text that matches the selected text
      highlightSelectionMatches(),
      // 当用户选中文本时，编辑器会高亮显示文档中所有与之匹配的文本，方便用户查找和替换相同的内容。

      keymap.of([
        // Closed-brackets aware backspace
        ...closeBracketsKeymap,
        // 这部分键盘映射处理与自动闭合括号相关的退格键操作。例如，当光标位于一对闭合括号中间时，按下退格键会同时删除这对括号。

        // A large set of basic bindings
        ...defaultKeymap,
        // 包含了一组基本的键盘快捷键绑定，如复制、粘贴、撤销、重做等常见操作的快捷键。

        // Search-related keys
        ...searchKeymap,
        // 定义了与搜索功能相关的键盘快捷键，如查找、查找下一个、查找上一个等操作的快捷键。

        // Redo/undo keys
        ...historyKeymap,
        // 包含了撤销和重做操作的键盘快捷键，通常是 Ctrl+Z（Command+Z）用于撤销，Ctrl+Y（Command+Y）用于重做。

        // Code folding bindings
        ...foldKeymap,
        // 定义了与代码折叠功能相关的键盘快捷键，如折叠代码块、展开代码块等操作的快捷键。

        // Autocompletion keys
        ...completionKeymap,
        // 包含了与代码自动补全功能相关的键盘快捷键，如触发自动补全、选择补全项等操作的快捷键。

        // Keys related to the linter system
        ...lintKeymap
        // 定义了与代码检查（linter）系统相关的键盘快捷键，例如跳转到下一个错误或警告位置等操作的快捷键。
      ]),
      javascript(), // JavaScript 语法高亮
      oneDark, // 暗色主题
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          // 当内容变化时，获取最新代码
          const newCode = update.state.doc.toString();
          console.log('代码更新:', newCode);
        }
      }),
      vim() // 启用 Vim 模式
    ],
  });

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
