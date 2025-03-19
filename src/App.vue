<template>
  <div class="container vertical" id="container">
    <Controls class="box" id="blue" @render-json="renderJson" @search="performSearch" @collapse-all="collapseAll" />
    <JsonViewer class="box" id="green" :json-data="jsonData" parent-key="" ref="jsonViewerRef" />
    <button id="back-to-top" class="fixed-button" @click="scrollToTop">回到顶部</button>
    <button id="change-layout" class="fixed-button-1" @click="toggleLayout">切换布局</button>
    <KeyPressDisplay />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useDataStore } from '@/store/GlobalData';
import Controls from '@/components/Controls.vue';
import JsonViewer from '@/components/JsonViewer.vue';
import KeyPressDisplay from '@/components/KeyPressDisplay.vue';
import { defaultJson } from './utils/JsonUtils.ts';

const jsonData = ref<any>(defaultJson);
const jsonViewerRef = ref<InstanceType<typeof JsonViewer> | null>(null);
const globalDataStore = useDataStore();
globalDataStore.updateGlobalValue(JSON.stringify(defaultJson));

const renderJson = (data: any) => {
  globalDataStore.updateGlobalValue(JSON.stringify(data));
  jsonData.value = data;
  updateGreenPosition(); // JSON 数据变化可能影响高度，立即更新位置
};

const performSearch = (searchText: string) => {
  jsonViewerRef.value?.performSearch(searchText);
};

const collapseAll = () => {
  jsonViewerRef.value?.collapseAll();
  updateGreenPosition(); // 折叠可能改变高度，立即更新位置
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const toggleLayout = () => {
  const container = document.getElementById('container')!;
  const isVertical = container.classList.toggle('vertical');
  container.classList.toggle('horizontal');
  if (isVertical) {
    updateGreenPosition();
  } else {
    // 水平布局时重置 top
    const green = document.getElementById('green')!;

    green.style.top = '0px';
    green.style.paddingTop = `20px`;
    green.style.left = `52%`;
  }
};

const updateGreenPosition = () => {
  const container = document.getElementById('container')!;
  const green = document.getElementById('green')!;

  if(container.classList.contains('horizontal')){
    green.style.top = '0px';
    green.style.paddingTop = `20px`;
    green.style.left = `52%`;
    return;
  }

  const blue = document.getElementById('blue')!;
  const blueHeight = blue.offsetHeight;
  green.style.top = `${blueHeight}px`;
  green.style.paddingTop = `20px`;
  green.style.left = `60px`;
};

// 使用 ResizeObserver 实时监测 Controls 高度变化
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const blue = document.getElementById('blue')!;
  resizeObserver = new ResizeObserver(() => {
    if (document.getElementById('container')!.classList.contains('vertical')) {
      updateGreenPosition();
    }
  });
  resizeObserver.observe(blue);
  updateGreenPosition(); // 初始加载时更新位置


  // 添加快捷键支持全屏（可选）
  window.addEventListener('keydown', (e) => {
    if(e.key == "F9"){
      toggleLayout()
    }
  });
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<style scoped>
:where(.container) {
  --spacing: 10px;
  --button-bg: #2b3b4c;
  --button-hover: #0056b3;
  --transition: all 0.5s ease-in-out;
  --border-color: #000; /* 可自定义边框颜色 */
  --shadow-color: rgba(0, 183, 255, 0.5); /* 阴影颜色 */
}

.container {
  width: 100%;
  position: relative;
  min-height: 100vh;
}

.box {
  transition: var(--transition);
  position: absolute;
}

.vertical #blue {
  width: calc(100% - 80px);
  top: 20px;
  left: 20px;
  right: 20px;
}

.vertical #green {
  width: calc(100% - 80px);
  left: 20px;
  padding-top: 20px;
}

.horizontal #blue {
  width: calc(48% - 20px);
  min-height: calc(100vh - 30px);
  top: 20px;
  left: 20px;
}

.horizontal #green {
  width: calc(48% - 20px);
  min-height: calc(100vh - 30px);
  padding-top: 20px;
  left: 52%;
}

/* 添加 #green::before 样式 */
#green {
  position: relative; /* 确保伪元素相对于 #green 定位 */
}

/* 定义关键帧动画，改变背景颜色实现渐变效果 */
@keyframes darkGradientAnimation {
  0% {
    background: #1b233a;
    height: 0%;
    top: 50%;
  }
  20% {
    background: #1b233a;
    height: 100%;
    top: 0;
  }
  100% {
    background: #9ac0ff;
    top: 0;
    height: 100%;
  }
}

/* 定义关键帧动画，改变背景颜色实现渐变效果 */
@keyframes gradientAnimation {
  0% {
    background: #9ac0ff;
    height: 0%;
    top: 70%;
  }
  100% {
    background: #1b233a;
    top: 0;
    height: 100%;
  }
}

/* 水平布局时容器的伪元素样式 */
.dark-mode .container.horizontal::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  height: 100%;
  width: 4px;
  background: #9ac0ff;
  box-shadow: 0 0 12px rgb(0 64 255 / 50%), 0 0 15px rgb(0 111 255 / 50%), 0 0 24px rgb(0 98 255 / 50%);
  z-index: 1;
  /* 应用动画 */
  animation: darkGradientAnimation 0.8s;
  /* animation: gradientAnimation 2s infinite; */
}

/* 水平布局时容器的伪元素样式 */
.container.horizontal::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  height: 100%;
  width: 4px;
  background: #1b233a;
  box-shadow: 0 0 12px rgb(0 64 255 / 50%), 0 0 15px rgb(0 111 255 / 50%), 0 0 24px rgb(0 98 255 / 50%);
  z-index: 1;
  /* 应用动画 */
  animation: gradientAnimation 0.8s;
  /* animation: gradientAnimation 2s infinite; */
}

/* 可选：水平布局时调整边框样式 */
.horizontal #green::before {
  left: -10px; /* 保持一致，也可以调整 */
}

.fixed-button,
.fixed-button-1 {
  z-index: 9999;
  position: fixed;
  bottom: 20px;
  padding: 10px 20px;
  background-color: var(--button-bg);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.fixed-button { right: 20px; }
.fixed-button-1 { right: 130px; }
.fixed-button:hover,
.fixed-button-1:hover {
  background-color: var(--button-hover);
}
</style>
