<script setup>
import { useCartStore, FREE_SHIPPING } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <aside class="summary">
    <h2>订单摘要</h2>
    <p><span>商品小计（{{ cart.count }} 件）</span><strong>¥{{ cart.subtotal }}</strong></p>
    <p><span>运费</span><strong>{{ cart.shipping ? `¥${cart.shipping}` : '免运费' }}</strong></p>
    <p class="total"><span>合计</span><strong>¥{{ cart.total }}</strong></p>
    <p v-if="cart.subtotal < FREE_SHIPPING" class="tip">满 ¥{{ FREE_SHIPPING }} 免运费，还差 ¥{{ FREE_SHIPPING - cart.subtotal }}</p>
    <p v-else class="tip">已满足包邮条件</p>
    <slot />
  </aside>
</template>

<style scoped>
.summary { padding: 24px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); }
h2 { margin-bottom: 20px; font-size: 20px; }
p { display: flex; justify-content: space-between; gap: 12px; margin: 12px 0; color: var(--ink-soft); font-size: 14px; }
.total { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line); font-size: 18px; }
.total strong { font-family: var(--font-serif); font-size: 26px; color: var(--ink); }
.tip { display: block; color: var(--bean); font-size: 12px; }
</style>
