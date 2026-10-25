<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  resultCount: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue'])
const input = ref(null)

defineExpose({ focus: () => input.value?.focus() })

function update(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="search">
    <label for="product-search">搜索商品</label>
    <input
      id="product-search"
      ref="input"
      type="search"
      :value="modelValue"
      placeholder="名称、产地或风味"
      @input="update"
    />
    <span>{{ resultCount }} 件商品</span>
    <button v-if="modelValue" type="button" @click="emit('update:modelValue', '')">清空</button>
  </div>
</template>

<style scoped>
.search { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
label { font-size: 13px; color: var(--ink-soft); }
input { flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); font: inherit; }
span { color: var(--ink-faint); font-size: 13px; }
button { border: 0; background: none; color: var(--bean); text-decoration: underline; }
</style>
