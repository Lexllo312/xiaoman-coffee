import { readonly, ref } from 'vue'

const messages = ref([])
let nextId = 0

export function useToast() {
  function push(message) {
    const id = ++nextId
    messages.value.push({ id, message })
    setTimeout(() => {
      messages.value = messages.value.filter((item) => item.id !== id)
    }, 2200)
  }

  return { toasts: readonly(messages), push }
}
