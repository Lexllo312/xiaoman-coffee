<script setup>
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <header class="header">
    <div class="shell inner">
      <RouterLink class="brand" to="/">小满咖啡<small>XIAOMAN COFFEE</small></RouterLink>
      <nav aria-label="主导航">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/menu">菜单</RouterLink>
        <RouterLink to="/cart">购物车 <span v-if="cart.count">{{ cart.count }}</span></RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header { position: sticky; top: 0; z-index: 20; border-bottom: 1px solid var(--line); background: rgba(247,243,236,0.94); }
.inner { height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.brand { font-family: var(--font-serif); font-size: 20px; }
.brand small { display: block; color: var(--ink-faint); font-family: var(--font-sans); font-size: 8px; letter-spacing: 0.2em; }
nav { display: flex; gap: 26px; font-size: 14px; }
nav a { color: var(--ink-soft); }
nav a.router-link-active { color: var(--bean); border-bottom: 1px solid var(--bean); }
nav span { padding: 1px 6px; border-radius: 999px; background: var(--bean); color: white; font-size: 11px; }
@media (max-width: 560px) { nav { gap: 14px; } .brand { font-size: 17px; } }
</style>
