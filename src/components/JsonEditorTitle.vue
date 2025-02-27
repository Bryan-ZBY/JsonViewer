
<template >
  <div class="header-dBhZw9">
    <div class="text-qQiIjw">html</div>
    <div class="action-UHHINY">
      <div class="hoverable-fZ6eZQ" data-testid="code-block-copy" tabindex="0" aria-describedby="453o5bh" data-popupid="453o5bh"  @click="copyCode">
        <span role="img" class="semi-icon semi-icon-default text-14">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="evenodd" d="M21 3.5V17a2 2 0 0 1-2 2h-2v-2h2V3.5H9v2h5.857c1.184 0 2.143.895 2.143 2v13c0 1.105-.96 2-2.143 2H5.143C3.959 22.5 3 21.605 3 20.5v-13c0-1.105.96-2 2.143-2H7v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2m-6.143 4H5.143v13h9.714z" clip-rule="evenodd">
            </path>
          </svg>
        </span>
      </div>
      <div class="hoverable-fZ6eZQ" tabindex="0" aria-describedby="tgfbvud" data-popupid="tgfbvud">
        <span role="img" class="semi-icon semi-icon-default text-14">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="evenodd" d="M4 4a1 1 0 0 1 1 1v3a3 3 0 0 0 3 3h11.086l-5.293-5.293a1 1 0 0 1 1.414-1.414l7 7a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414-1.414L19.086 13H8a5 5 0 0 1-5-5V5a1 1 0 0 1 1-1" clip-rule="evenodd">
            </path>
          </svg>
        </span>
      </div>
      <div class="hoverable-fZ6eZQ" tabindex="0" aria-describedby="m6ms5a9" data-popupid="m6ms5a9">
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
      <div class="hoverable-fZ6eZQ" tabindex="0" aria-describedby="mg29vc1" data-popupid="mg29vc1">
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

<script setup lang='ts'>
import { ref, onMounted, onUnmounted, defineProps, defineExpose, nextTick, watch } from 'vue';
import { EditorView } from "@codemirror/view";

// 定义接收的属性
const props = defineProps<{
  editorView: EditorView;
}>();

// 复制代码到剪贴板
const copyCode = () => {
  if (props.editorView) {
    const code = props.editorView.state.doc.toString();
    navigator.clipboard.writeText(code).then(() => {
      console.log('代码已复制到剪贴板');
    }).catch((error) => {
      console.error('复制代码时出错:', error);
    });
  }
};
</script>

<style scoped>
.header-dBhZw9 {
  align-items: center;
  background: var(--code-header-bg-color);
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-family: Menlo,Monaco,Consolas,Courier New,monospace;
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
  gap: 8px;
  justify-content: space-between;
}

</style>
