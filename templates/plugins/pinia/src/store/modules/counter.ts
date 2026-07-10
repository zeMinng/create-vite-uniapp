import { ref } from 'vue'
import { defineStore } from 'pinia'

export const userInfoStore = defineStore(
  'user',
  () => {
    const a = ref(6)

    return {
      a,
    }
  },
  {
    persist: true,
  },
)