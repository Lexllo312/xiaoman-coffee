<script setup>
// 商品图的裁切比例与懒加载规则集中在这里，ProductCard 只负责卡片结构。
const props = defineProps({ product: { type: Object, required: true } })

// public 资源路径要跟着 Vite 的 base 走，静态托管到子路径时才能找到图片。
function imageUrl(path) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
</script>

<template>
  <img class="photo" :src="imageUrl(props.product.image)" :alt="props.product.name" loading="lazy" />
</template>

<style scoped>
.photo { display: block; width: 100%; height: 100%; object-fit: cover; }
</style>
