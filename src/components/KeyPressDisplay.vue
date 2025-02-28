<template>
  <div>
    <div
      v-for="item in keys"
      :key="item.id"
      :style="{ bottom: getBottomPosition(keys.indexOf(item)) + 'px' }"
      class="key-display"
      @animationend="removeKey(item.id)"
    >
      {{ item.key }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keys: [], // 存储对象 { id, key }
      idCounter: 0 // 用于生成唯一ID
    };
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      // const key = event.key.slice(0,3);
      const key = event.key;
      // 添加带有唯一ID的对象
      this.keys.unshift({
        id: this.idCounter++,
        key: key
      });
    },
    getBottomPosition(index) {
      return 80 + index * 60;
    },
    removeKey(id) {
      // 查找并移除特定ID的元素
      const index = this.keys.findIndex(item => item.id === id);
      if (index !== -1) {
        this.keys.splice(index, 1);
      }
    }
  }
};
</script>

<style scoped>
@keyframes stayVisible {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-1px);
  }
}

.key-display {
  position: fixed;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 24px;
  min-width: 60px;
  height: 50px;
  text-align: center;
  line-height: 25px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-sizing: border-box;
  margin-bottom: 10px;
  opacity: 1;
  /* 先执行 200ms 的 stayVisible 动画，然后执行 1s 的 fadeOut 动画 */
  animation: stayVisible 0.6s ease, fadeOut 0.6s ease-out 0.4s forwards;
}
</style>
