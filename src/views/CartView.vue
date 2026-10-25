<script setup>
import { ref, watch } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseModal from '@/components/BaseModal.vue'
import CartLine from '@/components/CartLine.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

const cart = useCartStore()
const { push } = useToast()
const form = ref({ name: '', phone: '', address: '' })
const errors = ref({})
const success = ref(false)

// 用户开始修改表单后隐藏上一次提交留下的错误提示。
watch(form, () => { errors.value = {} }, { deep: true })

function submitOrder() {
  const result = {}
  if (form.value.name.trim().length < 2) result.name = '请填写至少两个字的收货人'
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) result.phone = '请填写有效的 11 位手机号'
  if (form.value.address.trim().length < 6) result.address = '请填写详细收货地址'
  errors.value = result

  if (Object.keys(result).length) {
    push('请先补全收货信息')
    return
  }

  success.value = true
  cart.clear()
}
</script>

<template>
  <div class="shell page">
    <p class="eyebrow">CART / 购物车</p>
    <h1>你的袋子 <span v-if="cart.count">· {{ cart.count }} 件</span></h1>

    <div v-if="cart.items.length" class="layout">
      <section class="main">
        <div class="lines">
          <CartLine
            v-for="item in cart.items"
            :key="item.id"
            :item="item"
            @change="cart.setQty(item.id, $event)"
            @remove="cart.remove"
          />
        </div>

        <form class="form" @submit.prevent="submitOrder">
          <h2>收货信息</h2>
          <div class="two-columns">
            <BaseInput v-model="form.name" label="收货人" :error="errors.name" />
            <BaseInput v-model="form.phone" label="手机号" type="tel" :error="errors.phone" />
          </div>
          <BaseInput v-model="form.address" label="收货地址" :error="errors.address" />
          <button class="submit" type="submit">提交订单 · ¥{{ cart.total }}</button>
        </form>
      </section>
      <OrderSummary>
        <BaseButton to="/menu" variant="ghost">继续挑选</BaseButton>
      </OrderSummary>
    </div>

    <div v-else class="empty">
      <h2>购物车还是空的</h2>
      <p>去菜单挑一支喜欢的咖啡吧。</p>
      <BaseButton to="/menu">去逛菜单</BaseButton>
    </div>

    <BaseModal :open="success" title="下单成功" @close="success = false">
      <p class="success">这是一笔前端演示订单，没有产生真实支付。感谢你的喜欢！</p>
      <template #footer>
        <BaseButton to="/menu">再逛逛</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.page { padding-top: 48px; }
h1 { margin: 12px 0 34px; font-size: 42px; }
h1 span { color: var(--ink-faint); font-size: 18px; }
.layout { display: grid; grid-template-columns: 1.5fr 0.8fr; align-items: start; gap: 40px; }
.lines { padding: 0 24px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); }
.form { display: grid; gap: 20px; margin-top: 30px; padding: 26px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); }
.form h2 { font-size: 22px; }
.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.submit { padding: 13px; border: 0; border-radius: 999px; background: var(--bean); color: white; font-size: 15px; }
.empty { padding: 60px 20px; border: 1px dashed var(--line); border-radius: 16px; text-align: center; }
.empty p { margin: 14px 0 24px; color: var(--ink-soft); }
.success { margin-top: 18px; color: var(--ink-soft); line-height: 1.8; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .two-columns { grid-template-columns: 1fr; } }
</style>
