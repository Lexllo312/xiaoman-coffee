import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { findProduct } from '@/data/products'

const STORAGE_KEY = 'xiaoman-cart-v1'
export const FREE_SHIPPING = 199
export const SHIPPING_FEE = 12

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(saved)) return []

    return saved
      .filter((line) => line && typeof line.id === 'string' && Number(line.qty) > 0)
      .map((line) => {
        const product = findProduct(line.id)
        if (!product) return null
        return { id: line.id, qty: Math.min(Math.floor(Number(line.qty)), product.stock) }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  // 购物车只保存商品 id 和数量，名称与价格始终从商品表读取。
  const lines = ref(restore())

  const items = computed(() => lines.value.map((line) => ({
    ...findProduct(line.id),
    qty: line.qty
  })))

  const count = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.qty, 0))
  const shipping = computed(() => subtotal.value === 0 || subtotal.value >= FREE_SHIPPING ? 0 : SHIPPING_FEE)
  const total = computed(() => subtotal.value + shipping.value)

  /** 返回是否真的加入成功，库存已满时调用者可以给出准确提示。 */
  function add(product) {
    const line = lines.value.find((item) => item.id === product.id)
    const current = line ? line.qty : 0
    if (current >= product.stock) return false

    if (line) line.qty += 1
    else lines.value.push({ id: product.id, qty: 1 })
    return true
  }

  function setQty(id, qty) {
    const line = lines.value.find((item) => item.id === id)
    if (!line) return
    const product = findProduct(id)
    line.qty = Math.max(1, Math.min(Math.floor(Number(qty)) || 1, product.stock))
  }

  function remove(id) {
    lines.value = lines.value.filter((item) => item.id !== id)
  }

  function clear() {
    lines.value = []
  }

  // watch 负责“数据变化后的副作用”：保存到浏览器，而不是计算金额。
  watch(lines, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // 浏览器禁用存储时不影响当前页面继续使用购物车
    }
  }, { deep: true })

  return { lines, items, count, subtotal, shipping, total, add, setQty, remove, clear }
})
