import { defineStore } from 'pinia';

// 定义一个名为 globalData 的 store
export const useDataStore = defineStore('globalData', {
  state: () => ({
    showValue: '初始值', // 下方展示数据
    selectedKey: '',
    copyKey: '',
    jsonValue: '' // 编辑文档内数据
  }),
  actions: {
    // 定义修改数据的方法
    updateGlobalValue(newValue: string) {
      this.showValue = newValue;
    },
    updateSelectedKey(newValue: string){
      this.selectedKey = newValue;
    },
    updateCopyKey(newValue: string){
      this.copyKey = newValue;
    },
    updateJsonValue(newValue: string){
      this.jsonValue = newValue;
    }
  }
});
