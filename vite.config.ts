import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './', // 设置基础路径为相对路径
  build: {
    outDir: 'dist' // 确保输出目录为 dist
  }
});
