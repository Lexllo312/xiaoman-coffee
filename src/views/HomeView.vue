<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import ProductCard from '@/components/ProductCard.vue'
import { products } from '@/data/products'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

const cart = useCartStore()
const { push } = useToast()
const featured = products.filter((product) => product.featured)
const dose = ref(15)
const water = computed(() => dose.value * 15)

function addToCart(product) {
  if (cart.add(product)) {
    push(`已加入购物车：${product.name}`)
  } else {
    push(`库存上限：${product.name}只剩 ${product.stock} 件`)
  }
}
</script>

<template>
  <section class="hero shell">
    <div class="intro">
      <p class="eyebrow">SINCE 2019 · XIAOMAN COFFEE</p>
      <h1>城市里的一杯慢</h1>
      <p class="lead">我们挑选产地清楚的咖啡豆，每周三小批量烘焙，把一杯好咖啡做得简单一些。</p>
      <div class="actions">
        <BaseButton to="/menu">去选咖啡</BaseButton>
        <a class="text-link" href="#brew">看看冲煮方法</a>
      </div>
    </div>
    <img src="/images/baoshan-typica.jpg" alt="新鲜烘焙的咖啡豆" />
  </section>

  <section class="shell section">
    <div class="section-title">
      <div><p class="eyebrow">01 / THIS WEEK</p><h2>本周推荐</h2></div>
      <BaseButton to="/menu" variant="ghost">查看全部</BaseButton>
    </div>
    <div class="grid">
      <ProductCard
        v-for="product in featured"
        :key="product.id"
        :product="product"
        @detail="$router.push('/menu')"
        @add="addToCart"
      />
    </div>
  </section>

  <section id="brew" class="brew shell section">
    <div><p class="eyebrow">02 / BREW</p><h2>一杯手冲，从比例开始</h2></div>
    <div class="brew-card">
      <label for="dose">咖啡粉量：<strong>{{ dose }}g</strong></label>
      <input id="dose" v-model.number="dose" type="range" min="10" max="30" />
      <p>按 1:15 的粉水比，需要 <strong>{{ water }}ml</strong> 水。</p>
      <small>92℃ 水温，先注入粉量两倍的水闷蒸 30 秒，再分两次注完。</small>
    </div>
  </section>
</template>

<style scoped>
.hero { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 56px; padding-top: 64px; }
h1 { margin: 18px 0; font-size: clamp(42px, 6vw, 72px); }
.lead { max-width: 38ch; color: var(--ink-soft); line-height: 1.9; }
.hero > img { width: 100%; height: 440px; object-fit: cover; border-radius: 20px; }
.actions { display: flex; align-items: center; gap: 22px; margin-top: 28px; }
.text-link { color: var(--bean); font-size: 14px; }
.section { margin-top: 80px; }
.section-title { display: flex; align-items: end; justify-content: space-between; margin-bottom: 26px; }
h2 { margin-top: 8px; font-size: 32px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.brew { display: grid; grid-template-columns: 1fr 1.2fr; align-items: center; gap: 56px; }
.brew-card { padding: 28px; border-radius: 16px; background: var(--paper-deep); }
.brew-card label { display: block; }
input { width: 100%; margin: 20px 0; accent-color: var(--bean); }
.brew-card p { font-size: 18px; }
.brew-card small { display: block; margin-top: 14px; color: var(--ink-soft); line-height: 1.8; }
@media (max-width: 800px) {
  .hero, .brew { grid-template-columns: 1fr; gap: 30px; }
  .hero > img { height: 300px; }
  .grid { grid-template-columns: 1fr; }
}
</style>
