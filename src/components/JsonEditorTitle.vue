<template>
  <div class="header-dBhZw9">
    <div v-if="showCopied" class="copied-tooltip">复制成功</div>
    <div class="text-qQiIjw">JSON</div>
    <div class="action-UHHINY">
      <!-- 复制按钮 -->
      <div class="hoverable-fZ6eZQ" data-testid="code-block-copy" tabindex="0" aria-describedby="453o5bh" data-popupid="453o5bh" @click="copyCode">
        <span role="img" class="semi-icon semi-icon-default text-14">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="evenodd" d="M21 3.5V17a2 2 0 0 1-2 2h-2v-2h2V3.5H9v2h5.857c1.184 0 2.143.895 2.143 2v13c0 1.105-.96 2-2.143 2H5.143C3.959 22.5 3 21.605 3 20.5v-13c0-1.105.96-2 2.143-2H7v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2m-6.143 4H5.143v13h9.714z" clip-rule="evenodd">
            </path>
          </svg>
        </span>
      </div>
      <!-- 其他按钮 -->
      <div class="hoverable-fZ6eZQ" tabindex="0" aria-describedby="tgfbvud" data-popupid="tgfbvud" @click="emit('show-help-modal')">
        <span role="img" class="semi-icon semi-icon-default text-14">
          <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1">
            <circle cx="12" cy="12" r="10"> </circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"> </path>
            <line x1="12" y1="17" x2="12.01" y2="17"> </line>
          </svg>
        </span>
      </div>
      <div class="hoverable-fZ6eZQ" tabindex="0" aria-describedby="m6ms5a9" data-popupid="m6ms5a9" @click="emit('to-small')">
        <span role="img" class="semi-icon semi-icon-default text-14">
          <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </span>
      </div>
      <div class="hoverable-fZ6eZQ" tabindex="0" aria-describedby="m6ms5a9" data-popupid="m6ms5a9" @click="toggleDarkMode">
        <span role="img" class="semi-icon semi-icon-default text-14">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 .5a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1">
            </path>
            <path fill="currentColor" fill-rule="evenodd" d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14m0-2a5 5 0 1 0 0-10 5 5 0 0 0 0 10" clip-rule="evenodd">
            </path>
            <path fill="currentColor" d="M13 21.5a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0zM23.5 12a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1M2.5 13a1 1 0 1 0 0-2h-1a1 1 0 1 0 0 2zM20.132 5.282l-.707.707a1 1 0 0 1-1.415-1.414l.707-.707a1 1 0 1 1 1.415 1.414M5.282 20.132l.708-.708a1 1 0 1 0-1.415-1.414l-.707.707a1 1 0 1 0 1.414 1.415M18.718 20.132l-.708-.707a1 1 0 0 1 1.415-1.414l.707.707a1 1 0 0 1-1.415 1.414M4.575 5.99A1 1 0 1 0 5.99 4.576l-.708-.707a1 1 0 0 0-1.414 1.414z">
            </path>
          </svg>
        </span>
      </div>
      <div class="hoverable-fZ6eZQ" tabindex="0" aria-describedby="mg29vc1" data-popupid="mg29vc1" @click="emit('to-big')">
        <span role="img" class="semi-icon semi-icon-default text-14">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22 3v7a1 1 0 1 1-2 0V4h-6a1 1 0 1 1 0-2h7a1 1 0 0 1 1 1M11.005 21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 2.002 0v6h6.003a1 1 0 0 1 1 1">
            </path>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineExpose, nextTick, watch } from 'vue';
import { EditorView } from "@codemirror/view";

// 定义接收的属性
const props = defineProps<{
  editorView: EditorView;
}>();
const emit = defineEmits<{
  (e: 'show-help-modal'): void;
  (e: 'to-big'): void;
  (e: 'to-small'): void;
}>();

const showCopied = ref(false); // 控制复制提示的显示

// 复制代码到剪贴板
const copyCode = () => {
  const code = props.editorView.state.doc.toString();
  navigator.clipboard.writeText(code).then(() => {
    showCopied.value = true; // 显示提示
    setTimeout(() => {
      showCopied.value = false; // 3秒后隐藏提示
    }, 2000);
  }).catch((error) => {
    console.error('复制代码时出错:', error);
  });
};

const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
};
</script>

<style scoped>
.header-dBhZw9 {
  align-items: center;
  background: var(--code-header-bg-color);
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-family: Menlo, Monaco, Consolas, Courier New, monospace;
  font-size: 12px;
  height: 32px;
  justify-content: space-between;
  padding: 6px 9px 6px 16px;
  background: #131921;
  color: aliceblue;
  font-size: 14px;
  padding: 4px 20px;
}

.action-UHHINY {
  align-items: center;
  color: var(--code-header-icon-color);
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 2px;
  justify-content: space-between;
}

.hoverable-fZ6eZQ {
  padding: 8px;
  transition: all 0.3s ease;
  position: relative; /* 为提示定位 */
}

.hoverable-fZ6eZQ:hover {
  transform: translateY(1px) scale(1.4);
  color: powderblue;
}

/* 复制按钮点击动画 */
.hoverable-fZ6eZQ:active {
  transform: scale(0.9);
}

/* 复制提示 */
.copied-tooltip {
  position: absolute;
  left: 50%;
  background: beige;
  color: #0f1d7e;
  padding: 4px 8px;
  border: 1px solid aliceblue;
  border-radius: 4px;
  font-size: 12px;
  animation: fadeInOut 2s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
