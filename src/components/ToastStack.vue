<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <p v-for="toast in toasts" :key="toast.id">{{ toast.message }}</p>
  </div>
</template>

<style scoped>
.toasts { position: fixed; right: 20px; bottom: 20px; z-index: 200; display: grid; gap: 8px; }
p { padding: 12px 18px; border-radius: 999px; background: var(--ink); color: var(--paper); font-size: 13px; }
</style>
