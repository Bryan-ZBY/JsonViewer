import { defineStore } from 'pinia';

// 定义一个名为 globalData 的 store
export const useDataStore = defineStore('globalData', {
  state: () => ({
    // 定义全局数据
    globalValue: '初始值',
    selectedKey: '',
    copyKey: '',
    jsonValue: ''
  }),
  actions: {
    // 定义修改数据的方法
    updateGlobalValue(newValue: string) {
      this.globalValue = newValue;
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
