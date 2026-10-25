# 模块清单

组件清单的唯一真相源；其他文档引用本表，不复制。

## 入口与基础设施

| 文件 | 职责 |
| --- | --- |
| `index.html` | 页面挂载点 |
| `src/main.js` | `createApp` + Pinia + Router + 挂载 `#app` |
| `src/App.vue` | 页头、路由出口、页脚、全局提示 |
| `src/router/index.js` | 3 条页面路由 + 未知路由重定向 |
| `src/stores/cart.js` | 购物车增删改、金额 computed、localStorage 持久化；`restore()` 逐条校验脏数据，`add()` 返回是否加入成功，导出 `FREE_SHIPPING`/`SHIPPING_FEE` |
| `src/composables/useToast.js` | 模块级单例提示队列 |
| `src/data/products.js` | 6 件商品、3 个分类、`findProduct` |
| `src/assets/styles/main.css` | 颜色、字体、基础样式与 `.shell` 容器 |

## 页面（3）

| 文件 | 主要依赖 |
| --- | --- |
| `views/HomeView.vue` | ProductCard、BaseButton |
| `views/MenuView.vue` | SearchBar、ProductCard、BaseModal |
| `views/CartView.vue` | CartLine、OrderSummary、BaseInput、BaseModal、BaseButton |

## 组件（11）

| 文件 | 对外接口 | 知识点 |
| --- | --- | --- |
| `AppHeader.vue` | 读 cart store | 组件、RouterLink、条件渲染 |
| `AppFooter.vue` | 无 | 组件 |
| `BaseButton.vue` | props: to（必填）/ variant；slot 默认；只渲染 `RouterLink` | props、slot、`:to` |
| `BaseInput.vue` | `v-model`；props: label / type / error | 自定义 v-model、props、emits |
| `BaseModal.vue` | props: open / title；slot 默认 + `footer`；emit close；ESC 关闭、焦点进关闭按钮、锁背景滚动 | 条件渲染、具名插槽、生命周期 |
| `CartLine.vue` | props: item；emit: change / remove | props、emits、class 绑定 |
| `OrderSummary.vue` | 读 cart store；slot 默认 | 计算属性、插槽 |
| `ProductImage.vue` | props: product | Attribute 绑定 `:src` / `:alt` |
| `ProductCard.vue` | props: product；emit: detail / add | props、emits、v-if、事件 |
| `SearchBar.vue` | `v-model`、resultCount；`defineExpose({ focus })` | 表单绑定、emits、模板引用 |
| `ToastStack.vue` | 读 useToast | `v-for`、列表渲染 |

## 统计

- `.vue`：**15**（1 App + 3 页面 + 11 组件）
- 商品：6 件，图片 6 张，全部位于 `public/images/`
- 路由：3 条页面路由 + 1 条重定向
