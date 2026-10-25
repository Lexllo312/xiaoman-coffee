<script setup>
const props = defineProps({ item: { type: Object, required: true } })

const emit = defineEmits(['change', 'remove'])

function change(delta) {
  emit('change', props.item.qty + delta)
}
</script>

<template>
  <div class="line">
    <img :src="item.image" :alt="item.name" />
    <div>
      <h3>{{ item.name }}</h3>
      <p>¥{{ item.price }} / {{ item.weight }}</p>
    </div>
    <div class="quantity" aria-label="购买数量">
      <button type="button" :disabled="item.qty <= 1" aria-label="减少数量" @click="change(-1)">−</button>
      <span>{{ item.qty }}</span>
      <button type="button" :disabled="item.qty >= item.stock" aria-label="增加数量" @click="change(1)">+</button>
    </div>
    <strong>¥{{ item.price * item.qty }}</strong>
    <button class="remove" type="button" @click="emit('remove', item.id)">删除</button>
  </div>
</template>

<style scoped>
.line { display: grid; grid-template-columns: 68px 1fr auto 80px auto; align-items: center; gap: 18px; padding: 18px 0; border-bottom: 1px solid var(--line); }
.line:last-child { border-bottom: 0; }
img { width: 68px; height: 68px; border-radius: 10px; object-fit: cover; }
h3 { font-size: 17px; }
p { margin-top: 6px; color: var(--ink-faint); font-size: 12px; }
.quantity { display: flex; align-items: center; gap: 12px; }
.quantity button { width: 28px; height: 28px; border: 1px solid var(--line); border-radius: 50%; background: none; }
.quantity button:disabled { opacity: 0.3; }
strong { text-align: right; }
.remove { border: 0; background: none; color: var(--ink-faint); font-size: 12px; text-decoration: underline; }
@media (max-width: 640px) {
  .line { grid-template-columns: 60px 1fr auto; gap: 12px; }
  img { width: 60px; height: 60px; }
  strong { grid-column: 2; text-align: left; }
  .remove { grid-column: 3; grid-row: 2; }
}
</style>
