<script setup>
// 子组件用 modelValue 接收值，输入后通知父组件更新，这就是组件 v-model。
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="field">
    <span>{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :aria-label="label"
      :aria-invalid="!!error"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <small v-if="error" class="error">{{ error }}</small>
  </label>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 7px; font-size: 14px; }
.field > span { color: var(--ink-soft); }
input { padding: 11px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); font: inherit; }
input:focus { border-color: var(--bean); outline: 3px solid rgba(111,74,47,0.1); }
input[aria-invalid='true'] { border-color: var(--danger); }
.error { color: var(--danger); font-size: 12px; }
</style>
