<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import ProductCard from '@/components/ProductCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import { categories, products } from '@/data/products'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

const cart = useCartStore()
const { push } = useToast()
const keyword = ref('')
const category = ref('all')
const selectedProduct = ref(null)
const searchRef = ref(null)

// 商品列表由搜索词和分类计算出来，不额外复制一份列表。
const filteredProducts = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  return products.filter((product) => {
    const inCategory = category.value === 'all' || product.category === category.value
    const content = [product.name, product.origin, ...product.notes].join(' ').toLowerCase()
    return inCategory && content.includes(text)
  })
})

onMounted(() => {
  // 桌面端进入菜单时把焦点放进搜索框；移动端不主动弹软键盘。
  if (window.matchMedia('(min-width: 700px)').matches) {
    searchRef.value?.focus()
  }
})

function addToCart(product) {
  if (cart.add(product)) {
    push(`已加入购物车：${product.name}`)
  } else {
    push(`库存上限：${product.name}只剩 ${product.stock} 件`)
  }
}
</script>

<template>
  <div class="shell page">
    <header>
      <p class="eyebrow">MENU / 全部商品</p>
      <h1>挑一支今天想喝的</h1>
      <p>单一产地与拼配咖啡豆，共 6 款，图片与商品信息一一对应。</p>
    </header>

    <div class="toolbar">
      <SearchBar ref="searchRef" v-model="keyword" :result-count="filteredProducts.length" />
      <div class="categories" aria-label="商品分类">
        <button
          v-for="item in categories"
          :key="item.id"
          type="button"
          :class="{ active: category === item.id }"
          :aria-pressed="category === item.id"
          @click="category = item.id"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div v-if="filteredProducts.length" class="grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @detail="selectedProduct = $event"
        @add="addToCart"
      />
    </div>
    <div v-else class="empty">
      <h2>没有找到匹配的咖啡</h2>
      <p>换个关键词，或者看看全部分类。</p>
      <button type="button" @click="keyword = ''; category = 'all'">清空筛选</button>
    </div>

    <BaseModal :open="!!selectedProduct" :title="selectedProduct?.name" @close="selectedProduct = null">
      <template v-if="selectedProduct">
        <img class="detail-image" :src="selectedProduct.image" :alt="selectedProduct.name" />
        <p class="story">{{ selectedProduct.story }}</p>
        <div class="detail-info">
          <span>{{ selectedProduct.origin }}</span>
          <span>{{ selectedProduct.process }}</span>
          <strong>¥{{ selectedProduct.price }} / {{ selectedProduct.weight }}</strong>
        </div>
      </template>
      <template #footer>
        <button class="add" type="button" @click="addToCart(selectedProduct)">加入购物车</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.page { padding-top: 48px; }
h1 { margin: 12px 0; font-size: clamp(32px, 4vw, 48px); }
header > p:last-child { color: var(--ink-soft); }
.toolbar { margin: 32px 0; padding: 22px 0; border-block: 1px solid var(--line); }
.categories { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.categories button { padding: 7px 15px; border: 1px solid var(--line); border-radius: 999px; background: transparent; }
.categories button.active { border-color: var(--ink); background: var(--ink); color: var(--paper); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.empty { padding: 64px 20px; border: 1px dashed var(--line); border-radius: 16px; text-align: center; }
.empty p { margin: 12px 0 20px; color: var(--ink-soft); }
.empty button, .add { padding: 10px 20px; border: 0; border-radius: 999px; background: var(--bean); color: white; }
.detail-image { width: 100%; height: 250px; margin-top: 20px; border-radius: 12px; object-fit: cover; }
.story { margin: 18px 0; color: var(--ink-soft); line-height: 1.8; }
.detail-info { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-size: 13px; }
.detail-info strong { margin-left: auto; font-size: 20px; }
@media (max-width: 1000px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
