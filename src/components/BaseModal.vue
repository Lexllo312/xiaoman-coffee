<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' }
})

const emit = defineEmits(['close'])
const closeButton = ref(null)

function closeOnEscape(event) {
  if (event.key === 'Escape' && props.open) emit('close')
}

// 打开弹窗时锁住背景滚动，并把焦点交给关闭按钮；关闭后恢复。
watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) closeButton.value?.focus()
  },
  { flush: 'post' }
)

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', closeOnEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="open" class="mask" @click.self="emit('close')">
    <section class="modal" role="dialog" aria-modal="true" :aria-label="title">
      <header>
        <h2>{{ title }}</h2>
        <button ref="closeButton" type="button" aria-label="关闭" @click="emit('close')">×</button>
      </header>
      <slot />
      <footer v-if="$slots.footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>

<style scoped>
.mask { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 20px; background: rgba(32,27,22,0.4); }
.modal { width: min(540px, 100%); max-height: 90vh; overflow: auto; padding: 24px; border-radius: 18px; background: var(--paper); }
header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
h2 { font-size: 22px; }
header button { border: 0; background: none; font-size: 28px; color: var(--ink-soft); }
footer { margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px; }
</style>
