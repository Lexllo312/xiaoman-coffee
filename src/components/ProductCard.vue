<script setup>
import ProductImage from './ProductImage.vue'

// props 是父组件传给子组件的数据；emit 是子组件向父组件发出的通知。
defineProps({ product: { type: Object, required: true } })
const emit = defineEmits(['detail', 'add'])
</script>

<template>
  <article class="card">
    <button class="photo" type="button" :aria-label="`查看${product.name}`" @click="emit('detail', product)">
      <ProductImage :product="product" />
      <span v-if="product.featured" class="badge">本周推荐</span>
    </button>
    <div class="content">
      <p class="origin">{{ product.origin }} · {{ product.roast || product.process }}</p>
      <h3>{{ product.name }}</h3>
      <div class="notes">
        <span v-for="note in product.notes" :key="note">{{ note }}</span>
      </div>
      <p class="bottom">
        <strong>¥{{ product.price }}<small> / {{ product.weight }}</small></strong>
        <button type="button" @click="emit('add', product)">加入购物车</button>
      </p>
    </div>
  </article>
</template>

<style scoped>
.card { overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: var(--card); }
.photo { position: relative; display: block; width: 100%; height: 240px; padding: 0; border: 0; overflow: hidden; }
.photo :deep(img) { transition: transform 0.3s; }
.photo:hover :deep(img) { transform: scale(1.04); }
.badge { position: absolute; top: 12px; left: 12px; padding: 5px 10px; border-radius: 999px; background: var(--paper); color: var(--bean); font-size: 12px; }
.content { padding: 18px; }
.origin { color: var(--ink-faint); font-size: 12px; }
h3 { margin: 7px 0 12px; font-size: 20px; }
.notes { display: flex; flex-wrap: wrap; gap: 6px; }
.notes span { padding: 3px 9px; border-radius: 999px; background: rgba(125,139,106,0.12); color: #52613f; font-size: 12px; }
.bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--line); }
strong { font-family: var(--font-serif); font-size: 22px; }
small { color: var(--ink-faint); font-family: var(--font-sans); font-size: 11px; font-weight: 400; }
.bottom button { padding: 8px 13px; border: 1px solid var(--bean); border-radius: 999px; background: transparent; color: var(--bean); font-size: 12px; }
.bottom button:hover { background: var(--bean); color: white; }
</style>
