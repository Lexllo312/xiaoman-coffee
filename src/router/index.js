import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MenuView from '@/views/MenuView.vue'
import CartView from '@/views/CartView.vue'

const router = createRouter({
  // GitHub Pages 项目站点需要和 Vite 的 base 保持一致。
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/menu', name: 'menu', component: MenuView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

const titles = {
  home: '小满咖啡 · 城市里的一杯慢',
  menu: '菜单 · 小满咖啡',
  cart: '购物车 · 小满咖啡'
}
router.afterEach((to) => {
  document.title = titles[to.name] ?? '小满咖啡'
})

export default router
